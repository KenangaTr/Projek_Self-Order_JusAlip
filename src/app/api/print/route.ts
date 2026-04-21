import { NextResponse } from "next/server";
import { ThermalPrinter, PrinterTypes, CharacterSet } from "node-thermal-printer";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const printerKasir = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: '//localhost/ALGOO_KASIR',
      characterSet: CharacterSet.PC852_LATIN2,
      removeSpecialCharacters: false,
    });

    const printerDapur = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: '//localhost/ALGOO_DAPUR',
      characterSet: CharacterSet.PC852_LATIN2,
      removeSpecialCharacters: false,
    });

    // --- STRUK KASIR ---
    printerKasir.alignCenter();
    printerKasir.bold(true);
    printerKasir.setTextSize(1, 1);
    printerKasir.println("JUS ALIF");
    printerKasir.setTextSize(0, 0);
    printerKasir.bold(false);
    printerKasir.println("Jl. Siliwangi Tasikmalaya");
    printerKasir.println("Telp: 0812-3456-7890");
    printerKasir.println("--------------------------------");
    
    printerKasir.alignLeft();
    printerKasir.println(`Kode : ${data.kode_transaksi}`);
    printerKasir.println(`Tgl  : ${new Date(data.tanggal).toLocaleString('id-ID')}`);
    printerKasir.println(`Nama : ${data.nama_pelanggan}`);
    printerKasir.println("--------------------------------");
    
    data.items_detail.forEach((item: any) => {
      printerKasir.println(`${item.nama_produk}`);
      printerKasir.println(`${item.qty} x ${Number(item.subtotal/item.qty).toLocaleString('id-ID')}    ${Number(item.subtotal).toLocaleString('id-ID')}`);
    });
    
    printerKasir.println("--------------------------------");
    printerKasir.bold(true);
    printerKasir.println(`TOTAL       Rp ${Number(data.total_harga).toLocaleString('id-ID')}`);
    printerKasir.bold(false);
    printerKasir.println(`Metode      ${data.metode_pembayaran}`);
    printerKasir.println("--------------------------------");
    printerKasir.alignCenter();
    printerKasir.println("Terima Kasih");
    printerKasir.println("Silakan datang kembali");
    printerKasir.newLine();
    printerKasir.newLine();

    // --- STRUK DAPUR ---
    printerDapur.alignCenter();
    printerDapur.bold(true);
    printerDapur.println("=== PESANAN DAPUR ===");
    printerDapur.bold(false);
    printerDapur.println("--------------------------------");
    
    printerDapur.alignLeft();
    printerDapur.println(`Kode : ${data.kode_transaksi}`);
    printerDapur.println(`Jam  : ${new Date(data.tanggal).toLocaleTimeString('id-ID')}`);
    printerDapur.setTextSize(1, 1);
    printerDapur.println(`NAMA: ${data.nama_pelanggan.toUpperCase()}`);
    printerDapur.setTextSize(0, 0);
    printerDapur.println("--------------------------------");
    
    printerDapur.bold(true);
    data.items_detail.forEach((item: any) => {
      printerDapur.println(`[ ${item.qty} ] x ${item.nama_produk.toUpperCase()}`);
    });
    printerDapur.bold(false);
    
    printerDapur.println("--------------------------------");
    printerDapur.alignCenter();
    printerDapur.println("--- SEGERA DIBUAT ---");
    printerDapur.newLine();
    printerDapur.newLine();

    // --- EKSEKUSI ---
    try {
      await printerKasir.execute();
      printerKasir.clear();
      console.log("Struk Kasir Sukses");
    } catch (err) {
      console.error("Gagal cetak Kasir:", err);
    }

    try {
      await printerDapur.execute();
      printerDapur.clear();
      console.log("Struk Dapur Sukses");
    } catch (err) {
      console.error("Gagal cetak Dapur:", err);
    }

    return NextResponse.json({ message: "Selesai" }, { status: 200 });

  } catch (error) {
    console.error("Error Sistem Cetak:", error);
    return NextResponse.json({ error: "Sistem error" }, { status: 500 });
  }
}