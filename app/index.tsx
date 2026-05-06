// =============================================================================
// FILE: app/index.tsx → Route HOME ("/")
// =============================================================================
//
// File ini adalah halaman PERTAMA yang muncul saat aplikasi dibuka.
// Karena namanya "index", expo-router otomatis menjadikannya path "/".
//
// Isinya cuma satu baris: kita "meminjam" komponen HomeScreen yang ada di
// folder src/screens/ dan menjadikannya tampilan halaman ini.
//
// Mengapa dipisah seperti ini?
// ----------------------------
// Ini pola yang umum dipakai: folder `app/` cuma untuk routing,
// sedangkan logika UI yang sebenarnya ditaruh di `src/screens/`.
// Manfaatnya: folder `app/` jadi mudah dilihat strukturnya, dan
// kalau kita mau pindah dari expo-router ke navigator lain,
// tinggal ganti file di `app/` saja.
// =============================================================================

export { default } from '../src/screens/HomeScreen';
