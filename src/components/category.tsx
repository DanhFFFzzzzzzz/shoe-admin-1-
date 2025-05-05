import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';
import { MoreHorizontal, Calendar, Package, Edit2, Trash2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { TableCell, TableRow } from '@/components/ui/table';
import { CreateCategorySchema } from '@/app/admin/categories/create-category.schema';
import { CategoryWithProducts } from '@/app/admin/categories/categories.types';

export const CategoryTableRow = ({
  category,
  setCurrentCategory,
  setIsCreateCategoryModalOpen,
  deleteCategoryHandler,
}: {
  category: CategoryWithProducts;
  setCurrentCategory: (category: CreateCategorySchema | null) => void;
  setIsCreateCategoryModalOpen: (isOpen: boolean) => void;
  deleteCategoryHandler: (id: number) => Promise<void>;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditClick = (category: CreateCategorySchema) => {
    setCurrentCategory({
      name: category.name,
      // @ts-ignore
      image: new File([], ''),
      intent: 'update',
      slug: category.slug,
    });
    setIsCreateCategoryModalOpen(true);
  };

  const handleDelete = async () => {
    await deleteCategoryHandler(category.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <TableRow className="shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl bg-white/5 dark:bg-zinc-900/60">
        <TableCell className="sm:table-cell align-middle">
          <div className="flex items-center justify-center">
            <Image
              alt="Category image"
              className="rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shadow"
              height={80}
              width={80}
              src={category.imageUrl || '/placeholder.jpg'}
            />
          </div>
        </TableCell>
        <TableCell className="font-bold text-lg align-middle text-primary">
          {category.name}
        </TableCell>
        <TableCell className="md:table-cell align-middle text-zinc-500 flex items-center gap-2">
          <Calendar className="inline-block mr-1 h-4 w-4 text-zinc-400" />
          {format(new Date(category.created_at), 'yyyy-MM-dd')}
        </TableCell>
        <TableCell className="md:table-cell align-middle">
          {category.products && category.products.length > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-green-500" />
                  <span>{category.products.length} sản phẩm</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle className="mb-2">Danh sách sản phẩm</DialogTitle>
                <ScrollArea className="h-[400px] rounded-md p-4">
                  {category.products.map(product => (
                    <Link key={product.id} href={`/products/${product.id}`} className="block mb-2">
                      <Card className="cursor-pointer p-2 flex items-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                        <Image
                          alt="Product image"
                          className="rounded-md object-cover border"
                          height={48}
                          width={48}
                          src={product.heroImage}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-base">{product.title}</span>
                          <span className="text-xs text-zinc-500">{product.maxQuantity} sản phẩm trong kho</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400 italic">
              <Package className="h-4 w-4" />
              <span>Chưa có sản phẩm</span>
            </div>
          )}
        </TableCell>
        <TableCell className="align-middle">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
              onClick={() => handleEditClick(category)}
              title="Chỉnh sửa"
            >
              <Edit2 className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
              onClick={() => setIsDeleteDialogOpen(true)}
              title="Xóa"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn chắc chắn muốn xóa?</DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xác nhận xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
