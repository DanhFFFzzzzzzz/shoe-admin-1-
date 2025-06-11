import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function POST(request: Request) {
  try {
    console.log('--- Nhận request xóa đơn hàng ---');
    const { id, slug } = await request.json();
    console.log('Dữ liệu đầu vào:', { id, slug });
    
    // Kiểm tra đầu vào
    if (!id && !slug) {
      console.error('Thiếu id hoặc slug');
      return NextResponse.json(
        { error: 'Vui lòng cung cấp mã đơn hàng hoặc slug' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    console.log('Tạo client Supabase thành công');

    // Lấy thông tin đơn hàng
    let query = supabase.from('order').select('*');
    if (id) {
      query = query.eq('id', id);
    } else if (slug) {
      query = query.eq('slug', slug);
    }
    
    const { data: orderData, error: orderQueryError } = await query.single();
    console.log('Kết quả truy vấn đơn hàng:', { orderData, orderQueryError });

    // Nếu không tìm thấy đơn hàng trong Supabase
    if (!orderData) {
      // Kiểm tra xem có phải là đơn hàng chưa được đồng bộ không
      if (orderQueryError?.code === 'PGRST116') {
        console.warn('Đơn hàng đã được xóa hoặc chưa được tạo thành công');
        return NextResponse.json({ 
          success: true,
          message: 'Đơn hàng đã được xóa hoặc chưa được tạo thành công'
        });
      }
      
      console.error('Không tìm thấy đơn hàng');
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng' },
        { status: 404 }
      );
    }

    // Kiểm tra trạng thái đơn hàng
    if (orderData.status === 'completed') {
      console.warn('Không thể xóa đơn hàng đã hoàn thành');
      return NextResponse.json(
        { error: 'Không thể xóa đơn hàng đã hoàn thành' },
        { status: 400 }
      );
    }

    try {
      // Xóa chi tiết đơn hàng trước (dùng order_id)
      console.log('Thực hiện xóa order_item với order_id:', Number(orderData.id));
      const { error: itemError } = await supabase
        .from('order_item')
        .delete()
        .eq('order_id', Number(orderData.id));
      console.log('Kết quả xóa order_item:', { itemError });

      if (itemError) {
        console.error('Lỗi khi xóa chi tiết đơn hàng:', itemError);
        return NextResponse.json(
          { error: 'Không thể xóa chi tiết đơn hàng. Vui lòng thử lại sau.', details: itemError },
          { status: 500 }
        );
      }

      // Xóa đơn hàng (truyền đúng kiểu số)
      console.log('Thực hiện xóa order với id:', Number(orderData.id));
      const { error: orderError } = await supabase
        .from('order')
        .delete()
        .eq('id', Number(orderData.id));
      console.log('Kết quả xóa order:', { orderError });

      if (orderError) {
        console.error('Lỗi khi xóa đơn hàng:', orderError);
        return NextResponse.json(
          { error: 'Không thể xóa đơn hàng. Vui lòng thử lại sau.', details: orderError },
          { status: 500 }
        );
      }

      console.log('Xóa đơn hàng thành công');
      return NextResponse.json({ 
        success: true,
        message: 'Xóa đơn hàng thành công'
      });
    } catch (deleteError) {
      console.error('Lỗi khi thực hiện xóa:', deleteError);
      return NextResponse.json(
        { error: 'Đã xảy ra lỗi khi xóa đơn hàng. Vui lòng thử lại sau.', details: deleteError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Lỗi không xác định khi xóa đơn hàng:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.', details: error },
      { status: 500 }
    );
  }
} 