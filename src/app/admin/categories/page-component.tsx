'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React from 'react';
import { Search } from "lucide-react";

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { createCategory, deleteCategory, updateCategory } from '@/server/actions/categories';
import { Tables } from '@/supabase.types';

type Category = Tables<'category'>;

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  slug: z.string().min(1, 'Slug is required'),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  categories: Category[];
};

export default function CategoriesPageComponent({ categories }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const router = useRouter();
  const [search, setSearch] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      slug: '',
    },
  });

  // Tự động sinh slug từ tên danh mục
  const watchName = form.watch('name');
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  // Khi tên thay đổi thì cập nhật slug
  React.useEffect(() => {
    form.setValue('slug', slugify(watchName || ''));
  }, [watchName]);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Upload ảnh lên server
  async function uploadImage(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setUploadError(data.error || 'Upload thất bại');
        throw new Error(data.error || 'Upload thất bại');
      }
      setImageUrl(data.url);
      form.setValue('imageUrl', data.url);
      return data.url;
    } catch (err: any) {
      setUploadError(err.message || 'Upload thất bại');
      throw err;
    } finally {
      setUploading(false);
    }
  }

  const openEditDialog = (category: Category) => {
    setEditCategory(category);
    setIsOpen(true);
    form.reset({
      name: category.name,
      imageUrl: category.imageUrl,
      slug: category.slug,
    });
    setImagePreview(category.imageUrl || null);
    setImageUrl(category.imageUrl || '');
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setUploadError(null);
      if (!data.imageUrl || typeof data.imageUrl !== 'string') {
        setError('Vui lòng upload hình ảnh.');
        setIsLoading(false);
        return;
      }
      if (editCategory) {
        await updateCategory(editCategory.id.toString(), {
          name: data.name,
          imageUrl: data.imageUrl,
          slug: data.slug,
        });
      } else {
        await createCategory({
          name: data.name,
          imageUrl: data.imageUrl,
          slug: data.slug,
        });
      }
      setIsOpen(false);
      setEditCategory(null);
      setImagePreview(null);
      setImageUrl('');
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await deleteCategory(categoryId.toString());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      }
    }
  };

  const filteredCategories = categories.filter(category => category.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="w-full sm:w-auto">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-200 tracking-tight mb-2">Quản lý danh mục</h1>
          <div className="mb-4 w-full sm:w-80">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                className="border rounded pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-blue-400 outline-none shadow-sm"
                placeholder="Tìm kiếm tên danh mục"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setEditCategory(null); form.reset(); setImagePreview(null); setImageUrl(''); } }}>
          <DialogTrigger asChild>
                <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition text-base">Thêm danh mục mới</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-full rounded-2xl shadow-2xl p-0 z-50 bg-white dark:bg-zinc-900/90 backdrop-blur-md border border-blue-200 dark:border-blue-800 mx-auto">
            <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-t-2xl p-6 border-b border-blue-200 dark:border-blue-800 shadow-md flex items-center justify-between">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {editCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                </DialogTitle>
              </DialogHeader>
              <button
                type="button"
                className="ml-auto text-zinc-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full p-1 transition-colors"
                aria-label="Đóng"
                onClick={() => { setIsOpen(false); setEditCategory(null); form.reset(); setImagePreview(null); setImageUrl(''); }}
              >×</button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6 pt-2 bg-white dark:bg-zinc-900 rounded-b-2xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên danh mục</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên danh mục" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <label className="block font-medium mb-1">Hình ảnh</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading || isLoading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                          try {
                            await uploadImage(file);
                          } catch {}
                        }
                      }}
                      className="block w-full border border-blue-200 rounded-lg px-3 py-2 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 shadow-sm"
                    />
                    {hasMounted && imagePreview && (
                      <img src={imagePreview} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded border" />
                    )}
                    {uploading && <div className="text-blue-500 text-sm mt-1">Đang tải ảnh lên...</div>}
                    {uploadError && <div className="text-red-500 text-sm mt-1">{uploadError}</div>}
                  </div>
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (đường dẫn)</FormLabel>
                        <FormControl>
                          <Input placeholder="slug-khong-dau" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(error || uploadError) && (
                    <div className="text-red-500 text-sm">{error || uploadError}</div>
                  )}
                  <Button type="submit" disabled={isLoading || uploading || !imageUrl} className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 text-lg">
                    {isLoading || uploading ? (editCategory ? 'Đang cập nhật...' : 'Đang thêm...') : (editCategory ? 'Lưu thay đổi' : 'Thêm danh mục')}
                  </Button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow border border-blue-100 dark:border-blue-800 bg-white dark:bg-zinc-900">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 text-blue-700 dark:text-blue-200 font-bold text-base">
              <TableHead className="py-3 px-4">Tên danh mục</TableHead>
              <TableHead className="py-3 px-4">Hình ảnh</TableHead>
              <TableHead className="py-3 px-4">Slug</TableHead>
              <TableHead className="py-3 px-4">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length > 0 ? filteredCategories.map((category) => (
              <TableRow key={category.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition border-b border-blue-50 dark:border-blue-900">
                <TableCell className="py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-100">{category.name}</TableCell>
                <TableCell className="py-3 px-4">
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt={category.name} className="w-16 h-16 object-cover rounded border border-blue-100 dark:border-blue-800 shadow-sm" />
                  ) : (
                    <span className="text-gray-400">Không có ảnh</span>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4 text-zinc-700 dark:text-zinc-200">{category.slug}</TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-400 text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-semibold rounded-lg px-3 py-1"
                      onClick={() => openEditDialog(category)}
                    >
                      Cập nhật
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-lg px-3 py-1 font-semibold"
                      onClick={() => handleDelete(category.id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400">Không có danh mục nào.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
