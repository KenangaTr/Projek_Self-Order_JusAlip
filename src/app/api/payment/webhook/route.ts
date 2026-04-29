import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Menerima "surat" notifikasi dari Midtrans
    const data = await request.json();

    console.log("=========================================");
    console.log("📥 ADA NOTIFIKASI MASUK DARI MIDTRANS!");
    console.log("Order ID :", data.order_id);
    console.log("Status   :", data.transaction_status);
    console.log("=========================================");

    // 2. Mengecek apakah pembayarannya sukses
    // Di Midtrans, status 'settlement' atau 'capture' artinya uang sudah masuk
    if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
      
      console.log("✅ PEMBAYARAN SUKSES! Uang Rp", data.gross_amount, "sudah diterima.");
      
      // CATATAN UNTUK PENGEMBANGAN SELANJUTNYA:
      // Di baris inilah nantinya Anda menaruh kode untuk:
      // 1. Mengubah status transaksi di database menjadi "LUNAS"
      // 2. Memanggil otomatis printer ALGOO Dapur dan Kasir
      
    } else if (data.transaction_status === 'expire') {
      console.log("❌ PEMBAYARAN KEDALUWARSA / BATAL.");
    }

    // 3. Wajib membalas dengan status 200 agar Midtrans tahu pesan sudah kita baca
    return NextResponse.json({ message: "Notifikasi diterima dengan baik" }, { status: 200 });

  } catch (error) {
    console.error("Gagal membaca webhook:", error);
    return NextResponse.json({ error: "Sistem error" }, { status: 500 });
  }
}