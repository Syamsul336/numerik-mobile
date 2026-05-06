// =============================================================================
// FILE: src/core/parser/functionParser.ts
// =============================================================================
//
// FUNCTION PARSER
// ===============
//
// Apa fungsi file ini?
// --------------------
// User mengetik fungsi sebagai string, contoh: "x^2 + sin(x)".
// Komputer perlu MENGERTI string itu sebagai operasi matematika supaya
// bisa menghitung nilainya untuk x tertentu.
//
// File ini adalah "wrapper" (pembungkus) di atas library `mathjs` yang sudah
// pintar parsing & evaluasi ekspresi matematika. Kita bungkus untuk:
// - Lebih mudah dipakai di seluruh app (cukup `new FunctionParser(fn)`)
// - Tambah validasi error yang ramah
// - Bisa diganti library di belakang tanpa ubah kode pemanggil
//
// Apa itu mathjs?
// ---------------
// Library JavaScript untuk operasi matematika lengkap. Bisa parsing string,
// evaluasi numerik, simbolik, kalkulasi matriks, dan banyak lagi.
// Dipakai sebagai "otak" di balik perhitungan kita.
// =============================================================================

import * as math from 'mathjs';

/**
 * FunctionParser — parser & evaluator untuk satu ekspresi matematika.
 *
 * Cara pakai:
 *   const parser = new FunctionParser("x^2 + sin(x)");
 *   const y = parser.evaluate(2);   // → 4 + sin(2) = 4.909...
 *
 * Class ini menyimpan ekspresi yang sudah di-parse satu kali, lalu
 * bisa dievaluasi BANYAK KALI dengan x yang berbeda. Lebih cepat
 * daripada parsing ulang tiap evaluasi.
 */
export class FunctionParser {
  // `private`  : hanya bisa diakses dari dalam class
  // `readonly` : tidak bisa diubah setelah constructor selesai
  private readonly compiledNode: math.MathNode;

  /**
   * Constructor — dipanggil saat `new FunctionParser(...)`.
   *
   * @param expression - String ekspresi matematika ("x^2 + sin(x)")
   */
  constructor(expression: string) {
    // Hapus semua spasi (mathjs sebenarnya bisa handle spasi, tapi safer)
    const normalized = expression.replace(/\s+/g, '');

    // Parse string jadi "AST" (Abstract Syntax Tree) — struktur pohon
    // yang merepresentasikan ekspresi. Misalnya "x+1" jadi:
    //
    //        +
    //       / \
    //      x   1
    //
    // AST ini bisa di-evaluasi dengan cepat untuk berbagai nilai x.
    this.compiledNode = math.parse(normalized);
  }

  /**
   * Hitung nilai f(x) untuk x tertentu.
   *
   * @param x - Nilai input
   * @returns Hasil f(x) sebagai angka
   * @throws Error kalau hasilnya bukan angka valid (NaN atau Infinity)
   */
  evaluate(x: number): number {
    // Substitusi nilai x ke dalam tree, lalu hitung hasil akhirnya.
    // Parameter kedua adalah "scope" — nilai variabel yang dipakai.
    const result = this.compiledNode.evaluate({ x });

    // Validasi hasil: harus angka & tidak Infinity/NaN
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error(`Hasil bukan angka valid pada x=${x}`);
    }

    return result;
  }

  /**
   * Cek apakah suatu string ekspresi BISA di-parse dengan valid.
   *
   * @param input - String yang mau dicek
   * @returns true kalau valid, false kalau tidak
   *
   * Method ini `static` — artinya dipanggil di kelas (FunctionParser.isValid)
   * bukan di instance (parser.isValid). Berguna sebelum kita bikin
   * FunctionParser sungguhan, misal untuk validasi input form.
   */
  static isValid(input: string): boolean {
    try {
      // Coba parse + evaluasi pada x=1.0
      // Kalau berhasil tanpa error → valid
      const parser = new FunctionParser(input);
      parser.evaluate(1.0);
      return true;
    } catch {
      // Kalau error apapun → invalid
      return false;
    }
  }
}
