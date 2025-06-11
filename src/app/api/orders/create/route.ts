import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';
import slugify from 'slugify';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { orderItems, totalPrice, userId } = await req.json();

    // Kiểm tra số lượng sản phẩm trước khi tạo đơn hàng
    const checkInventoryResponse = await fetch(`${req.headers.get('origin')}/api/orders/check-inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderItems }),
    });

    if (!checkInventoryResponse.ok) {
      const error = await checkInventoryResponse.json();
      return NextResponse.json(error, { status: checkInventoryResponse.status });
    }

    // Tạo đơn hàng mới
    const orderSlug = slugify(`order-${Date.now()}`, { lower: true });
    const { data: order, error: orderError } = await supabase
      .from('order')
      .insert([
        {
          user: userId,
          totalPrice,
          status: 'Pending',
          slug: orderSlug,
          description: `Order created at ${new Date().toISOString()}`,
        },
      ])
      .select('id')
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: 'Lỗi tạo đơn hàng' },
        { status: 500 }
      );
    }

    // Thêm các sản phẩm vào đơn hàng
    const orderItemsData = orderItems.map((item: any) => ({
      order: order.id,
      product: item.productId,
      quantity: item.quantity,
    }));

    const { error: orderItemsError } = await supabase
      .from('order_item')
      .insert(orderItemsData);

    if (orderItemsError) {
      // Nếu có lỗi, xóa đơn hàng đã tạo
      await supabase.from('order').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Lỗi thêm sản phẩm vào đơn hàng' },
        { status: 500 }
      );
    }

    // Cập nhật số lượng sản phẩm theo size
    for (const item of orderItems as Array<{productId: number, currentQuantity: number, quantity: number, size: number}>) {
      const { error: updateSizeError } = await supabase
        .from('product_size')
        .update({ quantity: item.currentQuantity - item.quantity })
        .eq('product', item.productId)
        .eq('size', item.size);

      if (updateSizeError) {
        // Nếu có lỗi, xóa đơn hàng và các sản phẩm trong đơn hàng
        await supabase.from('order_item').delete().eq('order', order.id);
        await supabase.from('order').delete().eq('id', order.id);
        return NextResponse.json(
          { error: 'Lỗi cập nhật số lượng sản phẩm theo size' },
          { status: 500 }
        );
      }
    }

    // Thêm delay nhỏ để đảm bảo DB đã cập nhật
    await new Promise(res => setTimeout(res, 200));

    // Sau khi đã cập nhật xong tất cả size, lấy lại size mới nhất để cập nhật maxQuantity
    const productIds = [...new Set(orderItems.map((item: any) => Number(item.productId)))];
    for (const productId of productIds) {
      if (typeof productId !== 'number' || isNaN(productId)) continue;
      // Lấy lại size mới nhất từ DB
      const { data: sizes, error: sizeFetchError } = await supabase
        .from('product_size')
        .select('quantity')
        .eq('product', productId);
      if (sizeFetchError) {
        return NextResponse.json(
          { error: 'Lỗi lấy số lượng size để cập nhật maxQuantity' },
          { status: 500 }
        );
      }
      const sizeArr: { quantity: number }[] = Array.isArray(sizes) ? sizes as { quantity: number }[] : [];
      const newMaxQuantity = sizeArr.length > 0
        ? sizeArr.reduce((sum, sz) => sum + (typeof sz.quantity === 'number' ? sz.quantity : 0), 0)
        : 0;
      const { error: updateMaxQuantityError } = await supabase
        .from('product')
        .update({ maxQuantity: newMaxQuantity })
        .eq('id', productId);
      if (updateMaxQuantityError) {
        return NextResponse.json(
          { error: 'Lỗi cập nhật tổng số lượng sản phẩm' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Lỗi tạo đơn hàng' },
      { status: 500 }
    );
  }
} 