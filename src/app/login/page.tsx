"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#e9ece6] text-[#061e12] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#c2aa6b] transition font-medium"
              placeholder="••••••••"
              required
            />
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