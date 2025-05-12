import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';
import { Edit2, Trash2, Package, Calendar } from 'lucide-react';

import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <TableRow className="group hover:bg-primary/5 transition-colors">
        <TableCell className="py-4 px-6">
          <div className="flex items-center justify-center">
            <Image
              alt="Hình ảnh danh mục"
              className="rounded-lg object-cover border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
              height={64}
              width={64}
              src={category.imageUrl || '/placeholder.jpg'}
            />
          </div>
        </TableCell>
        <TableCell className="py-4 px-6">
          <span className="font-semibold text-gray-800 text-lg group-hover:text-primary transition-colors">
            {category.name}
          </span>
        </TableCell>
        <TableCell className="py-4 px-6">
          <div className="flex items-center gap-2 text-gray-600 group-hover:text-gray-800 transition-colors">
            <Calendar className="h-4 w-4 text-primary/60" />
            {format(new Date(category.created_at), 'dd/MM/yyyy')}
          </div>
        </TableCell>
        <TableCell className="py-4 px-6">
          {category.products && category.products.length > 0 ? (
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  <Package className="h-4 w-4" />
                  <span>{category.products.length} sản phẩm</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-lg w-full rounded-xl shadow-2xl p-8 bg-white border border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-gray-800">Danh Sách Sản Phẩm</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] rounded-md p-4">
                  {category.products.map(product => (
                    <Link key={product.id} href={`/products/${product.id}`} className="block mb-4">
                      <Card className="p-4 flex items-center gap-4 hover:bg-primary/5 transition-colors group">
                        <Image
                          alt="Hình ảnh sản phẩm"
                          className="rounded-md object-cover border border-gray-200 group-hover:border-primary/20 transition-colors"
                          height={48}
                          width={48}
                          src={product.heroImage}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">{product.title}</span>
                          <span className="text-sm text-gray-500">{product.maxQuantity} sản phẩm trong kho</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Package className="h-4 w-4" />
              <span>Chưa có sản phẩm</span>
            </div>
          )}
        </TableCell>
        <TableCell className="py-4 px-6">
          <div className="flex gap-3 items-center">
            <button
              onClick={() => handleEditClick(category)}
              className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
              title="Chỉnh sửa danh mục"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              title="Xóa danh mục"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md w-full rounded-xl shadow-2xl p-8 bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">Xóa Danh Mục</DialogTitle>
            <DialogDescription className="text-gray-600">
              Bạn có chắc chắn muốn xóa danh mục <span className="font-semibold text-primary">{category.name}</span>? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Xác Nhận Xóa
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};