import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const supabase = createClient();

  // Lấy tất cả order_item của đơn hàng đã hoàn thành, kèm thông tin sản phẩm
  const { data: orderItems, error } = await supabase
    .from('order_item')
    .select('quantity, product:product(id, title, category, price), order:order(id, status)')
    .eq('order.status', 'Completed');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Thống kê doanh thu theo loại sản phẩm
  const categoryRevenue: Record<string, { total: number, quantity: number }> = {};

  for (const item of orderItems || []) {
    const category = item.product?.category ?? 'Unknown';
    const price = item.product?.price ?? 0;
    const qty = item.quantity ?? 0;
    if (!categoryRevenue[category]) categoryRevenue[category] = { total: 0, quantity: 0 };
    categoryRevenue[category].total += price * qty;
    categoryRevenue[category].quantity += qty;
  }

  return NextResponse.json({ categoryRevenue });
} 