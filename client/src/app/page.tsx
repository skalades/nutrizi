"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [period, setPeriod] = useState("daily");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    // Check for user session
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/summary?period=${period}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl animate-spin text-primary">circle_loader</span>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Menyingkronkan Data...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { activeSchools: 0, totalStudents: 0, publishedMenus: 0, qcScore: 0 };
  const activities = data?.recentActivity || [];
  const schedule = data?.upcomingSchedule;
  const allergyAlerts = data?.allergyAlerts || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header with Period Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">Pusat Komando</h2>
          <p className="text-on-surface-variant mt-1 italic tracking-wide">
             {data?.kitchenName 
               ? `Dashboard Operasional: ${data.kitchenName}` 
               : "Pantau operasional gizi dan logistik secara real-time."}
          </p>
        </div>
        
        <div className="bg-surface-container-low p-1.5 rounded-2xl flex border border-black/5 shadow-inner">
          {[
            { id: "daily", label: "Hari Ini" },
            { id: "weekly", label: "Mingguan" },
            { id: "monthly", label: "Bulanan" }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                period === p.id 
                  ? "bg-primary text-white shadow-lg" 
                  : "text-outline hover:text-primary"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Dashboard Left Column */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          
          {/* Summary Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-[2rem] transition-all hover:translate-y-[-4px] shadow-sm border border-black/5 group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-primary-container text-primary rounded-2xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">Global</span>
              </div>
              <p className="text-outline text-[10px] font-black uppercase tracking-widest">Total Penerima Manfaat</p>
              <p className="text-3xl font-black font-headline text-on-surface mt-2">{stats.totalStudents.toLocaleString()}</p>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-[2rem] transition-all hover:translate-y-[-4px] shadow-sm border border-black/5 group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-secondary-container text-secondary rounded-2xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <span className="text-[10px] font-black text-secondary bg-secondary-container/30 px-3 py-1.5 rounded-full uppercase tracking-widest">Aktif</span>
              </div>
              <p className="text-outline text-[10px] font-black uppercase tracking-widest">Sekolah Mitra</p>
              <p className="text-3xl font-black font-headline text-on-surface mt-2">{stats.activeSchools}</p>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-[2rem] transition-all hover:translate-y-[-4px] shadow-sm border border-black/5 group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-tertiary-container text-tertiary rounded-2xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black text-tertiary bg-tertiary-container/30 px-3 py-1.5 rounded-full uppercase tracking-widest">Periode Ini</span>
                </div>
              </div>
              <p className="text-outline text-[10px] font-black uppercase tracking-widest">Menu Sudah Terbit</p>
              <p className="text-3xl font-black font-headline text-on-surface mt-2">{stats.publishedMenus}</p>
            </div>
            
            <div className="bg-emerald-900 p-6 rounded-[2rem] shadow-xl shadow-emerald-900/10 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white/10 text-white rounded-2xl group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <span className="text-[10px] font-black text-white/80 border border-white/20 px-3 py-1.5 rounded-full uppercase tracking-widest">Lulus QC</span>
              </div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest relative z-10">Skor Kepatuhan</p>
              <p className="text-3xl font-black font-headline text-white mt-2 relative z-10">{stats.qcScore}%</p>
            </div>
          </section>

          {/* Hero CTA Section */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-12 flex items-center min-h-[350px] group shadow-2xl shadow-slate-900/20">
            <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] mb-6 border border-white/5">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                 Smart Planner Aktif
              </div>
              <h2 className="text-5xl font-black text-white leading-[1.1] mb-6 font-headline tracking-tight">Optimalkan Rencana Nutrisi Hari Ini.</h2>
              <p className="text-slate-400 mb-10 text-lg leading-relaxed">Mulai siklus menu baru dengan deteksi alergi otomatis dan analisis biaya yang akurat.</p>
              <Link href="/planner" className="inline-flex bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm hover:translate-y-[-4px] transition-all items-center gap-4 shadow-xl shadow-primary/30 active:scale-95">
                Mulai Susun Menu
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
              <img 
                className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
                alt="Healthy meal" 
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
            </div>
          </section>

          {/* Activity Feed Section */}
          <section className="bg-surface-container-lowest p-10 rounded-[3rem] border border-black/5 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black font-headline text-on-surface">Aktivitas Terbaru</h3>
              <button className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-full transition-all">Lihat Semua Riwayat</button>
            </div>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-center py-20 text-outline font-medium italic">Belum ada aktivitas tercatat untuk periode ini.</p>
              ) : activities.map((activity: any, idx: number) => (
                <div key={idx} className="flex gap-6 p-6 hover:bg-surface-container-low rounded-3xl transition-all border border-transparent hover:border-black/5 group">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
                    activity.type === 'MENU_PUBLISHED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                  )}>
                    <span className="material-symbols-outlined text-2xl">
                      {activity.type === 'MENU_PUBLISHED' ? 'publish' : 'school'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-md font-bold text-on-surface group-hover:text-primary transition-colors cursor-pointer">{activity.title}</p>
                    <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">{activity.description}</p>
                    <div className="flex items-center gap-4 mt-4">
                       <p className="text-[10px] text-outline flex items-center gap-1.5 font-black uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[16px]">schedule</span> 
                        {new Date(activity.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 pt-1">
                    <span className={cn(
                      "px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border shadow-sm",
                      activity.type === 'MENU_PUBLISHED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      {activity.type === 'MENU_PUBLISHED' ? 'Operasional' : 'Database'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Dashboard Right Column (Secondary Sidebar) */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
          
          {/* Schedule Widget */}
          <section className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
            
            <div className="flex items-center gap-2 mb-8 text-primary-fixed relative z-10">
              <span className="material-symbols-outlined">calendar_today</span>
              <h3 className="font-black text-[10px] tracking-[0.2em] uppercase">Jadwal Mendatang</h3>
            </div>

            {schedule ? (
              <>
                <div className="space-y-2 relative z-10">
                  <p className="text-3xl font-black font-headline leading-tight">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                    <span>{schedule.school_name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                    <span>Real-time</span>
                  </div>
                </div>
                
                <div className="mt-10 space-y-4 relative z-10">
                  {schedule.items?.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="bg-white/10 p-5 rounded-2xl border border-white/5 hover:bg-white/15 transition-all cursor-pointer group/item">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-fixed mb-1 opacity-60 group-hover/item:opacity-100 transition-opacity">Menu Item</p>
                      <p className="text-sm font-bold leading-snug">{item.portion_name}</p>
                      <p className="text-[10px] mt-2 font-black text-white/40">{item.unit_quantity} {item.unit_name}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-10 text-center space-y-4 relative z-10">
                 <span className="material-symbols-outlined text-4xl opacity-20">event_busy</span>
                 <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Belum ada jadwal hari ini</p>
              </div>
            )}
            
            <Link href="/planner" className="w-full mt-8 py-4 bg-white/5 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all relative z-10 active:scale-95 flex items-center justify-center">
              Lihat Kalender Penuh
            </Link>
          </section>

          {/* Important Reminders */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-4 relative font-headline mb-6">
              Pengingat Penting
              <span className="absolute -bottom-2 left-4 w-6 h-1 bg-primary/20 rounded-full"></span>
            </h3>
            
            {allergyAlerts > 0 && (
              <div className="bg-error-container p-6 rounded-[2rem] border border-error/10 hover:shadow-lg transition-all shadow-error/5 group">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl text-error shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-on-error-container relative flex items-center gap-2">
                       Deteksi Alergi
                       <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                    </p>
                    <p className="text-[11px] text-on-error-container/70 mt-2 leading-relaxed font-bold">
                       Terdeteksi {allergyAlerts} siswa berisiko alergi pada menu yang dijadwalkan hari ini.
                    </p>
                  </div>
                </div>
                <button className="w-full mt-6 py-4 bg-error text-white hover:bg-error/90 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-error/20 active:scale-95">Tinjau Perubahan Sekarang</button>
              </div>
            )}
            
            <div className="bg-surface-container-low p-6 rounded-[2rem] border border-black/5 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl text-secondary shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">trending_down</span>
                </div>
                <div>
                  <p className="text-sm font-black text-on-surface">Variansi Nutrisi</p>
                  <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed font-bold">Semua sekolah terpantau dalam batas toleransi gizi standar.</p>
                </div>
              </div>
            </div>

            {/* Small Info Cards */}
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl shadow-slate-900/10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 font-headline">Integritas Sistem</p>
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-3">
                   <span className="material-symbols-outlined text-[18px] text-emerald-400">api</span> Core API
                </span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-emerald-400">sync</span> Sinkronisasi Cloud
                </span>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">Aktif</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
