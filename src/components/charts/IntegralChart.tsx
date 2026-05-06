// =============================================================================
// FILE: src/components/charts/IntegralChart.tsx
// =============================================================================
//
// INTEGRAL CHART — grafik visualisasi integral
// =============================================
//
// Apa fungsi komponen ini?
// ------------------------
// Render grafik yang menunjukkan:
// - Kurva fungsi f(x) yang halus
// - Trapesium-trapesium kuning sebagai partisi yang dihitung
// - Gradient fill di bawah kurva
// - Grid lines tipis untuk skala
// - Garis dashed di batas a dan b dengan dot
// - Trapesium ke-i bisa di-highlight (untuk animasi step-by-step)
// - Label sumbu (x, y, a, b)
//
// Cara kerja:
// 1. Sample fungsi di banyak titik (120 sample) → array (x, y)
// 2. Hitung min/max y → tentukan skala vertikal
// 3. Convert tiap (x, y) ke (px, py) di SVG
// 4. Render path kurva, trapesium, grid, dst.
//
// Knowledge needed:
// - SVG coordinate: Y dari atas ke bawah (kebalikan dari grafik matematika)
//   Jadi kita perlu invert: y_svg = innerH - (y_real - yMin) / (yMax - yMin) * innerH
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Line,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  G,
} from 'react-native-svg';
import { useTheme } from '../../theme';
import { FunctionParser } from '../../core/parser/functionParser';

interface IntegralChartProps {
  function: string;          // ekspresi fungsi
  a: number;                 // batas bawah
  b: number;                 // batas atas
  n: number;                 // jumlah pias
  width: number;             // lebar chart dalam px
  height: number;            // tinggi chart dalam px
  /** Index pias yang di-highlight (0..n-1) — untuk animasi */
  highlightIndex?: number;
}

/**
 * IntegralChart — visualizes f(x) on [a,b] with the trapezoidal partition shown.
 * Improvements over v1:
 *   - Gradient fill under the curve
 *   - Light grid lines
 *   - Dashed bounds at a and b with end-cap dots
 *   - Highlighted current subinterval option (for animation)
 *   - Labeled axes
 */
export function IntegralChart({
  function: fn,
  a,
  b,
  n,
  width,
  height,
  highlightIndex,
}: IntegralChartProps) {
  const colors = useTheme();
  const padX = 36;
  const padY = 24;
  const innerW = Math.max(1, width - 2 * padX);
  const innerH = Math.max(1, height - 2 * padY);

  // Sample
  const samples = 120;
  const xs: number[] = [];
  const ys: number[] = [];
  let parser: FunctionParser | null = null;
  try {
    parser = new FunctionParser(fn);
    for (let i = 0; i < samples; i++) {
      const x = a + ((b - a) * i) / (samples - 1);
      try {
        const y = parser.evaluate(x);
        if (isFinite(y)) {
          xs.push(x);
          ys.push(y);
        }
      } catch {}
    }
  } catch {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={{ color: colors.textTertiary }}>Tunggu fungsi yang valid…</Text>
      </View>
    );
  }

  if (ys.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={{ color: colors.textTertiary }}>Fungsi tidak terdefinisi pada [a,b]</Text>
      </View>
    );
  }

  const yMin = Math.min(...ys, 0);
  const yMax = Math.max(...ys, 0);
  const yRange = Math.abs(yMax - yMin) < 1e-9 ? 1 : yMax - yMin;
  const yPad = yRange * 0.12;
  const yMinAdj = yMin - yPad;
  const yMaxAdj = yMax + yPad;

  const mapX = (x: number) => padX + ((x - a) / (b - a)) * innerW;
  const mapY = (y: number) =>
    padY + innerH - ((y - yMinAdj) / (yMaxAdj - yMinAdj)) * innerH;
  const yZero = yMinAdj <= 0 && yMaxAdj >= 0 ? mapY(0) : mapY(yMinAdj);

  // Curve path
  const curvePath = xs
    .map((x, i) => `${i === 0 ? 'M' : 'L'} ${mapX(x).toFixed(2)} ${mapY(ys[i]).toFixed(2)}`)
    .join(' ');

  // Area under curve (closed)
  const areaPath =
    `M ${mapX(xs[0]).toFixed(2)} ${yZero.toFixed(2)} ` +
    xs.map((x, i) => `L ${mapX(x).toFixed(2)} ${mapY(ys[i]).toFixed(2)}`).join(' ') +
    ` L ${mapX(xs[xs.length - 1]).toFixed(2)} ${yZero.toFixed(2)} Z`;

  // Trapezoid partitions
  const trapezoids: Array<{ path: string; key: number }> = [];
  const h = (b - a) / n;
  for (let i = 0; i < Math.min(n, 200); i++) {
    const x1 = a + i * h;
    const x2 = a + (i + 1) * h;
    try {
      const y1 = parser.evaluate(x1);
      const y2 = parser.evaluate(x2);
      const path = `M ${mapX(x1).toFixed(2)} ${yZero.toFixed(2)} L ${mapX(x1).toFixed(2)} ${mapY(y1).toFixed(2)} L ${mapX(x2).toFixed(2)} ${mapY(y2).toFixed(2)} L ${mapX(x2).toFixed(2)} ${yZero.toFixed(2)} Z`;
      trapezoids.push({ path, key: i });
    } catch {}
  }

  // Grid lines
  const gridYs = [0.25, 0.5, 0.75].map((t) => padY + t * innerH);
  const gridXs = [0.25, 0.5, 0.75].map((t) => padX + t * innerW);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="ig-area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.55} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.05} />
          </LinearGradient>
          <LinearGradient id="ig-trap" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.accentYellow} stopOpacity={0.55} />
            <Stop offset="100%" stopColor={colors.accentYellow} stopOpacity={0.15} />
          </LinearGradient>
        </Defs>

        {/* Grid */}
        {gridYs.map((y, i) => (
          <Line
            key={`gy-${i}`}
            x1={padX}
            x2={width - padX}
            y1={y}
            y2={y}
            stroke={colors.border}
            strokeDasharray="3,4"
            strokeWidth={1}
          />
        ))}
        {gridXs.map((x, i) => (
          <Line
            key={`gx-${i}`}
            x1={x}
            x2={x}
            y1={padY}
            y2={height - padY}
            stroke={colors.border}
            strokeDasharray="3,4"
            strokeWidth={0.7}
          />
        ))}

        {/* x-axis */}
        <Line
          x1={padX}
          y1={yZero}
          x2={width - padX}
          y2={yZero}
          stroke={colors.textTertiary}
          strokeWidth={1}
        />

        {/* Area gradient */}
        <Path d={areaPath} fill="url(#ig-area)" />

        {/* Trapezoidal partitions (yellow) */}
        <G opacity={0.85}>
          {trapezoids.map((t) => (
            <Path
              key={t.key}
              d={t.path}
              fill={t.key === highlightIndex ? colors.accentYellow : 'url(#ig-trap)'}
              fillOpacity={t.key === highlightIndex ? 0.9 : 1}
              stroke={t.key === highlightIndex ? colors.accentYellow : colors.warning}
              strokeWidth={1}
              strokeOpacity={0.7}
            />
          ))}
        </G>

        {/* Curve */}
        <Path
          d={curvePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bound markers */}
        <Line
          x1={mapX(a)}
          y1={padY}
          x2={mapX(a)}
          y2={height - padY}
          stroke={colors.primary}
          strokeDasharray="4,3"
          strokeWidth={1}
          opacity={0.6}
        />
        <Line
          x1={mapX(b)}
          y1={padY}
          x2={mapX(b)}
          y2={height - padY}
          stroke={colors.primary}
          strokeDasharray="4,3"
          strokeWidth={1}
          opacity={0.6}
        />
        <Circle cx={mapX(a)} cy={yZero} r={5} fill={colors.primary} stroke="#fff" strokeWidth={2} />
        <Circle cx={mapX(b)} cy={yZero} r={5} fill={colors.primary} stroke="#fff" strokeWidth={2} />
      </Svg>

      {/* Axis labels (RN Text for crisp rendering) */}
      <Text style={[styles.axisLabel, { left: mapX(a) - 14, top: yZero + 6, color: colors.textSecondary }]}>
        a={Number(a).toFixed(1)}
      </Text>
      <Text style={[styles.axisLabel, { left: mapX(b) - 14, top: yZero + 6, color: colors.textSecondary }]}>
        b={Number(b).toFixed(1)}
      </Text>
      <View style={[styles.legendBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>f(x)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.accentYellow }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>partisi</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  axisLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
  },
  legendBox: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '600' },
});
