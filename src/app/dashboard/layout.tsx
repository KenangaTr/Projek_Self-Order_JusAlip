"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Untuk mendeteksi kita sedang di halaman mana

  return (
    <div className="min-h-screen bg-[#f5f7f5] flex">
      
      {/* === SIDEBAR KIRI === */}
      <aside className="w-64 bg-[#e9ece6] flex flex-col py-8 shadow-md z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-10 h-12 border-2 border-[#061e12] rounded-md flex items-center justify-center text-[#061e12] font-bold text-xs text-center">
            Jus<br/>Alif
          </div>
        </div>

        {/* Menu Navigasi */}
        <nav className="w-full flex flex-col gap-2 pr-6">
          <Link 
            href="/dashboard" 
            className={`px-8 py-4 rounded-r-full font-extrabold transition ${pathname === '/dashboard' ? 'bg-[#567261] text-white' : 'text-gray-500 hover:text-[#061e12]'}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/dashboard/product" 
            className={`px-8 py-4 rounded-r-full font-extrabold transition ${pathname === '/dashboard/product' ? 'bg-[#567261] text-white' : 'text-gray-500 hover:text-[#061e12]'}`}
          >
            Product
          </Link>
          
          <div className="mt-8">
            <Link 
              href="/" 
              className="px-8 py-4 font-extrabold text-gray-500 hover:text-red-700 transition block"
            >
              Logout
            </Link>
          </div>
        </nav>
      </aside>

      {/* === KONTEN UTAMA KANAN === */}
      <main className="flex-1 p-10 overflow-y-auto text-[#061e12]">
        {children}
      </main>

    </div>
  );
}