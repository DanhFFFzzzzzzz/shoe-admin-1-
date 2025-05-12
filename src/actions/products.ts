'use server';

import slugify from 'slugify';

import { createClient } from '@/supabase/server';
import {
    ProductsWithCategoriesResponse,
    UpdateProductSchema,
} from '@/app/admin/products/products.types';
import { CreateProductSchemaServer } from '@/app/admin/products/schema';
import { revalidatePath } from 'next/cache';

type ProductSizeRow = { id: number; created_at: string; size: number; quantity: number; product: number };

export const getProductsWithCategories = async () => {
  const supabase = createClient();
  // Lấy sản phẩm
  const { data: products, error } = await supabase
    .from('product')
    .select('*, category:category(*)');

  if (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }

  // Lấy size cho từng sản phẩm
  let sizesMap: Record<number, { size: number; quantity: number }[]> = {};
  if (products && products.length > 0) {
    const productIds = products.map(p => p.id);
    // Query product_size cho tất cả productId
    const { data: sizesData, error: sizeError } = await supabase
      .from('product_size')
      .select('*')
      .in('product', productIds);
    if (sizeError) throw new Error(sizeError.message);
    if (sizesData) {
      const sizes = sizesData as ProductSizeRow[];
      for (const sz of sizes) {
        if (!sizesMap[sz.product]) sizesMap[sz.product] = [];
        sizesMap[sz.product].push({ size: sz.size, quantity: sz.quantity });
      }
    }
  }

  // Map lại các trường cho đúng typescript types
  const mappedData = (products || []).map(product => ({
    ...product,
    sizes: sizesMap[product.id] || [],
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

  // 1. Insert product
  const { data: productData, error: productError } = await supabase
    .from('product')
    .insert([
      {
        category,
        heroImage,
        imagesUrl: images,
        maxQuantity,
        price,
        slug,
        title,
        description,
      },
    ])
    .select('id')
    .single();

  if (productError) {
    throw new Error(`Error creating product: ${productError.message}`);
  }

  // 2. Insert sizes
  const productId = productData.id;
  const sizeRows = sizes.map((sz: { size: number; quantity: number }) => ({
    product: productId,
    size: sz.size,
    quantity: sz.quantity,
  }));

  const { error: sizeError } = await supabase
    .from('product_size')
    .insert(sizeRows);

  if (sizeError) {
    throw new Error(`Error creating product sizes: ${sizeError.message}`);
  }

  revalidatePath('/admin/products');
  return productData;
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
  // 1. Update product
  const { data, error } = await supabase
    .from('product')
    .update({
      category,
      heroImage,
      imagesUrl: imagesUrl,
      maxQuantity,
      price,
      title,
      description,
    })
    .match({ slug })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }

  // 2. Update sizes: Xóa size cũ, thêm size mới
  const productId = data.id;
  await supabase.from('product_size').delete().eq('product', productId);
  const sizeRows = sizes.map((sz: { size: number; quantity: number }) => ({
    product: productId,
    size: sz.size,
    quantity: sz.quantity,
  }));
  const { error: sizeError } = await supabase
    .from('product_size')
    .insert(sizeRows);
  if (sizeError) {
    throw new Error(`Error updating product sizes: ${sizeError.message}`);
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