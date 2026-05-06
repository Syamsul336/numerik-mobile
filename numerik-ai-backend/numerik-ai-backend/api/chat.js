// =============================================================================
// FILE: api/chat.js
// =============================================================================
// Ini adalah "Serverless Function" Vercel — kode yang akan jalan di server
// Vercel saat ada request masuk ke URL https://[your-app].vercel.app/api/chat
//
// Tugasnya:
// 1. Terima pertanyaan dari aplikasi mobile (React Native)
// 2. Filter: pastikan pertanyaan tentang topik numerik
// 3. Forward ke Gemini API dengan API key (yang disimpan di env Vercel)
// 4. Kembalikan jawaban ke aplikasi mobile
//
// API key tidak pernah ada di kode mobile → aman dari reverse engineering.
// =============================================================================

// -----------------------------------------------------------------------------
// 📚 DAFTAR TOPIK YANG DIIZINKAN
// -----------------------------------------------------------------------------
// Pre-filter pertanyaan user. Kalau tidak ada keyword cocok → tolak tanpa
// kirim ke AI (hemat kuota).
// -----------------------------------------------------------------------------
const TOPIK_NUMERIK_KEYWORDS = [
  // Integral
  'integral', 'integrasi', 'numerik', 'aproksimasi', 'simpson',
  'trapesium', 'trapezoidal', 'romberg', 'newton-cotes',
  // Interpolasi
  'interpolasi', 'lagrange', 'newton', 'divided difference',
  'spline', 'polinomial', 'polynomial',
  // Geometri
  'geometri', 'persegi', 'segitiga', 'lingkaran', 'jajar genjang',
  'jajaran genjang', 'luas', 'keliling', 'pythagoras',
  'phytagoras', 'rumus', 'bangun datar',
  // Konsep umum
  'error', 'galat', 'konvergen', 'orde', 'akurasi', 'iterasi',
  'metode', 'fungsi', 'kurva', 'grafik', 'titik', 'data',
  'subinterval', 'partisi',
  // Greeting (boleh, supaya ramah)
  'halo', 'hai', 'hello', 'terima kasih', 'thanks',
];

// -----------------------------------------------------------------------------
// 📝 KONTEKS MATERI APLIKASI (untuk AI tahu materi apa saja yang ada)
// -----------------------------------------------------------------------------
const KONTEKS_MATERI = `
Aplikasi Numerik Mobile punya 20 materi:

INTEGRAL (7 materi):
- Pengantar Integral Numerik, Aturan Trapesium, Aturan Simpson 1/3,
- Metode Romberg, Analisis Error & Konvergensi, Memilih Metode, Aplikasi.

INTERPOLASI (6 materi):
- Pengantar Interpolasi, Lagrange, Newton's Divided Difference,
- Spline, Aplikasi.

GEOMETRI (7 materi):
- Pengantar Geometri Datar, Persegi & Persegi Panjang, Segitiga,
- Lingkaran, Trapesium, Jajar Genjang, Aplikasi.
`;

// -----------------------------------------------------------------------------
// 🤖 SYSTEM PROMPT — Aturan untuk AI
// -----------------------------------------------------------------------------
const SYSTEM_PROMPT = `
Kamu adalah asisten pembelajaran METODE NUMERIK untuk mahasiswa Indonesia
yang menggunakan aplikasi Numerik Mobile.

ATURAN KETAT:
1. Kamu HANYA boleh menjawab pertanyaan tentang:
   - Integral numerik (Trapesium, Simpson, Romberg, error, konvergensi)
   - Interpolasi (Lagrange, Newton, Spline)
   - Geometri datar (luas, keliling, Pythagoras, dll.)
   - Konsep matematika dasar yang berkaitan langsung.

2. Jika user bertanya di LUAR topik di atas, jawab:
   "Maaf, saya hanya bisa membantu topik metode numerik di aplikasi ini.
   Coba tanyakan tentang Integral, Interpolasi, atau Geometri ya!"

3. Jangan bahas topik berbahaya, dewasa, atau tidak pantas.

4. Format jawaban:
   - Bahasa Indonesia ramah dan mudah dipahami
   - Maksimal 3 paragraf, ringkas
   - Fokus pada KONSEP dan INTUISI, bukan rumus panjang
   - Boleh merujuk ke materi di aplikasi

${KONTEKS_MATERI}

Kamu adalah TUTOR sabar untuk pemula.
`;

// -----------------------------------------------------------------------------
// 🛡️ RATE LIMITING — cegah satu IP spam request
// -----------------------------------------------------------------------------
// Catatan: ini in-memory, akan reset saat function restart.
// Untuk production scale yang lebih besar, gunakan Upstash Redis atau
// Vercel KV. Untuk skripsi/project pribadi, ini sudah cukup.
// -----------------------------------------------------------------------------
const requestLog = new Map();
const RATE_LIMIT = 20;        // max 20 request per IP
const RATE_WINDOW = 60_000;   // per 60 detik

function checkRateLimit(ip) {
  const now = Date.now();
  const record = requestLog.get(ip) || { count: 0, resetAt: now + RATE_WINDOW };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_WINDOW;
  }

  record.count++;
  requestLog.set(ip, record);

  return record.count <= RATE_LIMIT;
}

// -----------------------------------------------------------------------------
// 🛡️ PRE-FILTER: cek apakah pertanyaan terkait topik numerik
// -----------------------------------------------------------------------------
function isPertanyaanRelevan(question) {
  const lower = question.toLowerCase();
  // Pertanyaan terlalu pendek → izinkan, biar AI yang tangani
  if (lower.split(/\s+/).filter(Boolean).length < 3) return true;
  return TOPIK_NUMERIK_KEYWORDS.some((kw) => lower.includes(kw));
}

// =============================================================================
// HANDLER UTAMA — fungsi yang dipanggil Vercel saat ada request masuk
// =============================================================================
export default async function handler(req, res) {
  // ─── CORS Headers ───────────────────────────────────────────────────────
  // Wajib supaya aplikasi mobile bisa akses dari berbagai origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request (CORS handshake)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Gunakan POST.' });
  }

  // ─── Rate Limiting ──────────────────────────────────────────────────────
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Terlalu banyak pertanyaan. Coba lagi 1 menit lagi ya.',
    });
  }

  // ─── Validasi Input ─────────────────────────────────────────────────────
  const { question, context } = req.body || {};

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Field "question" wajib diisi.' });
  }

  if (question.length > 1000) {
    return res.status(400).json({ error: 'Pertanyaan terlalu panjang (max 1000 karakter).' });
  }

  // ─── Pre-filter Topik ───────────────────────────────────────────────────
  if (!isPertanyaanRelevan(question)) {
    return res.status(200).json({
      answer:
        'Maaf, sepertinya pertanyaan kamu di luar topik metode numerik di ' +
        'aplikasi ini. 🙏\n\nCoba tanyakan tentang:\n' +
        '• Integral (Trapesium, Simpson, Romberg)\n' +
        '• Interpolasi (Lagrange, Newton, Spline)\n' +
        '• Geometri datar (luas, keliling, dsb.)',
    });
  }

  // ─── Cek API Key di Environment Variable ────────────────────────────────
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error('GEMINI_API_KEY belum diset di environment variable Vercel!');
    return res.status(500).json({ error: 'Server belum dikonfigurasi dengan benar.' });
  }

  // ─── Kirim ke Gemini API ────────────────────────────────────────────────
  const MODEL = 'gemini-2.5-flash-lite';
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  const fullPrompt = `${SYSTEM_PROMPT}
${context ? `\n[Konteks: User sedang membuka materi tentang "${context}"]` : ''}

PERTANYAAN USER: ${question}

Jawab sesuai aturan di atas:`;

  try {
    const geminiResponse = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errText);

      if (geminiResponse.status === 401 || geminiResponse.status === 403) {
        return res.status(500).json({ error: 'API key di server tidak valid.' });
      }
      if (geminiResponse.status === 429) {
        return res.status(429).json({ error: 'Kuota AI sudah penuh. Coba lagi nanti.' });
      }
      return res.status(502).json({ error: 'Gagal menghubungi AI.' });
    }

    const data = await geminiResponse.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      return res.status(200).json({ answer: 'Maaf, AI tidak memberikan jawaban. Coba pertanyaan lain.' });
    }

    return res.status(200).json({ answer: answer.trim() });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
}
