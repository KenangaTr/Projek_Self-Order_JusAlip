"use client";

import { useState, useEffect, useRef } from "react";

export default function ProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [isAddMode, setIsAddMode] = useState(false);
  const [newProduct, setNewProduct] = useState({ nama_produk: "", harga: "" });
  
  // State untuk Gambar
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // PERBAIKAN: Cek apakah API merespons dengan format baru (ada allProducts)
        if (data.allProducts) {
          setProducts(data.allProducts);
        } else {
          setProducts(data);
        }
      }
    } catch (error) {
      console.error("Gagal memuat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Fungsi Reset Modal
  const handleCloseModal = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  // --- FUNGSI TAMBAH ---
  const handleSaveAdd = async () => {
    if (!newProduct.nama_produk || !newProduct.harga) return alert("Nama dan Harga harus diisi!");
    const formData = new FormData();
    formData.append('nama_produk', newProduct.nama_produk);
    formData.append('harga', newProduct.harga);
    if (imageFile) formData.append('gambar', imageFile);

    try {
      const res = await fetch('/api/products', { method: 'POST', body: formData });
      if (res.ok) {
        alert("Produk baru berhasil ditambahkan!");
        fetchProducts(); 
        handleCloseModal();
        setNewProduct({ nama_produk: "", harga: "" }); 
      } else alert("Gagal menambahkan produk");
    } catch (error) { console.error("Error add:", error); }
  };

  // --- FUNGSI UBAH (EDIT) ---
  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setImagePreview(product.gambar || null); // Load gambar lama ke kotak preview
    setImageFile(null); // Kosongkan file upload baru
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct.nama_produk || !editingProduct.harga) return alert("Nama dan Harga harus diisi!");
    
    // Gunakan FormData, bukan JSON, agar bisa kirim gambar
    const formData = new FormData();
    formData.append('nama_produk', editingProduct.nama_produk);
    formData.append('harga', editingProduct.harga);
    if (imageFile) formData.append('gambar', imageFile); // Jika ada gambar baru, masukkan!

    try {
      const res = await fetch(`/api/products/${editingProduct.id_produk}`, {
        method: 'PUT',
        body: formData // Fetch otomatis mendeteksi ini sebagai multipart/form-data
      });

      if (res.ok) {
        alert("Data produk berhasil diperbarui!");
        fetchProducts();
        handleCloseModal();
      } else alert("Gagal menyimpan perubahan");
    } catch (error) { console.error("Error update:", error); }
  };

  // --- FUNGSI LAINNYA ---
  const toggleAvailability = async (product: any) => {
    const newStatus = !product.is_available;
    setProducts(products.map(p => p.id_produk === product.id_produk ? { ...p, is_available: newStatus } : p));
    try {
      await fetch(`/api/products/${product.id_produk}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newStatus })
      });
    } catch (error) { console.error("Gagal update toggle", error); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) setProducts(products.filter(p => p.id_produk !== id));
    } catch (error) { console.error("Error delete:", error); }
  };

  const filteredProducts = products.filter(product =>
    product.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id_produk.toString().includes(searchQuery)
  );

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Memuat data dari database...</div>;

  // ==========================================
  // TAMPILAN: FORM EDIT & TAMBAH (Digabung secara pintar)
  // ==========================================
  if (isAddMode || isEditMode) {
    const isEdit = isEditMode;
    const currentData = isEdit ? editingProduct : newProduct;
    const setCurrentData = isEdit ? setEditingProduct : setNewProduct;
    const handleSave = isEdit ? handleSaveEdit : handleSaveAdd;

    return (
      <div className="max-w-4xl mx-auto text-[#061e12]">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleCloseModal} className="text-3xl font-bold hover:text-gray-500 transition">←</button>
          <h1 className="text-2xl font-extrabold tracking-wide">{isEdit ? "Informasi Produk" : "Tambah Produk Baru"}</h1>
        </div>

        <div className="bg-[#f4f5f4] rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-200">
          <div className="mb-8">
            <label className="block text-sm font-extrabold mb-3">Foto Produk</label>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-[#a1c49b] rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-inner overflow-hidden relative">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : "Kosong"}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-[#e6e8e5] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                <span className="text-[10px] font-bold">{isEdit ? "Ubah poto" : "Tambahkan poto"}</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-extrabold mb-2">Nama Produk</label>
              <input type="text" value={currentData.nama_produk} onChange={(e) => setCurrentData({...currentData, nama_produk: e.target.value})} className="w-full bg-[#e2e3e1] px-4 py-2 rounded-md font-medium outline-none focus:ring-2 focus:ring-[#567261]"/>
            </div>
            <div>
              <label className="block text-sm font-extrabold mb-2">Harga</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-medium">Rp</span>
                <input type="number" value={currentData.harga} onChange={(e) => setCurrentData({...currentData, harga: e.target.value})} className="w-full bg-[#e2e3e1] pl-10 pr-4 py-2 rounded-md font-medium outline-none focus:ring-2 focus:ring-[#567261]"/>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-12">
            <button onClick={handleSave} className="bg-[#567261] text-white px-8 py-2 rounded-full font-bold shadow-md">Simpan</button>
            <button onClick={handleCloseModal} className="bg-[#567261] text-white px-8 py-2 rounded-full font-bold shadow-md">Batal</button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN UTAMA: TABEL
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-[#061e12] mb-6">Product</h1>
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <input type="text" placeholder="Cari Nama Produk" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#e9ece6] px-6 py-4 rounded-full font-medium outline-none focus:ring-2 focus:ring-[#c2aa6b] shadow-sm"/>
        </div>
        <button onClick={() => setIsAddMode(true)} className="bg-[#567261] text-white px-6 py-4 rounded-full font-extrabold shadow-sm hover:bg-[#3c5043] transition whitespace-nowrap">+ Tambah Produk</button>
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
                    <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-400 font-bold overflow-hidden">
                      {product.gambar ? <img src={product.gambar} alt={product.nama_produk} className="w-full h-full object-cover" /> : "IMG"}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{product.nama_produk}</p>
                      <p className="text-xs text-gray-500 font-bold mt-1">ID: {product.id_produk}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-sm">Rp{Number(product.harga).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 font-bold text-sm">{product.kategori}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleAvailability(product)} className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${product.is_available ? 'bg-[#567261]' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full transform transition-transform ${product.is_available ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </td>
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