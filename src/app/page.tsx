"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function KioskPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<Record<number, number>>({});
  
  // Modal view kita tambah satu mode: 'receipt'
  const [modalView, setModalView] = useState<'closed' | 'detail' | 'qris' | 'receipt'>('closed');
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false); 
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // State baru untuk menyimpan data transaksi yang baru saja berhasil (untuk dicetak)
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.filter((p: any) => p.is_available));
        }
      } catch (error) { console.error("Error:", error); } 
      finally { setIsLoading(false); }
    };
    fetchProducts();
  }, []);

  const handleAdd = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const handleRemove = (id: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1; else delete newCart[id];
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find(p => p.id_produk === Number(id));
    return total + (product ? Number(product.harga) * qty : 0);
  }, 0);

  const handleProceedToQRIS = () => {
    if (!customerPhone.trim()) return setShowPhoneError(true);
    setShowPhoneError(false);
    setModalView('qris'); 
  };

  const handleFinishTransaction = async () => {
    const cartItemsData = Object.entries(cart).map(([id, qty]) => {
      const product = products.find(p => p.id_produk === Number(id));
      return {
        id_produk: Number(id),
        qty: qty,
        subtotal: product ? Number(product.harga) * qty : 0,
        nama_produk: product?.nama_produk // Bawa nama produk untuk struk
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
        
        // Simpan data untuk struk, lalu pindah ke tampilan struk
        setLastTransaction({
          ...savedData,
          items_detail: cartItemsData // Kita simpan detail item untuk dicetak
        });
        setModalView('receipt');
        
        // Bersihkan form untuk antrean selanjutnya
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

  // FUNGSI UNTUK MENCETAK VIA BACKEND NODE.JS
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
        setModalView('closed'); // Tutup modal setelah cetak
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
      {/* CSS KHUSUS UNTUK PRINTER THERMAL (58mm) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* 1. Atur Ukuran Kertas & Hilangkan Margin Default Browser */
          @page {
            margin: 0 !important;
            size: 58mm auto; /* Memaksa browser mengenali lebar thermal */
          }

          /* 2. Sembunyikan elemen web lainnya */
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          
          /* 3. Format Struk Thermal */
          #printable-receipt {
            position: absolute;
            left: -1;
            top: 0;
            width: 100% !important;
            max-width: 55mm !important; /* Area cetak efektif printer 58mm adalah 48mm */
            padding: 2mm 2mm 0 2mm !important; /* Beri sedikit ruang agar tidak mepet tepi */
            margin: 0 !important;
            font-family: 'Courier New', Courier, monospace !important; /* Font struk asli */
            font-size: 12px !important; /* Ukuran optimal agar tidak terpotong */
            font-weight: bold !important; /* Tinta thermal butuh ketebalan ekstra */
            color: #000 !important;
            line-height: 1.2 !important;
            word-wrap: break-word !important; /* Paksa teks panjang turun ke bawah */
          }
          
          .no-print { display: none !important; }
        }
      `}} />

      {/* Bagian web dibungkus div agar rapi */}
      <main className="min-h-screen flex flex-col items-center pb-32">
        {/* ... (NAVBAR, HERO, ABOUT SECTION TETAP SAMA) ... */}
        <nav className="w-full max-w-7xl px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-12 bg-white rounded-md flex items-center justify-center text-[#061e12] font-bold text-xs text-center">Jus<br/>Alif</div>
          </div>
          <div className="flex gap-8 text-sm font-medium text-gray-200">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="#products" className="hover:text-white transition">Products</Link>
          </div>
        </nav>

        <section className="w-full max-w-7xl px-8 mt-4">
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-[#123524] flex items-center p-12 shadow-xl">
            <div className="relative z-10 max-w-md">
              <div className="bg-[#b54a4a] text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-4 shadow">Hanya 15RB</div>
              <h1 className="text-5xl font-extrabold leading-tight mb-2 tracking-wide text-white drop-shadow-md">SEMUA <br/><span className="text-4xl text-[#c2aa6b]">HARGA</span> 15RB</h1>
              <p className="text-gray-300 text-sm mb-8 drop-shadow">Rasakan Kesegaran Buah Asli Pilihan Terbaik</p>
              <button className="bg-[#c2aa6b] text-[#061e12] font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#d4bd7e] hover:scale-105 transition transform">Shop now</button>
            </div>
          </div>
        </section>

        <section id="products" className="w-full max-w-7xl px-8 mt-16">
          <h2 className="text-3xl font-serif text-center underline decoration-2 underline-offset-8 mb-10 text-white">Best Seller</h2>
          {products.length === 0 ? (
            <div className="text-center text-gray-400 font-bold">Belum ada produk yang tersedia.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => {
                const qty = cart[product.id_produk] || 0;
                return (
                  <div key={product.id_produk} className="bg-white rounded-xl p-3 flex flex-col items-center shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                    <div className="w-full h-36 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-xs overflow-hidden relative">
                      {product.gambar ? <img src={product.gambar} alt={product.nama_produk} className="w-full h-full object-cover" /> : "Gambar"}
                    </div>
                    <h3 className="text-[#061e12] text-sm font-bold mb-1 text-center line-clamp-1">{product.nama_produk}</h3>
                    <p className="text-[#061e12] font-extrabold text-sm mb-4">Rp {Number(product.harga).toLocaleString('id-ID')}</p>
                    <div className="flex items-center justify-between w-full mt-auto">
                      <button onClick={() => handleRemove(product.id_produk)} disabled={qty === 0} className={`w-7 h-7 rounded-full font-bold flex items-center justify-center transition ${qty > 0 ? 'bg-gray-300 text-[#061e12] hover:bg-gray-400' : 'bg-gray-100 text-gray-300'}`}>-</button>
                      <span className="text-[#061e12] font-bold text-sm">{qty}</span>
                      <button onClick={() => handleAdd(product.id_produk)} className="w-7 h-7 bg-[#123524] rounded-full text-white font-bold flex items-center justify-center hover:bg-[#0a1f15] transition shadow">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FLOATING CART BUTTON */}
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

        {/* OVERLAY MODAL */}
        {modalView !== 'closed' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            
            {/* Hanya tampilkan Header UI jika BUKAN mode Struk */}
            {modalView !== 'receipt' && (
              <div className="w-full max-w-2xl flex items-center mb-4 relative">
                {modalView === 'detail' && <button onClick={() => setModalView('closed')} className="text-white text-3xl font-bold absolute left-0 hover:text-gray-300 transition">←</button>}
                {modalView === 'qris' && !paymentSuccess && <button onClick={() => setModalView('detail')} className="text-white text-3xl font-bold absolute left-0 hover:text-gray-300 transition">←</button>}
                <h2 className="text-white text-lg tracking-widest text-center w-full underline underline-offset-8 decoration-1 uppercase">
                  {modalView === 'detail' ? 'DETAIL PESANAN' : 'PEMBAYARAN QRIS'}
                </h2>
              </div>
            )}

            <div className={`bg-[#e9ece6] text-[#061e12] w-full ${modalView === 'receipt' ? 'max-w-sm' : 'max-w-2xl'} rounded-[2rem] p-8 md:p-10 relative shadow-2xl min-h-[400px]`}>
              
              {/* === MODE: DETAIL PESANAN === */}
              {modalView === 'detail' && (
                <>
                  <div className="flex justify-end mb-4 border-b-2 border-black pb-2"><h3 className="text-3xl font-black">NO. 001</h3></div>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4"><label className="font-bold w-24">Nama:</label><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="flex-1 rounded-full px-4 py-2 text-sm outline-none" /></div>
                    <div className="flex items-center gap-4 relative">
                      <label className="font-bold w-24">No. Telp:</label><input type="number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="flex-1 rounded-full px-4 py-2 text-sm outline-none" />
                      {showPhoneError && <p className="absolute -bottom-6 left-28 text-xs font-bold text-red-600">Nomor Telepon wajib diisi!</p>}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="font-bold block mb-2">Detail Pesanan :</label>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {Object.entries(cart).map(([id, qty]) => {
                        const product = products.find(p => p.id_produk === Number(id));
                        if (!product) return null;
                        return (
                          <div key={id} className="flex justify-between text-sm font-medium border-b border-gray-200 pb-2">
                            <span className="w-1/2">{product.nama_produk}</span>
                            <div className="w-1/2 flex flex-col items-end">
                              <span className="text-gray-600 text-xs">{qty}x {Number(product.harga).toLocaleString('id-ID')}</span>
                              <span className="font-extrabold">Rp {(Number(product.harga) * qty).toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t-2 border-black pt-4 flex justify-between items-center mb-8">
                    <span className="text-lg font-black">Total</span><span className="text-lg font-black">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-start"><button onClick={handleProceedToQRIS} className="bg-[#567261] text-white px-10 py-2 rounded-full font-bold shadow-lg">Bayar</button></div>
                </>
              )}

              {/* === MODE: QRIS === */}
              {modalView === 'qris' && (
                <div className="flex flex-col items-center justify-center">
                  <div className="font-black text-2xl tracking-tighter mb-4">QRIS</div>
                  <div className="w-64 h-64 bg-white border-4 border-gray-200 rounded-lg flex items-center justify-center mb-8 relative">
                    <div className="text-gray-400 text-sm">Scan QR Code</div>
                    {!paymentSuccess && <button onClick={() => setPaymentSuccess(true)} className="absolute -bottom-16 bg-blue-500 text-white text-xs px-4 py-2 rounded-full animate-pulse">(Dev) Simulasi Sukses</button>}
                    
                    {paymentSuccess && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-[#e9ece6] shadow-2xl rounded-2xl p-6 border border-gray-300 z-50">
                        <h4 className="text-center font-bold text-lg mb-4 underline decoration-2">Pembayaran Berhasil</h4>
                        <div className="flex justify-between text-sm font-bold mb-6 border-b border-gray-400 pb-4"><span>Total</span><span>Rp. {totalPrice.toLocaleString('id-ID')}</span></div>
                        <div className="flex justify-center"><button onClick={handleFinishTransaction} className="bg-[#8b2323] text-white px-8 py-2 rounded-full font-bold">Lanjut Cetak</button></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* === MODE: PREVIEW & CETAK STRUK THERMAL === */}
              {modalView === 'receipt' && lastTransaction && (
                <div className="flex flex-col items-center">
                  <h3 className="font-extrabold text-xl mb-4 text-[#061e12] no-print">Pratinjau Struk</h3>
                  
                  {/* WADAH STRUK YANG AKAN DICETAK (Design Khusus Thermal) */}
                  <div id="printable-receipt" className="bg-white p-4 w-[58mm] md:w-full max-w-[300px] border border-gray-300 shadow-inner font-mono text-[12px] leading-tight text-black mx-auto">
                    
                    {/* Header Toko */}
                    <div className="text-center mb-4">
                      <h2 className="font-bold text-lg m-0">JUS ALIF</h2>
                      <p className="m-0 text-[10px]">Jl. Contoh Tasikmalaya No. 123</p>
                      <p className="m-0 text-[10px]">Telp: 0812-3456-7890</p>
                    </div>
                    
                    <div className="border-t border-dashed border-black my-2"></div>
                    
                    {/* Info Transaksi */}
                    <div className="mb-2">
                      <div className="flex justify-between"><span className="text-[10px]">Kode:</span><span className="text-[10px] font-bold">{lastTransaction.kode_transaksi}</span></div>
                      <div className="flex justify-between"><span className="text-[10px]">Tgl:</span><span className="text-[10px]">{new Date(lastTransaction.tanggal).toLocaleString('id-ID')}</span></div>
                      <div className="flex justify-between"><span className="text-[10px]">Pelanggan:</span><span className="text-[10px]">{lastTransaction.nama_pelanggan}</span></div>
                    </div>
                    
                    <div className="border-t border-dashed border-black my-2"></div>
                    
                    {/* Daftar Item */}
                    <div className="mb-2">
                      {lastTransaction.items_detail.map((item: any, idx: number) => (
                        <div key={idx} className="mb-1">
                          <div className="font-bold">{item.nama_produk}</div>
                          <div className="flex justify-between">
                            <span>{item.qty} x {Number(item.subtotal/item.qty).toLocaleString('id-ID')}</span>
                            <span>{Number(item.subtotal).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-dashed border-black my-2"></div>
                    
                    {/* Total & Pembayaran */}
                    <div className="font-bold flex justify-between text-[14px] my-1">
                      <span>TOTAL</span>
                      <span>Rp {Number(lastTransaction.total_harga).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Metode</span>
                      <span>{lastTransaction.metode_pembayaran}</span>
                    </div>

                    <div className="border-t border-dashed border-black my-2"></div>
                    
                    {/* Footer Struk */}
                    <div className="text-center mt-4">
                      <p className="m-0 text-[10px] font-bold">Terima Kasih</p>
                      <p className="m-0 text-[10px]">Silakan datang kembali</p>
                    </div>
                  </div>

                  {/* Tombol Aksi (Tidak akan ikut tercetak karena class no-print) */}
                  <div className="flex gap-4 mt-8 no-print">
                    <button onClick={handlePrint} className="bg-[#567261] text-white px-6 py-2 rounded-full font-bold shadow hover:bg-[#3c5043]">🖨️ Cetak Struk</button>
                    <button onClick={() => setModalView('closed')} className="bg-gray-400 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-gray-500">Selesai</button>
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