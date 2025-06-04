'use server';

import { createClient } from '@/supabase/server';
import { revalidatePath } from 'next/cache';
import { Tables } from '@/supabase.types';
//import { sendNotification } from './notifications';

type Order = Tables<'order'>;
type OrderItem = Tables<'order_item'>;
type Product = Tables<'product'>;

export async function getOrders() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('order')
    .select(`
      *,
      order_item (
        *,
        product (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return orders as unknown as (Order & {
    order_items: (OrderItem & {
      product: Product;
    })[];
  })[];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('order')
    .update({ status })
    .eq('id', parseInt(orderId));

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user.id!;

  //await sendNotification(userId, status + ' 🚀');

  revalidatePath('/admin/orders');
}

export async function getMonthlyOrders() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('order')
    .select('created_at')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Đếm số đơn hàng theo tháng
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const ordersByMonth: Record<string, number> = {};
  for (const order of orders) {
      const date = new Date(order.created_at);
    const month = monthNames[date.getUTCMonth()];
    if (!ordersByMonth[month]) ordersByMonth[month] = 0;
    ordersByMonth[month]++;
  }
  // Trả về mảng đúng định dạng cho BarChart
  return Object.keys(ordersByMonth).map(month => ({
    name: month,
    orders: ordersByMonth[month],
  }));
}