import React from 'react';
import { StyleSheet, View, Pressable, Linking, Alert } from 'react-native';
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
        <View style={[styles.badge, { backgroundColor: ratingColor + '20' }]}>
          <Text style={[styles.badgeText, { color: ratingColor }]}>{rating || 'N/A'}</Text>
        </View>
      </View>
      {claim ? (
        <Text style={styles.claimText} numberOfLines={3}>{claim}</Text>
      ) : null}
      <Pressable style={styles.button} onPress={handleOpenSource} android_ripple={{ color: '#1D4ED820' }}>
        <Text style={styles.buttonText}>🔗  Read Source</Text>
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sourceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  claimText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  buttonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
});
