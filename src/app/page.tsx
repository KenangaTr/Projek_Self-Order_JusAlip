"use client";

import Link from 'next/link';
import { useState } from 'react';

// Data sementara (Dummy Data)
const DUMMY_PRODUCTS = [
  { id: 1, name: 'Watermelon Jus', price: 15000 },
  { id: 2, name: 'Avocado Jus', price: 15000 },
  { id: 3, name: 'Mango Jus', price: 15000 },
  { id: 4, name: 'Orange Jus', price: 15000 },
  { id: 5, name: 'Guava Jus', price: 15000 },
];

export default function KioskPage() {
  // === STATE MANAGEMENT ===
  const [cart, setCart] = useState<Record<number, number>>({});
  
  // Mengatur tampilan Modal: 'closed' | 'detail' | 'qris'
  const [modalView, setModalView] = useState<'closed' | 'detail' | 'qris'>('closed');
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Status jika QRIS berhasil dibayar
  
  // Data Pelanggan
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // === LOGIKA CART ===
  const handleAdd = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemove = (id: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = DUMMY_PRODUCTS.find(p => p.id === Number(id));
    return total + (product ? product.price * qty : 0);
  }, 0);

  // === LOGIKA PEMBAYARAN ===
  const handleProceedToQRIS = () => {
    if (!customerPhone.trim()) {
      setShowPhoneError(true);
      return;
    }
    setShowPhoneError(false);
    setModalView('qris'); // Pindah ke halaman QRIS
  };

  const handleSimulatePaymentSuccess = () => {
    // Fungsi ini menyimulasikan webhook dari Midtrans yang menyatakan pelanggan sudah transfer
    setPaymentSuccess(true);
  };

  const handleFinishTransaction = () => {
    // Reset seluruh state kembali ke awal (kosongkan keranjang & tutup modal)
    setCart({});
    setCustomerName("");
    setCustomerPhone("");
    setPaymentSuccess(false);
    setModalView('closed');
    alert("Proses Print Struk Kasir & Dapur Berjalan Disini... (Tahap Integrasi Hardware)");
  };

  // === TAMPILAN ANTARMUKA ===
  return (
    <main className="min-h-screen flex flex-col items-center pb-32">
      {/* 1. NAVBAR */}
      <nav className="w-full max-w-7xl px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-12 bg-white rounded-md flex items-center justify-center text-[#061e12] font-bold text-xs text-center">Jus<br/>Alif</div>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-200">
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <Link href="#products" className="hover:text-white transition">Products</Link>
          <Link href="#about" className="hover:text-white transition">About Us</Link>
          <Link href="/login" className="hover:text-white transition">Login</Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="w-full max-w-7xl px-8 mt-4">
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-[#123524] flex items-center p-12">
          <div className="relative z-10 max-w-md">
            <div className="bg-[#b54a4a] text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-4">Hanya 15RB</div>
            <h1 className="text-5xl font-extrabold leading-tight mb-2 tracking-wide">SEMUA <br/><span className="text-4xl">HARGA</span> 15RB</h1>
            <p className="text-gray-300 text-sm mb-8">Rasakan Kesegaran Buah Asli Pilihan Terbaik</p>
            <button className="bg-[#c2aa6b] text-[#061e12] font-bold py-3 px-8 rounded-full hover:bg-[#d4bd7e] transition">Shop now</button>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT GRID */}
      <section id="products" className="w-full max-w-7xl px-8 mt-16">
        <h2 className="text-3xl font-serif text-center underline decoration-2 underline-offset-8 mb-10 text-white">Best Seller</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {DUMMY_PRODUCTS.map((product) => {
            const qty = cart[product.id] || 0;
            return (
              <div key={product.id} className="bg-white rounded-xl p-3 flex flex-col items-center shadow-md">
                <div className="w-full h-36 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-xs">Gambar</div>
                <h3 className="text-[#061e12] text-sm font-bold mb-1 text-center">{product.name}</h3>
                <p className="text-[#061e12] font-extrabold text-sm mb-4">Rp {product.price.toLocaleString('id-ID')}</p>
                <div className="flex items-center justify-between w-full mt-auto">
                  <button onClick={() => handleRemove(product.id)} disabled={qty === 0} className={`w-7 h-7 rounded-full font-bold flex items-center justify-center transition ${qty > 0 ? 'bg-gray-300 text-[#061e12] hover:bg-gray-400' : 'bg-gray-100 text-gray-300'}`}>-</button>
                  <span className="text-[#061e12] font-bold text-sm">{qty}</span>
                  <button onClick={() => handleAdd(product.id)} className="w-7 h-7 bg-[#123524] rounded-full text-white font-bold flex items-center justify-center hover:bg-[#0a1f15] transition">+</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FLOATING CART BUTTON */}
      {totalItems > 0 && modalView === 'closed' && (
        <div className="fixed bottom-0 left-0 w-full p-6 z-40 flex justify-center bg-gradient-to-t from-[#061e12] to-transparent pointer-events-none">
          <button onClick={() => setModalView('detail')} className="pointer-events-auto bg-[#c2aa6b] text-[#061e12] px-8 py-4 rounded-full font-extrabold shadow-2xl flex items-center gap-6 hover:scale-105 transition-transform">
            <span className="text-lg">🛒 {totalItems} Item</span>
            <span>|</span>
            <span className="text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
            <span className="bg-[#061e12] text-[#c2aa6b] px-4 py-1 rounded-full text-sm">Checkout ➔</span>
          </button>
        </div>
      )}

      {/* 5. OVERLAY MODAL MULTI-TAHAP */}
      {modalView !== 'closed' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          
          {/* Header Modal */}
          <div className="w-full max-w-2xl flex items-center mb-4 relative">
            {modalView === 'detail' && (
              <button onClick={() => setModalView('closed')} className="text-white text-3xl font-bold absolute left-0 hover:text-gray-300 transition">←</button>
            )}
            {modalView === 'qris' && !paymentSuccess && (
              <button onClick={() => setModalView('detail')} className="text-white text-3xl font-bold absolute left-0 hover:text-gray-300 transition">←</button>
            )}
            <h2 className="text-white text-lg tracking-widest text-center w-full underline underline-offset-8 decoration-1 uppercase">
              {modalView === 'detail' ? 'DETAIL PESANAN' : 'PEMBAYARAN QRIS'}
            </h2>
          </div>

          {/* Kotak Putih Modal */}
          <div className="bg-[#e9ece6] text-[#061e12] w-full max-w-2xl rounded-[2rem] p-8 md:p-10 relative shadow-2xl min-h-[400px]">
            <div className="flex justify-end mb-4 border-b-2 border-black pb-2">
              <h3 className="text-3xl font-black">NO. 001</h3>
            </div>

            {/* === KONTEN 1: DETAIL PESANAN === */}
            {modalView === 'detail' && (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <label className="font-bold w-32">Nama <span className="float-right hidden md:inline">:</span></label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="flex-1 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123524]" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 relative">
                    <label className="font-bold w-32">No. Telpon <span className="float-right hidden md:inline">:</span></label>
                    <input type="number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="flex-1 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#123524]" />
                    {showPhoneError && (
                      <div className="absolute top-full mt-2 left-0 md:left-36 bg-[#e9ece6] shadow-xl rounded-2xl p-4 border border-gray-300 w-64 z-50 animate-bounce">
                        <p className="text-sm font-bold mb-3">Maaf, anda harus mengisi Nomor Telepon !!</p>
                        <div className="flex justify-end">
                          <button onClick={() => setShowPhoneError(false)} className="bg-[#b54a4a] text-white px-6 py-1 rounded-full font-bold shadow hover:bg-red-700">Ya</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="font-bold block mb-2">Detail Pesanan :</label>
                  <div className="pl-4 md:pl-8 space-y-3 max-h-40 overflow-y-auto pr-2">
                    {Object.entries(cart).map(([id, qty]) => {
                      const product = DUMMY_PRODUCTS.find(p => p.id === Number(id));
                      if (!product) return null;
                      return (
                        <div key={id} className="flex justify-between text-sm font-medium">
                          <span className="w-1/2">{product.name}</span>
                          <div className="w-1/2 flex flex-col items-end">
                            <span className="text-gray-600 text-xs">{qty}x {product.price.toLocaleString('id-ID')}</span>
                            <span className="font-extrabold">: Rp{(product.price * qty).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t-2 border-black pt-4 flex justify-between items-center mb-8">
                  <span className="text-lg font-black">Total</span>
                  <span className="text-lg font-black">: Rp{totalPrice.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-start pl-8">
                  <button onClick={handleProceedToQRIS} className="bg-[#567261] text-white px-10 py-2 rounded-full font-bold shadow-lg hover:bg-[#3c5043] transition">
                    Bayar
                  </button>
                </div>
              </>
            )}

            {/* === KONTEN 2: PEMBAYARAN QRIS === */}
            {modalView === 'qris' && (
              <div className="flex flex-col items-center justify-center relative">
                
                {/* Logo QRIS Placeholder */}
                <div className="flex gap-1 mb-4">
                  <div className="font-black text-2xl tracking-tighter">QRIS</div>
                </div>

                {/* Box QR Code & Popup Sukses */}
                <div className="relative w-64 h-64 bg-white p-2 border-4 border-gray-200 rounded-lg flex items-center justify-center mb-8 overflow-visible">
                  
                  {/* Kotak Dummy Barcode */}
                  <div className="w-full h-full border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm text-center p-4">
                    [Gambar QR Code Dinamis Midtrans akan muncul di sini]
                  </div>

                  {/* Tombol Rahasia untuk Simulasi (Hanya muncul saat belum sukses) */}
                  {!paymentSuccess && (
                    <button 
                      onClick={handleSimulatePaymentSuccess}
                      className="absolute -bottom-16 bg-blue-500 text-white text-xs px-4 py-2 rounded-full animate-pulse"
                    >
                      (Dev) Simulasikan Sukses
                    </button>
                  )}

                  {/* POP-UP OVERLAY PEMBAYARAN BERHASIL (Sesuai Desain) */}
                  {paymentSuccess && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-[#e9ece6] shadow-2xl rounded-2xl p-6 border border-gray-300 z-50">
                      <h4 className="text-center font-bold text-lg mb-4 underline decoration-2 underline-offset-4">Pembayaran Berhasil</h4>
                      
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Total</span>
                        <span>: Rp. {totalPrice.toLocaleString('id-ID')},-</span>
                      </div>
                      
                      <div className="flex justify-between text-sm font-bold mb-6 border-b border-gray-400 pb-4">
                        <span>Pembayaran</span>
                        <span>: QRIS</span>
                      </div>
                      
                      <div className="flex justify-center">
                        <button onClick={handleFinishTransaction} className="bg-[#8b2323] text-white px-8 py-2 rounded-full font-bold shadow hover:bg-red-900 transition">
                          Ya
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* Tombol Bawah */}
                <button disabled className="bg-[#567261] opacity-70 text-white px-8 py-2 rounded-full font-bold shadow-lg">
                  Cek Transaksi
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}