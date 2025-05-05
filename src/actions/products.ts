'use server';

import slugify from 'slugify';

import { createClient } from '@/supabase/server';
import {
    ProductsWithCategoriesResponse,
    UpdateProductSchema,
} from '@/app/admin/products/products.types';
import { CreateProductSchemaServer } from '@/app/admin/products/schema';
import { revalidatePath } from 'next/cache';

export const getProductsWithCategories =
  async (): Promise<ProductsWithCategoriesResponse> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('product')
      .select('*, category:category(*)')
      .returns<any[]>();

    if (error) {
      throw new Error(`
        Error fetching products with categories: ${error.message}`);
    }

    // Map lại các trường cho đúng typescript types
    const mappedData = (data || []).map(product => ({
      ...product,
      description: product.description,
      sizes: product.availableSizes ? JSON.parse(product.availableSizes) : [],
      imagesUrl: Array.isArray(product.imagesUrl) ? product.imagesUrl : (product.imagesUrl ? JSON.parse(product.imagesUrl) : []),
    }));

    return mappedData;
  };

export const createProduct = async ({
  category,
  heroImage,
  images,
  maxQuantity,
  price,
  title,
  description,
  sizes,
}: any) => {
  const supabase = createClient();
  const slug = slugify(title, { lower: true });

  const { data, error } = await (supabase.from('product').insert([
    {
      category,
      heroImage,
      imagesUrl: images,
      maxQuantity,
      price,
      slug,
      title,
      description: description,
      availableSizes: JSON.stringify(sizes),
    }
  ]) as any);

  if (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }

  revalidatePath('/admin/products');

  return data;
};

export const updateProduct = async ({
  category,
  heroImage,
  imagesUrl,
  maxQuantity,
  price,
  slug,
  title,
  description,
  sizes,
}: any) => {
  const supabase = createClient();
  const { data, error } = await (supabase
    .from('product')
    .update({
      category,
      heroImage,
      imagesUrl: imagesUrl,
      maxQuantity,
      price,
      title,
      description: description,
      availableSizes: JSON.stringify(sizes),
    })
    .match({ slug }) as any);

  if (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }

  revalidatePath('/admin/products');

  return data;
};

export const deleteProduct = async (slug: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('product').delete().match({ slug });

  if (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }

  revalidatePath('/admin/products');
};

/**
 * Giảm số lượng của một size cụ thể cho sản phẩm khi có đơn hàng
 * @param productId - ID sản phẩm
 * @param size - Size cần giảm
 * @param quantity - Số lượng cần giảm
 */
export const decreaseProductSizeQuantity = async ({
  productId,
  size,
  quantity
}: { productId: number, size: number, quantity: number }) => {
  const supabase = createClient();
  // 1. Lấy thông tin availableSizes hiện tại của sản phẩm
  const { data: products, error: getError } = await supabase
    .from('product')
    .select('availableSizes')
    .eq('id', productId);

  if (getError || !products || products.length === 0) {
    throw new Error('Product not found');
  }

  // 2. Parse availableSizes từ JSON string sang mảng object
  let sizes = products[0].availableSizes ? JSON.parse(products[0].availableSizes) : [];
  // 3. Tìm size cần giảm và trừ quantity, không cho âm
  sizes = sizes.map((sz: { size: number, quantity: number }) =>
    sz.size === size
      ? { ...sz, quantity: Math.max(0, sz.quantity - quantity) }
      : sz
  );

  // 4. Update lại availableSizes trong DB
  const { error: updateError } = await supabase
    .from('product')
    .update({ availableSizes: JSON.stringify(sizes) })
    .eq('id', productId);

  if (updateError) {
    throw new Error(updateError.message);
  }
};