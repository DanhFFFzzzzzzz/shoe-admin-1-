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
  const [categoryRevenueData, setCategoryRevenueData] = useState<any[]>([]);
  const [categoryRevenueKeys, setCategoryRevenueKeys] = useState<string[]>([]);
  const [loadingCategoryRevenue, setLoadingCategoryRevenue] = useState(false);

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
          chartData = Object.entries(data.byMonth || {}).map(([name, revenue]) => ({
            name,
            revenue,
            quantity: data.quantityByMonth?.[name] || 0
          }));
        } else if (period === 'quarter') {
          chartData = Object.entries(data.byQuarter || {}).map(([name, revenue]) => ({
            name,
            revenue,
            quantity: data.quantityByQuarter?.[name] || 0
          }));
        } else {
          chartData = Object.entries(data.byYear || {}).map(([name, revenue]) => ({
            name,
            revenue,
            quantity: data.quantityByYear?.[name] || 0
          }));
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

  // Fetch doanh thu nhóm theo danh mục
  useEffect(() => {
    setLoadingCategoryRevenue(true);
    fetch('/api/statistics/category-revenue')
      .then(res => res.json())
      .then(data => {
        // Dữ liệu trả về: { categoryRevenue: { [categoryName]: { products: [{ name, total, quantity }] } } }
        const categoryRevenue = data.categoryRevenue || {};
        // Lấy tất cả tên sản phẩm duy nhất
        const allProductNames = Array.from(new Set(
          Object.values(categoryRevenue).flatMap((cat: any) => cat.products.map((p: any) => p.name))
        ));
        // Lấy tất cả tên danh mục
        const allCategoryNames = Object.keys(categoryRevenue);
        // Chuẩn hóa dữ liệu cho grouped bar chart
        const chartData = allProductNames.map(productName => {
          const row: any = { name: productName };
          allCategoryNames.forEach(categoryName => {
            const found = categoryRevenue[categoryName].products.find((p: any) => p.name === productName);
            row[categoryName] = found ? found.total : 0;
            row[categoryName + '_quantity'] = found ? found.quantity : 0;
          });
          return row;
        });
        setCategoryRevenueData(chartData);
        setCategoryRevenueKeys(allCategoryNames);
      })
      .finally(() => setLoadingCategoryRevenue(false));
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
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded shadow text-gray-800 border border-blue-200 min-w-[180px]">
                        <div className="font-bold mb-1">{label}</div>
                        {payload.map((entry, idx) => {
                          const cat = entry.name;
                          const value = typeof entry.value === 'number' ? entry.value : 0;
                          const quantity = data && (data.quantity ?? 0);
                          return (
                            <div key={cat} style={{ color: entry.color }}>
                              <span>{cat} : {value.toLocaleString('vi-VN')} ₫</span>
                              <br />
                              <span style={{ fontSize: 13, color: '#666' }}>Đã bán: {quantity} sản phẩm</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }} />
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
      {/* Biểu đồ cột nhóm doanh thu sản phẩm theo danh mục */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Doanh thu sản phẩm theo danh mục</h2>
        <div className="w-full h-[480px] bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
          {loadingCategoryRevenue ? (
            <span className="text-green-400 text-xl font-bold">Đang tải dữ liệu...</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryRevenueData} margin={{ top: 40, right: 30, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={70} />
                <YAxis width={84} tickFormatter={(v: number) => v.toLocaleString('vi-VN') + ' ₫'} />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded shadow text-gray-800 border border-blue-200 min-w-[180px]">
                        <div className="font-bold mb-1">{label}</div>
                        {payload.map((entry, idx) => {
                          const cat = entry.name;
                          const value = typeof entry.value === 'number' ? entry.value : 0;
                          const quantity = data && data[cat + '_quantity'] ? data[cat + '_quantity'] : 0;
                          return (
                            <div key={cat} style={{ color: entry.color }}>
                              <span>{cat} : {value.toLocaleString('vi-VN')} ₫</span>
                              <br />
                              <span style={{ fontSize: 13, color: '#666' }}>Đã bán: {quantity} sản phẩm</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend />
                {categoryRevenueKeys.map((cat, idx) => (
                  <Bar key={cat} dataKey={cat} name={cat} fill={['#3b82f6', '#ec4899', '#f59e42', '#10b981', '#a78bfa', '#f43f5e', '#fbbf24'][idx % 7]}>
                    <LabelList dataKey={cat} position="top" formatter={(v: number) => v > 0 ? v.toLocaleString('vi-VN') + ' ₫' : ''} offset={10} dx={20} textAnchor="middle" fontSize={13} />
                </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
} 