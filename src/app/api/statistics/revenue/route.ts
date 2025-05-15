import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const supabase = createClient();

  // Lấy tất cả đơn hàng đã hoàn thành
  const { data: orders, error } = await supabase
    .from('order')
    .select('id, totalPrice, created_at')
    .eq('status', 'Completed');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Thống kê theo tháng, quý, năm
  const byMonth: Record<string, number> = {};
  const byQuarter: Record<string, number> = {};
  const byYear: Record<string, number> = {};

  for (const order of orders || []) {
    const date = new Date(order.created_at);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
    const year = `${date.getFullYear()}`;

    byMonth[month] = (byMonth[month] || 0) + order.totalPrice;
    byQuarter[quarter] = (byQuarter[quarter] || 0) + order.totalPrice;
    byYear[year] = (byYear[year] || 0) + order.totalPrice;
  }

  return NextResponse.json({ byMonth, byQuarter, byYear });
} 