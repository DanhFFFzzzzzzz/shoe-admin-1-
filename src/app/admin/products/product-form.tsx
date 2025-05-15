import { Dispatch, SetStateAction, useEffect } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CreateOrUpdateProductSchema } from '@/app/admin/products/schema';
import { Input } from '@/components/ui/input';
import { Category } from '@/app/admin/categories/categories.types';
import { Button } from '@/components/ui/button';
import { Tag, Folder, DollarSign, Package, Image as ImageIcon, FileText, Hash, Ruler } from 'lucide-react';

type Props = {
  form: UseFormReturn<CreateOrUpdateProductSchema>;
  onSubmit: (data: CreateOrUpdateProductSchema) => void;
  categories: Category[];
  setIsProductModalOpen: Dispatch<SetStateAction<boolean>>;
  isProductModalOpen: boolean;
  defaultValues: CreateOrUpdateProductSchema | null;
};

export const ProductForm = ({
  form,
  onSubmit,
  categories,
  setIsProductModalOpen,
  isProductModalOpen,
  defaultValues,
}: Props) => {
  const isSubmitting = form.formState.isSubmitting;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sizes',
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    } else {
      form.reset({
        title: '',
        category: '',
        price: '',
        maxQuantity: '',
        heroImage: undefined,
        images: undefined,
        description: '',
        sizes: Array.from({ length: 12 }, (_, i) => ({ size: 34 + i, quantity: 0 })),
        intent: 'create',
        slug: undefined,
      });
    }
  }, [defaultValues, form]);

  // Tự động cập nhật maxQuantity khi thay đổi sizes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && name.startsWith('sizes')) {
        const sizes = form.getValues('sizes');
        if (sizes && Array.isArray(sizes)) {
          const total = sizes.reduce((sum, sz) => sum + (Number(sz.quantity) || 0), 0);
          form.setValue('maxQuantity', total.toString());
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
      <DialogContent className="max-w-xl w-full rounded-2xl shadow-2xl p-8 z-50 bg-white dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 mx-auto">
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>
        </DialogHeader>
        <div
          className='max-h-[calc(100svh-200px)] overflow-y-auto'
          style={{
            scrollbarWidth: 'none' /* Firefox */,
            msOverflowStyle: 'none' /* Internet Explorer 10+ */,
          }}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='grid gap-6 py-4'
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-1'>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2'><Tag className="w-4 h-4 text-blue-500" />Tên sản phẩm</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập tên sản phẩm'
                        {...field}
                        className='col-span-3 rounded-lg border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-1 mb-2'>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2'><Folder className="w-4 h-4 text-purple-500" />Danh mục</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger
                          disabled={isSubmitting}
                          className='col-span-3 rounded-lg border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        >
                          <SelectValue placeholder='Chọn danh mục' />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {categories.map(category => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-1'>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2'><DollarSign className="w-4 h-4 text-green-500" />Giá</FormLabel>
                    <FormControl>
                      <Input
                        id='price'
                        type='number'
                        placeholder='Nhập giá sản phẩm'
                        className='col-span-3 rounded-lg border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='maxQuantity'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-1'>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2'><Package className="w-4 h-4 text-yellow-500" />Tổng số lượng tồn kho</FormLabel>
                    <FormControl>
                      <Input
                        id='maxQuantity'
                        type='number'
                        placeholder='Tổng số lượng'
                        className='col-span-3 rounded-lg border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        {...field}
                        readOnly
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='heroImage'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-1'>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2'><ImageIcon className="w-4 h-4 text-pink-500" />Ảnh đại diện</FormLabel>
                    <FormControl className='col-span-3'>
                      <Input
                        type='file'
                        accept='image/*'
                        {...form.register('heroImage')}
                        onChange={event => {
                          field.onChange(event.target.files?.[0]);
                        }}
                        className='rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2'
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='images'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-1'>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2'><ImageIcon className="w-4 h-4 text-pink-500" />Ảnh sản phẩm</FormLabel>
                    <FormControl className='col-span-3'>
                      <Input
                        type='file'
                        accept='image/*'
                        multiple
                        {...form.register('images')}
                        onChange={event => {
                          field.onChange(event.target.files);
                        }}
                        className='rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-2'
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-1'>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2'><FileText className="w-4 h-4 text-blue-400" />Mô tả</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder='Nhập mô tả sản phẩm'
                        {...field}
                        className='col-span-3 p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 min-h-[60px] bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition'
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mb-4">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-200 mb-2 text-lg flex items-center gap-2"><Ruler className="w-5 h-5 text-indigo-500" />Kích cỡ & Số lượng</label>
                <div className="flex flex-col gap-2">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 hover:shadow-md transition-shadow">
                      <label className="w-20 text-sm font-medium text-zinc-500 flex items-center gap-1"><Hash className="w-4 h-4 text-blue-400" />Size</label>
                      <input
                        type="number"
                        min={34}
                        max={45}
                        readOnly
                        value={form.getValues(`sizes.${idx}.size`) || 34 + idx}
                        {...form.register(`sizes.${idx}.size`, { valueAsNumber: true })}
                        className="w-16 rounded border border-zinc-300 dark:border-zinc-700 p-2 text-center bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100 font-bold focus:outline-none"
                      />
                      <label className="w-24 text-sm text-zinc-400 flex items-center gap-1"><Package className="w-4 h-4 text-green-500" />Số lượng</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...form.register(`sizes.${idx}.quantity`, { valueAsNumber: true })}
                        className="w-24 rounded border border-zinc-300 dark:border-zinc-700 p-2 text-center focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      />
                    </div>
                  ))}
                </div>
                <FormMessage />
              </div>

              <DialogFooter>
                <Button disabled={isSubmitting} type='submit' className='w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2'>
                  <Package className="w-5 h-5 text-white" /> Thêm sản phẩm mới
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};