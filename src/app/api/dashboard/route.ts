import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '30days';

    let startDate = new Date();
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    let daysCount = 30; // Default untuk loop tanggal

    // Tentukan Rentang Waktu
    if (filter === 'today') {
      startDate.setHours(0, 0, 0, 0);
      daysCount = 1;
    } else if (filter === 'yesterday') {
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      daysCount = 1;
    } else if (filter === '7days') {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      daysCount = 7;
    } else { // 30days
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      daysCount = 30;
    }

    const dateFilter = { tanggal: { gte: startDate, lte: endDate } };

    // --- AGREGAT STATISTIK KOTAK ATAS ---
    const totalTransaksi = await prisma.transaksi.count({ where: dateFilter });
    const agregatPendapatan = await prisma.transaksi.aggregate({ _sum: { total_harga: true }, where: dateFilter });
    const totalPendapatan = agregatPendapatan._sum.total_harga || 0;
    const agregatItem = await prisma.transaksiItem.aggregate({ _sum: { jumlah: true }, where: { transaksi: dateFilter } });
    const totalItemTerjual = agregatItem._sum.jumlah || 0;

    // --- DATA BAR CHART (Top Menu) ---
    const produkTerlaris = await prisma.transaksiItem.groupBy({
      by: ['id_produk'], _sum: { jumlah: true }, where: { transaksi: dateFilter },
      orderBy: { _sum: { jumlah: 'desc' } }, take: 5
    });
    const idProdukArray = produkTerlaris.map(p => p.id_produk);
    const dataMenu = await prisma.menu.findMany({ where: { id_produk: { in: idProdukArray } } });
    const grafikPenjualan = produkTerlaris.map(item => ({
      name: dataMenu.find(m => m.id_produk === item.id_produk)?.nama_produk || 'Produk Dihapus',
      total: item._sum.jumlah || 0
    }));

    // ==========================================
    // LOGIKA UPDATE: MENGHITUNG TOTAL, TRANSAKSI, & ITEMS
    // ==========================================
    const recentTrx = await prisma.transaksi.findMany({
      where: dateFilter, 
      orderBy: { tanggal: 'asc' },
      include: {
        items: true // <-- Penting: Ikut sertakan keranjang belanjanya
      }
    });

    const trendMap = new Map();

    if (filter === 'today' || filter === 'yesterday') {
      // 1. Siapkan 24 Jam Penuh
      for (let i = 0; i < 24; i++) {
        const hour = `${i.toString().padStart(2, '0')}:00`;
        trendMap.set(hour, { total: 0, transactions: 0, items: 0 });
      }
      
      // 2. Isi timeline dengan data
      recentTrx.forEach(trx => {
        const hour = `${new Date(trx.tanggal).getHours().toString().padStart(2, '0')}:00`;
        if (trendMap.has(hour)) {
          const currentData = trendMap.get(hour);
          const totalCupDiTransaksiIni = trx.items.reduce((sum: number, item: any) => sum + item.jumlah, 0);

          trendMap.set(hour, {
            total: currentData.total + Number(trx.total_harga),
            transactions: currentData.transactions + 1,
            items: currentData.items + totalCupDiTransaksiIni
          });
        }
      });
    } else {
      // 1. Siapkan Tanggal Penuh
      for (let i = 0; i < daysCount; i++) {
        const loopDate = new Date(startDate);
        loopDate.setDate(loopDate.getDate() + i);
        const dateLabel = loopDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        trendMap.set(dateLabel, { total: 0, transactions: 0, items: 0 });
      }
      
      // 2. Isi timeline dengan data
      recentTrx.forEach(trx => {
        const dateLabel = new Date(trx.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (trendMap.has(dateLabel)) {
          const currentData = trendMap.get(dateLabel);
          const totalCupDiTransaksiIni = trx.items.reduce((sum: number, item: any) => sum + item.jumlah, 0);

          trendMap.set(dateLabel, {
            total: currentData.total + Number(trx.total_harga),
            transactions: currentData.transactions + 1,
            items: currentData.items + totalCupDiTransaksiIni
          });
        }
      });
    }

    // Format hasil akhirnya agar siap dibaca oleh Recharts di Frontend
    const trendPendapatan = Array.from(trendMap, ([date, data]) => ({ 
      date, 
      total: data.total,
      transactions: data.transactions,
      items: data.items
    }));
    // ==========================================

    // --- DATA PIE CHART & TABEL ---
    const metodeBeli = await prisma.transaksi.groupBy({
      by: ['metode_pembayaran'], where: dateFilter, _count: { _all: true }
    });
    const grafikMetode = metodeBeli.map(m => ({
      name: m.metode_pembayaran, value: m._count._all
    }));

    // PERUBAHAN DI SINI: take: 5 dihapus!
    const transaksiTerbaru = await prisma.transaksi.findMany({
      where: dateFilter, 
      orderBy: { tanggal: 'desc' } // Tetap diurutkan dari yang paling baru
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