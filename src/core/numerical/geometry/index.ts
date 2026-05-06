// =============================================================================
// FILE: src/core/numerical/geometry/index.ts
// =============================================================================
//
// MODUL BANGUN DATAR
// ==================
//
// Modul ini menyediakan fungsi untuk hitung LUAS dan KELILING dari 6 bentuk
// dasar: persegi, persegi panjang, segitiga, lingkaran, trapesium, dan
// jajar genjang.
//
// Cara pemakaian:
//   import { Geometry } from '...';
//   const result = Geometry.square(5);
//   console.log(result.area);     // 25
//   console.log(result.perimeter); // 20
//
// Tiap fungsi mengembalikan struktur GeometryResult yang berisi:
// - shape: ID bentuk (untuk identifikasi internal)
// - shapeName: nama bentuk dalam Bahasa Indonesia
// - area: luas
// - perimeter: keliling (0 kalau bentuk tidak punya rumus keliling default)
// - areaFormula & perimeterFormula: rumus dalam string
// - inputs: ukuran-ukuran yang dipakai
// - blocks: array penjelasan langkah-langkah untuk UI
// =============================================================================

import { formatNum } from '../../../components/math/exprToLatex';

/**
 * ShapeType — daftar bentuk yang didukung.
 * Union type: nilai variabel cuma boleh salah satu dari 6 string ini.
 */
export type ShapeType =
  | 'square'
  | 'rectangle'
  | 'triangle'
  | 'circle'
  | 'trapezoid'
  | 'parallelogram';

/**
 * Struktur untuk kartu penjelasan (sama dengan modul lain).
 */
export interface ExplanationBlock {
  title: string;
  description?: string;
  latex?: string;
  values?: Array<{ label: string; value: string; highlight?: boolean }>;
  tone?: 'navy' | 'success' | 'warning' | 'lavender';
}

/**
 * Hasil dari satu perhitungan geometri.
 */
export interface GeometryResult {
  shape: ShapeType;
  shapeName: string;
  area: number;
  perimeter: number;
  areaFormula: string;
  perimeterFormula: string;
  /** Daftar input dimensi (key-value pair) */
  inputs: Record<string, number>;
  blocks: ExplanationBlock[];
}

/**
 * Helper internal: bangun array `blocks` (kartu langkah) untuk satu bentuk.
 *
 * Daripada kita ulang-ulang struktur block yang sama di tiap bentuk,
 * kita bikin fungsi helper yang menerima parameter generik.
 */
function makeBlocks({
  name,
  inputs,
  area,
  perimeter,
  areaLatex,
  areaCalcLatex,
  perimeterLatex,
  perimeterCalcLatex,
}: {
  name: string;
  inputs: Array<{ label: string; value: number }>;
  area: number;
  perimeter: number;
  areaLatex: string;            // rumus luas (simbolik)
  areaCalcLatex: string;        // rumus luas (sudah disubstitusi nilai)
  perimeterLatex?: string;      // rumus keliling (opsional)
  perimeterCalcLatex?: string;  // rumus keliling sudah disubstitusi (opsional)
}): ExplanationBlock[] {
  // Mulai dengan 3 blok dasar: identifikasi + rumus luas + substitusi
  const blocks: ExplanationBlock[] = [
    {
      title: `Identifikasi ${name}`,
      description:
        'Catat semua dimensi yang diketahui sebagai input untuk rumus luas dan keliling.',
      values: inputs.map((i) => ({ label: i.label, value: formatNum(i.value) })),
      tone: 'navy',
    },
    {
      title: 'Rumus luas',
      description: `Rumus luas baku untuk ${name.toLowerCase()}.`,
      latex: areaLatex,
      tone: 'lavender',
    },
    {
      title: 'Substitusi nilai',
      description: 'Masukkan dimensi yang diketahui ke rumus.',
      latex: areaCalcLatex,
      values: [{ label: 'Luas', value: formatNum(area, 6), highlight: true }],
      tone: 'success',
    },
  ];

  // Tambahkan blok keliling kalau bentuknya punya rumus keliling
  if (perimeterLatex && perimeterCalcLatex) {
    blocks.push({
      title: 'Rumus keliling',
      description: `Rumus keliling baku untuk ${name.toLowerCase()}.`,
      latex: perimeterLatex,
      tone: 'lavender',
    });
    blocks.push({
      title: 'Hitung keliling',
      description: 'Substitusi nilai sisi atau busur ke rumus keliling.',
      latex: perimeterCalcLatex,
      values: [{ label: 'Keliling', value: formatNum(perimeter, 6), highlight: true }],
      tone: 'success',
    });
  }

  return blocks;
}

/**
 * Geometry — object berisi semua method untuk hitung tiap bentuk.
 *
 * Kenapa pakai object literal bukan class?
 * Karena kita tidak butuh state (semua fungsi murni). Pemakaian lebih
 * sederhana: `Geometry.square(5)` daripada `new Geometry().square(5)`.
 */
export const Geometry = {
  /**
   * Persegi: 4 sisi sama panjang.
   * Luas = sisi²
   * Keliling = 4 × sisi
   */
  square(side: number): GeometryResult {
    const area = side * side;
    const perimeter = 4 * side;
    return {
      shape: 'square',
      shapeName: 'Persegi',
      area,
      perimeter,
      areaFormula: 'L = s²',
      perimeterFormula: 'K = 4s',
      inputs: { sisi: side },
      blocks: makeBlocks({
        name: 'Persegi',
        inputs: [{ label: 'Sisi (s)', value: side }],
        area,
        perimeter,
        areaLatex: `L = s^{2}`,
        areaCalcLatex: `L = (${formatNum(side)})^{2} = ${formatNum(area, 6)}`,
        perimeterLatex: `K = 4s`,
        perimeterCalcLatex: `K = 4 \\cdot ${formatNum(side)} = ${formatNum(perimeter, 6)}`,
      }),
    };
  },

  /**
   * Persegi Panjang: panjang × lebar.
   * Luas = p × l
   * Keliling = 2(p + l)
   */
  rectangle(length: number, width: number): GeometryResult {
    const area = length * width;
    const perimeter = 2 * (length + width);
    return {
      shape: 'rectangle',
      shapeName: 'Persegi Panjang',
      area,
      perimeter,
      areaFormula: 'L = p × l',
      perimeterFormula: 'K = 2(p + l)',
      inputs: { panjang: length, lebar: width },
      blocks: makeBlocks({
        name: 'Persegi Panjang',
        inputs: [
          { label: 'Panjang (p)', value: length },
          { label: 'Lebar (l)', value: width },
        ],
        area,
        perimeter,
        areaLatex: `L = p \\cdot l`,
        areaCalcLatex: `L = ${formatNum(length)} \\cdot ${formatNum(width)} = ${formatNum(area, 6)}`,
        perimeterLatex: `K = 2(p + l)`,
        perimeterCalcLatex: `K = 2(${formatNum(length)} + ${formatNum(width)}) = ${formatNum(perimeter, 6)}`,
      }),
    };
  },

  /**
   * Segitiga: alas × tinggi ÷ 2.
   * Catatan: keliling tidak dihitung di sini karena butuh 3 sisi.
   * Hanya butuh alas & tinggi untuk luas.
   */
  triangle(base: number, height: number): GeometryResult {
    const area = 0.5 * base * height;
    return {
      shape: 'triangle',
      shapeName: 'Segitiga',
      area,
      perimeter: 0, // tidak dihitung
      areaFormula: 'L = ½ × a × t',
      perimeterFormula: 'K = a + b + c',
      inputs: { alas: base, tinggi: height },
      blocks: makeBlocks({
        name: 'Segitiga',
        inputs: [
          { label: 'Alas (a)', value: base },
          { label: 'Tinggi (t)', value: height },
        ],
        area,
        perimeter: 0,
        areaLatex: `L = \\tfrac{1}{2}\\,a\\,t`,
        areaCalcLatex: `L = \\tfrac{1}{2} \\cdot ${formatNum(base)} \\cdot ${formatNum(height)} = ${formatNum(area, 6)}`,
        // perimeterLatex tidak diisi → tidak ditampilkan
      }),
    };
  },

  /**
   * Lingkaran: π × r².
   * Luas = πr²
   * Keliling = 2πr (juga disebut "umfang" / "circumference")
   */
  circle(radius: number): GeometryResult {
    const area = Math.PI * radius * radius;
    const perimeter = 2 * Math.PI * radius;
    return {
      shape: 'circle',
      shapeName: 'Lingkaran',
      area,
      perimeter,
      areaFormula: 'L = πr²',
      perimeterFormula: 'K = 2πr',
      inputs: { 'jari-jari': radius },
      blocks: makeBlocks({
        name: 'Lingkaran',
        inputs: [{ label: 'Jari-jari (r)', value: radius }],
        area,
        perimeter,
        areaLatex: `L = \\pi r^{2}`,
        areaCalcLatex: `L = \\pi \\cdot (${formatNum(radius)})^{2} = ${formatNum(area, 6)}`,
        perimeterLatex: `K = 2\\pi r`,
        perimeterCalcLatex: `K = 2\\pi \\cdot ${formatNum(radius)} = ${formatNum(perimeter, 6)}`,
      }),
    };
  },

  /**
   * Trapesium: ½(sisi a + sisi b) × tinggi.
   */
  trapezoid(a: number, b: number, height: number): GeometryResult {
    const area = 0.5 * (a + b) * height;
    return {
      shape: 'trapezoid',
      shapeName: 'Trapesium',
      area,
      perimeter: 0,
      areaFormula: 'L = ½(a + b) × t',
      perimeterFormula: 'K = jumlah sisi',
      inputs: { a, b, tinggi: height },
      blocks: makeBlocks({
        name: 'Trapesium',
        inputs: [
          { label: 'Sisi sejajar a', value: a },
          { label: 'Sisi sejajar b', value: b },
          { label: 'Tinggi (t)', value: height },
        ],
        area,
        perimeter: 0,
        areaLatex: `L = \\tfrac{1}{2}(a + b)\\,t`,
        areaCalcLatex: `L = \\tfrac{1}{2}(${formatNum(a)} + ${formatNum(b)}) \\cdot ${formatNum(height)} = ${formatNum(area, 6)}`,
      }),
    };
  },

  /**
   * Jajar Genjang: alas × tinggi (sama seperti persegi panjang miring).
   */
  parallelogram(base: number, height: number): GeometryResult {
    const area = base * height;
    return {
      shape: 'parallelogram',
      shapeName: 'Jajar Genjang',
      area,
      perimeter: 0,
      areaFormula: 'L = a × t',
      perimeterFormula: 'K = 2(a + b)',
      inputs: { alas: base, tinggi: height },
      blocks: makeBlocks({
        name: 'Jajar Genjang',
        inputs: [
          { label: 'Alas (a)', value: base },
          { label: 'Tinggi (t)', value: height },
        ],
        area,
        perimeter: 0,
        areaLatex: `L = a \\cdot t`,
        areaCalcLatex: `L = ${formatNum(base)} \\cdot ${formatNum(height)} = ${formatNum(area, 6)}`,
      }),
    };
  },
};
