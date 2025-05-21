'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [year, setYear] = useState(2024);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-between">
      {/* Banner */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-24 py-16 bg-white/90 shadow-lg">
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-2 text-blue-800 drop-shadow-xl" style={{textShadow: '2px 4px 16px #b6c7e6'}}>Khám phá thế giới <span className="text-yellow-400">giày dép</span> thời thượng</h1>
          <p className="text-lg md:text-2xl font-medium mb-4 max-w-xl text-blue-700 drop-shadow">Mang đến cho bạn những mẫu giày dép mới nhất, chất lượng nhất với giá cả hợp lý. Phong cách - Năng động - Cá tính!</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 px-10 py-4 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-extrabold rounded-full shadow-2xl text-xl transition-all duration-200 w-fit border-2 border-yellow-300"
          >
            Đến trang Quản trị
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center mt-10 md:mt-0">
          <span style={{ fontSize: 220, display: 'block', lineHeight: 1, filter: 'drop-shadow(0 8px 32px #b6c7e6)' }}>👟</span>
        </div>
      </section>

      {/* Section giới thiệu */}
      <section className="w-full max-w-5xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-blue-400">
          <span style={{ fontSize: 64, marginBottom: 8 }}>👟</span>
          <h3 className="font-bold text-xl mt-4 mb-2 text-blue-700">Sản phẩm chất lượng</h3>
          <p className="text-gray-600">Chỉ bán các mẫu giày dép chính hãng, kiểm định kỹ càng trước khi giao đến tay khách hàng.</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-yellow-300">
          <span style={{ fontSize: 64, marginBottom: 8 }}>🚚</span>
          <h3 className="font-bold text-xl mt-4 mb-2 text-yellow-500">Giao hàng siêu tốc</h3>
          <p className="text-gray-600">Nhận hàng trong 1-3 ngày trên toàn quốc. Đổi trả dễ dàng trong 7 ngày.</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-pink-400">
          <span style={{ fontSize: 64, marginBottom: 8 }}>🎁</span>
          <h3 className="font-bold text-xl mt-4 mb-2 text-pink-500">Ưu đãi hấp dẫn</h3>
          <p className="text-gray-600">Nhiều chương trình giảm giá, tích điểm thành viên và quà tặng mỗi tháng.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-blue-900 text-white text-center text-sm mt-auto">
        © {year} Shoe Store. All rights reserved.
      </footer>
    </main>
  );
}
