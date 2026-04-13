import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === 'admin' && password === 'admin123') {
      
      // PERUBAHAN DI SINI: Kita wajib memanggil await cookies() terlebih dahulu
      const cookieStore = await cookies();
      
      cookieStore.set('pos_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 Jam
        path: '/',
      });

      return NextResponse.json({ success: true, message: "Login Berhasil" }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "Username atau Password salah!" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}