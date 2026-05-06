// =============================================================================
// FILE: app/_layout.tsx
// =============================================================================
//
// Apa fungsi file ini?
// --------------------
// Ini adalah "kerangka utama" aplikasi. File ini selalu diload pertama kali
// saat aplikasi dibuka, dan mengatur:
//   1. Status bar (jam/baterai di paling atas layar)
//   2. Stack Navigator — sistem navigasi antar layar (push/pop)
//   3. Background warna saat transisi antar layar
//   4. Setup library GestureHandler & SafeArea
//
// Apa itu "expo-router"?
// ----------------------
// expo-router adalah sistem navigasi berbasis FILE. Artinya: setiap file
// .tsx di dalam folder `app/` otomatis menjadi satu layar/route.
//
// Contoh:
//   app/index.tsx            → layar utama (path: "/")
//   app/integral.tsx         → layar integral (path: "/integral")
//   app/materi/[id].tsx      → layar dinamis (path: "/materi/123")
//   app/_layout.tsx          → KERANGKA (file ini sendiri)
//
// File yang diawali underscore (_) adalah special — bukan route, tapi
// pengatur layout untuk file-file di sebelahnya.
//
// Apa itu "Stack"?
// ----------------
// Stack adalah pola navigasi tumpukan: layar baru ditumpuk di atas layar lama.
// Tombol back akan menghapus layar paling atas. Bayangkan tumpukan piring.
// =============================================================================

import React from 'react';
import { Stack } from 'expo-router';                      // sistem navigasi tumpukan
import { StatusBar } from 'expo-status-bar';              // pengatur status bar
import { SafeAreaProvider } from 'react-native-safe-area-context'; // penghindar notch
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // dukung gesture
import { useColorScheme, View } from 'react-native';

/**
 * Komponen utama yang menjadi "akar" dari seluruh app.
 * `default` artinya ini fungsi utama yang dipakai expo-router.
 */
export default function RootLayout() {
  // useColorScheme() mendeteksi setting tema OS user: 'light' | 'dark' | null
  const scheme = useColorScheme();

  // Pilih warna background sesuai mode terang/gelap
  // Mode gelap → navy lebih dalam; mode terang → navy primer
  const bg = scheme === 'dark' ? '#0A0E2A' : '#1E2A9E';

  return (
    // GestureHandlerRootView WAJIB di luar untuk dukungan gesture
    // (swipe, drag, dll.) — diperlukan oleh react-native-gesture-handler.
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* SafeAreaProvider memastikan konten tidak ketutup oleh notch / status bar */}
      <SafeAreaProvider>
        {/* StatusBar selalu pakai teks putih karena hero header berwarna navy gelap */}
        <StatusBar style="light" backgroundColor={bg} translucent={false} />

        {/* View pembungkus dengan warna background — supaya tidak flicker putih saat transisi */}
        <View style={{ flex: 1, backgroundColor: bg }}>
          {/*
            Stack: navigator utama. Daftarkan semua route di dalamnya.
            screenOptions = pengaturan default untuk SEMUA layar.
          */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: scheme === 'dark' ? '#0A0E2A' : '#F4F5FB',
              },
              animation: 'fade',
              animationDuration: 150,
            }}
          >
            {/*
              Daftar semua route. Nama harus cocok dengan nama file di folder `app/`.
              Tidak harus didaftar (expo-router auto-detect), tapi explicit lebih jelas.
            */}
            <Stack.Screen name="index" />        {/* Halaman utama (Home) */}
            <Stack.Screen name="integral" />     {/* Modul integral */}
            <Stack.Screen name="interpolation" /> {/* Modul interpolasi */}
            <Stack.Screen name="geometry" />     {/* Modul bangun datar */}
            <Stack.Screen name="ai-helper" />    {/* AI Asisten */}
            <Stack.Screen name="history" />      {/* Riwayat perhitungan */}
            <Stack.Screen name="settings" />     {/* Pengaturan */}
            <Stack.Screen name="materi" />       {/* Daftar materi */}
            <Stack.Screen name="materi/[id]" />  {/* Detail materi (dinamis dari id) */}
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
