// =============================================================================
// FILE: src/components/ui/HeroHeader.tsx
// =============================================================================
//
// HERO HEADER — header navy melengkung dengan animasi
// =====================================================
//
// Apa fungsi komponen ini?
// ------------------------
// Header dekoratif yang muncul di atas TIAP layar utama. Berisi:
// - Background navy dengan gradient
// - Bola kuning & cyan dekoratif yang melayang (animasi)
// - Tombol back (kalau ada)
// - Eyebrow text (label kecil di atas, contoh "INTEGRAL NUMERIK")
// - Title besar dengan animasi muncul dari bawah
// - Subtitle (deskripsi)
// - Curve melengkung di bawah header
// - Slot `children` untuk konten extra (misal: KPI strip)
//
// Kenapa pakai ini di tiap layar?
// -------------------------------
// Konsistensi visual. User tahu "ini halaman utama" dari hero yang sama
// gayanya di mana-mana. Mirip iOS large title, tapi lebih playful.
//
// Cara pakai:
//   <HeroHeader
//     eyebrow="INTEGRAL NUMERIK"
//     title="Hi, Numerik 👋"
//     subtitle="Mari belajar metode numerik!"
//     onBack={() => router.back()}
//   />
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,        // ulangi animasi terus-menerus
  withTiming,        // animasi linear/eased
  Easing,            // kurva animasi (sin, cubic, dll.)
  FadeInDown,        // entrance animation: fade + dari bawah
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, Typography } from '../../theme';

interface HeroHeaderProps {
  /** Label kecil di atas (uppercase, biasanya nama section) */
  eyebrow?: string;
  /** Judul utama besar */
  title: string;
  /** Deskripsi singkat di bawah title */
  subtitle?: string;
  /** Callback untuk tombol back */
  onBack?: () => void;
  /** Slot kiri atas (misal: logo brand) */
  left?: React.ReactNode;
  /** Slot kanan atas (misal: tombol settings) */
  right?: React.ReactNode;
  /** Tinggi hero (default 220) */
  height?: number;
  /** Tampilkan bola kuning + cyan animated (default true) */
  decorations?: boolean;
  /** Konten tambahan di dalam hero (misal: KPI strip) */
  children?: React.ReactNode;
  /** Style tambahan */
  style?: StyleProp<ViewStyle>;
  /** Override warna background hero */
  backgroundColor?: string;
  /** Tampilkan top bar dengan icon (default false) */
  showTopBar?: boolean;
  /** Tampilkan tombol back (default true kalau ada onBack) */
  showBackButton?: boolean;
  /** Mode compact - mengurangi jarak antara logo dan teks (default false) */
  compact?: boolean;
  /** Header inline mode - text dan icon di baris yang sama (default false) */
  inlineHeader?: boolean;
}

export function HeroHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  left,
  right,
  height = 220,
  decorations = true,
  children,
  style,
  backgroundColor,
  showTopBar = false,
  showBackButton = true,
  compact = false,
  inlineHeader = false,
}: HeroHeaderProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const bg = backgroundColor ?? colors.primary;

  // ─── ANIMASI BOLA MELAYANG ──────────────────────────────────────────────
  // Dua shared value untuk dua bola yang melayang naik-turun secara
  // independen. Pakai durasi berbeda supaya tidak sinkron (lebih organik).
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);

  React.useEffect(() => {
    // withRepeat: ulangi animasi
    //   parameter 1: animasi (withTiming dari 0 ke 1, durasi 3.2s, easing sin)
    //   parameter 2: -1 = infinite
    //   parameter 3: true = "yoyo" (balik 1→0→1→0...)
    float1.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    // Bola kedua: lebih lambat (4.2s), supaya tidak sinkron dengan yang pertama
    float2.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [float1, float2]);

  // Style untuk bola pertama: gerakan vertikal & horizontal kecil
  const shape1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: -10 + float1.value * 14 },
      { translateX: 4 + float1.value * 6 },
    ],
  }));
  // Style untuk bola kedua: arah berlawanan supaya terlihat dinamis
  const shape2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: 6 - float2.value * 16 },
      { translateX: -8 + float2.value * 8 },
    ],
  }));

  return (
    <View style={[styles.wrap, { height }, style]}>
      {/* ─── Background fill + gradient overlay ─────────────────────── */}
      <View style={[styles.bg, { backgroundColor: bg }]}>
        {/* SVG gradient: lighter di kiri-atas, darker di kanan-bawah */}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#5B6AE0" stopOpacity={0.55} />
              <Stop offset="100%" stopColor="#0F1568" stopOpacity={0.2} />
            </LinearGradient>
          </Defs>
          <Path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#heroGrad)" />
        </Svg>
      </View>

      {/* ─── Bola dekoratif animated ────────────────────────────────── */}
      {decorations && (
        <>
          {/* Bola kuning besar di kanan atas */}
          <Animated.View style={[styles.shape, { right: -28, top: -28 }, shape1Style]}>
            <Svg width={140} height={140}>
              <Circle cx={70} cy={70} r={68} fill={colors.accentYellow} />
            </Svg>
          </Animated.View>
          {/* Bola cyan lebih kecil */}
          <Animated.View style={[styles.shape, { right: 68, top: 24 }, shape2Style]}>
            <Svg width={92} height={92}>
              <Circle cx={46} cy={46} r={44} fill={colors.accentCyan} opacity={0.92} />
            </Svg>
          </Animated.View>
          {/* Titik-titik kecil dekoratif (statik, tidak animasi) */}
          <View style={[styles.dot, { left: 28, top: 80, backgroundColor: 'rgba(255,255,255,0.35)' }]} />
          <View style={[styles.dot, { left: 64, top: 120, width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.5)' }]} />
        </>
      )}

      {/* ─── Curve di tepi bawah hero ───────────────────────────────── */}
      {/* SVG dengan path Q (quadratic bezier) bikin lengkungan halus.
          Diisi dengan warna background, sehingga tampak seperti hero
          melengkung "menggigit" content di bawahnya. */}
      <Svg
        width="100%"
        height={32}
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        style={styles.curve}
      >
        <Path
          d="M0 0 Q50 40 100 0 L100 32 L0 32 Z"
          fill={colors.background}
        />
      </Svg>

      {/* ─── Top bar: tombol back/menu di kiri, slot right di kanan ──── */}
      {(showTopBar || right || left) && !inlineHeader && (
        <View style={styles.topBar}>
          {showBackButton && onBack ? (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={10}
              style={styles.iconBtn}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          ) : left ? (
            left
          ) : (
            <View style={{ width: 40 }} />
          )}
          {/* Slot kanan: kalau ada ditampilkan, kalau tidak tampilkan spacer */}
          {right ?? <View style={{ width: 40 }} />}
        </View>
      )}

      {/* ─── Text content (eyebrow + title + subtitle) ──────────────── */}
      {inlineHeader && right ? (
        /* Mode inline: text di kiri, icon di kanan, satu baris */
        <View style={styles.inlineHeaderWrap}>
          <Animated.View
            entering={FadeInDown.delay(100).springify().damping(18)}
            style={styles.inlineTextWrap}
          >
            {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </Animated.View>
          <View style={styles.inlineRight}>{right}</View>
        </View>
      ) : !inlineHeader && (
        <Animated.View
          entering={FadeInDown.delay(100).springify().damping(18)}
          style={[
            styles.textWrap,
            !showTopBar && styles.textWrapNoBar,
            showTopBar && !showBackButton && styles.textWrapTopBarOnly,
            compact && styles.textWrapCompact,
          ]}
        >
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </Animated.View>
      )}

      {/* ─── Slot children: konten tambahan di dalam hero ───────────── */}
      {children && <View style={styles.children}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',           // potong elemen yang keluar dari area hero
  },
  bg: {
    ...StyleSheet.absoluteFillObject,    // pakai posisi absolute fill
  },
  shape: { position: 'absolute' },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  curve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? Spacing.lg + 24 : insets.top + Spacing.xs + 24,
    paddingBottom: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',  // semi-transparent putih
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  textWrapNoBar: {
    paddingTop: Platform.OS === 'android' ? Spacing.lg + 24 : insets.top + Spacing.xs + 24,
  },
  textWrapTopBarOnly: {
    paddingTop: Platform.OS === 'android' ? 2 : 2,
  },
  inlineHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? 66 : 70,
  },
  inlineTextWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  inlineRight: {
    paddingTop: 4,
  },
  textWrapCompact: {
    paddingTop: Platform.OS === 'android' ? 4 : 4,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,             // huruf-huruf lebih renggang
    textTransform: 'uppercase',     // jadikan UPPERCASE
    marginBottom: 4,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  children: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
});
