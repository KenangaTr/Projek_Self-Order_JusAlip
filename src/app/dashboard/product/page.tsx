"use client";

import { useState, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";

// --- HELPER FUNCTION UNTUK MENGAMBIL HASIL CROP ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Canvas is empty"));
      resolve(blob);
    }, "image/jpeg");
  });
}
// -------------------------------------------------

export default function ProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [isAddMode, setIsAddMode] = useState(false);
  const [newProduct, setNewProduct] = useState({ nama_produk: "", harga: "" });
  
  // State untuk Upload & Preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State khusus Cropper
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (data.allProducts) setProducts(data.allProducts);
        else setProducts(data);
      }
    } catch (error) { console.error("Gagal memuat:", error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // 1. Saat gambar dipilih, masukkan ke Cropper dulu (jangan langsung di-save)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempImage(URL.createObjectURL(file));
      setShowCropper(true);
      // Reset Input agar bisa milih file yang sama lagi jika batal
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // 2. Saat user klik "Simpan Potongan"
  const handleSaveCrop = async () => {
    if (!tempImage || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
      const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" });
      
      setImageFile(file); // Ini yang akan dikirim ke server
      setImagePreview(URL.createObjectURL(file)); // Ini yang ditampilkan di form
      setShowCropper(false);
      setTempImage(null);
    } catch (e) {
      console.error(e);
      alert("Gagal memotong gambar");
    }
  };

  // Fungsi Reset Modal
  const handleCloseModal = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setShowCropper(false);
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
    setImagePreview(product.gambar || null); 
    setImageFile(null); 
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct.nama_produk || !editingProduct.harga) return alert("Nama dan Harga harus diisi!");
    
    const formData = new FormData();
    formData.append('nama_produk', editingProduct.nama_produk);
    formData.append('harga', editingProduct.harga);
    if (imageFile) formData.append('gambar', imageFile); 

    try {
      const res = await fetch(`/api/products/${editingProduct.id_produk}`, {
        method: 'PUT',
        body: formData 
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
  // TAMPILAN: FORM EDIT & TAMBAH
  // ==========================================
  if (isAddMode || isEditMode) {
    const isEdit = isEditMode;
    const currentData = isEdit ? editingProduct : newProduct;
    const setCurrentData = isEdit ? setEditingProduct : setNewProduct;
    const handleSave = isEdit ? handleSaveEdit : handleSaveAdd;

    return (
      <div className="max-w-4xl mx-auto text-[#061e12] relative">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleCloseModal} className="text-3xl font-bold hover:text-gray-500 transition">←</button>
          <h1 className="text-2xl font-extrabold tracking-wide">{isEdit ? "Informasi Produk" : "Tambah Produk Baru"}</h1>
        </div>

        <div className="bg-[#f4f5f4] rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-200">
          <div className="mb-8">
            <label className="block text-sm font-extrabold mb-3">Foto Produk (Rasio 1:1)</label>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-[#a1c49b] rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-inner overflow-hidden relative border border-gray-300">
                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : "Kosong"}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-[#e6e8e5] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <span className="text-2xl mb-1">+</span>
                <span className="text-[10px] font-bold">Pilih Foto</span>
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

        {/* --- MODAL CROPPER --- */}
        {showCropper && tempImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-[2rem] w-full max-w-md shadow-2xl">
              <h3 className="font-extrabold text-xl text-center mb-2">Sesuaikan Potongan</h3>
              <p className="text-xs text-gray-500 text-center mb-6">Geser dan zoom gambar agar pas di dalam kotak 1:1</p>
              
              <div className="relative w-full h-72 bg-gray-100 rounded-2xl overflow-hidden mb-6 border border-gray-200">
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // MEMAKSA RASIO KOTAK 1:1
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 mb-2 block">Zoom:</label>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-[#567261]" />
              </div>

              <div className="flex gap-4 w-full">
                <button onClick={() => setShowCropper(false)} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition">Batal</button>
                <button onClick={handleSaveCrop} className="flex-1 py-3 rounded-full bg-[#567261] text-white font-bold shadow-md hover:bg-[#435a4c] transition">Simpan Potongan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // TAMPILAN UTAMA: TABEL (Tidak berubah)
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
                    <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-400 font-bold overflow-hidden aspect-square">
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