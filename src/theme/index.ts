// =============================================================================
// FILE: src/theme/index.ts
// =============================================================================
//
// THEME — pusat warna, ukuran, font, dan shadow seluruh aplikasi
// ==============================================================
//
// Kenapa ada file ini?
// --------------------
// Daripada kita hardcode `color: '#1E2A9E'` di banyak file, kita simpan
// SEMUA warna di sini. Manfaatnya:
//
// 1. KONSISTEN — semua tombol primary punya warna yang sama persis.
// 2. MUDAH GANTI TEMA — mau ganti dari navy ke hijau? Cuma edit 1 file.
// 3. DUKUNG DARK MODE — ada palette terpisah untuk light & dark.
// 4. VOCABULARY — `colors.primary` lebih mudah dibaca daripada `#1E2A9E`.
//
// Apa yang ada di file ini?
// -------------------------
// - Colors      : object berisi 2 palette (light & dark) dengan banyak warna
// - useTheme()  : hook React untuk auto-pilih palette sesuai mode OS user
// - Spacing     : ukuran jarak (margin/padding) baku
// - Radius      : ukuran corner radius baku
// - Typography  : preset font size + weight
// - Shadow      : preset bayangan untuk Card
//
// Cara pakai:
//   import { useTheme, Spacing, Radius } from '...';
//   function MyComp() {
//     const colors = useTheme();
//     return <View style={{ backgroundColor: colors.primary, padding: Spacing.md }} />;
//   }
// =============================================================================

/**
 * Palette warna lengkap untuk light & dark mode.
 *
 * Aplikasi punya brand color "navy" (#1E2A9E). Tema dibangun dari sana
 * dengan banyak shades untuk berbagai konteks.
 */
export const Colors = {
  // ────── LIGHT MODE ──────────────────────────────────────────────────────
  light: {
    // Brand — navy palette
    primary: '#1E2A9E',         // warna brand utama (deep navy)
    primaryLight: '#3B4BC9',    // lebih terang untuk gradient/hover
    primaryLighter: '#5B6AE0',  // paling terang
    primarySoft: '#E8EAFF',     // background lembut (untuk badge/pill)
    primaryWash: '#F4F5FB',     // background terlembut (almost-white)
    primaryDark: '#0F1568',     // gelap untuk shadow/depth

    // Accent — dari template CV Builder
    accentYellow: '#FFD93D',    // kuning ceria (untuk decorative shape)
    accentCyan: '#4DB8FF',      // cyan (kombinasi dengan kuning)

    // Semantic — dari Dashboard template
    success: '#22C55E',         // hijau (sukses, hasil akhir)
    successSoft: '#DCFCE7',     // hijau lembut (background success)
    error: '#EF4444',           // merah (error, hapus)
    errorSoft: '#FEE2E2',       // merah lembut
    warning: '#F59E0B',         // oranye (peringatan)
    warningSoft: '#FEF3C7',     // oranye lembut

    // Pastel — untuk kartu modul (peach/mint/lavender/sky/rose/lemon)
    // Tiap pastel punya pasangan "Ink" (warna teks/icon yang kontras)
    pastelPeach: '#FFE5D4',
    pastelPeachInk: '#EA580C',
    pastelMint: '#D1FADF',
    pastelMintInk: '#16A34A',
    pastelLavender: '#E0E7FF',
    pastelLavenderInk: '#4F46E5',
    pastelSky: '#DBEAFE',
    pastelSkyInk: '#0284C7',
    pastelRose: '#FCE7F3',
    pastelRoseInk: '#DB2777',
    pastelLemon: '#FEF3C7',
    pastelLemonInk: '#CA8A04',

    // Neutral
    background: '#F4F5FB',           // background utama (almost-white)
    backgroundAlt: '#FFFFFF',        // alternatif background
    card: '#FFFFFF',                 // background kartu
    cardElevated: '#FFFFFF',         // kartu dengan elevation
    text: '#0F172A',                 // teks utama (hampir hitam)
    textOnNavy: '#FFFFFF',           // teks di atas background navy
    textOnNavySoft: 'rgba(255,255,255,0.78)', // teks navy soft
    textSecondary: '#64748B',        // teks sekunder (deskripsi)
    textTertiary: '#94A3B8',         // teks tersier (placeholder)
    border: '#E5E7F2',               // border standard
    borderLight: '#F1F2FA',          // border tipis
    divider: '#EEF0F8',              // garis pemisah

    // Overlay (untuk efek transparan di atas warna)
    navyOverlay: 'rgba(30,42,158,0.06)',
    navyOverlayStrong: 'rgba(30,42,158,0.12)',
  },

  // ────── DARK MODE ───────────────────────────────────────────────────────
  // Versi dark mode — di-invert untuk readability di tempat gelap.
  dark: {
    primary: '#5B6AE0',
    primaryLight: '#7C8BFF',
    primaryLighter: '#9DA9FF',
    primarySoft: '#1E2A9E',
    primaryWash: '#151A4D',
    primaryDark: '#0A0E3F',

    accentYellow: '#FFD93D',
    accentCyan: '#4DB8FF',

    success: '#34D399',
    successSoft: 'rgba(52,211,153,0.15)',
    error: '#F87171',
    errorSoft: 'rgba(248,113,113,0.15)',
    warning: '#FBBF24',
    warningSoft: 'rgba(251,191,36,0.15)',

    pastelPeach: 'rgba(255,229,212,0.15)',
    pastelPeachInk: '#FDBA74',
    pastelMint: 'rgba(209,250,223,0.15)',
    pastelMintInk: '#86EFAC',
    pastelLavender: 'rgba(224,231,255,0.15)',
    pastelLavenderInk: '#A5B4FC',
    pastelSky: 'rgba(219,234,254,0.15)',
    pastelSkyInk: '#7DD3FC',
    pastelRose: 'rgba(252,231,243,0.15)',
    pastelRoseInk: '#F9A8D4',
    pastelLemon: 'rgba(254,243,199,0.15)',
    pastelLemonInk: '#FDE047',

    background: '#0A0E2A',
    backgroundAlt: '#11163A',
    card: '#161B45',
    cardElevated: '#1B2156',
    text: '#F1F5F9',
    textOnNavy: '#FFFFFF',
    textOnNavySoft: 'rgba(255,255,255,0.78)',
    textSecondary: '#9CA3C9',
    textTertiary: '#6B7AA8',
    border: '#252B5C',
    borderLight: '#1B2156',
    divider: '#252B5C',

    navyOverlay: 'rgba(91,106,224,0.10)',
    navyOverlayStrong: 'rgba(91,106,224,0.20)',
  },
};

// Tipe palette berdasarkan struktur Colors.light
// (TypeScript trick: typeof + literal untuk auto-extract tipe)
export type ThemeColors = typeof Colors.light;

/**
 * Hook untuk dapat warna tema aplikasi.
 *
 * Aplikasi ini selalu menggunakan tema terang (light mode).
 * Tidak mengikuti setting tema HP.
 */
export function useTheme(): ThemeColors {
  return Colors.light;
}

/**
 * Spacing — ukuran margin/padding standar.
 *
 * Ide: pakai spacing yang konsisten daripada angka sembarangan.
 * Misalnya: padding card selalu Spacing.lg (16px), bukan kadang 14, kadang 18.
 */
export const Spacing = {
  xs: 4,    // sangat kecil
  sm: 8,    // kecil
  md: 12,   // sedang
  lg: 16,   // besar (default padding card)
  xl: 24,   // ekstra besar (jarak antar section)
  xxl: 32,  // sangat besar
  xxxl: 48, // jumbo (untuk hero spacing)
};

/**
 * Radius — corner radius standar untuk berbagai konteks.
 */
export const Radius = {
  xs: 6,    // input kecil
  sm: 10,   // tombol kecil
  md: 14,   // tombol biasa
  lg: 20,   // card biasa
  xl: 28,   // card besar (modal, hero)
  xxl: 36,  // card jumbo
  pill: 999, // pill (full rounded — untuk badge/chip)
};

/**
 * Typography — preset gaya teks.
 *
 * `as const` di akhir = TypeScript treats values as literal types
 * (bukan generic string). Jadi fontWeight: '800' bukan 'string biasa'.
 */
export const Typography = {
  displayLg: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -0.5 },
  display: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  h1: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.2 },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 17, fontWeight: '700' as const },
  h4: { fontSize: 15, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodyBold: { fontSize: 14, fontWeight: '600' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
  smallBold: { fontSize: 12, fontWeight: '600' as const },
  caption: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.4 },
  micro: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.6 },
};

/**
 * Shadow — preset bayangan untuk depth.
 *
 * Tiap level bayangan punya warna, opacity, blur radius, offset, dan
 * elevation (untuk Android — yang pakai sistem shadow berbeda dari iOS).
 *
 * Pakai:
 *   import { Shadow } from '...';
 *   <View style={[styles.card, Shadow.md]} />
 */
export const Shadow = {
  // Bayangan halus — untuk card biasa
  sm: {
    shadowColor: '#1E2A9E',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // Bayangan sedang — untuk button penting / highlighted card
  md: {
    shadowColor: '#1E2A9E',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  // Bayangan besar — untuk modal / floating card / hero
  lg: {
    shadowColor: '#1E2A9E',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};
