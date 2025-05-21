"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function StatisticsPage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [bestSellerData, setBestSellerData] = useState<any[]>([]);
  const [loadingBestSeller, setLoadingBestSeller] = useState(false);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);

  // Map trạng thái đơn hàng sang tiếng Việt
  const statusViMap: Record<string, string> = {
    Pending: 'Chờ xác nhận',
    pending: 'Chờ xác nhận',
    Shipped: 'Đã gửi hàng',
    shipped: 'Đã gửi hàng',
    Completed: 'Đã hoàn thành',
    completed: 'Đã hoàn thành',
    Cancelled: 'Đã hủy',
    cancelled: 'Đã hủy',
    Processing: 'Đang xử lý',
    processing: 'Đang xử lý',
    Delivered: 'Đã giao',
    delivered: 'Đã giao',
    InTransit: 'Đang vận chuyển',
    intransit: 'Đang vận chuyển',
    Unknown: 'Không xác định',
  };

  // Map trạng thái đơn hàng sang màu sắc riêng biệt
  const statusColorMap: Record<string, string> = {
    'Chờ xác nhận': '#FFD600',      // Vàng
    'Đang xử lý': '#FF9800',        // Cam
    'Đã gửi hàng': '#2979FF',       // Xanh dương
    'Đã giao': '#00C853',           // Xanh lá
    'Đã hủy': '#D50000',            // Đỏ
    'Đã hoàn thành': '#8E24AA',     // Tím
    'Đang vận chuyển': '#00B8D4',   // Xanh ngọc
    'Không xác định': '#BDBDBD',    // Xám
  };

  // Fetch doanh thu
  useEffect(() => {
    setLoadingRevenue(true);
    fetch('/api/statistics/revenue')
      .then(res => res.json())
      .then(data => {
        let chartData = [];
        if (period === 'month') {
          chartData = Object.entries(data.byMonth || {}).map(([name, revenue]) => ({ name, revenue }));
        } else if (period === 'quarter') {
          chartData = Object.entries(data.byQuarter || {}).map(([name, revenue]) => ({ name, revenue }));
        } else {
          chartData = Object.entries(data.byYear || {}).map(([name, revenue]) => ({ name, revenue }));
        }
        setRevenueData(chartData);
        // Đơn hàng theo trạng thái - Gộp các trạng thái cùng nghĩa
        const statusCount: Record<string, number> = {};
        Object.entries(data.ordersByStatus || {}).forEach(([name, value]) => {
          const viName = statusViMap[name] || name;
          statusCount[viName] = (statusCount[viName] || 0) + Number(value);
        });
        setOrdersByStatus(
          Object.entries(statusCount).map(([name, value]) => ({ name, value }))
        );
      })
      .finally(() => setLoadingRevenue(false));
  }, [period]);

  // Fetch sản phẩm bán chạy
  useEffect(() => {
    setLoadingBestSeller(true);
    fetch('/api/statistics/category-revenue')
      .then(res => res.json())
      .then(data => {
        // Lấy top sản phẩm bán chạy nhất (theo quantity)
        const arr = Object.entries(data.productRevenue || {}).map(([name, v]: any) => ({ name, sold: v.quantity }));
        setBestSellerData(arr.sort((a, b) => b.sold - a.sold));
      })
      .finally(() => setLoadingBestSeller(false));
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Thống kê & Biểu đồ</h1>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-blue-600">Tổng doanh thu</h2>
          <select
            className="border rounded px-2 py-1 text-base"
            value={period}
            onChange={e => setPeriod(e.target.value as any)}
          >
            <option value="month">Theo tháng</option>
            <option value="quarter">Theo quý</option>
            <option value="year">Theo năm</option>
          </select>
        </div>
        <div className="w-full h-72 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-8">
          {loadingRevenue ? (
            <span className="text-blue-400 text-xl font-bold">Đang tải dữ liệu...</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v: number) => v.toLocaleString('vi-VN') + ' ₫'} width={100} />
                <Tooltip formatter={(v: number) => v.toLocaleString('vi-VN') + ' ₫'} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu">
                  <LabelList dataKey="revenue" position="top" formatter={(v: number) => v.toLocaleString('vi-VN') + ' ₫'} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* PieChart đơn hàng theo trạng thái */}
        <div className="w-full flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="w-full md:w-1/2 h-80 flex items-center justify-center">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">Đơn hàng theo trạng thái</h2>
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {ordersByStatus.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={statusColorMap[entry.name] || '#BDBDBD'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Legend formatter={(value) => statusViMap[value as string] || value} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-blue-400">Không có dữ liệu</span>
            )}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Sản phẩm bán chạy</h2>
        <div className="w-full h-72 bg-gradient-to-r from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
          {loadingBestSeller ? (
            <span className="text-pink-400 text-xl font-bold">Đang tải dữ liệu...</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellerData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { name, sold } = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded shadow text-pink-600 border border-pink-200">
                        <div className="font-bold">{name}</div>
                        <div>Số lượng bán: <span className="font-semibold">{sold}</span></div>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend />
                <Bar dataKey="sold" fill="#ec4899" name="Số lượng bán">
                  <LabelList dataKey="sold" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
} 