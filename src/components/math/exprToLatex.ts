// =============================================================================
// FILE: src/components/math/exprToLatex.ts
// =============================================================================
//
// EXPRESSION TO LATEX — konverter ekspresi → LaTeX
// =================================================
//
// Apa fungsi file ini?
// --------------------
// Mengubah ekspresi matematika "biasa" (yang user ketik di keyboard) jadi
// format LaTeX yang siap di-render sebagai rumus cantik.
//
// Contoh:
//   Input  : "x^2 + sin(x)"           (yang diketik user)
//   Output : "x^{2}+\\sin\\left(x\\right)"   (format LaTeX)
//
// Setelah jadi LaTeX, baru bisa di-render oleh KaTeX di komponen MathView.
//
// Plus: file ini juga punya helper `formatNum` untuk format angka cantik
// (tidak terlalu banyak desimal, integer tanpa titik).
// =============================================================================

import * as math from 'mathjs';

/**
 * Konversi ekspresi matematika ke string LaTeX.
 *
 * Cara kerja:
 * 1. Normalisasi: hapus spasi, koreksi typo umum (sen → sin, tg → tan)
 * 2. Parse ke AST (Abstract Syntax Tree) pakai mathjs
 * 3. Convert AST ke LaTeX dengan method `.toTex()`
 */
export function exprToLatex(expression: string, opts?: { fallbackToRaw?: boolean }): string {
  // `??` = nullish coalescing — kalau expression null/undefined, pakai ''
  const trimmed = (expression ?? '').trim();
  if (!trimmed) return '';

  try {
    // ─── Normalisasi input agar lebih ramah user Indonesia ────────────────
    const normalized = trimmed
      .replace(/\s+/g, '')              // hapus semua spasi
      .replace(/\bsen\(/g, 'sin(')      // koreksi typo: sen → sin (umum di Indonesia)
      .replace(/\btg\(/g, 'tan(');      // koreksi typo: tg → tan

    // Parse ke AST
    const node = math.parse(normalized);

    // Convert ke LaTeX
    // - parenthesis: 'auto' → tambah kurung otomatis sesuai precedence
    // - implicit: 'show' → tampilkan tanda kali eksplisit (lebih jelas)
    const tex = node.toTex({ parenthesis: 'auto', implicit: 'show' });
    return tex;
  } catch {
    // Kalau parse gagal (ekspresi invalid) → return string mentah, jangan crash
    if (opts?.fallbackToRaw) return trimmed;
    return trimmed;
  }
}

/**
 * Helper: bangun ekspresi LaTeX untuk integral tentu.
 *
 * Contoh: integralLatex("x^2", 0, 1) → "\\int_{0}^{1} x^{2}\\,dx"
 */
export function integralLatex(expression: string, a: number, b: number): string {
  const inner = exprToLatex(expression);
  return `\\int_{${formatNum(a)}}^{${formatNum(b)}} ${inner}\\,dx`;
}

/**
 * Format angka untuk tampilan rapi.
 *
 * Aturan:
 * - NaN/Infinity → kembalikan apa adanya
 * - Integer → tetap tanpa titik (5, bukan 5.000000)
 * - Pecahan → maksimal 6 digit signifikan, hapus trailing zero
 *
 * Contoh:
 *   formatNum(5)        → "5"
 *   formatNum(3.14159)  → "3.14159"
 *   formatNum(1.50000)  → "1.5"
 */
export function formatNum(n: number, maxDigits = 6): string {
  if (!isFinite(n)) return String(n);
  if (Number.isInteger(n)) return n.toString();

  // toFixed(6) → "1.500000" → Number → 1.5 → toString → "1.5"
  return Number(n.toFixed(maxDigits))
    .toString()
    .replace(/\.?0+$/, '');
}
