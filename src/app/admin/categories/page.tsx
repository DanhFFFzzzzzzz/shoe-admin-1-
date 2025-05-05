import { getCategoriesWithProducts } from '@/actions/categories';
import CategoriesPageComponent from '@/app/admin/categories/page-component';

export default async function Categories() {
  const categories = await getCategoriesWithProducts();
  console.log('Categories data in page.tsx:', categories);
  return <CategoriesPageComponent categories={categories} />;
}
