# Numerik v3.1

<img src="assets/icon.png" alt="Numerik App" width="100" />

**Aplikasi pembelajaran metode numerik interaktif** — Hitung integral, interpolasi, dan geometri dengan langkah-langkah yang jelas, plus AI asisten untuk bantu belajar.

[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-51.0.0-black?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?logo=typescript)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node-22.x-green?logo=node)](https://nodejs.org)

---

## ✨ Fitur Utama

### 📐 Modul Perhitungan
| Modul | Metode |
|-------|--------|
| **Integral Numerik** | Trapezoidal, Simpson 1/3, Romberg |
| **Interpolasi** | Lagrange, Newton Divided Difference |
| **Bangun Datar** | Persegi, Persegi Panjang, Segitiga, Lingkaran, Trapesium, Jajar Genjang |

### 🎨 Tampilan Modern
- **Tema navy profesional** dengan aksen kuning & cyan
- **Hero header melengkung** dengan dekorasi animasi
- **Dashboard-style home** dengan KPI cards dan grid modul pastel
- **Animasi halus** everywhere — spring, fade-in, floating shapes

### 🔢 Matematika Sungguhan
- **Notasi matematika** via KaTeX (seperti di buku!)
- **Custom math keyboard** dengan 3 tab (angka, fungsi, template)
- **Live LaTeX preview** — ketik fungsi, langsung lihat formulanya
- **Chart interaktif** dengan gradient fill dan grid

### 🤖 AI Asisten
- Chatbot untuk tanya konsep metode numerik
- Mode demo (tanpa API key) untuk testing
- Support Gemini, Groq, OpenRouter, atau Claude
- Bisa di-deploy ke Vercel untuk production

### 📚 Materi Pembelajaran
- 20 materi lengkap (Integral 7, Interpolasi 6, Geometri 7)
- Progress tracking — tahu materi mana yang sudah dibaca
- Daily tips yang berganti setiap 90 detik

---

## 🚀 Cara Setup

### Prasyarat
- **Node.js 20–24** (direkomendasikan: Node 22)
- **npm** atau **yarn**
- **Expo CLI** (otomatis via npx)
- Untuk testing: **Expo Go** app (iOS/Android)

### Install & Jalankan

```bash
# 1. Clone repository
git clone https://github.com/Syamsul336/numerik-mobile.git
cd numerik-mobile

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

### Konfigurasi Node Version (Opsional)

Project ini sudah disetup untuk Node 22. Kalau pakai nvm:

```bash
nvm use 22
node --version  # harus v22.x.x
```

### Build APK

```bash
# Android (butuh EAS CLI setup)
npx eas build --platform android --local

# Atau pakai Expo Go untuk development
npm start
# Scan QR code dengan Expo Go app
```

---

## 📂 Struktur Project

```
numerik_rn_v2/
├── app/                    # expo-router routes (file-based routing)
│   ├── _layout.tsx        # Root layout dengan Stack navigator
│   ├── index.tsx          # → HomeScreen
│   ├── integral.tsx       # → IntegralScreen
│   ├── interpolation.tsx  # → InterpolationScreen
│   ├── geometry.tsx       # → GeometryScreen
│   ├── ai-helper.tsx      # → AiHelperScreen
│   ├── history.tsx        # → HistoryScreen
│   ├── settings.tsx       # → SettingsScreen
│   ├── materi.tsx         # → MateriListScreen
│   └── materi/[id].tsx    # → MateriDetailScreen
│
├── src/
│   ├── theme/            # Colors, spacing, typography, shadows
│   ├── components/
│   │   ├── math/         # MathView, MathKeyboard, exprToLatex
│   │   ├── cards/        # ModuleCard, ResultHero, StepCard
│   │   ├── charts/       # IntegralChart, InterpolationChart
│   │   └── ui/           # HeroHeader, BrandLogo, AnimatedPressable
│   ├── core/
│   │   ├── numerical/    # Algoritma: Trapezoidal, Simpson, Romberg, Lagrange, Newton, Geometry
│   │   ├── parser/       # mathjs wrapper
│   │   ├── storage/      # Zustand stores + AsyncStorage
│   │   └── ai/           # AI service (Gemini/Groq/Claude)
│   ├── screens/          # 9 screens lengkap
│   ├── data/             # Static data: tips, materi
│   └── hooks/            # useDailyTips
│
├── assets/               # Icons, splash, favicon
├── __tests__/           # Unit tests (Jest)
│
├── STRUKTUR_APLIKASI.md  # Dokumentasi lengkap
├── PANDUAN_AI_DAN_DEPLOY.md # Setup AI + Deploy ke Vercel
└── CHANGELOG.md          # Riwayat perubahan
```

---

## 🧪 Testing

```bash
npm test
```

Unit tests untuk algoritma numerik:
- Trapezoidal: x², x
- Simpson: x³, reject n ganjil
- Romberg: sin(x) dari 0 ke π
- Lagrange & Newton: pass through points
- Geometry: square, circle, triangle

---

## 🎨 Custom Math Keyboard

Tap field "f(x) =" di IntegralScreen untuk membuka keyboard kustom.

| Tab | Isi |
|-----|-----|
| **123** | Angka, operator, simbol (π, e, √, ^) |
| **f(x)** | sin, cos, tan, log, ln, exp, asin, acos, atan, hyperbolic |
| **Lanjut** | Template: x², 1/x, sin²x, dst. |

Fitur:
- Caret navigation (← →)
- Smart backspace (hapus `sin(` sekaligus)
- AC untuk clear all
- Live preview dengan kursor

---

## 🤖 Setup AI Asisten

Lihat [PANDUAN_AI_DAN_DEPLOY.md](PANDUAN_AI_DAN_DEPLOY.md) untuk panduan lengkap.

### Pilihan AI:

| Provider | Gratis? | Setup |
|----------|---------|-------|
| **Google Gemini** | ✅ ~15 req/menit | Paling mudah |
| **Groq** | ✅ ~30 req/menit | Paling cepat |
| **OpenRouter** | ✅ (model varies) | Banyak pilihan |
| **Anthropic Claude** | ❌ ($5 min) | Sesuai kode asli |

### Quick Setup (Gemini):

1. Buka **https://aistudio.google.com/apikey**
2. Buat API key baru
3. Edit `src/core/ai/aiService.ts`, masukkan API key
4. Restart Expo: `npm start -- --reset-cache`

### Deploy ke Vercel (Production):

Lihat [PANDUAN_AI_DAN_DEPLOY.md](PANDUAN_AI_DAN_DEPLOY.md) Bagian B untuk panduan lengkap deploy backend ke Vercel.

---

## 📊 Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **React Native 0.74.5** | Cross-platform mobile framework |
| **Expo SDK 51** | Development framework & tooling |
| **expo-router** | File-based routing |
| **TypeScript 5.3** | Type-safe JavaScript |
| **KaTeX (via WebView)** | Math rendering |
| **mathjs** | Expression parser & evaluator |
| **zustand** | State management |
| **AsyncStorage** | Local data persistence |
| **react-native-reanimated** | 60fps animations |
| **react-native-svg** | Vector graphics |
| **date-fns** | Date formatting |

---

## 📝 Dokumentasi

| File | Deskripsi |
|------|-----------|
| [STRUKTUR_APLIKASI.md](STRUKTUR_APLIKASI.md) | Penjelasan lengkap setiap folder & file |
| [PANDUAN_AI_DAN_DEPLOY.md](PANDUAN_AI_DAN_DEPLOY.md) | Setup AI + Deploy ke Vercel |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Quick setup guide |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat perubahan versi |
| [CHANGELOG_NODE22.md](CHANGELOG_NODE22.md) | Catatan migrasi ke Node 22 |

---

## 👨‍💻 Author

**Syamsul Arifin**
- GitHub: [@Syamsul336](https://github.com/Syamsul336)
- Project: [numerik-mobile](https://github.com/Syamsul336/numerik-mobile)

---

## 📄 Lisensi

MIT — Bebas dipakai dan dimodifikasi untuk pembelajaran.

---

## 🙏 Credits

- **Google** — Gemini AI API
- **Khan Academy** — KaTeX rendering
- **Expo** — Development framework
- **mathjs** — Expression parser

---

> Dibuat dengan ❤️ untuk mahasiswa Indonesia yang ingin belajar metode numerik.
>
> Last updated: Mei 2026