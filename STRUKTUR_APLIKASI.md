# 📁 Struktur Aplikasi Numerik v3.1 — Panduan Lengkap untuk Pemula

> Dokumen ini menjelaskan **setiap folder dan file** dalam aplikasi Numerik dengan bahasa yang ramah pemula. Dibaca dari atas ke bawah, kamu akan paham apa fungsi tiap bagian dari aplikasi ini.

---

## 🧠 Mengenal Aplikasi Ini Dulu

**Numerik** adalah aplikasi mobile (Android & iOS) untuk belajar **metode numerik** — cabang matematika yang mengajarkan cara menghitung soal-soal sulit dengan pendekatan komputer. Aplikasi ini punya 4 modul utama:

1. **Integral Numerik** — menghitung luas di bawah kurva (Trapezoidal, Simpson, Romberg)
2. **Interpolasi** — menebak nilai di antara titik-titik data (Lagrange, Newton)
3. **Bangun Datar** — luas dan keliling persegi, lingkaran, dll.
4. **AI Asisten** — chatbot yang bisa menjawab pertanyaan tentang metode numerik

Plus fitur tambahan: Materi Pembelajaran, Riwayat, dan Pengaturan.

---

## 🔧 Teknologi yang Dipakai

Sebelum masuk ke struktur folder, kamu perlu kenal teknologi-teknologi ini secara singkat:

| Teknologi | Apa fungsinya? |
|-----------|---------------|
| **React Native** | Library untuk membuat aplikasi mobile pakai JavaScript. Kode 1x → jalan di Android & iOS. |
| **Expo** | Framework di atas React Native yang mempermudah development (tinggal scan QR untuk testing). |
| **TypeScript** | JavaScript dengan "tipe data". Membuat kode lebih aman dan mudah dibaca. File .ts/.tsx |
| **expo-router** | Sistem navigasi otomatis berdasarkan struktur folder. |
| **KaTeX** | Library untuk menampilkan rumus matematika seperti di buku (∫ x² dx). |
| **mathjs** | Library untuk parsing & menghitung ekspresi matematika ("sin(x)+x^2"). |
| **zustand** | Library untuk menyimpan state global (data yang dipakai di banyak layar). |
| **AsyncStorage** | Tempat menyimpan data permanen di HP (mirip localStorage di browser). |
| **react-native-reanimated** | Library animasi mulus 60fps. |
| **react-native-svg** | Untuk menggambar bentuk geometri (lingkaran, garis, path). |
| **date-fns** | Library untuk formatting tanggal dan waktu. |

---

## 📂 Struktur Folder Lengkap

```
numerik_rn_v2/
│
├── 📄 README.md                  ← Ringkasan project (apa & kenapa)
├── 📄 CHANGELOG.md               ← Catatan apa yang berubah tiap versi
├── 📄 SETUP_GUIDE.md             ← Panduan setup singkat
├── 📄 STRUKTUR_APLIKASI.md       ← (File ini sendiri!)
├── 📄 PANDUAN_AI_DAN_DEPLOY.md  ← Gabungan: Setup AI + Deploy ke Vercel
├── 📄 CHANGELOG_NODE22.md        ← Catatan migrasi ke Node 22
│
├── 📄 package.json               ← Daftar library yang dipakai project
├── 📄 app.json                   ← Konfigurasi Expo (nama app, icon, dst.)
├── 📄 babel.config.js            ← Konfigurasi Babel (penerjemah kode)
├── 📄 tsconfig.json              ← Konfigurasi TypeScript
├── 📄 .nvmrc                     ← Versi Node yang direkomendasikan
├── 📄 .npmrc                     ← Konfigurasi npm tambahan
├── 📄 .gitignore                 ← File yang tidak di-commit ke Git
│
├── 📁 app/                       ← Sistem ROUTING (file = halaman)
├── 📁 src/                       ← Kode UTAMA aplikasi
│   ├── 📁 theme/                 ← Warna, ukuran, font
│   ├── 📁 components/            ← Komponen UI yang dipakai berulang
│   │   ├── 📁 math/              ← Komponen rumus matematika
│   │   ├── 📁 cards/             ← Kartu-kartu (module, hasil, langkah)
│   │   ├── 📁 charts/            ← Grafik
│   │   └── 📁 ui/                ← Komponen umum (header, logo, button)
│   ├── 📁 core/                  ← LOGIKA BISNIS (algoritma, storage, AI)
│   │   ├── 📁 numerical/         ← Algoritma matematika
│   │   ├── 📁 parser/            ← Parser ekspresi matematika
│   │   ├── 📁 storage/           ← Penyimpanan data
│   │   └── 📁 ai/                ← Layanan AI
│   ├── 📁 screens/               ← Layar/halaman aplikasi
│   ├── 📁 data/                  ← Data statis (tips, materi)
│   └── 📁 hooks/                 ← React hooks kustom
│
├── 📁 assets/                    ← Gambar, icon, splash screen
│   ├── icon.png                  ← Icon utama (1024x1024)
│   ├── adaptive-icon.png         ← Icon Android adaptive
│   ├── splash.png                ← Splash screen
│   ├── favicon.png               ← Favicon web
│   └── Icon_numerik.png          ← Varian icon (untuk branding)
│
└── 📁 __tests__/                 ← Unit tests
```

---

## 📄 File-File di ROOT Project

### `package.json`
**Apa fungsinya?** Daftar resmi semua library yang dipakai aplikasi, plus script siap-pakai (`npm start`, `npm test`, dll.). Setiap kali kamu jalankan `npm install`, npm akan baca file ini lalu download semua library yang tertulis di sini.

**Bagian penting:**
- `dependencies` — library yang dipakai di production (saat aplikasi jalan)
- `devDependencies` — library yang hanya dipakai saat development (TypeScript, Jest)
- `scripts` — perintah singkat: `npm start` → `expo start`, dst.
- `engines` — wajibin Node 20-24 (direkomendasikan Node 22)

### `app.json`
**Apa fungsinya?** Konfigurasi metadata Expo. Berisi nama aplikasi, version, icon, splash screen, bundle identifier (untuk App Store/Play Store), dan platform-specific settings.

### `babel.config.js`
**Apa fungsinya?** Konfigurasi Babel — "penerjemah" yang mengubah TypeScript/JSX modern menjadi JavaScript yang bisa dijalankan di mesin Android/iOS.

### `tsconfig.json`
**Apa fungsinya?** Konfigurasi TypeScript: seberapa ketat aturan tipe data, alias import (`@/*` → `./src/*`), dan setting kompilasi.

### `.nvmrc`
**Apa fungsinya?** File satu baris berisi versi Node yang direkomendasikan. Pakai `nvm use` di terminal untuk otomatis switch ke versi yang tepat.

### `.npmrc`
**Apa fungsinya?** Konfigurasi npm tambahan: legacy-peer-deps (untuk library lawas), engine-strict, dan retry settings untuk koneksi lambat.

### `README.md`
**Apa fungsinya?** Dokumen utama project. Pertama kali orang lihat saat buka repo. Berisi: ringkasan, fitur baru, cara setup, struktur singkat.

### `CHANGELOG.md`
**Apa fungsinya?** Catatan perubahan tiap versi (v3.0, v3.1). Pakai format ini supaya tim tahu "fitur ini ditambah kapan, bug itu di-fix kapan".

### `PANDUAN_AI_DAN_DEPLOY.md`
**Apa fungsinya?** Gabungan panduan untuk:
1. Setup AI Asisten (Gemini, Groq, OpenRouter, atau Claude)
2. Deploy backend AI ke Vercel (untuk production)

---

## 📁 Folder `app/` — Sistem Routing

Folder ini istimewa karena **expo-router** otomatis mengubah setiap file `.tsx` di sini menjadi sebuah halaman/route di aplikasi.

### `app/_layout.tsx`
**File spesial.** Yang diawali underscore (`_`) adalah "layout" — kerangka utama yang membungkus semua halaman lain. Berisi:
- StatusBar (warna jam/baterai di atas layar)
- SafeAreaProvider (menghindari notch HP modern)
- Stack Navigator (sistem tumpukan halaman)
- Daftar semua route

### `app/index.tsx` → Path `/`
Halaman pertama yang muncul saat aplikasi dibuka. **HomeScreen** dengan dashboard, modul-modul, daily tips, dan KPI progress belajar.

### `app/integral.tsx` → Path `/integral`
Halaman modul Integral Numerik. User pilih metode (Trapezoidal/Simpson/Romberg), masukkan fungsi & batas, lihat hasil + grafik + langkah-langkah.

### `app/interpolation.tsx` → Path `/interpolation`
Halaman modul Interpolasi. User input titik-titik (x,y), pilih metode (Lagrange/Newton), lihat polinomial yang melewati titik-titik tersebut.

### `app/geometry.tsx` → Path `/geometry`
Halaman modul Bangun Datar. Pilih bentuk (persegi, lingkaran, dll.), masukkan ukuran, lihat luas & keliling.

### `app/ai-helper.tsx` → Path `/ai-helper`
Halaman AI Asisten. Chatbot ala WhatsApp dengan bubble pesan, quick prompts, dan input text.

### `app/history.tsx` → Path `/history`
Halaman Riwayat. Daftar semua perhitungan yang pernah dilakukan, dengan tombol hapus.

### `app/settings.tsx` → Path `/settings`
Halaman Pengaturan: info app, link ke documentation, tombol reset data, dll.

### `app/materi.tsx` → Path `/materi`
Halaman daftar Materi Pembelajaran. 20 lessons dibagi 3 modul (Integral 7, Interpolasi 6, Geometri 7).

### `app/materi/[id].tsx` → Path `/materi/{id-tertentu}`
**Route DINAMIS.** `[id]` artinya: parameter dari URL akan masuk ke variabel `id`. Contoh: `/materi/i-pengantar` → tampilkan materi dengan id `i-pengantar`.

> **Catatan:** Semua file di folder `app/` ini cuma satu baris (re-export dari `src/screens/`). Tujuannya: pisahkan routing (di `app/`) dari kode UI sebenarnya (di `src/screens/`).

---

## 📁 Folder `src/theme/`

### `src/theme/index.ts`
**Pusat semua warna, ukuran, font, shadow** aplikasi. Daripada hardcode `color: '#1E2A9E'` di banyak tempat, kita pakai `colors.primary` dari sini.

**Yang dieksport:**
- `Colors` — palette lengkap untuk light mode (dark mode tidak dipakai)
- `useTheme()` — hook untuk ambil warna
- `Spacing` — jarak: `xs` (4px), `sm` (8px), `md` (12px), dst.
- `Radius` — corner radius: `xs` (6px) sampai `pill` (999px)
- `Typography` — preset font: `display`, `h1`, `h2`, `body`, dst.
- `Shadow` — bayangan: `sm`, `md`, `lg`

**Manfaat:** kalau kamu mau ganti warna utama dari navy ke hijau, cukup edit 1 file ini, dan SELURUH aplikasi otomatis berubah.

---

## 📁 Folder `src/components/` — Komponen UI Reusable

Komponen di sini dipakai **berulang** di banyak layar. Filosofi: kalau suatu UI muncul di 2+ tempat → bikin komponen.

### Subfolder `math/` — Komponen Matematika

#### `src/components/math/MathView.tsx`
**Tampilkan rumus matematika** secara visual (∫ x²dx) bukan sebagai teks biasa. Caranya: buka WebView mini di dalam app, render rumus pakai library KaTeX. Hasilnya: rumus terlihat seperti di buku.

#### `src/components/math/MathKeyboard.tsx`
**Keyboard kustom matematika.** Muncul saat user tap field "f(x) =". 3 tab:
- **123** — angka, operator, simbol (π, e, √)
- **f(x)** — fungsi (sin, cos, log, ln, exp, dst.)
- **Lanjut** — template kalkulus (x², 1/x, sin²x, dst.)

Plus fitur caret navigation, smart backspace, AC.

#### `src/components/math/exprToLatex.ts`
**Konverter** dari format sederhana (`x^2 + sin(x)`) ke format LaTeX (`x^{2} + \\sin(x)`). Plus fungsi `formatNum()` untuk format angka rapi.

### Subfolder `cards/` — Kartu-Kartu Dashboard

#### `src/components/cards/ModuleCard.tsx`
**Kartu modul** dengan warna pastel. Persegi, dengan icon di atas dan judul di bawah. Dipakai di Home untuk 4 modul utama.

#### `src/components/cards/ResultHero.tsx`
**Panel hasil besar** dengan gradient navy. Menampilkan: tag metode, problem statement (rumus integral), label "Nilai Integral", dan angka hasil yang BESAR. Dipakai di IntegralScreen, InterpolationScreen, GeometryScreen.

#### `src/components/cards/StepCard.tsx`
**Kartu satu langkah** perhitungan. Berisi: badge nomor, judul, deskripsi singkat, rumus KaTeX (opsional), dan list nilai (opsional). Dipakai untuk menampilkan setiap langkah secara terpisah.

### Subfolder `charts/` — Grafik

#### `src/components/charts/IntegralChart.tsx`
**Grafik integral.** Plot kurva f(x) dengan:
- Kurva utama (warna primary)
- Trapesium kuning sebagai partisi
- Gradient fill di bawah kurva
- Grid dashed
- Marker untuk batas a, b
- Legend di pojok kanan

#### `src/components/charts/InterpolationChart.tsx`
**Grafik interpolasi.** Plot:
- Titik-titik input (lingkaran biru)
- Kurva polinomial (smooth)
- Garis vertikal kuning di x_eval (titik yang dievaluasi)

### Subfolder `ui/` — Komponen Umum

#### `src/components/ui/AnimatedPressable.tsx`
**Pembungkus tombol** yang otomatis animasi mengecil saat ditekan (efek pegas). Dipakai di mana-mana untuk feedback tactile.

#### `src/components/ui/BrandLogo.tsx`
**Logo aplikasi Numerik** menggunakan image dari `assets/icon.png`. Bisa diatur ukuran, rounded, atau bare (tanpa background).

#### `src/components/ui/HeroHeader.tsx`
**Header navy melengkung** di atas tiap halaman. Berisi:
- Tombol back (kalau ada)
- Eyebrow (label kecil di atas)
- Title (judul besar)
- Subtitle (deskripsi)
- Decorative shapes (bola kuning + cyan yang melayang)
- Curve di bawah header

#### `src/components/ui/SectionHeader.tsx`
**Judul section** sederhana dengan title + caption + tombol aksi opsional ("Lihat semua").

---

## 📁 Folder `src/core/` — Logika Bisnis

Semua **logika kalkulasi & data** ada di sini. Dipisah dari komponen UI supaya:
- Mudah di-test (tidak butuh render UI untuk test algoritma)
- Bisa dipakai ulang di banyak komponen
- Lebih jelas struktur kodenya

### Subfolder `numerical/` — Algoritma Matematika

#### `src/core/numerical/integration/`
Berisi 4 file:
- **`types.ts`** — definisi TypeScript: `IntegrationResult`, `IntegrationStep`, `ExplanationBlock`, `IntegralMethod`
- **`trapezoidal.ts`** — algoritma Trapezoidal (aproksimasi pakai trapesium)
- **`simpson.ts`** — algoritma Simpson 1/3 (aproksimasi pakai parabola; n harus genap)
- **`romberg.ts`** — algoritma Romberg (ekstrapolasi Richardson)
- **`index.ts`** — pintu masuk: re-export semua + fungsi `calculateIntegral()` yang otomatis pilih metode

#### `src/core/numerical/interpolation/index.ts`
Algoritma:
- **`calculateLagrange()`** — interpolasi polinomial Lagrange
- **`calculateNewtonDivided()`** — Newton's Divided Difference
- **`generateLagrangeCurve()`** — generate banyak titik untuk plot kurva interpolasi

#### `src/core/numerical/geometry/index.ts`
Object `Geometry` dengan method untuk tiap bentuk:
- `Geometry.square(side)` → luas & keliling persegi
- `Geometry.rectangle(panjang, lebar)`
- `Geometry.triangle(alas, tinggi)`
- `Geometry.circle(radius)`
- `Geometry.trapezoid(a, b, tinggi)`
- `Geometry.parallelogram(alas, tinggi)`

### Subfolder `parser/`

#### `src/core/parser/functionParser.ts`
**Parser ekspresi matematika** — class wrapper di atas mathjs. Method utama:
- `new FunctionParser("x^2 + sin(x)")` — siapkan parser
- `.evaluate(2)` — hitung nilai pada x=2
- `FunctionParser.isValid("x+1")` — cek apakah valid

### Subfolder `storage/` — Penyimpanan Data

#### `src/core/storage/historyStorage.ts`
**Manajer riwayat perhitungan.** Pakai AsyncStorage. Method:
- `getAll()` — ambil semua riwayat
- `add(...)` — tambah entry baru (auto-limit 100 terbaru)
- `remove(id)` — hapus 1 entry
- `clearAll()` — hapus semua

#### `src/core/storage/integralStore.ts`
**State global integral** pakai Zustand. Menyimpan: function, a, b, n, method, hasil, error. Method `calculate()` otomatis hitung + simpan ke history.

#### `src/core/storage/progressStorage.ts`
**Tracker materi yang sudah dibaca.** Method:
- `getReadIds()` — Set berisi id materi yang sudah dibaca
- `markRead(id)` — tandai sudah dibaca
- `toggleRead(id)` — toggle status
- `clearAll()` — reset

### Subfolder `ai/`

#### `src/core/ai/aiService.ts`
**Service AI Asisten.** Fungsi `ask({ question })` mengirim request ke server AI dan kembalikan jawaban. Punya mode demo otomatis kalau API key belum diisi.

> **PENTING:** Lihat `PANDUAN_AI_DAN_DEPLOY.md` untuk cara setup API key dan deploy backend.

---

## 📁 Folder `src/screens/` — Layar/Halaman

Setiap file = satu layar utuh. Dipisah dari `app/` (yang cuma routing) supaya kode UI lebih terorganisasi.

### `src/screens/HomeScreen.tsx`
**Layar utama.** Berisi:
- Hero header "Hi, Numerik 👋" dengan BrandLogo
- KPI strip (progress materi 1/3 + tombol Mulai Belajar 2/3)
- Grid 4 modul utama (Integral, Interpolasi, Geometri, AI)
- Daily tips card (rotasi tiap 90 detik)
- Quick links (Riwayat, Pengaturan)

### `src/screens/IntegralScreen.tsx`
**Layar Integral.** Komponen:
- Hero header "Integral Numerik"
- Input fungsi f(x) — buka MathKeyboard saat di-tap
- Live preview LaTeX
- Pilihan metode (3 chip)
- Slider untuk a, b, n
- Tombol "Hitung"
- Hasil (ResultHero) + grafik (IntegralChart) + steps (StepCard)

### `src/screens/InterpolationScreen.tsx`
**Layar Interpolasi.** Komponen:
- Input titik-titik (x, y) — bisa tambah/hapus
- Input x_eval
- Pilih metode (Lagrange/Newton)
- Hasil + chart + langkah-langkah
- Auto-save ke history dengan debounce 1.2s

### `src/screens/GeometryScreen.tsx`
**Layar Bangun Datar.** Komponen:
- Pilihan bentuk (6 chip dengan icon)
- Input dimensi (otomatis sesuai bentuk yang dipilih)
- Preview bentuk (SVG dengan gradient)
- Hasil luas + keliling + steps

### `src/screens/AiHelperScreen.tsx`
**Layar AI Asisten.** Chat interface:
- Bubble chat (user di kanan navy, AI di kiri putih)
- Quick prompts (4 pertanyaan siap pakai) — muncul kalau belum ada chat
- Input text + tombol send
- Loading indicator saat menunggu response

### `src/screens/HistoryScreen.tsx`
**Layar Riwayat.** FlatList dengan:
- Card per entry (icon modul, title, summary, timestamp)
- Long-press untuk konfirmasi hapus
- Pull-to-refresh

### `src/screens/SettingsScreen.tsx`
**Layar Pengaturan.** List dengan rows:
- Brand info (logo + version) — pakai BrandLogo dengan icon.png
- Tentang aplikasi
- Reset history / progress
- Link ke GitHub / docs

### `src/screens/MateriListScreen.tsx`
**Layar daftar materi.** Berisi:
- Progress bar overall (X/20 materi)
- 3 section (Integral, Interpolasi, Geometri)
- Card per materi (judul, durasi, status read)

### `src/screens/MateriDetailScreen.tsx`
**Layar detail materi.** Render:
- Sections: heading / paragraph / formula / example / note / bullets
- Tombol "Tandai sudah dibaca"
- Auto-save status read ke AsyncStorage

---

## 📁 Folder `src/data/` — Data Statis

### `src/data/tips.ts`
**21 tips harian** tentang metode numerik. Plus fungsi:
- `pickTipsForDay(dayIndex)` — pilih 3 tips untuk hari tertentu (deterministik)
- `todayIndex()` — hitung day-of-year (0-365)

### `src/data/materi.ts`
**20 materi pembelajaran** lengkap. Tipe `Materi` dengan `sections` array. Plus helpers:
- `materiByModule(module)` — filter per modul
- `getMateri(id)` — ambil 1 materi by id

---

## 📁 Folder `src/hooks/`

### `src/hooks/useDailyTips.ts`
**Hook kustom** untuk daily tips carousel. Auto-rotate 3 tips tiap 90 detik. Returns: `tips`, `currentTip`, `currentIndex`, `setIndex`.

---

## 📁 Folder `assets/` — Asset Statis

### `assets/icon.png` (1024×1024)
Icon utama aplikasi. Digunakan oleh BrandLogo di HomeScreen dan SettingsScreen.

### `assets/adaptive-icon.png`
Icon Android dengan margin untuk adaptive icon.

### `assets/splash.png` (1242×2436)
Splash screen saat aplikasi dibuka.

### `assets/favicon.png` (48×48)
Favicon untuk versi web.

### `assets/Icon_numerik.png`
Varian icon alternatif untuk branding.

---

## 📁 Folder `__tests__/`

### `__tests__/numerical.test.ts`
**Unit tests** untuk algoritma numerik. 8 tests:
- Trapezoidal: x², x
- Simpson: x³, reject n ganjil
- Romberg: sin(x) dari 0 ke π
- Lagrange: pass through points
- Newton: pass through points
- Geometry: square, circle, triangle

Run dengan `npm test`.

---

## 🌳 Alur Aplikasi (User Journey)

Mari kita ikuti contoh user yang baru buka aplikasi:

```
1. User buka app
   ↓
2. app/_layout.tsx → setup StatusBar, SafeArea, Stack navigator
   ↓
3. app/index.tsx → render HomeScreen
   ↓
4. User tap card "Integral Numerik"
   ↓
5. expo-router navigasi ke /integral
   ↓
6. app/integral.tsx → render IntegralScreen
   ↓
7. User input fungsi → MathKeyboard muncul
   ↓
8. User tap "Hitung" → useIntegralStore.calculate()
   ↓
9. integralStore panggil calculateIntegral() (di src/core/numerical/integration/)
   ↓
10. Hasilnya disimpan ke state + ke historyStorage
    ↓
11. UI re-render: tampilkan ResultHero + IntegralChart + StepCard array
```

---

## 🎓 Tips Buat Pemula yang Mau Modifikasi App Ini

### Mau ganti warna utama?
→ Edit `src/theme/index.ts`, ubah `primary` dan turunannya.

### Mau tambah modul baru (misal: Persamaan Linear)?
1. Buat algoritma di `src/core/numerical/linear/index.ts`
2. Buat layar di `src/screens/LinearScreen.tsx`
3. Buat route di `app/linear.tsx` → re-export
4. Daftar di `app/_layout.tsx` → tambah `<Stack.Screen name="linear" />`
5. Tambah ModuleCard di HomeScreen

### Mau ganti AI provider?
→ Edit `src/core/ai/aiService.ts`. Lihat `PANDUAN_AI_DAN_DEPLOY.md` untuk detail.

### Mau tambah materi baru?
→ Edit `src/data/materi.ts`, tambah object baru di array `MATERI`.

### Mau tambah quick prompt di AI Helper?
→ Edit `src/screens/AiHelperScreen.tsx`, tambah string di array `QUICK_PROMPTS`.

### Bingung struktur file mana untuk apa?
→ Aturan praktis:
- **UI yang dipakai 1x saja** → di dalam file screen-nya
- **UI yang dipakai 2+ kali** → bikin komponen di `src/components/`
- **Logika kalkulasi** → di `src/core/`
- **Data statis** → di `src/data/`

---

## 📚 Belajar Lebih Lanjut

- **React Native:** https://reactnative.dev/docs/getting-started
- **Expo:** https://docs.expo.dev
- **expo-router:** https://docs.expo.dev/router/introduction
- **TypeScript:** https://www.typescriptlang.org/docs
- **Zustand:** https://docs.pmnd.rs/zustand/getting-started/introduction
- **KaTeX:** https://katex.org/docs/supported

---

> Dokumen ini terakhir diperbarui: Mei 2026.
> Kalau ada bagian yang masih membingungkan, jangan ragu tanya AI Asisten di dalam aplikasi!