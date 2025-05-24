'use client';

import { useState, useEffect } from 'react';
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
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const router = useRouter();

  const openProductsModal = (products: OrderedProducts) => () =>
    setSelectedProducts(products);

  const orderedProducts = orders.flatMap(order =>
    order.order_item.map(item => ({
      order_id: order.id,
      product: item.product,
    }))
  );

  // Khi có đơn hàng CancelRequested, tự động mở popup xác nhận
  useEffect(() => {
    const cancelRequestedOrder = orders.find(order => order.status === 'CancelRequested');
    if (cancelRequestedOrder) {
      setConfirmOrder(cancelRequestedOrder);
    }
  }, [orders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      // Nếu đang hủy đơn hàng, hiển thị dialog xác nhận
      if (newStatus === 'cancelled') {
        const confirmed = await new Promise<boolean>((resolve) => {
          const dialog = document.createElement('dialog');
          dialog.innerHTML = `
            <div class="fixed inset-0 bg-black/30" aria-hidden="true"></div>
            <div class="fixed inset-0 flex items-center justify-center p-4">
              <div class="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 class="text-lg font-semibold mb-2">Xác nhận hủy đơn hàng</h3>
                <p class="text-sm text-gray-600 mb-4">Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này sẽ hoàn trả số lượng sản phẩm về kho.</p>
                <div class="flex justify-end gap-2">
                  <button class="px-4 py-2 text-sm border rounded hover:bg-gray-100" onclick="this.closest('dialog').close(false)">Hủy</button>
                  <button class="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600" onclick="this.closest('dialog').close(true)">Xác nhận</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(dialog);
          dialog.showModal();
          dialog.addEventListener('close', () => {
            resolve(dialog.returnValue === 'true');
            dialog.remove();
          }, { once: true });
        });

        if (!confirmed) {
          return;
        }
      }

      setIsUpdating(orderId);
      setIsLoading(true);
      setError(null);

      // Nếu đang hủy đơn hàng, gọi API hủy đơn hàng
      if (newStatus === 'cancelled') {
        const response = await fetch('/api/orders/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Lỗi hủy đơn hàng');
        }
      }

      await updateOrderStatus(orderId.toString(), newStatus);
      toast.success(newStatus === 'cancelled' ? 'Đơn hàng đã được hủy thành công' : 'Cập nhật trạng thái đơn hàng thành công');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(null);
      setIsLoading(false);
    }
  };

  // Hàm xử lý xác nhận hủy
  const handleConfirmCancel = async (orderId: number) => {
    try {
      setIsLoading(true);
      await updateOrderStatus(orderId.toString(), 'cancelled');
      toast.success('Đã xác nhận hủy đơn hàng!');
      setConfirmOrder(null);
      router.refresh();
    } catch (err) {
      toast.error('Có lỗi khi xác nhận hủy!');
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý từ chối hủy
  const handleRejectCancel = async (orderId: number) => {
    try {
      setIsLoading(true);
      await updateOrderStatus(orderId.toString(), 'pending');
      toast.success('Đã từ chối yêu cầu hủy đơn hàng!');
      setConfirmOrder(null);
      router.refresh();
    } catch (err) {
      toast.error('Có lỗi khi từ chối yêu cầu hủy!');
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm tạo mã đơn hàng dạng code từ id và ngày tạo
  function getOrderCode(order: Order) {
    return order.slug || order.id;
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Quản lý đơn hàng</h1>
      </div>

      {/* Popup xác nhận hủy đơn hàng */}
      {confirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Xác nhận yêu cầu hủy đơn hàng</h3>
            <p className="mb-4">Khách hàng đã yêu cầu hủy đơn hàng <b>{getOrderCode(confirmOrder)}</b>.<br/>Bạn có muốn xác nhận hủy đơn này không?</p>
            <div className="flex justify-center gap-4 mt-2">
              <button
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100 min-w-[90px] text-black"
                onClick={() => handleConfirmCancel(confirmOrder.id!)}
                disabled={isLoading}
              >Xác nhận</button>
              <button
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100 min-w-[90px] text-black"
                onClick={() => handleRejectCancel(confirmOrder.id!)}
                disabled={isLoading}
              >Từ chối</button>
            </div>
          </div>
        </div>
      )}

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
              <TableCell className="font-semibold">{getOrderCode(order)}</TableCell>
              <TableCell>
                {format(new Date(order.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) =>
                    handleStatusChange(order.id, value)
                  }
                  disabled={isLoading || order.status === 'cancelled'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Chờ xác nhận</SelectItem>
                    <SelectItem value='processing'>Đang xử lý</SelectItem>
                    <SelectItem value='shipped'>Đã gửi hàng</SelectItem>
                    <SelectItem value='delivered'>Đã giao</SelectItem>
                    <SelectItem value='completed'>Đã hoàn thành</SelectItem>
                    <SelectItem value='cancelled' className="text-red-500">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{order.totalPrice.toLocaleString('vi-VN')} ₫</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Chi tiết đơn</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chi tiết đơn hàng {getOrderCode(order)}</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4 bg-gray-50 rounded p-3 text-sm">
                      <div><b>Khách hàng:</b> {order.customer_name || '---'}</div>
                      <div><b>SĐT:</b> {order.customer_phone || '---'}</div>
                      <div><b>Địa chỉ:</b> {order.customer_address || '---'}</div>
                    </div>
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
                            <div className="text-sm text-gray-500">Size: {item.size || '---'}</div>
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