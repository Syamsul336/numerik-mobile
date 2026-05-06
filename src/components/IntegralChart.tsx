import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { FunctionParser } from '../core/parser/functionParser';

interface Props {
  function: string;
  a: number;
  b: number;
  n: number;
  width: number;
  height: number;
  primaryColor: string;
  areaColor: string;
}

/**
 * Komponen chart yang nampilin fungsi + area approximation pakai SVG
 */
export function IntegralChart({
  function: fn,
  a,
  b,
  n,
  width,
  height,
  primaryColor,
  areaColor,
}: Props) {
  const padding = 30;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Sample fungsi
  const samples = 100;
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
    return <View style={{ width, height }} />;
  }

  if (ys.length === 0) return <View style={{ width, height }} />;

  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yRange = Math.abs(yMax - yMin) < 0.01 ? 1 : yMax - yMin;
  const yPadAmt = yRange * 0.1;
  const yMinAdj = yMin - yPadAmt;
  const yMaxAdj = yMax + yPadAmt;

  // Mapping coordinate
  const mapX = (x: number) =>
    padding + ((x - a) / (b - a)) * chartWidth;
  const mapY = (y: number) =>
    padding + chartHeight - ((y - yMinAdj) / (yMaxAdj - yMinAdj)) * chartHeight;

  // Y-zero line
  const yZero =
    yMinAdj <= 0 && yMaxAdj >= 0 ? mapY(0) : mapY(yMinAdj);

  // Build trapezoid paths
  const trapezoids: string[] = [];
  const h = (b - a) / n;
  for (let i = 0; i < n; i++) {
    const x1 = a + i * h;
    const x2 = a + (i + 1) * h;
    try {
      const y1 = parser.evaluate(x1);
      const y2 = parser.evaluate(x2);
      const path = `M ${mapX(x1)} ${yZero} L ${mapX(x1)} ${mapY(y1)} L ${mapX(x2)} ${mapY(y2)} L ${mapX(x2)} ${yZero} Z`;
      trapezoids.push(path);
    } catch {}
  }

  // Build curve path
  const curvePath = xs
    .map((x, i) => `${i === 0 ? 'M' : 'L'} ${mapX(x)} ${mapY(ys[i])}`)
    .join(' ');

  return (
    <Svg width={width} height={height}>
      {/* Axis */}
      <Line
        x1={padding}
        y1={yZero}
        x2={width - padding}
        y2={yZero}
        stroke="#CBD5E1"
        strokeWidth={1}
      />
      <Line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#CBD5E1"
        strokeWidth={1}
      />

      {/* Trapezoids */}
      {trapezoids.map((path, i) => (
        <Path
          key={i}
          d={path}
          fill={areaColor}
          fillOpacity={0.3}
          stroke={areaColor}
          strokeWidth={1.5}
        />
      ))}

      {/* Curve */}
      <Path
        d={curvePath}
        fill="none"
        stroke={primaryColor}
        strokeWidth={2.5}
      />

      {/* Labels */}
      <SvgText
        x={mapX(a) - 8}
        y={yZero + 16}
        fill="#64748B"
        fontSize={11}
      >
        a={a.toFixed(1)}
      </SvgText>
      <SvgText
        x={mapX(b) - 8}
        y={yZero + 16}
        fill="#64748B"
        fontSize={11}
      >
        b={b.toFixed(1)}
      </SvgText>
    </Svg>
  );
}
