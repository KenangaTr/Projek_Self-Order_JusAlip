import { NextResponse } from "next/server";
import { coreApi } from "@/lib/midtrans"; // Memanggil jembatan Midtrans yang kita buat di Tahap 2

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Siapkan data transaksi untuk dikirim ke Midtrans
    const parameter = {
      payment_type: "qris",
      transaction_details: {
        // Kita tambahkan Date.now() agar Order ID selalu unik.
        // Midtrans akan menolak jika kita mengirim Order ID yang sama dua kali.
        order_id: `${data.kode_transaksi}-${Date.now()}`,
        gross_amount: data.total_harga,
      },
      customer_details: {
        first_name: data.nama_pelanggan || "Pelanggan Jus Alif",
      },
    };

    // 2. Tembak data ke API Midtrans
    // ... kode atas tetap sama ...
    const response = await coreApi.charge(parameter);

    // Ambil URL gambar
    const qrImageUrl = response.actions?.find(
      (action: any) => action.name === "generate-qr-code",
    )?.url;

    // Ambil QR String mentah (Ini yang dibutuhkan simulator)
    const rawQrString = response.qr_string; // 👈 Tambahan ini

    if (!qrImageUrl) {
      return NextResponse.json(
        { error: "Gagal mendapatkan data QRIS" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        qrUrl: qrImageUrl,
        qrString: rawQrString, // 👈 Kirim ke frontend
        midtransOrderId: parameter.transaction_details.order_id,
      },
      { status: 200 },
    );
    // ... kode bawah tetap sama ...
  } catch (error: any) {
    console.error("Error API Midtrans:", error.message);
    return NextResponse.json(
      { error: "Gagal memproses QRIS" },
      { status: 500 },
    );
  }
}
