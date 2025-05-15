'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  DialogTrigger,
} from '@/components/ui/dialog';

import { updateOrderStatus } from '@/server/actions/order';
import { Tables } from '@/supabase.types';

type Order = Tables<'order'>;
type OrderItem = Tables<'order_item'>;
type Product = Tables<'product'>;

type Props = {
  orders: (Order & {
    order_item: (OrderItem & {
      product: Product;
    })[];
  })[];
};

type OrderedProducts = {
  order_id: number;
  product: Tables<'product'>;
}[];

export default function OrdersPageComponent({ orders }: Props) {
  const [selectedProducts, setSelectedProducts] = useState<OrderedProducts>([]);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const openProductsModal = (products: OrderedProducts) => () =>
    setSelectedProducts(products);

  const orderedProducts = orders.flatMap(order =>
    order.order_item.map(item => ({
      order_id: order.id,
      product: item.product,
    }))
  );

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setIsUpdating(orderId);
      setIsLoading(true);
      setError(null);
      await updateOrderStatus(orderId.toString(), newStatus);
      toast.success('Order status updated successfully');
    router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUpdating(null);
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Quản lý đơn hàng</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Chi tiết</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>
                {format(new Date(order.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) =>
                    handleStatusChange(order.id, value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Chờ xác nhận</SelectItem>
                    <SelectItem value='processing'>Đang xử lý</SelectItem>
                    <SelectItem value='shipped'>Đã gửi hàng</SelectItem>
                    <SelectItem value='delivered'>Đã giao</SelectItem>
                    <SelectItem value='cancelled'>Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>$ {order.totalPrice.toFixed(2)}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Chi tiết đơn</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {order.order_item.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <Image
                            src={item.product.heroImage}
                            alt={item.product.title}
                            width={60}
                            height={60}
                            className="rounded border"
                          />
                          <div>
                            <div className="font-semibold">{item.product.title}</div>
                            <div className="text-sm text-gray-500">Số lượng: x{item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {error && (
        <div className='mt-4 text-red-500 text-sm'>{error}</div>
      )}
    </div>
  );
}