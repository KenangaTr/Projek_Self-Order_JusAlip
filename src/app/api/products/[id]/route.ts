import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Method PUT: Untuk MENGUBAH data (Edit info atau Toggle Ketersediaan)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // PERUBAHAN UTAMA: Kita harus melakukan "await" pada params di Next.js 15+
    const resolvedParams = await params; 
    const productId = parseInt(resolvedParams.id); 
    
    const body = await request.json(); 
    
    const updatedProduct = await prisma.menu.update({
      where: { id_produk: productId },
      data: body,
    });
    
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Gagal update produk:", error);
    return NextResponse.json({ error: "Gagal update data" }, { status: 500 });
  }
}

// Method DELETE: Untuk MENGHAPUS data
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // PERUBAHAN UTAMA: Kita harus melakukan "await" pada params
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    
    await prisma.menu.delete({
      where: { id_produk: productId }
    });
    
    return NextResponse.json({ message: "Produk berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}