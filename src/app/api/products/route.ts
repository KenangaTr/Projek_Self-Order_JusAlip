import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from 'fs/promises';
import path from 'path';

// Method GET: Mengambil data
export async function GET() {
  try {
    // 1. Ambil semua produk aktif
    const allProducts = await prisma.menu.findMany({
      where: { is_available: true }
    });

    // 2. Hitung rentang 30 hari terakhir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 3. Cari 5 Produk Teratas (Top 5)
    const topSellersQuery = await prisma.transaksiItem.groupBy({
      by: ['id_produk'],
      _sum: { jumlah: true },
      where: {
        transaksi: {
          tanggal: { gte: thirtyDaysAgo }
        }
      },
      orderBy: { _sum: { jumlah: 'desc' } },
      take: 5
    });

    const bestSellerIds = topSellersQuery.map(item => item.id_produk);

    // Filter produk mana saja yang masuk kategori best seller
    const bestSellers = allProducts.filter(p => bestSellerIds.includes(p.id_produk));

    return NextResponse.json({
      bestSellers,
      allProducts
    }, { status: 200 });

  } catch (error) {
    console.error("Gagal memuat produk:", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

// Method POST: Menambah data baru + Upload Gambar
export async function POST(request: Request) {
  try {
    // 1. Tangkap FormData dari Klien
    const formData = await request.formData();
    const nama_produk = formData.get('nama_produk') as string;
    const harga = parseFloat(formData.get('harga') as string);
    const file = formData.get('gambar') as File | null;

    let imageUrl = null;

    // 2. Proses File Gambar jika ada
    if (file && file.name) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Buat nama file unik agar tidak tertimpa jika namanya sama
      const uniqueFilename = Date.now() + '-' + file.name.replace(/\s/g, '_');
      
      // Tentukan lokasi simpan (di folder public/uploads)
      const filepath = path.join(process.cwd(), 'public/uploads', uniqueFilename);
      
      // Simpan file secara fisik
      await writeFile(filepath, buffer);
      
      // Simpan rute URL-nya untuk di database
      imageUrl = `/uploads/${uniqueFilename}`;
    }

    // 3. Simpan data ke Database MySQL
    const newProduct = await prisma.menu.create({
      data: {
        nama_produk: nama_produk,
        harga: harga,
        kategori: "Jus",
        is_available: true,
        gambar: imageUrl, // Masukkan URL gambar ke kolom baru
      }
    });
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Gagal menambah produk:", error);
    return NextResponse.json({ error: "Gagal menambah data" }, { status: 500 });
  }
}