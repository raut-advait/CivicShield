import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Animated,
  Pressable,
  Share,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import ClaimInput from '../components/ClaimInput';
import { verifyClaim } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [claimText, setClaimText] = useState('');
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleVerify = async () => {
    if (!claimText.trim()) {
      Alert.alert('Empty Claim', 'Please enter a claim, news article, or government announcement to verify.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyClaim(claimText.trim());
      router.push({
        pathname: '/result',
        params: {
          claim: claimText.trim(),
          resultData: JSON.stringify(result),
        },
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!claimText.trim()) {
      Alert.alert('Nothing to Copy', 'Please enter a claim first.');
      return;
    }
    Clipboard.setString(claimText);
    Alert.alert('Copied!', 'Claim text copied to clipboard.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Header */}
        <View style={styles.hero}>
          <View style={styles.shieldBadge}>
            <Text style={styles.shieldEmoji}>🛡️</Text>
          </View>
          <Text style={styles.heroTitle}>CivicShield</Text>
          <Text style={styles.heroSubtitle}>
            AI-Powered Civic Misinformation Detector
          </Text>
        </View>

        {/* Info Chips */}
        <View style={styles.chipsRow}>
          {['Elections', 'Schemes', 'Announcements'].map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <ClaimInput
            value={claimText}
            onChangeText={setClaimText}
            editable={!loading}
          />

          {/* Action Row */}
          <View style={styles.actionRow}>
            <Pressable style={styles.copyBtn} onPress={handleCopy} disabled={loading}>
              <Text style={styles.copyBtnText}>📋 Copy</Text>
            </Pressable>
            <Pressable style={styles.clearBtn} onPress={() => setClaimText('')} disabled={loading}>
              <Text style={styles.clearBtnText}>✕ Clear</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loadingText}>Checking facts…</Text>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                style={styles.verifyButton}
                onPress={handleVerify}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: '#ffffff30' }}
              >
                <Text style={styles.verifyButtonText}>🔍  Verify Claim</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* How it Works */}
        <View style={styles.howCard}>
          <Text style={styles.howTitle}>How It Works</Text>
          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepText}>Paste or type a civic claim or news headline</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepText}>CivicShield checks trusted fact-checking databases</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>Get an evidence-based verdict with sources</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  shieldBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  shieldEmoji: { fontSize: 36 },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  copyBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  copyBtnText: { color: '#374151', fontSize: 13, fontWeight: '600' },
  clearBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  verifyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  howCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  howTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
});
