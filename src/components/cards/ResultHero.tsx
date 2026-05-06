// =============================================================================
// FILE: src/components/cards/ResultHero.tsx
// =============================================================================
//
// RESULT HERO — panel hasil besar dengan navy gradient
// =====================================================
//
// Apa fungsi komponen ini?
// ------------------------
// Panel BESAR & MENONJOL untuk menampilkan hasil akhir perhitungan.
// Berisi:
// - Background gradient navy
// - Bola kuning + cyan dekoratif
// - Tag "Selesai" + tag metode
// - Problem statement (rumus integral) di kotak transparan
// - Label "NILAI INTEGRAL" (kecil, uppercase)
// - VALUE BESAR (38pt, bold) — jadi mata user otomatis tertuju ke sini
// - Optional stats grid di bawah (n, h, dll.)
//
// Dipakai di IntegralScreen, InterpolationScreen, GeometryScreen.
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTheme, Spacing, Radius, Shadow } from '../../theme';
import { MathView } from '../math/MathView';

interface ResultHeroProps {
  label: string;                                          // "Nilai Integral"
  value: string;                                          // "0.335"
  problemLatex?: string;                                  // rumus LaTeX
  method?: string;                                        // "Trapezoidal"
  stats?: Array<{ label: string; value: string }>;        // stats grid optional
}

export function ResultHero({ label, value, problemLatex, method, stats }: ResultHeroProps) {
  const colors = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(380)} style={[styles.wrap, Shadow.md]}>
      {/* ─── Background gradient + bola dekoratif ──────────────────── */}
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <Defs>
          <LinearGradient id="resHero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#3B4BC9" />
            <Stop offset="60%" stopColor="#1E2A9E" />
            <Stop offset="100%" stopColor="#0F1568" />
          </LinearGradient>
        </Defs>
        <Path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#resHero)" />
        {/* Bola dekoratif: kuning besar kanan-atas, cyan kecil, navy bawah */}
        <Circle cx={88} cy={14} r={10} fill="#FFD93D" opacity={0.85} />
        <Circle cx={75} cy={26} r={5} fill="#4DB8FF" opacity={0.85} />
        <Circle cx={6} cy={92} r={14} fill="#5B6AE0" opacity={0.5} />
      </Svg>

      <View style={{ padding: Spacing.lg }}>
        {/* ─── Tag "Selesai" + tag metode ────────────────────────── */}
        <View style={styles.topRow}>
          <View style={styles.tag}>
            <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
            <Text style={styles.tagText}>Selesai</Text>
          </View>
          {method && (
            <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Ionicons name="flash" size={12} color="#FFD93D" />
              <Text style={styles.tagText}>{method}</Text>
            </View>
          )}
        </View>

        {/* ─── Problem statement (rumus integral) ────────────────── */}
        {/* Render LaTeX dengan MathView (warna putih) */}
        {problemLatex && (
          <View style={styles.problemBox}>
            <MathView
              latex={problemLatex}
              color="#FFFFFF"
              backgroundColor="transparent"
              fontSize={18}
              minHeight={40}
            />
          </View>
        )}

        {/* ─── Label kecil + value BESAR ─────────────────────────── */}
        <Text style={styles.label}>{label}</Text>

        {/* Animated value: muncul dengan zoom + spring */}
        <Animated.Text
          entering={ZoomIn.delay(120).springify().damping(14)}
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit          // auto-shrink kalau angka panjang
        >
          {value}
        </Animated.Text>

        {/* ─── Stats grid optional (n, h, dll.) ──────────────────── */}
        {stats && stats.length > 0 && (
          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
                <Text style={styles.statValue} numberOfLines={1}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  topRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.md },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  problemBox: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  label: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    // tabular-nums = semua digit punya lebar sama (rapih untuk angka)
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});
