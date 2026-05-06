// =============================================================================
// FILE: src/core/numerical/interpolation/index.ts
// =============================================================================
//
// MODUL INTERPOLASI
// =================
//
// Apa itu interpolasi?
// --------------------
// Bayangkan kamu punya beberapa titik data: (1, 2), (3, 5), (5, 1).
// Pertanyaannya: berapa nilainya kalau x = 2? atau x = 4?
//
// Interpolasi = menebak nilai di ANTARA titik yang sudah diketahui,
// dengan cara mencari polinomial yang melewati semua titik tersebut,
// lalu mengevaluasi polinomial itu di nilai x yang dicari.
//
// Modul ini menyediakan 2 metode utama:
// 1. LAGRANGE          — paling intuitif, formula langsung
// 2. NEWTON DIVIDED DIFF — efisien kalau titik bertambah dinamis
//
// Hasilnya: polinomial yang SAMA, tapi cara penulisannya beda.
//
// Plus: fungsi `generateLagrangeCurve` untuk membuat banyak titik
// sampling agar bisa di-plot sebagai kurva mulus.
// =============================================================================

import { formatNum } from '../../../components/math/exprToLatex';

/**
 * Point — satu pasangan koordinat (x, y).
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * ExplanationBlock — kartu penjelasan untuk UI (sama struktur dengan integration).
 * Diduplicate di sini agar interpolation bisa standalone tanpa import dari integration.
 */
export interface ExplanationBlock {
  title: string;
  description?: string;
  latex?: string;
  values?: Array<{ label: string; value: string; highlight?: boolean }>;
  tone?: 'navy' | 'success' | 'warning' | 'lavender';
}

/**
 * Hasil dari satu perhitungan interpolasi.
 */
export interface InterpolationResult {
  /** Titik-titik input yang dipakai */
  points: Point[];

  /** Nilai x yang dievaluasi */
  evaluateAt: number;

  /** Nilai polinomial pada x tersebut: P(x_eval) */
  evaluateValue: number;

  /** Nama metode untuk ditampilkan */
  methodName: string;

  /** Polinomial dalam string biasa (untuk penyimpanan/fallback) */
  polynomial: string;

  /** Polinomial dalam format LaTeX (untuk render cantik) */
  polynomialLatex: string;

  /** Blok penjelasan langkah-langkah untuk UI */
  blocks: ExplanationBlock[];

  /** Tabel beda terbagi (hanya untuk Newton) */
  table?: number[][];
}

/**
 * Helper internal: bungkus daftar titik jadi LaTeX multi-baris.
 *
 * Kenapa multi-baris?
 * Kalau ada banyak titik, satu baris akan terlalu panjang dan tidak muat
 * di layar HP. Jadi kita pakai \\begin{aligned} agar tiap titik di baris
 * sendiri.
 */
function pointListLatex(points: Point[]): string {
  return (
    '\\begin{aligned} ' +
    points
      .map(
        (p, i) =>
          `& (x_{${i}}, y_{${i}}) = (${formatNum(p.x)}, ${formatNum(p.y)})`
      )
      .join(' \\\\ ')
    + ' \\end{aligned}'
  );
}

/* -------------------------------------------------------------------------- */
/*                          METODE LAGRANGE                                   */
/* -------------------------------------------------------------------------- */

/**
 * Interpolasi Lagrange.
 *
 * Cara kerja:
 * Untuk n+1 titik (x₀,y₀), (x₁,y₁), ..., (xₙ,yₙ):
 *
 *   P(x) = Σᵢ yᵢ · Lᵢ(x)
 *
 * Dengan Lᵢ(x) adalah "basis Lagrange":
 *
 *   Lᵢ(x) = Π_{j≠i} (x - xⱼ) / (xᵢ - xⱼ)
 *
 * Properti ajaib: Lᵢ(xᵢ) = 1 dan Lᵢ(xⱼ) = 0 untuk j≠i.
 * Maka P(xᵢ) = yᵢ — kurva pasti melewati semua titik input.
 */
export function calculateLagrange(params: {
  points: Point[];
  xEval: number;
}): InterpolationResult {
  const { points, xEval } = params;
  const n = points.length;

  // Akumulator untuk hasil dan komponen LaTeX
  let result = 0;
  const termsLatex: string[] = [];   // bentuk LaTeX tiap suku
  const termsValues: number[] = [];  // nilai numerik tiap suku

  // ─── Loop tiap titik untuk hitung kontribusinya ─────────────────────────
  for (let i = 0; i < n; i++) {
    let term = points[i].y;          // dimulai dari yᵢ
    let numLatex = '';                // pembilang LaTeX
    let denLatex = '';                // penyebut LaTeX

    // ─── Loop semua titik LAIN (j ≠ i) untuk basis Lᵢ(x) ─────────────────
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        // Faktor: (xEval - xⱼ) / (xᵢ - xⱼ)
        term *= (xEval - points[j].x) / (points[i].x - points[j].x);

        // Bangun string LaTeX untuk pembilang & penyebut
        numLatex += `(x - ${formatNum(points[j].x)})`;
        denLatex += `(${formatNum(points[i].x)} - ${formatNum(points[j].x)})`;
      }
    }

    result += term;
    termsValues.push(term);

    // Format suku ini sebagai LaTeX: yᵢ · (pembilang)/(penyebut)
    termsLatex.push(`${formatNum(points[i].y)}\\cdot\\frac{${numLatex}}{${denLatex}}`);
  }

  // ─── Format polinomial multi-baris ──────────────────────────────────────
  // P(x) = suku1
  //     + suku2
  //     + suku3
  //     ...
  const polyLatex =
    '\\begin{aligned} P(x) &= ' +
    termsLatex
      .map((t, i) => (i === 0 ? t : `\\\\ &\\quad + ${t}`))
      .join(' ') +
    ' \\end{aligned}';

  // Versi plain text (tanpa LaTeX) untuk disimpan ke history
  const polyPlain = termsLatex
    .join(' + ')
    .replace(/\\cdot/g, '·')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

  // ─── Format proses evaluasi P(xEval) multi-baris ────────────────────────
  // P(xEval) = nilai_suku1 + nilai_suku2 + ... = result
  const evalLines = termsValues.map((v, i) => {
    const sign = v >= 0 ? '+' : '-';
    return `${i === 0 ? '' : '\\\\ &\\quad ' + sign + ' '}${i === 0 ? formatNum(v) : formatNum(Math.abs(v))}`;
  });
  const evalLatex =
    `\\begin{aligned} P(${formatNum(xEval)}) &= ` +
    evalLines.join(' ') +
    ` \\\\ &= ${formatNum(result, 8)} \\end{aligned}`;

  // ─── Bangun blok penjelasan untuk UI ────────────────────────────────────
  const blocks: ExplanationBlock[] = [
    {
      title: 'Data titik yang diketahui',
      description: 'Lagrange membentuk polinomial unik yang melewati semua titik data ini.',
      latex: pointListLatex(points),
      tone: 'navy',
    },
    {
      title: 'Bentuk basis Lagrange',
      description:
        'Setiap titik (xᵢ, yᵢ) menyumbang satu suku berbentuk yᵢ · Lᵢ(x). Lᵢ(x) bernilai 1 di xᵢ dan 0 di simpul lain.',
      latex: `L_i(x) = \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}, \\quad P(x) = \\sum_{i=0}^{n} y_i\\,L_i(x)`,
      tone: 'lavender',
    },
    {
      title: 'Susun polinomial Lagrange',
      description:
        'Substitusi tiap titik ke rumus basis. Perkalian semua faktor (x - xⱼ)/(xᵢ - xⱼ) untuk j ≠ i menjadi bobot interpolasi.',
      latex: polyLatex,
      tone: 'navy',
    },
    {
      title: `Evaluasi P(${formatNum(xEval)})`,
      description: 'Substitusi nilai x yang dicari ke setiap suku, lalu jumlahkan kontribusinya.',
      latex: evalLatex,
      values: [{ label: `P(${formatNum(xEval)})`, value: formatNum(result, 8), highlight: true }],
      tone: 'success',
    },
  ];

  return {
    points,
    evaluateAt: xEval,
    evaluateValue: result,
    methodName: 'Lagrange',
    polynomial: polyPlain,
    polynomialLatex: polyLatex,
    blocks,
  };
}

/* -------------------------------------------------------------------------- */
/*                       METODE NEWTON DIVIDED DIFFERENCE                     */
/* -------------------------------------------------------------------------- */

/**
 * Interpolasi Newton dengan metode "beda terbagi" (divided differences).
 *
 * Cara kerja:
 * 1. Buat tabel beda terbagi:
 *    Kolom 0 = nilai y
 *    Kolom 1 = (yᵢ₊₁ - yᵢ) / (xᵢ₊₁ - xᵢ)
 *    Kolom 2 = (kolom1[i+1] - kolom1[i]) / (xᵢ₊₂ - xᵢ)
 *    ... dan seterusnya
 *
 * 2. Polinomial:
 *    P(x) = f[x₀] + f[x₀,x₁](x-x₀) + f[x₀,x₁,x₂](x-x₀)(x-x₁) + ...
 *
 * Kelebihan Newton dibanding Lagrange:
 * - Kalau titik baru ditambahkan, kita tinggal hitung 1 kolom baru,
 *   tidak perlu hitung ulang semua dari awal.
 */
export function calculateNewtonDivided(params: {
  points: Point[];
  xEval: number;
}): InterpolationResult {
  const { points, xEval } = params;
  const n = points.length;

  // ─── Inisialisasi tabel beda terbagi (n × n, isi 0) ─────────────────────
  const table: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  // Kolom 0: cuma nilai y
  for (let i = 0; i < n; i++) table[i][0] = points[i].y;

  // ─── Isi kolom-kolom berikutnya pakai rumus beda terbagi ────────────────
  // table[i][j] = (table[i+1][j-1] - table[i][j-1]) / (x[i+j] - x[i])
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      table[i][j] =
        (table[i + 1][j - 1] - table[i][j - 1]) /
        (points[i + j].x - points[i].x);
    }
  }

  // ─── Evaluasi P(xEval) — pakai DIAGONAL ATAS tabel sebagai koefisien ────
  let result = table[0][0];           // f[x₀]
  let product = 1;                    // (x-x₀)(x-x₁)...
  const evalSteps: Array<{ coef: number; product: number }> = [
    { coef: table[0][0], product: 1 },
  ];
  for (let j = 1; j < n; j++) {
    product *= xEval - points[j - 1].x;
    result += table[0][j] * product;
    evalSteps.push({ coef: table[0][j], product });
  }

  // ─── Format polinomial Newton sebagai LaTeX multi-baris ─────────────────
  // P(x) = c₀ + c₁(x-x₀) + c₂(x-x₀)(x-x₁) + ...
  const polyTerms: string[] = [`${formatNum(table[0][0])}`];
  for (let j = 1; j < n; j++) {
    let term = `${formatNum(Math.abs(table[0][j]))}`;
    for (let k = 0; k < j; k++) {
      term += `(x - ${formatNum(points[k].x)})`;
    }
    // Tanda + atau - tergantung koefisien
    polyTerms.push(table[0][j] >= 0 ? `+ ${term}` : `- ${term}`);
  }
  const polyLatex =
    '\\begin{aligned} P(x) &= ' +
    polyTerms.map((t, i) => (i === 0 ? t : `\\\\ &\\quad ${t}`)).join(' ') +
    ' \\end{aligned}';

  const polyPlain = polyTerms.join(' ');

  // ─── Format tabel beda terbagi sebagai LaTeX (segitiga atas) ────────────
  const tableLatex =
    '\\begin{array}{' + 'c'.repeat(n) + '} ' +
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n - i }, (_, j) => formatNum(table[i][j])).join(' & ')
    ).join(' \\\\ ') +
    ' \\end{array}';

  // ─── Format proses evaluasi multi-baris ─────────────────────────────────
  const evalLines = evalSteps.map((s, i) => {
    const v = s.coef * s.product;
    if (i === 0) return `${formatNum(v)}`;
    const sign = v >= 0 ? '+' : '-';
    return `\\\\ &\\quad ${sign} ${formatNum(Math.abs(s.coef))} \\cdot ${formatNum(s.product)}`;
  });
  const evalLatex =
    `\\begin{aligned} P(${formatNum(xEval)}) &= ` +
    evalLines.join(' ') +
    ` \\\\ &= ${formatNum(result, 8)} \\end{aligned}`;

  const blocks: ExplanationBlock[] = [
    {
      title: 'Data titik yang diketahui',
      description: 'Newton membangun polinomial dari beda terbagi (divided differences).',
      latex: pointListLatex(points),
      tone: 'navy',
    },
    {
      title: 'Hitung tabel beda terbagi',
      description:
        'Kolom 0 adalah nilai y. Kolom berikutnya: f[xᵢ,xᵢ₊₁,…] = (selisih kolom sebelumnya) ÷ (xᵢ₊ⱼ − xᵢ). Diagonal atas yang akan dipakai sebagai koefisien.',
      latex: tableLatex,
      tone: 'lavender',
    },
    {
      title: 'Susun polinomial Newton',
      description:
        'Bentuk: P(x) = f[x₀] + f[x₀,x₁](x − x₀) + f[x₀,x₁,x₂](x − x₀)(x − x₁) + …',
      latex: polyLatex,
      tone: 'navy',
    },
    {
      title: `Evaluasi P(${formatNum(xEval)})`,
      description: 'Substitusi x = ' + formatNum(xEval) + ' ke polinomial Newton.',
      latex: evalLatex,
      values: [{ label: `P(${formatNum(xEval)})`, value: formatNum(result, 8), highlight: true }],
      tone: 'success',
    },
  ];

  return {
    points,
    evaluateAt: xEval,
    evaluateValue: result,
    methodName: "Newton's Divided Difference",
    polynomial: polyPlain,
    polynomialLatex: polyLatex,
    blocks,
    table,
  };
}

/* -------------------------------------------------------------------------- */
/*                          GENERATOR KURVA UNTUK PLOT                        */
/* -------------------------------------------------------------------------- */

/**
 * Bikin banyak titik (default: 100) dengan x tersebar merata di rentang
 * data, lalu evaluasi tiap titiknya pakai Lagrange. Hasilnya bisa
 * di-plot sebagai garis kurva mulus di chart.
 *
 * Dipakai oleh InterpolationChart.
 */
export function generateLagrangeCurve(points: Point[], samples = 100): Point[] {
  if (points.length === 0) return [];

  // Tentukan rentang x dari titik input
  const xs = points.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const step = (xMax - xMin) / samples;

  // Generate titik-titik kurva
  const curve: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = xMin + i * step;
    const r = calculateLagrange({ points, xEval: x });
    curve.push({ x, y: r.evaluateValue });
  }
  return curve;
}
