import React from 'react';
import { StyleSheet, View, Pressable, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

/**
 * SourceCard - Displays a single fact-check source with a rating badge and link button.
 */
export default function SourceCard({ item }) {
  const { claim, rating, source, url } = item;

  const ratingColor = getRatingColor(rating);

  const handleOpenSource = async () => {
    if (!url) {
      Alert.alert('No URL', 'This source does not have a link available.');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot Open', `Unable to open: ${url}`);
      }
    } catch {
      Alert.alert('Error', 'Failed to open the source URL.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sourceName} numberOfLines={1}>{source || 'Unknown Source'}</Text>
        <View style={[styles.badge, { backgroundColor: ratingColor + '16' }]}>
          <Text style={[styles.badgeText, { color: ratingColor }]}>{rating || 'N/A'}</Text>
        </View>
      </View>
      {claim ? (
        <Text style={styles.claimText} numberOfLines={3}>{claim}</Text>
      ) : null}
      <Pressable style={styles.button} onPress={handleOpenSource} android_ripple={{ color: '#1D4ED820' }}>
        <Ionicons name="arrow-forward" size={16} color="#16384C" />
        <Text style={styles.buttonText}>Open source</Text>
      </Pressable>
    </View>
  );
}

function getRatingColor(rating) {
  if (!rating) return '#6B7280';
  const r = rating.toLowerCase();
  if (r.includes('false') || r.includes('fake') || r.includes('mislead')) return '#EF4444';
  if (r.includes('true') || r.includes('correct') || r.includes('accurate')) return '#10B981';
  if (r.includes('partial') || r.includes('mix') || r.includes('mostly')) return '#F59E0B';
  return '#6B7280';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E6DE',
    shadowColor: '#16384C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sourceName: {
    fontSize: 15,
    fontFamily: 'Manrope_700Bold',
    color: '#10212B',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Manrope_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  claimText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    color: '#66707A',
    lineHeight: 20,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#F5F6F2',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E3E6DE',
  },
  buttonText: {
    color: '#16384C',
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
  },
});
