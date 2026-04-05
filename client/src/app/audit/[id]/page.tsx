"use client";

import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Printer, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import OrganolepticForm from '@/components/audit/OrganolepticForm';
import DigitalEvidence from '@/components/audit/DigitalEvidence';
import { generateKitchenInstructionPDF, generateQCReportPDF } from '@/utils/ExportPDF';

const AuditDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [scores, setScores] = useState({
    warna: 0,
    aroma: 0,
    tekstur: 0,
    rasa: 0,
    suhu: 0,
  });
  const [suhuPemasakan, setSuhuPemasakan] = useState<number | ''>('');
  const [suhuDistribusi, setSuhuDistribusi] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const signatureRef = useRef<any>(null);

  useEffect(() => {
    fetchMenuDetails();
  }, [id]);

  const fetchMenuDetails = async () => {
    try {
      const response = await api.get(`/menus/daily/${id}`);
      setMenu(response.data);
      
      // If already audited, populate fields
      if (response.data.organoleptic_status !== 'TERTUNDA') {
        setScores({
          warna: response.data.warna_skor,
          aroma: response.data.aroma_skor,
          tekstur: response.data.tekstur_skor,
          rasa: response.data.rasa_skor,
          suhu: response.data.suhu_skor,
        });
        setSuhuPemasakan(response.data.suhu_pemasakan || '');
        setSuhuDistribusi(response.data.suhu_distribusi || '');
        setNotes(response.data.catatan_qc || '');
        setPhoto(response.data.foto_menu_url || null);
        setSavedSignature(response.data.tanda_tangan_digital || null);
      }
    } catch (error) {
      console.error('Error fetching menu details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (menu) generateKitchenInstructionPDF(menu);
  };

  const handleShareWA = () => {
    if (!menu) return;
    const dateStr = format(new Date(menu.menu_date), 'dd/MM/yyyy');
    const text = `📋 *NUTRIZI - LAPORAN MENU*\n\n🏫 *Sekolah:* ${menu.school_name}\n📅 *Tanggal:* ${dateStr}\n✅ *Status QC:* ${menu.organoleptic_status || 'Belum Diuji'}\n🍽️ *Produksi:* ${menu.total_production} Porsi\n\nLihat Detail: ${window.location.origin}/audit/${menu.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSubmit = async (finalStatus: string) => {
    if (scores.warna === 0 || scores.aroma === 0 || scores.tekstur === 0 || scores.rasa === 0 || scores.suhu === 0) {
      alert('Mohon lengkapi semua penilaian skor organoleptik.');
      return;
    }

    if (suhuPemasakan === '' || suhuDistribusi === '') {
      alert('Mohon lengkapi input suhu kuantitatif (Pemasakan & Distribusi).');
      return;
    }

    if (Number(suhuPemasakan) < 75 || Number(suhuDistribusi) < 60) {
      const confirmWarning = window.confirm('Peringatan: Suhu tercatat berada di Danger Zone (Kurang dari standar Kemenkes/HACCP). Apakah Anda yakin ingin menyimpan form dengan data ini?');
      if (!confirmWarning) return;
    }

    if (!photo) {
      alert('Mohon ambil foto menu matang sebagai bukti fisik.');
      return;
    }

    if (signatureRef.current?.isEmpty()) {
      alert('Mohon berikan tanda tangan digital sebagai verifikasi.');
      return;
    }

    setSubmitting(true);
    try {
      const signature = signatureRef.current.getTrimmedCanvas().toDataURL('image/png');
      const auditStatus = Object.values(scores).every(s => s >= 3) ? 'LULUS' : 'GAGAL';

      await api.post(`/menus/daily/${id}/audit`, {
        organoleptic_status: auditStatus,
        warna_skor: scores.warna,
        aroma_skor: scores.aroma,
        tekstur_skor: scores.tekstur,
        rasa_skor: scores.rasa,
        suhu_skor: scores.suhu,
        suhu_pemasakan: Number(suhuPemasakan),
        suhu_distribusi: Number(suhuDistribusi),
        catatan_qc: notes,
        foto_menu_url: photo,
        tanda_tangan_digital: signature,
        status: finalStatus
      });

      setSuccess(true);
      setTimeout(() => router.push('/audit'), 2000);
    } catch (error) {
      console.error('Error submitting audit:', error);
      alert('Gagal menyimpan audit. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Memuat rincian menu...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-32">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"
      >
        <ArrowLeft size={18} /> Kembali ke Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Audit: {menu.school_name}</h1>
          <p className="text-lg text-slate-500">
            Jadwal Menu: <span className="font-bold text-emerald-600">{format(new Date(menu.menu_date), 'EEEE, dd MMMM yyyy', { locale: localeID })}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={handlePrint}
             className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-sm"
           >
             <Printer size={20} /> Cetak Instruksi
           </button>
           {menu.organoleptic_status && menu.organoleptic_status !== 'TERTUNDA' && (
             <button 
               onClick={() => generateQCReportPDF(menu)}
               className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white border border-indigo-700 rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-sm"
             >
               <CheckCircle size={20} /> Cetak Laporan QC
             </button>
           )}
           <button 
             onClick={handleShareWA}
             className="flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl hover:bg-emerald-200 transition-all font-bold shadow-sm"
           >
             <Share2 size={20} /> Share WA
           </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-emerald-500 text-white p-3 rounded-full">
            <CheckCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Audit Berhasil Disimpan!</h3>
            <p className="font-medium">Data berhasil diperbarui. Mengalihkan kembali ke dashboard...</p>
          </div>
        </div>
      )}

      {/* Menu Detail Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">Target Siswa</p>
          <h4 className="text-2xl font-bold">{menu.total_beneficiaries} <span className="text-sm font-normal text-slate-400">Penerima</span></h4>
        </div>
        
        <div className="relative z-10 border-l border-white/10 md:pl-6">
          <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">Total Produksi</p>
          <h4 className="text-2xl font-bold">{menu.total_production} <span className="text-sm font-normal text-slate-400">Porsi</span></h4>
        </div>

        <div className="relative z-10 border-l border-white/10 md:pl-6">
          <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">Logistik Tambahan</p>
          <h4 className="text-2xl font-bold">+{menu.buffer_portions + menu.organoleptic_portions} <span className="text-sm font-normal text-slate-400">Buffer/Sampling</span></h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <OrganolepticForm 
          scores={scores} 
          setScores={setScores}
          suhuPemasakan={suhuPemasakan}
          setSuhuPemasakan={setSuhuPemasakan}
          suhuDistribusi={suhuDistribusi}
          setSuhuDistribusi={setSuhuDistribusi}
          notes={notes} 
          setNotes={setNotes} 
        />
        <DigitalEvidence 
          photo={photo} 
          setPhoto={setPhoto} 
          signatureRef={signatureRef} 
          savedSignature={savedSignature}
        />
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 flex items-center justify-center gap-4">
        <button 
          onClick={() => handleSubmit('DIPUBLIKASIKAN')}
          className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="animate-spin" /> : <Save />}
          SELESAIKAN & PUBLIKASIKAN MENU
        </button>
        <button 
          onClick={() => handleSubmit('DRAFT')}
          className="px-10 py-4 bg-white border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
          disabled={submitting}
        >
          SIMPAN SEBAGAI DRAFT
        </button>
      </div>

      <div className="mt-12 bg-amber-50 border border-amber-200 p-6 rounded-3xl flex gap-4">
        <AlertCircle className="text-amber-600 shrink-0" size={24} />
        <div>
          <h5 className="font-bold text-amber-900">Peringatan Akuntabilitas</h5>
          <p className="text-sm text-amber-800">Setiap data yang Anda masukkan merupakan bukti sah audit digital. Pastikan foto dan tanda tangan sesuai dengan kondisi riil di dapur lapangan.</p>
        </div>
      </div>
    </div>
  );
};

export default AuditDetailPage;
