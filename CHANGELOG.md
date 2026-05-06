# CHANGELOG

Semua perubahan signifikan proyek Numerik didokumentasikan di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [2026.1] Mei 2026

### 🎯 Highlights

- **Brand Logo Update** — Icon menggunakan `assets/icon.png` di BrandLogo component (bukan SVG lagi)
- **Node 22 Support** — Project sudah fully compatible dengan Node 22 LTS
- **Performance Optimizations** — Multiple dependency updates untuk stability

### ✨ Added

- `.nvmrc` untuk auto-switch ke Node 22
- `.npmrc` dengan konfigurasi untuk legacy peer deps dan retry settings
- Dokumentasi `CHANGELOG_NODE22.md` untuk tracking perubahan Node 22

### 🐛 Fixed

- **Tombol bangun datar** tidak lagi menampilkan teks vertikal char-by-char
- **Polinomial Lagrange & evaluasi** tidak lagi terpotong (pakai `\begin{aligned}` multi-baris)
- **MathView** mendukung horizontal scroll untuk formula panjang
- Aturan Trapesium & Simpson preview tidak overflow

### 🔄 Changed

- **BrandLogo Component** — Dari SVG vector ke Image component dengan `assets/icon.png`
- **react-native-screens** — `3.31.0` → `~3.31.1` (fix postinstall bug)
- **react-native** — `0.74.0` → `0.74.5`
- **react-native-safe-area-context** — `4.10.0` → `4.10.5`
- **react-native-gesture-handler** — `~2.16.0` → `~2.16.2`
- **react-native-reanimated** — `~3.10.0` → `~3.10.1`
- **@react-navigation/native** — `^6.1.0` → `^6.1.18`
- **@react-navigation/native-stack** — `^6.10.0` → `^6.11.0`
- **@expo/vector-icons** — `^14.0.0` → `^14.0.4`
- **axios** — `^1.7.0` → `^1.7.7`
- **mathjs** — `^13.0.0` → `^13.2.0`
- **zustand** — `^4.5.0` → `^4.5.5`
- **@babel/core** — `^7.24.0` → `^7.25.0`
- **@types/react** — `~18.2.0` → `~18.2.79`
- **typescript** — `~5.3.0` → `~5.3.3`
- **@types/jest** — `^29.5.0` → `^29.5.12`
- **jest-expo** — `~51.0.0` → `~51.0.4`

### 📚 Documentation

- `PANDUAN_AI_DAN_DEPLOY.md` — Gabungan panduan AI + Deploy Vercel
- `STRUKTUR_APLIKASI.md` — Update dokumentasi lengkap

### 🛡️ Security

- Tambahan `overrides` field untuk force `react-native-screens` ke versi yang aman

---

## [3.0.0] — April 2026

### 🎯 Highlights

- **Full redesign** dengan tema navy profesional (#1E2A9E)
- **Math rendering** dengan KaTeX via WebView
- **Custom math keyboard** dengan 3 tab (Basic, Function, Calculus)
- **AI Assistant module** untuk belajar interaktif
- **Step-by-step calculation cards** dengan KaTeX

### ✨ Added

#### Screens (9 screens total)
- `HomeScreen` — Dashboard dengan KPI, modul grid, daily tips
- `IntegralScreen` — Trapezoidal, Simpson, Romberg calculators
- `InterpolationScreen` — Lagrange & Newton DD calculators
- `GeometryScreen` — 6 bangun datar calculators
- `AiHelperScreen` — AI chatbot interface
- `HistoryScreen` — Calculation history
- `SettingsScreen` — App info & preferences
- `MateriListScreen` — 20 learning materials
- `MateriDetailScreen` — Material detail view

#### Components
| Komponen | Fungsi |
|---|---|
| `HeroHeader` | Navy curved header dengan animasi |
| `ModuleCard` | Pastel module cards |
| `ResultHero` | Large result panel |
| `StepCard` | Calculation step explanations |
| `MathView` | KaTeX renderer (WebView) |
| `MathKeyboard` | Custom 3-tab keyboard |
| `IntegralChart` | Interactive integral visualization |
| `InterpolationChart` | Interpolation curve plot |
| `BrandLogo` | SVG logo numerik |
| `AnimatedPressable` | Spring on press |

#### Features
- Daily tips carousel (auto-rotate 90 detik)
- 21 tips harian tentang Integral, Interpolasi, Geometri
- Progress tracking per material
- 20 materi pembelajaran lengkap
- Calculation history with timestamps
- LaTeX preview real-time
- Gradient fill charts
- Animated pressable buttons

---

## [2.0.0] — Maret 2026

### 🎯 Highlights

- **expo-router integration** — File-based routing
- **TypeScript** — Full type safety
- **Zustand stores** — Better state management
- **Animated UI** — react-native-reanimated

### ✨ Added

- `app/` folder dengan expo-router routes
- `src/core/` dengan numerical algorithms
- `src/components/` dengan reusable UI
- Zustand stores: `integralStore`, `progressStorage`, `historyStorage`

### 🔄 Changed

- Vanilla JS → TypeScript
- Manual navigation → expo-router

---

## [1.0.0] — Februari 2026

### 🎯 Highlights

- Initial release
- Basic integral calculator (Trapezoidal, Simpson)
- AI Helper dengan mode demo
- History dengan AsyncStorage

### ✨ Added

- Basic integral screen
- Simple result display
- Math input field

---

## Template

```markdown
## [Version] — Date

### 🎯 Highlights
- Short summary of major changes

### ✨ Added
- New features

### 🐛 Fixed
- Bug fixes

### 🔄 Changed
- Changes in existing functionality

### 🛡️ Security
- Security improvements
```

---

> Untuk detail perubahan terkait migrasi Node 22, lihat [CHANGELOG_NODE22.md](CHANGELOG_NODE22.md).
> Last updated: Mei 2026