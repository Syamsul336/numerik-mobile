// =============================================================================
// FILE: src/components/math/MathView.tsx
// =============================================================================
//
// MATH VIEW — render rumus matematika cantik
// ===========================================
//
// Apa fungsi komponen ini?
// ------------------------
// React Native TIDAK punya cara native untuk render rumus matematika
// seperti integral (∫), pecahan, akar, dll. Kalau cuma pakai <Text>,
// hasilnya cuma "x^2" sebagai teks biasa, bukan x² yang cantik.
//
// SOLUSI: gunakan WebView (mini browser) di dalam app, lalu render rumus
// pakai library KaTeX (JavaScript). KaTeX adalah engine math rendering
// dari Khan Academy yang super cepat dan menghasilkan output cantik
// seperti di buku matematika.
//
// Cara kerja file ini:
// 1. Terima string LaTeX dari props (contoh: "\\int_0^1 x^2\\,dx")
// 2. Bangun HTML mini dengan <script> KaTeX dari CDN
// 3. Render HTML itu di WebView
// 4. Auto-detect tinggi konten, lalu adjust container size
// 5. Allow horizontal scroll untuk rumus panjang
//
// Kelemahan:
// - WebView agak lambat untuk pertama kali load (sekitar 500ms)
// - Butuh internet pertama kali (untuk download KaTeX dari CDN)
//   Setelah itu di-cache jadi cepat
// =============================================================================

import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../theme';

interface MathViewProps {
  /** String LaTeX, contoh: "\\int_0^1 x^2\\,dx" */
  latex: string;
  /** Display mode (block, ukuran lebih besar). Default true */
  displayMode?: boolean;
  /** Warna teks. Default ikut tema */
  color?: string;
  /** Background. Default transparent */
  backgroundColor?: string;
  /** Tinggi minimum (px) untuk hindari flicker saat loading */
  minHeight?: number;
  /** Ukuran font dalam px */
  fontSize?: number;
  /** Center horizontal (default true) */
  center?: boolean;
}

export function MathView({
  latex,
  displayMode = true,
  color,
  backgroundColor = 'transparent',
  minHeight = 48,
  fontSize = 18,
  center = true,
}: MathViewProps) {
  const colors = useTheme();
  const textColor = color ?? colors.text;

  // State untuk tinggi (akan di-update otomatis dari WebView)
  const [height, setHeight] = useState(minHeight);

  // useMemo: cache HTML supaya tidak di-rebuild tiap render
  // HTML cuma berubah kalau salah satu dependencies berubah
  const html = useMemo(
    () => buildHtml(latex, { displayMode, color: textColor, backgroundColor, fontSize, center }),
    [latex, displayMode, textColor, backgroundColor, fontSize, center]
  );

  return (
    <View style={[styles.container, { height: Math.max(height, minHeight), backgroundColor }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}                     // load HTML mentah (bukan URL)
        style={[styles.webview, { backgroundColor }]}
        // ─── Allow horizontal scroll untuk rumus panjang ────────────────
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // nestedScrollEnabled: izinkan WebView yang ada di dalam ScrollView
        // untuk scroll independen
        nestedScrollEnabled={true}
        javaScriptEnabled
        domStorageEnabled
        // ─── Auto-detect tinggi konten ──────────────────────────────────
        // WebView akan post message berisi tingginya, kita pakai untuk
        // adjust container size
        onMessage={(event) => {
          const newHeight = parseFloat(event.nativeEvent.data);
          if (!Number.isNaN(newHeight) && newHeight > 0) {
            setHeight(newHeight + 8);   // +8 untuk padding
          }
        }}
        // Disable text selection di dalam WebView (lebih native feel)
        injectedJavaScriptBeforeContentLoaded={`
          document.documentElement.style.webkitUserSelect = 'none';
          true;
        `}
        androidLayerType="hardware"     // GPU acceleration di Android
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

interface BuildOpts {
  displayMode: boolean;
  color: string;
  backgroundColor: string;
  fontSize: number;
  center: boolean;
}

/**
 * Escape karakter spesial untuk template literal JavaScript.
 * Diperlukan karena LaTeX punya banyak backslash yang harus di-escape
 * sebelum dimasukkan ke template `${...}` di string HTML.
 */
function escapeLatex(input: string): string {
  return input
    .replace(/\\/g, '\\\\')         // \ → \\
    .replace(/`/g, '\\`')           // ` → \`
    .replace(/\$/g, '\\$');         // $ → \$
}

/**
 * Bangun HTML mini yang akan dirender di WebView.
 *
 * HTML berisi:
 * - Link ke KaTeX CSS dari CDN (untuk styling rumus)
 * - Script KaTeX dari CDN (untuk render)
 * - <div id="host"> tempat rumus akan ditaruh
 * - Script untuk panggil katex.render() dan post tinggi ke React Native
 */
function buildHtml(latex: string, opts: BuildOpts): string {
  const safeLatex = escapeLatex(latex);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <!-- KaTeX dari CDN jsdelivr -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: ${opts.backgroundColor};
      color: ${opts.color};
      font-size: ${opts.fontSize}px;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
    body {
      padding: 4px 8px;
      box-sizing: border-box;
      overflow-y: hidden;
      overflow-x: auto;                              /* scroll horizontal */
      -webkit-overflow-scrolling: touch;
    }
    #host {
      display: inline-block;
      min-width: 100%;
      ${opts.center ? 'text-align: center;' : 'text-align: left;'}
    }
    .katex { color: ${opts.color} !important; }
    .katex-display { margin: 0 !important; padding: 4px 0 !important; }
    .katex-display > .katex { white-space: normal; }
    /* Custom scrollbar tipis */
    ::-webkit-scrollbar { height: 4px; background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(30,42,158,0.25); border-radius: 2px; }
  </style>
</head>
<body>
  <div id="host"></div>
  <script>
    // Fungsi report ke React Native: kirim tinggi konten
    function reportSize() {
      var host = document.getElementById('host');
      if (!host) return;
      var h = host.getBoundingClientRect().height;
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(String(h));
      }
    }
    // Render rumus pakai KaTeX
    function render() {
      try {
        // KaTeX masih loading? Tunggu frame berikutnya
        if (typeof katex === 'undefined') {
          requestAnimationFrame(render);
          return;
        }
        var host = document.getElementById('host');
        katex.render(\`${safeLatex}\`, host, {
          displayMode: ${opts.displayMode ? 'true' : 'false'},
          throwOnError: false,           // jangan crash kalau LaTeX salah
          strict: false,                  // toleran terhadap LaTeX non-standard
          output: 'html',
          fleqn: false,
        });
        requestAnimationFrame(reportSize);
        // Re-report setelah font selesai loading
        setTimeout(reportSize, 200);
      } catch (err) {
        // Kalau error, tampilkan pesan-nya (bukan crash)
        document.getElementById('host').innerText = String(err && err.message ? err.message : err);
        reportSize();
      }
    }
    document.addEventListener('DOMContentLoaded', render);
    window.addEventListener('load', render);
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', width: '100%' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
