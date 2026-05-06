// =============================================================================
// FILE: src/screens/IntegralScreen.tsx
// =============================================================================
//
// INTEGRAL SCREEN — layar modul Integral Numerik
// ===============================================
//
// Apa fungsi layar ini?
// ---------------------
// Tempat user menghitung integral tentu dengan 3 metode (Trapezoidal,
// Simpson 1/3, Romberg). Layout urutan:
//
// 1. Hero header navy "Integral Numerik"
// 2. Card input fungsi f(x) — tap untuk buka MathKeyboard
//    Live preview LaTeX (rumus terlihat seperti di buku)
// 3. Card pilihan METODE — 3 chip (trapezoidal/simpson/romberg)
// 4. Card BATAS dan jumlah pias — slider untuk a, b, n
// 5. Tombol HITUNG (tampil sebagai sticky button di bawah)
// 6. Setelah hitung:
//    - ResultHero besar dengan nilai integral
//    - IntegralChart (grafik kurva + trapesium)
//    - Daftar StepCard (langkah-langkah perhitungan)
//
// State management:
// - Pakai useIntegralStore (Zustand) untuk simpan input + hasil
// - Auto-save ke historyStorage saat hitung berhasil
// - Auto-buka MathKeyboard saat user tap fungsi
//
// Logika utama ada di src/core/storage/integralStore.ts (action `calculate()`)
// =============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

// Store + types
import { useIntegralStore } from '../core/storage/integralStore';
import type { IntegralMethod } from '../core/numerical/integration';
// Theme
import { useTheme, Spacing, Radius, Shadow } from '../theme';
// Komponen UI khusus integral
import { HeroHeader } from '../components/ui/HeroHeader';
import { IntegralChart } from '../components/charts/IntegralChart';
import { MathView } from '../components/math/MathView';
import { MathKeyboard } from '../components/math/MathKeyboard';
import { exprToLatex, formatNum, integralLatex } from '../components/math/exprToLatex';
import { ResultHero } from '../components/cards/ResultHero';
import { StepCard } from '../components/cards/StepCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';

// Daftar metode dengan label & caption deskriptif
const methods: { value: IntegralMethod; label: string; caption: string }[] = [
  { value: 'trapezoidal', label: 'Trapesium', caption: 'O(h²)' },
  { value: 'simpson', label: 'Simpson 1/3', caption: 'O(h⁴) · n genap' },
  { value: 'romberg', label: 'Romberg', caption: 'Ekstrapolasi' },
];

export default function IntegralScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const state = useIntegralStore();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const fnLatex = exprToLatex(state.function);
  const problemLatex = integralLatex(state.function, state.a, state.b);
  const chartWidth = width - Spacing.lg * 2;

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader
          eyebrow="MODUL"
          title="Integral Numerik"
          subtitle="Hitung ∫ₐᵇ f(x) dx dengan tiga metode klasik."
          onBack={() => router.back()}
          height={210}
          showTopBar={false}
        />

        {/* Problem preview card */}
        <View style={styles.section}>
          <Animated.View
            entering={FadeInUp.delay(120).springify().damping(16)}
            style={[
              styles.previewCard,
              { backgroundColor: colors.card, borderColor: colors.borderLight },
              Shadow.sm,
            ]}
          >
            <View style={styles.previewHeader}>
              <View style={[styles.previewBadge, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="document-text-outline" size={12} color={colors.primary} />
                <Text style={[styles.previewBadgeText, { color: colors.primary }]}>SOAL</Text>
              </View>
              <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>
                preview real-time
              </Text>
            </View>
            <View style={styles.previewMath}>
              <MathView
                latex={problemLatex || '\\text{tulis fungsi terlebih dulu}'}
                color={colors.text}
                fontSize={20}
                minHeight={48}
              />
            </View>
          </Animated.View>
        </View>

        {/* Chart */}
        <View style={styles.section}>
          <Animated.View
            entering={FadeInUp.delay(180).springify().damping(16)}
            style={[
              styles.chartCard,
              { backgroundColor: colors.card, borderColor: colors.borderLight },
              Shadow.sm,
            ]}
          >
            <View style={styles.chartHeaderRow}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Visualisasi
              </Text>
              <View style={[styles.miniBadge, { backgroundColor: colors.primarySoft }]}>
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>
                  n = {state.n}
                </Text>
              </View>
            </View>
            <IntegralChart
              function={state.function}
              a={state.a}
              b={state.b}
              n={state.n}
              width={chartWidth - Spacing.lg * 2}
              height={220}
            />
          </Animated.View>
        </View>

        {/* Function input — opens math keyboard */}
        <View style={styles.section}>
          <SectionHeader title="Fungsi & Batas" caption="Ketuk untuk membuka keyboard matematika" />

          <AnimatedPressable
            onPress={() => setKeyboardOpen(true)}
            style={{ marginBottom: Spacing.md }}
          >
            <View
              style={[
                styles.fnInput,
                { backgroundColor: colors.card, borderColor: colors.primarySoft },
                Shadow.sm,
              ]}
            >
              <View style={styles.fnInputLeft}>
                <View style={[styles.fnIcon, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="calculator" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fnLabel, { color: colors.textSecondary }]}>
                    f(x) =
                  </Text>
                  <View style={{ minHeight: 30 }}>
                    {state.function.length > 0 ? (
                      <MathView
                        latex={fnLatex}
                        color={colors.text}
                        fontSize={18}
                        minHeight={28}
                        center={false}
                      />
                    ) : (
                      <Text style={{ color: colors.textTertiary, fontStyle: 'italic' }}>
                        ketuk untuk menulis fungsi
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </View>
          </AnimatedPressable>

          <View style={styles.boundsRow}>
            <BoundField
              label="a (batas bawah)"
              value={state.a}
              onChange={state.setA}
              colors={colors}
            />
            <View style={{ width: Spacing.md }} />
            <BoundField
              label="b (batas atas)"
              value={state.b}
              onChange={state.setB}
              colors={colors}
            />
          </View>

          <View
            style={[
              styles.sliderCard,
              { backgroundColor: colors.card, borderColor: colors.borderLight },
              Shadow.sm,
            ]}
          >
            <View style={styles.sliderTop}>
              <Text style={[styles.sliderLabel, { color: colors.text }]}>
                Jumlah pias (n)
              </Text>
              <View style={[styles.sliderBadge, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>
                  {state.n}
                </Text>
              </View>
            </View>
            <Slider
              minimumValue={2}
              maximumValue={100}
              step={1}
              value={state.n}
              onValueChange={state.setN}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderHints}>
              <Text style={[styles.hintText, { color: colors.textTertiary }]}>2</Text>
              <Text style={[styles.hintText, { color: colors.textTertiary }]}>50</Text>
              <Text style={[styles.hintText, { color: colors.textTertiary }]}>100</Text>
            </View>
          </View>
        </View>

        {/* Method selector */}
        <View style={styles.section}>
          <SectionHeader title="Metode" />
          <View style={styles.methodRow}>
            {methods.map((m) => {
              const active = state.method === m.value;
              return (
                <AnimatedPressable
                  key={m.value}
                  onPress={() => state.setMethod(m.value)}
                  style={styles.methodWrap}
                  scaleTo={0.94}
                >
                  <View
                    style={[
                      styles.methodCard,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.borderLight,
                      },
                      active ? Shadow.md : Shadow.sm,
                    ]}
                  >
                    <Ionicons
                      name={
                        m.value === 'trapezoidal'
                          ? 'analytics-outline'
                          : m.value === 'simpson'
                          ? 'pulse-outline'
                          : 'layers-outline'
                      }
                      size={18}
                      color={active ? '#fff' : colors.primary}
                    />
                    <Text
                      style={{
                        color: active ? '#fff' : colors.text,
                        fontWeight: '800',
                        fontSize: 13,
                        marginTop: 6,
                      }}
                    >
                      {m.label}
                    </Text>
                    <Text
                      style={{
                        color: active ? 'rgba(255,255,255,0.78)' : colors.textSecondary,
                        fontSize: 10,
                        marginTop: 2,
                      }}
                    >
                      {m.caption}
                    </Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>

        {/* Calculate button */}
        <View style={styles.section}>
          <AnimatedPressable
            onPress={state.calculate}
            disabled={state.isCalculating}
            scaleTo={0.97}
          >
            <View style={[styles.calcBtn, { backgroundColor: colors.primary }, Shadow.md]}>
              {state.isCalculating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="play" size={18} color="#fff" />
                  <Text style={styles.calcBtnText}>Hitung Integral</Text>
                </>
              )}
            </View>
          </AnimatedPressable>
        </View>

        {/* Error */}
        {state.error && (
          <Animated.View
            entering={FadeIn}
            style={[
              styles.errorBox,
              { backgroundColor: colors.errorSoft, borderColor: colors.error },
            ]}
          >
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={{ color: colors.error, marginLeft: 8, flex: 1, fontWeight: '600' }}>
              {state.error}
            </Text>
          </Animated.View>
        )}

        {/* Result */}
        {state.result && (
          <View style={styles.section}>
            <ResultHero
              label="Nilai Integral"
              value={`≈ ${formatNum(state.result.value, 8)}`}
              problemLatex={problemLatex}
              method={state.result.methodName}
              stats={[
                { label: 'h', value: formatNum(state.result.h) },
                { label: 'n', value: String(state.result.n) },
                { label: 'metode', value: state.result.methodName.split(' ')[0] },
              ]}
            />

            <SectionHeader
              title="Langkah Perhitungan"
              caption="Setiap kartu menjelaskan satu tahap dengan notasi"
              style={{ marginTop: Spacing.md }}
            />
            {state.result.blocks.map((b, i) => (
              <StepCard
                key={i}
                index={i + 1}
                title={b.title}
                description={b.description}
                latex={b.latex}
                values={b.values}
                tone={b.tone}
                delay={i * 80}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <MathKeyboard
        visible={keyboardOpen}
        initialValue={state.function}
        onClose={() => setKeyboardOpen(false)}
        onSubmit={(v) => {
          state.setFunction(v);
          setKeyboardOpen(false);
        }}
      />
    </View>
  );
}

function BoundField({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  colors: ReturnType<typeof useTheme>;
}) {
  // Local text mirrors the value but lets users type intermediate states (e.g. "0.")
  const [text, setText] = useState(String(value));
  // Only sync from external if the canonical value differs from the parsed text
  React.useEffect(() => {
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed) || parsed !== value) {
      setText(String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.boundLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.boundInput,
          { backgroundColor: colors.card, borderColor: colors.borderLight },
          Shadow.sm,
        ]}
      >
        <TextInput
          value={text}
          onChangeText={(v) => {
            setText(v);
            const n = parseFloat(v);
            if (!isNaN(n)) onChange(n);
          }}
          keyboardType="numbers-and-punctuation"
          style={{ flex: 1, fontSize: 20, fontWeight: '700', color: colors.text }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  previewCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: -Spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  previewMeta: { fontSize: 10, fontWeight: '500' },
  previewMath: { minHeight: 56, justifyContent: 'center' },
  chartCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: { fontSize: 14, fontWeight: '800' },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  fnInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  fnInputLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  fnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fnLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  boundsRow: { flexDirection: 'row', marginBottom: Spacing.md },
  boundLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
  boundInput: {
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  sliderCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  sliderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: { fontSize: 13, fontWeight: '700' },
  sliderBadge: {
    minWidth: 34,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sliderHints: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  hintText: { fontSize: 10 },
  methodRow: { flexDirection: 'row', gap: 8 },
  methodWrap: { flex: 1 },
  methodCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  calcBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  calcBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  errorBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
});
