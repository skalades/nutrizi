"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await api.post("/auth/login", formData);
      
      // Store basic user info for UI role-based filtering
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      setStatus("success");
      
      // Small delay for smooth transition
      setTimeout(() => {
        router.push("/");
        router.refresh(); // Refresh to update server-side state if any
      }, 1000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.response?.data?.message || "Login gagal. Periksa kembali username dan password Anda.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4 animate-in fade-in zoom-in duration-700">
            <img 
              src="/assets/logo-nutrizi.png" 
              alt="Nutrizi Logo" 
              className="h-20 w-auto object-contain drop-shadow-xl"
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
            Nutrizi <span className="text-primary font-medium not-italic ml-1">Admin</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium uppercase tracking-widest text-xs">
            Sistem Penyusun Nutrisi (MBG)
          </p>
        </div>

        {/* Login Card */}
        <div className="premium-card bg-white p-8 md:p-10 relative overflow-hidden border-t-4 border-t-primary">
          {status === "success" && (
            <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <p className="font-bold text-primary">Login Berhasil! Mengalihkan...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Nama Pengguna
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                  placeholder="Nama Pengguna"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={status === "loading" || status === "success"}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Kata Sandi
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={status === "loading" || status === "success"}
                />
              </div>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold leading-tight">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full bg-slate-900 hover:bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:hover:bg-slate-900 disabled:cursor-not-allowed group"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  MEMPROSES...
                </>
              ) : (
                <>
                  MASUK DASHBOARD
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm font-medium">
              Lupa sandi? Hubungi <a href="https://wa.me/6285188449304?text=Halo%20IT%20Support%2C%20saya%20lupa%20password%20Nutrizi" target="_blank" rel="noopener noreferrer" className="text-primary font-bold cursor-pointer hover:underline underline-offset-4">IT Support</a>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          Developed by Nadir under SKALADES Group
        </p>
      </div>
    </div>
  );
}
