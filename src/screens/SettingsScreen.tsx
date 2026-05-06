// =============================================================================
// FILE: src/screens/SettingsScreen.tsx
// =============================================================================
//
// SETTINGS SCREEN — layar Pengaturan
// ===================================
//
// Apa fungsi layar ini?
// ---------------------
// Tampilkan info aplikasi dan opsi-opsi setting.
//
// Section yang ada:
// - Brand info: logo Numerik + version + tagline
// - Tentang aplikasi: deskripsi singkat
// - Reset data:
//   * Reset Riwayat (hapus semua history perhitungan)
//   * Reset Progress (hapus tracking materi yang sudah dibaca)
// - Link ke dokumentasi & GitHub
//
// Pakai sub-komponen `Row` untuk konsistensi tampilan tiap baris setting.
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useTheme, Spacing, Radius, Shadow } from '../theme';
import { HeroHeader } from '../components/ui/HeroHeader';
import { BrandLogo } from '../components/ui/BrandLogo';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';

/**
 * Props untuk sub-komponen Row.
 * Dipakai berulang di settings list — tiap row punya icon kiri, title,
 * caption opsional, dan trailing (chevron/badge) opsional.
 */
interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconInk: string;
  title: string;
  caption?: string;
  trailing?: React.ReactNode;     // misal: chevron right, atau badge
  onPress?: () => void;
}

/**
 * Row — komponen list-item untuk setting page.
 *
 * Kalau onPress ada → wrap dengan AnimatedPressable (tap responsive).
 * Kalau tidak → render statis saja.
 */
function Row({ icon, iconBg, iconInk, title, caption, trailing, onPress }: RowProps) {
  const colors = useTheme();
  const content = (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconInk} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        {caption && (
          <Text style={[styles.rowCaption, { color: colors.textSecondary }]}>
            {caption}
          </Text>
        )}
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} scaleTo={0.98}>
        {content}
      </AnimatedPressable>
    );
  }
  return content;
}

export default function SettingsScreen() {
  const colors = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <HeroHeader
        eyebrow="PENGATURAN"
        title="Profil & Info"
        subtitle="Kustomisasi pengalaman dan kelola data lokal."
        onBack={() => router.back()}
        height={210}
        showTopBar={false}
      />

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand card */}
        <Animated.View
          entering={FadeInUp.delay(100).springify().damping(16)}
          style={[
            styles.brandCard,
            { backgroundColor: colors.primary },
            Shadow.md,
          ]}
        >
          <View style={styles.brandDots}>
            <View style={[styles.brandDot, { backgroundColor: colors.accentYellow }]} />
            <View style={[styles.brandDot2, { backgroundColor: colors.accentCyan }]} />
          </View>
          <BrandLogo size={56} />
          <Text style={styles.brandName}>NUMERIK</Text>
          <Text style={styles.brandTagline}>Belajar metode numerik interaktif</Text>
          <View style={styles.brandVersion}>
            <Text style={styles.brandVersionText}>V.2026.01</Text>
          </View>
        </Animated.View>

        {/* Tampilan */}
        <Animated.Text
          entering={FadeInUp.delay(160)}
          style={[styles.section, { color: colors.text }]}
        >
          Tampilan
        </Animated.Text>
        <Animated.View
          entering={FadeInUp.delay(200).springify().damping(16)}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.borderLight },
            Shadow.sm,
          ]}
        >
          <Row
            icon="contrast-outline"
            iconBg={colors.primarySoft}
            iconInk={colors.primary}
            title="Tema"
            caption="Mengikuti sistem (auto)"
            trailing={
              <View style={[styles.pillBadge, { backgroundColor: colors.successSoft }]}>
                <Text style={{ color: colors.success, fontSize: 10, fontWeight: '800' }}>
                  AUTO
                </Text>
              </View>
            }
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Row
            icon="color-palette-outline"
            iconBg={colors.pastelLavender}
            iconInk={colors.pastelLavenderInk}
            title="Warna Aksen"
            caption="Navy #1E2A9E"
            trailing={
              <View style={[styles.colorChip, { backgroundColor: colors.primary }]} />
            }
          />
        </Animated.View>

        {/* Tentang */}
        <Animated.Text
          entering={FadeInUp.delay(240)}
          style={[styles.section, { color: colors.text }]}
        >
          Tentang
        </Animated.Text>
        <Animated.View
          entering={FadeInUp.delay(280).springify().damping(16)}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.borderLight },
            Shadow.sm,
          ]}
        >
          <Row
            icon="information-circle-outline"
            iconBg={colors.pastelSky}
            iconInk={colors.pastelSkyInk}
            title="Versi"
            caption="V.2026.01 — Rilis Mei 2026"
            trailing={
              <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                Stabil
              </Text>
            }
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Row
            icon="logo-github"
            iconBg={colors.primarySoft}
            iconInk={colors.primary}
            title="Source Code"
            caption="github.com/Syamsul336/numerik-mobile"
            trailing={
              <Ionicons
                name="open-outline"
                size={18}
                color={colors.textTertiary}
              />
            }
            onPress={() => Linking.openURL('https://github.com/Syamsul336/numerik-mobile')}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Row
            icon="shield-checkmark-outline"
            iconBg={colors.successSoft}
            iconInk={colors.success}
            title="Privasi"
            caption="Semua data hanya disimpan lokal"
            trailing={
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textTertiary}
              />
            }
            onPress={() => {}}
          />
        </Animated.View>

        {/* Library credits */}
        <Animated.Text
          entering={FadeInUp.delay(320)}
          style={[styles.section, { color: colors.text }]}
        >
          Powered by
        </Animated.Text>
        <Animated.View
          entering={FadeInUp.delay(360).springify().damping(16)}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.borderLight },
            Shadow.sm,
          ]}
        >
          <Row
            icon="layers-outline"
            iconBg={colors.pastelLemon}
            iconInk={colors.pastelLemonInk}
            title="Expo + React Native"
            caption="Cross-platform framework"
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Row
            icon="calculator-outline"
            iconBg={colors.pastelMint}
            iconInk={colors.pastelMintInk}
            title="KaTeX"
            caption="Real-time LaTeX rendering"
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Row
            icon="git-branch-outline"
            iconBg={colors.pastelRose}
            iconInk={colors.pastelRoseInk}
            title="mathjs"
            caption="Expression parser & evaluator"
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Row
            icon="sparkles-outline"
            iconBg={colors.pastelLavender}
            iconInk={colors.pastelLavenderInk}
            title="Gemini 2.5 Flash Lite"
            caption="AI Agent untuk asisten numerik"
          />
        </Animated.View>

        <View style={{ height: 24 }} />
        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          Numeric Application 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  brandCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: -Spacing.lg,
    marginBottom: Spacing.xl,
  },
  brandDots: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 100,
    height: 100,
  },
  brandDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    right: -16,
    top: -18,
    opacity: 0.85,
  },
  brandDot2: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    right: 32,
    top: 24,
    opacity: 0.7,
  },
  brandName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: Spacing.md,
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
  },
  brandVersion: {
    marginTop: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  brandVersionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  section: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowCaption: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginLeft: 70 },
  pillBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  colorChip: { width: 24, height: 24, borderRadius: 12 },
  versionText: { fontSize: 12, fontWeight: '600' },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
