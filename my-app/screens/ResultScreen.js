import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  ScrollView,
  Share,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SourceCard from '../components/SourceCard';

const VERDICT_CONFIG = {
  false: { color: '#A64538', bg: '#FFF2EF', border: '#F1CFC5', icon: 'close-circle', label: 'Likely false' },
  fake: { color: '#A64538', bg: '#FFF2EF', border: '#F1CFC5', icon: 'close-circle', label: 'Fake' },
  mislead: { color: '#B56A2D', bg: '#FFF8EA', border: '#F2DFAF', icon: 'alert-circle', label: 'Misleading' },
  true: { color: '#2B7A5C', bg: '#EFFAF5', border: '#CDE9D8', icon: 'checkmark-circle', label: 'Likely true' },
  correct: { color: '#2B7A5C', bg: '#EFFAF5', border: '#CDE9D8', icon: 'checkmark-circle', label: 'Likely true' },
  found: { color: '#16384C', bg: '#EEF3F5', border: '#D6E1E6', icon: 'document-text', label: 'Fact checks found' },
  default: { color: '#66707A', bg: '#F8F7F2', border: '#E3E6DE', icon: 'search', label: 'No fact check found' },
};

function getVerdictConfig(verdict) {
  if (!verdict) return VERDICT_CONFIG.default;
  const v = verdict.toLowerCase();
  for (const [key, config] of Object.entries(VERDICT_CONFIG)) {
    if (v.includes(key)) return config;
  }
  return VERDICT_CONFIG.default;
}

export default function ResultScreen() {
  const router = useRouter();
  const { claim, resultData } = useLocalSearchParams();
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [contentAnim]);

  let parsedResult = { verdict: 'No Fact Check Found', results: [] };
  try {
    if (resultData) {
      parsedResult = JSON.parse(resultData);
    }
  } catch {
    parsedResult = { verdict: 'Error parsing result', results: [] };
  }

  const { verdict, results = [] } = parsedResult;
  const verdictConfig = getVerdictConfig(verdict);

  const handleShare = async () => {
    try {
      const sourceLines = results
        .slice(0, 3)
        .map((r) => `• ${r.source}: ${r.rating}`)
        .join('\n');
      await Share.share({
        message: `Civic Signal\n\nClaim: "${claim}"\nVerdict: ${verdictConfig.label}\n\nSources:\n${sourceLines || 'No sources found.'}`,
      });
    } catch {
      Alert.alert('Share Failed', 'Could not share the result.');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Animated.View
        style={{
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        }}
      >
        <View style={styles.claimCard}>
          <Text style={styles.sectionLabel}>Claim checked</Text>
          <Text style={styles.claimText}>{claim || 'No claim provided.'}</Text>
        </View>

        <View style={[styles.verdictCard, { backgroundColor: verdictConfig.bg, borderColor: verdictConfig.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: `${verdictConfig.color}18` }]}> 
            <Ionicons name={verdictConfig.icon} size={28} color={verdictConfig.color} />
          </View>
          <Text style={[styles.verdictLabel, { color: verdictConfig.color }]}>{verdictConfig.label}</Text>
          {verdict && verdict !== verdictConfig.label && (
            <Text style={styles.verdictRaw}>{verdict}</Text>
          )}
        </View>

        <View style={styles.sourcesSection}>
          <View style={styles.sourcesHeader}>
            <Text style={styles.sourcesTitle}>Sources ({results.length})</Text>
            <Pressable onPress={handleShare} style={styles.shareBtn}>
              <Ionicons name="share-social-outline" size={16} color="#16384C" />
              <Text style={styles.shareBtnText}>Share</Text>
            </Pressable>
          </View>

          {results.length === 0 ? (
            <View style={styles.noSourcesCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="search-outline" size={24} color="#66707A" />
              </View>
              <Text style={styles.noSourcesTitle}>No source matched yet</Text>
              <Text style={styles.noSourcesText}>
                This claim may not have published fact-check coverage yet. Review trusted reporting before sharing it further.
              </Text>
            </View>
          ) : (
            results.map((item, index) => (
              <SourceCard key={index} item={item} />
            ))
          )}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Results summarize available fact-check coverage. Always read the source article before drawing a final conclusion.
          </Text>
        </View>

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="#16384C" />
          <Text style={styles.backBtnText}>Check another claim</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F4F1EA' },
  container: { padding: 20, paddingBottom: 44 },
  claimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E3E6DE',
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: '#8B9387',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  claimText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#10212B',
    lineHeight: 22,
  },
  verdictCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  verdictLabel: {
    fontSize: 24,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.3,
  },
  verdictRaw: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#66707A',
    marginTop: 6,
    textAlign: 'center',
  },
  sourcesSection: { marginBottom: 16 },
  sourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sourcesTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#10212B',
  },
  shareBtn: {
    backgroundColor: '#F5F6F2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E3E6DE',
  },
  shareBtnText: {
    color: '#16384C',
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  noSourcesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E6DE',
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F6F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noSourcesTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: '#10212B',
    marginBottom: 8,
  },
  noSourcesText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#66707A',
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: '#FFF4EF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0D4C8',
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#8F4A31',
    lineHeight: 19,
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DCE1D8',
  },
  backBtnText: {
    color: '#16384C',
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
  },
});
