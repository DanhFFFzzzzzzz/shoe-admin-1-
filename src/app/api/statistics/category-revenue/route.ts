import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const supabase = await createClient();

  // Lấy tất cả order_item của đơn hàng không bị hủy, kèm thông tin sản phẩm
  const { data: orderItems, error } = await supabase
    .from('order_item')
    .select('quantity, product:product(id, title, category, price), order:order(id, status)')
    .not('order.status', 'eq', 'cancelled')
    .not('order.status', 'eq', 'Cancelled');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Thống kê doanh thu theo tên sản phẩm
  const productRevenue: Record<string, { total: number, quantity: number }> = {};

  for (const item of orderItems || []) {
    const productName = item.product?.title ?? 'Unknown';
    const price = item.product?.price ?? 0;
    const qty = item.quantity ?? 0;
    if (!productRevenue[productName]) productRevenue[productName] = { total: 0, quantity: 0 };
    productRevenue[productName].total += price * qty;
    productRevenue[productName].quantity += qty;
  }

  return NextResponse.json({ productRevenue });
} 