# 📦 Panduan Build APK — Numerik App

Dokumen ini menjelaskan semua cara untuk build aplikasi Expo menjadi APK/AAB.

---

## 📋 Daftar Isi

1. [APK vs AAB — Apa Bedanya?](#apk-vs-aab)
2. [EAS Build (Cloud)](#-eas-build-cloud)
3. [Local Build (Gradle)](#-local-build-gradle)
4. [GitHub Actions (CI/CD)](#-github-actions-cicd)
5. [Profile Preview vs Production](#profile-preview-vs-production)
6. [Cek Kuota & Pricing](#kuota-dan-pricing)
7. [Troubleshooting](#troubleshooting)

---

## APK vs AAB

### Perbedaan Dasar

| Aspek | APK | AAB |
|-------|-----|-----|
| Install langsung di HP | ✅ Bisa | ❌ Tidak bisa |
| Upload ke Google Play Store | ⚠️ Bisa (deprecated) | ✅ Format wajib |
| Diproses oleh | Langsung Android | Google Play Console |
| Optimisasi | Static | Dynamic per device |

### Kenapa AAB Tidak Bisa Diinstall Langsung?

AAB (Android App Bundle) adalah **bundel**, bukan aplikasi jadi. Google Play Console akan memproses AAB untuk menghasilkan APK yang di-optimisasi sesuai spesifikasi HP user (ukuran layar, arsitektur CPU, dll).

```
AAB → Google Play Console proses → APK optimized → User download & install
APK → Langsung install di HP ✅
```

### Kapan Pakai Yang Mana?

| Tujuan | Format | Command |
|--------|--------|---------|
| Testing di HP sendiri | APK | `eas build --platform android --profile preview` |
| Bagikan ke teman/QA | APK | `eas build --platform android --profile production` |
| Upload ke Play Store | AAB | `eas build --platform android --profile production` |

---

## 🔵 EAS Build (Cloud)

**Recommended** — Paling mudah, tidak perlu install Android SDK.

### Prasyarat

- Akun Expo (daftar di [expo.dev](https://expo.dev))
- Node.js 20+
- Koneksi internet

### Langkah 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Langkah 2: Login ke Expo

```bash
eas login
```

### Langkah 3: Konfigurasi EAS

```bash
eas build:configure
```

Ini akan membuat file `eas.json` di root project.

### Langkah 4: Edit `eas.json`

Untuk build **APK** (install langsung), tambahkan `buildType: "apk"`:

```json
{
  "cli": {
    "version": ">= 18.11.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Langkah 5: Build APK

```bash
# Build preview (untuk testing)
eas build --platform android --profile preview

# Build production (untuk distribusi)
eas build --platform android --profile production
```

Setelah selesai, akan muncul **link download APK** di terminal dan dashboard Expo.

### ⚠️ Catatan untuk Play Store

Kalau nanti mau upload ke Google Play Store, **hapus** `buildType: "apk"` dari profile production:

```json
"production": {
  "autoIncrement": true
  // hapus android.buildType — biarkan default AAB
}
```

---

## 🖥️ Local Build (Gradle)

Build di komputer sendiri — tidak memakan kuota EAS, tapi butuh setup lebih banyak.

### Prasyarat

1. **Java JDK 17+** — [Download](https://adoptium.net/)
2. **Android Studio** dengan Android SDK
3. **Environment Variables**:
   - `JAVA_HOME` → path ke JDK
   - `ANDROID_HOME` → path ke Android SDK

### Langkah 1: Generate Native Folder

```bash
npx expo prebuild --platform android
```

Ini akan membuat folder `android/` berisi project native.

### Langkah 2: Build APK Debug

```bash
cd android
./gradlew assembleDebug
```

### Langkah 3: Build APK Release

```bash
./gradlew assembleRelease
```

### Langkah 4: APK Output

```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release.apk
```

### Install ke HP

```bash
# Via USB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Atau copy file APK ke HP dan install manual
```

---

## 🐙 GitHub Actions (CI/CD)

Otomatis build setiap push ke GitHub — cocok untuk tim atau automation.

### Langkah 1: Buat GitHub Repo

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/numerik-mobile.git
git push -u origin main
```

### Langkah 2: Buat Expo Access Token

1. Buka [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
2. Klik **"Create access token"**
3. Copy token-nya

### Langkah 3: Tambah Secret ke GitHub

1. Buka repo GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Klik **"New repository secret"**
3. Name: `EXPO_TOKEN`
4. Value: paste token dari langkah sebelumnya

### Langkah 4: Buat Workflow File

Buat file `.github/workflows/build.yml`:

```yaml
name: EAS Build

on:
  push:
    branches: [main]
  workflow_dispatch:  # Allow manual trigger

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g eas-cli

      - name: Build Android APK
        run: eas build --platform android --profile preview --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: apk-output
          path: android/app/build/outputs/apk/**/*.apk
```

### Langkah 5: Trigger Build

- **Otomatis**: Push kode ke `main` → auto build
- **Manual**: Di GitHub repo → Actions tab → Run workflow

---

## Profile Preview vs Production

### Perbandingan

| Aspek | Preview | Production |
|-------|---------|------------|
| Tujuan | Testing internal | Rilis resmi |
| Output default | APK (dengan config) | AAB |
| Signing | Debug keystore | Release keystore |
| Auto increment version | ❌ | ✅ |
| Optimisasi | Standar | Full optimization |
| Kapan dipakai | Test di HP sendiri / teman | Publish ke Play Store |

### Kapan Pakai Preview?

- Mau testing fitur baru di HP sendiri
- Mau bagikan APK ke teman / QA
- Belum siap publish ke Play Store

### Kapan Pakai Production?

- Sudah selesai testing, siap rilis
- Mau upload ke Google Play Store
- Butuh versi resmi dengan signed keystore

---

## Kuota dan Pricing

### Free Tier (15 build/bulan)

| Item | Detail |
|------|--------|
| Build per bulan | 15 |
| Platform | iOS + Android |
| Queue | Shared (bisa lebih lama) |
| Harga | **Gratis** |

### Kapan Berbayar?

- Lebih dari **15 build/bulan** → upgrade plan
- iOS build butuh **Apple Developer Account** ($99/tahun) — bukan ke Expo
- Priority queue untuk build lebih cepat

### Cek Sisa Kuota

**Via Website:**
1. Buka [expo.dev](https://expo.dev)
2. Login → klik username pojok kiri bawah
3. Buka **Billing** atau **Usage**

**Via CLI:**
```bash
eas account:view
```

---

## Troubleshooting

### Error: "EAS builds are not allowed for this account"

**Penyebab**: Akun Expo belum diaktivasi atau sudah exceeds quota.

**Solusi**:
1. Cek billing di expo.dev
2. Tunggu reset bulanan (kuota reset tiap tanggal 1)
3. Atau upgrade ke plan berbayar

### Error: "Android build failed"

**Penyebab**: Konfigurasi `app.json` tidak lengkap.

**Solusi** — Pastikan `app.json` ada:

```json
{
  "expo": {
    "name": "Numerik",
    "slug": "numerik-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.namaapp.app"
    }
  }
}
```

### Error: "Java not found"

**Penyebab** (Local build): Java/JDK belum terinstall atau `JAVA_HOME` belum diset.

**Solusi**:
1. Install [JDK 17](https://adoptium.net/)
2. Set environment variable:
   ```
   JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x
   ```

### Build Successful tapi APK tidak bisa diinstall

**Penyebab**: APK tidak signed atau arsitektur CPU tidak cocok.

**Solusi**:
1. Pastikan build **release** bukan debug untuk distribusi
2. Cek arsitektur HP (arm64-v8a, armeabi-v7a, x86)
3. Install lewat ADB: `adb install -r app.apk`

---

## 📊 Ringkasan Perintah

| Perintah | Fungsi |
|----------|--------|
| `eas build --platform android --profile preview` | Build APK via cloud (testing) |
| `eas build --platform android --profile production` | Build APK via cloud (distribusi) |
| `eas build --platform android --profile preview --local` | Build APK di lokal (tidak pakai kuota) |
| `npx expo prebuild --platform android` | Generate folder android |
| `./gradlew assembleDebug` | Build debug APK (lokal) |
| `./gradlew assembleRelease` | Build release APK (lokal) |

---

> Dokumen ini terakhir diperbarui: Mei 2026
> Untuk panduan AI + Deploy, lihat [PANDUAN_AI_DAN_DEPLOY.md](PANDUAN_AI_DAN_DEPLOY.md)