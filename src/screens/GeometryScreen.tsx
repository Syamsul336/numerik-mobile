// =============================================================================
// FILE: src/screens/GeometryScreen.tsx
// =============================================================================
//
// GEOMETRY SCREEN — layar modul Bangun Datar
// ===========================================
//
// Apa fungsi layar ini?
// ---------------------
// Tempat user menghitung luas & keliling 6 bentuk dasar:
// persegi, persegi panjang, segitiga, lingkaran, trapesium, jajar genjang.
//
// Layout:
// 1. Hero header navy "Bangun Datar"
// 2. Pilihan BENTUK — 6 chip dengan icon (persegi, lingkaran, dst.)
// 3. Input dimensi (otomatis berubah sesuai bentuk: 1, 2, atau 3 input)
// 4. Preview SVG bentuk dengan gradient pastel
// 5. Hasil otomatis:
//    - ResultHero: luas
//    - StepCard daftar langkah perhitungan
//
// Auto-calculate saat input berubah (instant, tanpa debounce karena
// perhitungan geometri sangat cepat).
// =============================================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { FadeIn, FadeInUp, Layout } from 'react-native-reanimated';

// Algoritma & types
import { Geometry, type ShapeType, type GeometryResult } from '../core/numerical/geometry';
import { historyStorage } from '../core/storage/historyStorage';
import { formatNum } from '../components/math/exprToLatex';
// Theme & komponen UI
import { useTheme, Spacing, Radius, Shadow } from '../theme';
import { HeroHeader } from '../components/ui/HeroHeader';
import { ResultHero } from '../components/cards/ResultHero';
import { StepCard } from '../components/cards/StepCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';

// Konfigurasi 6 bentuk: tiap bentuk punya field input yang beda
// (jumlah input dan label-nya disesuaikan).
const shapes: { value: ShapeType; label: string; fields: { key: string; label: string }[]; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'square', label: 'Persegi', icon: 'square-outline', fields: [{ key: 'sisi', label: 'Sisi' }] },
  { value: 'rectangle', label: 'Persegi Pjg', icon: 'tablet-landscape-outline', fields: [{ key: 'panjang', label: 'Panjang' }, { key: 'lebar', label: 'Lebar' }] },
  { value: 'triangle', label: 'Segitiga', icon: 'triangle-outline', fields: [{ key: 'alas', label: 'Alas' }, { key: 'tinggi', label: 'Tinggi' }] },
  { value: 'circle', label: 'Lingkaran', icon: 'ellipse-outline', fields: [{ key: 'jari-jari', label: 'Jari-jari' }] },
  { value: 'trapezoid', label: 'Trapesium', icon: 'prism-outline', fields: [{ key: 'a', label: 'Sisi a' }, { key: 'b', label: 'Sisi b' }, { key: 'tinggi', label: 'Tinggi' }] },
  { value: 'parallelogram', label: 'Jajar Genjang', icon: 'cube-outline', fields: [{ key: 'alas', label: 'Alas' }, { key: 'tinggi', label: 'Tinggi' }] },
];

function ShapePreview({ shape, fill, stroke }: { shape: ShapeType; fill: string; stroke: string }) {
  const w = 180;
  const h = 180;
  const sw = 3;
  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="shapeGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={fill} stopOpacity={0.95} />
          <Stop offset="100%" stopColor={stroke} stopOpacity={0.55} />
        </LinearGradient>
      </Defs>
      {(() => {
        switch (shape) {
          case 'square':
            return <Rect x={42} y={42} width={96} height={96} rx={8} fill="url(#shapeGrad)" stroke={stroke} strokeWidth={sw} />;
          case 'rectangle':
            return <Rect x={20} y={56} width={140} height={68} rx={8} fill="url(#shapeGrad)" stroke={stroke} strokeWidth={sw} />;
          case 'triangle':
            return <Polygon points="90,30 30,144 150,144" fill="url(#shapeGrad)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
          case 'circle':
            return <Circle cx={90} cy={90} r={58} fill="url(#shapeGrad)" stroke={stroke} strokeWidth={sw} />;
          case 'trapezoid':
            return <Polygon points="56,40 124,40 158,144 22,144" fill="url(#shapeGrad)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
          case 'parallelogram':
            return <Polygon points="50,40 158,40 130,144 22,144" fill="url(#shapeGrad)" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
        }
      })()}
    </Svg>
  );
}

export default function GeometryScreen() {
  const colors = useTheme();
  const router = useRouter();
  const [shape, setShape] = useState<ShapeType>('square');
  const [inputs, setInputs] = useState<Record<string, number>>({ sisi: 5 });
  const [savedKey, setSavedKey] = useState('');

  const result = useMemo<GeometryResult | null>(() => {
    try {
      switch (shape) {
        case 'square':
          if (inputs.sisi != null) return Geometry.square(inputs.sisi);
          break;
        case 'rectangle':
          if (inputs.panjang != null && inputs.lebar != null)
            return Geometry.rectangle(inputs.panjang, inputs.lebar);
          break;
        case 'triangle':
          if (inputs.alas != null && inputs.tinggi != null)
            return Geometry.triangle(inputs.alas, inputs.tinggi);
          break;
        case 'circle':
          if (inputs['jari-jari'] != null) return Geometry.circle(inputs['jari-jari']);
          break;
        case 'trapezoid':
          if (inputs.a != null && inputs.b != null && inputs.tinggi != null)
            return Geometry.trapezoid(inputs.a, inputs.b, inputs.tinggi);
          break;
        case 'parallelogram':
          if (inputs.alas != null && inputs.tinggi != null)
            return Geometry.parallelogram(inputs.alas, inputs.tinggi);
          break;
      }
    } catch {}
    return null;
  }, [shape, inputs]);

  React.useEffect(() => {
    if (!result) return;
    const key = `${shape}|${JSON.stringify(inputs)}`;
    if (key === savedKey) return;
    const t = setTimeout(() => {
      historyStorage.add({
        module: 'geometry',
        title: result.shapeName,
        summary: `Luas = ${formatNum(result.area, 4)}${result.perimeter > 0 ? `, Keliling = ${formatNum(result.perimeter, 4)}` : ''}`,
        data: { shape, inputs, area: result.area, perimeter: result.perimeter },
      });
      setSavedKey(key);
    }, 1000);
    return () => clearTimeout(t);
  }, [result, shape, inputs, savedKey]);

  const currentShape = shapes.find((s) => s.value === shape)!;

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <HeroHeader
          eyebrow="MODUL"
          title="Bangun Datar"
          subtitle="Hitung luas dan keliling enam bentuk geometri klasik."
          onBack={() => router.back()}
          height={210}
          showTopBar={false}
        />

        {/* Shape preview */}
        <View style={styles.section}>
          <Animated.View
            entering={FadeInUp.delay(120).springify().damping(16)}
            style={[
              styles.previewCard,
              { backgroundColor: colors.card, borderColor: colors.borderLight },
              Shadow.sm,
            ]}
          >
            <ShapePreview
              shape={shape}
              fill={colors.primaryLighter}
              stroke={colors.primary}
            />
            <Text style={[styles.previewName, { color: colors.text }]}>
              {currentShape.label}
            </Text>
          </Animated.View>
        </View>

        {/* Shape picker */}
        <View style={styles.section}>
          <SectionHeader title="Pilih Bangun" />
          <View style={styles.shapesGrid}>
            {shapes.map((s) => {
              const active = shape === s.value;
              return (
                <AnimatedPressable
                  key={s.value}
                  onPress={() => {
                    setShape(s.value);
                    setInputs({});
                  }}
                  style={styles.shapeWrap}
                  scaleTo={0.94}
                >
                  <View
                    style={[
                      styles.shapeChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.borderLight,
                      },
                      active ? Shadow.md : Shadow.sm,
                    ]}
                  >
                    <Ionicons
                      name={s.icon}
                      size={20}
                      color={active ? '#fff' : colors.primary}
                    />
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={{
                        color: active ? '#fff' : colors.text,
                        fontWeight: '700',
                        fontSize: 11,
                        marginTop: 6,
                        textAlign: 'center',
                      }}
                    >
                      {s.label}
                    </Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>

        {/* Inputs */}
        <View style={styles.section}>
          <SectionHeader title="Dimensi" />
          {currentShape.fields.map((field) => (
            <Animated.View
              key={field.key}
              entering={FadeIn}
              layout={Layout.springify().damping(16)}
              style={[
                styles.inputCard,
                { backgroundColor: colors.card, borderColor: colors.borderLight },
                Shadow.sm,
              ]}
            >
              <View style={[styles.inputIcon, { backgroundColor: colors.primarySoft }]}>
                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 11 }}>
                  {field.key.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {field.label}
                </Text>
                <TextInput
                  value={inputs[field.key]?.toString() ?? ''}
                  onChangeText={(v) => {
                    const num = parseFloat(v);
                    setInputs({
                      ...inputs,
                      [field.key]: isNaN(num) ? (undefined as any) : num,
                    });
                  }}
                  keyboardType="numbers-and-punctuation"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.inputField, { color: colors.text }]}
                />
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Result */}
        {result ? (
          <View style={styles.section}>
            <ResultHero
              label={result.perimeter > 0 ? 'Luas & Keliling' : 'Luas'}
              value={formatNum(result.area, 4)}
              method={result.shapeName}
              stats={
                result.perimeter > 0
                  ? [
                      { label: 'luas', value: formatNum(result.area, 4) },
                      { label: 'keliling', value: formatNum(result.perimeter, 4) },
                    ]
                  : [{ label: 'luas', value: formatNum(result.area, 4) }]
              }
            />

            <SectionHeader title="Langkah Perhitungan" style={{ marginTop: Spacing.md }} />
            {result.blocks.map((b, i) => (
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
        ) : (
          <View style={styles.section}>
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.card, borderColor: colors.borderLight },
              ]}
            >
              <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Isi semua dimensi untuk melihat hasil
              </Text>
            </View>
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
  previewCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: -Spacing.md,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  shapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shapeWrap: { width: '31.5%' },
  shapeChip: {
    paddingVertical: Spacing.md,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 76,
    justifyContent: 'center',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 10,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, marginBottom: 2 },
  inputField: { fontSize: 18, fontWeight: '700' },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { flex: 1, fontSize: 13 },
});
