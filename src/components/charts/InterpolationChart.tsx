// =============================================================================
// FILE: src/components/charts/InterpolationChart.tsx
// =============================================================================
//
// INTERPOLATION CHART — grafik visualisasi interpolasi
// =====================================================
//
// Apa fungsi komponen ini?
// ------------------------
// Render grafik untuk modul Interpolasi:
// - Titik-titik input (lingkaran navy) — ini data yang user masukkan
// - Kurva polinomial yang halus — yang melewati semua titik
// - Garis vertikal kuning di x_eval (kalau ada) — titik yang dievaluasi
// - Marker khusus di (x_eval, y_eval)
// - Grid lines tipis
// - Label sumbu
//
// Cara kerja:
// Sama seperti IntegralChart — sample banyak titik, convert ke koordinat
// SVG, render path/circle/line.
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useTheme } from '../../theme';
import type { Point } from '../../core/numerical/interpolation';

interface InterpolationChartProps {
  points: Point[];           // titik-titik input dari user
  curve: Point[];            // titik-titik kurva (banyak, untuk kurva mulus)
  width: number;
  height: number;
  /** Nilai x yang dievaluasi (akan di-highlight dengan garis vertikal) */
  xEval?: number;
  yEval?: number;            // nilai y hasil dari evaluasi
}

/**
 * InterpolationChart — render points + kurva polinomial.
 */
export function InterpolationChart({
  points,
  curve,
  width,
  height,
  xEval,
  yEval,
}: InterpolationChartProps) {
  const colors = useTheme();
  const padX = 32;
  const padY = 24;
  const innerW = Math.max(1, width - 2 * padX);
  const innerH = Math.max(1, height - 2 * padY);

  if (points.length === 0) {
    return <View style={{ width, height }} />;
  }

  const xs = points.map((p) => p.x);
  const allYs = [...points.map((p) => p.y), ...curve.map((p) => p.y)];
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...allYs);
  const yMax = Math.max(...allYs);
  const yPad = (yMax - yMin) * 0.15 || 1;

  const mapX = (x: number) =>
    padX + ((x - xMin) / (xMax - xMin || 1)) * innerW;
  const mapY = (y: number) =>
    padY + innerH - ((y - (yMin - yPad)) / (yMax + yPad - (yMin - yPad))) * innerH;

  const curvePath = curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x).toFixed(2)} ${mapY(p.y).toFixed(2)}`)
    .join(' ');

  const areaPath =
    curve.length > 0
      ? `M ${mapX(curve[0].x).toFixed(2)} ${mapY(yMin - yPad).toFixed(2)} ` +
        curve.map((p) => `L ${mapX(p.x).toFixed(2)} ${mapY(p.y).toFixed(2)}`).join(' ') +
        ` L ${mapX(curve[curve.length - 1].x).toFixed(2)} ${mapY(yMin - yPad).toFixed(2)} Z`
      : '';

  // Grid
  const gridYs = [0.25, 0.5, 0.75].map((t) => padY + t * innerH);
  const gridXs = [0.25, 0.5, 0.75].map((t) => padX + t * innerW);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="ic-area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.30} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.0} />
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

        {/* Filled area under curve */}
        {curve.length > 0 && <Path d={areaPath} fill="url(#ic-area)" />}

        {/* Curve */}
        <Path
          d={curvePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vertical eval line */}
        {xEval != null && yEval != null && xEval >= xMin && xEval <= xMax && (
          <>
            <Line
              x1={mapX(xEval)}
              y1={padY}
              x2={mapX(xEval)}
              y2={height - padY}
              stroke={colors.accentYellow}
              strokeWidth={1.5}
              strokeDasharray="4,4"
            />
            <Circle
              cx={mapX(xEval)}
              cy={mapY(yEval)}
              r={7}
              fill={colors.accentYellow}
              stroke="#fff"
              strokeWidth={2}
            />
          </>
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={mapX(p.x)}
            cy={mapY(p.y)}
            r={6}
            fill={colors.primary}
            stroke="#fff"
            strokeWidth={2.5}
          />
        ))}
      </Svg>

      <View style={[styles.legendBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>polinomial</Text>
        </View>
        {xEval != null && (
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.accentYellow }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>x={Number(xEval).toFixed(2)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
