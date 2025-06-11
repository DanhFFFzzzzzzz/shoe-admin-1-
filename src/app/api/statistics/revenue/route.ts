import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const supabase = await createClient();

  // Lấy tất cả đơn hàng
  const { data: allOrders, error } = await supabase
    .from('order')
    .select('id, totalPrice, created_at, status');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Lấy order_item của các đơn không bị hủy
  const validOrderIds = (allOrders || [])
    .filter(order => order.status !== 'cancelled' && order.status !== 'Cancelled')
    .map(order => order.id);

  let orderItems: { order_id: number; quantity: number }[] = [];
  if (validOrderIds.length > 0) {
    const { data: items, error: orderItemError } = await supabase
      .from('order_item')
      .select('order_id, quantity');
    if (orderItemError) {
      return NextResponse.json({ error: orderItemError.message }, { status: 500 });
    }
    orderItems = (items || []).filter(item => validOrderIds.includes(item.order_id));
  }

  // Map orderId -> created_at
  const orderIdToDate: Record<number, string> = {};
  for (const order of allOrders || []) {
    orderIdToDate[order.id] = order.created_at;
  }

  // Thống kê theo tháng, quý, năm (chỉ tính đơn không bị hủy)
  const byMonth: Record<string, number> = {};
  const byQuarter: Record<string, number> = {};
  const byYear: Record<string, number> = {};
  const quantityByMonth: Record<string, number> = {};
  const quantityByQuarter: Record<string, number> = {};
  const quantityByYear: Record<string, number> = {};
  const ordersByStatus: Record<string, number> = {};

  for (const order of allOrders || []) {
    // Đếm số lượng đơn theo trạng thái (bao gồm cả đơn bị hủy)
    const status = order.status || 'Unknown';
    ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;

    // Chỉ cộng doanh thu nếu đơn không bị hủy
    if (status !== 'cancelled' && status !== 'Cancelled') {
      const date = new Date(order.created_at);
      const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
      const year = `${date.getFullYear()}`;

      byMonth[month] = (byMonth[month] || 0) + order.totalPrice;
      byQuarter[quarter] = (byQuarter[quarter] || 0) + order.totalPrice;
      byYear[year] = (byYear[year] || 0) + order.totalPrice;
    }
  }

  // Tính tổng quantity theo tháng/quý/năm
  for (const item of orderItems) {
    const orderDate = orderIdToDate[item.order_id];
    if (!orderDate) continue;
    const date = new Date(orderDate);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const quarter = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
    const year = `${date.getFullYear()}`;
    quantityByMonth[month] = (quantityByMonth[month] || 0) + item.quantity;
    quantityByQuarter[quarter] = (quantityByQuarter[quarter] || 0) + item.quantity;
    quantityByYear[year] = (quantityByYear[year] || 0) + item.quantity;
  }

  return NextResponse.json({ byMonth, byQuarter, byYear, ordersByStatus, quantityByMonth, quantityByQuarter, quantityByYear });
} 