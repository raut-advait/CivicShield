import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Pressable,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import ClaimInput from '../components/ClaimInput';
import { verifyClaim } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [claimText, setClaimText] = useState('');
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const stepsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(90, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(stepsAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardAnim, heroAnim, stepsAnim]);

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
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [22, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.heroGlow} />
          <Text style={styles.heroEyebrow}>fact-check assistant</Text>
          <Text style={styles.heroTitle}>Civic Signal</Text>
          <Text style={styles.heroSubtitle}>
            Clean verification for public claims, scheme updates, and election headlines.
          </Text>
          <View style={styles.chipsRow}>
            {['Public claims', 'Election news', 'Scheme updates'].map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Run a verification</Text>
              <Text style={styles.cardSubtitle}>Send one claim at a time for the cleanest result.</Text>
            </View>
            <View style={styles.cardBadge}>
              <Ionicons name="sparkles-outline" size={16} color="#16384C" />
            </View>
          </View>

          <ClaimInput
            value={claimText}
            onChangeText={setClaimText}
            editable={!loading}
          />

          <View style={styles.actionRow}>
            <Pressable style={styles.copyBtn} onPress={handleCopy} disabled={loading}>
              <Ionicons name="copy-outline" size={16} color="#16384C" />
              <Text style={styles.copyBtnText}>Copy</Text>
            </Pressable>
            <Pressable style={styles.clearBtn} onPress={() => setClaimText('')} disabled={loading}>
              <Ionicons name="close-outline" size={16} color="#8F4A31" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#16384C" />
              <Text style={styles.loadingText}>Checking sources…</Text>
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
                <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
                <Text style={styles.verifyButtonText}>Verify now</Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.howCard,
            {
              opacity: stepsAnim,
              transform: [
                {
                  translateY: stepsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.howTitle}>Three quick steps</Text>
          {[
            'Paste a claim, headline, or public announcement.',
            'We check available fact-check coverage from trusted sources.',
            'You get a verdict and links to review the evidence.',
          ].map((step, index) => (
            <View key={step} style={styles.step}>
              <View style={styles.stepNumWrap}>
                <Text style={styles.stepNum}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F4F1EA' },
  scroll: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 118,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#E8ECE5',
    marginBottom: 16,
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D9775730',
    top: -48,
    right: -20,
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: '#6E766D',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#16384C',
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    maxWidth: '88%',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Manrope_500Medium',
    color: '#4E5C65',
    marginTop: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  chip: {
    backgroundColor: '#FFFFFFD8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E5DC',
  },
  chipText: {
    color: '#16384C',
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#16384C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#10212B',
  },
  cardSubtitle: {
    marginTop: 6,
    maxWidth: 230,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Manrope_500Medium',
    color: '#6E766D',
  },
  cardBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F1EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  copyBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#F5F6F2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E3E6DE',
  },
  copyBtnText: {
    color: '#16384C',
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#FFF4EF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3D4C7',
  },
  clearBtnText: {
    color: '#8F4A31',
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
  },
  verifyButton: {
    backgroundColor: '#16384C',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#16384C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    color: '#16384C',
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
  howCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E3E6DE',
  },
  howTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#10212B',
    marginBottom: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  stepNumWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8ECE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: '#16384C',
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 12,
    fontFamily: 'Manrope_800ExtraBold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: '#4E5C65',
    lineHeight: 20,
  },
});
