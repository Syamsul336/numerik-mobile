// =============================================================================
// FILE: src/components/ui/AnimatedPressable.tsx
// =============================================================================
//
// ANIMATED PRESSABLE — pembungkus tombol dengan efek pegas saat ditekan
// =====================================================================
//
// Apa fungsi komponen ini?
// ------------------------
// Pembungkus untuk SEMUA tombol/card yang bisa ditekan di aplikasi. Saat
// user menekan, komponen ini akan otomatis MENGECIL sedikit (efek pegas),
// lalu kembali ke ukuran semula saat dilepas.
//
// Manfaat: feedback visual yang menyenangkan untuk user — terasa "alive"
// dan responsive seperti aplikasi modern.
//
// Apa itu reanimated?
// -------------------
// react-native-reanimated adalah library animasi yang jalan di THREAD UI
// (terpisah dari thread JS). Hasilnya: animasi mulus 60fps walaupun
// JS sedang sibuk. Jauh lebih halus daripada animasi React Native standar.
//
// Cara pakai:
//   <AnimatedPressable onPress={...} style={...}>
//     <Text>Tap Me</Text>
//   </AnimatedPressable>
// =============================================================================

import React from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,       // hook untuk nilai yang bisa dianimasikan
  useAnimatedStyle,     // hook untuk style yang bereaksi ke shared value
  withSpring,           // animasi tipe pegas (spring)
} from 'react-native-reanimated';

interface AnimatedPressableProps {
  onPress?: () => void;             // callback saat ditap
  onLongPress?: () => void;         // callback saat ditahan lama
  style?: StyleProp<ViewStyle>;     // style untuk view luar
  children: React.ReactNode;        // konten di dalam (Text/Icon/dll.)
  scaleTo?: number;                 // skala saat ditekan (default 0.96 = 96%)
  disabled?: boolean;
}

/**
 * AnimatedPressable — pembungkus dengan efek spring saat ditekan.
 */
export function AnimatedPressable({
  onPress,
  onLongPress,
  style,
  children,
  scaleTo = 0.96,
  disabled,
}: AnimatedPressableProps) {
  // Shared value: nilai yang bisa dibaca/diubah di JS thread DAN UI thread.
  // Dimulai dari 1 (ukuran 100% / normal).
  const scale = useSharedValue(1);

  // Style yang bereaksi ke perubahan `scale`.
  // Setiap kali `scale.value` diubah → animatedStyle otomatis update.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        // ─── Saat jari mulai menekan ────────────────────────────────────
        onPressIn={() => {
          // Animasi ke scaleTo (0.96 = mengecil 4%)
          // damping & stiffness mengontrol "rasa" pegas:
          // - damping tinggi → lebih cepat berhenti
          // - stiffness tinggi → respons lebih cepat
          scale.value = withSpring(scaleTo, { damping: 16, stiffness: 280 });
        }}
        // ─── Saat jari dilepas ──────────────────────────────────────────
        onPressOut={() => {
          // Animasi balik ke 1 (ukuran normal) dengan pegas yang sedikit lebih lembut
          scale.value = withSpring(1, { damping: 14, stiffness: 220 });
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
