// =============================================================================
// FILE: src/screens/MateriListScreen.tsx
// =============================================================================
//
// MATERI LIST SCREEN — layar daftar Materi Pembelajaran
// ======================================================
//
// Apa fungsi layar ini?
// ---------------------
// Tampilkan daftar 20 materi pembelajaran yang dibagi 3 section:
// - Integral (7 materi)
// - Interpolasi (6 materi)
// - Geometri (7 materi)
//
// Komponen di layar:
// 1. Hero header navy "Materi"
// 2. Progress bar global: berapa banyak materi yang sudah dibaca
//    Misal: "5 dari 20 materi · 25%"
// 3. 3 section dengan judul + daftar card
// 4. Tiap card menunjukkan: title, durasi, status read (badge ✓ kalau sudah)
//
// Tap card → navigate ke `/materi/{id}` yang load MateriDetailScreen.
//
// Progress di-load dari progressStorage saat layar focus.
// =============================================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { MATERI, materiByModule, type MateriModule, type Materi } from '../data/materi';
import { progressStorage } from '../core/storage/progressStorage';
import { useTheme, Spacing, Radius, Shadow } from '../theme';
import { HeroHeader } from '../components/ui/HeroHeader';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';

/**
 * Konfigurasi header per modul: title, caption, icon, dan warna pastel.
 */
interface ModuleHeaderConfig {
  module: MateriModule;
  title: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  ink: string;
}

export default function MateriListScreen() {
  const colors = useTheme();
  const router = useRouter();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    const ids = await progressStorage.getReadIds();
    setReadIds(ids);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const totalRead = readIds.size;
  const totalCount = MATERI.length;
  const percent = totalCount === 0 ? 0 : Math.round((totalRead / totalCount) * 100);

  const moduleConfigs: ModuleHeaderConfig[] = [
    {
      module: 'integral',
      title: 'Integral Numerik',
      caption: `${materiByModule('integral').length} materi`,
      icon: 'infinite-outline',
      bg: colors.pastelLemon,
      ink: colors.pastelLemonInk,
    },
    {
      module: 'interpolation',
      title: 'Interpolasi',
      caption: `${materiByModule('interpolation').length} materi`,
      icon: 'pulse-outline',
      bg: colors.pastelRose,
      ink: colors.pastelRoseInk,
    },
    {
      module: 'geometry',
      title: 'Bangun Datar',
      caption: `${materiByModule('geometry').length} materi`,
      icon: 'shapes-outline',
      bg: colors.pastelMint,
      ink: colors.pastelMintInk,
    },
  ];

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader
          eyebrow="MATERI PEMBELAJARAN"
          title="Mulai Belajar"
          subtitle="20 materi lengkap. Tandai sudah dibaca untuk melacak progressmu."
          onBack={() => router.back()}
          height={210}
          showTopBar={false}
        />

        {/* Progress card */}
        <View style={styles.section}>
          <Animated.View
            entering={FadeInUp.delay(100).springify().damping(16)}
            style={[
              styles.progressCard,
              { backgroundColor: colors.primary },
              Shadow.md,
            ]}
          >
            <View style={styles.progressDots}>
              <View style={[styles.progressDot, { backgroundColor: colors.accentYellow }]} />
              <View style={[styles.progressDot2, { backgroundColor: colors.accentCyan }]} />
            </View>
            <Text style={styles.progressLabel}>PROGRESS BELAJAR</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressBig}>{percent}%</Text>
              <Text style={styles.progressFraction}>
                {totalRead} / {totalCount} materi
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${percent}%`,
                    backgroundColor: colors.accentYellow,
                  },
                ]}
              />
            </View>
          </Animated.View>
        </View>

        {/* Materi groups */}
        {moduleConfigs.map((cfg, mIdx) => {
          const list = materiByModule(cfg.module);
          const groupRead = list.filter((m) => readIds.has(m.id)).length;
          return (
            <View key={cfg.module} style={styles.section}>
              <Animated.View
                entering={FadeInUp.delay(180 + mIdx * 60).springify().damping(16)}
                style={[styles.groupHeader, { backgroundColor: cfg.bg }]}
              >
                <View style={[styles.groupIcon, { backgroundColor: 'rgba(255,255,255,0.55)' }]}>
                  <Ionicons name={cfg.icon} size={22} color={cfg.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupTitle, { color: cfg.ink }]}>{cfg.title}</Text>
                  <Text style={[styles.groupCaption, { color: cfg.ink }]}>
                    {groupRead} / {list.length} dibaca
                  </Text>
                </View>
                <View
                  style={[
                    styles.groupBadge,
                    { backgroundColor: 'rgba(255,255,255,0.55)' },
                  ]}
                >
                  <Text style={{ color: cfg.ink, fontWeight: '800', fontSize: 11 }}>
                    {Math.round((groupRead / list.length) * 100)}%
                  </Text>
                </View>
              </Animated.View>

              {list.map((m, i) => (
                <MateriRow
                  key={m.id}
                  materi={m}
                  read={readIds.has(m.id)}
                  ink={cfg.ink}
                  bg={cfg.bg}
                  onPress={() => router.push(`/materi/${m.id}` as any)}
                  delay={220 + mIdx * 60 + i * 40}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function MateriRow({
  materi,
  read,
  ink,
  bg,
  onPress,
  delay,
}: {
  materi: Materi;
  read: boolean;
  ink: string;
  bg: string;
  onPress: () => void;
  delay: number;
}) {
  const colors = useTheme();
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify().damping(16)}>
      <AnimatedPressable onPress={onPress} scaleTo={0.98} style={{ marginBottom: 8 }}>
        <View
          style={[
            styles.materiCard,
            { backgroundColor: colors.card, borderColor: colors.borderLight },
            Shadow.sm,
          ]}
        >
          <View
            style={[
              styles.materiCheck,
              {
                backgroundColor: read ? colors.success : bg,
                borderColor: read ? colors.success : 'transparent',
              },
            ]}
          >
            {read ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={{ color: ink, fontWeight: '800', fontSize: 12 }}>
                {materi.id.split('-')[0].toUpperCase()}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.materiTitle, { color: colors.text }]} numberOfLines={1}>
              {materi.title}
            </Text>
            <Text style={[styles.materiSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {materi.subtitle}
            </Text>
            <View style={styles.materiMeta}>
              <Ionicons name="time-outline" size={11} color={colors.textTertiary} />
              <Text style={{ fontSize: 10, color: colors.textTertiary, fontWeight: '600' }}>
                {materi.estimatedMinutes} menit
              </Text>
              {read && (
                <>
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textTertiary }} />
                  <Text style={{ fontSize: 10, color: colors.success, fontWeight: '700' }}>
                    Sudah dibaca
                  </Text>
                </>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  progressCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    marginTop: -Spacing.md,
  },
  progressDots: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 100,
    height: 100,
  },
  progressDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    right: -16,
    top: -18,
    opacity: 0.8,
  },
  progressDot2: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    right: 32,
    top: 24,
    opacity: 0.7,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  progressBig: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  progressFraction: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupTitle: { fontSize: 15, fontWeight: '800' },
  groupCaption: { fontSize: 11, opacity: 0.75, marginTop: 2 },
  groupBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  materiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  materiCheck: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materiTitle: { fontSize: 14, fontWeight: '700' },
  materiSubtitle: { fontSize: 11, marginTop: 2 },
  materiMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
});
