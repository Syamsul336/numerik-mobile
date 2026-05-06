// =============================================================================
// FILE: src/core/storage/integralStore.ts
// =============================================================================
//
// INTEGRAL STORE — state global untuk modul Integral
// ===================================================
//
// Apa itu "store"?
// ----------------
// Store = tempat menyimpan DATA YANG DIPAKAI BANYAK KOMPONEN.
// Misalnya: nilai input fungsi, hasil perhitungan, status loading.
//
// Daripada tiap komponen punya state-nya sendiri lalu kita "drilling"
// (operan props dari atas ke bawah berkali-kali), kita simpan di store
// yang BISA DIBACA & DITULIS dari mana saja.
//
// Apa itu Zustand?
// ----------------
// Library state management yang sangat ringan & mudah dipakai.
// Lebih sederhana dari Redux. Kita panggil `create()` dengan fungsi yang
// mendefinisikan state + actions, lalu dapat hook untuk dipakai di komponen.
//
// Cara pakai di komponen:
//   import { useIntegralStore } from '...';
//
//   function MyComponent() {
//     // Subscribe ke seluruh state (re-render saat ada perubahan)
//     const state = useIntegralStore();
//
//     // Atau ambil cuma yang dibutuhkan (lebih efisien):
//     const fn = useIntegralStore((s) => s.function);
//
//     return <View>...</View>;
//   }
//
// Setiap kali state berubah (lewat `set(...)`),  semua komponen yang
// subscribe akan otomatis re-render.
// =============================================================================

import { create } from 'zustand';
import {
  calculateIntegral,
  type IntegralMethod,
  type IntegrationResult,
} from '../numerical/integration';
import { historyStorage } from './historyStorage';
import { formatNum } from '../../components/math/exprToLatex';

/**
 * IntegralState — bentuk lengkap state + actions yang ada di store ini.
 */
interface IntegralState {
  // ────── Data input ──────────────────────────────────────────────────
  function: string;          // string fungsi, contoh: "x^2"
  a: number;                 // batas bawah
  b: number;                 // batas atas
  n: number;                 // jumlah pias
  method: IntegralMethod;    // metode yang dipilih

  // ────── Data hasil ──────────────────────────────────────────────────
  result: IntegrationResult | null;  // hasil terakhir, null kalau belum hitung
  error: string | null;              // pesan error kalau ada
  isCalculating: boolean;            // status loading

  // ────── Actions (fungsi-fungsi untuk update state) ──────────────────
  setFunction: (fn: string) => void;
  setA: (a: number) => void;
  setB: (b: number) => void;
  setN: (n: number) => void;
  setMethod: (m: IntegralMethod) => void;
  calculate: () => Promise<void>;    // hitung integral + simpan ke history
  reset: () => void;                  // kembali ke nilai default
}

/**
 * useIntegralStore — hook React untuk akses store ini.
 *
 * `create()` menerima fungsi yang punya 2 parameter:
 * - set : fungsi untuk update state
 * - get : fungsi untuk baca state saat ini
 *
 * Yang di-return adalah objek dengan SEMUA field state + actions.
 */
export const useIntegralStore = create<IntegralState>((set, get) => ({
  // ────── Default values ────────────────────────────────────────────────
  function: 'x^2',                    // fungsi default
  a: 0,                                // batas default
  b: 1,
  n: 10,
  method: 'trapezoidal',
  result: null,
  error: null,
  isCalculating: false,

  // ────── Actions sederhana — setiap kali input berubah, hapus hasil lama ─
  // Logika: kalau user mengubah input, hasil lama jadi tidak relevan.
  // Daripada user lihat hasil yang sudah obsolete, kita reset jadi null.
  setFunction: (fn) => set({ function: fn, result: null, error: null }),
  setA: (a) => set({ a, result: null, error: null }),
  setB: (b) => set({ b, result: null, error: null }),
  setN: (n) => set({ n, result: null, error: null }),
  setMethod: (m) => set({ method: m, result: null, error: null }),

  // ────── Action utama: hitung integral ────────────────────────────────
  calculate: async () => {
    // Set status loading & clear error sebelumnya
    set({ isCalculating: true, error: null });

    try {
      // Ambil state saat ini (function, a, b, n, method)
      const { function: fn, a, b, n, method } = get();

      // Panggil fungsi kalkulasi (dari src/core/numerical/integration)
      const result = calculateIntegral({ method, function: fn, a, b, n });

      // Update state: simpan hasil & matikan loading
      set({ result, isCalculating: false });

      // Auto-save ke riwayat — supaya muncul di HistoryScreen
      await historyStorage.add({
        module: 'integral',
        title: `∫ ${fn} dx pada [${formatNum(a)}, ${formatNum(b)}]`,
        summary: `${result.methodName} · n=${result.n} · ≈ ${formatNum(result.value, 6)}`,
        data: { fn, a, b, n: result.n, method: result.methodName, value: result.value },
      });
    } catch (e) {
      // Kalau gagal: simpan pesan error & matikan loading
      const message = e instanceof Error ? e.message : String(e);
      set({ error: message, isCalculating: false });
    }
  },

  // ────── Reset ke default ──────────────────────────────────────────────
  reset: () =>
    set({
      function: 'x^2',
      a: 0,
      b: 1,
      n: 10,
      method: 'trapezoidal',
      result: null,
      error: null,
    }),
}));
