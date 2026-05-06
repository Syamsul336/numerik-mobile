// =============================================================================
// FILE: src/core/numerical/integration/simpson.ts
// =============================================================================
//
// METODE SIMPSON 1/3 (Aturan Simpson)
// ===================================
//
// Apa bedanya dengan Trapezoidal?
// -------------------------------
// Trapezoidal pakai GARIS LURUS untuk perkirakan kurva di tiap pias.
// Simpson pakai PARABOLA — lengkungan yang bisa ngepas mengikuti kurva
// yang sebenarnya. Hasilnya: jauh lebih akurat untuk fungsi yang halus.
//
// Rumus Simpson 1/3 komposit:
//   ∫ f(x) dx ≈ (h/3) [f(x₀) + 4·(jumlah ganjil) + 2·(jumlah genap) + f(xₙ)]
//
// Bobot:
// - Indeks ujung (0 dan n): bobot 1
// - Indeks ganjil (1, 3, 5, ...): bobot 4
// - Indeks genap kecuali ujung (2, 4, 6, ...): bobot 2
//
// Karakteristik:
// - n HARUS GENAP (kalau ganjil, tidak bisa dipasang parabola di setiap 2 pias)
// - Akurasi: O(h⁴) — kalau h dikecilkan 2x, error berkurang 16x
// - Cocok untuk fungsi mulus (polinomial, sin, cos, exp, ln, dst.)
//
// File ini menghasilkan struktur yang sama dengan trapezoidal.ts,
// tapi rumus & langkah-langkahnya disesuaikan untuk Simpson.
// =============================================================================

import { FunctionParser } from '../../parser/functionParser';
import { exprToLatex, formatNum } from '../../../components/math/exprToLatex';
import type { IntegrationResult, IntegrationStep, ExplanationBlock } from './types';

/**
 * Hitung integral pakai metode Simpson 1/3 komposit.
 *
 * @throws Error kalau n ganjil
 */
export function calculateSimpson(params: {
  function: string;
  a: number;
  b: number;
  n: number;
}): IntegrationResult {
  const { function: fn, a, b, n } = params;

  // ─── VALIDASI: n harus genap ────────────────────────────────────────────
  // Simpson 1/3 melibatkan parabola yang melewati 3 titik (x_i, x_i+1, x_i+2).
  // Kalau n ganjil, ada satu pias yang tidak punya pasangan → tidak bisa.
  if (n % 2 !== 0) {
    throw new Error('Simpson 1/3 membutuhkan n genap.');
  }

  const parser = new FunctionParser(fn);
  const h = (b - a) / n;
  const fnLatex = exprToLatex(fn);
  const steps: IntegrationStep[] = [];

  // ─── Evaluasi semua simpul ──────────────────────────────────────────────
  const xVals: number[] = [];
  const yVals: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    xVals.push(x);
    yVals.push(parser.evaluate(x));
  }

  // ─── Pisahkan jumlah ganjil & genap ─────────────────────────────────────
  // Loop dari 1 sampai n-1 (tidak termasuk ujung)
  let oddSum = 0;     // total nilai di indeks ganjil
  let evenSum = 0;    // total nilai di indeks genap (selain ujung)
  for (let i = 1; i < n; i++) {
    if (i % 2 === 1) {
      oddSum += yVals[i];     // indeks ganjil
    } else {
      evenSum += yVals[i];    // indeks genap
    }

    // Simpan info untuk visualisasi
    const coef = i % 2 === 1 ? 4 : 2;  // bobot Simpson
    steps.push({
      index: i,
      xStart: xVals[i],
      xEnd: xVals[i],
      yStart: yVals[i],
      yEnd: yVals[i],
      area: coef * yVals[i],
      description: `x${i}=${formatNum(xVals[i])}, f(x)=${formatNum(yVals[i])}, koef=${coef}`,
    });
  }

  // ─── Terapkan rumus Simpson 1/3 ─────────────────────────────────────────
  // sum = (h/3) [f(x₀) + 4*(jumlah ganjil) + 2*(jumlah genap) + f(xₙ)]
  const sum = (h / 3) * (yVals[0] + 4 * oddSum + 2 * evenSum + yVals[n]);

  // ─── Buat preview LaTeX (max 5 baris) ───────────────────────────────────
  const previewIdx = [0, 1, 2, Math.max(n - 1, 0), n].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );
  const previewLatex =
    '\\begin{aligned}' +
    previewIdx
      .map((i) => ` & f(x_{${i}}) = ${formatNum(yVals[i])}`)
      .join(' \\\\') +
    ' \\end{aligned}';

  // Format rumus akhir Simpson dalam beberapa baris
  const sumLatex =
    '\\begin{aligned}' +
    ` &\\frac{h}{3}\\Bigl[ f(x_0) + 4\\!\\!\\sum_{\\text{ganjil}}\\!\\! f + 2\\!\\!\\sum_{\\text{genap}}\\!\\! f + f(x_n) \\Bigr] \\\\` +
    ` &= \\frac{${formatNum(h)}}{3}\\bigl[${formatNum(yVals[0])} + 4(${formatNum(oddSum)}) \\\\` +
    ` &\\quad + 2(${formatNum(evenSum)}) + ${formatNum(yVals[n])}\\bigr]` +
    ' \\end{aligned}';

  // ─── Bangun blok-blok penjelasan untuk UI ───────────────────────────────
  const blocks: ExplanationBlock[] = [
    {
      title: 'Tentukan integral & metode',
      description:
        'Simpson 1/3 mengaproksimasi area di bawah kurva dengan parabola — jauh lebih akurat dari trapesium untuk fungsi halus. Syaratnya n harus genap.',
      latex: `\\int_{${formatNum(a)}}^{${formatNum(b)}} ${fnLatex}\\,dx`,
      tone: 'navy',
    },
    {
      title: 'Hitung lebar pias h',
      description: 'Sama seperti trapesium, kita bagi selang menjadi n bagian sama lebar.',
      latex: `h = \\frac{b - a}{n} = \\frac{${formatNum(b)} - ${formatNum(a)}}{${n}} = ${formatNum(h)}`,
      values: [
        { label: 'n (genap)', value: String(n) },
        { label: 'h', value: formatNum(h), highlight: true },
      ],
      tone: 'lavender',
    },
    {
      title: 'Klasifikasikan simpul: ganjil & genap',
      description:
        'Simpson memberi bobot 4 untuk indeks ganjil dan bobot 2 untuk indeks genap (kecuali ujung).',
      latex: previewLatex,
      values: [
        { label: 'Σ f(xᵢ) ganjil', value: formatNum(oddSum) },
        { label: 'Σ f(xᵢ) genap', value: formatNum(evenSum) },
      ],
      tone: 'navy',
    },
    {
      title: 'Terapkan rumus Simpson 1/3',
      description: 'Substitusi semua nilai ke rumus komposit.',
      latex: sumLatex,
      tone: 'navy',
    },
    {
      title: 'Hasil akhir aproksimasi',
      description:
        'Untuk fungsi halus, error Simpson berkurang dengan orde O(h⁴) — empat kali lebih cepat konvergen dari trapesium.',
      latex: `\\int_{${formatNum(a)}}^{${formatNum(b)}} ${fnLatex}\\,dx \\approx ${formatNum(sum, 8)}`,
      values: [{ label: 'Nilai integral ≈', value: formatNum(sum, 8), highlight: true }],
      tone: 'success',
    },
  ];

  return {
    value: sum,
    steps,
    blocks,
    methodName: 'Simpson 1/3',
    a,
    b,
    n,
    h,
  };
}
