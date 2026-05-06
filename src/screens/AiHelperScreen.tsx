// =============================================================================
// FILE: src/screens/AiHelperScreen.tsx
// =============================================================================
//
// AI HELPER SCREEN — chatbot AI Asisten
// =====================================
//
// Apa fungsi layar ini?
// ---------------------
// Chat interface untuk bertanya pada AI tentang metode numerik.
// Mirip WhatsApp: bubble user di kanan (navy), bubble AI di kiri (putih).
//
// Fitur:
// - QUICK PROMPTS: 4 pertanyaan siap pakai (muncul di awal/saat list kosong)
// - Input text di bawah dengan tombol send
// - Loading indicator saat menunggu jawaban
// - Auto-scroll ke pesan terbaru
//
// CARA SETUP AI:
// AI butuh API key untuk berfungsi. Lihat PANDUAN_AI_ASISTEN.md di root
// project untuk tutorial step-by-step (gratis pakai Gemini, Groq, dll.).
// Kalau API key belum diisi, app jalan dalam MODE DEMO yang cuma echo
// pertanyaan + ingatkan user untuk setup API.
//
// Logika koneksi AI ada di src/core/ai/aiService.ts.
// =============================================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,    // hindari keyboard tutupi input
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, FadeInRight, FadeInLeft } from 'react-native-reanimated';

import { aiService } from '../core/ai/aiService';
import { useTheme, Spacing, Radius, Shadow } from '../theme';
import { HeroHeader } from '../components/ui/HeroHeader';
import { AnimatedPressable } from '../components/ui/AnimatedPressable';

/**
 * ChatMessage — satu pesan dalam chat.
 * isUser: true = pesan dari user, false = pesan dari AI.
 */
interface ChatMessage {
  text: string;
  isUser: boolean;
}

// 4 pertanyaan siap pakai. User tinggal tap, tidak perlu mengetik.
// Kalau mau tambah, edit array ini saja.
const QUICK_PROMPTS = [
  'Apa beda Simpson dan Trapezoidal?',
  'Kapan pakai Lagrange vs Newton?',
  'Jelaskan metode Romberg',
  'Bagaimana memilih nilai n di integral?',
];

export default function AiHelperScreen() {
  const colors = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: 'Halo! Aku asisten pembelajaran metode numerik 👋\n\nTanya apa saja tentang Integral, Interpolasi, Bangun Datar, atau konsep numerik lainnya.',
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput('');
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
    setLoading(true);
    try {
      const response = await aiService.ask({ question: message });
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <HeroHeader
        eyebrow="AI ASISTEN"
        title="Tanya Apa Saja"
        subtitle="Konsep, contoh soal, atau penjelasan langkah demi langkah."
        onBack={() => router.back()}
        height={200}
        showTopBar={false}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: Spacing.lg, paddingTop: Spacing.lg }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m, i) => (
            <Animated.View
              key={i}
              entering={m.isUser ? FadeInRight.springify().damping(18) : FadeInLeft.springify().damping(18)}
              style={[
                styles.bubbleRow,
                { justifyContent: m.isUser ? 'flex-end' : 'flex-start' },
              ]}
            >
              {!m.isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Ionicons name="sparkles" size={14} color={colors.accentYellow} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  m.isUser
                    ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                    : {
                        backgroundColor: colors.card,
                        borderColor: colors.borderLight,
                        borderWidth: 1,
                        borderBottomLeftRadius: 4,
                      },
                  Shadow.sm,
                ]}
              >
                <Text
                  style={{
                    color: m.isUser ? '#fff' : colors.text,
                    lineHeight: 20,
                    fontSize: 14,
                  }}
                >
                  {m.text}
                </Text>
              </View>
            </Animated.View>
          ))}

          {loading && (
            <Animated.View entering={FadeIn} style={styles.bubbleRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={14} color={colors.accentYellow} />
              </View>
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.borderLight,
                    borderWidth: 1,
                  },
                  Shadow.sm,
                ]}
              >
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {messages.length <= 1 && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.quickPrompts}>
            {QUICK_PROMPTS.map((q, i) => (
              <AnimatedPressable key={q} onPress={() => send(q)} scaleTo={0.95}>
                <View
                  style={[
                    styles.quickChip,
                    { backgroundColor: colors.card, borderColor: colors.borderLight },
                    Shadow.sm,
                  ]}
                >
                  <Ionicons
                    name="flash-outline"
                    size={12}
                    color={colors.primary}
                  />
                  <Text style={{ fontSize: 12, color: colors.text, fontWeight: '600' }}>
                    {q}
                  </Text>
                </View>
              </AnimatedPressable>
            ))}
          </Animated.View>
        )}

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderTopColor: colors.borderLight },
          ]}
        >
          <View
            style={[
              styles.inputBox,
              { backgroundColor: colors.background, borderColor: colors.borderLight },
            ]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textTertiary} />
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send()}
              placeholder="Ketik pertanyaan…"
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
          <AnimatedPressable
            onPress={() => send()}
            disabled={loading || input.trim().length === 0}
            scaleTo={0.9}
          >
            <View
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    input.trim().length === 0 ? colors.primarySoft : colors.primary,
                },
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={input.trim().length === 0 ? colors.primary : '#fff'}
              />
            </View>
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.lg,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    height: 44,
  },
  input: { flex: 1, fontSize: 14 },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
