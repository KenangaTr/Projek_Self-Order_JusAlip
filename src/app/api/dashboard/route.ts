import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const totalTransaksi = await prisma.transaksi.count();
    
    const agregatPendapatan = await prisma.transaksi.aggregate({ _sum: { total_harga: true } });
    const totalPendapatan = agregatPendapatan._sum.total_harga || 0;

    const agregatItem = await prisma.transaksiItem.aggregate({ _sum: { jumlah: true } });
    const totalItemTerjual = agregatItem._sum.jumlah || 0;

    // 1. Data Bar Chart: Top 5 Menu
    const produkTerlaris = await prisma.transaksiItem.groupBy({
      by: ['id_produk'], _sum: { jumlah: true }, orderBy: { _sum: { jumlah: 'desc' } }, take: 5
    });
    const idProdukArray = produkTerlaris.map(p => p.id_produk);
    const dataMenu = await prisma.menu.findMany({ where: { id_produk: { in: idProdukArray } } });
    const grafikPenjualan = produkTerlaris.map(item => ({
      name: dataMenu.find(m => m.id_produk === item.id_produk)?.nama_produk || 'Produk Dihapus',
      total: item._sum.jumlah || 0
    }));

    // 2. Data Line Chart: Tren Pendapatan (Berdasarkan Tanggal)
    const recentTrx = await prisma.transaksi.findMany({
      orderBy: { tanggal: 'asc' }, take: 30 // Ambil 30 trx terakhir
    });
    const trendMap = new Map();
    recentTrx.forEach(trx => {
      // Format tanggal jadi "10 Apr" dll
      const date = new Date(trx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      trendMap.set(date, (trendMap.get(date) || 0) + Number(trx.total_harga));
    });
    const trendPendapatan = Array.from(trendMap, ([date, total]) => ({ date, total }));

    // 3. Data Pie Chart: Metode Pembayaran
    const metodeBeli = await prisma.transaksi.groupBy({
      by: ['metode_pembayaran'], _count: { _all: true }
    });
    const grafikMetode = metodeBeli.map(m => ({
      name: m.metode_pembayaran, value: m._count._all
    }));

    // 4. Data Tabel: 5 Transaksi Terakhir
    const transaksiTerbaru = await prisma.transaksi.findMany({
      take: 5, orderBy: { tanggal: 'desc' }
    });

    return NextResponse.json({
      totalTransaksi, totalPendapatan, totalItemTerjual,
      grafikPenjualan, trendPendapatan, grafikMetode, transaksiTerbaru
    }, { status: 200 });

  } catch (error) {
    console.error("Gagal mengambil data dashboard:", error);
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 });
  }
}