'use server';

import slugify from 'slugify';

import { createClient } from '@/supabase/server';
import {
    ProductsWithCategoriesResponse,
    UpdateProductSchema,
} from '@/app/admin/products/products.types';
import { CreateProductSchemaServer } from '@/app/admin/products/schema';
import { revalidatePath } from 'next/cache';
import { Tables } from '@/supabase.types';
import { NextRequest, NextResponse } from 'next/server';
import { imageUploadHandler } from './categories';

type Product = Tables<'product'>;
type Category = Tables<'category'>;

type ProductSizeRow = { id: number; created_at: string; size: number; quantity: number; product: number };

export async function getProducts() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('product')
    .select(`
      *,
      category (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return products as (Product & {
    category: Category;
  })[];
}

export const getProductsWithCategories = async () => {
  const supabase = await createClient();
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
  const mappedData = (products || []).map(product => {
    let imagesUrl: string[] = [];
    if (Array.isArray(product.imagesUrl)) {
      imagesUrl = product.imagesUrl;
    } else if (product.imagesUrl) {
      try {
        imagesUrl = JSON.parse(product.imagesUrl);
        if (!Array.isArray(imagesUrl)) imagesUrl = [];
      } catch (e) {
        console.error('Lỗi khi parse imagesUrl:', e, product.imagesUrl);
        imagesUrl = [];
      }
    }
    return {
      ...product,
      sizes: sizesMap[product.id] || [],
      imagesUrl,
    };
  });

  return mappedData;
};

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const category = formData.get('category') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const maxQuantity = formData.get('maxQuantity') as string;
  const heroImage = formData.get('heroImage') as string;
  const imagesUrl = JSON.parse(formData.get('imagesUrl') as string) as string[];
  const slug = formData.get('slug') as string;
  const sizes = JSON.parse(formData.get('sizes') as string) as { quantity: number }[];

  const { data, error } = await supabase.from('product').insert({
    category: parseInt(category),
    title,
    description,
    price: parseFloat(price),
    maxQuantity: parseInt(maxQuantity),
    heroImage,
    imagesUrl,
    slug,
  }).select('id').single();

  if (error) {
    throw new Error(error.message);
  }

  if (data && data.id && Array.isArray(sizes) && sizes.length === 12) {
    const productId = data.id;
    const sizeRows = sizes.map((sz, idx) => ({
      product: productId,
      size: 34 + idx,
      quantity: sz.quantity || 0,
    }));
    const { error: sizeError } = await supabase.from('product_size').insert(sizeRows);
    if (sizeError) {
      throw new Error('Lỗi khi thêm size: ' + sizeError.message);
    }
  }

  revalidatePath('/admin/products');
}

export async function updateProduct(productId: string, data: Partial<Product>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('product')
    .update(data)
    .eq('id', parseInt(productId));

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/products');
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('product')
    .delete()
    .eq('id', parseInt(productId));

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/products');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const url = await imageUploadHandler(formData);
    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}