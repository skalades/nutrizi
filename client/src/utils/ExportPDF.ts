import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

export const generateKitchenInstructionPDF = (menu: any) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(menu.menu_date), 'EEEE, dd MMMM yyyy', { locale: localeID });
  const slate800: [number, number, number] = [30, 41, 59];
  const slate500: [number, number, number] = [100, 116, 139];
  const emerald500: [number, number, number] = [16, 185, 129];
  const amber500: [number, number, number] = [245, 158, 11];

  // Header Box
  doc.setFillColor(...emerald500);
  doc.rect(0, 0, 210, 8, 'F');
  
  // Logo
  try {
    doc.addImage('/assets/logo-pdf.png', 'PNG', 15, 12, 16, 16);
  } catch (e) {
    console.error('Failed to load PDF logo:', e);
  }

  // Header Text
  doc.setFontSize(20);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text('DOKUMEN LOGISTIK & INSTRUKSI DAPUR', 38, 21);
  
  doc.setFontSize(10);
  doc.setTextColor(...slate500);
  doc.setFont("helvetica", "normal");
  const subHeader = menu.kitchen_name 
    ? `${menu.kitchen_name} | Program Makan Bergizi`
    : 'Program Pemberian Makanan Bergizi';
  doc.text(subHeader, 38, 27);
  
  // Separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);

  // Info Cards Section
  // Box 1: Location & Target
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 42, 115, 32, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(...slate500);
  doc.text('INFORMASI DISTRIBUSI', 20, 50);
  
  doc.setFontSize(11);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text(menu.school_name, 20, 56);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tanggal: ${dateStr}`, 20, 62);
  
  const studentCount = menu.school?.total_beneficiaries || 0;
  const teacherCount = menu.school?.total_teachers || 0;
  doc.text(`Penerima: ${studentCount} Siswa | ${teacherCount} Guru/Staf`, 20, 68);

  // Box 2: Production metrics
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(135, 42, 60, 32, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.setFont("helvetica", "bold");
  doc.text('TOTAL PORSI PRODUKSI', 165, 52, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(`${menu.total_production} Porsi`, 165, 62, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`(Target + Buffer: ${menu.buffer_portions} + QC: ${menu.organoleptic_portions})`, 165, 68, { align: 'center' });

  // Line separator
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 82, 195, 82);

  // Items Table - Section 1: PORSI KECIL
  doc.setFontSize(11);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text('A. INSTRUKSI PORSI KECIL (PAUD / SD)', 15, 92);

  const tableSmall = menu.items.map((item: any) => {
    const wS = parseFloat(item.weight_small) || 0;
    const yieldFact = parseFloat(item.yield_factor) || 1.0;
    const cookedS = wS * yieldFact;
    
    // SRT Display (Cooked)
    let srtDisp = item.unit_name?.toLowerCase() === 'gram' ? `${cookedS.toFixed(0)} g` : `${item.unit_quantity || 0} ${item.unit_name || ''}`;
    
    return [
      item.food_name || item.portion_name,
      srtDisp,
      `${wS.toFixed(1)} g`
    ];
  });

  autoTable(doc, {
    startY: 96,
    head: [['Bahan Utama', 'Takaran Matang (SRT)', 'Berat Mentah']],
    body: tableSmall,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
    margin: { left: 15, right: 15 }
  });

  // Items Table - Section 2: PORSI BESAR
  const nextY2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text('B. INSTRUKSI PORSI BESAR (SMP / SMA / GURU)', 15, nextY2);

  const tableLarge = menu.items.map((item: any) => {
    const wL = parseFloat(item.weight_large) || 0;
    const yieldFact = parseFloat(item.yield_factor) || 1.0;
    const cookedL = wL * yieldFact;
    
    // SRT Display (Cooked)
    let srtDisp = item.unit_name?.toLowerCase() === 'gram' ? `${cookedL.toFixed(0)} g` : `${item.unit_quantity || 0} ${item.unit_name || ''}`;
    
    return [
      item.food_name || item.portion_name,
      srtDisp,
      `${wL.toFixed(1)} g`
    ];
  });

  autoTable(doc, {
    startY: nextY2 + 4,
    head: [['Bahan Utama', 'Takaran Matang (SRT)', 'Berat Mentah']],
    body: tableLarge,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  });

  // Logistics Table - Section 3: REKAPITULASI LOGISTIK (TOTAL BELANJA)
  const nextY3 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text('C. REKAPITULASI LOGISTIK (TOTAL BELANJA)', 15, nextY3);

  const tableLogistics = menu.items.map((item: any) => {
    return [
        item.food_name || item.portion_name,
        `${(item.total_raw_weight_gram / 1000).toFixed(2)} kg`
    ];
  });

  autoTable(doc, {
    startY: nextY3 + 4,
    head: [['Bahan Utama', 'Volume Total Belanja']],
    body: tableLogistics,
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
    margin: { left: 15, right: 15 }
  });

  // Footer / Instructions
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, finalY, 180, 48, 2, 2, 'FD');
  
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38); // red for attention
  doc.setFont("helvetica", "bold");
  doc.text('Instruksi Operasional Dapur Wajib:', 20, finalY + 8);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate800);
  const instructions = [
    '1. Pastikan mencuci tangan sebelum mengolah bahan makanan mentah.',
    '2. Gunakan timbangan digital dapur untuk menjaga akurasi berat mentah/kotor.',
    '3. Ikuti standar SRT (Satuan Rumah Tangga) di tabel agar porsi tersalurkan seragam.',
    '4. Sajikan dan distribusikan makanan dalam keadaan suhu hangat (optimal di atas 60°C).',
    '5. Ambil foto lengkap menu matang dan submit untuk proses Quality Control sebelum dikonsumsi siswa.'
  ];
  
  instructions.forEach((line, index) => {
    doc.text(line, 20, finalY + 16 + (index * 6));
  });

  // Signature Block
  const sigY = finalY + 55;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate500);
  doc.text('Dinyatakan sah oleh:', 150, sigY, { align: 'center' });
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slate800);
  // Fallback to Anissa, SKM
  const userJson = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : { full_name: "Anissa, SKM", title: "Ahli Gizi" };
  const kitchenSigner = user.full_name;
  doc.text(kitchenSigner, 150, sigY + 20, { align: 'center' });
  
  doc.setDrawColor(...slate800);
  doc.setLineWidth(0.3);
  doc.line(125, sigY + 22, 175, sigY + 22);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(user.title || 'Ahli Gizi / Kepala Dapur', 150, sigY + 26, { align: 'center' });

  // Footer stamp
  const generatedDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: localeID });
  doc.setFontSize(7);
  doc.setTextColor(...slate500);
  doc.setFont("helvetica", "italic");
  doc.text(`Developed by Nadir under SKALADES Group | Dicetak pada ${generatedDate} - Laporan Bebas Kertas #${menu.id}`, 105, 290, { align: 'center' });

  // Save the PDF
  doc.save(`Instruksi_Dapur_${menu.school_name.replace(/\s+/g, '_')}_${format(new Date(menu.menu_date), 'yyyyMMdd')}.pdf`);
};

export const generateQCReportPDF = (menu: any) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(menu.menu_date), 'EEEE, dd MMMM yyyy', { locale: localeID });
  const IS_LULUS = menu.organoleptic_status === 'LULUS';
  const statusColor: [number, number, number] = IS_LULUS ? [16, 185, 129] : [220, 38, 38]; // Emerald vs Red
  const slate800: [number, number, number] = [30, 41, 59];
  const slate500: [number, number, number] = [100, 116, 139];

  // Header Box
  // Draw a colored top bar
  doc.setFillColor(...statusColor);
  doc.rect(0, 0, 210, 8, 'F');
  
  // Logo
  try {
    doc.addImage('/assets/logo-pdf.png', 'PNG', 15, 12, 16, 16);
  } catch (e) {
    console.error('Failed to load PDF logo:', e);
  }

  // Header Text
  doc.setFontSize(20);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text('DOKUMEN AUDIT & QC', 38, 21);

  doc.setFontSize(10);
  doc.setTextColor(...slate500);
  doc.setFont("helvetica", "normal");
  const subHeader = menu.kitchen_name 
    ? `${menu.kitchen_name} | Program Makan Bergizi`
    : 'Program Pemberian Makanan Bergizi';
  doc.text(subHeader, 38, 27);
  
  // Separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);

  // Info Cards Section (Two subtle boxes)
  // Box 1: Location & Target
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 42, 115, 32, 2, 2, 'FD'); // Width 115
  
  doc.setFontSize(9);
  doc.setTextColor(...slate500);
  doc.text('INFORMASI DISTRIBUSI', 20, 50);
  
  doc.setFontSize(11);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text(menu.school_name, 20, 56);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tanggal: ${dateStr}`, 20, 62);
  
  const studentCount = menu.school?.total_beneficiaries || 0;
  const teacherCount = menu.school?.total_teachers || 0;
  doc.text(`Penerima: ${studentCount} Siswa | ${teacherCount} Guru/Staf`, 20, 68);

  // Box 2: Status QC
  doc.setFillColor(IS_LULUS ? 236 : 254, IS_LULUS ? 253 : 226, IS_LULUS ? 245 : 226); // green-50 or red-50
  doc.setDrawColor(...statusColor);
  doc.roundedRect(135, 42, 60, 32, 2, 2, 'FD'); // Width 60
  
  doc.setFontSize(9);
  doc.setTextColor(...statusColor);
  doc.setFont("helvetica", "bold");
  doc.text('STATUS KELAYAKAN', 165, 52, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(menu.organoleptic_status || 'TERTUNDA', 165, 62, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 82, 195, 82);

  // Nutrition Table - Section 1: PORSI KECIL
  doc.setFontSize(11);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text('I. ANALISIS GIZI PORSI KECIL (PAUD / SD)', 15, 92);

  let totalKcalS = 0;
  let totalProteinS = 0;
  
  const bodySmall = menu.items.map((item: any) => {
    const wS = parseFloat(item.weight_small) || 0;
    const energy = parseFloat(item.energy_kcal) || 0;
    const protein = parseFloat(item.protein_g) || 0;
    const kS = (energy * wS) / 100;
    const pS = (protein * wS) / 100;
    totalKcalS += kS;
    totalProteinS += pS;

    return [item.food_name || item.portion_name, `${wS.toFixed(0)} g`, `${kS.toFixed(1)} kcal`, `${pS.toFixed(1)} g` ];
  });

  bodySmall.push([
    { content: 'TOTAL HARIAN PORSI KECIL', styles: { fontStyle: 'bold', halign: 'right' } } as any,
    '' as any,
    { content: `${totalKcalS.toFixed(1)} kcal`, styles: { fontStyle: 'bold', textColor: [16, 185, 129] } } as any,
    { content: `${totalProteinS.toFixed(1)} g`, styles: { fontStyle: 'bold', textColor: [16, 185, 129] } } as any
  ]);

  autoTable(doc, {
    startY: 96,
    head: [['Bahan Utama', 'Estimasi Berat', 'Energi', 'Protein']],
    body: bodySmall,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
    margin: { left: 15, right: 15 }
  });

  // Nutrition Table - Section 2: PORSI BESAR
  const nextY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text('II. ANALISIS GIZI PORSI BESAR (SMP / SMA / GURU)', 15, nextY);

  let totalKcalL = 0;
  let totalProteinL = 0;
  
  const bodyLarge = menu.items.map((item: any) => {
    const wL = parseFloat(item.weight_large) || 0;
    const energy = parseFloat(item.energy_kcal) || 0;
    const protein = parseFloat(item.protein_g) || 0;
    const kL = (energy * wL) / 100;
    const pL = (protein * wL) / 100;
    totalKcalL += kL;
    totalProteinL += pL;

    return [item.food_name || item.portion_name, `${wL.toFixed(0)} g`, `${kL.toFixed(1)} kcal`, `${pL.toFixed(1)} g` ];
  });

  bodyLarge.push([
    { content: 'TOTAL HARIAN PORSI BESAR', styles: { fontStyle: 'bold', halign: 'right' } } as any,
    '' as any,
    { content: `${totalKcalL.toFixed(1)} kcal`, styles: { fontStyle: 'bold', textColor: [30, 41, 59] } } as any,
    { content: `${totalProteinL.toFixed(1)} g`, styles: { fontStyle: 'bold', textColor: [30, 41, 59] } } as any
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['Bahan Utama', 'Estimasi Berat', 'Energi', 'Protein']],
    body: bodyLarge,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
    margin: { left: 15, right: 15 }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 10;

  // Organoleptic Section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, currentY, 180, 20, 2, 2, 'FD');
  
  doc.setFontSize(10);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text('Skor Uji Organoleptik (Standar Minimum: 3):', 20, currentY + 7);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate500);
  const scores = [
    `Warna: ${menu.warna_skor || '-'}`,
    `Aroma: ${menu.aroma_skor || '-'}`,
    `Tekstur: ${menu.tekstur_skor || '-'}`,
    `Rasa: ${menu.rasa_skor || '-'}`,
    `Suhu: ${menu.suhu_skor || '-'}`
  ];
  doc.text(scores.join('      |      '), 20, currentY + 14);

  currentY += 32;

  // Add page if needed
  if (currentY + 80 > 280) {
    doc.addPage();
    currentY = 20;
    doc.setFillColor(...statusColor);
    doc.rect(0, 0, 210, 8, 'F');
  }

  // Visual Evidence and Signatures
  doc.setFontSize(12);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text('BUKTI OTENTIKASI (VISUAL & VERIFIKATOR)', 15, currentY);

  currentY += 8;
  
  // Photo Frame
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 90, 60, 'FD');

  if (menu.foto_menu_url) {
    try {
      doc.addImage(menu.foto_menu_url, 'JPEG', 16, currentY + 1, 88, 58);
    } catch (e) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...slate500);
      doc.text('(Gambar tidak dapat dimuat)', 60, currentY + 30, { align: 'center' });
    }
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...slate500);
    doc.text('(Tidak ada foto dokumentasi)', 60, currentY + 30, { align: 'center' });
  }

  // Signature Block
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate500);
  doc.text('Dinyatakan sah dan diotorisasi oleh:', 115, currentY + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slate800);
  
  const userJson = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : { full_name: "Anissa, SKM", title: "Ahli Gizi" };
  
  const signerName = menu.nutritionist_name 
    ? `${menu.nutritionist_name}${menu.nutritionist_title ? `, ${menu.nutritionist_title}` : ''}`
    : `${user.full_name}, ${user.title}`;
  doc.text(signerName, 115, currentY + 50);

  if (menu.tanda_tangan_digital) {
    try {
      doc.addImage(menu.tanda_tangan_digital, 'PNG', 115, currentY + 10, 70, 35);
    } catch (e) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text('(Tanda tangan error)', 115, currentY + 30);
    }
  }

  // Signature line
  doc.setDrawColor(...slate800);
  doc.setLineWidth(0.3);
  doc.line(115, currentY + 52, 185, currentY + 52);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text('Tanda Tangan Elektronik Asli Terverifikasi', 115, currentY + 56);

  // Footer
  const generatedDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: localeID });
  doc.setFontSize(7);
  doc.setTextColor(...slate500);
  doc.setFont("helvetica", "italic");
  doc.text(`Developed by Nadir under SKALADES Group | Dicetak pada ${generatedDate} - Laporan Bebas Kertas #${menu.id}`, 105, 290, { align: 'center' });

  // Save Document
  doc.save(`Laporan_QC_${menu.school_name.replace(/\s+/g, '_')}_${format(new Date(menu.menu_date), 'yyyyMMdd')}.pdf`);
};

export const generateLogisticsPDF = (dateStr: string, items: any[], targetedSchools: string[], isSmartRounding: boolean) => {
  const doc = new jsPDF();
  const formattedDate = format(new Date(dateStr), 'EEEE, dd MMMM yyyy', { locale: localeID });
  const slate800: [number, number, number] = [30, 41, 59];
  const slate500: [number, number, number] = [100, 116, 139];
  const primary500: [number, number, number] = [16, 185, 129]; // Emerald

  // Header Box
  doc.setFillColor(...primary500);
  doc.rect(0, 0, 210, 8, 'F');
  
  // Logo
  try {
    doc.addImage('/assets/logo-pdf.png', 'PNG', 15, 12, 16, 16);
  } catch (e) {
    console.error('Failed to load PDF logo:', e);
  }

  // Header Text
  doc.setFontSize(20);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text('DAFTAR BELANJA LOGISTIK PUSAT', 38, 21);

  doc.setFontSize(10);
  doc.setTextColor(...slate500);
  doc.setFont("helvetica", "normal");
  // Try to find kitchen name from targeted schools or first item
  const kitchenName = items[0]?.kitchen_name || ''; 
  const subHeader = kitchenName 
    ? `${kitchenName} | Program Makan Bergizi`
    : 'Program Pemberian Makanan Bergizi';
  doc.text(subHeader, 38, 27);
  
  // Separator
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 36, 195, 36);

  // Info Cards Section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 42, 180, 32, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(...slate500);
  doc.text('INFORMASI OPERASIONAL', 20, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text(`Tanggal Distribusi: ${formattedDate}`, 20, 56);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Target Sekolah: ${targetedSchools.length > 0 ? targetedSchools.join(', ') : 'Belum Ada Penugasan'}`, 20, 62);
  doc.text(`Smart Rounding: ${isSmartRounding ? 'Aktif (Dibulatkan Penuh ke Atas)' : 'Non-Aktif (Bobot Laboratorium)'}`, 20, 68);

  // Items Table
  doc.setFontSize(12);
  doc.setTextColor(...slate800);
  doc.setFont("helvetica", "bold");
  doc.text('REKAPITULASI KEBUTUHAN BAHAN MENTAH', 15, 86);

  // Formatting utility
  const formatWeight = (grams: number) => {
    let finalWeight = grams;
    if (isSmartRounding) {
        if (grams >= 1000) finalWeight = Math.ceil(grams / 500) * 500;
        else finalWeight = Math.ceil(grams / 50) * 50;
    }
    if (finalWeight >= 1000) return `${(finalWeight / 1000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} KG`;
    return `${finalWeight.toLocaleString('id-ID')} Gram`;
  };

  const tableBody = items.map((item: any) => {
    return [
      item.category.replace('_', ' '),
      item.food_name,
      formatWeight(Number(item.total_weight_gram)),
      isSmartRounding ? `${(Number(item.total_weight_gram) / 1000).toFixed(2)} KG` : '-'
    ];
  });

  autoTable(doc, {
    startY: 90,
    head: [['Kategori', 'Nama Bahan', 'Kebutuhan Belanja', 'Berat Dasar (Riil)']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: slate800, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240], lineWidth: 0.1 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  });

  // Signature Block
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...slate500);
  doc.text('Petugas Logistik / Ahli Gizi:', 160, finalY, { align: 'center' });
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...slate800);
  const userJson = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const user = userJson ? JSON.parse(userJson) : { full_name: "Anissa, SKM", title: "Ahli Gizi" };
  doc.text(user.full_name, 160, finalY + 25, { align: 'center' });
  
  doc.setDrawColor(...slate800);
  doc.setLineWidth(0.3);
  doc.line(135, finalY + 27, 185, finalY + 27);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(user.title || 'Tim Operasional Nutrizi', 160, finalY + 31, { align: 'center' });

  // Footer stamp
  const generatedDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: localeID });
  doc.setFontSize(7);
  doc.setTextColor(...slate500);
  doc.setFont("helvetica", "italic");
  doc.text(`Developed by Nadir under SKALADES Group | Dicetak pada ${generatedDate} - Laporan Bebas Kertas Manual`, 105, 290, { align: 'center' });

  // Save the PDF
  doc.save(`Global_Logistics_${format(new Date(dateStr), 'yyyyMMdd')}.pdf`);
};
