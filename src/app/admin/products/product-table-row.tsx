import { Dispatch, SetStateAction } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { ProductWithCategory } from '@/app/admin/products/products.types';
import { CreateOrUpdateProductSchema } from '@/app/admin/products/schema';

type Props = {
  product: ProductWithCategory;
  setIsProductModalOpen: Dispatch<SetStateAction<boolean>>;
  setCurrentProduct: Dispatch<
    SetStateAction<CreateOrUpdateProductSchema | null>
  >;
  setIsDeleteModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const ProductTableRow = ({
  product,
  setIsProductModalOpen,
  setCurrentProduct,
  setIsDeleteModalOpen,
}: Props) => {
  const handleEditClick = (product: CreateOrUpdateProductSchema) => {
    setCurrentProduct({
      title: product.title,
      category: product.category,
      price: product.price,
      maxQuantity: product.maxQuantity,
      heroImage: product.heroImage,
      images: product.images,
      slug: product.slug,
      intent: 'update',
      description: product.description,
      sizes: product.sizes,
    });
    setIsProductModalOpen(true);
  };

  return (
    <TableRow key={product.id} className='transition-colors hover:bg-blue-50 dark:hover:bg-zinc-800/40'>
      <TableCell className='py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-100'>{product.title}</TableCell>
      <TableCell className='py-3 px-4'>{product.category.name}</TableCell>
      <TableCell className='py-3 px-4 text-blue-700 dark:text-blue-300 font-medium'>{product.price?.toLocaleString()}₫</TableCell>
      <TableCell className='py-3 px-4'>{product.maxQuantity}</TableCell>
      <TableCell className='py-3 px-4 max-w-xs truncate'>{product.description}</TableCell>
      <TableCell className='py-3 px-4'>{product.sizes && product.sizes.length > 0 ? product.sizes.map(sz => `${sz.size}: ${sz.quantity}`).join(', ') : '-'}</TableCell>
      <TableCell className='py-3 px-4'>
        {product.heroImage && (
          <Image
            width={40}
            height={40}
            src={product.heroImage}
            alt='Hero'
            className='w-10 h-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm'
          />
        )}
      </TableCell>
      <TableCell className='py-3 px-4'>
        {product.imagesUrl.map((url, index) => (
          <Image
            width={40}
            height={40}
            key={index}
            src={url}
            alt={`Product ${index + 1}`}
            className='w-10 h-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm inline-block mr-1'
          />
        ))}
      </TableCell>
      <TableCell className='py-3 px-4 flex gap-2 items-center'>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 transition-colors'
          onClick={() => {
            setCurrentProduct({
              title: product.title,
              category: product.category.id.toString(),
              price: product.price?.toString() ?? '',
              maxQuantity: product.maxQuantity.toString(),
              heroImage: product.heroImage,
              images: [],
              slug: product.slug,
              intent: 'update',
              description: product.description,
              sizes: product.sizes,
            });
            setIsProductModalOpen(true);
          }}
        >
          <Pencil className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-300 transition-colors'
          onClick={() => {
            setCurrentProduct({
              title: product.title,
              category: product.category.id.toString(),
              price: product.price?.toString() ?? '',
              maxQuantity: product.maxQuantity.toString(),
              heroImage: product.heroImage,
              images: [],
              slug: product.slug,
              intent: 'update',
              description: product.description,
              sizes: product.sizes,
            });
            setIsDeleteModalOpen(true);
          }}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </TableCell>
    </TableRow>
  );
};