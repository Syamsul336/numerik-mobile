// =============================================================================
// FILE: src/components/cards/KpiCard.tsx
// =============================================================================
//
// KPI CARD — kartu metrik ala dashboard
// =====================================
//
// Apa fungsi komponen ini?
// ------------------------
// Kartu kecil yang menampilkan SATU metrik (KPI = Key Performance Indicator)
// dengan format yang konsisten:
// - Icon di kiri atas
// - Tanda info di kanan atas
// - Label tipis di tengah ("Materi Selesai")
// - Value besar di bawah ("12")
// - Badge delta opsional ("+5%" dengan panah hijau/merah)
//
// Dipakai di HomeScreen untuk progress belajar user.
//
// Cara pakai:
//   <KpiCard
//     label="Progress Materi"
//     value="5/20"
//     icon="book"
//     iconBg={colors.pastelMint}
//     iconColor={colors.pastelMintInk}
//     delta={{ value: '+25%', positive: true }}
//   />
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme, Spacing, Radius, Shadow } from '../../theme';

interface KpiCardProps {
  label: string;                                  // teks deskripsi metrik
  value: string;                                  // nilai metrik
  icon: keyof typeof Ionicons.glyphMap;           // nama icon (autocomplete!)
  iconBg: string;                                 // warna background icon (pastel)
  iconColor: string;                              // warna icon (ink)
  delta?: { value: string; positive: boolean };   // badge naik/turun
  delay?: number;                                 // delay animasi entry (untuk staggered)
}

export function KpiCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  delta,
  delay = 0,
}: KpiCardProps) {
  const colors = useTheme();

  return (
    // Animated.View dengan entrance animation: muncul dari bawah dengan pegas.
    // delay membuat kartu-kartu muncul satu per satu (staggered).
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(18)}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.borderLight },
        Shadow.sm,
      ]}
    >
      {/* ─── Top row: icon + info icon ────────────────────────────── */}
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        {/* Icon "i" — visual decoration saja (tidak interactive) */}
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.textTertiary}
        />
      </View>

      {/* ─── Label deskripsi ──────────────────────────────────────── */}
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>

      {/* ─── Bottom row: nilai besar + badge delta ────────────────── */}
      <View style={styles.bottomRow}>
        <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
          {value}
        </Text>

        {/* Badge delta cuma muncul kalau ada */}
        {delta && (
          <View
            style={[
              styles.deltaBadge,
              {
                backgroundColor: delta.positive
                  ? colors.successSoft
                  : colors.errorSoft,
              },
            ]}
          >
            {/* Panah naik atau turun sesuai positive/negative */}
            <Ionicons
              name={delta.positive ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={delta.positive ? colors.success : colors.error}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: delta.positive ? colors.success : colors.error,
              }}
            >
              {delta.value}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,                       // ambil sisa space (untuk grid 2-kolom)
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minWidth: 0,                    // izinkan shrink (kalau text panjang)
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: { fontSize: 18, fontWeight: '800', flex: 1 },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,                         // jarak antara icon panah dan text
  },
});
