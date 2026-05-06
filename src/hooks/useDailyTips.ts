// =============================================================================
// FILE: src/hooks/useDailyTips.ts
// =============================================================================
//
// USE DAILY TIPS — hook kustom untuk daily tips carousel
// =======================================================
//
// Apa itu "hook" di React?
// ------------------------
// Hook adalah fungsi yang DIPANGGIL DI DALAM KOMPONEN untuk memberikan
// kemampuan extra: state, lifecycle, animasi, dll.
//
// Hooks bawaan React: useState, useEffect, useMemo, useContext, ...
// Hook KUSTOM: dibuat sendiri (nama harus diawali "use") untuk encapsulate
// logika yang dipakai di banyak komponen.
//
// Apa fungsi hook ini?
// --------------------
// Mengelola "Tips Harian" yang muncul di HomeScreen:
// 1. Pilih 3 tips untuk hari ini (deterministik — sama untuk semua user
//    yang buka di tanggal yang sama)
// 2. Rotate ke tip berikutnya setiap 90 detik
// 3. Sediakan tip yang sedang aktif untuk dirender
//
// Cara pakai di komponen:
//   const { tips, currentTip, currentIndex, setIndex } = useDailyTips();
//   return <Text>{currentTip.title}</Text>;
// =============================================================================

import { useEffect, useState, useMemo } from 'react';
import { pickTipsForDay, todayIndex, type Tip } from '../data/tips';

// Interval rotasi: 90 detik
const ROTATE_INTERVAL_MS = 90 * 1000;

interface UseDailyTipsResult {
  tips: Tip[];                   // 3 tips untuk hari ini
  currentTip: Tip;               // tip yang sedang ditampilkan
  currentIndex: number;          // 0, 1, atau 2
  setIndex: (i: number) => void; // untuk pindah manual (pagination dot)
}

export function useDailyTips(): UseDailyTipsResult {
  // useMemo: hitung sekali saja (saat mount), cache hasilnya.
  // Tidak akan re-pick tips kecuali tanggal berubah (jarang terjadi
  // selama satu sesi).
  const tips = useMemo(() => pickTipsForDay(todayIndex()), []);

  // State: index tip yang sedang aktif
  const [currentIndex, setIndex] = useState(0);

  // useEffect: jalankan side effect setelah render
  useEffect(() => {
    // Tidak perlu rotate kalau cuma 1 tip
    if (tips.length <= 1) return;

    // setInterval: panggil callback berulang setiap interval ms
    const id = setInterval(() => {
      // (prev + 1) % length = 0,1,2,0,1,2,...
      // Operator modulo membuat looping kembali ke 0
      setIndex((prev) => (prev + 1) % tips.length);
    }, ROTATE_INTERVAL_MS);

    // Cleanup function: dipanggil saat komponen unmount.
    // WAJIB untuk hindari memory leak — kalau tidak di-clear, interval
    // akan terus jalan walaupun komponen sudah hilang.
    return () => clearInterval(id);
  }, [tips.length]);  // re-run effect kalau tips berubah

  return {
    tips,
    // ?? = nullish coalescing — kalau index out of range (jarang),
    // fallback ke tip pertama
    currentTip: tips[currentIndex] ?? tips[0],
    currentIndex,
    setIndex,
  };
}
