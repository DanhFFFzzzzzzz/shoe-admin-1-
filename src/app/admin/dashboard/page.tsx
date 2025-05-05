import { getMonthlyOrders } from '@/actions/order';
import { getCategoryData } from '@/actions/categories';
import { getLatestUsers } from '@/actions/auth';
import PageComponent from './page-component';

export default async function AdminDashboard() {
  const monthlyOrders = await getMonthlyOrders();
  const categoryData = await getCategoryData();
  const latestUsers = await getLatestUsers();

  return (
    <PageComponent
      monthlyOrders={monthlyOrders}
      categoryData={categoryData}
      latestUsers={latestUsers}
    />
  );
}