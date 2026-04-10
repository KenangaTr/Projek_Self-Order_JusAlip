import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_pelanggan, no_telp, total_harga, metode_bayar, cart_items } = body;

    // Membuat kode transaksi unik otomatis (Format: TRX-TahunBulanTanggal-Random)
    const timestamp = Date.now().toString().slice(-6);
    const kodeTrx = `TRX-${timestamp}`;

    const transaksiBaru = await prisma.transaksi.create({
      data: {
        kode_transaksi: kodeTrx,
        nama_pelanggan: nama_pelanggan || "Anonim",
        no_telp: no_telp || "-",
        total_harga: total_harga,
        metode_pembayaran: metode_bayar || "QRIS", // Sesuai kolom skema Anda
        
        // Memasukkan detail barang
        items: {
          create: cart_items.map((item: any) => ({
            id_produk: item.id_produk,
            jumlah: item.qty, // Mapping dari UI 'qty' ke skema Anda 'jumlah'
            subtotal: item.subtotal,
            catatan_dapur: null // Bisa diisi nanti jika ada input khusus di UI
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(transaksiBaru, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan transaksi:", error);
    return NextResponse.json({ error: "Gagal menyimpan riwayat pesanan" }, { status: 500 });
  }
}