import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  Share,
  Alert,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SourceCard from '../components/SourceCard';

const VERDICT_CONFIG = {
  false: { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', emoji: '❌', label: 'Likely False' },
  fake: { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', emoji: '❌', label: 'Fake' },
  mislead: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', emoji: '⚠️', label: 'Misleading' },
  true: { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', emoji: '✅', label: 'Likely True' },
  correct: { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', emoji: '✅', label: 'Likely True' },
  found: { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', emoji: '📋', label: 'Fact Checks Found' },
  default: { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', emoji: '🔍', label: 'No Fact Check Found' },
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
        message: `🛡️ CivicShield Fact Check\n\nClaim: "${claim}"\nVerdict: ${verdictConfig.label}\n\nSources:\n${sourceLines || 'No sources found.'}\n\nVerified with CivicShield`,
      });
    } catch {
      Alert.alert('Share Failed', 'Could not share the result.');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Claim Section */}
      <View style={styles.claimCard}>
        <Text style={styles.sectionLabel}>CLAIM CHECKED</Text>
        <Text style={styles.claimText}>{claim || 'No claim provided.'}</Text>
      </View>

      {/* Verdict Section */}
      <View style={[styles.verdictCard, { backgroundColor: verdictConfig.bg, borderColor: verdictConfig.border }]}>
        <Text style={styles.verdictEmoji}>{verdictConfig.emoji}</Text>
        <Text style={[styles.verdictLabel, { color: verdictConfig.color }]}>{verdictConfig.label}</Text>
        {verdict && verdict !== verdictConfig.label && (
          <Text style={styles.verdictRaw}>{verdict}</Text>
        )}
      </View>

      {/* Sources Section */}
      <View style={styles.sourcesSection}>
        <View style={styles.sourcesHeader}>
          <Text style={styles.sourcesTitle}>
            Sources ({results.length})
          </Text>
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>↑ Share</Text>
          </Pressable>
        </View>

        {results.length === 0 ? (
          <View style={styles.noSourcesCard}>
            <Text style={styles.noSourcesEmoji}>🔎</Text>
            <Text style={styles.noSourcesTitle}>No Sources Found</Text>
            <Text style={styles.noSourcesText}>
              No fact-checking organizations have reviewed this specific claim yet. Please verify with trusted news sources.
            </Text>
          </View>
        ) : (
          results.map((item, index) => (
            <SourceCard key={index} item={item} />
          ))
        )}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️  CivicShield cannot guarantee 100% accuracy. Always cross-reference with trusted sources.
        </Text>
      </View>

      {/* Back Button */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Verify Another Claim</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { padding: 20, paddingBottom: 40 },
  claimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  claimText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    fontWeight: '500',
  },
  verdictCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  verdictEmoji: { fontSize: 40, marginBottom: 8 },
  verdictLabel: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  verdictRaw: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  shareBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  noSourcesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noSourcesEmoji: { fontSize: 36, marginBottom: 12 },
  noSourcesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  noSourcesText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    textAlign: 'center',
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  backBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 15,
  },
});
