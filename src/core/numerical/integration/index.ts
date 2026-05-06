// =============================================================================
// FILE: src/core/numerical/integration/index.ts
// =============================================================================
//
// File ini adalah PINTU MASUK utama untuk modul integral. Konvensi di
// JavaScript/TypeScript: kalau ada folder, file `index.ts` adalah file
// "default" yang akan di-load saat orang import dari folder tersebut.
//
// Contoh:
//   // tanpa index.ts:
//   import { calculateIntegral } from '../core/numerical/integration/index';
//
//   // dengan index.ts (lebih singkat):
//   import { calculateIntegral } from '../core/numerical/integration';
//
// Tugas file ini:
// 1. Re-export semua tipe dan fungsi dari sub-file (types, trapezoidal, dll.)
//    Sehingga konsumer cuma perlu import dari satu tempat.
// 2. Menyediakan fungsi `calculateIntegral()` — wrapper tunggal yang otomatis
//    memilih metode yang tepat berdasarkan parameter `method`.
// =============================================================================

// Re-export semua isi dari sub-file
export * from './types';
export * from './trapezoidal';
export * from './simpson';
export * from './romberg';

// Import internal untuk dipakai di fungsi calculateIntegral
import { calculateTrapezoidal } from './trapezoidal';
import { calculateSimpson } from './simpson';
import { calculateRomberg } from './romberg';
import type { IntegralMethod, IntegrationResult } from './types';

/**
 * Fungsi convenience: pilih metode dan hitung dalam satu langkah.
 *
 * Daripada di komponen UI kita harus tulis:
 *   if (method === 'trapezoidal') { calculateTrapezoidal(...); }
 *   else if (method === 'simpson') { calculateSimpson(...); }
 *   else if (method === 'romberg') { calculateRomberg(...); }
 *
 * Cukup:
 *   calculateIntegral({ method, function: fn, a, b, n });
 *
 * Fungsi ini juga otomatis MEMPERBAIKI nilai n untuk Simpson kalau ganjil
 * (karena Simpson 1/3 butuh n genap).
 */
export function calculateIntegral(params: {
  method: IntegralMethod;
  function: string;
  a: number;
  b: number;
  n: number;
}): IntegrationResult {
  const { method, function: fn, a, b, n } = params;

  // `switch` adalah cara cantik untuk mengganti banyak `if-else`
  switch (method) {
    case 'trapezoidal':
      return calculateTrapezoidal({ function: fn, a, b, n });

    case 'simpson':
      // Auto-fix: kalau n ganjil, naikkan ke genap berikutnya
      // (Simpson 1/3 wajib n genap)
      const adjustedN = n % 2 === 0 ? n : n + 1;
      return calculateSimpson({ function: fn, a, b, n: adjustedN });

    case 'romberg':
      // Romberg tidak butuh parameter n — pakai levels default
      return calculateRomberg({ function: fn, a, b });

    default:
      // Kalau ada method baru yang belum di-handle (misalnya bug),
      // throw error dengan pesan jelas
      throw new Error(`Unknown method: ${method}`);
  }
}
