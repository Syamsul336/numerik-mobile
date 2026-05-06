// =============================================================================
// FILE: src/components/cards/StepCard.tsx
// =============================================================================
//
// STEP CARD — kartu satu langkah perhitungan
// ===========================================
//
// Apa fungsi komponen ini?
// ------------------------
// Render SATU langkah perhitungan sebagai kartu yang rapi. Berisi:
// - Badge nomor langkah (warnanya bisa berbeda sesuai "tone")
// - Title langkah
// - Deskripsi dalam bahasa Indonesia (opsional)
// - Rumus LaTeX (opsional, di-render pakai KaTeX)
// - Daftar nilai (opsional, sebagai bullet list dengan dot warna)
//
// Tone yang tersedia:
// - navy     : warna brand (untuk langkah biasa)
// - success  : hijau (untuk hasil akhir)
// - warning  : oranye (untuk peringatan)
// - lavender : ungu pastel (untuk langkah penting)
//
// Cara pakai (di IntegralScreen.tsx, dst.):
//   {result.blocks.map((block, i) => (
//     <StepCard
//       key={i}
//       index={i + 1}
//       title={block.title}
//       description={block.description}
//       latex={block.latex}
//       values={block.values}
//       tone={block.tone}
//       delay={i * 80}
//     />
//   ))}
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme, Spacing, Radius, Shadow } from '../../theme';
import { MathView } from '../math/MathView';

interface StepCardProps {
  index: number;                                                            // nomor langkah
  title: string;                                                            // judul langkah
  description?: string;                                                     // narasi
  latex?: string;                                                           // rumus LaTeX
  values?: Array<{ label: string; value: string; highlight?: boolean }>;    // bullet list
  tone?: 'navy' | 'success' | 'warning' | 'lavender';                       // skema warna
  delay?: number;                                                           // delay animasi
}

export function StepCard({
  index,
  title,
  description,
  latex,
  values,
  tone = 'navy',
  delay = 0,
}: StepCardProps) {
  const colors = useTheme();

  // ─── Mapping tone → warna ──────────────────────────────────────────────
  // Tiap tone punya warna background (bg), foreground (fg untuk teks/icon),
  // dan border. Kita pilih sekali di awal, lalu pakai berkali-kali.
  const tones = {
    navy: { bg: colors.primarySoft, fg: colors.primary, border: colors.primarySoft },
    success: { bg: colors.successSoft, fg: colors.success, border: colors.successSoft },
    warning: { bg: colors.warningSoft, fg: colors.warning, border: colors.warningSoft },
    lavender: { bg: colors.pastelLavender, fg: colors.pastelLavenderInk, border: colors.pastelLavender },
  } as const;
  const t = tones[tone];

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(16)}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.borderLight },
        Shadow.sm,
      ]}
    >
      {/* ─── Header: badge nomor + judul ─────────────────────────── */}
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: t.bg }]}>
          <Text style={[styles.badgeNum, { color: t.fg }]}>{index}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
      </View>

      {/* ─── Deskripsi narasi (kalau ada) ────────────────────────── */}
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}

      {/* ─── Box rumus LaTeX (kalau ada) ─────────────────────────── */}
      {/* Background lavender soft supaya menonjol dari description */}
      {latex && (
        <View
          style={[
            styles.formulaBox,
            { backgroundColor: colors.primaryWash, borderColor: colors.primarySoft },
          ]}
        >
          <MathView
            latex={latex}
            color={colors.text}
            backgroundColor="transparent"
            fontSize={16}
            minHeight={32}
          />
        </View>
      )}

      {/* ─── Bullet list nilai (kalau ada) ───────────────────────── */}
      {values && values.length > 0 && (
        <View style={styles.valuesBox}>
          {values.map((v, i) => (
            <View key={i} style={styles.valueRow}>
              {/* Dot warna sesuai tone */}
              <View style={[styles.valueDot, { backgroundColor: t.fg }]} />
              <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                {v.label}
              </Text>
              <Text
                style={[
                  styles.valueValue,
                  {
                    // Highlight: warna tone + bold
                    color: v.highlight ? t.fg : colors.text,
                    fontWeight: v.highlight ? '800' : '600',
                  },
                ]}
              >
                {v.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNum: { fontSize: 14, fontWeight: '800' },
  title: { fontSize: 14, fontWeight: '700', flex: 1, lineHeight: 18 },
  description: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.sm },
  formulaBox: {
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  valuesBox: { marginTop: Spacing.sm, gap: 6 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valueDot: { width: 6, height: 6, borderRadius: 3 },
  valueLabel: { fontSize: 12, flex: 1 },
  valueValue: { fontSize: 13, fontVariant: ['tabular-nums'] },
});
