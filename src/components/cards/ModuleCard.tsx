// =============================================================================
// FILE: src/components/cards/ModuleCard.tsx
// =============================================================================
//
// MODULE CARD — kartu kategori dengan warna pastel
// =================================================
//
// Apa fungsi komponen ini?
// ------------------------
// Kartu persegi besar dengan warna pastel yang menampilkan satu modul
// belajar (Integral, Interpolasi, Geometri, AI). Berisi:
// - Background pastel (peach/mint/lavender/sky)
// - Pola titik-titik dekoratif di pojok kanan atas
// - Icon di kotak putih semi-transparan
// - Title + caption opsional di bawah
//
// Saat ditekan: animasi pegas + navigate ke modul.
//
// Dipakai di HomeScreen untuk grid 4 modul utama.
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { useTheme, Spacing, Radius, Shadow } from '../../theme';

interface ModuleCardProps {
  title: string;
  caption?: string;
  icon: keyof typeof Ionicons.glyphMap;
  pastelBg: string;            // warna background pastel (peach/mint/dll.)
  pastelInk: string;           // warna teks/icon (kontras dengan pastel)
  onPress: () => void;
  delay?: number;              // delay animasi entry
  showDots?: boolean;          // tampilkan pola titik dekoratif
  style?: StyleProp<ViewStyle>;
}

export function ModuleCard({
  title,
  caption,
  icon,
  pastelBg,
  pastelInk,
  onPress,
  delay = 0,
  showDots = true,
  style,
}: ModuleCardProps) {
  const colors = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(16).mass(0.7)}
      style={[styles.wrap, style]}
    >
      <AnimatedPressable onPress={onPress} scaleTo={0.95}>
        <View style={[styles.card, { backgroundColor: pastelBg }, Shadow.sm]}>
          {/* ─── Pola titik dekoratif (4×4 grid) ─────────────────────── */}
          {/* Decorative pattern. SVG dengan 16 titik kecil opacity 0.25 */}
          {showDots && (
            <View style={styles.dotsCorner}>
              <Svg width={48} height={48}>
                {/* Loop ganda: 4 baris × 4 kolom = 16 titik */}
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2, 3].map((col) => (
                    <Circle
                      key={`${row}-${col}`}              // key unik per titik
                      cx={6 + col * 12}                   // posisi x
                      cy={6 + row * 12}                   // posisi y
                      r={1.4}                              // radius kecil
                      fill={pastelInk}
                      opacity={0.25}                       // halus, tidak ramai
                    />
                  ))
                )}
              </Svg>
            </View>
          )}

          {/* ─── Icon dalam kotak putih ──────────────────────────────── */}
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.55)' }]}>
            <Ionicons name={icon} size={26} color={pastelInk} />
          </View>

          {/* ─── Title + caption di bagian bawah ─────────────────────── */}
          {/* marginTop: 'auto' = dorong ke bawah (pakai sisa space) */}
          <View style={{ marginTop: 'auto' }}>
            <Text style={[styles.title, { color: pastelInk }]} numberOfLines={2}>
              {title}
            </Text>
            {caption && (
              <Text style={[styles.caption, { color: pastelInk }]} numberOfLines={2}>
                {caption}
              </Text>
            )}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '48%' },                 // grid 2-kolom, 2 card per baris
  card: {
    aspectRatio: 1,                       // persegi (lebar = tinggi)
    borderRadius: Radius.xl,             // sudut sangat melengkung
    padding: Spacing.lg,
    overflow: 'hidden',                   // potong elemen yang keluar
    justifyContent: 'space-between',      // icon atas, title bawah
    minHeight: 160,
  },
  dotsCorner: { position: 'absolute', right: 8, top: 8 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 15, fontWeight: '800', lineHeight: 20 },
  caption: { fontSize: 11, opacity: 0.75, marginTop: 2 },
});
