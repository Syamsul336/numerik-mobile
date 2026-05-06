// =============================================================================
// FILE: app/materi/[id].tsx → Route "/materi/{id-tertentu}"
// =============================================================================
//
// Halaman detail SATU materi. File ini adalah ROUTE DINAMIS — perhatikan
// nama file pakai kurung siku [id]. Artinya: bagian id pada URL akan
// otomatis ditangkap sebagai parameter.
//
// Contoh:
//   /materi/i-pengantar       → id = "i-pengantar"
//   /materi/n-lagrange-vs-newton → id = "n-lagrange-vs-newton"
//
// Cara mendapatkan id di dalam komponen:
//   const { id } = useLocalSearchParams<{ id: string }>();
//
// Logika layar yang sebenarnya ada di src/screens/MateriDetailScreen.tsx.
// =============================================================================

export { default } from '../../src/screens/MateriDetailScreen';
