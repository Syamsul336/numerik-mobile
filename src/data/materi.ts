// =============================================================================
// FILE: src/data/materi.ts
// =============================================================================
//
// MATERI PEMBELAJARAN — 20 lessons untuk modul belajar
// =====================================================
//
// Apa fungsi file ini?
// --------------------
// Berisi semua KONTEN PEMBELAJARAN yang ditampilkan di MateriListScreen
// dan MateriDetailScreen.
//
// Struktur:
// - 20 materi total, terbagi 3 modul:
//   - Integral (7 materi)
//   - Interpolasi (6 materi)
//   - Geometri (7 materi)
//
// Tiap materi terdiri dari berbagai TIPE SECTION:
// - heading    : sub-judul section
// - paragraph  : teks penjelasan biasa
// - formula    : rumus dalam LaTeX (akan di-render dengan KaTeX)
// - example    : contoh dengan title, teks, dan optional rumus
// - note       : highlight box (info/warning/success)
// - bullets    : daftar bullet points
//
// MateriDetailScreen akan loop sections dan render tiap-tiap tipe dengan
// styling yang sesuai.
//
// Cara menambah materi baru:
// 1. Tambah object baru di array MATERI
// 2. Pastikan ID unik (pakai prefix: i- = integral, n- = interpolation, g- = geometry)
// 3. Susun sections sesuai alur belajar
// 4. Restart app — otomatis muncul di daftar
// =============================================================================

/**
 * Tipe modul yang valid.
 */
export type MateriModule = 'integral' | 'interpolation' | 'geometry';

/**
 * Tipe section — discriminated union, artinya field yang ada beda-beda
 * tergantung `type`. TypeScript akan auto-detect field mana yang valid.
 *
 * Contoh: kalau type='formula', wajib ada `latex`. Kalau type='paragraph',
 * cuma ada `text`.
 */
export type MateriSection =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'formula'; latex: string; caption?: string }
  | { type: 'example'; title: string; text: string; latex?: string }
  | { type: 'note'; tone: 'info' | 'warning' | 'success'; text: string }
  | { type: 'bullets'; items: string[] };

/**
 * Materi — satu materi pembelajaran lengkap.
 */
export interface Materi {
  id: string;                       // ID unik (pakai prefix per modul)
  module: MateriModule;             // termasuk modul mana
  title: string;                    // judul utama
  subtitle: string;                 // subjudul/teaser
  estimatedMinutes: number;         // estimasi waktu baca
  sections: MateriSection[];        // konten lengkap
}

export const MATERI: Materi[] = [
  /* ────────────────────────────────────────────────────────────────────── *
   *                          INTEGRAL NUMERIK                              *
   * ────────────────────────────────────────────────────────────────────── */
  {
    id: 'i-pengantar',
    module: 'integral',
    title: 'Pengantar Integral Numerik',
    subtitle: 'Kenapa kita butuh metode aproksimasi?',
    estimatedMinutes: 5,
    sections: [
      { type: 'paragraph', text: 'Integral tentu menghitung luas di bawah kurva fungsi f(x) pada selang [a, b]. Secara analitik, kita biasanya mencari antiturunan F(x) lalu menghitung F(b) − F(a).' },
      { type: 'formula', latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)' },
      { type: 'heading', text: 'Masalahnya' },
      { type: 'paragraph', text: 'Banyak fungsi tidak punya antiturunan dalam bentuk tertutup. Contoh klasik: e^(-x²), sin(x)/x, atau hasil pengukuran lapangan yang hanya berupa tabel data tanpa rumus eksplisit.' },
      { type: 'paragraph', text: 'Di sinilah integral numerik berperan: kita mengaproksimasi nilai integral dengan menjumlahkan luas bangun-bangun sederhana di bawah kurva.' },
      { type: 'heading', text: 'Tiga Metode Utama' },
      { type: 'bullets', items: [
        'Aturan Trapesium — pakai trapesium lurus, paling sederhana.',
        'Aturan Simpson 1/3 — pakai parabola, lebih akurat untuk fungsi halus.',
        'Romberg — ekstrapolasi Richardson dari trapesium, akurasi sangat tinggi.',
      ] },
      { type: 'note', tone: 'info', text: 'Semakin kecil pias (h kecil = n besar), aproksimasi semakin akurat — tapi waktu komputasi juga bertambah.' },
    ],
  },
  {
    id: 'i-trapesium',
    module: 'integral',
    title: 'Aturan Trapesium',
    subtitle: 'Metode integral numerik paling klasik',
    estimatedMinutes: 7,
    sections: [
      { type: 'paragraph', text: 'Aturan Trapesium membagi selang [a, b] menjadi n bagian sama lebar, lalu menghitung luas tiap pias sebagai trapesium yang menyentuh kurva di kedua simpulnya.' },
      { type: 'heading', text: 'Rumus Tunggal' },
      { type: 'formula', latex: '\\int_a^b f(x)\\,dx \\approx \\frac{b - a}{2}\\bigl(f(a) + f(b)\\bigr)' },
      { type: 'paragraph', text: 'Versi tunggal hanya pakai satu trapesium besar. Tidak akurat untuk fungsi yang melengkung.' },
      { type: 'heading', text: 'Rumus Komposit' },
      { type: 'paragraph', text: 'Versi komposit memecah selang menjadi n pias dengan lebar h = (b−a)/n:' },
      { type: 'formula', latex: '\\int_a^b f(x)\\,dx \\approx \\frac{h}{2}\\Bigl[ f(x_0) + 2\\sum_{i=1}^{n-1} f(x_i) + f(x_n) \\Bigr]' },
      { type: 'note', tone: 'info', text: 'Simpul ujung (x₀, xₙ) berbobot 1, simpul tengah berbobot 2. Total dikalikan h/2.' },
      { type: 'heading', text: 'Akurasi' },
      { type: 'paragraph', text: 'Galat trapesium komposit berorde O(h²). Artinya jika n digandakan (h dibagi 2), galat menyusut sekitar 4× lipat.' },
      { type: 'example', title: 'Contoh', text: 'Hitung ∫₀¹ x² dx dengan n=4.', latex: '\\frac{0.25}{2}\\bigl[0 + 2(0.0625 + 0.25 + 0.5625) + 1\\bigr] = 0.34375' },
      { type: 'paragraph', text: 'Nilai eksaknya 1/3 ≈ 0.3333, jadi galat ≈ 0.01.' },
    ],
  },
  {
    id: 'i-simpson',
    module: 'integral',
    title: 'Aturan Simpson 1/3',
    subtitle: 'Aproksimasi dengan parabola',
    estimatedMinutes: 8,
    sections: [
      { type: 'paragraph', text: 'Aturan Simpson 1/3 mengaproksimasi area di bawah f(x) dengan parabola yang melewati 3 titik berurutan. Karena parabola "menempel" lebih baik ke kurva daripada garis lurus, hasilnya jauh lebih akurat.' },
      { type: 'heading', text: 'Rumus Komposit' },
      { type: 'formula', latex: '\\int_a^b f(x)\\,dx \\approx \\frac{h}{3}\\Bigl[ f(x_0) + 4\\!\\!\\sum_{\\text{ganjil}}\\!\\! f + 2\\!\\!\\sum_{\\text{genap}}\\!\\! f + f(x_n) \\Bigr]' },
      { type: 'note', tone: 'warning', text: 'Syarat: n harus genap. Setiap parabola "memakan" 2 pias sekaligus, jadi jumlah pias total wajib genap.' },
      { type: 'heading', text: 'Bobot' },
      { type: 'bullets', items: [
        'Simpul ujung (x₀, xₙ): bobot 1',
        'Simpul ganjil (x₁, x₃, x₅, …): bobot 4',
        'Simpul genap dalam (x₂, x₄, …): bobot 2',
        'Total dikalikan h/3',
      ] },
      { type: 'heading', text: 'Akurasi Tinggi' },
      { type: 'paragraph', text: 'Galat Simpson berorde O(h⁴). Bandingkan dengan Trapesium yang O(h²): jika n digandakan, galat Simpson berkurang 16× — empat kali lebih cepat dari Trapesium yang hanya 4×.' },
      { type: 'example', title: 'Akurasi Sempurna', text: 'Simpson 1/3 menghasilkan nilai eksak untuk semua polinomial berderajat ≤ 3, bahkan untuk n=2! Karena parabola dapat secara eksak merepresentasikan polinomial kubik.' },
    ],
  },
  {
    id: 'i-romberg',
    module: 'integral',
    title: 'Metode Romberg',
    subtitle: 'Ekstrapolasi Richardson untuk akurasi tinggi',
    estimatedMinutes: 8,
    sections: [
      { type: 'paragraph', text: 'Romberg membangun tabel hasil aproksimasi trapesium pada level h, h/2, h/4, …, lalu menggabungkannya dengan ekstrapolasi Richardson untuk menghapus error orde rendah secara berurutan.' },
      { type: 'heading', text: 'Kolom Pertama: Trapesium Berlipat' },
      { type: 'formula', latex: 'R_{i,0} = \\tfrac{1}{2}\\,R_{i-1,0} + h_i\\!\\!\\sum_{\\text{titik baru}}\\!\\! f(x)' },
      { type: 'paragraph', text: 'R[0][0] adalah trapesium dengan 1 pias. R[1][0] dengan 2 pias. R[2][0] dengan 4 pias. Dan seterusnya.' },
      { type: 'heading', text: 'Ekstrapolasi Richardson' },
      { type: 'formula', latex: 'R_{i,j} = \\frac{4^{j}\\,R_{i,j-1} - R_{i-1,j-1}}{4^{j} - 1}' },
      { type: 'paragraph', text: 'Setiap kolom baru menghapus orde error berikutnya. Diagonal kanan-bawah memberikan aproksimasi paling akurat.' },
      { type: 'note', tone: 'success', text: 'Romberg sangat efisien: 5 level (32 evaluasi fungsi) sering lebih akurat dari Simpson dengan n=100 (101 evaluasi)!' },
      { type: 'heading', text: 'Kapan Cocok?' },
      { type: 'paragraph', text: 'Romberg ideal untuk fungsi yang sangat halus (smooth) di seluruh selang. Untuk fungsi dengan diskontinuitas atau lonjakan tajam, akurasinya tidak sebaik klaim teoretis.' },
    ],
  },
  {
    id: 'i-error',
    module: 'integral',
    title: 'Analisis Error & Konvergensi',
    subtitle: 'Dari mana datang ketidakakuratan?',
    estimatedMinutes: 6,
    sections: [
      { type: 'paragraph', text: 'Setiap metode integral numerik punya dua sumber error: truncation error (dari aproksimasi) dan round-off error (dari pembulatan komputer).' },
      { type: 'heading', text: 'Truncation Error' },
      { type: 'paragraph', text: 'Berapa "jauh" rumus aproksimasi dari nilai eksak. Berkurang saat h mengecil:' },
      { type: 'bullets', items: [
        'Trapesium: ~ −(b−a)·h²·f″(ξ)/12  → orde O(h²)',
        'Simpson 1/3: ~ −(b−a)·h⁴·f⁽⁴⁾(ξ)/180  → orde O(h⁴)',
        'Romberg: orde O(h^(2k+2)) di kolom k',
      ] },
      { type: 'heading', text: 'Round-off Error' },
      { type: 'paragraph', text: 'Setiap operasi floating point punya galat ~10⁻¹⁶. Saat n sangat besar (jutaan), akumulasi galat ini bisa dominan dan justru memburukkan hasil.' },
      { type: 'note', tone: 'warning', text: 'Ada n optimum: terlalu kecil → truncation error besar; terlalu besar → round-off error besar. Untuk Simpson, n optimum biasanya cukup di kisaran 100–1000.' },
      { type: 'heading', text: 'Memeriksa Konvergensi' },
      { type: 'paragraph', text: 'Cara praktis: hitung integral dengan n, lalu 2n. Jika hasilnya sudah cukup dekat (selisih < toleransi), berhenti.' },
    ],
  },
  {
    id: 'i-pilih',
    module: 'integral',
    title: 'Memilih Metode yang Tepat',
    subtitle: 'Trapesium, Simpson, atau Romberg?',
    estimatedMinutes: 5,
    sections: [
      { type: 'heading', text: 'Pakai Trapesium kalau:' },
      { type: 'bullets', items: [
        'Fungsi mungkin tidak halus (banyak titik patah).',
        'Hanya butuh akurasi rendah-sedang.',
        'Mau implementasi paling sederhana.',
        'Data berupa tabel dengan jumlah titik ganjil.',
      ] },
      { type: 'heading', text: 'Pakai Simpson 1/3 kalau:' },
      { type: 'bullets', items: [
        'Fungsi halus (turunan keempat ada dan terbatas).',
        'Butuh akurasi tinggi dengan n moderat.',
        'Punya jumlah subinterval genap.',
      ] },
      { type: 'heading', text: 'Pakai Romberg kalau:' },
      { type: 'bullets', items: [
        'Fungsi sangat halus (analitik).',
        'Butuh presisi sangat tinggi (≥ 8 desimal).',
        'Mau solusi adaptif: stop saat sudah konvergen.',
      ] },
      { type: 'note', tone: 'info', text: 'Saat ragu, mulai dari Simpson 1/3. Itu kompromi terbaik antara kesederhanaan dan akurasi untuk mayoritas kasus.' },
    ],
  },
  {
    id: 'i-aplikasi',
    module: 'integral',
    title: 'Aplikasi Integral Numerik',
    subtitle: 'Bukan sekadar latihan — ini dipakai di mana-mana',
    estimatedMinutes: 6,
    sections: [
      { type: 'heading', text: 'Fisika & Engineering' },
      { type: 'bullets', items: [
        'Hitung kerja: W = ∫ F(x) dx ketika gaya bukan konstan.',
        'Aliran fluida: debit = ∫ v(r) · 2πr dr.',
        'Pusat massa benda dengan kepadatan tidak seragam.',
        'Energi sinyal listrik: E = ∫ V(t) · I(t) dt.',
      ] },
      { type: 'heading', text: 'Statistika & Probabilitas' },
      { type: 'bullets', items: [
        'Hitung peluang dari distribusi kontinu (normal, gamma, beta).',
        'Ekspektasi: E[X] = ∫ x · f(x) dx.',
        'Kumulatif distribusi (CDF).',
      ] },
      { type: 'heading', text: 'Komputer & Grafis' },
      { type: 'bullets', items: [
        'Rendering: integral pencahayaan global (Monte Carlo).',
        'Audio: konvolusi sinyal = bentuk integral.',
        'Machine learning: hitung loss yang berbentuk integral.',
      ] },
      { type: 'note', tone: 'success', text: 'Hampir setiap kali komputer menghitung sesuatu yang "smooth" dari data terdiskretisasi — di balik layar ada integral numerik.' },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────── *
   *                            INTERPOLASI                                 *
   * ────────────────────────────────────────────────────────────────────── */
  {
    id: 'n-pengantar',
    module: 'interpolation',
    title: 'Pengantar Interpolasi',
    subtitle: 'Mencari nilai di antara titik data',
    estimatedMinutes: 5,
    sections: [
      { type: 'paragraph', text: 'Interpolasi adalah proses mengonstruksi fungsi (biasanya polinomial) yang melewati sekumpulan titik data, lalu menggunakannya untuk menebak nilai di antara titik-titik tersebut.' },
      { type: 'heading', text: 'Teorema Dasar' },
      { type: 'paragraph', text: 'Untuk n+1 titik dengan absis berbeda, terdapat tepat satu polinomial berderajat ≤ n yang melewati semuanya.' },
      { type: 'formula', latex: 'P(x_i) = y_i, \\quad i = 0, 1, \\ldots, n' },
      { type: 'heading', text: 'Interpolasi vs Ekstrapolasi' },
      { type: 'bullets', items: [
        'Interpolasi: menebak nilai di dalam rentang data → relatif aman.',
        'Ekstrapolasi: menebak di luar rentang → sangat berisiko.',
      ] },
      { type: 'note', tone: 'warning', text: 'Walaupun rumus polinomial bisa diterapkan ke nilai x manapun, hasilnya hanya bisa dipercaya di dalam atau dekat rentang data.' },
      { type: 'heading', text: 'Dua Metode Klasik' },
      { type: 'bullets', items: [
        'Lagrange — formulasi langsung dengan basis Lᵢ(x).',
        'Newton Divided Difference — bentuk rekursif berbasis tabel.',
      ] },
    ],
  },
  {
    id: 'n-lagrange',
    module: 'interpolation',
    title: 'Interpolasi Lagrange',
    subtitle: 'Polinomial dari basis kardinal',
    estimatedMinutes: 7,
    sections: [
      { type: 'paragraph', text: 'Lagrange membangun polinomial sebagai jumlah berbobot dari fungsi basis Lᵢ(x). Setiap basis bernilai 1 di simpul ke-i dan 0 di simpul lainnya.' },
      { type: 'formula', latex: 'L_i(x) = \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}' },
      { type: 'heading', text: 'Polinomial Lengkap' },
      { type: 'formula', latex: 'P(x) = \\sum_{i=0}^{n} y_i \\, L_i(x)' },
      { type: 'paragraph', text: 'Karena Lᵢ(xᵢ) = 1 dan Lᵢ(xⱼ) = 0 untuk j ≠ i, otomatis P(xᵢ) = yᵢ untuk semua i.' },
      { type: 'heading', text: 'Kelebihan' },
      { type: 'bullets', items: [
        'Rumus eksplisit — langsung tahu polinomialnya tanpa iterasi.',
        'Mudah dipahami secara konseptual.',
      ] },
      { type: 'heading', text: 'Kekurangan' },
      { type: 'bullets', items: [
        'Jika titik baru ditambahkan, semua basis harus dihitung ulang.',
        'Untuk evaluasi banyak nilai x, kurang efisien dari Newton.',
      ] },
      { type: 'example', title: 'Contoh Mini', text: '3 titik: (0,1), (1,3), (2,2).', latex: 'P(x) = 1\\cdot\\frac{(x-1)(x-2)}{(0-1)(0-2)} + 3\\cdot\\frac{(x-0)(x-2)}{(1-0)(1-2)} + 2\\cdot\\frac{(x-0)(x-1)}{(2-0)(2-1)}' },
    ],
  },
  {
    id: 'n-newton',
    module: 'interpolation',
    title: "Newton's Divided Difference",
    subtitle: 'Tabel beda terbagi yang elegan',
    estimatedMinutes: 8,
    sections: [
      { type: 'paragraph', text: 'Newton membangun polinomial yang sama dengan Lagrange, tapi melalui tabel beda terbagi (divided differences) yang sangat efisien jika data bertambah seiring waktu.' },
      { type: 'heading', text: 'Beda Terbagi' },
      { type: 'formula', latex: 'f[x_i] = y_i' },
      { type: 'formula', latex: 'f[x_i, x_{i+1}, \\ldots, x_{i+k}] = \\frac{f[x_{i+1}, \\ldots, x_{i+k}] - f[x_i, \\ldots, x_{i+k-1}]}{x_{i+k} - x_i}' },
      { type: 'heading', text: 'Polinomial Newton' },
      { type: 'formula', latex: 'P(x) = f[x_0] + \\sum_{k=1}^{n} f[x_0, x_1, \\ldots, x_k]\\,(x - x_0)(x - x_1)\\cdots(x - x_{k-1})' },
      { type: 'note', tone: 'info', text: 'Koefisien-koefisien yang dipakai adalah elemen di sepanjang diagonal atas tabel beda terbagi.' },
      { type: 'heading', text: 'Keunggulan' },
      { type: 'bullets', items: [
        'Tambah titik baru? Cukup tambahkan satu baris ke tabel — koefisien lama tetap valid.',
        'Evaluasi via skema Horner-like sangat cepat.',
        'Cocok untuk metode adaptif yang menambah titik bertahap.',
      ] },
    ],
  },
  {
    id: 'n-runge',
    module: 'interpolation',
    title: 'Fenomena Runge',
    subtitle: 'Kenapa derajat tinggi tidak selalu lebih baik',
    estimatedMinutes: 6,
    sections: [
      { type: 'paragraph', text: 'Pada 1901, Carl Runge menemukan bahwa interpolasi polinomial derajat tinggi dengan titik-titik berjarak sama bisa berosilasi liar — terutama dekat tepi interval.' },
      { type: 'example', title: 'Fungsi Runge', text: 'Coba interpolasi 1/(1 + 25x²) di [-1, 1] dengan 11 titik berjarak sama. Polinomial derajat 10 yang dihasilkan akan berosilasi sangat besar di tepi.', latex: 'f(x) = \\frac{1}{1 + 25x^2}' },
      { type: 'heading', text: 'Penyebab' },
      { type: 'paragraph', text: 'Polinomial berderajat tinggi cenderung "membungkuk" untuk melewati semua titik. Pada titik berjarak sama, bungkukan ini terbesar di dekat tepi.' },
      { type: 'heading', text: 'Solusi' },
      { type: 'bullets', items: [
        'Pakai titik Chebyshev — lebih rapat di tepi, mengurangi osilasi.',
        'Gunakan spline (banyak polinomial derajat rendah disambung).',
        'Batasi derajat polinomial — pakai least-squares jika titik banyak.',
      ] },
      { type: 'note', tone: 'warning', text: 'Interpolasi 100 titik dengan polinomial derajat 99 hampir selalu ide buruk. Pakai spline atau regresi.' },
    ],
  },
  {
    id: 'n-spline',
    module: 'interpolation',
    title: 'Interpolasi Spline (Overview)',
    subtitle: 'Banyak potongan polinomial yang mulus',
    estimatedMinutes: 5,
    sections: [
      { type: 'paragraph', text: 'Spline adalah pendekatan modern: alih-alih satu polinomial besar, gunakan banyak polinomial kecil (biasanya derajat 3, "cubic spline") yang disambung di simpul-simpul agar tetap mulus.' },
      { type: 'heading', text: 'Cubic Spline' },
      { type: 'paragraph', text: 'Antara dua simpul berurutan, kita pakai polinomial derajat 3:' },
      { type: 'formula', latex: 'S_i(x) = a_i + b_i(x - x_i) + c_i(x - x_i)^2 + d_i(x - x_i)^3' },
      { type: 'heading', text: 'Syarat Kemulusan' },
      { type: 'bullets', items: [
        'Spline melewati setiap simpul.',
        'Turunan pertama kontinu di tiap simpul (tidak ada patahan).',
        'Turunan kedua juga kontinu (tidak ada perubahan kelengkungan tiba-tiba).',
      ] },
      { type: 'note', tone: 'success', text: 'Cubic spline banyak dipakai di komputer grafis (kurva Bezier modifikasi), CAD, dan path animasi karena visualisasinya sangat halus.' },
    ],
  },
  {
    id: 'n-aplikasi',
    module: 'interpolation',
    title: 'Aplikasi Interpolasi',
    subtitle: 'Lebih sering dipakai daripada yang kamu kira',
    estimatedMinutes: 5,
    sections: [
      { type: 'heading', text: 'Komputer Grafis' },
      { type: 'bullets', items: [
        'Animasi keyframe: interpolasi posisi/rotasi antara frame kunci.',
        'Upscaling gambar: interpolasi piksel saat memperbesar.',
        'Kurva Bezier untuk path & font vektor.',
      ] },
      { type: 'heading', text: 'Sains Data' },
      { type: 'bullets', items: [
        'Smoothing data sensor (sebelum analisis lanjut).',
        'Resampling time series ke grid waktu seragam.',
        'Mengisi data yang hilang dalam time series.',
      ] },
      { type: 'heading', text: 'Numerik Lainnya' },
      { type: 'bullets', items: [
        'Newton-Cotes untuk integral numerik = aturan integrasi yang dibangun dari interpolasi.',
        'Persamaan diferensial: Adams-Bashforth menggunakan polinomial interpolasi.',
        'Optimisasi: secant method memakai interpolasi linear.',
      ] },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────── *
   *                           BANGUN DATAR                                 *
   * ────────────────────────────────────────────────────────────────────── */
  {
    id: 'g-pengantar',
    module: 'geometry',
    title: 'Pengantar Geometri Datar',
    subtitle: 'Konsep luas, keliling, dan satuannya',
    estimatedMinutes: 4,
    sections: [
      { type: 'paragraph', text: 'Geometri datar mempelajari bangun dua dimensi: persegi, segitiga, lingkaran, dan seterusnya. Dua kuantitas utama: luas (area di dalam) dan keliling (panjang batas).' },
      { type: 'heading', text: 'Luas vs Keliling' },
      { type: 'bullets', items: [
        'Luas — ukuran "cakupan" bidang. Satuannya: meter² (m²), cm², dst.',
        'Keliling — total panjang sisi/lengkungan. Satuannya: meter (m), cm, dst.',
      ] },
      { type: 'heading', text: 'Hubungan dengan Numerik' },
      { type: 'paragraph', text: 'Aturan Trapesium pada integral numerik secara harfiah menjumlahkan luas trapesium! Banyak teknik integral klasik dapat dilihat sebagai dekomposisi geometri.' },
      { type: 'note', tone: 'info', text: 'Memahami rumus luas dasar adalah fondasi untuk memahami metode numerik lanjutan.' },
    ],
  },
  {
    id: 'g-persegi',
    module: 'geometry',
    title: 'Persegi & Persegi Panjang',
    subtitle: 'Bangun datar paling sederhana',
    estimatedMinutes: 4,
    sections: [
      { type: 'heading', text: 'Persegi' },
      { type: 'paragraph', text: 'Persegi punya 4 sisi sama panjang dan 4 sudut siku-siku.' },
      { type: 'formula', latex: 'L = s^{2}, \\quad K = 4s' },
      { type: 'heading', text: 'Persegi Panjang' },
      { type: 'paragraph', text: 'Persegi panjang punya 2 pasang sisi yang sama panjang.' },
      { type: 'formula', latex: 'L = p \\cdot l, \\quad K = 2(p + l)' },
      { type: 'example', title: 'Contoh', text: 'Persegi panjang 10 × 6.', latex: 'L = 10 \\cdot 6 = 60, \\quad K = 2(10 + 6) = 32' },
      { type: 'heading', text: 'Sifat Khusus' },
      { type: 'bullets', items: [
        'Diagonal persegi = s√2.',
        'Diagonal persegi panjang = √(p² + l²).',
        'Kedua diagonal sama panjang dan saling memotong di tengah.',
      ] },
    ],
  },
  {
    id: 'g-segitiga',
    module: 'geometry',
    title: 'Segitiga',
    subtitle: 'Tiga sisi, banyak rumus',
    estimatedMinutes: 5,
    sections: [
      { type: 'heading', text: 'Rumus Dasar' },
      { type: 'formula', latex: 'L = \\tfrac{1}{2}\\,a\\,t' },
      { type: 'paragraph', text: 'Dengan a = alas, t = tinggi tegak lurus terhadap alas.' },
      { type: 'heading', text: 'Rumus Heron' },
      { type: 'paragraph', text: 'Jika tahu panjang ketiga sisi (a, b, c) tapi bukan tinggi:' },
      { type: 'formula', latex: 's = \\frac{a + b + c}{2}, \\quad L = \\sqrt{s(s-a)(s-b)(s-c)}' },
      { type: 'heading', text: 'Jenis Segitiga' },
      { type: 'bullets', items: [
        'Sama sisi: ketiga sisi sama, ketiga sudut 60°.',
        'Sama kaki: dua sisi sama, dua sudut sama.',
        'Siku-siku: satu sudut 90° → berlaku Pythagoras: a² + b² = c².',
        'Sembarang: tidak punya sifat khusus.',
      ] },
      { type: 'example', title: 'Pythagoras', text: 'Segitiga siku-siku dengan kaki 3 dan 4 punya hipotenusa √(9+16) = 5.', latex: 'c = \\sqrt{a^2 + b^2} = \\sqrt{9 + 16} = 5' },
    ],
  },
  {
    id: 'g-lingkaran',
    module: 'geometry',
    title: 'Lingkaran',
    subtitle: 'Bangun datar paling efisien',
    estimatedMinutes: 5,
    sections: [
      { type: 'heading', text: 'Rumus Utama' },
      { type: 'formula', latex: 'L = \\pi r^{2}, \\quad K = 2\\pi r' },
      { type: 'paragraph', text: 'Dengan r = jari-jari, dan π ≈ 3.14159… adalah konstanta yang sama untuk semua lingkaran.' },
      { type: 'heading', text: 'Asal-usul π' },
      { type: 'paragraph', text: 'π adalah perbandingan keliling lingkaran terhadap diameternya. Diameter d = 2r, jadi K = π·d = 2πr.' },
      { type: 'heading', text: 'Sifat Optimal' },
      { type: 'note', tone: 'success', text: 'Dari semua bangun datar dengan keliling K tertentu, lingkaran selalu memberikan luas terbesar. Inilah kenapa gelembung sabun selalu bulat — alam meminimumkan tegangan permukaan.' },
      { type: 'heading', text: 'Hubungan dengan Integral' },
      { type: 'paragraph', text: 'Luas lingkaran dapat diturunkan dari integral: ∫₀^(2π) ∫₀^r ρ dρ dθ = πr². Jadi rumus L = πr² sebenarnya adalah hasil integral!' },
    ],
  },
  {
    id: 'g-trapesium',
    module: 'geometry',
    title: 'Trapesium',
    subtitle: 'Jembatan ke integral numerik',
    estimatedMinutes: 4,
    sections: [
      { type: 'paragraph', text: 'Trapesium adalah segiempat dengan tepat satu pasang sisi sejajar (disebut sisi atas dan sisi bawah).' },
      { type: 'heading', text: 'Rumus Luas' },
      { type: 'formula', latex: 'L = \\tfrac{1}{2}(a + b)\\,t' },
      { type: 'paragraph', text: 'Dengan a, b = panjang sisi sejajar dan t = tinggi (jarak tegak lurus antara dua sisi).' },
      { type: 'heading', text: 'Intuisi' },
      { type: 'paragraph', text: 'Luas trapesium = rata-rata sisi sejajar × tinggi. Bayangkan menggeser dan memutar trapesium sehingga membentuk persegi panjang dengan tinggi yang sama dan lebar = (a+b)/2.' },
      { type: 'note', tone: 'info', text: 'Aturan Trapesium pada integral numerik secara harfiah memakai rumus ini! Setiap pias di bawah kurva diaproksimasi sebagai trapesium dengan sisi a = f(xᵢ) dan b = f(xᵢ₊₁).' },
      { type: 'heading', text: 'Trapesium Sama Kaki' },
      { type: 'paragraph', text: 'Jika kedua sisi non-sejajar sama panjang, trapesium menjadi sama kaki — punya sumbu simetri tegak.' },
    ],
  },
  {
    id: 'g-jajar',
    module: 'geometry',
    title: 'Jajar Genjang',
    subtitle: 'Persegi panjang yang dimiringkan',
    estimatedMinutes: 4,
    sections: [
      { type: 'paragraph', text: 'Jajar genjang adalah segiempat dengan dua pasang sisi yang sejajar dan sama panjang.' },
      { type: 'heading', text: 'Rumus Luas' },
      { type: 'formula', latex: 'L = a \\cdot t' },
      { type: 'paragraph', text: 'Dengan a = panjang alas (salah satu pasangan sisi sejajar) dan t = tinggi tegak lurus terhadap alas tersebut.' },
      { type: 'heading', text: 'Kenapa Mirip Persegi Panjang?' },
      { type: 'paragraph', text: 'Bayangkan memotong segitiga dari satu sisi jajar genjang dan menggesernya ke sisi lain. Hasilnya: persegi panjang dengan ukuran a × t. Itulah kenapa rumusnya identik dengan persegi panjang.' },
      { type: 'heading', text: 'Sifat' },
      { type: 'bullets', items: [
        'Sisi-sisi yang berhadapan sama panjang.',
        'Sudut-sudut yang berhadapan sama besar.',
        'Diagonal saling memotong di tengah.',
        'Persegi & belah ketupat & persegi panjang adalah kasus khusus jajar genjang.',
      ] },
    ],
  },
  {
    id: 'g-aplikasi',
    module: 'geometry',
    title: 'Aplikasi Geometri Datar',
    subtitle: 'Dari arsitektur ke komputer grafis',
    estimatedMinutes: 4,
    sections: [
      { type: 'heading', text: 'Arsitektur & Konstruksi' },
      { type: 'bullets', items: [
        'Hitung luas lantai untuk material (lantai, cat dinding, atap).',
        'Trapesium untuk desain atap dan cerobong.',
        'Lingkaran & busur untuk dome dan jendela melengkung.',
      ] },
      { type: 'heading', text: 'Komputer Grafis' },
      { type: 'bullets', items: [
        'Polygon (segitiga & quad) sebagai unit dasar 3D rendering.',
        'Triangulasi untuk meshing dan finite element analysis.',
        'Algoritma collision detection untuk game.',
      ] },
      { type: 'heading', text: 'Engineering' },
      { type: 'bullets', items: [
        'Penampang balok (persegi panjang) untuk hitung momen inersia.',
        'Lingkaran untuk penampang pipa dan poros.',
        'Trapesium untuk penampang saluran irigasi (lebih stabil dari persegi).',
      ] },
      { type: 'note', tone: 'success', text: 'Geometri sederhana adalah bahasa universal antara matematika, sains, dan rekayasa.' },
    ],
  },
];

/**
 * Helper: ambil semua materi dari satu modul.
 * Pakai untuk render section-section di MateriListScreen.
 *
 * Contoh: materiByModule('integral') → return 7 materi integral.
 */
export function materiByModule(module: MateriModule): Materi[] {
  return MATERI.filter((m) => m.module === module);
}

/**
 * Helper: cari satu materi berdasarkan ID.
 *
 * @returns Materi kalau ditemukan, undefined kalau tidak.
 *          undefined dipakai oleh MateriDetailScreen untuk show error.
 */
export function getMateri(id: string): Materi | undefined {
  return MATERI.find((m) => m.id === id);
}
