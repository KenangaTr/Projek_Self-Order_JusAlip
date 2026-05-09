"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State baru untuk mengontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh(); // Segarkan agar middleware membaca cookie baru
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#061e12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elemen Dekorasi Latar Belakang */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#123524] rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#c2aa6b] rounded-full blur-3xl opacity-20"></div>

      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl relative z-10 border border-gray-100">
        
        {/* Tombol Kembali ke Menu */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 text-gray-400 hover:text-[#061e12] transition-all font-bold mb-8 group w-max"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:bg-[#c2aa6b] group-hover:border-[#c2aa6b] group-hover:text-[#061e12] transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </div>
          <span className="text-sm">Kembali ke Menu</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#061e12] rounded-xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-lg shadow-green-900/30">
            JA
          </div>
          <h1 className="text-3xl font-extrabold text-[#061e12]">Login Admin</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Sistem Point of Sale Jus Alif</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[#061e12] font-bold text-sm mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#e9ece6] text-[#061e12] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#c2aa6b] transition font-medium"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-[#061e12] font-bold text-sm mb-2">Password</label>
            <div className="relative">
              <input 
                // Tipe input berubah secara dinamis berdasarkan state
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#e9ece6] text-[#061e12] px-4 py-3 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-[#c2aa6b] transition font-medium"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#c2aa6b] transition-colors"
                title={showPassword ? "Sembunyikan Password" : "Lihat Password"}
              >
                {showPassword ? (
                  // Ikon Mata Dicoret (Sembunyikan)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Ikon Mata Terbuka (Lihat)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#c2aa6b] text-[#061e12] font-black py-4 rounded-xl mt-4 hover:bg-[#d4bd7e] hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? 'MEMVERIFIKASI...' : 'MASUK DASHBOARD'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8 font-bold uppercase tracking-wider">
          © 2026 Alif POS System
        </p>
      </div>
    </main>
  );
}