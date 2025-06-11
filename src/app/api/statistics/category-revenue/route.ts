import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const supabase = await createClient();

  // Lấy tất cả order_item của đơn hàng không bị hủy, kèm thông tin sản phẩm và danh mục
  const { data: orderItems, error } = await supabase
    .from('order_item')
    .select('quantity, product:product(id, title, category(id, name), price), order:order_id(id, status)');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log dữ liệu trả về từ Supabase
  console.log('orderItems:', JSON.stringify(orderItems, null, 2));

  // Hàm loại bỏ dấu tiếng Việt
  function removeVietnameseTones(str: string) {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }

  // Lọc triệt để các đơn bị hủy
  const filteredOrderItems = (orderItems || []).filter(item => {
    const status = (item.order?.status || '').toLowerCase();
    const statusNoTone = removeVietnameseTones(status);
    return !(
      status.includes('cancel') ||
      status.includes('hủy') ||
      statusNoTone.includes('da huy') ||
      statusNoTone.includes('da huy') ||
      statusNoTone.includes('huy')
    );
  });

  // Group theo danh mục
  const categoryRevenue: Record<string, { categoryId: number, products: { name: string, total: number, quantity: number }[] }> = {};

  for (const item of filteredOrderItems) {
    const categoryName = item.product?.category?.name ?? 'Unknown';
    const categoryId = item.product?.category?.id ?? 0;
    const productName = item.product?.title ?? 'Unknown';
    const price = item.product?.price ?? 0;
    const qty = item.quantity ?? 0;
    if (!categoryRevenue[categoryName]) {
      categoryRevenue[categoryName] = { categoryId, products: [] };
    }
    let product = categoryRevenue[categoryName].products.find(p => p.name === productName);
    if (!product) {
      product = { name: productName, total: 0, quantity: 0 };
      categoryRevenue[categoryName].products.push(product);
    }
    product.total += price * qty;
    product.quantity += qty;
  }

  // Log dữ liệu group để debug
  console.log('categoryRevenue:', JSON.stringify(categoryRevenue, null, 2));

  return NextResponse.json({ categoryRevenue });
} 