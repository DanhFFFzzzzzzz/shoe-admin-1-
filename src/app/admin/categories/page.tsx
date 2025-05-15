import { getCategories } from '@/server/actions/categories';
import PageComponent from './page-component';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <PageComponent categories={categories} />;
}
