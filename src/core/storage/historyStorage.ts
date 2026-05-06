// =============================================================================
// FILE: src/core/storage/historyStorage.ts
// =============================================================================
//
// HISTORY STORAGE — manajer riwayat perhitungan user
// ===================================================
//
// Apa fungsi file ini?
// --------------------
// Menyimpan dan mengambil ulang riwayat perhitungan user (integral,
// interpolasi, geometri). Data tersimpan secara LOKAL di HP, jadi tetap
// ada walaupun aplikasi ditutup atau HP di-restart.
//
// Apa itu AsyncStorage?
// ---------------------
// AsyncStorage adalah penyimpanan key-value sederhana di React Native.
// Mirip "localStorage" di browser web. Cocok untuk data kecil-menengah
// seperti settings, history, cache.
//
// Kelebihan AsyncStorage:
// - Sederhana (cuma get/set/remove)
// - Persistent (data tetap setelah restart)
// - Async (tidak bikin UI lag)
//
// Kekurangan:
// - Lambat untuk data besar (>1MB)
// - Tidak ada query/filter kompleks (cuma string)
// - Tidak terenkripsi by default
//
// Untuk data sensitif (password, token) → pakai SecureStore.
// Untuk data besar/kompleks → pakai SQLite atau Realm.
//
// Format penyimpanan:
// -------------------
// Semua entry disimpan sebagai SATU JSON array, dengan key 'numerik:history'.
// Setiap kali baca → parse JSON. Setiap kali tulis → stringify JSON.
//
// Limit: 100 entries terbaru saja (lainnya dihapus otomatis).
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

/**
 * HistoryEntry — satu entry riwayat.
 */
export interface HistoryEntry {
  /** ID unik (UUID) — supaya bisa dihapus by-id */
  id: string;

  /** Timestamp dalam format ISO 8601 ("2026-05-05T10:30:00.000Z") */
  timestamp: string;

  /** Modul mana: integral / interpolation / geometry */
  module: 'integral' | 'interpolation' | 'geometry';

  /** Judul singkat (misal: "∫ x² dx pada [0, 1]") */
  title: string;

  /** Ringkasan hasil (misal: "Trapezoidal · n=10 · ≈ 0.335") */
  summary: string;

  /** Data lengkap perhitungan (untuk recall kalau user mau lihat detail) */
  data: Record<string, unknown>;
}

// Key untuk AsyncStorage. Pakai prefix 'numerik:' supaya tidak bentrok
// dengan app lain (kalau suatu saat kita pakai shared storage).
const KEY = 'numerik:history';

/**
 * Object dengan method-method untuk operasi history.
 * Pola "module pattern" — tidak perlu instansiasi, cuma pakai langsung.
 *
 * Contoh:
 *   import { historyStorage } from '...';
 *   const all = await historyStorage.getAll();
 */
export const historyStorage = {
  /**
   * Ambil semua entry, sudah disortir berdasarkan timestamp (terbaru di atas).
   *
   * @returns Array entries (kosong kalau belum ada).
   */
  async getAll(): Promise<HistoryEntry[]> {
    try {
      // Baca string mentah dari AsyncStorage
      const raw = await AsyncStorage.getItem(KEY);

      // Kalau belum ada data → kembalikan array kosong
      if (!raw) return [];

      // Parse JSON → array entries
      const entries: HistoryEntry[] = JSON.parse(raw);

      // Sort berdasarkan timestamp DESCENDING (terbaru dulu)
      return entries.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      // Kalau ada error (data corrupt, dll.) → kembalikan array kosong
      // supaya tidak crash UI
      return [];
    }
  },

  /**
   * Tambahkan entry baru. Otomatis batasi maksimal 100 entries terbaru.
   *
   * @param params Data entry tanpa id & timestamp (akan auto-generate)
   */
  async add(params: {
    module: HistoryEntry['module'];
    title: string;
    summary: string;
    data: Record<string, unknown>;
  }): Promise<void> {
    // Ambil entries lama (sudah sorted)
    const entries = await this.getAll();

    // Buat entry baru dengan ID UUID & timestamp sekarang
    const newEntry: HistoryEntry = {
      id: uuid.v4() as string,                // generate UUID v4
      timestamp: new Date().toISOString(),    // ISO 8601 timestamp
      module: params.module,
      title: params.title,
      summary: params.summary,
      data: params.data,
    };

    // Tambah di awal array (paling baru)
    entries.unshift(newEntry);

    // Batasi 100 entries — sisanya dibuang
    const limited = entries.slice(0, 100);

    // Simpan ulang sebagai JSON string
    await AsyncStorage.setItem(KEY, JSON.stringify(limited));
  },

  /**
   * Hapus satu entry berdasarkan ID.
   */
  async remove(id: string): Promise<void> {
    const entries = await this.getAll();
    const filtered = entries.filter((e) => e.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
  },

  /**
   * Hapus SEMUA entry. Hati-hati, tidak ada konfirmasi di sini —
   * UI yang harus konfirmasi ke user dulu.
   */
  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
  },
};
