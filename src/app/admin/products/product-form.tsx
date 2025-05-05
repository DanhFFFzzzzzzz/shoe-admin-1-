import { Dispatch, SetStateAction, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

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

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    } else {
      form.reset({
        title: '',
        category: '',
        price: '',
        maxQuantity: '120',
        heroImage: undefined,
        images: undefined,
        description: '',
        sizes: Array.from({ length: 12 }, (_, i) => ({ size: 34 + i, quantity: 10 })),
      });
    }
  }, [defaultValues, form]);

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
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter product title'
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
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Category</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger
                          disabled={isSubmitting}
                          className='col-span-3 rounded-lg border border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        >
                          <SelectValue placeholder='Select a category' />
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
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Price</FormLabel>
                    <FormControl>
                      <Input
                        id='price'
                        type='number'
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
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Max Quantity</FormLabel>
                    <FormControl>
                      <Input
                        id='maxQuantity'
                        type='number'
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
                name='heroImage'
                render={({ field }) => (
                  <FormItem className='flex flex-col gap-1'>
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Hero Image</FormLabel>
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
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Product Images</FormLabel>
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
                    <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Description</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder='Enter product description'
                        {...field}
                        className='col-span-3 p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 min-h-[60px] bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition'
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {defaultValues ? (
                <FormField
                  control={form.control}
                  name='sizes'
                  render={({ field }) => (
                    <FormItem className='flex flex-col gap-1'>
                      <FormLabel className='font-semibold text-zinc-700 dark:text-zinc-200'>Sizes & Quantity</FormLabel>
                      <div className='grid grid-cols-3 gap-2'>
                        {field.value.map((sz: { size: number, quantity: number }, idx: number) => (
                          <div key={sz.size} className='flex items-center gap-2'>
                            <span className='w-8 text-center font-semibold'>{sz.size}</span>
                            <Input
                              type='number'
                              min={0}
                              value={sz.quantity}
                              onChange={e => {
                                const newSizes = [...field.value];
                                newSizes[idx] = { ...newSizes[idx], quantity: Number(e.target.value) };
                                field.onChange(newSizes);
                              }}
                              className='w-16 rounded border border-zinc-300 dark:border-zinc-700 p-1 text-center'
                            />
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <DialogFooter>
                <Button disabled={isSubmitting} type='submit' className='w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200'>
                  Thêm sản phẩm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};