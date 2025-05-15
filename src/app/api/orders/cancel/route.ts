import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { orderId } = await req.json();

    // Lấy thông tin các sản phẩm trong đơn hàng
    const { data: orderItems, error: fetchError } = await supabase
      .from('order_item')
      .select('product, quantity')
      .eq('order', orderId);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Không thể lấy thông tin đơn hàng' },
        { status: 400 }
      );
    }

    // Hoàn trả số lượng sản phẩm
    for (const item of orderItems) {
      // Lấy thông tin size của sản phẩm
      const { data: productSize, error: sizeError } = await supabase
        .from('product_size')
        .select('quantity, size')
        .eq('product', item.product)
        .order('quantity', { ascending: false })
        .limit(1)
        .single();

      if (sizeError) {
        return NextResponse.json(
          { error: 'Không tìm thấy thông tin size sản phẩm' },
          { status: 400 }
        );
      }

      // Cập nhật số lượng theo size
      const { error: updateSizeError } = await supabase
        .from('product_size')
        .update({ quantity: productSize.quantity + item.quantity })
        .eq('product', item.product)
        .eq('size', productSize.size);

      if (updateSizeError) {
        return NextResponse.json(
          { error: 'Lỗi cập nhật số lượng sản phẩm theo size' },
          { status: 500 }
        );
      }

      // Cập nhật tổng số lượng sản phẩm
      const { data: product, error: productError } = await supabase
        .from('product')
        .select('maxQuantity')
        .eq('id', item.product)
        .single();

      if (productError) {
        return NextResponse.json(
          { error: 'Không tìm thấy thông tin sản phẩm' },
          { status: 400 }
        );
      }

      const { error: updateMaxQuantityError } = await supabase
        .from('product')
        .update({ maxQuantity: product.maxQuantity + item.quantity })
        .eq('id', item.product);

      if (updateMaxQuantityError) {
        return NextResponse.json(
          { error: 'Lỗi cập nhật tổng số lượng sản phẩm' },
          { status: 500 }
        );
      }
    }

    // Xóa các sản phẩm trong đơn hàng
    const { error: deleteItemsError } = await supabase
      .from('order_item')
      .delete()
      .eq('order', orderId);

    if (deleteItemsError) {
      return NextResponse.json(
        { error: 'Lỗi xóa sản phẩm trong đơn hàng' },
        { status: 500 }
      );
    }

    // Xóa đơn hàng
    const { error: deleteOrderError } = await supabase
      .from('order')
      .delete()
      .eq('id', orderId);

    if (deleteOrderError) {
      return NextResponse.json(
        { error: 'Lỗi xóa đơn hàng' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling order:', error);
    return NextResponse.json(
      { error: 'Lỗi hủy đơn hàng' },
      { status: 500 }
    );
  }
} 