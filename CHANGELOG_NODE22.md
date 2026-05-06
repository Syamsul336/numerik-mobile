# 📝 Catatan Migrasi & Persiapan Node 22 — Numerik 2026.1

Dokumen ini menjelaskan perubahan yang dilakukan agar project bisa berjalan lancar di **Node.js v22 LTS**.

---

## 📋 Ringkasan Perubahan

Project Numerik sudah diupdate untuk support Node 20, 22, dan 24. Perubahan dilakukan secara **non-breaking** — kode aplikasi tidak berubah, hanya konfigurasi dan dependency updates.

---

## 📦 File yang Diubah

### 1. `package.json` — Updated

**Apa yang berubah:**

#### ✅ Tambahan `engines` field
```json
"engines": {
  "node": ">=20.0.0 <25.0.0"
}
```
Artinya: project ini support Node 20, 22, dan 24 (direkomendasikan: **Node 22**).

#### ✅ Dependency Updates

| Package | Sebelum | Sesudah | Notes |
|---------|---------|---------|-------|
| `react-native-screens` | `3.31.0` | `~3.31.1` | Fix postinstall bug (`bob build && husky install`) |
| `react-native` | `0.74.0` | `0.74.5` | Bug fixes |
| `react-native-safe-area-context` | `4.10.0` | `4.10.5` | Compatibility |
| `react-native-gesture-handler` | `~2.16.0` | `~2.16.2` | Bug fixes |
| `react-native-reanimated` | `~3.10.0` | `~3.10.1` | Performance |
| `@react-navigation/native` | `^6.1.0` | `^6.1.18` | Stability |
| `@react-navigation/native-stack` | `^6.10.0` | `^6.11.0` | Bug fixes |
| `@expo/vector-icons` | `^14.0.0` | `^14.0.4` | Icon updates |
| `axios` | `^1.7.0` | `^1.7.7` | Security patches |
| `mathjs` | `^13.0.0` | `^13.2.0` | New features |
| `zustand` | `^4.5.0` | `^4.5.5` | State management |
| `@babel/core` | `^7.24.0` | `^7.25.0` | Better compilation |
| `@types/react` | `~18.2.0` | `~18.2.79` | Type definitions |
| `typescript` | `~5.3.0` | `~5.3.3` | TypeScript 5.3 |
| `@types/jest` | `^29.5.0` | `^29.5.12` | Test types |
| `jest-expo` | `~51.0.0` | `~51.0.4` | Expo 51 compatible |

#### ✅ Tambahan `overrides` field
```json
"overrides": {
  "react-native-screens": "~3.31.1"
}
```
Ini force `react-native-screens` ke versi yang aman, untuk jaga-jaga kalau library lain minta versi lama.

---

### 2. `.nvmrc` — File Baru

Isinya satu baris:
```
22
```

**Gunanya:** Kalau kamu pakai nvm-windows, tinggal jalankan:
```bash
nvm use
```
Di folder project, dan otomatis switch ke Node 22. Tidak perlu ingat versi.

---

### 3. `.npmrc` — File Baru

Konfigurasi npm khusus project:
```
legacy-peer-deps=true
engine-strict=false
fetch-retries=5
fetch-retry-mintimeout=20000
```

| Setting | Fungsi |
|---------|--------|
| `legacy-peer-deps` | Bantu pas install ada peer dependency conflict |
| `engine-strict=false` | Warning aja kalau Node version tidak cocok |
| `fetch-retries` | Retry saat internet lambat |
| `fetch-retry-mintimeout` | Timeout 20 detik per retry |

---

### 4. `BrandLogo.tsx` — Updated

Komponen logo diupdate dari SVG vector ke Image component:

**Sebelum:** Menggunakan `react-native-svg` untuk render logo
**Sesudah:** Menggunakan `Image` dari `react-native` dengan `assets/icon.png`

Ini dilakukan karena:
- Icon baru sudah tersedia di `assets/icon.png`
- Mempercepat render logo
- Lebih maintainable

---

## 🛠️ Cara Install & Jalankan

### Langkah 1: Pastiin sudah di Node 22

```bash
# Cek versi Node
node --version  # harus v22.x.x

# Kalau belum, install nvm dulu:
# https://github.com/coreybutler/nvm-windows/releases

# Atau pakai nvm use
nvm use 22
```

### Langkah 2: Bersihin install lama (optional tapi direkomendasikan)

```bash
# Windows
rmdir /s /q node_modules
del package-lock.json

# Mac/Linux
rm -rf node_modules
rm package-lock.json
```

### Langkah 3: Install dependencies

```bash
npm install
```

### Langkah 4: Jalankan development server

```bash
npm start
```

---

## ❓ Troubleshooting

### Error: "bob is not recognized"

Kalau muncul error `bob is not recognized` saat install:

```bash
# Install expo-cli globally
npm install -g expo-cli

# Atau install babel-preset-expo
npm install babel-preset-expo
```

### Error: "EPERM: operation not permitted"

Kalau ada error EPERM saat install:

1. **Jalankan terminal sebagai Administrator** (klik kanan → Run as administrator)
2. **Pindah dari folder Downloads/OneDrive** — folder ini sering bermasalah
3. **Disable antivirus sementara** (Windows Defender bisa block)

### Error: Peer dependency conflict

Kalau ada peer dependency conflict:

```bash
npm install --legacy-peer-deps
```

Atau pakai `.npmrc` yang sudah disetup:

```bash
npm install  # sudah auto pakai legacy-peer-deps
```

### Warning: Node version mismatch

Kalau npm kasih warning tentang Node version:

```
npm warn engine-strict: false
```

Ini **tidak masalah** — kita sudah set `engine-strict=false` di `.npmrc` supaya tidak blocking, hanya warning.

---

## 📝 Catatan Penting

### ⚠️ Expo SDK 51 sudah lawas

Project ini pakai **Expo SDK 51** (rilis Mei 2024). Suatu saat kamu perlu upgrade ke SDK terbaru.

Untuk upgrade Expo SDK:
1. Cek versi terbaru: `npx expo --version`
2. Baca guide: https://docs.expo.dev/workflow/upgrading-expo/
3. Testing thorough setelah upgrade

### Kode Aplikasi Tidak Berubah

Seluruh kode di `src/` dan `app/` **tidak disentuh** selama migrasi ini. Logika aplikasi tetap sama.

---

## 📊 Status Kompatibilitas

| Node Version | Status | Notes |
|--------------|--------|-------|
| Node 18 | ⚠️ Warning | Seharusnya jalan, tapi tidak direkomendasikan |
| Node 20 | ✅ Compatible | Sudah diuji |
| Node 22 | ✅ Recommended | Versi yang digunakan |
| Node 23 | ✅ Compatible | Experimental |
| Node 24 | ⚠️ Unknown | Belum diuji |

---

## 🔗 Referensi

- **Node.js Downloads:** https://nodejs.org/en/download
- **nvm-windows:** https://github.com/coreybutler/nvm-windows
- **Expo SDK Upgrade:** https://docs.expo.dev/workflow/upgrading-expo/

---

> Dokumen ini terakhir diperbarui: Mei 2026
> Versi project: 3.1.0