// =============================================================================
// FILE: src/core/numerical/integration/types.ts
// =============================================================================
//
// File ini berisi DEFINISI TIPE DATA TypeScript untuk modul integral.
//
// Apa itu "tipe data"?
// --------------------
// TypeScript adalah JavaScript dengan kemampuan ekstra: kita bisa kasih tahu
// kompiler "data ini bentuknya seperti apa". Kalau kita salah pakai, kompiler
// akan kasih warning sebelum kode dijalankan.
//
// Contoh: kalau kita bilang `n: number`, lalu coba pakai `n = "halo"`,
// TypeScript langsung protes — padahal kalau pakai JavaScript murni,
// kode jalan saja sampai error di runtime.
//
// Kenapa dipisah ke file sendiri?
// -------------------------------
// Tipe ini dipakai oleh banyak file (trapezoidal.ts, simpson.ts, romberg.ts,
// integralStore.ts, IntegralScreen.tsx). Daripada ditulis ulang di tiap file,
// kita simpan di satu tempat dan import dari sini.
// =============================================================================

/**
 * IntegrationResult — hasil akhir dari satu perhitungan integral.
 *
 * Ini struktur data yang dikembalikan oleh fungsi calculateTrapezoidal,
 * calculateSimpson, dan calculateRomberg.
 */
export interface IntegrationResult {
  /** Nilai aproksimasi integral (angka utama yang dicari user) */
  value: number;

  /** Daftar langkah-langkah numerik (untuk grafik & visualisasi lama) */
  steps: IntegrationStep[];

  /** Daftar "blok penjelasan" yang dirender sebagai StepCard di UI */
  blocks: ExplanationBlock[];

  /** Nama metode (Trapezoidal / Simpson 1/3 / Romberg) — untuk ditampilkan */
  methodName: string;

  /** Batas bawah integral */
  a: number;

  /** Batas atas integral */
  b: number;

  /** Jumlah pias/subinterval */
  n: number;

  /** Lebar tiap pias: h = (b - a) / n */
  h: number;
}

/**
 * IntegrationStep — satu langkah perhitungan numerik.
 *
 * Misalnya untuk Trapezoidal dengan n=4, akan ada 4 step,
 * masing-masing menyimpan info trapesium ke-i.
 */
export interface IntegrationStep {
  /** Nomor langkah (1-indexed) */
  index: number;

  /** Koordinat x kiri pias */
  xStart: number;

  /** Koordinat x kanan pias */
  xEnd: number;

  /** Nilai f(xStart) */
  yStart: number;

  /** Nilai f(xEnd) */
  yEnd: number;

  /** Luas pias ini */
  area: number;

  /** Penjelasan sebagai string biasa (untuk debug atau fallback) */
  description: string;
}

/**
 * ExplanationBlock — satu kartu penjelasan langkah dengan rumus & nilai.
 *
 * Tipe ini dirender oleh komponen StepCard di UI. Tiap blok punya:
 * - Judul (wajib)
 * - Deskripsi narasi (opsional)
 * - Rumus LaTeX (opsional, akan dirender pakai KaTeX)
 * - Nilai-nilai sebagai bullet list (opsional)
 * - Warna tema (opsional)
 */
export interface ExplanationBlock {
  /** Judul blok, contoh: "Hitung lebar subinterval h" */
  title: string;

  /** Penjelasan dalam bahasa biasa, ditampilkan di bawah judul */
  description?: string;

  /** Rumus matematika dalam format LaTeX, contoh: "h = \\frac{b-a}{n}" */
  latex?: string;

  /** Daftar pasangan label-nilai, ditampilkan sebagai bullet berwarna */
  values?: Array<{ label: string; value: string; highlight?: boolean }>;

  /** Tema warna kartu — masing-masing punya kombinasi warna sendiri */
  tone?: 'navy' | 'success' | 'warning' | 'lavender';
}

/**
 * IntegralMethod — daftar metode integral yang didukung.
 *
 * Ini "union type" — variabel bertipe ini hanya boleh berisi salah satu
 * dari 3 string ini. Kalau coba 'foo' atau 'bar', TypeScript akan protes.
 */
export type IntegralMethod = 'trapezoidal' | 'simpson' | 'romberg';
