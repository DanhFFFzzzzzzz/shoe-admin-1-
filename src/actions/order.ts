'use server';

import { createClient } from '@/supabase/server';
import { revalidatePath } from 'next/cache';
// Lấy danh sách đơn hàng từ Supabase
export const getOrders = async () => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('order')
    .select('*, order_item(*, product(*))');

  if (error) {
    throw error;
  }

  return data;
};
// Câp nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: number, status: string) => {
  const supabase = createClient();

  const { error } = await supabase
    .from('order')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    throw error;
  }

  revalidatePath('/admin/orders');
};
// Lấy số lượng đơn hàng theo tháng
export const getMonthlyOrders = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from('order').select('created_at');

  if (error) throw new Error(error.message);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const ordersByMonth = data.reduce(
    (acc: Record<string, number>, order: { created_at: string }) => {
      const date = new Date(order.created_at);
      const month = monthNames[date.getUTCMonth()]; // Get the month name

      // Increment the count for this month
      if (!acc[month]) acc[month] = 0;
      acc[month]++;

      return acc;
    },
    {}
  );

  return Object.keys(ordersByMonth).map(month => ({
    name: month,
    orders: ordersByMonth[month],
  }));
}; 