// =============================================================================
// FILE: src/components/ui/BrandLogo.tsx
// =============================================================================
//
// BRAND LOGO — komponen logo "Numerik"
// =====================================
//
// Apa fungsi komponen ini?
// ------------------------
// Render logo brand aplikasi sebagai gambar dari assets/icon.png
//
// Catatan:
// - Menggunakan Image component untuk menampilkan icon.png
// - Props bare dan rounded dipertahankan untuk backward compatibility
// =============================================================================

import React from 'react';
import { View, Image } from 'react-native';

interface BrandLogoProps {
  /** Ukuran logo (lebar = tinggi) dalam pixel */
  size?: number;
  /** Bulatkan sudut jadi squircle */
  rounded?: boolean;
  /** Cuma render glyph tanpa background (untuk pakai di header navy) */
  bare?: boolean;
}

/**
 * BrandLogo — logo aplikasi "Numerik".
 * Menggunakan gambar dari assets/icon.png
 */
export function BrandLogo({ size = 56, rounded = false, bare = false }: BrandLogoProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={require('../../../assets/icon.png')}
        style={{
          width: size,
          height: size,
          borderRadius: rounded ? size * 0.28 : 0,
        }}
        resizeMode="contain"
      />
    </View>
  );
}