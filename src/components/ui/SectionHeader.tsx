// =============================================================================
// FILE: src/components/ui/SectionHeader.tsx
// =============================================================================
//
// SECTION HEADER — judul untuk pemisah section di layar
// =====================================================
//
// Apa fungsi komponen ini?
// ------------------------
// Komponen "judul section" yang konsisten — terdiri dari:
// - Title (judul utama)
// - Caption (deskripsi singkat di bawah title, opsional)
// - Tombol aksi di kanan (opsional, contoh: "Lihat semua")
//
// Dipakai di banyak layar untuk memisahkan area yang berbeda:
//   "Modul Pembelajaran"        Lihat semua →
//   "Pelajari semua materi numerik"
//
// Cara pakai:
//   <SectionHeader
//     title="Modul Pembelajaran"
//     caption="Pelajari semua materi numerik"
//     actionLabel="Lihat semua"
//     onAction={() => router.push('/materi')}
//   />
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme, Spacing } from '../../theme';

interface SectionHeaderProps {
  title: string;                       // Judul wajib
  caption?: string;                    // Deskripsi opsional
  actionLabel?: string;                // Label tombol aksi opsional
  onAction?: () => void;               // Callback saat tombol ditap
  style?: StyleProp<ViewStyle>;        // Style tambahan dari luar
}

export function SectionHeader({
  title,
  caption,
  actionLabel,
  onAction,
  style,
}: SectionHeaderProps) {
  const colors = useTheme();

  return (
    <View style={[styles.row, style]}>
      {/* Kiri: title + caption (mengambil sisa space) */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {/* Conditional render: cuma tampilkan kalau caption ada */}
        {caption && (
          <Text style={[styles.caption, { color: colors.textSecondary }]}>
            {caption}
          </Text>
        )}
      </View>

      {/* Kanan: tombol aksi (kalau ada) */}
      {actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',          // title kiri, action kanan
    alignItems: 'flex-end',        // teks aligned di bawah supaya rapi
    marginBottom: Spacing.md,
  },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  caption: { fontSize: 12, marginTop: 2 },
});
