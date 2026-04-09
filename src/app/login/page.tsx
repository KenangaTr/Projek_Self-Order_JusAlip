"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Saat ini kita buat bypass login sementara untuk keperluan UI Testing
    // Nanti akan diganti dengan validasi ke database menggunakan Prisma
    if (username === "admin" && password === "admin") {
      router.push("/dashboard"); // Jika sukses, arahkan ke dashboard
    } else {
      alert("Username atau Password salah! (Coba: admin / admin)");
    }
  };

  return (
    <main className="min-h-screen bg-[#061e12] flex items-center justify-center p-4 relative">
      
      {/* Background Gradient Opsional untuk mempermanis */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#123524] via-[#061e12] to-[#061e12] opacity-50"></div>

      {/* Kotak Form Login */}
      <div className="bg-[#0b2617] p-10 rounded-[2rem] shadow-2xl w-full max-w-sm z-10 border border-[#163d27]">
        
        {/* Judul Aplikasi */}
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-extrabold tracking-wide mb-1" style={{ fontFamily: 'cursive' }}>
            Jus Alif
          </h1>
        </div>

        {/* Form Input */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-gray-300 text-xs mb-2 block font-medium">Login Sebagai Admin</label>
            <input 
              type="text" 
              placeholder="Masukan Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#e9ece6] text-[#061e12] px-4 py-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c2aa6b]"
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Masukan Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#e9ece6] text-[#061e12] px-4 py-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c2aa6b]"
              required
            />
          </div>

          {/* Tombol Aksi */}
          <div className="pt-6 space-y-3">
            <button 
              type="submit" 
              className="w-full border border-[#c2aa6b] text-[#c2aa6b] font-bold py-2 rounded-full hover:bg-[#c2aa6b] hover:text-[#061e12] transition duration-300"
            >
              Masuk
            </button>
            <Link 
              href="/" 
              className="w-full flex justify-center border border-[#c2aa6b] text-[#c2aa6b] font-bold py-2 rounded-full hover:bg-[#c2aa6b] hover:text-[#061e12] transition duration-300"
            >
              Kembali
            </Link>
          </div>
        </form>

        {/* Ikon Gelas Jus Bawah (Placeholder) */}
        <div className="mt-10 flex justify-center opacity-70">
           <div className="w-8 h-10 border-2 border-white rounded-b-lg flex flex-col items-center justify-end text-white text-[8px] font-bold pb-1 relative">
              <div className="absolute top-1 left-2 w-1 h-3 bg-white -rotate-12"></div> {/* Sedotan */}
              JUS<br/>ALIF
           </div>
        </div>

      </div>
    </main>
  );
}