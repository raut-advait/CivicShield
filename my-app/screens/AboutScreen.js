import React from 'react';
import { StyleSheet, View, ScrollView, Linking, Pressable } from 'react-native';
import { Text } from 'react-native-paper';

const FEATURES = [
  { emoji: '🔍', title: 'AI-Powered Detection', desc: 'Uses Google Fact Check Tools API to scan trusted fact-checking databases worldwide.' },
  { emoji: '⚡', title: 'Real-Time Results', desc: 'Get instant verdicts on any civic claim, government scheme, or election news.' },
  { emoji: '📰', title: 'Trusted Sources', desc: 'Results are sourced from verified publishers like Alt News, BOOM, Snopes, and more.' },
  { emoji: '🔒', title: 'Evidence-Based', desc: 'Every verdict is backed by references so you can read the original fact-check reports.' },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* App Identity */}
      <View style={styles.hero}>
        <View style={styles.shieldBadge}>
          <Text style={styles.shieldEmoji}>🛡️</Text>
        </View>
        <Text style={styles.appName}>CivicShield</Text>
        <Text style={styles.tagline}>AI Powered Civic Misinformation Shield</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v1.0 · Hackathon Edition</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About This App</Text>
        <Text style={styles.cardText}>
          CivicShield helps citizens verify civic news related to government schemes,
          elections, and public information. In an era of rampant misinformation,
          CivicShield empowers you with evidence-based insights before you share or act on
          unverified claims.
        </Text>
        <Text style={styles.cardText}>
          The system checks trusted, independent fact-checking organizations and presents
          structured, evidence-based results — helping you cut through noise and access truth.
        </Text>
      </View>

      {/* Features */}
      <Text style={styles.sectionLabel}>KEY FEATURES</Text>
      {FEATURES.map((f) => (
        <View key={f.title} style={styles.featureRow}>
          <Text style={styles.featureEmoji}>{f.emoji}</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        </View>
      ))}

      {/* Technology */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Technology Stack</Text>
        <View style={styles.techGrid}>
          {['React Native', 'Expo', 'Node.js', 'Google Fact Check API', 'React Navigation', 'Axios'].map((t) => (
            <View key={t} style={styles.techChip}>
              <Text style={styles.techChipText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>⚠️  Important Notice</Text>
        <Text style={styles.disclaimerText}>
          CivicShield cannot guarantee 100% accuracy. The system relies on existing
          fact-check databases and may not have reviewed every claim. We strongly
          encourage users to verify information from multiple trusted sources and
          exercise independent judgment.
        </Text>
      </View>

      {/* Built For */}
      <View style={styles.footerCard}>
        <Text style={styles.footerEmoji}>🏆</Text>
        <Text style={styles.footerText}>Built for Hackathon 2026</Text>
        <Text style={styles.footerSub}>Promoting digital literacy &amp; civic awareness</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { padding: 20, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  shieldBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  shieldEmoji: { fontSize: 40 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  versionBadge: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureEmoji: { fontSize: 24 },
  featureInfo: { flex: 1 },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  techChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  disclaimerCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  footerCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  footerEmoji: { fontSize: 32, marginBottom: 8 },
  footerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 12,
    color: '#93C5FD',
    textAlign: 'center',
  },
});
