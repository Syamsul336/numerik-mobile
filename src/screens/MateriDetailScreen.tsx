// =============================================================================
// FILE: src/screens/MateriDetailScreen.tsx
// =============================================================================
//
// MATERI DETAIL SCREEN — layar isi satu materi pembelajaran
// ==========================================================
//
// Apa fungsi layar ini?
// ---------------------
// Tampilkan ISI LENGKAP dari satu materi pembelajaran. ID materi diambil
// dari URL (route dinamis /materi/[id]).
//
// Yang dirender:
// 1. Hero header navy dengan title materi & durasi baca
// 2. Sections — loop array `materi.sections`, render tiap-tiap tipe
//    secara berbeda:
//    - heading   : sub-judul tebal
//    - paragraph : teks biasa
//    - formula   : box rumus dengan KaTeX
//    - example   : box highlight kuning
//    - note      : box callout (info/warning/success)
//    - bullets   : list dengan dot
// 3. Tombol "Tandai sudah dibaca" di bawah → toggle status read
//
// Status read di-save ke progressStorage. Saat user balik ke
// MateriListScreen, badge "✓ sudah dibaca" akan otomatis muncul.
//
// useLocalSearchParams: hook expo-router untuk ambil parameter URL.
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { getMateri, type MateriSection, type MateriModule } from '../data/materi';
import { progressStorage } from '../core/storage/progressStorage';
import { useTheme, Spacing, Radius, Shadow } from '../theme';
import { HeroHeader } from '../components/ui/HeroHeader';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';
import { MathView } from '../components/math/MathView';

// Metadata per modul untuk eyebrow header.
// `bg` dan `ink` kosong di sini — diisi runtime pakai theme colors.
const MODULE_META: Record<MateriModule, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; ink: string }> = {
  integral: { label: 'INTEGRAL NUMERIK', icon: 'infinite-outline', bg: '', ink: '' },
  interpolation: { label: 'INTERPOLASI', icon: 'pulse-outline', bg: '', ink: '' },
  geometry: { label: 'BANGUN DATAR', icon: 'shapes-outline', bg: '', ink: '' },
};

export default function MateriDetailScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const materi = id ? getMateri(id) : undefined;

  const [isRead, setIsRead] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Resolve module styling using current theme
  const moduleColors: Record<MateriModule, { bg: string; ink: string }> = {
    integral: { bg: colors.pastelLemon, ink: colors.pastelLemonInk },
    interpolation: { bg: colors.pastelRose, ink: colors.pastelRoseInk },
    geometry: { bg: colors.pastelMint, ink: colors.pastelMintInk },
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!materi) return;
      const ids = await progressStorage.getReadIds();
      if (!cancelled) {
        setIsRead(ids.has(materi.id));
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [materi]);

  const onToggleRead = useCallback(async () => {
    if (!materi) return;
    const next = await progressStorage.toggleRead(materi.id);
    setIsRead(next);
  }, [materi]);

  if (!materi) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: colors.textSecondary }}>Materi tidak ditemukan.</Text>
        <AnimatedPressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <View style={[styles.backChip, { backgroundColor: colors.primary }]}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Kembali</Text>
          </View>
        </AnimatedPressable>
      </View>
    );
  }

  if (!loaded) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const meta = MODULE_META[materi.module];
  const mc = moduleColors[materi.module];

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxxl * 2 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader
          eyebrow={meta.label}
          title={materi.title}
          subtitle={materi.subtitle}
          onBack={() => router.back()}
          height={210}
          showTopBar={false}
        />

        {/* Meta strip */}
        <View style={styles.section}>
          <Animated.View
            entering={FadeInUp.delay(100).springify().damping(16)}
            style={[styles.metaStrip, { backgroundColor: mc.bg }]}
          >
            <View style={styles.metaItem}>
              <Ionicons name={meta.icon} size={16} color={mc.ink} />
              <Text style={[styles.metaText, { color: mc.ink }]}>
                {materi.module === 'integral' ? 'Integral Numerik' : materi.module === 'interpolation' ? 'Interpolasi' : 'Bangun Datar'}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={mc.ink} />
              <Text style={[styles.metaText, { color: mc.ink }]}>{materi.estimatedMinutes} menit baca</Text>
            </View>
            {isRead && (
              <>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.metaText, { color: colors.success, fontWeight: '800' }]}>Dibaca</Text>
                </View>
              </>
            )}
          </Animated.View>
        </View>

        {/* Sections */}
        <View style={styles.contentSection}>
          {materi.sections.map((s, i) => (
            <SectionView
              key={i}
              section={s}
              delay={150 + i * 40}
              colors={colors}
              moduleColor={mc}
            />
          ))}
        </View>

        {/* Mark as read button */}
        <View style={styles.section}>
          <AnimatedPressable onPress={onToggleRead} scaleTo={0.97} style={{ marginTop: Spacing.lg }}>
            <View
              style={[
                styles.readButton,
                {
                  backgroundColor: isRead ? colors.success : colors.primary,
                },
                Shadow.md,
              ]}
            >
              <Ionicons
                name={isRead ? 'checkmark-done' : 'checkmark-circle-outline'}
                size={20}
                color="#fff"
              />
              <Text style={styles.readButtonText}>
                {isRead ? 'Sudah dibaca · Tap untuk batalkan' : 'Tandai sudah dibaca'}
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Sections                                  */
/* -------------------------------------------------------------------------- */

function SectionView({
  section,
  delay,
  colors,
  moduleColor,
}: {
  section: MateriSection;
  delay: number;
  colors: ReturnType<typeof useTheme>;
  moduleColor: { bg: string; ink: string };
}) {
  const wrap = (children: React.ReactNode) => (
    <Animated.View entering={FadeInUp.delay(delay).springify().damping(16)}>
      {children}
    </Animated.View>
  );

  switch (section.type) {
    case 'heading':
      return wrap(
        <Text style={[styles.heading, { color: colors.text }]}>{section.text}</Text>
      );

    case 'paragraph':
      return wrap(
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{section.text}</Text>
      );

    case 'formula':
      return wrap(
        <View style={[styles.formulaCard, { backgroundColor: colors.cardElevated, borderColor: colors.borderLight }, Shadow.sm]}>
          <MathView latex={section.latex} fontSize={17} />
          {section.caption && (
            <Text style={[styles.formulaCaption, { color: colors.textTertiary }]}>{section.caption}</Text>
          )}
        </View>
      );

    case 'example':
      return wrap(
        <View style={[styles.exampleCard, { backgroundColor: moduleColor.bg }]}>
          <View style={styles.exampleHeader}>
            <View style={[styles.exampleBadge, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
              <Ionicons name="bulb-outline" size={14} color={moduleColor.ink} />
              <Text style={[styles.exampleBadgeText, { color: moduleColor.ink }]}>CONTOH</Text>
            </View>
            <Text style={[styles.exampleTitle, { color: moduleColor.ink }]}>{section.title}</Text>
          </View>
          <Text style={[styles.exampleText, { color: moduleColor.ink }]}>{section.text}</Text>
          {section.latex && (
            <View style={[styles.exampleFormula, { backgroundColor: 'rgba(255,255,255,0.65)' }]}>
              <MathView latex={section.latex} fontSize={15} color={moduleColor.ink} />
            </View>
          )}
        </View>
      );

    case 'note': {
      const tone = section.tone;
      const toneColors = {
        info: { bg: '#EFF4FF', ink: '#1E2A9E', icon: 'information-circle' as const },
        warning: { bg: '#FEF3E7', ink: '#7C4A03', icon: 'alert-circle' as const },
        success: { bg: '#E8F8EE', ink: '#0E5E2C', icon: 'checkmark-circle' as const },
      }[tone];
      return wrap(
        <View style={[styles.noteCard, { backgroundColor: toneColors.bg }]}>
          <Ionicons name={toneColors.icon} size={20} color={toneColors.ink} style={{ marginTop: 1 }} />
          <Text style={[styles.noteText, { color: toneColors.ink }]}>{section.text}</Text>
        </View>
      );
    }

    case 'bullets':
      return wrap(
        <View style={styles.bulletsWrap}>
          {section.items.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  section: { paddingHorizontal: Spacing.lg },
  contentSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    marginTop: -Spacing.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: { fontSize: 12, fontWeight: '700' },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heading: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  formulaCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  formulaCaption: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  exampleCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginVertical: Spacing.sm,
  },
  exampleHeader: {
    marginBottom: Spacing.sm,
  },
  exampleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginBottom: 6,
  },
  exampleBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  exampleTitle: { fontSize: 14, fontWeight: '800' },
  exampleText: { fontSize: 13, lineHeight: 20, opacity: 0.9 },
  exampleFormula: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  noteCard: {
    flexDirection: 'row',
    gap: 10,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginVertical: Spacing.sm,
  },
  noteText: { fontSize: 13, lineHeight: 20, flex: 1, fontWeight: '500' },
  bulletsWrap: { gap: 6, marginVertical: Spacing.sm },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: Spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletText: { fontSize: 14, lineHeight: 22, flex: 1 },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  readButtonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  backChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
