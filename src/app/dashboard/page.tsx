"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// Warna elegan untuk Pie Chart
const COLORS = ['#c2aa6b', '#567261', '#123524', '#e9ece6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    totalTransaksi: 0, totalPendapatan: 0, totalItemTerjual: 0,
    grafikPenjualan: [], trendPendapatan: [], grafikMetode: [], transaksiTerbaru: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) setStats(await response.json());
      } catch (error) {
        console.error("Gagal memuat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Menyiapkan Dashboard Enterprise...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <h1 className="text-3xl font-extrabold text-[#061e12] mb-2">Dashboard Analytics</h1>
      <p className="text-gray-500 font-medium mb-8">Pantau peforma bisnis Jus Alif Anda secara real-time.</p>

      {/* 1. KOTAK RINGKASAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Total Transaksi</p><h2 className="text-4xl font-black text-[#061e12]">{stats.totalTransaksi}</h2></div>
          <div className="w-12 h-12 bg-[#e9ece6] rounded-full flex items-center justify-center text-[#567261] text-xl font-black">🧾</div>
        </div>
        <div className="bg-gradient-to-br from-[#123524] to-[#061e12] rounded-2xl p-6 shadow-lg border border-[#163d27] flex items-center justify-between text-white transform hover:scale-[1.02] transition">
          <div><p className="text-xs text-[#c2aa6b] font-bold mb-1 uppercase tracking-wider">Total Pendapatan</p><h2 className="text-3xl lg:text-4xl font-black">Rp{Number(stats.totalPendapatan).toLocaleString('id-ID')}</h2></div>
          <div className="w-12 h-12 bg-[#2a4d3c] rounded-full flex items-center justify-center text-[#c2aa6b] text-xl font-black">💰</div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Jus Terjual</p><h2 className="text-4xl font-black text-[#061e12]">{stats.totalItemTerjual} <span className="text-lg">Cup</span></h2></div>
          <div className="w-12 h-12 bg-[#e9ece6] rounded-full flex items-center justify-center text-[#567261] text-xl font-black">🥤</div>
        </div>
      </div>

      {/* 2. ROW GRAFIK UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Trend Garis (Lebar 2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-extrabold text-lg mb-6 text-[#061e12]">📈 Tren Pendapatan</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendPendapatan} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} tickFormatter={(value) => `Rp${value/1000}k`} />
                <RechartsTooltip cursor={{stroke: '#e5e7eb', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                <Line type="monotone" dataKey="total" stroke="#567261" strokeWidth={4} dot={{ r: 4, fill: '#c2aa6b', strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Metode Bayar (1 Kolom) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="font-extrabold text-lg mb-2 text-[#061e12] w-full text-left">💳 Metode Pembayaran</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.grafikMetode} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {stats.grafikMetode.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontWeight: 'bold', fontSize: '12px'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. ROW GRAFIK BAR & TABEL TRANSAKSI TERBARU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart (Menu Terlaris) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-extrabold text-lg mb-6 text-[#061e12]">🏆 Top 5 Menu Terlaris</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.grafikPenjualan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total" name="Cup Terjual" fill="#c2aa6b" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabel Transaksi Terakhir */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-[#061e12]">🕒 Transaksi Terbaru</h3>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">Live</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Kode</th>
                  <th className="px-6 py-4 font-bold">Pelanggan</th>
                  <th className="px-6 py-4 font-bold">Total</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.transaksiTerbaru.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-bold">Belum ada transaksi hari ini.</td></tr>
                ) : (
                  stats.transaksiTerbaru.map((trx: any) => (
                    <tr key={trx.id_transaksi} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-xs text-gray-500">{trx.kode_transaksi}</td>
                      <td className="px-6 py-4 font-bold text-sm text-[#061e12]">{trx.nama_pelanggan}</td>
                      <td className="px-6 py-4 font-black text-[#567261]">Rp{Number(trx.total_harga).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">
                        <span className="bg-[#e9ece6] text-[#061e12] text-[10px] font-black px-2 py-1 rounded-md">{trx.metode_pembayaran}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}