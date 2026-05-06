// =============================================================================
// FILE: src/screens/InterpolationScreen.tsx
// =============================================================================
//
// INTERPOLATION SCREEN — layar modul Interpolasi
// ===============================================
//
// Apa fungsi layar ini?
// ---------------------
// Tempat user belajar interpolasi polinomial. User memasukkan beberapa
// titik (x, y), pilih metode (Lagrange / Newton), lalu app menghitung
// polinomial yang melewati semua titik dan mengevaluasinya pada x_eval.
//
// Layout:
// 1. Hero header navy "Interpolasi"
// 2. Card daftar TITIK (x, y) — bisa tambah/hapus titik
// 3. Input x_eval (nilai yang mau dievaluasi)
// 4. Pilihan METODE (Lagrange/Newton chip)
// 5. Hasil otomatis muncul:
//    - ResultHero: nilai P(x_eval)
//    - InterpolationChart
//    - StepCard daftar langkah
//
// Auto-calculate dengan DEBOUNCE 1.2 detik:
// Setiap kali user ubah input, calculate dipanggil setelah 1.2 detik
// berhenti mengetik. Tujuannya: tidak hitung di tiap keystroke
// (yang akan boros & UI lag).
// =============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, Layout } from 'react-native-reanimated';

// Algoritma & types
import {
  calculateLagrange,
  calculateNewtonDivided,
  generateLagrangeCurve,
  type Point,
} from '../core/numerical/interpolation';
import { historyStorage } from '../core/storage/historyStorage';
import { formatNum } from '../components/math/exprToLatex';
// Theme & komponen UI
import { useTheme, Spacing, Radius, Shadow } from '../theme';
import { HeroHeader } from '../components/ui/HeroHeader';
import { InterpolationChart } from '../components/charts/InterpolationChart';
import { MathView } from '../components/math/MathView';
import { ResultHero } from '../components/cards/ResultHero';
import { StepCard } from '../components/cards/StepCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';

type Method = 'lagrange' | 'newton';

interface CalculationResult {
  methodName: string;
  evaluateValue: number;
  blocks: Array<{
    title: string;
    description: string;
    latex?: string;
    values?: Record<string, number>;
    tone?: 'info' | 'success' | 'warning';
  }>;
}

export default function InterpolationScreen() {
  const colors = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [points, setPoints] = useState<Point[]>([
    { x: 0, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 2 },
    { x: 3, y: 5 },
  ]);
  const [xEval, setXEval] = useState('');
  const [method, setMethod] = useState<Method>('lagrange');
  const [savedKey, setSavedKey] = useState<string>(''); // dedup history saves
  const [calculatedResult, setCalculatedResult] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    const parsed = parseFloat(xEval);
    if (isNaN(parsed)) return;
    try {
      const calcResult = method === 'lagrange'
        ? calculateLagrange({ points, xEval: parsed })
        : calculateNewtonDivided({ points, xEval: parsed });
      setCalculatedResult(calcResult);

      // Save to history
      const key = `${method}|${points.map((p) => `${p.x},${p.y}`).join(';')}|${xEval}`;
      if (key !== savedKey) {
        historyStorage.add({
          module: 'interpolation',
          title: `${calcResult.methodName} pada ${points.length} titik`,
          summary: `P(${formatNum(parsed)}) = ${formatNum(calcResult.evaluateValue, 6)}`,
          data: { method, points, xEval: parsed, value: calcResult.evaluateValue },
        });
        setSavedKey(key);
      }
    } catch (e) {
      console.log('Calculation error:', e);
    }
  };

  const curve = useMemo(() => {
    try {
      return generateLagrangeCurve(points);
    } catch {
      return [];
    }
  }, [points]);

  const updatePoint = (i: number, key: 'x' | 'y', value: string) => {
    // Only allow numbers, decimal point, and minus sign
    const filtered = value.replace(/[^0-9.-]/g, '');
    // Prevent multiple decimal points
    const parts = filtered.split('.');
    if (parts.length > 2) return;
    // Prevent multiple minus signs
    const minusCount = (filtered.match(/-/g) || []).length;
    if (minusCount > 1) return;
    // Minus only at the beginning
    if (filtered.indexOf('-') > 0) return;

    if (filtered === '' || filtered === '-') {
      const next = [...points];
      next[i] = { ...next[i], [key]: key === 'x' ? 0 : 0 };
      setPoints(next);
      return;
    }

    const num = parseFloat(filtered);
    if (isNaN(num)) return;
    const next = [...points];
    next[i] = { ...next[i], [key]: num };
    setPoints(next);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader
          eyebrow="MODUL"
          title="Interpolasi"
          subtitle="Rekonstruksi polinomial dari titik data dengan Lagrange atau Newton."
          onBack={() => router.back()}
          height={210}
          showTopBar={false}
        />

        {/* Chart card */}
        <View style={styles.section}>
          <Animated.View
            entering={FadeInUp.delay(120).springify().damping(16)}
            style={[
              styles.chartCard,
              { backgroundColor: colors.card, borderColor: colors.borderLight },
              Shadow.sm,
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Visualisasi</Text>
              <View style={[styles.miniBadge, { backgroundColor: colors.primarySoft }]}>
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>
                  {points.length} titik
                </Text>
              </View>
            </View>
            <InterpolationChart
              points={points}
              curve={curve}
              width={width - Spacing.lg * 4}
              height={220}
              xEval={xEval}
              yEval={calculatedResult?.evaluateValue}
            />
          </Animated.View>
        </View>

        {/* Method picker */}
        <View style={styles.section}>
          <SectionHeader title="Metode" />
          <View style={styles.methodRow}>
            {(['lagrange', 'newton'] as Method[]).map((m) => {
              const active = method === m;
              return (
                <AnimatedPressable
                  key={m}
                  onPress={() => setMethod(m)}
                  style={styles.methodWrap}
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
                      name={m === 'lagrange' ? 'pulse-outline' : 'grid-outline'}
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
                      {m === 'lagrange' ? 'Lagrange' : 'Newton DD'}
                    </Text>
                    <Text
                      style={{
                        color: active ? 'rgba(255,255,255,0.78)' : colors.textSecondary,
                        fontSize: 10,
                        marginTop: 2,
                      }}
                    >
                      {m === 'lagrange' ? 'Basis langsung' : 'Beda terbagi'}
                    </Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>

        {/* Points editor */}
        <View style={styles.section}>
          <SectionHeader
            title="Titik Data"
            actionLabel="+ Tambah"
            onAction={() =>
              setPoints([...points, { x: points[points.length - 1].x + 1, y: 0 }])
            }
          />
          {points.map((p, i) => (
            <Animated.View
              key={i}
              entering={FadeIn}
              layout={Layout.springify().damping(18)}
              style={[
                styles.pointRow,
                { backgroundColor: colors.card, borderColor: colors.borderLight },
                Shadow.sm,
              ]}
            >
              <View style={[styles.pointBadge, { backgroundColor: colors.primarySoft }]}>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 11 }}>
                  P{i + 1}
                </Text>
              </View>
              <View style={styles.pointInputWrap}>
                <Text style={[styles.pointFieldLabel, { color: colors.textTertiary }]}>x</Text>
                <TextInput
                  value={p.x.toString()}
                  onChangeText={(v) => updatePoint(i, 'x', v)}
                  keyboardType="decimal-pad"
                  style={[styles.pointInput, { color: colors.text }]}
                />
              </View>
              <View style={styles.pointInputWrap}>
                <Text style={[styles.pointFieldLabel, { color: colors.textTertiary }]}>y</Text>
                <TextInput
                  value={p.y.toString()}
                  onChangeText={(v) => updatePoint(i, 'y', v)}
                  keyboardType="decimal-pad"
                  style={[styles.pointInput, { color: colors.text }]}
                />
              </View>
              {points.length > 2 && (
                <AnimatedPressable
                  onPress={() => setPoints(points.filter((_, idx) => idx !== i))}
                  scaleTo={0.85}
                >
                  <View style={[styles.removeBtn, { backgroundColor: colors.errorSoft }]}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </View>
                </AnimatedPressable>
              )}
            </Animated.View>
          ))}
        </View>

        {/* xEval input */}
        <View style={styles.section}>
          <SectionHeader title={`Evaluasi P(x) pada x = ?`} />
          <View
            style={[
              styles.evalCard,
              { backgroundColor: colors.card, borderColor: colors.borderLight },
              Shadow.sm,
            ]}
          >
            <View style={[styles.evalIcon, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="locate" size={18} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.evalLabel, { color: colors.textSecondary }]}>
                Nilai x untuk dievaluasi
              </Text>
              <TextInput
                value={xEval}
                onChangeText={(v) => {
                  // Only allow numbers and decimal point
                  const filtered = v.replace(/[^0-9.-]/g, '');
                  // Prevent multiple decimal points
                  const parts = filtered.split('.');
                  if (parts.length > 2) return;
                  setXEval(filtered);
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                style={[styles.evalInput, { color: colors.text }]}
              />
            </View>
          </View>
          <AnimatedPressable
            onPress={handleCalculate}
            style={{ marginTop: Spacing.md }}
          >
            <View style={[styles.calcBtn, { backgroundColor: colors.primary }, Shadow.md]}>
              <Ionicons name="calculator" size={18} color="#fff" />
              <Text style={styles.calcBtnText}>Hitung Hasil</Text>
            </View>
          </AnimatedPressable>
        </View>

        {/* Result */}
        {calculatedResult && (
          <View style={styles.section}>
            <ResultHero
              label={`P(${xEval})`}
              value={formatNum(calculatedResult.evaluateValue, 8)}
              method={calculatedResult.methodName}
              stats={[
                { label: 'titik', value: String(points.length) },
                { label: 'derajat', value: String(points.length - 1) },
                { label: 'metode', value: method === 'lagrange' ? 'Lagrange' : 'Newton' },
              ]}
            />

            <SectionHeader
              title="Langkah Perhitungan"
              caption="Lihat bagaimana polinomial dibangun"
              style={{ marginTop: Spacing.md }}
            />
            {calculatedResult.blocks.map((b, i) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  chartCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: -Spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: { fontSize: 14, fontWeight: '800' },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  methodRow: { flexDirection: 'row', gap: 10 },
  methodWrap: { flex: 1 },
  methodCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: 8,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: Radius.md,
    marginBottom: 8,
  },
  pointBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointFieldLabel: { fontSize: 11, fontWeight: '700' },
  pointInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 6,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  evalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evalLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  evalInput: { fontSize: 22, fontWeight: '800' },
  calcBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  calcBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
