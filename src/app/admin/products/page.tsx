import { getProductsWithCategories } from '@/server/actions/products';
import { getCategories } from '@/server/actions/categories';
import PageComponent from './page-component';

export default async function ProductsPage() {
  const productsWithCategories = await getProductsWithCategories();
  const categories = await getCategories();

  return <PageComponent productsWithCategories={productsWithCategories} categories={categories} />;
}