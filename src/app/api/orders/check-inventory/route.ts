import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { orderItems } = await req.json();

    // Kiểm tra số lượng cho từng sản phẩm và size
    for (const item of orderItems) {
      const { data: productSize, error: sizeError } = await supabase
        .from('product_size')
        .select('quantity')
        .eq('product', item.productId)
        .eq('size', item.size)
        .single();

      if (sizeError) {
        return NextResponse.json(
          { error: 'Không tìm thấy thông tin size sản phẩm' },
          { status: 400 }
        );
      }

      if (!productSize || productSize.quantity < item.quantity) {
        return NextResponse.json(
          { error: 'Số lượng sản phẩm không đủ trong kho' },
          { status: 400 }
        );
      }

      // Lấy thông tin tổng số lượng sản phẩm
      const { data: product, error: productError } = await supabase
        .from('product')
        .select('maxQuantity')
        .eq('id', item.productId)
        .single();

      if (productError) {
        return NextResponse.json(
          { error: 'Không tìm thấy thông tin sản phẩm' },
          { status: 400 }
        );
      }

      if (product.maxQuantity < item.quantity) {
        return NextResponse.json(
          { error: 'Tổng số lượng sản phẩm không đủ trong kho' },
          { status: 400 }
        );
      }

      // Thêm thông tin số lượng hiện tại vào response
      item.currentQuantity = productSize.quantity;
      item.currentMaxQuantity = product.maxQuantity;
    }

    return NextResponse.json({ orderItems });
  } catch (error) {
    console.error('Error checking inventory:', error);
    return NextResponse.json(
      { error: 'Lỗi kiểm tra kho hàng' },
      { status: 500 }
    );
  }
} 