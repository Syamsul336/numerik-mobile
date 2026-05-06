// =============================================================================
// FILE: src/screens/HistoryScreen.tsx
// =============================================================================
//
// HISTORY SCREEN — layar Riwayat Perhitungan
// ===========================================
//
// Apa fungsi layar ini?
// ---------------------
// Tampilkan daftar semua perhitungan yang pernah dilakukan user
// (integral, interpolasi, geometri).
//
// Fitur:
// - FlatList dengan card per entry
// - Card menampilkan: icon modul, title, summary, timestamp relatif ("5 menit lalu")
// - LONG-PRESS untuk konfirmasi hapus satu entry
// - Pull-to-refresh untuk reload daftar
// - Empty state ketika belum ada perhitungan
//
// Data sumber: AsyncStorage via historyStorage (lihat src/core/storage/historyStorage.ts).
// useFocusEffect: refresh otomatis tiap kali user kembali ke layar ini
// (misal: setelah hitung integral baru di IntegralScreen).
// =============================================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  SlideOutLeft,
  Layout,
  Easing,
} from 'react-native-reanimated';
import { format } from 'date-fns';

import { historyStorage, type HistoryEntry } from '../core/storage/historyStorage';
import { useTheme, Spacing, Radius, Shadow } from '../theme';
import { HeroHeader } from '../components/ui/HeroHeader';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Konfigurasi tampilan per modul.
const moduleConfig: Record<
  HistoryEntry['module'],
  { icon: keyof typeof Ionicons.glyphMap; bg: string; ink: string; tag: string }
> = {
  integral: { icon: 'infinite-outline', bg: '#FEF3C7', ink: '#CA8A04', tag: 'Integral' },
  interpolation: { icon: 'pulse-outline', bg: '#FCE7F3', ink: '#DB2777', tag: 'Interpolasi' },
  geometry: { icon: 'shapes-outline', bg: '#D1FADF', ink: '#16A34A', tag: 'Geometri' },
};

// Custom Confirmation Modal
function ConfirmModal({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDestructive,
  destructiveStyle,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  destructiveStyle?: any;
}) {
  const colors = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={[styles.modalIconWrap, { backgroundColor: isDestructive ? colors.errorSoft : colors.primarySoft }]}>
            <Ionicons
              name={isDestructive ? 'trash-outline' : 'alert-circle-outline'}
              size={28}
              color={isDestructive ? colors.error : colors.primary}
            />
          </View>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>{message}</Text>
          <View style={styles.modalButtons}>
            <AnimatedPressable
              onPress={onCancel}
              style={[styles.modalBtn, { backgroundColor: colors.borderLight }]}
            >
              <Text style={[styles.modalBtnText, { color: colors.text }]}>{cancelText}</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={onConfirm}
              style={[
                styles.modalBtn,
                styles.modalBtnDestructive,
                { backgroundColor: destructiveStyle?.backgroundColor || (isDestructive ? colors.error : colors.primary) },
              ]}
            >
              <Text style={[styles.modalBtnText, styles.modalBtnTextDestructive, { color: '#fff' }]}>{confirmText}</Text>
            </AnimatedPressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function HistoryScreen() {
  const colors = useTheme();
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitingId, setExitingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await historyStorage.getAll();
    setEntries(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Process single delete with animation
  const handleDeleteItem = async (id: string) => {
    if (isAnimating || exitingId) return;

    setIsAnimating(true);
    setExitingId(id);

    // Wait for exit animation (96ms) + layout animation (64ms) = 160ms total
    await new Promise((resolve) => setTimeout(resolve, 180));

    // Remove from storage
    await historyStorage.remove(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setExitingId(null);
    setIsAnimating(false);
  };

  // Handle clear all - sequential animation
  const handleClearAll = async () => {
    if (isAnimating || entries.length === 0) return;

    setIsAnimating(true);
    setShowClearModal(false);

    const idsToDelete = [...entries.map((e) => e.id)];

    for (const id of idsToDelete) {
      setExitingId(id);
      await new Promise((resolve) => setTimeout(resolve, 180));
      await historyStorage.remove(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }

    setExitingId(null);
    setIsAnimating(false);
  };

  const visibleEntries = entries;

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <HeroHeader
        eyebrow={`${visibleEntries.length} ENTRI TERSIMPAN`}
        title="Riwayat"
        subtitle="Setiap perhitungan tersimpan otomatis di perangkatmu."
        onBack={() => router.back()}
        height={210}
        showTopBar={true}
        showBackButton={false}
        inlineHeader={true}
        right={
          visibleEntries.length > 0 ? (
            <AnimatedPressable onPress={() => !isAnimating && setShowClearModal(true)}>
              <View style={[styles.headerBtn, { backgroundColor: '#4B7BE5' }]}>
                <Ionicons name="trash-outline" size={18} color="#fff" />
              </View>
            </AnimatedPressable>
          ) : undefined
        }
      />

      {visibleEntries.length === 0 ? (
        <Animated.View entering={FadeIn.delay(200)} style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="time-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada riwayat</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Hasil perhitunganmu akan otomatis muncul di sini setelah kamu pakai modul.
          </Text>
        </Animated.View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxxl }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {visibleEntries.map((item, index) => {
            const cfg = moduleConfig[item.module];
            const isExiting = exitingId === item.id;

            return (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(Math.min(index * 10, 50)).springify().damping(20)}
                exiting={isExiting ? SlideOutLeft.duration(96).easing(Easing.out(Easing.ease)) : undefined}
                layout={Layout.duration(64)}
              >
                <AnimatedPressable scaleTo={0.97}>
                  <View
                    style={[
                      styles.card,
                      { backgroundColor: colors.card, borderColor: colors.borderLight },
                      Shadow.sm,
                    ]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon} size={20} color={cfg.ink} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.cardHeader}>
                        <View style={[styles.tag, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.tagText, { color: cfg.ink }]}>{cfg.tag}</Text>
                        </View>
                        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                          {format(new Date(item.timestamp), 'dd MMM, HH:mm')}
                        </Text>
                      </View>
                      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.summary}
                      </Text>
                    </View>
                    <AnimatedPressable
                      onPress={() => handleDeleteItem(item.id)}
                      scaleTo={0.85}
                    >
                      <View style={styles.deleteBtn}>
                        <Ionicons name="close" size={18} color={colors.textTertiary} />
                      </View>
                    </AnimatedPressable>
                  </View>
                </AnimatedPressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      {/* Custom Clear All Confirmation Modal */}
      <ConfirmModal
        visible={showClearModal}
        title="Hapus semua riwayat?"
        message={`Kamu akan menghapus ${visibleEntries.length} riwayat sekaligus. Tindakan ini tidak bisa dibatalkan.`}
        confirmText="Hapus Semua"
        cancelText="Batal"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
        isDestructive
        destructiveStyle={{ backgroundColor: '#EF4444' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  timestamp: { fontSize: 10, fontWeight: '500' },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  summary: { fontSize: 12, lineHeight: 16 },
  deleteBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  modalBtnDestructive: {
    // Destructive button stands out more
    shadowColor: '#EF4444',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnTextDestructive: {
    fontSize: 15,
    fontWeight: '800',
  },
});
