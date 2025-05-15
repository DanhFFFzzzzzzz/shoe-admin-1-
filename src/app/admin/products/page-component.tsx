'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { createProduct, deleteProduct, updateProduct } from '@/server/actions/products';
import { Tables } from '@/supabase.types';

type Product = Tables<'product'>;
type Category = Tables<'category'>;
type ProductWithSizes = Product & { sizes: { size: number; quantity: number }[]; category: Category };

const formSchema = z.object({
  category: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  heroImage: z.string().min(1, 'Hero image is required'),
  imagesUrl: z.array(z.string()).min(1, 'At least one image is required'),
  sizes: z.array(z.object({
    quantity: z.number().min(0, 'Quantity must be non-negative'),
  })).min(1, 'At least one size is required'),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  categories: Category[];
  productsWithCategories: ProductWithSizes[];
};

export default function ProductsPageComponent({
  categories,
  productsWithCategories,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();
  const [editProduct, setEditProduct] = useState<ProductWithSizes | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      title: '',
      description: '',
      price: '',
      heroImage: '',
      imagesUrl: [],
      sizes: [],
    },
  });

  const watchSizes = form.watch('sizes');
  const maxQuantity = Array.isArray(watchSizes) ? watchSizes.reduce((sum, sz) => sum + (Number(sz.quantity) || 0), 0) : 0;
  const watchTitle = form.watch('title');

  async function uploadImage(file: File): Promise<string> {
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
        setUploadError(data.error || 'Upload failed');
        throw new Error(data.error || 'Upload failed');
      }
      return data.url;
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }

  function slugify(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const openEditDialog = (product: ProductWithSizes) => {
    setEditProduct(product);
    setIsOpen(true);
    // Reset form với dữ liệu cũ
    form.reset({
      category: product.category.id.toString(),
      title: product.title,
      description: product.description || '',
      price: product.price?.toString() || '',
      heroImage: product.heroImage,
      imagesUrl: product.imagesUrl || [],
      sizes: product.sizes.map(sz => ({ quantity: sz.quantity })),
    });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setUploadError(null);
      if (!data.heroImage || typeof data.heroImage !== 'string') {
        setError('Vui lòng upload ảnh đại diện.');
        setIsLoading(false);
        return;
      }
      if (!Array.isArray(data.imagesUrl) || data.imagesUrl.length === 0 || data.imagesUrl.some(url => typeof url !== 'string')) {
        setError('Vui lòng upload ít nhất 1 ảnh chi tiết.');
        setIsLoading(false);
        return;
      }
      if (!Array.isArray(data.sizes) || data.sizes.length !== 12) {
        setError('Vui lòng nhập đủ số lượng cho 12 size (34-45).');
        setIsLoading(false);
        return;
      }
      const slug = slugify(data.title || '');
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('price', data.price);
      formData.append('maxQuantity', maxQuantity.toString());
      formData.append('heroImage', data.heroImage);
      formData.append('imagesUrl', JSON.stringify(data.imagesUrl));
      formData.append('slug', slug);
      formData.append('sizes', JSON.stringify(data.sizes));
      if (editProduct) {
        await updateProduct(editProduct.id.toString(), Object.fromEntries(formData));
      } else {
        await createProduct(formData);
      }
      setIsOpen(false);
      setEditProduct(null);
          form.reset();
          router.refresh();
    } catch (err: any) {
      console.error('Lỗi khi thêm/cập nhật sản phẩm:', err);
      if (err instanceof Error) setError(err.message);
      else if (typeof err === 'string') setError(err);
      else if (err && err.error) setError(err.error);
      else setError('Đã xảy ra lỗi khi thêm/cập nhật sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId.toString());
          router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  const handleUpdate = async (productId: number, data: Partial<Product>) => {
    try {
      await updateProduct(productId.toString(), data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Quản lý sản phẩm</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditProduct(null); form.reset({ category: '', title: '', description: '', price: '', heroImage: '', imagesUrl: [], sizes: Array.from({ length: 12 }, () => ({ quantity: 0 })) }); setIsOpen(true); }}>
              Thêm sản phẩm mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg w-full rounded-2xl shadow-2xl p-0 z-50 bg-white dark:bg-zinc-900/90 backdrop-blur-md border border-blue-200 dark:border-blue-800 mx-auto">
            <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-t-2xl p-6 border-b border-blue-200 dark:border-blue-800 shadow-md flex items-center justify-between">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {editProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </DialogTitle>
              </DialogHeader>
              <DialogClose asChild>
                <button
                  type="button"
                  className="ml-auto text-zinc-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full p-1 transition-colors"
                  aria-label="Đóng"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </DialogClose>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6 pt-2 bg-white dark:bg-zinc-900 rounded-b-2xl">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-5'
                >
                  <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Chọn danh mục' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên sản phẩm</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá</FormLabel>
                        <FormControl>
                          <Input type='number' step='0.01' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Tổng số lượng tồn kho</FormLabel>
                    <FormControl>
                      <Input type='number' value={maxQuantity} readOnly disabled className='bg-gray-100 dark:bg-zinc-800 cursor-not-allowed' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormField
                    control={form.control}
                    name='heroImage'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ảnh đại diện</FormLabel>
                        <FormControl>
                          <Input
                            type='file'
                            accept='image/*'
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const url = await uploadImage(file);
                                  field.onChange(url);
                                } catch {}
                              }
                            }}
                            disabled={isLoading || uploading}
                          />
                        </FormControl>
                        {field.value && (
                          <img src={field.value} alt='Ảnh đại diện' className='mt-2 w-20 h-20 object-cover rounded border' />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='imagesUrl'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ảnh chi tiết</FormLabel>
                        <FormControl>
                          <Input
                            type='file'
                            accept='image/*'
                            multiple
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length) {
                                try {
                                  const urls = await Promise.all(files.map(uploadImage));
                                  field.onChange(urls);
                                } catch {}
                              }
                            }}
                            disabled={isLoading || uploading}
                          />
                        </FormControl>
                        {Array.isArray(field.value) && field.value.length > 0 && (
                          <div className='flex flex-wrap gap-2 mt-2'>
                            {field.value.map((url, idx) => (
                              <img key={idx} src={url} alt={`Ảnh ${idx + 1}`} className='w-16 h-16 object-cover rounded border' />
                            ))}
        </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='sizes'
                    render={() => (
                      <FormItem>
                        <FormLabel className='font-bold text-blue-700 dark:text-blue-300 text-lg mb-2'>Kích cỡ & Số lượng</FormLabel>
                        <div className='overflow-x-auto'>
                          <table className='min-w-[320px] border border-blue-200 dark:border-blue-800 rounded-lg text-center bg-white dark:bg-zinc-900 shadow-md'>
                            <thead>
                              <tr className='bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900'>
                                <th className='px-4 py-2 border-r border-blue-200 dark:border-blue-800 text-base text-blue-700 dark:text-blue-200 font-semibold'>Size</th>
                                <th className='px-4 py-2 text-base text-blue-700 dark:text-blue-200 font-semibold'>Số lượng</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...Array(12)].map((_, idx) => (
                                <tr key={34 + idx} className='hover:bg-blue-50 dark:hover:bg-blue-900/30 transition'>
                                  <td className='px-4 py-2 border-r border-blue-100 dark:border-blue-800 font-semibold'>{34 + idx}</td>
                                  <td className='px-4 py-2'>
                                    <Input
                                      type='number'
                                      min={0}
                                      style={{ width: 80, textAlign: 'center' }}
                                      className='rounded-lg border border-blue-200 dark:border-blue-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 font-semibold shadow-sm'
                                      {...form.register(`sizes.${idx}.quantity` as const, { valueAsNumber: true })}
                                      placeholder='0'
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
        </div>
                      </FormItem>
                    )}
                  />
                  {(error || uploadError) && (
                    <div className='text-red-500 text-sm'>{error || uploadError}</div>
                  )}
                  <Button type='submit' disabled={isLoading || uploading} className='w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 text-lg'>
                    {isLoading || uploading ? 'Đang thêm...' : 'Thêm sản phẩm mới'}
              </Button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table className="shadow-md rounded-xl overflow-hidden border border-blue-100 dark:border-blue-800 bg-white dark:bg-zinc-900">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 text-blue-700 dark:text-blue-200 font-bold text-base">
            <TableHead className="py-3 px-4">Ảnh</TableHead>
            <TableHead className="py-3 px-4">Tên sản phẩm</TableHead>
            <TableHead className="py-3 px-4">Danh mục</TableHead>
            <TableHead className="py-3 px-4">Giá</TableHead>
            <TableHead className="py-3 px-4">Số lượng từng size</TableHead>
            <TableHead className="py-3 px-4">Mô tả</TableHead>
            <TableHead className="py-3 px-4">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(productsWithCategories) && productsWithCategories.length > 0 ? (
            productsWithCategories.map((product) => {
              let heroImage = '';
              try {
                heroImage = typeof product.heroImage === 'string' ? product.heroImage : '';
              } catch (e) {
                console.error('Lỗi khi lấy heroImage:', e, product);
                heroImage = '';
              }
              return (
                <TableRow key={product.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition border-b border-blue-50 dark:border-blue-900">
                  <TableCell className="py-3 px-4">
                    {heroImage ? (
                      <Image
                        src={heroImage}
                        alt={product.title}
                        width={50}
                        height={50}
                        className='rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm object-cover'
                      />
                    ) : (
                      <span className='text-gray-400'>No image</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-100">{product.title}</TableCell>
                  <TableCell className="py-3 px-4">{product.category?.name || ''}</TableCell>
                  <TableCell className="py-3 px-4 text-blue-700 dark:text-blue-300 font-medium">{product.price ? Number(product.price).toLocaleString('vi-VN') + ' ₫' : ''}</TableCell>
                  <TableCell className="py-3 px-4 max-w-xs truncate text-sm text-zinc-700 dark:text-zinc-200">
                    {Array.isArray(product.sizes) && product.sizes.length > 0
                      ? product.sizes.map((sz: { size: number; quantity: number }) => `${sz.size}: ${sz.quantity}`).join(', ')
                      : '-'}
                  </TableCell>
                  <TableCell className="py-3 px-4 max-w-xs truncate text-zinc-500 dark:text-zinc-300" title={product.description || undefined}>{product.description}</TableCell>
                  <TableCell className="py-3 px-4">
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='border-blue-400 text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-semibold rounded-lg px-3 py-1'
                        onClick={() => openEditDialog(product)}
                      >
                        Cập nhật
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        className='rounded-lg px-3 py-1 font-semibold'
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className='text-center text-gray-400'>Không có sản phẩm nào hoặc dữ liệu lỗi.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}