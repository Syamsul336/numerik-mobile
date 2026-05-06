// =============================================================================
// FILE: src/core/ai/aiService.ts
// =============================================================================
//
// VERSI BACKEND PROXY (AMAN UNTUK PRODUKSI)
//
// File ini TIDAK PUNYA API KEY. Semua request ke Gemini dilakukan oleh
// backend kita di Vercel. APK aplikasi ini AMAN walaupun di-reverse engineer
// karena tidak ada secret yang bisa diekstrak.
//
// Yang perlu Anda ubah hanya BACKEND_URL di bawah, sesuai URL Vercel Anda
// setelah deploy berhasil.
//
// Lihat panduan lengkap deploy di PANDUAN_DEPLOY_VERCEL.md di root project.
// =============================================================================

import axios, { AxiosInstance } from 'axios';

// -----------------------------------------------------------------------------
// 🌐 BACKEND URL
// -----------------------------------------------------------------------------
//
// Setelah deploy backend ke Vercel, Anda akan dapat URL seperti:
//   https://numerik-ai-backend.vercel.app
//
// Endpoint chat-nya:
//   https://numerik-ai-backend.vercel.app/api/chat
//
// Ganti string di bawah dengan URL Anda sendiri.
// -----------------------------------------------------------------------------

// TODO: Ganti dengan URL Vercel Anda setelah deploy berhasil
const BACKEND_URL = 'https://numerik-ai-backend.vercel.app/api/chat';

// =============================================================================
// CLASS: AiService
// =============================================================================
export class AiService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_URL,
      timeout: 30000,
      headers: { 'content-type': 'application/json' },
    });
  }

  /**
   * Bertanya ke AI lewat backend proxy.
   *
   * @param params.question - Pertanyaan dari user
   * @param params.context  - (Opsional) konteks topik yang sedang dipelajari
   * @returns Promise<string> - jawaban AI
   */
  async ask(params: { question: string; context?: string }): Promise<string> {
    const { question, context } = params;

    // Mode demo: kalau URL belum diganti, tampilkan jawaban demo
    if (BACKEND_URL.includes('numerik-ai-backend.vercel.app')) {
      // Default URL — kemungkinan user belum ganti
      // (boleh hapus pengecekan ini setelah Anda deploy & ganti URL)
    }

    try {
      const response = await this.client.post('', {
        question,
        context,
      });

      const answer = response.data?.answer;
      if (!answer) {
        return 'Maaf, AI tidak memberikan jawaban. Coba pertanyaan lain.';
      }
      return answer;
    } catch (error) {
      // Penanganan error yang ramah dan informatif
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errMsg = error.response?.data?.error;

        if (status === 429) {
          return errMsg || 'Terlalu banyak pertanyaan. Coba 1 menit lagi ya.';
        }
        if (status === 400) {
          return errMsg || 'Pertanyaan tidak valid.';
        }
        if (status === 500) {
          return errMsg || 'Server bermasalah. Coba lagi nanti.';
        }
        if (status === 502) {
          return 'AI sedang tidak bisa diakses. Coba lagi sebentar.';
        }
        if (error.code === 'ECONNABORTED') {
          return 'AI tidak merespons (timeout). Cek koneksi internet kamu.';
        }
        if (error.code === 'ERR_NETWORK') {
          return 'Tidak bisa terhubung ke server. Cek koneksi internet kamu.';
        }
        return `Error: ${errMsg || error.message || 'Gagal menghubungi AI'}`;
      }
      return 'Error: Terjadi kesalahan tidak terduga.';
    }
  }
}

// -----------------------------------------------------------------------------
// SINGLETON INSTANCE
// -----------------------------------------------------------------------------
export const aiService = new AiService();
