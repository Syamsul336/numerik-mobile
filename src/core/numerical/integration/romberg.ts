// =============================================================================
// FILE: src/core/numerical/integration/romberg.ts
// =============================================================================
//
// METODE ROMBERG (Ekstrapolasi Richardson)
// ========================================
//
// Idenya cerdas:
// --------------
// Trapezoidal sederhana tapi error-nya O(h²) — masih lambat konvergen.
// Apa yang terjadi kalau kita HITUNG TRAPEZOIDAL BANYAK KALI dengan h yang
// makin kecil (h, h/2, h/4, h/8, ...) lalu MEM-KOMBINASIKAN HASILNYA secara
// pintar?
//
// Inilah yang dilakukan Romberg. Dengan kombinasi ajaib (Richardson
// extrapolation), error orde rendah saling MENIADAKAN, sehingga akurasi
// melompat tinggi tiap level.
//
// Cara kerja:
// -----------
// 1. Hitung R[0][0]: trapezoidal dengan 1 trapesium besar (n=1)
// 2. Hitung R[1][0]: trapezoidal dengan n=2
// 3. Hitung R[2][0]: trapezoidal dengan n=4
// 4. ... terus menggandakan
// 5. Lalu isi kolom-kolom berikutnya dengan formula:
//      R[i][j] = (4^j × R[i][j-1] − R[i-1][j-1]) / (4^j − 1)
// 6. Jawaban paling akurat: R[N-1][N-1] (pojok kanan bawah tabel)
//
// Hasilnya tabel segitiga atas (upper triangular):
//   R[0][0]
//   R[1][0]  R[1][1]
//   R[2][0]  R[2][1]  R[2][2]
//   R[3][0]  R[3][1]  R[3][2]  R[3][3]   ← jawaban paling akurat
//
// Karakteristik:
// - SANGAT akurat untuk fungsi mulus (bisa tembus 10+ digit benar)
// - 5 level Romberg sering lebih akurat dari Simpson dengan n=100
// - Tidak ada syarat n genap
// =============================================================================

import { FunctionParser } from '../../parser/functionParser';
import { exprToLatex, formatNum } from '../../../components/math/exprToLatex';
import type { IntegrationResult, IntegrationStep, ExplanationBlock } from './types';

/**
 * Hitung integral pakai metode Romberg.
 *
 * @param params.levels - Jumlah level ekstrapolasi (default 5).
 *                        Semakin besar = semakin akurat tapi lambat.
 *                        5-7 sudah cukup untuk kebanyakan fungsi.
 */
export function calculateRomberg(params: {
  function: string;
  a: number;
  b: number;
  levels?: number;
}): IntegrationResult {
  const { function: fn, a, b, levels = 5 } = params;
  const parser = new FunctionParser(fn);
  const fnLatex = exprToLatex(fn);

  // ─── Siapkan tabel Romberg ───────────────────────────────────────────────
  // R[i][j] = elemen baris i kolom j. Kita siapkan ukuran levels × levels,
  // diisi 0 dulu. Hanya bagian segitiga kiri-atas yang akan kita pakai.
  const R: number[][] = Array.from({ length: levels }, () => Array(levels).fill(0));
  const steps: IntegrationStep[] = [];

  // ─── Inisialisasi level 0: trapezoidal dengan 1 trapesium ───────────────
  // R[0][0] = (b-a)/2 × (f(a) + f(b))
  R[0][0] = ((b - a) / 2) * (parser.evaluate(a) + parser.evaluate(b));

  // ─── Bangun kolom pertama (R[i][0]) untuk i = 1, 2, 3, ... ──────────────
  // Tiap level menggandakan jumlah pias: 1 → 2 → 4 → 8 → 16 → ...
  for (let i = 1; i < levels; i++) {
    // 1 << i = 2^i (operasi bitshift, lebih cepat dari Math.pow)
    const numIntervals = 1 << i;
    const h = (b - a) / numIntervals;

    // Trick: bukan hitung ulang semua titik, tapi cuma TITIK BARU yang
    // ditambahkan saat n digandakan. Titik lama sudah ada di R[i-1][0].
    let sum = 0;
    for (let k = 1; k < numIntervals; k += 2) {
      sum += parser.evaluate(a + k * h);
    }
    // R[i][0] = ½ × R[i-1][0] + h × jumlah titik baru
    R[i][0] = 0.5 * R[i - 1][0] + h * sum;

    // ─── Isi kolom-kolom berikutnya (j = 1, 2, ..., i) ────────────────────
    // Pakai rumus ekstrapolasi Richardson:
    //   R[i][j] = (4^j × R[i][j-1] − R[i-1][j-1]) / (4^j − 1)
    for (let j = 1; j <= i; j++) {
      const factor = 1 << (2 * j);  // 4^j
      R[i][j] = (factor * R[i][j - 1] - R[i - 1][j - 1]) / (factor - 1);
    }

    // Catat langkah ini
    steps.push({
      index: i,
      xStart: 0,
      xEnd: 0,
      yStart: R[i][0],
      yEnd: R[i][i],
      area: R[i][i],
      description: `Level ${i}: R[${i}][0]=${formatNum(R[i][0])}, R[${i}][${i}]=${formatNum(R[i][i])}`,
    });
  }

  // Jawaban paling akurat = pojok kanan bawah tabel
  const value = R[levels - 1][levels - 1];

  // ─── Format tabel Romberg sebagai LaTeX ─────────────────────────────────
  // Pakai \\begin{array} untuk render tabel. Tampilkan hanya bagian
  // segitiga (j ≤ i), abaikan elemen 0 yang belum diisi.
  const tableLatex =
    '\\begin{array}{' + 'c'.repeat(levels) + '} ' +
    R.map((row, i) =>
      row
        .map((v, j) => (j <= i ? formatNum(v, 6) : ''))
        .filter((c) => c !== '')
        .join(' & ')
    )
      .filter((r) => r.length > 0)
      .join(' \\\\ ') +
    ' \\end{array}';

  // ─── Bangun blok penjelasan untuk UI ────────────────────────────────────
  const blocks: ExplanationBlock[] = [
    {
      title: 'Tentukan integral & metode',
      description:
        'Romberg memulai dari trapesium, lalu menambah akurasi tiap level dengan ekstrapolasi Richardson. Sangat efisien untuk fungsi halus.',
      latex: `\\int_{${formatNum(a)}}^{${formatNum(b)}} ${fnLatex}\\,dx`,
      tone: 'navy',
    },
    {
      title: 'Inisialisasi level 0 (trapesium 1 pias)',
      description:
        'R[0][0] adalah aturan trapesium dengan satu trapesium tunggal mencakup seluruh selang [a, b].',
      latex: `R_{0,0} = \\tfrac{b-a}{2}\\bigl(f(a) + f(b)\\bigr) = ${formatNum(R[0][0])}`,
      tone: 'lavender',
    },
    {
      title: 'Bangun kolom pertama (Trapesium berlipat)',
      description:
        'Tiap level menggandakan jumlah pias: 1 → 2 → 4 → 8 → … Hitung trapesium komposit untuk setiap level.',
      latex: `R_{i,0} = \\tfrac{1}{2}\\,R_{i-1,0} + h_i \\sum_{\\text{titik baru}} f(x)`,
      tone: 'navy',
    },
    {
      title: 'Ekstrapolasi Richardson',
      description:
        'Setiap kolom baru menghapus error orde lebih rendah, sehingga konvergensi menjadi sangat cepat.',
      latex: `R_{i,j} = \\frac{4^{j}\\,R_{i,j-1} - R_{i-1,j-1}}{4^{j} - 1}`,
      tone: 'navy',
    },
    {
      title: 'Tabel Romberg',
      description:
        'Diagonal kanan-bawah memberikan aproksimasi paling akurat. Itu yang kita ambil sebagai hasil.',
      latex: tableLatex,
      tone: 'lavender',
    },
    {
      title: 'Hasil akhir aproksimasi',
      description: 'Aproksimasi terbaik adalah elemen pojok kanan-bawah tabel Romberg.',
      latex: `\\int_{${formatNum(a)}}^{${formatNum(b)}} ${fnLatex}\\,dx \\approx ${formatNum(value, 10)}`,
      values: [{ label: `R[${levels - 1}][${levels - 1}]`, value: formatNum(value, 10), highlight: true }],
      tone: 'success',
    },
  ];

  return {
    value,
    steps,
    blocks,
    methodName: 'Romberg',
    a,
    b,
    n: 1 << (levels - 1),                    // n efektif = 2^(levels-1)
    h: (b - a) / (1 << (levels - 1)),        // h efektif terkecil
  };
}
