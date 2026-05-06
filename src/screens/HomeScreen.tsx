// =============================================================================
// FILE: src/screens/HomeScreen.tsx
// =============================================================================
//
// HOME SCREEN — layar utama saat aplikasi dibuka
// ==============================================
//
// Apa fungsi layar ini?
// ---------------------
// Layar utama yang user lihat pertama kali saat membuka app.
// Layout urutan dari atas ke bawah:
//
// 1. HERO HEADER navy dengan greeting "Hi, Numerik 👋"
// 2. KPI STRIP (2 kartu): progress materi + tombol "Mulai Belajar"
// 3. GRID 4 MODUL UTAMA: Integral, Interpolasi, Geometri, AI Asisten
//    Tiap kartu pakai warna pastel berbeda
// 4. DAILY TIPS card: rotasi otomatis tiap 90 detik
// 5. QUICK LINKS: tombol Riwayat dan Pengaturan
//
// Hooks & state yang dipakai:
// - useRouter() : untuk navigate ke layar lain
// - useFocusEffect() : refresh progress saat layar di-focus ulang
// - useDailyTips() : ambil tips harian
// - progressStorage : ambil count materi yang sudah dibaca
//
// Struktur file:
// 1. Import statements
// 2. ModuleConfig type & MODULES constant (definisi 4 modul utama)
// 3. HomeScreen component utama
// 4. Sub-komponen helpers
// 5. Styles
// =============================================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

// Komponen tema
import { useTheme, Spacing, Radius, Shadow } from '../theme';
// Komponen UI
import { HeroHeader } from '../components/ui/HeroHeader';
import { ModuleCard } from '../components/cards/ModuleCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { BrandLogo } from '../components/ui/BrandLogo';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';
// Custom hook & data
import { useDailyTips } from '../hooks/useDailyTips';
import { progressStorage } from '../core/storage/progressStorage';
import { MATERI } from '../data/materi';

/**
 * ModuleConfig — bentuk data untuk satu modul di home grid.
 *
 * Pakai TypeScript-friendly: bg dan ink field memakai literal type
 * (bukan generic string) supaya autocomplete bekerja.
 */
interface ModuleConfig {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  caption: string;
  bg: 'pastelPeach' | 'pastelMint' | 'pastelLavender' | 'pastelSky' | 'pastelRose' | 'pastelLemon';
  ink: 'pastelPeachInk' | 'pastelMintInk' | 'pastelLavenderInk' | 'pastelSkyInk' | 'pastelRoseInk' | 'pastelLemonInk';
  route: string;
}

const modules: ModuleConfig[] = [
  {
    icon: 'infinite-outline',
    title: 'Integral\nNumerik',
    caption: 'Trapesium · Simpson · Romberg',
    bg: 'pastelLemon',
    ink: 'pastelLemonInk',
    route: '/integral',
  },
  {
    icon: 'pulse-outline',
    title: 'Interpolasi',
    caption: 'Lagrange · Newton DD',
    bg: 'pastelRose',
    ink: 'pastelRoseInk',
    route: '/interpolation',
  },
  {
    icon: 'shapes-outline',
    title: 'Bangun Datar',
    caption: '6 bentuk geometri',
    bg: 'pastelMint',
    ink: 'pastelMintInk',
    route: '/geometry',
  },
  {
    icon: 'sparkles-outline',
    title: 'AI Asisten',
    caption: 'Tanya konsep apa saja',
    bg: 'pastelLavender',
    ink: 'pastelLavenderInk',
    route: '/ai-helper',
  },
];

export default function HomeScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { tips, currentTip, currentIndex, setIndex } = useDailyTips();

  const [readCount, setReadCount] = useState(0);
  const totalCount = MATERI.length;
  const percent = totalCount === 0 ? 0 : Math.round((readCount / totalCount) * 100);

  // Refresh progress every time home gets focus (incl. returning from materi)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const ids = await progressStorage.getReadIds();
        if (!cancelled) setReadCount(ids.size);
      })();
      return () => { cancelled = true; };
    }, [])
  );

  const handleTipCta = () => {
    if (currentTip.cta) {
      router.push(currentTip.cta.route as any);
    }
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader
          eyebrow="NUMERIK · BELAJAR INTERAKTIF"
          title="Hi, Numerik 👋"
          subtitle="Pilih metode numerik dan jelajahi langkah perhitungannya."
          height={240}
          compact={true}
          left={
            <View style={styles.brandWrap}>
              <BrandLogo size={36} />
            </View>
          }
        />

        {/* KPI strip — Progress (1/3) + Mulai Belajar CTA (2/3) */}
        <View style={styles.kpiRow}>
          {/* Progress card — 1/3 */}
          <Animated.View
            entering={FadeInUp.delay(150).springify().damping(16)}
            style={[
              styles.progressCard,
              { backgroundColor: colors.card, borderColor: colors.borderLight },
              Shadow.md,
            ]}
          >
            <View style={[styles.progressIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="trending-up" size={16} color={colors.success} />
            </View>
            <Text style={[styles.progressBig, { color: colors.text }]}>{percent}%</Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Materi dikuasai</Text>
            <View style={[styles.progressBarBg, { backgroundColor: colors.borderLight }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${percent}%`,
                    backgroundColor: percent >= 100 ? colors.success : colors.primary,
                  },
                ]}
              />
            </View>
          </Animated.View>

          {/* Mulai Belajar CTA — 2/3 */}
          <Animated.View
            entering={FadeInUp.delay(220).springify().damping(16)}
            style={styles.ctaWrap}
          >
            <AnimatedPressable
              onPress={() => router.push('/materi' as any)}
              scaleTo={0.97}
              style={{ flex: 1 }}
            >
              <View style={[styles.ctaCard, { backgroundColor: colors.primary }, Shadow.md]}>
                {/* Decorative bubbles */}
                <View
                  style={[
                    styles.ctaBubble1,
                    { backgroundColor: colors.accentYellow },
                  ]}
                />
                <View
                  style={[
                    styles.ctaBubble2,
                    { backgroundColor: colors.accentCyan },
                  ]}
                />

                <View style={styles.ctaHeaderRow}>
                  <View style={[styles.ctaIcon, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                    <Ionicons name="school" size={20} color="#fff" />
                  </View>
                  <Text style={styles.ctaEyebrow}>{readCount} / {totalCount} MATERI</Text>
                </View>

                <Text style={styles.ctaTitle}>Mulai Belajar</Text>
                <Text style={styles.ctaSubtitle}>
                  Materi lengkap integral, interpolasi & geometri
                </Text>

                <View style={styles.ctaBtnRow}>
                  <View style={styles.ctaBtn}>
                    <Text style={[styles.ctaBtnText, { color: colors.primary }]}>
                      Buka Materi
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </View>
                </View>
              </View>
            </AnimatedPressable>
          </Animated.View>
        </View>

        {/* Modules grid */}
        <View style={styles.section}>
          <SectionHeader
            title="Modul Pembelajaran"
            caption="Pilih topik untuk mulai eksplorasi"
          />
          <View style={styles.grid}>
            {modules.map((m, i) => (
              <ModuleCard
                key={m.route}
                title={m.title}
                caption={m.caption}
                icon={m.icon}
                pastelBg={colors[m.bg]}
                pastelInk={colors[m.ink]}
                onPress={() => router.push(m.route as any)}
                delay={350 + i * 80}
              />
            ))}
          </View>
        </View>

        {/* Tip card with carousel */}
        <View style={styles.section}>
          <Animated.View
            entering={FadeInUp.delay(700).springify().damping(16)}
            style={[
              styles.tipCard,
              { backgroundColor: colors.primary },
              Shadow.md,
            ]}
          >
            <View style={styles.tipDecoration}>
              <View style={[styles.tipDot, { backgroundColor: colors.accentYellow }]} />
              <View style={[styles.tipDot2, { backgroundColor: colors.accentCyan }]} />
            </View>

            <View style={styles.tipHeaderRow}>
              <View style={[styles.tipIcon, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                <Ionicons name="bulb" size={20} color={colors.accentYellow} />
              </View>
              <Text style={styles.tipTitle}>
                TIP HARI INI · {currentIndex + 1}/{tips.length}
              </Text>
            </View>

            {/* Animated tip body — re-mounts on currentIndex change */}
            <Animated.View
              key={currentTip.id}
              entering={FadeIn.duration(320)}
            >
              <Text style={styles.tipHeading}>{currentTip.title}</Text>
              <Text style={styles.tipBody}>{currentTip.body}</Text>
            </Animated.View>

            <View style={styles.tipFooter}>
              {currentTip.cta ? (
                <AnimatedPressable onPress={handleTipCta} style={styles.tipBtn}>
                  <View style={styles.tipBtnInner}>
                    <Text style={styles.tipBtnText}>{currentTip.cta.label}</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </View>
                </AnimatedPressable>
              ) : (
                <View />
              )}

              {/* Dot indicators */}
              <View style={styles.dotsRow}>
                {tips.map((t, i) => (
                  <AnimatedPressable
                    key={t.id}
                    onPress={() => setIndex(i)}
                    scaleTo={0.7}
                    style={styles.dotWrap}
                  >
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            i === currentIndex
                              ? colors.accentYellow
                              : 'rgba(255,255,255,0.35)',
                          width: i === currentIndex ? 18 : 6,
                        },
                      ]}
                    />
                  </AnimatedPressable>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Quick links */}
        <View style={styles.section}>
          <SectionHeader title="Aksi Cepat" />
          <View style={styles.quickRow}>
            <AnimatedPressable
              onPress={() => router.push('/history' as any)}
              style={styles.quickItemWrap}
            >
              <View style={[styles.quickItem, { backgroundColor: colors.card, borderColor: colors.borderLight }, Shadow.sm]}>
                <View style={[styles.quickIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.text }]}>Riwayat</Text>
                <Text style={[styles.quickCaption, { color: colors.textSecondary }]}>Hasil terdahulu</Text>
              </View>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => router.push('/settings' as any)}
              style={styles.quickItemWrap}
            >
              <View style={[styles.quickItem, { backgroundColor: colors.card, borderColor: colors.borderLight }, Shadow.sm]}>
                <View style={[styles.quickIcon, { backgroundColor: colors.pastelSky }]}>
                  <Ionicons name="options-outline" size={20} color={colors.pastelSkyInk} />
                </View>
                <Text style={[styles.quickLabel, { color: colors.text }]}>Pengaturan</Text>
                <Text style={[styles.quickCaption, { color: colors.textSecondary }]}>Tema & info</Text>
              </View>
            </AnimatedPressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  brandWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.xl,
    gap: Spacing.md,
  },

  // Progress card (1/3 width)
  progressCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBig: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Mulai Belajar CTA (2/3 width)
  ctaWrap: {
    flex: 2,
    flexDirection: 'row',
  },
  ctaCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    overflow: 'hidden',
    minHeight: 130,
    justifyContent: 'space-between',
  },
  ctaBubble1: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    right: -22,
    top: -22,
    opacity: 0.85,
  },
  ctaBubble2: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    right: 36,
    top: 14,
    opacity: 0.7,
  },
  ctaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  ctaBtnRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  ctaBtnText: {
    fontWeight: '800',
    fontSize: 12,
  },

  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  // Tip card
  tipCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  tipDecoration: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 100,
    height: 100,
  },
  tipDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    right: -16,
    top: -18,
    opacity: 0.85,
  },
  tipDot2: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    right: 32,
    top: 24,
    opacity: 0.7,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.md,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  tipHeading: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  tipBody: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipBtn: {},
  tipBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  tipBtnText: {
    color: '#1E2A9E',
    fontWeight: '800',
    fontSize: 13,
  },

  // Dot indicators
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dotWrap: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },

  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickItemWrap: { flex: 1 },
  quickItem: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLabel: { fontSize: 14, fontWeight: '700' },
  quickCaption: { fontSize: 11, marginTop: 2 },
});
