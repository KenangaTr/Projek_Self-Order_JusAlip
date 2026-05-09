import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  // Tipe datanya disesuaikan menjadi Promise untuk Next.js 15
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // KUNCI PERBAIKANNYA DI SINI: Kita 'await' params-nya dulu
    const resolvedParams = await params;
    const id_transaksi = Number(resolvedParams.id);

    // Prisma akan otomatis menghapus item terkait berkat onDelete: Cascade di schema
    await prisma.transaksi.delete({
      where: { 
        id_transaksi: id_transaksi 
      },
    });

    return NextResponse.json({ message: "Transaksi berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus transaksi:", error);
    return NextResponse.json({ error: "Sistem gagal menghapus data" }, { status: 500 });
  }
}