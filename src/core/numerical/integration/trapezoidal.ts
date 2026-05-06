// =============================================================================
// FILE: src/core/numerical/integration/trapezoidal.ts
// =============================================================================
//
// METODE TRAPEZOIDAL (Aturan Trapesium)
// =====================================
//
// Apa itu integral?
// -----------------
// Integral tentu menghitung LUAS DI BAWAH KURVA fungsi f(x), dari x=a sampai
// x=b. Bayangkan menggambar kurva di kertas, lalu mengukur area antara kurva
// dan sumbu-x.
//
// Apa itu metode trapezoidal?
// ---------------------------
// Cara paling sederhana untuk memperkirakan luas tersebut:
//   1. Bagi selang [a, b] jadi n potongan sama lebar (selebar h = (b-a)/n)
//   2. Di tiap potongan, tarik garis lurus dari titik kiri ke titik kanan kurva
//   3. Daerah yang terbentuk → trapesium
//   4. Jumlahkan luas semua trapesium
//
// Rumus:
//   ∫ f(x) dx ≈ (h/2) [f(x₀) + 2(f(x₁)+...+f(xₙ₋₁)) + f(xₙ)]
//
// Karakteristik:
// - Paling sederhana untuk dimengerti (cuma trapesium!)
// - Akurasi: O(h²) — kalau kita kecilkan h sebesar 2x, error berkurang 4x
// - Aman untuk fungsi apapun, tidak ada syarat khusus
// - Kurang akurat untuk fungsi yang kelengkungannya tajam
//
// File ini menghasilkan:
// - Nilai aproksimasi integral
// - Array steps (untuk grafik)
// - Array blocks (untuk StepCard di UI) berisi 5 langkah:
//     1. Tentukan integral & metode
//     2. Hitung lebar h
//     3. Evaluasi f(x) di setiap simpul
//     4. Terapkan rumus trapesium komposit
//     5. Hasil akhir
// =============================================================================

import { FunctionParser } from '../../parser/functionParser';
import { exprToLatex, formatNum } from '../../../components/math/exprToLatex';
import type { IntegrationResult, IntegrationStep, ExplanationBlock } from './types';

/**
 * Hitung integral fungsi pakai metode Trapezoidal komposit.
 *
 * @param params.function - String fungsi, contoh: "x^2 + sin(x)"
 * @param params.a        - Batas bawah
 * @param params.b        - Batas atas
 * @param params.n        - Jumlah pias (semakin besar = semakin akurat)
 *
 * @returns IntegrationResult lengkap (nilai + steps + blocks)
 */
export function calculateTrapezoidal(params: {
  function: string;
  a: number;
  b: number;
  n: number;
}): IntegrationResult {
  // Destructuring — ambil nilai dari params dan rename `function` jadi `fn`
  // (karena `function` adalah keyword JS yang tidak bisa dipakai sebagai nama variabel)
  const { function: fn, a, b, n } = params;

  // Parser yang siap mengevaluasi fungsi pada nilai x manapun
  const parser = new FunctionParser(fn);

  // Lebar tiap pias: h = (b - a) / n
  const h = (b - a) / n;

  // Tempat kumpulkan langkah-langkah numerik (untuk grafik)
  const steps: IntegrationStep[] = [];

  // Konversi fungsi ke format LaTeX agar bisa ditampilkan dengan notasi cantik
  const fnLatex = exprToLatex(fn);

  // ─────────────────────────────────────────────────────────────────────────
  // LANGKAH 1: Evaluasi f(x) di setiap simpul
  // Simpul: x₀, x₁, ..., xₙ — total ada n+1 titik
  // ─────────────────────────────────────────────────────────────────────────
  const xVals: number[] = [];
  const yVals: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;                  // x_i = a + i*h
    xVals.push(x);
    yVals.push(parser.evaluate(x));       // y_i = f(x_i)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LANGKAH 2: Hitung luas tiap trapesium dan jumlahkan
  // Luas trapesium = (h/2) × (y_kiri + y_kanan)
  // ─────────────────────────────────────────────────────────────────────────
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const yStart = yVals[i];
    const yEnd = yVals[i + 1];
    const area = (h / 2) * (yStart + yEnd);
    sum += area;

    // Simpan info langkah ini untuk visualisasi
    steps.push({
      index: i + 1,
      xStart: xVals[i],
      xEnd: xVals[i + 1],
      yStart,
      yEnd,
      area,
      description: `Trapesium ${i + 1}: A = (h/2)(f(${formatNum(xVals[i])}) + f(${formatNum(xVals[i + 1])})) = ${formatNum(area)}`,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERSIAPAN UNTUK UI: Buat preview LaTeX multi-baris
  // Kalau n besar, terlalu banyak nilai untuk ditampilkan semua.
  // Kita pilih indeks: 0, 1, 2, n-1, n (tampil maksimal 5 baris).
  // ─────────────────────────────────────────────────────────────────────────
  const previewIdx = [0, 1, 2, Math.max(n - 1, 0), n].filter(
    (v, i, arr) => arr.indexOf(v) === i && v >= 0 && v <= n  // unik & valid
  );

  // Format LaTeX dengan \\begin{aligned} agar tidak overflow
  const previewLatex =
    '\\begin{aligned}' +
    previewIdx
      .map(
        (i) =>
          ` & f(x_{${i}}) = f(${formatNum(xVals[i])}) = ${formatNum(yVals[i])}`
      )
      .join(' \\\\') +
    ' \\end{aligned}';

  // Hitung jumlah nilai tengah (untuk dipakai di rumus komposit)
  const oddSum = yVals.slice(1, -1).reduce((s, y) => s + y, 0);

  // Format rumus akhir dalam dua baris LaTeX
  const sumLatex =
    '\\begin{aligned}' +
    ` &\\frac{h}{2}\\Bigl[ f(x_0) + 2\\sum_{i=1}^{n-1} f(x_i) + f(x_n) \\Bigr] \\\\` +
    ` &= \\frac{${formatNum(h)}}{2}\\bigl[${formatNum(yVals[0])} + 2(${formatNum(oddSum)}) + ${formatNum(yVals[n])}\\bigr]` +
    ' \\end{aligned}';

  // ─────────────────────────────────────────────────────────────────────────
  // BANGUN ARRAY "blocks" — penjelasan langkah-langkah untuk UI
  // Tiap blok = satu StepCard yang akan dirender di layar
  // ─────────────────────────────────────────────────────────────────────────
  const blocks: ExplanationBlock[] = [
    // BLOK 1: Tentukan integral & metode
    {
      title: 'Tentukan integral & metode',
      description:
        'Kita ingin menghitung integral tentu dari f(x) pada selang [a, b] menggunakan aturan Trapesium komposit.',
      latex: `\\int_{${formatNum(a)}}^{${formatNum(b)}} ${fnLatex}\\,dx`,
      tone: 'navy',
    },
    // BLOK 2: Hitung lebar h
    {
      title: 'Hitung lebar subinterval h',
      description:
        'Bagi selang [a, b] menjadi n bagian sama lebar. Lebar h = (b−a)/n menjadi dasar untuk semua trapesium.',
      latex: `h = \\frac{b - a}{n} = \\frac{${formatNum(b)} - ${formatNum(a)}}{${n}} = ${formatNum(h)}`,
      values: [
        { label: 'a (batas bawah)', value: formatNum(a) },
        { label: 'b (batas atas)', value: formatNum(b) },
        { label: 'n (jumlah pias)', value: String(n) },
        { label: 'h (lebar pias)', value: formatNum(h), highlight: true },
      ],
      tone: 'lavender',
    },
    // BLOK 3: Evaluasi simpul
    {
      title: 'Evaluasi f(x) pada simpul',
      description:
        'Hitung nilai fungsi pada setiap titik simpul x₀, x₁, …, xₙ. Simpul ujung (x₀, xₙ) memakai bobot 1, simpul tengah memakai bobot 2.',
      latex: previewLatex,
      tone: 'navy',
    },
    // BLOK 4: Terapkan rumus
    {
      title: 'Terapkan rumus Trapesium komposit',
      description:
        'Jumlahkan semua kontribusi: nilai di ujung dengan bobot 1, semua nilai dalam dengan bobot 2, lalu kalikan h/2.',
      latex: sumLatex,
      tone: 'navy',
    },
    // BLOK 5: Hasil akhir
    {
      title: 'Hasil akhir aproksimasi',
      description:
        'Inilah pendekatan integral menggunakan Trapesium komposit. Semakin besar n, semakin akurat hasilnya.',
      latex: `\\int_{${formatNum(a)}}^{${formatNum(b)}} ${fnLatex}\\,dx \\approx ${formatNum(sum, 8)}`,
      values: [{ label: 'Nilai integral ≈', value: formatNum(sum, 8), highlight: true }],
      tone: 'success', // hijau untuk menandakan hasil akhir
    },
  ];

  // Kembalikan struktur lengkap sesuai tipe IntegrationResult
  return {
    value: sum,
    steps,
    blocks,
    methodName: 'Trapezoidal',
    a,
    b,
    n,
    h,
  };
}
