import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

const PRINCIPLES = [
  {
    icon: 'flash-outline',
    title: 'Fast checks',
    desc: 'Paste a claim and review fact-check coverage in one pass.',
  },
  {
    icon: 'newspaper-outline',
    title: 'Traceable sources',
    desc: 'Open the original article instead of relying on summary text alone.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Simple verdicts',
    desc: 'Clear labels make it easier to decide what needs a closer look.',
  },
];

export default function AboutScreen() {
  const heroAnim = useRef(new Animated.Value(0)).current;
  const sectionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sectionsAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroAnim, sectionsAnim]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Animated.View
        style={[
          styles.hero,
          {
            opacity: heroAnim,
            transform: [
              {
                translateY: heroAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.heroEyebrow}>about the product</Text>
        <Text style={styles.appName}>Civic Signal</Text>
        <Text style={styles.tagline}>
          A focused way to review civic claims without extra clutter.
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: sectionsAnim,
            transform: [
              {
                translateY: sectionsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What it does</Text>
          <Text style={styles.cardText}>
            Civic Signal checks whether a claim already has coverage from trusted fact-check publishers and gives you the source links in a cleaner format.
          </Text>
          <Text style={styles.cardText}>
            It is designed for quick verification before sharing posts, headlines, or public updates.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Core principles</Text>
        {PRINCIPLES.map((item) => (
          <View key={item.title} style={styles.featureRow}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={18} color="#16384C" />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What powers it</Text>
          <View style={styles.techGrid}>
            {['Expo', 'React Native', 'Node.js', 'Google Fact Check API', 'Axios'].map((item) => (
              <View key={item} style={styles.techChip}>
                <Text style={styles.techChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Use it as a starting point</Text>
          <Text style={styles.noteText}>
            Not every claim is already reviewed. When no source appears, treat that as a cue to verify more broadly rather than a final answer.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F4F1EA' },
  container: { padding: 20, paddingBottom: 118 },
  hero: {
    padding: 24,
    backgroundColor: '#E8ECE5',
    borderRadius: 28,
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: '#6E766D',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    lineHeight: 36,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#16384C',
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Manrope_500Medium',
    color: '#4E5C65',
    marginTop: 10,
    maxWidth: '90%',
  },
  content: {
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E3E6DE',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_800ExtraBold',
    color: '#10212B',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: '#4E5C65',
    lineHeight: 21,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    color: '#8B9387',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E6DE',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F1EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: '#10212B',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#66707A',
    lineHeight: 20,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techChip: {
    backgroundColor: '#F5F6F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E3E6DE',
  },
  techChipText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    color: '#16384C',
  },
  noteCard: {
    backgroundColor: '#FFF4EF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0D4C8',
  },
  noteTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: '#8F4A31',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#8F4A31',
    lineHeight: 20,
  },
});
