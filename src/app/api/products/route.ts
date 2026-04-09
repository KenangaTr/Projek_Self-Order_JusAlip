import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Method GET: Untuk mengambil semua data produk (Menu)
export async function GET() {
  try {
    const products = await prisma.menu.findMany({
      orderBy: { id_produk: 'desc' } // Mengurutkan dari yang terbaru
    });
    
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Gagal mengambil data produk:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}