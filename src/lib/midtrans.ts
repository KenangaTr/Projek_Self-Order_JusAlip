import midtransClient from 'midtrans-client';

// Kita menggunakan CoreApi karena kita akan membuat QRIS secara kustom di tampilan kita sendiri
export const coreApi = new midtransClient.CoreApi({
  isProduction: false, // 👈 Penting: bernilai true karena kita sudah di Production
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
});