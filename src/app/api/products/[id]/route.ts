import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from 'fs/promises';
import path from 'path';

// Method PUT: Untuk MENGUBAH data (Bisa lewat JSON atau FormData)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params; 
    const productId = parseInt(resolvedParams.id); 
    
    // Cek apakah data yang masuk berupa JSON atau FormData (File)
    const contentType = request.headers.get('content-type') || '';

    // 1. Jika permintaannya dari tombol TOGGLE (Berformat JSON)
    if (contentType.includes('application/json')) {
      const body = await request.json(); 
      const updatedProduct = await prisma.menu.update({
        where: { id_produk: productId },
        data: body,
      });
      return NextResponse.json(updatedProduct, { status: 200 });
    }

    // 2. Jika permintaannya dari FORM EDIT (Berformat FormData / Mengandung File)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const nama_produk = formData.get('nama_produk') as string;
      const harga = formData.get('harga');
      const file = formData.get('gambar') as File | null;

      // Siapkan wadah untuk data yang akan diupdate
      let updateData: any = {};
      if (nama_produk) updateData.nama_produk = nama_produk;
      if (harga) updateData.harga = parseFloat(harga as string);

      // Jika user mengupload gambar baru, proses gambarnya
      if (file && file.name && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueFilename = Date.now() + '-' + file.name.replace(/\s/g, '_');
        const filepath = path.join(process.cwd(), 'public/uploads', uniqueFilename);
        
        await writeFile(filepath, buffer);
        updateData.gambar = `/uploads/${uniqueFilename}`; // Tambahkan URL gambar baru ke database
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

// Method DELETE: Untuk MENGHAPUS data
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    await prisma.menu.delete({ where: { id_produk: productId } });
    return NextResponse.json({ message: "Produk berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}