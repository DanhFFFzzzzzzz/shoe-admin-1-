'use server';

import slugify from 'slugify';
import { createClient } from '@/supabase/server';
import { revalidatePath } from 'next/cache';
import { Tables } from '@/supabase.types';

type Category = Tables<'category'>;

export const getCategoriesWithProducts = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('category')
    .select('* , products:product(*)');

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Error fetching categories: ${error.message}`);
    }

    return data || [];
  };

export const imageUploadHandler = async (formData: FormData) => {
  const supabase = await createClient();
  if (!formData) return;

  const fileEntry = formData.get('file');

  if (!(fileEntry instanceof File)) throw new Error('Expected a file');

  const ext = fileEntry.name.split('.').pop();
  const baseName = fileEntry.name.replace(/\.[^/.]+$/, '');
  const safeName = slugify(baseName, { lower: true, strict: true });
  const fileName = `${safeName}-${Date.now()}.${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from('app-images')
      .upload(fileName, fileEntry, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error('Error uploading image');
    }

    const {
      data: { publicUrl },
    } = await supabase.storage.from('app-images').getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error uploading image');
  }
};

export async function getCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('category')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return categories as Category[];
}

export async function createCategory(data: { name: string; imageUrl: string; slug?: string }) {
  const supabase = await createClient();
  const slug = data.slug || slugify(data.name, { lower: true });

  const { error } = await supabase.from('category').insert({
    name: data.name,
    imageUrl: data.imageUrl,
    slug,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/categories');
}

export async function updateCategory(categoryId: string, data: Partial<Category>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('category')
    .update(data)
    .eq('id', parseInt(categoryId));

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/categories');
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('category')
    .delete()
    .eq('id', parseInt(categoryId));

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/categories');
}

export async function getCategoryData() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('category')
    .select('name, products:product(id)');

  if (error) {
    throw new Error(error.message);
  }

  return data.map((category: { name: string; products: { id: number }[] }) => ({
      name: category.name,
      products: category.products.length,
  }));
}