// =============================================================================
// FILE: babel.config.js
// =============================================================================
//
// Apa itu Babel?
// --------------
// Babel adalah "penerjemah" kode JavaScript modern. Kode yang kita tulis
// menggunakan fitur baru (TypeScript, JSX, async/await, dll.) tidak bisa
// langsung dijalankan oleh semua mesin JavaScript. Babel mengubah (transpile)
// kode kita menjadi kode JavaScript yang dapat dipahami oleh perangkat lama
// maupun baru.
//
// Kapan file ini dipakai?
// -----------------------
// Setiap kali kamu menjalankan `npm start`, `npm run android`, dll.,
// Expo / Metro Bundler akan membaca file ini terlebih dahulu untuk tahu
// cara memproses kode kita.
//
// Apa fungsi tiap baris di sini?
// ------------------------------
// - api.cache(true)        : Babel akan men-cache hasil compile untuk
//                            mempercepat reload berikutnya.
// - presets                : "Paket" konfigurasi siap pakai. `babel-preset-expo`
//                            adalah preset resmi Expo yang sudah berisi semua
//                            yang dibutuhkan project React Native + TypeScript.
// - plugins                : Plugin tambahan. `react-native-reanimated/plugin`
//                            WAJIB ditaruh PALING AKHIR — plugin ini yang
//                            membuat animasi reanimated berjalan di thread UI
//                            (mulus 60fps).
//
// PENTING: Jangan ubah urutan plugin reanimated. Harus PALING AKHIR.
// =============================================================================

module.exports = function (api) {
  // Cache hasil compile untuk performa lebih cepat
  api.cache(true);

  return {
    // Preset Expo: berisi semua konfigurasi standar untuk project Expo
    presets: ['babel-preset-expo'],

    // Plugin reanimated wajib di posisi terakhir
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
