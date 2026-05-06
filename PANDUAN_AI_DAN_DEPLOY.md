# 🤖🤝 Panduan Lengkap: AI Asisten & Deploy ke Vercel

> Dokumen ini menggabungkan dua panduan:
> 1. **Setup AI Asisten** — Cara menyambungkan AI ke aplikasi (Gemini, Groq, OpenRouter, atau Claude)
> 2. **Deploy Backend ke Vercel** — Cara deploy backend proxy AI untuk production

---

## 📋 Daftar Isi

### Bagian A: Setup AI Asisten
1. [Konsep Dasar](#-bagian-a1---konsep-dasar)
2. [Pilih Layanan AI](#-bagian-a2---pilih-layanan-ai-gratis)
3. [Dapatkan API Key](#-bagian-a3---cara-mendapatkan-api-key)
4. [Pasang di Aplikasi](#-bagian-a4---memasukkan-api-key-ke-aplikasi)
5. [Testing & Troubleshooting](#-bagian-a5---uji-coba-dan-troubleshooting)

### Bagian B: Deploy ke Vercel
6. [Setup GitHub & Vercel](#-bagian-b1---setup-github-dan-vercel)
7. [Deploy Backend](#-bagian-b2---deploy-backend)
8. [Update Aplikasi Mobile](#-bagian-b3---update-aplikasi-mobile)
9. [Test Akhir](#-bagian-b4---test-akhir)

---

# 📖 BAGIAN A — SETUP AI ASISTEN

## 🔷 Bagian A1 — Konsep Dasar (Wajib Baca!)

Sebelum praktik, kamu perlu paham 3 hal ini:

### Apa itu "Model AI"?
**Model AI** adalah program raksasa yang sudah "belajar" dari miliaran teks di internet, sehingga bisa menjawab pertanyaan, menulis kode, menjelaskan konsep, dll. Contoh: ChatGPT, Claude, Gemini.

Model AI ini **terlalu besar** untuk dipasang di HP — bisa sampai ratusan giga! Jadi kita tidak menjalankannya di HP, melainkan **menyewa** dari server perusahaan AI.

### Apa itu "API"?
**API** (Application Programming Interface) = "pintu masuk" untuk berbicara dengan layanan AI di internet.

Analogi: bayangkan AI seperti restoran. Kamu (aplikasi Numerik) tidak masuk ke dapur untuk memasak — kamu pesan lewat **pelayan** (API). Pelayan menerima pesanan, mengantar ke dapur, lalu membawa makanan kembali.

### Apa itu "API Key"?
**API key** = kartu identitas untuk pelayan tahu kamu adalah pelanggan resmi.

Tanpa API key → pelayan tidak akan layani.
Dengan API key → pelayan layani, dan tagihan masuk ke akunmu.

⚠️ **PENTING:** API key seperti **password** bank. Kalau bocor, orang lain bisa pakai dan kamu yang bayar (atau kuota gratis kamu habis dipakai orang). **Jangan pernah** share atau commit ke GitHub publik.

---

## 🔷 Bagian A2 — Pilih Layanan AI Gratis

Ada beberapa pilihan AI yang punya **tier gratis**. Saya urutkan dari **paling direkomendasikan untuk pemula**:

### 🥇 Pilihan #1: Google Gemini (PALING MUDAH & GRATIS)

| Item | Detail |
|------|--------|
| **Gratis?** | ✅ Ya, banyak quota gratis tiap menit |
| **Daftar pakai apa?** | Akun Google biasa (Gmail) |
| **Kartu kredit?** | ❌ Tidak perlu! |
| **Quota gratis** | ~15 request/menit, 1500/hari (lebih dari cukup untuk app belajar) |
| **Kualitas jawaban** | Bagus untuk Bahasa Indonesia |
| **Website** | https://aistudio.google.com |

**👉 Saya REKOMENDASIKAN pilihan ini untuk pemula.** Lompat ke **Bagian A3A** untuk panduan setup Gemini.

### 🥈 Pilihan #2: Groq (Cepat Sekali & Gratis)

| Item | Detail |
|------|--------|
| **Gratis?** | ✅ Ya |
| **Daftar pakai apa?** | Email atau GitHub |
| **Kartu kredit?** | ❌ Tidak perlu |
| **Quota gratis** | ~30 request/menit |
| **Kelebihan** | Sangat cepat (~500 token/detik) |
| **Website** | https://console.groq.com |

Lompat ke **Bagian A3B** untuk Groq.

### 🥉 Pilihan #3: OpenRouter (Banyak Model dalam Satu Akun)

| Item | Detail |
|------|--------|
| **Gratis?** | ✅ Ada model-model gratis |
| **Daftar pakai apa?** | Email atau GitHub |
| **Quota gratis** | Bervariasi per model |
| **Kelebihan** | Bisa coba banyak model AI dari 1 API key |
| **Website** | https://openrouter.ai |

Lompat ke **Bagian A3C**.

### 💎 Pilihan #4: Anthropic Claude (Berbayar, Tapi Sesuai Kode Asli)

Aplikasi Numerik ini **awalnya didesain untuk Claude API**. Tapi Claude tidak punya tier gratis — minimal harus top-up $5.

Kalau kamu mau pakai Claude, lompat ke **Bagian A3D**.

---

## 🔷 Bagian A3 — Cara Mendapatkan API Key

> Pilih satu dari 4 sub-bagian di bawah sesuai layanan yang kamu mau.

### 📘 Bagian A3A: Google Gemini (Direkomendasikan)

**Total waktu: ~5 menit**

#### Langkah 1: Buka Google AI Studio

1. Buka browser, kunjungi: **https://aistudio.google.com**
2. Login pakai akun Google kamu (Gmail biasa)
3. Kalau ada pop-up persetujuan terms of service, baca lalu klik **"I agree"**

#### Langkah 2: Buat API Key

1. Setelah masuk, lihat **menu kiri atas** (icon ☰)
2. Klik **"Get API key"** (biasanya ada di sidebar)
3. Klik tombol biru **"Create API key"**
4. Pilih **"Create API key in new project"** (kalau belum ada project)
5. Tunggu beberapa detik...
6. Akan muncul kotak berisi **API key kamu**, formatnya seperti:
   ```
   AIzaSyD1234abcd5678EFGH_someRandomString_xyz
   ```

#### Langkah 3: SIMPAN API Key Kamu

⚠️ **PENTING:** Salin API key tersebut dan simpan di tempat aman (Notes, password manager, dll.). Kamu butuh ini di langkah berikutnya.

#### Langkah 4: Catat Endpoint Gemini

Berbeda dengan Anthropic, Gemini API pakai URL & format yang lain:
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Model:** `gemini-2.0-flash` (cepat & gratis)

> Lompat ke **Bagian A4** untuk masukkan key ini ke aplikasi (ada perubahan kode yang perlu kamu lakukan).

---

### 📗 Bagian A3B: Groq

**Total waktu: ~3 menit**

1. Buka **https://console.groq.com/login**
2. Klik **"Sign in with GitHub"** atau pakai email
3. Verifikasi email (cek inbox)
4. Setelah masuk, klik **"API Keys"** di sidebar
5. Klik tombol **"Create API Key"**
6. Beri nama (misal: "numerik-app")
7. Salin key yang muncul, formatnya: `gsk_...`
8. **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
9. **Model:** `llama-3.3-70b-versatile` (rekomendasi)

---

### 📙 Bagian A3C: OpenRouter

1. Buka **https://openrouter.ai**
2. Klik **"Sign in"** (pakai Google/GitHub/email)
3. Setelah login, klik foto profil di kanan atas → **"Keys"**
4. Klik **"Create Key"**
5. Salin key, formatnya: `sk-or-v1-...`
6. **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
7. **Model gratis:** `meta-llama/llama-3.3-70b-instruct:free`

---

### 📕 Bagian A3D: Anthropic Claude (Sesuai Kode Asli)

⚠️ **Berbayar** — minimal top-up $5.

1. Buka **https://console.anthropic.com**
2. Sign up dengan email
3. Verifikasi nomor HP (wajib)
4. Top-up $5 di **Settings → Billing**
5. Buka **Settings → API Keys**
6. Klik **"Create Key"**
7. Salin key, formatnya: `sk-ant-api03-...`
8. **Endpoint:** sudah benar di kode (`https://api.anthropic.com/v1/messages`)
9. **Model:** `claude-3-5-haiku-20241022` (paling murah)

> Kalau pilih Claude, **kamu tidak perlu mengubah kode apapun selain API_KEY!** Lompat langsung ke **Bagian A5**.

---

## 🔷 Bagian A4 — Memasukkan API Key ke Aplikasi

> ⚠️ **HANYA UNTUK Gemini, Groq, atau OpenRouter.**
> Kalau kamu pilih Claude, lompat ke Bagian A5.

### Cara 1: Cara CEPAT (Tidak Aman, Hanya Untuk Testing)

> ⚠️ **Cuma untuk eksperimen di komputer kamu sendiri.** Jangan pernah di-commit ke GitHub.

Buka file `src/core/ai/aiService.ts`. Cari bagian:

```typescript
const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-3-5-haiku-20241022';
```

#### Untuk **Gemini**, ganti SELURUH file dengan kode di **Bagian A4A** di bawah.
#### Untuk **Groq** atau **OpenRouter**, lihat **Bagian A4B**.

---

### 📘 Bagian A4A: Kode untuk Gemini

Ganti seluruh isi `src/core/ai/aiService.ts` dengan:

```typescript
import axios, { AxiosInstance } from 'axios';

// ▼▼▼ MASUKKAN API KEY GEMINI KAMU DI SINI ▼▼▼
const API_KEY = 'AIzaSy...PASTE_API_KEY_GEMINI_DI_SINI';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

const MODEL = 'gemini-2.0-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export class AiService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: { 'content-type': 'application/json' },
    });
  }

  async ask(params: { question: string; context?: string }): Promise<string> {
    const { question, context } = params;

    if (API_KEY === 'AIzaSy...PASTE_API_KEY_GEMINI_DI_SINI' || !API_KEY) {
      return this.demoResponse(question);
    }

    const systemPrompt = `
Kamu adalah asisten pembelajaran metode numerik untuk mahasiswa Indonesia.
Jawab dengan singkat (max 3 paragraf), jelas, dan menggunakan bahasa Indonesia.
Fokus pada konsep dan intuisi, bukan rumus yang panjang.
${context ? `\nKonteks: User sedang belajar ${context}` : ''}
    `;

    try {
      const response = await this.client.post(`${BASE_URL}?key=${API_KEY}`, {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nPertanyaan: ${question}` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      });

      // Format response Gemini berbeda dari Claude:
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ?? 'Tidak ada jawaban dari AI.';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return `Error: ${error.message ?? 'Gagal menghubungi AI'}`;
      }
      return 'Error: Terjadi kesalahan tidak terduga';
    }
  }

  private demoResponse(question: string): string {
    return `Mode demo aktif (API key belum diisi).\n\nPertanyaan kamu: "${question}"\n\nLihat PANDUAN_AI_DAN_DEPLOY.md untuk cara aktifkan AI.`;
  }
}

export const aiService = new AiService();
```

**Yang berbeda dari versi Claude:**
- URL endpoint pakai `?key=...` (bukan header)
- Format request berbeda (`contents` bukan `messages`)
- Format response berbeda (`candidates[0].content.parts[0].text`)

---

### 📗 Bagian A4B: Kode untuk Groq atau OpenRouter

Groq & OpenRouter pakai format **OpenAI-compatible** (sama persis). Cuma beda URL & model name.

Ganti seluruh isi `src/core/ai/aiService.ts` dengan:

```typescript
import axios, { AxiosInstance } from 'axios';

// ▼▼▼ MASUKKAN API KEY KAMU DI SINI ▼▼▼
const API_KEY = 'PASTE_API_KEY_DI_SINI';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// ▼▼▼ PILIH SALAH SATU SETUP DI BAWAH ▼▼▼

// — UNTUK GROQ:
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// — UNTUK OPENROUTER (uncomment 2 baris bawah, comment 2 baris atas):
// const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
// const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export class AiService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async ask(params: { question: string; context?: string }): Promise<string> {
    const { question, context } = params;

    if (API_KEY === 'PASTE_API_KEY_DI_SINI' || !API_KEY) {
      return this.demoResponse(question);
    }

    const systemPrompt = `
Kamu adalah asisten pembelajaran metode numerik untuk mahasiswa Indonesia.
Jawab dengan singkat (max 3 paragraf), jelas, dan menggunakan bahasa Indonesia.
Fokus pada konsep dan intuisi, bukan rumus yang panjang.
${context ? `\nKonteks: User sedang belajar ${context}` : ''}
    `;

    try {
      const response = await this.client.post('', {
        model: MODEL,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
      });

      return response.data.choices[0].message.content as string;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return `Error: ${error.message ?? 'Gagal menghubungi AI'}`;
      }
      return 'Error: Terjadi kesalahan tidak terduga';
    }
  }

  private demoResponse(question: string): string {
    return `Mode demo aktif (API key belum diisi).\n\nPertanyaan kamu: "${question}"\n\nLihat PANDUAN_AI_DAN_DEPLOY.md.`;
  }
}

export const aiService = new AiService();
```

---

### Cara 2: Cara AMAN (Pakai Environment Variable)

Kalau project kamu mau di-push ke GitHub, kamu **WAJIB** pakai cara ini supaya API key tidak bocor.

#### Langkah 1: Install package `expo-constants`

```bash
npx expo install expo-constants
```

#### Langkah 2: Buat file `.env` di root project

Buat file baru bernama **`.env`** (titik di depan!) di folder root:

```
EXPO_PUBLIC_AI_API_KEY=AIzaSy...isi_key_kamu_di_sini
```

#### Langkah 3: Tambahkan `.env` ke `.gitignore`

Buat atau edit file `.gitignore`, pastikan ada baris:

```
.env
.env.local
```

#### Langkah 4: Pakai env variable di kode

Di `src/core/ai/aiService.ts`, ubah:

```typescript
// SEBELUM:
const API_KEY = 'AIzaSy...';

// SESUDAH:
const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY ?? '';
```

**Restart Expo** setelah ubah `.env`:
```bash
# Hentikan dengan Ctrl+C, lalu:
npm start -- --reset-cache
```

✅ Sekarang API key kamu aman — tidak akan ke-commit ke Git.

---

## 🔷 Bagian A5 — Uji Coba AI Asisten

Setelah API key terpasang:

1. **Restart development server**:
   ```bash
   # Tekan Ctrl+C di terminal Expo, lalu:
   npm start -- --reset-cache
   ```

2. **Buka aplikasi** di Expo Go atau emulator.

3. Tap modul **"AI Asisten"** di Home.

4. Tap salah satu **quick prompt**, contoh: "Apa beda Simpson dan Trapezoidal?"

5. **Tunggu sekitar 2-5 detik...**

6. Kalau berhasil ✅ — AI akan jawab dengan jawaban panjang dan informatif.
7. Kalau masih jawaban demo ❌ — lihat **Troubleshooting** di bawah.

---

## 🔷 Bagian A6 — Troubleshooting (Masalah Umum)

### ❌ Masalah: Masih mode demo padahal sudah masukkan key

**Solusi:**
1. Pastikan kamu **save file** setelah edit (Ctrl+S).
2. Restart Expo dengan `--reset-cache`:
   ```bash
   npm start -- --reset-cache
   ```
3. Pastikan **tidak ada spasi** di awal/akhir API key.
4. Pastikan API key sudah benar (cek di dashboard layanan AI).

### ❌ Masalah: Error "401 Unauthorized"

**Penyebab:** API key salah atau sudah dihapus.

**Solusi:**
- Cek key di dashboard, generate ulang kalau perlu.
- Pastikan kamu copy SELURUH key, tanpa terpotong.

### ❌ Masalah: Error "429 Too Many Requests"

**Penyebab:** Quota gratis kamu sudah habis.

**Solusi:**
- Tunggu 1 menit (quota per-menit reset).
- Atau ganti ke layanan lain (misal dari Gemini ke Groq).

### ❌ Masalah: Error "Network Error" / "timeout"

**Penyebab:** Internet kamu lambat/putus, atau firewall blokir.

**Solusi:**
- Cek koneksi internet.
- Coba ganti ke WiFi lain.
- Beberapa kampus blokir API certain — coba pakai data seluler.

### ❌ Masalah: Response Gemini tampak ngaco / tidak relevan

**Solusi:**
- Coba ganti model ke `gemini-1.5-pro` (lebih pintar tapi quota lebih kecil).
- Edit di `src/core/ai/aiService.ts`:
  ```typescript
  const MODEL = 'gemini-1.5-pro';
  ```

### ❌ Masalah: Aplikasi crash setelah ganti kode

**Solusi:**
- Cek Metro bundler logs di terminal — biasanya ada error message.
- Pastikan tidak ada typo (kurung kurawal, koma, dst.).
- Sebagai fallback, gunakan `git diff` untuk lihat perubahan, atau revert dengan `git checkout src/core/ai/aiService.ts`.

### ❌ Masalah: API key bocor di GitHub

**JANGAN PANIK, lakukan segera:**
1. Buka dashboard layanan AI (Gemini/Groq/dll.)
2. **Hapus/revoke** API key yang bocor
3. **Generate** API key baru
4. Setup ulang pakai `.env` (Cara 2 di atas)
5. Untuk hapus dari history Git, pakai tool seperti `git filter-branch` atau `BFG Repo-Cleaner`

---

# 📖 BAGIAN B — DEPLOY KE VERCEL

## 🔷 Bagian B1 — Setup GitHub dan Vercel

Sekarang kita akan deploy backend AI ke Vercel. Ini membuat AI kamu bisa dipakai banyak user tanpa expose API key di aplikasi mobile.

### Langkah B1.1 — Daftar GitHub (kalau belum punya)

GitHub adalah tempat menyimpan kode online. Kita butuh GitHub karena Vercel akan ambil kode dari sana.

1. Buka browser, kunjungi: **https://github.com/signup**
2. Masukkan email Anda
3. Buat password yang kuat
4. Pilih username — **catat username ini**, akan dipakai nanti
5. Verifikasi captcha
6. GitHub akan kirim kode verifikasi ke email Anda
7. Paste kode verifikasi
8. Pilih plan **Free** (gratis selamanya)

### Langkah B1.2 — Daftar Vercel

1. Buka: **https://vercel.com/signup**
2. Klik **"Continue with GitHub"** ← penting, jangan pakai email
3. Akan muncul pop-up minta izin Vercel akses GitHub Anda → klik **"Authorize Vercel"**
4. Isi nama Anda kalau diminta
5. Pilih **Hobby** (free plan)

> 💡 **Kenapa login pakai GitHub?** Karena nanti deploy = klik tombol di Vercel → ambil kode dari GitHub → otomatis online.

---

## 🔷 Bagian B2 — Deploy Backend

### Langkah B2.1 — Buat Repository Baru di GitHub

1. Buka: **https://github.com/new**
2. Isi form:
   - **Repository name**: `numerik-ai-backend`
   - **Description**: "Backend AI untuk aplikasi Numerik"
   - **Public** atau **Private**? → Pilih **Private**
   - **JANGAN** centang "Add a README file", "Add .gitignore", atau "Choose a license"
3. Klik **"Create repository"**

### Langkah B2.2 — Upload Backend Code

Di halaman repo kosong, klik **"uploading an existing file"**.

Upload file-file berikut ke repository:

**1. package.json:**
```json
{
  "name": "numerik-ai-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node api/chat.js"
  },
  "dependencies": {
    "@google/generativeai": "^0.2.1"
  }
}
```

**2. vercel.json:**
```json
{
  "version": 2,
  "builds": [{ "src": "api/chat.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/api/chat", "dest": "api/chat.js" }]
}
```

**3. .env.example:**
```
GEMINI_API_KEY=your_gemini_api_key_here
```

**4. api/chat.js** (folder harus dibuat manual):
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Kamu adalah asisten pembelajaran metode numerik untuk mahasiswa Indonesia.
Jawab dengan singkat (max 3 paragraf), jelas, dan menggunakan bahasa Indonesia.
Fokus pada konsep dan intuisi, bukan rumus yang panjang.

Pertanyaan: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      error: 'Terjadi kesalahan pada server AI',
      details: error.message
    });
  }
};
```

**5. .gitignore:**
```
node_modules/
.env
```

### Langkah B2.3 — Deploy ke Vercel

1. Buka **https://vercel.com/dashboard**
2. Klik **"Add New..."** → **"Project"**
3. Cari **`numerik-ai-backend`**, klik **"Import"**
4. Scroll ke **"Environment Variables"**
5. Tambahkan:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: paste API key Gemini Anda
6. Klik **"Add"**
7. Klik tombol biru **"Deploy"**
8. Tunggu 30-60 detik...
9. Kalau sukses, catat URL Anda: `https://numerik-ai-backend-xxxx.vercel.app`

---

## 🔷 Bagian B3 — Update Aplikasi Mobile

Sekarang sambungkan aplikasi React Native ke backend Anda.

### Langkah B3.1 — Ganti aiService.ts

Buka `src/core/ai/aiService.ts`, ganti SELURUHNYA dengan:

```typescript
import axios, { AxiosInstance } from 'axios';

// ▼▼▼ GANTI DENGAN URL VERCEL KAMU ▼▼▼
const BACKEND_URL = 'https://numerik-ai-backend-xxxx.vercel.app/api/chat';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

export class AiService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async ask(params: { question: string; context?: string }): Promise<string> {
    const { question, context } = params;

    try {
      const response = await this.client.post('', {
        question,
        context,
      });

      return response.data.answer ?? 'Tidak ada jawaban dari AI.';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return `Error: ${error.message ?? 'Gagal menghubungi server'}`;
      }
      return 'Error: Terjadi kesalahan tidak terduga';
    }
  }
}

export const aiService = new AiService();
```

### Langkah B3.2 — Ganti URL

Ganti `https://numerik-ai-backend-xxxx.vercel.app/api/chat` dengan URL Vercel Anda.

---

## 🔷 Bagian B4 — Test Akhir

### Test Skenario:

**✅ Test 1 — Pertanyaan numerik:**
> "Apa beda Simpson dan Trapezoidal?"

**✅ Test 2 — Sapaan:**
> "Halo!"

**✅ Test 3 — Di luar topik:**
> "Bagaimana cara memasak rendang?"

**Hasil:** AI menolak dengan sopan dan mengarahkan ke topik metode numerik.

---

## ✨ SELAMAT!

Sekarang aplikasi Anda:
- ✅ Punya AI Asisten yang berfungsi
- ✅ API key tersembunyi aman di Vercel
- ✅ Otomatis menolak pertanyaan di luar topik
- ✅ Punya rate limiting (anti-spam)
- ✅ Siap dipakai banyak user
- ✅ Bisa di-publish ke Play Store tanpa risiko API key bocor

---

## 🎯 Ringkasan: Pilih Jalan Termudah Kamu

```
👤 Kamu mahasiswa, mau coba app & gratis selamanya?
   → Pilih GEMINI (Bagian A3A & A4A)

🚀 Mau jawaban super cepat, gratis?
   → Pilih GROQ (Bagian A3B & A4B)

🎨 Mau coba banyak model AI dari 1 akun?
   → Pilih OPENROUTER (Bagian A3C & A4B)

💼 Mau pakai Claude (sesuai kode asli), oke top-up $5?
   → Pilih ANTHROPIC (Bagian A3D, tidak perlu ubah kode!)

🚀 Mau deploy ke Vercel untuk production?
   → Ikuti Bagian B lengkap
```

---

## 💰 Apakah Ini Akan Tetap Gratis?

**Ya, untuk skala personal/skripsi/aplikasi belajar.**

**Limit gratis Vercel:**
- 100 GB bandwidth/bulan
- 100.000 function invocation/bulan
- Cukup untuk **ratusan aktif user**

**Limit gratis Gemini:**
- 1.500 request/hari
- 15 request/menit

---

> Dokumen ini terakhir diperbarui: Mei 2026.
> Layanan AI dan harganya bisa berubah. Selalu cek website resmi mereka untuk informasi terbaru.