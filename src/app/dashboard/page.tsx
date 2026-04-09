export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-[#061e12] mb-8">Dashboard</h1>

      {/* 3 KOTAK RINGKASAN (SUMMARY CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-bold mb-1">Total Customers</p>
            <h2 className="text-4xl font-black text-[#061e12]">571</h2>
          </div>
          <div className="text-green-500 text-3xl font-black">↗</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-bold mb-1">Total Pemasukan</p>
            {/* Kita pakai Dollar dulu sesuai desain Figma Anda, nanti bisa diganti Rp */}
            <h2 className="text-4xl font-black text-[#061e12]">$1.922</h2> 
          </div>
          <div className="text-green-500 text-3xl font-black">↗</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-bold mb-1">Total Order</p>
            <h2 className="text-4xl font-black text-[#061e12]">720</h2>
          </div>
          <div className="text-green-500 text-3xl font-black">↗</div>
        </div>

      </div>

      {/* KOTAK GRAFIK (PLACEHOLDER) */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
        <h3 className="font-extrabold text-xl mb-6 text-center">Grafik Penjualan</h3>
        
        {/* Nanti di tahap selanjutnya kita akan menginstal Recharts atau Chart.js untuk menggantikan kotak abu-abu ini */}
        <div className="w-full flex-1 border-4 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-bold text-center p-4">
          [ Area Grafik Bar & Pie Chart ] <br/>
          (Akan diintegrasikan menggunakan library Charting nanti)
        </div>
      </div>

    </div>
  );
}