import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from 'fs/promises';
import path from 'path';

// Method PUT: Untuk MENGUBAH data
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params; 
    const productId = parseInt(resolvedParams.id); 
    
    const contentType = request.headers.get('content-type') || '';

    // 1. Jika permintaannya dari tombol TOGGLE (JSON)
    if (contentType.includes('application/json')) {
      const body = await request.json(); 
      const updatedProduct = await prisma.menu.update({
        where: { id_produk: productId },
        data: body,
      });
      return NextResponse.json(updatedProduct, { status: 200 });
    }

    // 2. Jika permintaannya dari FORM EDIT (FormData / File)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const nama_produk = formData.get('nama_produk') as string;
      const harga = formData.get('harga');
      const file = formData.get('gambar') as File | null;

      let updateData: any = {};
      if (nama_produk) updateData.nama_produk = nama_produk;
      if (harga) updateData.harga = parseFloat(harga as string);

      if (file && file.name && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueFilename = Date.now() + '-' + file.name.replace(/\s/g, '_');
        const filepath = path.join(process.cwd(), 'public/uploads', uniqueFilename);
        
        await writeFile(filepath, buffer);
        updateData.gambar = `/uploads/${uniqueFilename}`; 
      }

      const updatedProduct = await prisma.menu.update({
        where: { id_produk: productId },
        data: updateData,
      });
      return NextResponse.json(updatedProduct, { status: 200 });
    }

    return NextResponse.json({ error: "Format tidak didukung" }, { status: 400 });

  } catch (error) {
    console.error("Gagal update produk:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// Method DELETE: Untuk MENGHAPUS data (Sudah Diperbaiki untuk Next.js 15+)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 Perbaikan: Gunakan Promise
) {
  // Ambil ID di awal agar bisa digunakan di try maupun catch
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);

  try {
    // 1. KITA COBA HAPUS PERMANEN DULU
    await prisma.menu.delete({ 
      where: { id_produk: productId } 
    });
    
    return NextResponse.json({ message: "Produk berhasil dihapus permanen" }, { status: 200 });

  } catch (error: any) {
    // 2. TANGKAP ERROR P2003 (Foreign Key Constraint / Riwayat Transaksi)
    if (error.code === 'P2003') {
      console.log("Produk ada di riwayat transaksi. Melakukan Soft Delete...");
      
      // Lakukan "Soft Delete" dengan mematikan is_available
      await prisma.menu.update({
        where: { id_produk: productId },
        data: { is_available: false }
      });

      return NextResponse.json({ 
        message: "Produk diarsipkan karena ada riwayat transaksi" 
      }, { status: 200 });
    }

    console.error("Gagal menghapus produk:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}