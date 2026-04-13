"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function KioskPage() {
  // State Data yang sudah dipisah berdasarkan API baru
  const [data, setData] = useState<{bestSellers: any[], allProducts: any[]}>({
    bestSellers: [],
    allProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // State Keranjang & Transaksi
  const [cart, setCart] = useState<Record<number, number>>({});
  const [modalView, setModalView] = useState<'closed' | 'detail' | 'qris' | 'receipt'>('closed');
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false); 
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        }
      } catch (error) { console.error("Error:", error); } 
      finally { setIsLoading(false); }
    };
    fetchProducts();
  }, []);

  // Logika Keranjang
  const handleAdd = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const handleRemove = (id: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1; else delete newCart[id];
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  
  // Menggunakan data.allProducts karena semua produk pasti ada di sini
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = data.allProducts.find(p => p.id_produk === Number(id));
    return total + (product ? Number(product.harga) * qty : 0);
  }, 0);

  const handleProceedToQRIS = () => {
    if (!customerPhone.trim()) return setShowPhoneError(true);
    setShowPhoneError(false);
    setModalView('qris'); 
  };

  const handleFinishTransaction = async () => {
    const cartItemsData = Object.entries(cart).map(([id, qty]) => {
      const product = data.allProducts.find(p => p.id_produk === Number(id));
      return {
        id_produk: Number(id),
        qty: qty,
        subtotal: product ? Number(product.harga) * qty : 0,
        nama_produk: product?.nama_produk
      };
    });

    const payload = {
      nama_pelanggan: customerName,
      no_telp: customerPhone,
      total_harga: totalPrice,
      metode_bayar: "QRIS",
      cart_items: cartItemsData
    };

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedData = await res.json();
        setLastTransaction({ ...savedData, items_detail: cartItemsData });
        setModalView('receipt');
        
        // Bersihkan State
        setCart({});
        setCustomerName("");
        setCustomerPhone("");
        setPaymentSuccess(false);
      } else {
        alert("Terjadi kesalahan saat menyimpan transaksi.");
      }
    } catch (error) {
      alert("Koneksi ke server gagal.");
    }
  };

  // Cetak ke Backend Node.js
  const handlePrint = async () => {
    if (!lastTransaction) return;
    try {
      const res = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastTransaction)
      });
      if (res.ok) {
        alert("Instruksi cetak berhasil dikirim ke printer!");
        setModalView('closed');
      } else {
        const errorData = await res.json();
        alert(`Gagal mencetak: ${errorData.error}`);
      }
    } catch (error) {
      alert("Tidak dapat terhubung ke server kasir.");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#061e12] text-white font-bold text-xl">Memuat Menu Jus Alif...</div>;

  return (
    <>
      {/* CSS KHUSUS UNTUK PRINTER THERMAL (Opsional jika pakai direct print) */}
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; }
        @media print {
          @page { margin: 0 !important; size: 58mm auto; }
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: absolute; left: -1; top: 0; width: 100% !important; max-width: 55mm !important;
            padding: 2mm 2mm 0 2mm !important; margin: 0 !important;
            font-family: 'Courier New', Courier, monospace !important; font-size: 12px !important;
            font-weight: bold !important; color: #000 !important; line-height: 1.2 !important; word-wrap: break-word !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <main className="min-h-screen flex flex-col items-center pb-32 bg-[#061e12]">
        
        {/* NAVBAR STICKY */}
        <nav className="fixed top-0 w-full z-50 bg-[#061e12]/80 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-10 bg-white rounded flex items-center justify-center text-[#061e12] font-black text-[10px] text-center leading-tight">Jus<br/>Alif</div>
            <span className="text-white font-bold tracking-tighter text-lg">ALIF POS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-300">
            <a onClick={() => window.scrollTo(0,0)} className="hover:text-[#c2aa6b] transition cursor-pointer">Home</a>
            <a href="#about" className="hover:text-[#c2aa6b] transition cursor-pointer">About Us</a>
            <a href="#products" className="hover:text-[#c2aa6b] transition cursor-pointer">Product</a>
            <Link href="/login" className="bg-[#c2aa6b] text-[#061e12] px-5 py-2 rounded-full hover:scale-105 transition shadow-lg shadow-[#c2aa6b]/20">Login</Link>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="w-full max-w-7xl px-8 mt-28">
          <div className="relative w-full h-[400px] rounded-3xl overflow-hidden bg-[#123524] flex items-center p-12 shadow-2xl border border-white/5">
            <div className="relative z-10 max-w-md">
              <div className="bg-[#b54a4a] text-white text-[10px] font-black px-3 py-1 rounded-full w-max mb-4 uppercase tracking-widest shadow-lg animate-pulse">Promo Spesial</div>
              <h1 className="text-5xl font-black leading-tight mb-2 text-white italic tracking-tighter">FRESH <br/><span className="text-[#c2aa6b] not-italic">EVERYDAY</span></h1>
              <p className="text-gray-400 text-sm mb-8 font-medium leading-relaxed">Nikmati kesegaran buah asli pilihan langsung dari petani lokal untuk harimu yang lebih sehat.</p>
              <a href="#products" className="bg-[#c2aa6b] text-[#061e12] font-black py-4 px-10 rounded-full shadow-xl hover:shadow-[#c2aa6b]/20 transition transform hover:-translate-y-1 inline-block">PESAN SEKARANG</a>
            </div>
          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section id="about" className="w-full max-w-7xl px-8 mt-24 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black text-white italic tracking-tighter">Tentang <span className="text-[#c2aa6b] not-italic">Jus Alif</span></h2>
              <p className="text-gray-400 leading-relaxed font-medium">
                Berawal dari semangat untuk menghadirkan minuman sehat yang jujur, Jus Alif hadir dengan konsep 100% buah murni tanpa pemanis buatan. Kami percaya bahwa kesehatan adalah investasi terbaik, dan itu dimulai dari apa yang kita minum setiap hari.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#123524] p-5 rounded-2xl border border-white/5">
                  <h4 className="text-[#c2aa6b] font-black text-2xl">100%</h4>
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest mt-1">Buah Segar</p>
                </div>
                <div className="bg-[#123524] p-5 rounded-2xl border border-white/5">
                  <h4 className="text-[#c2aa6b] font-black text-2xl">0%</h4>
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest mt-1">Pengawet</p>
                </div>
              </div>
            </div>
            <div className="bg-[#c2aa6b]/10 rounded-3xl h-64 md:h-full flex items-center justify-center border border-[#c2aa6b]/20 min-h-[300px]">
              <span className="text-[#c2aa6b] font-black italic text-2xl tracking-widest opacity-50">#SegarItuAlif</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: BEST SELLER */}
        {data.bestSellers.length > 0 && (
          <section className="w-full max-w-7xl px-8 mt-24">
            <div className="flex flex-col items-center mb-10">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                Best <span className="text-[#c2aa6b] not-italic">Seller</span>
              </h2>
              <div className="w-24 h-1 bg-[#c2aa6b] mt-2 rounded-full"></div>
              <p className="text-gray-400 text-xs mt-3 font-bold uppercase tracking-widest">Favorit Pelanggan 30 Hari Terakhir</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {data.bestSellers.map((product) => (
                <ProductCard 
                  key={`best-${product.id_produk}`} 
                  product={product} 
                  qty={cart[product.id_produk] || 0} 
                  onAdd={() => handleAdd(product.id_produk)}
                  onRemove={() => handleRemove(product.id_produk)}
                  isBest={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: SEMUA PRODUK */}
        <section id="products" className="w-full max-w-7xl px-8 mt-24 border-t border-white/10 pt-16">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Semua <span className="text-[#c2aa6b] not-italic">Menu</span></h2>
            <p className="text-gray-500 text-[10px] mt-2 font-bold tracking-[0.3em]">PILIHAN KESEGARAN UNTUKMU</p>
          </div>

          {data.allProducts.length === 0 ? (
            <div className="text-center text-gray-400 font-bold">Belum ada menu yang tersedia.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {data.allProducts.map((product) => (
                <ProductCard 
                  key={`all-${product.id_produk}`} 
                  product={product} 
                  qty={cart[product.id_produk] || 0} 
                  onAdd={() => handleAdd(product.id_produk)}
                  onRemove={() => handleRemove(product.id_produk)}
                  isBest={false}
                />
              ))}
            </div>
          )}
        </section>

        {/* FLOATING CART BUTTON */}
        {totalItems > 0 && modalView === 'closed' && (
          <div className="fixed bottom-0 left-0 w-full p-6 z-40 flex justify-center bg-gradient-to-t from-[#061e12] via-[#061e12]/80 to-transparent pointer-events-none">
            <button onClick={() => setModalView('detail')} className="pointer-events-auto bg-[#c2aa6b] text-[#061e12] px-8 py-4 rounded-full font-extrabold shadow-[0_10px_40px_rgba(194,170,107,0.3)] flex items-center gap-6 hover:scale-105 transition-transform">
              <span className="text-lg">🛒 {totalItems} Item</span>
              <span className="opacity-30">|</span>
              <span className="text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
              <span className="bg-[#061e12] text-[#c2aa6b] px-5 py-1.5 rounded-full text-xs ml-2 uppercase tracking-widest">Checkout</span>
            </button>
          </div>
        )}

        {/* OVERLAY MODAL */}
        {modalView !== 'closed' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
            
            {/* Header Modal UI */}
            {modalView !== 'receipt' && (
              <div className="w-full max-w-2xl flex items-center mb-6 relative">
                {modalView === 'detail' && <button onClick={() => setModalView('closed')} className="text-white text-3xl font-bold absolute left-0 hover:text-[#c2aa6b] transition">←</button>}
                {modalView === 'qris' && !paymentSuccess && <button onClick={() => setModalView('detail')} className="text-white text-3xl font-bold absolute left-0 hover:text-[#c2aa6b] transition">←</button>}
                <h2 className="text-[#c2aa6b] text-lg font-black tracking-widest text-center w-full uppercase">
                  {modalView === 'detail' ? 'DETAIL PESANAN' : 'PEMBAYARAN QRIS'}
                </h2>
              </div>
            )}

            <div className={`bg-white text-[#061e12] w-full ${modalView === 'receipt' ? 'max-w-sm' : 'max-w-2xl'} rounded-[2rem] p-8 md:p-10 relative shadow-2xl min-h-[400px]`}>
              
              {/* === MODE: DETAIL PESANAN === */}
              {modalView === 'detail' && (
                <>
                  <div className="flex justify-end mb-6 border-b border-gray-200 pb-4">
                    <h3 className="text-3xl font-black text-gray-300">NO. <span className="text-[#061e12]">001</span></h3>
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4">
                      <label className="font-bold text-sm w-24 text-gray-500 uppercase tracking-wider">Nama</label>
                      <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[#c2aa6b] transition font-bold" placeholder="Nama Pelanggan" />
                    </div>
                    <div className="flex items-center gap-4 relative">
                      <label className="font-bold text-sm w-24 text-gray-500 uppercase tracking-wider">No. Telp</label>
                      <input type="number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={`flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm outline-none border ${showPhoneError ? 'border-red-500' : 'border-gray-100'} focus:border-[#c2aa6b] transition font-bold`} placeholder="08..." />
                      {showPhoneError && <p className="absolute -bottom-6 left-28 text-xs font-bold text-red-500">Nomor Telepon wajib diisi!</p>}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="font-bold block mb-4 text-sm text-gray-500 uppercase tracking-wider">Ringkasan Item</label>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {Object.entries(cart).map(([id, qty]) => {
                        const product = data.allProducts.find(p => p.id_produk === Number(id));
                        if (!product) return null;
                        return (
                          <div key={id} className="flex justify-between items-center text-sm font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <span className="w-1/2 font-bold">{product.nama_produk}</span>
                            <div className="w-1/2 flex flex-col items-end">
                              <span className="text-gray-400 text-xs font-bold">{qty}x {Number(product.harga).toLocaleString('id-ID')}</span>
                              <span className="font-black text-[#123524]">Rp {(Number(product.harga) * qty).toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t-2 border-dashed border-gray-200 pt-6 flex justify-between items-center mb-8">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Bayar</span>
                    <span className="text-2xl font-black text-[#061e12]">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleProceedToQRIS} className="bg-[#123524] text-white px-10 py-4 rounded-full font-black shadow-lg shadow-[#123524]/30 hover:bg-black transition w-full md:w-auto">PROSES PEMBAYARAN ➔</button>
                  </div>
                </>
              )}

              {/* === MODE: QRIS === */}
              {modalView === 'qris' && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="font-black text-3xl tracking-tighter mb-8 text-[#061e12]">Scan QRIS</div>
                  <div className="w-72 h-72 bg-white border-4 border-gray-100 rounded-3xl flex items-center justify-center mb-8 relative shadow-inner">
                    <div className="text-gray-400 text-sm font-bold">Simulasi QR Code</div>
                    {!paymentSuccess && <button onClick={() => setPaymentSuccess(true)} className="absolute -bottom-16 bg-[#c2aa6b] text-[#061e12] text-xs font-bold px-6 py-2 rounded-full animate-bounce shadow-md">(Dev) Klik Bayar Sukses</button>}
                    
                    {paymentSuccess && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110%] bg-white shadow-2xl rounded-3xl p-8 border border-gray-100 z-50 flex flex-col items-center animate-[scale-up_0.2s_ease-out]">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">✓</div>
                        <h4 className="text-center font-black text-xl mb-6 text-[#061e12]">Pembayaran Berhasil!</h4>
                        <div className="w-full flex justify-between text-sm font-bold mb-8 border-t border-gray-100 pt-4">
                          <span className="text-gray-400">Total</span><span className="text-xl">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <button onClick={handleFinishTransaction} className="w-full bg-[#123524] text-white py-3 rounded-full font-black hover:bg-black transition">LANJUT CETAK STRUK</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === MODE: PREVIEW & CETAK STRUK THERMAL === */}
              {modalView === 'receipt' && lastTransaction && (
                <div className="flex flex-col items-center py-4">
                  <h3 className="font-black text-xl mb-6 text-[#061e12] no-print">Pratinjau Struk</h3>
                  
                  {/* WADAH STRUK YANG AKAN DICETAK */}
                  <div id="printable-receipt" className="bg-white p-6 w-full max-w-[300px] border border-gray-200 shadow-sm font-mono text-[12px] leading-tight text-black mx-auto relative overflow-hidden">
                    {/* Efek gerigi kertas struk di atas/bawah */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDEwLDAgMjAsMTAiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=')] bg-repeat-x opacity-50 no-print"></div>

                    <div className="text-center mb-6 mt-2">
                      <h2 className="font-bold text-2xl tracking-widest m-0">JUS ALIF</h2>
                      <p className="m-0 text-[10px] mt-1">Jl. Contoh Tasikmalaya No. 123</p>
                      <p className="m-0 text-[10px]">Telp: 0812-3456-7890</p>
                    </div>
                    
                    <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
                    
                    <div className="mb-3 space-y-1">
                      <div className="flex justify-between"><span className="text-[10px]">Kode:</span><span className="text-[10px] font-bold">{lastTransaction.kode_transaksi}</span></div>
                      <div className="flex justify-between"><span className="text-[10px]">Tgl:</span><span className="text-[10px]">{new Date(lastTransaction.tanggal).toLocaleString('id-ID')}</span></div>
                      <div className="flex justify-between"><span className="text-[10px]">Pelanggan:</span><span className="text-[10px] uppercase font-bold">{lastTransaction.nama_pelanggan}</span></div>
                    </div>
                    
                    <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
                    
                    <div className="mb-3 space-y-2">
                      {lastTransaction.items_detail.map((item: any, idx: number) => (
                        <div key={idx}>
                          <div className="font-bold">{item.nama_produk}</div>
                          <div className="flex justify-between text-gray-700">
                            <span>{item.qty} x {Number(item.subtotal/item.qty).toLocaleString('id-ID')}</span>
                            <span className="font-bold text-black">{Number(item.subtotal).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
                    
                    <div className="font-black flex justify-between text-[16px] my-2">
                      <span>TOTAL</span>
                      <span>Rp {Number(lastTransaction.total_harga).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600 font-bold">
                      <span>Metode</span>
                      <span>{lastTransaction.metode_pembayaran}</span>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
                    
                    <div className="text-center mt-6 mb-2">
                      <p className="m-0 text-[11px] font-bold">Terima Kasih</p>
                      <p className="m-0 text-[10px] text-gray-500">Silakan datang kembali</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-8 w-full max-w-[300px] no-print">
                    <button onClick={handlePrint} className="w-full bg-[#123524] text-white py-3 rounded-xl font-black shadow-lg hover:bg-black transition">🖨️ CETAK KE MESIN THERMAL</button>
                    <button onClick={() => setModalView('closed')} className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Selesai & Antrean Baru</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </>
  );
}

// --- KOMPONEN CETAKAN KARTU PRODUK ---
function ProductCard({ product, qty, onAdd, onRemove, isBest }: any) {
  return (
    <div className={`bg-white rounded-2xl p-3 flex flex-col items-center shadow-lg transition transform hover:-translate-y-2 relative group ${isBest ? 'ring-4 ring-[#c2aa6b]/30 shadow-[#c2aa6b]/20' : ''}`}>
      
      {isBest && (
        <div className="absolute -top-3 -right-3 bg-[#b54a4a] text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl border-2 border-white z-10 animate-bounce">
          🔥 TERLARIS
        </div>
      )}

      <div className="w-full h-36 bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-300 text-xs overflow-hidden relative border border-gray-100 group-hover:border-[#c2aa6b]/50 transition">
        {product.gambar ? <img src={product.gambar} alt={product.nama_produk} className="w-full h-full object-cover transition transform group-hover:scale-110 duration-500" /> : "No Image"}
      </div>
      
      <h3 className="text-[#061e12] text-sm font-bold mb-1 text-center line-clamp-1 w-full px-1">{product.nama_produk}</h3>
      <p className="text-[#c2aa6b] font-black text-sm mb-5">Rp {Number(product.harga).toLocaleString('id-ID')}</p>
      
      <div className="flex items-center justify-between w-full mt-auto bg-gray-50 rounded-full p-1 border border-gray-100">
        <button onClick={onRemove} disabled={qty === 0} className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm font-bold text-gray-400 hover:text-red-500 disabled:opacity-30 transition">-</button>
        <span className="text-[#061e12] font-black text-sm">{qty}</span>
        <button onClick={onAdd} className="w-8 h-8 bg-[#123524] text-white rounded-full flex items-center justify-center font-bold shadow-md hover:bg-[#c2aa6b] hover:text-[#061e12] transition">+</button>
      </div>
    </div>
  );
}