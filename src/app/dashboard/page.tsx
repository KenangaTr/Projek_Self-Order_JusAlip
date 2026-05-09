"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#c2aa6b', '#567261', '#123524', '#e9ece6'];

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState('30days');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'transactions' | 'items'>('revenue');

  const [searchQuery, setSearchQuery] = useState('');

  // === STATE BARU UNTUK MODAL KONFIRMASI HAPUS ===
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [stats, setStats] = useState<any>({
    totalTransaksi: 0, totalPendapatan: 0, totalItemTerjual: 0,
    grafikPenjualan: [], trendPendapatan: [], grafikMetode: [], transaksiTerbaru: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/'; 
      }
    } catch (error) {
      console.error("Logout gagal:", error);
      alert("Terjadi kesalahan saat logout.");
    }
  };
  
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/dashboard?filter=${timeFilter}`);
        if (response.ok) setStats(await response.json());
      } catch (error) {
        console.error("Gagal memuat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSilentData = async () => {
      try {
        const response = await fetch(`/api/dashboard?filter=${timeFilter}`);
        if (response.ok) {
          const newData = await response.json();
          setStats(newData);
        }
      } catch (error) {
        console.error("Gagal update real-time:", error);
      }
    };

    fetchInitialData();
    const intervalId = setInterval(fetchSilentData, 3000);
    return () => clearInterval(intervalId);
  }, [timeFilter]);

  // === FUNGSI EKSEKUSI HAPUS (DIPANGGIL DARI DALAM MODAL) ===
  const executeDelete = async () => {
    if (transactionToDelete === null) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/transactions/${transactionToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Hapus dari tampilan secara instan 
        setStats((prev: any) => ({
          ...prev,
          transaksiTerbaru: prev.transaksiTerbaru.filter((trx: any) => trx.id_transaksi !== transactionToDelete)
        }));
        setTransactionToDelete(null); // Tutup modal setelah sukses
      } else {
        alert("Gagal menghapus transaksi.");
      }
    } catch (error) {
      console.error("Error menghapus:", error);
      alert("Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDateRangeLabel = () => {
    const now = new Date();
    const optionsFull: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const optionsShort: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

    if (timeFilter === 'today') return now.toLocaleDateString('id-ID', optionsFull);
    if (timeFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return yesterday.toLocaleDateString('id-ID', optionsFull);
    }
    if (timeFilter === '7days') {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      return `${start.toLocaleDateString('id-ID', optionsShort)} - ${now.toLocaleDateString('id-ID', optionsFull)}`;
    }
    if (timeFilter === '30days') {
      const start = new Date();
      start.setDate(now.getDate() - 29);
      return `${start.toLocaleDateString('id-ID', optionsShort)} - ${now.toLocaleDateString('id-ID', optionsFull)}`;
    }
    return '';
  };

  const chartConfig = {
    revenue: {
      title: "📈 Tren Pendapatan",
      dataKey: "total", 
      color: "#567261",
      formatter: (val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Pendapatan'],
      yAxisFormatter: (val: any) => `Rp${val/1000}k`
    },
    transactions: {
      title: "📉 Tren Total Transaksi",
      dataKey: "transactions", 
      color: "#c2aa6b",
      formatter: (val: any) => [`${val} Transaksi`, 'Total Transaksi'],
      yAxisFormatter: (val: any) => val
    },
    items: {
      title: "📊 Tren Jus Terjual",
      dataKey: "items", 
      color: "#b54a4a",
      formatter: (val: any) => [`${val} Cup`, 'Jus Terjual'],
      yAxisFormatter: (val: any) => val
    }
  };

  const activeChart = chartConfig[activeMetric];

  const filteredTransactions = stats.transaksiTerbaru.filter((trx: any) => 
    trx.kode_transaksi.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (trx.nama_pelanggan && trx.nama_pelanggan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading && stats.totalTransaksi === 0) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Menyiapkan Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#061e12] mb-2">Dashboard Analytics</h1>
          <p className="text-gray-500 font-medium">Pantau performa bisnis Jus Alif Anda secara real-time.</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <div 
          onClick={() => setActiveMetric('transactions')}
          className={`rounded-2xl p-6 shadow-sm border cursor-pointer transition transform hover:scale-[1.02] ${activeMetric === 'transactions' ? 'bg-[#123524] border-[#163d27] text-white shadow-lg' : 'bg-white border-gray-100 text-[#061e12]'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-bold mb-1 uppercase tracking-wider ${activeMetric === 'transactions' ? 'text-[#c2aa6b]' : 'text-gray-400'}`}>Total Transaksi</p>
              <h2 className={`text-4xl font-black ${activeMetric === 'transactions' ? 'text-white' : 'text-[#061e12]'}`}>{stats.totalTransaksi}</h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${activeMetric === 'transactions' ? 'bg-[#2a4d3c] text-[#c2aa6b]' : 'bg-[#e9ece6] text-[#567261]'}`}>🧾</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveMetric('revenue')}
          className={`rounded-2xl p-6 shadow-sm border cursor-pointer transition transform hover:scale-[1.02] ${activeMetric === 'revenue' ? 'bg-[#123524] border-[#163d27] text-white shadow-lg' : 'bg-white border-gray-100 text-[#061e12]'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-bold mb-1 uppercase tracking-wider ${activeMetric === 'revenue' ? 'text-[#c2aa6b]' : 'text-gray-400'}`}>Total Pendapatan</p>
              <h2 className={`text-3xl lg:text-4xl font-black ${activeMetric === 'revenue' ? 'text-white' : 'text-[#061e12]'}`}>Rp{Number(stats.totalPendapatan).toLocaleString('id-ID')}</h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${activeMetric === 'revenue' ? 'bg-[#2a4d3c] text-[#c2aa6b]' : 'bg-[#e9ece6] text-[#567261]'}`}>💰</div>
          </div>
        </div>

        <div 
          onClick={() => setActiveMetric('items')}
          className={`rounded-2xl p-6 shadow-sm border cursor-pointer transition transform hover:scale-[1.02] ${activeMetric === 'items' ? 'bg-[#123524] border-[#163d27] text-white shadow-lg' : 'bg-white border-gray-100 text-[#061e12]'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-bold mb-1 uppercase tracking-wider ${activeMetric === 'items' ? 'text-[#c2aa6b]' : 'text-gray-400'}`}>Jus Terjual</p>
              <h2 className={`text-4xl font-black ${activeMetric === 'items' ? 'text-white' : 'text-[#061e12]'}`}>{stats.totalItemTerjual} <span className="text-lg">Cup</span></h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${activeMetric === 'items' ? 'bg-[#2a4d3c] text-[#c2aa6b]' : 'bg-[#e9ece6] text-[#567261]'}`}>🥤</div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-[#061e12] transition-colors">{activeChart.title}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {getDateRangeLabel()}
              </p>
            </div>
            <div className="flex bg-[#e9ece6] p-1 rounded-lg">
              <button onClick={() => setTimeFilter('today')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${timeFilter === 'today' ? 'bg-white shadow-sm text-[#061e12]' : 'text-gray-500 hover:text-[#061e12]'}`}>Hari Ini</button>
              <button onClick={() => setTimeFilter('yesterday')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${timeFilter === 'yesterday' ? 'bg-white shadow-sm text-[#061e12]' : 'text-gray-500 hover:text-[#061e12]'}`}>Kemarin</button>
              <button onClick={() => setTimeFilter('7days')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${timeFilter === '7days' ? 'bg-white shadow-sm text-[#061e12]' : 'text-gray-500 hover:text-[#061e12]'}`}>7 Hari</button>
              <button onClick={() => setTimeFilter('30days')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${timeFilter === '30days' ? 'bg-white shadow-sm text-[#061e12]' : 'text-gray-500 hover:text-[#061e12]'}`}>30 Hari</button>
            </div>
          </div>

          <div className="p-6 flex-1 min-h-[300px]">
            {stats.trendPendapatan.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trendPendapatan} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} tickFormatter={activeChart.yAxisFormatter} />
                  <RechartsTooltip 
                    cursor={{stroke: '#e5e7eb', strokeWidth: 2}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                    formatter={activeChart.formatter}
                    labelFormatter={(label) => {
                      if (timeFilter === 'today') return `Hari Ini, Pukul ${label}`;
                      if (timeFilter === 'yesterday') return `Kemarin, Pukul ${label}`;
                      return `Tanggal: ${label}`;
                    }}
                  />
                  <Line type="monotone" dataKey={activeChart.dataKey} stroke={activeChart.color} strokeWidth={4} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 8, fill: activeChart.color }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">Tidak ada data.</div>
            )}
          </div>
        </div>

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

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-extrabold text-lg mb-6 text-[#061e12]">🏆 Top Menu Terlaris</h3>
          <div className="flex-1 min-h-[300px]">
             {stats.grafikPenjualan.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.grafikPenjualan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="total" name="Cup Terjual" fill="#c2aa6b" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">Data kosong.</div>
             )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-lg text-[#061e12]">🕒 Transaksi Terbaru</h3>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">Live</span>
            </div>
            <input 
              type="text" 
              placeholder="🔍 Cari Kode TRX / Nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-4 py-2 outline-none focus:border-[#c2aa6b] focus:ring-1 focus:ring-[#c2aa6b] transition w-full sm:w-64 font-medium text-[#061e12]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Waktu</th>
                  <th className="px-6 py-4 font-bold">Kode & Nama</th>
                  <th className="px-6 py-4 font-bold">Total</th>
                  <th className="px-6 py-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 font-bold">Tidak ada transaksi ditemukan.</td></tr>
                ) : (
                  filteredTransactions.map((trx: any) => (
                    <tr key={trx.id_transaksi} className="hover:bg-gray-50 transition group">
                      
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-[#061e12]">
                          {new Date(trx.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1">
                          {new Date(trx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-black text-xs text-[#c2aa6b] mb-1">{trx.kode_transaksi}</div>
                        <div className="font-bold text-sm text-[#061e12]">{trx.nama_pelanggan || "Pelanggan"}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-black text-[#567261]">Rp{Number(trx.total_harga).toLocaleString('id-ID')}</div>
                        <div className="bg-[#e9ece6] text-[#061e12] text-[9px] font-black px-2 py-0.5 rounded uppercase w-max mt-1">
                          {trx.metode_pembayaran}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button 
                          // KETIKA DIKLIK, MUNCULKAN MODAL
                          onClick={() => setTransactionToDelete(trx.id_transaksi)}
                          className="text-red-400 bg-red-50 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                          title="Hapus Transaksi"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === MODAL KONFIRMASI HAPUS (MUNCUL JIKA ADA TRANSAKSI YANG DIPILIH) === */}
      {transactionToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[scale-up_0.2s_ease-out]">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-black text-center text-[#061e12] mb-3">Batalkan Transaksi?</h3>
            <p className="text-center text-gray-500 text-sm font-medium mb-8 leading-relaxed">
              Anda yakin ingin menghapus transaksi ini? Data pada laporan pendapatan dan jumlah cup terjual akan otomatis dikurangi. <br/> <strong className="text-red-500">Tindakan ini tidak bisa dibatalkan.</strong>
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                disabled={isDeleting}
              >
                Kembali
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 bg-[#b54a4a] text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/20"
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}