# Numerik AI Backend

Backend proxy untuk AI Asisten di aplikasi Numerik Mobile. Menyembunyikan API key Gemini dari aplikasi mobile dan memfilter pertanyaan agar hanya seputar topik metode numerik.

## Endpoint

`POST /api/chat`

### Request Body

```json
{
  "question": "Apa itu metode Simpson?",
  "context": "integral"
}
```

### Response Sukses

```json
{
  "answer": "Metode Simpson adalah..."
}
```

### Response Error

```json
{
  "error": "Pesan error..."
}
```

## Setup Lokal

1. Clone repo ini
2. Copy `.env.example` jadi `.env`, isi dengan API key Gemini Anda
3. Install Vercel CLI: `npm i -g vercel`
4. Run: `vercel dev`
5. Endpoint tersedia di `http://localhost:3000/api/chat`

## Deploy ke Vercel

Lihat panduan lengkap di file `PANDUAN_DEPLOY_VERCEL.md` di project mobile.

Singkatnya:
1. Push project ini ke GitHub
2. Import ke Vercel
3. Set environment variable `GEMINI_API_KEY`
4. Deploy

## Konfigurasi

Edit `api/chat.js`:
- `TOPIK_NUMERIK_KEYWORDS` — daftar keyword topik yang diizinkan
- `KONTEKS_MATERI` — list materi yang ada di aplikasi
- `SYSTEM_PROMPT` — aturan untuk AI
- `RATE_LIMIT` — batas request per menit per IP (default 20)

## Lisensi

MIT
