import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  ScrollView,
  Share,
  Alert,
  Pressable,
  Linking,
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

function getDomain(item) {
  const candidate = item?.source || item?.url || '';
  try {
    const parsed = new URL(candidate);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return candidate.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'unknown';
  }
}

function getEvidenceOpenUrl(item) {
  if (item?.pdfUrl) {
    if (item?.pdfPageNumber != null) {
      return `${item.pdfUrl}#page=${item.pdfPageNumber}`;
    }
    return item.pdfUrl;
  }

  if (!item?.url) return '';
  if (!item?.sectionAnchor) return item.url;
  if (item.url.includes('#')) return item.url;
  return `${item.url}#${item.sectionAnchor}`;
}

function getEvidenceLocationLabel(item) {
  const parts = [];
  if (item?.sectionAnchor) parts.push(`Section: ${item.sectionAnchor}`);
  if (item?.pdfPageNumber != null) parts.push(`PDF page: ${item.pdfPageNumber}`);
  if (item?.evidenceType) parts.push(item.evidenceType);
  return parts.join(' | ');
}

export default function ResultScreen() {
  const router = useRouter();
  const { claim, resultData, govData, mode } = useLocalSearchParams();
  const contentAnim = useRef(new Animated.Value(0)).current;
  const [visibleGovCount, setVisibleGovCount] = useState(6);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [govSortMode, setGovSortMode] = useState('score');

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
    if (resultData) parsedResult = JSON.parse(resultData);
  } catch {
    parsedResult = { verdict: 'Error parsing result', results: [] };
  }

  let parsedGov = { status: 'not_found', results: [] };
  try {
    if (govData) parsedGov = JSON.parse(govData);
  } catch { /* ignore */ }

  const { verdict, results = [] } = parsedResult;
  const verificationClass = parsedResult.classification || '';
  const verificationExplanation = parsedResult.explanation || '';
  const incorrectParts = parsedResult.incorrectParts || [];
  const evidence = parsedResult.evidence || [];
  const govResults = parsedGov.results || [];
  const govKeywords = parsedGov.keywords || [];
  const govQueriesTried = parsedGov.queriesTried || [];

  const availableDomains = ['all', ...new Set(govResults.map((item) => getDomain(item)).filter(Boolean))];
  const filteredGovResults = selectedDomain === 'all'
    ? govResults
    : govResults.filter((item) => getDomain(item) === selectedDomain);
  const sortedGovResults = [...filteredGovResults].sort((a, b) => {
    if (govSortMode === 'source') {
      return getDomain(a).localeCompare(getDomain(b));
    }
    return (b.score?.ranking_score || 0) - (a.score?.ranking_score || 0);
  });
  const visibleGovResults = sortedGovResults.slice(0, visibleGovCount);
  const hasMoreGovResults = sortedGovResults.length > visibleGovCount;
  const verdictConfig = getVerdictConfig(verdict);

  const handleShare = async () => {
    try {
      const sourceLines = results
        .slice(0, 3)
        .map((r) => `• ${r.source}: ${r.rating}`)
        .join('\n');
      await Share.share({
        message: `Civic Signal\n\nInput: "${claim}"\nVerdict: ${verificationClass || verdictConfig.label}\n\nSources:\n${sourceLines || 'No sources found.'}`,
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
          <Text style={[styles.verdictLabel, { color: verdictConfig.color }]}>{verificationClass || verdictConfig.label}</Text>
          {verdict && verdict !== verificationClass && verdict !== verdictConfig.label && (
            <Text style={styles.verdictRaw}>{verdict}</Text>
          )}
        </View>

        {verificationExplanation ? (
          <View style={styles.verifyCard}>
            <Text style={styles.verifyTitle}>Verification Analysis</Text>
            <Text style={styles.verifyText}>{verificationExplanation}</Text>
            {incorrectParts.length > 0 && (
              <View style={styles.incorrectWrap}>
                <Text style={styles.incorrectTitle}>Incorrect Parts</Text>
                {incorrectParts.map((part, idx) => (
                  <Text key={`${part}-${idx}`} style={styles.incorrectItem}>• {part}</Text>
                ))}
              </View>
            )}
            {evidence.length > 0 && (
              <Text style={styles.verifySubText}>Evidence records analyzed: {evidence.length}</Text>
            )}
          </View>
        ) : null}

        {mode !== 'news' && (
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
        )}

        {govResults.length > 0 && (
          <View style={styles.sourcesSection}>
            <View style={styles.sourcesHeader}>
              <Text style={styles.sourcesTitle}>Government Sources ({govResults.length})</Text>
            </View>

            {govKeywords.length > 0 && (
              <View style={styles.metaCard}>
                <Text style={styles.metaTitle}>Detected Keywords</Text>
                <View style={styles.keywordRow}>
                  {govKeywords.map((kw) => (
                    <View key={kw} style={styles.keywordChip}>
                      <Text style={styles.keywordChipText}>{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {govQueriesTried.length > 0 && (
              <View style={styles.metaCard}>
                <Text style={styles.metaTitle}>Queries Tried</Text>
                <Text style={styles.metaText}>
                  {govQueriesTried.slice(0, 8).join(' | ')}
                  {govQueriesTried.length > 8 ? ' | ...' : ''}
                </Text>
              </View>
            )}

            <View style={styles.controlCard}>
              <Text style={styles.metaTitle}>Filters</Text>
              <View style={styles.controlRow}>
                {availableDomains.slice(0, 8).map((domain) => {
                  const active = selectedDomain === domain;
                  return (
                    <Pressable
                      key={domain}
                      onPress={() => {
                        setSelectedDomain(domain);
                        setVisibleGovCount(6);
                      }}
                      style={[styles.controlChip, active && styles.controlChipActive]}
                    >
                      <Text style={[styles.controlChipText, active && styles.controlChipTextActive]}>
                        {domain === 'all' ? 'All domains' : domain}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.sortRow}>
                <Pressable
                  onPress={() => setGovSortMode('score')}
                  style={[styles.sortBtn, govSortMode === 'score' && styles.sortBtnActive]}
                >
                  <Text style={[styles.sortBtnText, govSortMode === 'score' && styles.sortBtnTextActive]}>
                    Sort by score
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setGovSortMode('source')}
                  style={[styles.sortBtn, govSortMode === 'source' && styles.sortBtnActive]}
                >
                  <Text style={[styles.sortBtnText, govSortMode === 'source' && styles.sortBtnTextActive]}>
                    Sort by source
                  </Text>
                </Pressable>
              </View>
            </View>

            {visibleGovResults.map((item, index) => (
              <Pressable
                key={index}
                style={styles.govCard}
                onPress={() => {
                  const openUrl = getEvidenceOpenUrl(item);
                  if (openUrl) Linking.openURL(openUrl);
                }}
                android_ripple={{ color: '#1D4ED820' }}
              >
                <View style={styles.govCardHeader}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#16384C" />
                  <Text style={styles.govSource} numberOfLines={1}>{item.source || 'Government Source'}</Text>
                </View>
                {item.title ? (
                  <Text style={styles.govTitle} numberOfLines={2}>{item.title}</Text>
                ) : null}
                <Text style={styles.govUrl} numberOfLines={2}>{item.url}</Text>
                {item.snippet ? (
                  <Text style={styles.govSnippet} numberOfLines={3}>{item.snippet}</Text>
                ) : null}
                {getEvidenceLocationLabel(item) ? (
                  <View style={styles.locationChip}>
                    <Ionicons name="locate-outline" size={14} color="#365469" />
                    <Text style={styles.locationChipText}>{getEvidenceLocationLabel(item)}</Text>
                  </View>
                ) : null}
                {item.score?.ranking_score != null && (
                  <View style={styles.govScoreRow}>
                    <Text style={styles.govScoreLabel}>Relevance score: </Text>
                    <Text style={styles.govScoreValue}>{item.score.ranking_score}</Text>
                  </View>
                )}
              </Pressable>
            ))}

            {hasMoreGovResults && (
              <Pressable
                style={styles.showMoreBtn}
                onPress={() => setVisibleGovCount((count) => count + 6)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#16384C" />
                <Text style={styles.showMoreBtnText}>
                  Show more sources ({sortedGovResults.length - visibleGovCount} left)
                </Text>
              </Pressable>
            )}
          </View>
        )}

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
  verifyCard: {
    backgroundColor: '#F7FBF7',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D5E8D9',
  },
  verifyTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#1F5E44',
    marginBottom: 8,
  },
  verifyText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Manrope_500Medium',
    color: '#2D4E3D',
  },
  verifySubText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    color: '#4A6A59',
  },
  incorrectWrap: {
    marginTop: 10,
    backgroundColor: '#FFF7F1',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F2DDCD',
  },
  incorrectTitle: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: '#8F4A31',
    marginBottom: 4,
  },
  incorrectItem: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Manrope_500Medium',
    color: '#8F4A31',
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
  govCard: {
    backgroundColor: '#EEF3F5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C9D9DF',
  },
  govCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  govSource: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
    color: '#16384C',
    flex: 1,
  },
  govTitle: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
    color: '#10212B',
    marginBottom: 6,
  },
  govUrl: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#3B7A9E',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  govSnippet: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#435966',
    lineHeight: 18,
    marginBottom: 8,
  },
  locationChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F0F4',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C9D9DF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  locationChipText: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: '#365469',
  },
  govScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  govScoreLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#66707A',
  },
  govScoreValue: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: '#16384C',
  },
  metaCard: {
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DBE3E8',
    marginBottom: 10,
  },
  metaTitle: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: '#365469',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
    color: '#4C5F6D',
    lineHeight: 18,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: '#E7EDF2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C8D8E2',
  },
  keywordChipText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: '#16384C',
  },
  showMoreBtn: {
    backgroundColor: '#F5F6F2',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8E1E7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  showMoreBtnText: {
    color: '#16384C',
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  controlCard: {
    backgroundColor: '#F9FAF8',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E1E7EA',
    marginBottom: 10,
  },
  controlRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  controlChip: {
    backgroundColor: '#EDF2F5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D3DEE6',
  },
  controlChipActive: {
    backgroundColor: '#16384C',
    borderColor: '#16384C',
  },
  controlChipText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: '#16384C',
  },
  controlChipTextActive: {
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    backgroundColor: '#EDF2F5',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D3DEE6',
  },
  sortBtnActive: {
    backgroundColor: '#16384C',
    borderColor: '#16384C',
  },
  sortBtnText: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
    color: '#16384C',
  },
  sortBtnTextActive: {
    color: '#FFFFFF',
  },
});
