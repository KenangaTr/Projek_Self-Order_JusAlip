import { NextResponse } from "next/server";
import { ThermalPrinter, PrinterTypes, CharacterSet } from "node-thermal-printer";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
  interface: '\\\\localhost\\POS58', // <--- Pastikan nama share-nya benar POS58
  characterSet: CharacterSet.PC852_LATIN2,
      removeSpecialCharacters: false,
      lineCharacter: "-",
      width: 32,
    });

    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println("JUS ALIF");
    
    printer.bold(false);
    printer.setTextNormal();
    printer.println("Jl. Puspa Indah 1");
    printer.println("Telp: 0821-2103-3062");
    printer.drawLine(); // Garis putus-putus
    
    printer.alignLeft();
    printer.println(`Kode : ${data.kode_transaksi}`);
    printer.println(`Tgl  : ${new Date(data.tanggal).toLocaleString('id-ID')}`);
    printer.println(`Nama : ${data.nama_pelanggan}`);
    printer.drawLine();

    // Loop Item Belanja
    data.items_detail.forEach((item: any) => {
      printer.println(item.nama_produk);
      
      // Format rata kanan-kiri (1 x 15.000       15.000)
      const qtyPrice = `${item.qty} x ${Number(item.subtotal/item.qty).toLocaleString('id-ID')}`;
      const subtotal = Number(item.subtotal).toLocaleString('id-ID');
      
      printer.leftRight(qtyPrice, subtotal);
    });

    printer.drawLine();
    
    // Total
    printer.bold(true);
    printer.leftRight("TOTAL", `Rp ${Number(data.total_harga).toLocaleString('id-ID')}`);
    printer.bold(false);
    
    printer.leftRight("Metode", data.metode_pembayaran);
    printer.drawLine();

    // Footer
    printer.alignCenter();
    printer.println("Terima Kasih");
    printer.println("Silakan datang kembali");
    
    // Perintah memotong kertas (jika printer support auto-cutter)
    // dan menggulung kertas agar mudah disobek
    printer.newLine();
    printer.newLine();
    printer.newLine();

    printer.beep(); // Opsional: Bunyi beep setelah selesai

    // === EKSEKUSI CETAK (KIRIM KE HARDWARE) ===
    await printer.execute();
    printer.clear();

    return NextResponse.json({ message: "Struk berhasil dicetak!" }, { status: 200 });
  } catch (error) {
    console.error("Gagal mencetak:", error);
    return NextResponse.json({ error: "Gagal berkomunikasi dengan printer" }, { status: 500 });
  }
}