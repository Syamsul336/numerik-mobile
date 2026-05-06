# Setup Guide — Numerik v3

Panduan singkat untuk menjalankan aplikasi setelah download.

## 1. Persiapkan Environment

Pastikan Node.js versi 20–24 terinstall:
```bash
node -v
# v20.x.x atau v22.x.x atau v24.x.x — semua OK
```

## 2. Install Dependencies

```bash
npm install
```

⚠️ **Catatan**: v3 menambahkan `react-native-webview` (untuk renderer KaTeX). Jika kamu upgrade dari v2, jangan lupa `npm install` ulang.

## 3. Jalankan Dev Server

```bash
npm start
```

Lalu pilih:
- Tekan `a` → buka di Android emulator
- Tekan `i` → buka di iOS simulator
- Tekan `w` → buka di browser
- Atau scan QR code dengan **Expo Go** app

## 4. Build Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

(Memerlukan EAS account — daftar di https://expo.dev)

## Troubleshooting

### "Unable to resolve module 'react-native-webview'"
```bash
npx expo install react-native-webview
```

### Math keyboard tidak muncul
Pastikan `react-native-reanimated` ter-install (sudah ada di `package.json`). Restart Metro bundler:
```bash
npm start -- --reset-cache
```

### KaTeX tidak render di Android
WebView butuh internet untuk load KaTeX CDN pertama kali. Setelah cache, akan jalan offline.

### Icon tidak ter-update setelah modifikasi SVG
Regenerate PNG-nya:
```bash
cd assets && python3 _generate_icons.py
```

(Memerlukan Python 3 + Pillow: `pip install Pillow`)

## Kustomisasi

### Ganti Warna Primary
Edit `src/theme/index.ts`, ubah `primary` dan turunannya.

### Tambah Quick Prompt di AI Helper
Edit `src/screens/AiHelperScreen.tsx`, ubah array `QUICK_PROMPTS`.

### Tambah Fungsi di Math Keyboard
Edit `src/components/math/MathKeyboard.tsx`, tambahkan ke array `functionKeys`, `symbolKeys`, atau `calcKeys`.
