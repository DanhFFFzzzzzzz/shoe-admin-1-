import { getMonthlyOrders } from '@/server/actions/order';
import { getCategoryData } from '@/server/actions/categories';
import { getLatestUsers } from '@/server/actions/auth';
import PageComponent from './page-component';

export default async function AdminDashboard() {
  const [monthlyOrders, categoryData, latestUsers] = await Promise.all([
    getMonthlyOrders(),
    getCategoryData(),
    getLatestUsers(),
  ]);

  return (
    <PageComponent
      monthlyOrders={monthlyOrders}
      categoryData={categoryData}
      latestUsers={latestUsers}
    />
  );
}