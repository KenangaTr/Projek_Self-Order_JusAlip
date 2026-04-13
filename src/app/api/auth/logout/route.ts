import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // Menghapus cookie secara permanen dari browser
  cookieStore.delete('pos_session');
  
  return NextResponse.json({ success: true, message: "Session dihapus" });
}