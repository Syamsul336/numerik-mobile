// =============================================================================
// FILE: src/data/tips.ts
// =============================================================================
//
// DAILY TIPS — 21 tips edukatif tentang metode numerik
// =====================================================
//
// Apa fungsi file ini?
// --------------------
// Berisi 21 tips singkat tentang konsep dan trik metode numerik. Setiap hari,
// app pilih 3 tips secara DETERMINISTIK (algoritma yang sama tiap hari) lalu
// rotate setiap 90 detik di HomeScreen.
//
// Struktur data:
// - id      : ID unik untuk tracking
// - title   : Judul singkat (max 4-5 kata)
// - body    : Penjelasan lengkap (1-2 kalimat)
// - cta     : Tombol Call-To-Action opsional ke route tertentu
// - topic   : Kategori untuk color coding (integral/interpolation/geometry/umum)
//
// Pemilihan tips deterministik:
// Pakai day-of-year sebagai seed, jadi semua user yang buka app di tanggal
// yang sama akan lihat 3 tips yang sama. Esok hari → 3 tips berbeda.
// =============================================================================

export interface Tip {
  id: string;
  title: string;
  body: string;
  /** Tombol opsional: kalau ada, ditampilkan dengan label & link ke route */
  cta?: { label: string; route: string };
  /** Kategori untuk warna pastel berbeda per topic */
  topic: 'integral' | 'interpolation' | 'geometry' | 'umum';
}

/**
 * 21 tips tentang metode numerik, learning, dan intuisi matematika.
 * Setiap hari 3 dari ini dipilih secara deterministik.
 */
export const TIPS: Tip[] = [
  // ───── Integral ─────
  {
    id: 'i1',
    title: 'Trapesium = Setengah Geometri',
    body: 'Aturan Trapesium hanyalah penjumlahan luas trapesium kecil di bawah kurva. Karena itulah modul Bangun Datar penting — fondasinya sama!',
    cta: { label: 'Coba Integral', route: '/integral' },
    topic: 'integral',
  },
  {
    id: 'i2',
    title: 'Simpson 4× Lebih Akurat',
    body: 'Untuk fungsi halus, error Simpson 1/3 berkurang dengan O(h⁴) — empat kali lipat lebih cepat dari trapesium yang hanya O(h²).',
    cta: { label: 'Bandingkan', route: '/integral' },
    topic: 'integral',
  },
  {
    id: 'i3',
    title: 'Kenapa Simpson Butuh n Genap?',
    body: 'Simpson 1/3 mengaproksimasi 2 subinterval sekaligus dengan parabola. Total subinterval harus genap — kalau ganjil, ada satu yang tertinggal sendirian.',
    topic: 'integral',
  },
  {
    id: 'i4',
    title: 'Romberg Sangat Efisien',
    body: 'Romberg menggunakan ekstrapolasi Richardson untuk menghapus orde error rendah secara berurutan. Hasilnya: 5 level Romberg sering lebih akurat dari Simpson dengan n=100.',
    cta: { label: 'Coba Romberg', route: '/integral' },
    topic: 'integral',
  },
  {
    id: 'i5',
    title: 'Saat n Besar, Hati-hati Round-off',
    body: 'Memperbesar n terus-menerus tidak selalu meningkatkan akurasi. Pada n sangat besar, error pembulatan komputer mulai dominan dan hasil bisa malah memburuk.',
    topic: 'integral',
  },
  {
    id: 'i6',
    title: 'Integral Tertua di Dunia',
    body: 'Aturan Trapesium sudah dikenal masyarakat Babilonia ~3000 tahun lalu untuk menghitung area lahan! Sebelum Newton & Leibniz menemukan kalkulus formal.',
    topic: 'integral',
  },
  {
    id: 'i7',
    title: 'Pilih Metode Sesuai Fungsi',
    body: 'Fungsi mulus (polinomial, sinus, eksponensial)? Simpson atau Romberg. Fungsi dengan banyak osilasi atau diskontinu? Trapesium dengan n besar lebih aman.',
    cta: { label: 'Pelajari Selengkapnya', route: '/materi' },
    topic: 'integral',
  },

  // ───── Interpolasi ─────
  {
    id: 'n1',
    title: 'Lagrange vs Newton',
    body: 'Lagrange lebih intuitif untuk dimengerti. Newton DD lebih efisien jika titik baru ditambahkan — tabel beda terbagi cukup diperluas, tidak perlu hitung ulang.',
    topic: 'interpolation',
  },
  {
    id: 'n2',
    title: 'Polinomial Interpolasi Itu Unik',
    body: 'Untuk n+1 titik, hanya ada satu polinomial berderajat ≤ n yang melewati semua titik tersebut. Lagrange dan Newton menghasilkan polinomial yang sama, hanya bentuk penulisannya berbeda.',
    topic: 'interpolation',
  },
  {
    id: 'n3',
    title: 'Awas Fenomena Runge',
    body: 'Polinomial derajat tinggi pada titik berjarak sama bisa berosilasi liar di antara simpul (terutama dekat tepi interval). Solusinya: gunakan spline atau titik Chebyshev.',
    cta: { label: 'Pelajari', route: '/materi' },
    topic: 'interpolation',
  },
  {
    id: 'n4',
    title: 'Interpolasi vs Ekstrapolasi',
    body: 'Interpolasi (di dalam rentang data) umumnya akurat. Ekstrapolasi (di luar rentang) sangat berisiko — kesalahan tumbuh eksponensial. Hati-hati saat memprediksi nilai di luar data!',
    topic: 'interpolation',
  },
  {
    id: 'n5',
    title: 'Lagrange Berasal dari Italia',
    body: 'Joseph-Louis Lagrange (1736-1813) sebenarnya orang Italia, lahir sebagai Giuseppe Luigi Lagrangia. Pindah ke Prancis dan menjadi salah satu matematikawan terbesar sepanjang masa.',
    topic: 'interpolation',
  },
  {
    id: 'n6',
    title: 'Spline Lebih Aman',
    body: 'Untuk banyak titik, gunakan cubic spline daripada satu polinomial besar. Spline = banyak polinomial derajat 3 yang disambung mulus. Lebih stabil, tidak osilasi.',
    topic: 'interpolation',
  },
  {
    id: 'n7',
    title: 'Aplikasi Tak Terduga',
    body: 'Interpolasi dipakai di mana-mana: kurva animasi (game/film), upscaling gambar, audio resampling, GPS path smoothing, hingga rekonstruksi sinyal medis (MRI/CT).',
    topic: 'interpolation',
  },

  // ───── Geometri & umum ─────
  {
    id: 'g1',
    title: 'Pi Itu Konstanta Magis',
    body: 'π ≈ 3.14159… adalah perbandingan keliling lingkaran terhadap diameternya. Konstanta ini muncul di mana-mana: gelombang, statistik, fisika kuantum, bahkan distribusi normal!',
    topic: 'geometry',
  },
  {
    id: 'g2',
    title: 'Trapesium = Persegi Panjang Rata-rata',
    body: 'Luas trapesium = ½(a+b)·t = (a+b)/2 · t. Itu sama dengan persegi panjang dengan tinggi t dan lebar = rata-rata kedua sisi sejajar. Visualisasi yang membantu!',
    topic: 'geometry',
  },
  {
    id: 'g3',
    title: 'Rumus Heron untuk Segitiga',
    body: 'Tahu panjang 3 sisi tapi tidak tinggi? Pakai Heron: Luas = √(s(s−a)(s−b)(s−c)), dengan s = (a+b+c)/2. Berlaku untuk segitiga apapun!',
    topic: 'geometry',
  },
  {
    id: 'g4',
    title: 'Lingkaran Punya Luas Maksimum',
    body: 'Dari semua bangun datar dengan keliling sama, lingkaran selalu punya luas terbesar. Inilah kenapa gelembung sabun selalu bulat — alam meminimumkan luas permukaan untuk volume tertentu.',
    topic: 'geometry',
  },
  {
    id: 'g5',
    title: 'Integral Mulai dari Geometri',
    body: 'Konsep integral lahir dari pertanyaan: "berapa luas di bawah kurva?". Trapesium dan Simpson hanyalah cara aproksimasi geometris untuk soal kalkulus.',
    cta: { label: 'Lihat Hubungannya', route: '/materi' },
    topic: 'geometry',
  },
  {
    id: 'u1',
    title: 'Belajar dengan Praktik',
    body: 'Konsep numerik paling cepat dipahami dengan tangan kotor: ubah parameter, lihat grafik, bandingkan metode. Modul Numerik dirancang untuk eksperimen.',
    cta: { label: 'Eksplor', route: '/materi' },
    topic: 'umum',
  },
  {
    id: 'u2',
    title: 'AI Asisten Siap Membantu',
    body: 'Bingung kapan pakai metode tertentu? Tanya AI Asisten — bisa menjelaskan konsep, perbandingan metode, dan studi kasus dalam Bahasa Indonesia.',
    cta: { label: 'Tanya AI', route: '/ai-helper' },
    topic: 'umum',
  },
];

/**
 * Pilih 3 tips untuk hari tertentu (deterministik).
 *
 * Algoritma: pakai stride agar tips tersebar di sepanjang array, sehingga
 * tip muncul ulang sekitar tiap 7 hari (21 tips ÷ 3 = 7).
 *
 * Contoh: dayIndex=0 → tips[0], tips[7], tips[14]
 *         dayIndex=1 → tips[1], tips[8], tips[15]
 */
export function pickTipsForDay(dayIndex: number): Tip[] {
  const N = TIPS.length;
  if (N === 0) return [];
  // Modulo trick untuk handle negatif: ((x % N) + N) % N selalu positif
  const offset = ((dayIndex % N) + N) % N;
  const stride = Math.max(1, Math.floor(N / 3));
  return [
    TIPS[offset % N],
    TIPS[(offset + stride) % N],
    TIPS[(offset + 2 * stride) % N],
  ];
}

/**
 * Hitung "day of year" (0-365 atau 0-366 untuk tahun kabisat).
 *
 * Cara kerja: hitung milidetik dari awal tahun ke sekarang,
 * lalu bagi dengan jumlah ms per hari (86400000 = 24*60*60*1000).
 */
export function todayIndex(): number {
  const now = new Date();
  // Date(year, 0, 0) = 31 Desember tahun sebelumnya (trick JavaScript)
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}
