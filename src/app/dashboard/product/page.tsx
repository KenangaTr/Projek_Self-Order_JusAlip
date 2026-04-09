"use client";

import { useState, useEffect } from "react";

export default function ProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Fungsi Load Data (Read)
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // === FUNGSI UPDATE TOGGLE KETERSEDIAAN ===
  const toggleAvailability = async (product: any) => {
    const newStatus = !product.is_available;
    
    // Update UI seketika agar terasa cepat
    setProducts(products.map(p => 
      p.id_produk === product.id_produk ? { ...p, is_available: newStatus } : p
    ));

    // Update ke Database via API
    await fetch(`/api/products/${product.id_produk}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: newStatus })
    });
  };

  // === FUNGSI HAPUS PRODUK (DELETE) ===
  const handleDelete = async (id: number) => {
    const isConfirm = confirm("Apakah Anda yakin ingin menghapus produk ini?");
    if (!isConfirm) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Hapus dari state UI jika sukses di database
        setProducts(products.filter(p => p.id_produk !== id));
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error delete:", error);
    }
  };

  // === FUNGSI SIMPAN EDIT (UPDATE INFO) ===
  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/products/${editingProduct.id_produk}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_produk: editingProduct.nama_produk,
          harga: parseFloat(editingProduct.harga)
        })
      });

      if (res.ok) {
        alert("Produk berhasil diperbarui!");
        fetchProducts(); // Refresh data tabel
        handleCloseEdit(); // Tutup form edit
      } else {
        alert("Gagal menyimpan perubahan");
      }
    } catch (error) {
      console.error("Error update:", error);
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setIsEditMode(true);
  };

  const handleCloseEdit = () => {
    setIsEditMode(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id_produk.toString().includes(searchQuery)
  );

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Memuat data dari database...</div>;

  // === TAMPILAN FORM EDIT ===
  if (isEditMode && editingProduct) {
    return (
      <div className="max-w-4xl mx-auto text-[#061e12]">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleCloseEdit} className="text-3xl font-bold hover:text-gray-500 transition">←</button>
          <h1 className="text-2xl font-extrabold tracking-wide">Informasi Produk</h1>
        </div>

        <div className="bg-[#f4f5f4] rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-200">
          <div className="mb-8">
             <label className="block text-sm font-extrabold mb-3">Foto Produk (Belum Berfungsi)</label>
             <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400">IMG</div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-extrabold mb-2">Nama Produk</label>
              <input 
                type="text" 
                value={editingProduct.nama_produk} 
                onChange={(e) => setEditingProduct({...editingProduct, nama_produk: e.target.value})}
                className="w-full bg-[#e2e3e1] px-4 py-2 rounded-md font-medium outline-none focus:ring-2 focus:ring-[#567261]"
              />
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-2">Harga</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-medium">Rp</span>
                <input 
                  type="number" 
                  value={editingProduct.harga} 
                  onChange={(e) => setEditingProduct({...editingProduct, harga: e.target.value})}
                  className="w-full bg-[#e2e3e1] pl-10 pr-4 py-2 rounded-md font-medium outline-none focus:ring-2 focus:ring-[#567261]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-12">
            <button onClick={handleSaveEdit} className="bg-[#567261] text-white px-8 py-2 rounded-full font-bold shadow-md">Simpan</button>
            <button onClick={handleCloseEdit} className="bg-[#567261] text-white px-8 py-2 rounded-full font-bold shadow-md">Batal</button>
          </div>
        </div>
      </div>
    );
  }

  // === TAMPILAN TABEL ===
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-[#061e12] mb-6">Product</h1>
      <div className="relative mb-8">
        <input type="text" placeholder="Cari Nama Produk" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#e9ece6] px-6 py-4 rounded-full font-medium outline-none focus:ring-2 focus:ring-[#c2aa6b] shadow-sm"/>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="px-6 py-4 text-sm font-extrabold w-2/5">Produk</th>
              <th className="px-6 py-4 text-sm font-extrabold">Harga</th>
              <th className="px-6 py-4 text-sm font-extrabold">Kategori</th>
              <th className="px-6 py-4 text-sm font-extrabold">Tersedia</th>
              <th className="px-6 py-4 text-sm font-extrabold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id_produk} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-400 font-bold">IMG</div>
                    <div>
                      <p className="font-bold text-sm">{product.nama_produk}</p>
                      <p className="text-xs text-gray-500 font-bold mt-1">ID: {product.id_produk}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-sm">Rp{Number(product.harga).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 font-bold text-sm">{product.kategori}</td>
                
                {/* Tombol Toggle yang sudah nyambung ke DB */}
                <td className="px-6 py-4">
                  <button onClick={() => toggleAvailability(product)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${product.is_available ? 'bg-[#567261]' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full transform transition-transform ${product.is_available ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </td>
                
                {/* Tombol Ubah & Hapus */}
                <td className="px-6 py-4 text-sm font-bold">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleEditClick(product)} className="text-blue-500 hover:text-blue-700 text-left transition">Ubah</button>
                    <button onClick={() => handleDelete(product.id_produk)} className="text-red-500 hover:text-red-700 text-left transition">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}