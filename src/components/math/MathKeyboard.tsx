// =============================================================================
// FILE: src/components/math/MathKeyboard.tsx
// =============================================================================
//
// MATH KEYBOARD — keyboard kustom untuk input rumus matematika
// =============================================================
//
// Apa fungsi komponen ini?
// ------------------------
// Modal yang muncul saat user tap field "f(x) = ...". Berisi keyboard
// virtual untuk mengetik rumus matematika dengan cepat — tanpa harus
// kesulitan mengetik simbol-simbol khusus dari keyboard sistem.
//
// Tab yang tersedia:
// - "123"     : angka, operator dasar (+, −, ×, ÷), simbol (π, e, √)
// - "f(x)"    : fungsi (sin, cos, tan, log, ln, exp)
// - "Lanjut"  : template kalkulus (x², 1/x, sin²x, dst.)
//
// Fitur tambahan:
// - Caret navigation (panah kiri-kanan) untuk pindah posisi kursor
// - Smart backspace (hapus group seperti "sin(" sekaligus)
// - AC (clear all)
// - Live preview: tampilkan input saat ini di atas keyboard
// - Tombol OK untuk submit
//
// Cara pakai:
//   <MathKeyboard
//     visible={showKeyboard}
//     initialValue="x^2"
//     onSubmit={(value) => setFunction(value)}
//     onClose={() => setShowKeyboard(false)}
//   />
//
// CATATAN: Komponen ini cukup panjang (500+ lines) karena banyak tombol
// dan logika navigasi. Strukturnya:
// 1. Helper functions di atas (insertAtCaret, smartBackspace, dll.)
// 2. Definisi tombol-tombol (KEYS_NUMERIC, KEYS_FUNCTIONS, dll.)
// 3. Komponen MathKeyboard utama
// 4. Sub-komponen (KeyButton, TabButton)
// 5. Styles
// =============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,         // animasi masuk: fade in
  FadeOut,        // animasi keluar: fade out
  SlideInDown,    // animasi masuk: slide dari bawah
  SlideOutDown,   // animasi keluar: slide ke bawah
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, Radius, Shadow } from '../../theme';

interface MathKeyboardProps {
  visible: boolean;                    // tampilkan/sembunyikan
  initialValue: string;                // nilai awal saat keyboard dibuka
  onSubmit: (value: string) => void;   // dipanggil saat user tekan OK
  onClose: () => void;                 // dipanggil saat user tap X / luar modal
  title?: string;
  /** Sembunyikan tab kalkulus (untuk input geometri yang cuma butuh angka) */
  showCalculus?: boolean;
}

type KeyDef = {
  label: string;
  insert: string;
  /** How many positions to move caret backwards after inserting (e.g. 1 to land inside parens) */
  caretBack?: number;
  span?: number; // grid span (1 default, 2 wide)
  variant?: 'op' | 'fn' | 'num' | 'wide' | 'special';
};

type KeyTab = 'basic' | 'fn' | 'calc';

const numericKeys: KeyDef[] = [
  { label: '7', insert: '7', variant: 'num' },
  { label: '8', insert: '8', variant: 'num' },
  { label: '9', insert: '9', variant: 'num' },
  { label: '÷', insert: '/', variant: 'op' },
  { label: '4', insert: '4', variant: 'num' },
  { label: '5', insert: '5', variant: 'num' },
  { label: '6', insert: '6', variant: 'num' },
  { label: '×', insert: '*', variant: 'op' },
  { label: '1', insert: '1', variant: 'num' },
  { label: '2', insert: '2', variant: 'num' },
  { label: '3', insert: '3', variant: 'num' },
  { label: '−', insert: '-', variant: 'op' },
  { label: '0', insert: '0', variant: 'num' },
  { label: '.', insert: '.', variant: 'num' },
  { label: 'x', insert: 'x', variant: 'num' },
  { label: '+', insert: '+', variant: 'op' },
];

const symbolKeys: KeyDef[] = [
  { label: '(', insert: '(', variant: 'op' },
  { label: ')', insert: ')', variant: 'op' },
  { label: 'x²', insert: 'x^2', variant: 'fn' },
  { label: 'xⁿ', insert: '^', variant: 'fn' },
  { label: '√x', insert: 'sqrt()', caretBack: 1, variant: 'fn' },
  { label: 'π', insert: 'pi', variant: 'fn' },
  { label: 'e', insert: 'e', variant: 'fn' },
  { label: '|x|', insert: 'abs()', caretBack: 1, variant: 'fn' },
];

const functionKeys: KeyDef[] = [
  { label: 'sin', insert: 'sin()', caretBack: 1, variant: 'fn' },
  { label: 'cos', insert: 'cos()', caretBack: 1, variant: 'fn' },
  { label: 'tan', insert: 'tan()', caretBack: 1, variant: 'fn' },
  { label: 'log', insert: 'log10()', caretBack: 1, variant: 'fn' },
  { label: 'ln', insert: 'log()', caretBack: 1, variant: 'fn' },
  { label: 'eˣ', insert: 'exp()', caretBack: 1, variant: 'fn' },
  { label: 'asin', insert: 'asin()', caretBack: 1, variant: 'fn' },
  { label: 'acos', insert: 'acos()', caretBack: 1, variant: 'fn' },
  { label: 'atan', insert: 'atan()', caretBack: 1, variant: 'fn' },
  { label: 'sinh', insert: 'sinh()', caretBack: 1, variant: 'fn' },
  { label: 'cosh', insert: 'cosh()', caretBack: 1, variant: 'fn' },
  { label: 'tanh', insert: 'tanh()', caretBack: 1, variant: 'fn' },
];

const calcKeys: KeyDef[] = [
  { label: '∫dx', insert: '', variant: 'fn' }, // visual hint only
  { label: 'x²', insert: 'x^2', variant: 'fn' },
  { label: 'x³', insert: 'x^3', variant: 'fn' },
  { label: '1/x', insert: '1/x', variant: 'fn' },
  { label: 'x^(1/2)', insert: 'x^(1/2)', variant: 'fn' },
  { label: '∛x', insert: 'nthRoot(x,3)', variant: 'fn' },
  { label: 'sin²x', insert: 'sin(x)^2', variant: 'fn' },
  { label: 'cos²x', insert: 'cos(x)^2', variant: 'fn' },
];

export function MathKeyboard({
  visible,
  initialValue,
  onSubmit,
  onClose,
  title = 'Tulis fungsi f(x)',
  showCalculus = true,
}: MathKeyboardProps) {
  const colors = useTheme();
  const [value, setValue] = useState(initialValue);
  const [caret, setCaret] = useState(initialValue.length);
  const [tab, setTab] = useState<KeyTab>('basic');

  // Sync when re-opened
  React.useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setCaret(initialValue.length);
      setTab('basic');
    }
  }, [visible, initialValue]);

  const insert = (key: KeyDef) => {
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    const next = before + key.insert + after;
    const newCaret = caret + key.insert.length - (key.caretBack ?? 0);
    setValue(next);
    setCaret(newCaret);
  };

  const backspace = () => {
    if (caret === 0) return;
    const before = value.slice(0, caret);
    const after = value.slice(caret);
    // smart: if just-deleted closes a known fn like "sin(", drop the whole token
    const fnMatch = before.match(/(sin|cos|tan|log10|log|asin|acos|atan|sinh|cosh|tanh|sqrt|abs|exp|nthRoot)\($/);
    if (fnMatch) {
      const drop = fnMatch[0].length;
      setValue(before.slice(0, -drop) + after);
      setCaret(caret - drop);
      return;
    }
    setValue(before.slice(0, -1) + after);
    setCaret(caret - 1);
  };

  const clearAll = () => {
    setValue('');
    setCaret(0);
  };

  const moveCaret = (delta: number) => {
    setCaret(Math.max(0, Math.min(value.length, caret + delta)));
  };

  const submit = () => {
    onSubmit(value);
  };

  const tabs: { key: KeyTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'basic', label: '123', icon: 'keypad-outline' },
    { key: 'fn', label: 'f(x)', icon: 'pulse-outline' },
    ...(showCalculus
      ? [{ key: 'calc' as KeyTab, label: 'Lanjut', icon: 'infinite-outline' as const }]
      : []),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(180)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.primary,
            },
            Shadow.lg,
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Ionicons name="calculator" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Display with caret */}
          <View
            style={[
              styles.display,
              { backgroundColor: colors.primaryWash, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.displayText, { color: colors.text }]}>
              {value.slice(0, caret)}
              <Text style={{ color: colors.primary }}>|</Text>
              {value.slice(caret)}
            </Text>
            <Text style={[styles.placeholder, { color: colors.textTertiary }]} numberOfLines={1}>
              {value.length === 0 ? 'contoh: x^2 + sin(x)' : ' '}
            </Text>
          </View>

          {/* Caret nav row */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => moveCaret(-1)}
              style={[styles.navBtn, { backgroundColor: colors.primaryWash }]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => moveCaret(1)}
              style={[styles.navBtn, { backgroundColor: colors.primaryWash }]}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={clearAll}
              style={[styles.navBtn, { backgroundColor: colors.errorSoft, paddingHorizontal: 14 }]}
            >
              <Text style={{ color: colors.error, fontWeight: '700', fontSize: 12 }}>AC</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={backspace}
              style={[styles.navBtn, { backgroundColor: colors.primaryWash, paddingHorizontal: 14 }]}
            >
              <Ionicons name="backspace-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {tabs.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor:
                      tab === t.key ? colors.primary : 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={t.icon}
                  size={14}
                  color={tab === t.key ? '#fff' : colors.textSecondary}
                />
                <Text
                  style={{
                    color: tab === t.key ? '#fff' : colors.textSecondary,
                    fontWeight: '700',
                    fontSize: 12,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Keys */}
          <ScrollView
            style={{ maxHeight: 320 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {tab === 'basic' && (
              <View style={styles.grid}>
                {numericKeys.map((k, i) => (
                  <Key key={`n-${i}`} keyDef={k} onPress={insert} colors={colors} cols={4} />
                ))}
                <View style={styles.subHeader}>
                  <Text style={[styles.subTitle, { color: colors.textSecondary }]}>
                    Simbol
                  </Text>
                </View>
                {symbolKeys.map((k, i) => (
                  <Key key={`s-${i}`} keyDef={k} onPress={insert} colors={colors} cols={4} />
                ))}
              </View>
            )}

            {tab === 'fn' && (
              <View style={styles.grid}>
                {functionKeys.map((k, i) => (
                  <Key key={`f-${i}`} keyDef={k} onPress={insert} colors={colors} cols={3} />
                ))}
              </View>
            )}

            {tab === 'calc' && (
              <View style={styles.grid}>
                {calcKeys.map((k, i) => (
                  <Key key={`c-${i}`} keyDef={k} onPress={insert} colors={colors} cols={3} />
                ))}
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textTertiary,
                    paddingHorizontal: 6,
                    marginTop: 8,
                  }}
                >
                  Tip: ketuk template, lalu ganti variabel sesuai kebutuhanmu.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Done button */}
          <TouchableOpacity
            onPress={submit}
            activeOpacity={0.85}
            style={[styles.doneBtn, { backgroundColor: colors.primary }, Shadow.md]}
          >
            <Ionicons name="checkmark" size={18} color="white" />
            <Text style={styles.doneText}>Pakai fungsi ini</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Key({
  keyDef,
  onPress,
  colors,
  cols,
}: {
  keyDef: KeyDef;
  onPress: (k: KeyDef) => void;
  colors: ReturnType<typeof useTheme>;
  cols: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg =
    keyDef.variant === 'op'
      ? colors.primary
      : keyDef.variant === 'fn'
      ? colors.primarySoft
      : colors.background;

  const fg =
    keyDef.variant === 'op'
      ? '#FFFFFF'
      : keyDef.variant === 'fn'
      ? colors.primary
      : colors.text;

  const widthPct = `${100 / cols - 2}%` as const;

  return (
    <Animated.View style={[{ width: widthPct }, animStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 14, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 320 });
        }}
        onPress={() => onPress(keyDef)}
        style={[
          styles.key,
          {
            backgroundColor: bg,
            borderColor: keyDef.variant === 'num' ? colors.border : 'transparent',
          },
        ]}
      >
        <Text style={[styles.keyText, { color: fg }]}>{keyDef.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,21,104,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 14, fontWeight: '700' },
  display: {
    minHeight: 52,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  displayText: { fontSize: 18, fontFamily: 'monospace' as any, fontWeight: '600' },
  placeholder: { fontSize: 11, marginTop: 2 },
  navRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subHeader: { width: '100%', marginTop: 8, marginBottom: 4 },
  subTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  key: {
    height: 46,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  keyText: { fontSize: 16, fontWeight: '700' },
  doneBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
  },
  doneText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
