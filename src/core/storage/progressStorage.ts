// =============================================================================
// FILE: src/core/storage/progressStorage.ts
// =============================================================================
//
// PROGRESS STORAGE — tracker materi yang sudah dibaca user
// =========================================================
//
// Apa fungsi file ini?
// --------------------
// Menyimpan ID materi-materi yang sudah ditandai "sudah dibaca" oleh user.
// Datanya dipakai untuk:
// - Tampilkan badge "✓ sudah dibaca" di MateriListScreen
// - Hitung persentase progress (X dari 20 materi) di HomeScreen
//
// Format penyimpanan:
// -------------------
// Disimpan sebagai JSON array of strings (ID materi):
//   ["i-pengantar", "i-trapesium", "n-lagrange"]
//
// Kenapa pakai Set di kode tapi Array di storage?
// -----------------------------------------------
// Set lebih efisien untuk pengecekan "apakah ID ini ada?" — kompleksitas O(1)
// daripada Array O(n). Tapi AsyncStorage cuma bisa simpan string, jadi kita
// convert ke Array saat write, lalu balik ke Set saat read.
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// Key AsyncStorage — pakai prefix yang jelas untuk hindari konflik
const KEY = 'numerik:progress:read';

export const progressStorage = {
  /**
   * Ambil semua ID materi yang sudah dibaca, dalam bentuk Set.
   *
   * Kenapa Set?
   * Set punya method `.has(id)` yang super cepat (O(1)) untuk cek apakah
   * suatu ID ada. Cocok untuk pengecekan berulang di list yang panjang.
   *
   * @returns Set ID materi (kosong kalau belum ada yang dibaca)
   */
  async getReadIds(): Promise<Set<string>> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) return new Set();

      // Parse Array dari JSON, lalu convert jadi Set
      const arr: string[] = JSON.parse(raw);
      return new Set(arr);
    } catch {
      // Kalau ada error → return Set kosong (jangan crash)
      return new Set();
    }
  },

  /**
   * Tandai sebuah materi sebagai sudah dibaca.
   * "Idempotent" artinya: aman dipanggil berkali-kali, hasilnya tetap sama.
   *
   * @param id - ID materi yang akan ditandai
   */
  async markRead(id: string): Promise<void> {
    const ids = await this.getReadIds();
    ids.add(id);    // Set otomatis tidak duplikat
    // Convert Set → Array → JSON string sebelum simpan
    await AsyncStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
  },

  /**
   * Toggle status read: kalau sudah dibaca → jadi belum, sebaliknya.
   *
   * @param id - ID materi
   * @returns Status baru: true=sekarang sudah dibaca, false=belum dibaca
   */
  async toggleRead(id: string): Promise<boolean> {
    const ids = await this.getReadIds();
    if (ids.has(id)) {
      ids.delete(id);
    } else {
      ids.add(id);
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
    return ids.has(id);
  },

  /**
   * Reset semua progress.
   */
  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
  },
};
