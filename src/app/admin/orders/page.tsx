import { getOrders } from '@/server/actions/order';
import PageComponent from './page-component';

export default async function OrdersPage() {
  const orders = await getOrders();

  return <PageComponent orders={orders} />;
}