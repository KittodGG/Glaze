import { GlassView } from '@/components/ui/GlassView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseTransactionInput } from '@/services/gemini';
import { useTransactionStore } from '@/store/transactionStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import * as Haptics from 'expo-haptics';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const addTransaction = useTransactionStore(s => s.addTransaction);

  const handleAnalyze = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await parseTransactionInput(input);
      setResult(data);
    } catch (e) {
      alert("Failed to analyze. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!result) return;
    addTransaction({
      id: Date.now().toString(),
      title: result.item,
      amount: result.amount,
      category: result.category,
      source_wallet: result.source_wallet || 'Cash',
      date: new Date().toISOString(),
      icon: 'pricetag'
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
        <GlassView style={styles.card} intensity={90}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Magic Input ✨</Text>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close-circle" size={28} color={colors.icon} />
            </Pressable>
          </View>

          {!result ? (
            <>
              <Text style={[styles.subtitle, { color: colors.icon }]}>
                Type normally, e.g. "Makan nasi padang 25rb pake cash"
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.glassBorder, backgroundColor: colors.background }]}
                placeholder="What did you spend on?"
                placeholderTextColor={colors.icon}
                multiline
                value={input}
                onChangeText={setInput}
                autoFocus
              />
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: colors.tint, opacity: pressed || loading ? 0.8 : 1 }
                ]}
                onPress={handleAnalyze}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Analyze with AI</Text>
                )}
              </Pressable>
            </>
          ) : (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.resultContainer}
            >
              <View style={[styles.resultRow, { borderBottomColor: colors.glassBorder }]}>
                <Text style={[styles.label, { color: colors.icon }]}>Item</Text>
                <Text style={[styles.value, { color: colors.text }]}>{result.item}</Text>
              </View>
              <View style={[styles.resultRow, { borderBottomColor: colors.glassBorder }]}>
                <Text style={[styles.label, { color: colors.icon }]}>Amount</Text>
                <Text style={[styles.value, { color: colors.text }]}>Rp {result.amount.toLocaleString()}</Text>
              </View>
              <View style={[styles.resultRow, { borderBottomColor: colors.glassBorder }]}>
                <Text style={[styles.label, { color: colors.icon }]}>Category</Text>
                <Text style={[styles.value, { color: colors.text }]}>{result.category}</Text>
              </View>
              <View style={[styles.resultRow, { borderBottomColor: 'transparent' }]}>
                <Text style={[styles.label, { color: colors.icon }]}>Wallet</Text>
                <Text style={[styles.value, { color: colors.text }]}>{result.source_wallet}</Text>
              </View>

              <View style={styles.actions}>
                <Pressable onPress={() => setResult(null)} style={{ padding: 10 }}>
                  <Text style={{ color: colors.icon, fontFamily: 'PlusJakartaSans_700Bold' }}>Edit</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, { backgroundColor: colors.tint, flex: 1, marginLeft: 10 }]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Confirm & Save</Text>
                </Pressable>
              </View>
            </MotiView>
          )}
        </GlassView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    width: '90%',
    padding: 24,
    borderRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
  },
  resultContainer: {
    width: '100%',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
  },
  value: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
});
