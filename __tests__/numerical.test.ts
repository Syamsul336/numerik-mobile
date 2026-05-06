// =============================================================================
// FILE: __tests__/numerical.test.ts
// =============================================================================
//
// UNIT TESTS untuk algoritma numerik
// ==================================
//
// Apa fungsi file ini?
// --------------------
// Memastikan algoritma yang kita tulis (Trapezoidal, Simpson, Romberg,
// Lagrange, Newton, Geometry) menghasilkan nilai yang BENAR sesuai
// teori matematika.
//
// Apa itu unit test?
// ------------------
// Test = kode yang otomatis menguji kode lain. Daripada kita manual buka
// app, ketik input, dan cek hasil → test melakukannya secara cepat dan
// terprogram.
//
// Manfaat:
// - Menangkap bug lebih awal (sebelum sampai ke production)
// - Memastikan refactoring tidak merusak fungsi yang sudah jalan
// - Dokumentasi hidup tentang behavior yang diharapkan
//
// Cara menjalankan:
//   npm test           → jalankan semua test 1 kali
//   npm test -- --watch → jalankan otomatis tiap file berubah
//
// Framework yang dipakai: Jest (sudah di-include via expo).
//
// Cara baca syntax test:
//   describe('GROUP', () => {     // kelompok test
//     test('NAMA TEST', () => {   // satu test
//       expect(VALUE).toBe(X);    // cek apakah VALUE === X
//     });
//   });
//
// Helper assertions yang dipakai:
// - toBe(x)         : exact equal (=== x)
// - toBeCloseTo(x,d): hampir sama, dengan d digit decimal toleransi
// - toThrow()       : fungsi melempar error
// =============================================================================

import {
  calculateTrapezoidal,
  calculateSimpson,
  calculateRomberg,
} from '../src/core/numerical/integration';
import {
  calculateLagrange,
  calculateNewtonDivided,
  type Point,
} from '../src/core/numerical/interpolation';
import { Geometry } from '../src/core/numerical/geometry';

// ─── METODE TRAPEZOIDAL ──────────────────────────────────────────────────
describe('Trapezoidal Method', () => {
  // ∫ x² dx dari 0 sampai 1 = 1/3 ≈ 0.333 (jawaban analitik)
  test('integrate x^2 from 0 to 1 should be ~0.333', () => {
    const result = calculateTrapezoidal({ function: 'x^2', a: 0, b: 1, n: 100 });
    // toBeCloseTo(0.333, 1) = harus mirip 0.333 dalam 1 digit decimal toleransi
    expect(result.value).toBeCloseTo(0.333, 1);
  });

  // ∫ x dx dari 0 sampai 2 = 2 (eksak, fungsi linear → trapesium presisi)
  test('integrate x from 0 to 2 should be exactly 2', () => {
    const result = calculateTrapezoidal({ function: 'x', a: 0, b: 2, n: 10 });
    expect(result.value).toBeCloseTo(2.0, 5);
  });
});

// ─── METODE SIMPSON 1/3 ──────────────────────────────────────────────────
describe('Simpson Method', () => {
  // ∫ x³ dx dari 0 sampai 1 = 0.25 (Simpson eksak untuk polinomial derajat ≤ 3)
  test('integrate x^3 from 0 to 1 should be 0.25', () => {
    const result = calculateSimpson({ function: 'x^3', a: 0, b: 1, n: 10 });
    expect(result.value).toBeCloseTo(0.25, 5);
  });

  // Simpson HARUS reject n ganjil (dia melempar Error)
  test('rejects odd n', () => {
    expect(() =>
      calculateSimpson({ function: 'x', a: 0, b: 1, n: 5 })
    ).toThrow();
  });
});

// ─── METODE ROMBERG ──────────────────────────────────────────────────────
describe('Romberg Method', () => {
  // ∫ sin(x) dx dari 0 sampai π = 2 (klasik)
  test('integrate sin(x) from 0 to pi should be ~2', () => {
    const result = calculateRomberg({ function: 'sin(x)', a: 0, b: Math.PI });
    // 5 digit decimal toleransi — Romberg sangat akurat untuk sin yang halus
    expect(result.value).toBeCloseTo(2.0, 5);
  });
});

// ─── INTERPOLASI LAGRANGE ────────────────────────────────────────────────
describe('Lagrange Interpolation', () => {
  // Sifat fundamental: polinomial Lagrange WAJIB melewati semua titik input.
  // Artinya P(xᵢ) = yᵢ untuk setiap titik.
  test('passes through given points', () => {
    const points: Point[] = [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 2 },
    ];
    // Cek tiap titik
    points.forEach((p) => {
      const result = calculateLagrange({ points, xEval: p.x });
      expect(result.evaluateValue).toBeCloseTo(p.y, 5);
    });
  });
});

// ─── INTERPOLASI NEWTON ──────────────────────────────────────────────────
describe('Newton Divided Difference', () => {
  // Sifat sama dengan Lagrange: kurva harus melewati semua titik.
  test('passes through given points', () => {
    const points: Point[] = [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 2 },
      { x: 3, y: 5 },
    ];
    points.forEach((p) => {
      const result = calculateNewtonDivided({ points, xEval: p.x });
      expect(result.evaluateValue).toBeCloseTo(p.y, 5);
    });
  });
});

// ─── GEOMETRI BANGUN DATAR ───────────────────────────────────────────────
describe('Geometry', () => {
  // Persegi sisi 5: luas = 25, keliling = 20
  test('square area and perimeter', () => {
    const r = Geometry.square(5);
    expect(r.area).toBe(25);
    expect(r.perimeter).toBe(20);
  });

  // Lingkaran r=2: luas = π·4 ≈ 12.566, keliling = 2π·2 ≈ 12.566
  test('circle area and perimeter', () => {
    const r = Geometry.circle(2);
    expect(r.area).toBeCloseTo(12.566, 2);
    expect(r.perimeter).toBeCloseTo(12.566, 2);
  });

  // Segitiga alas=4, tinggi=6: luas = ½·4·6 = 12
  test('triangle area', () => {
    const r = Geometry.triangle(4, 6);
    expect(r.area).toBe(12);
  });
});
