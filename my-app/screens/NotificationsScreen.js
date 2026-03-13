import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text } from 'react-native-paper';
import { getNotifications } from '../services/api';

const CATEGORY_OPTIONS = [
  'All',
  'Government Schemes',
  'Policies',
  'Agriculture schemes',
  'Public services announcements',
];

function formatDate(value) {
  if (!value) return 'Recently detected';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently detected';
  return date.toLocaleString();
}

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const activeCategory = useMemo(
    () => (selectedCategory === 'All' ? '' : selectedCategory),
    [selectedCategory]
  );

  const fetchData = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const payload = await getNotifications({ limit: 50, category: activeCategory });
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setItems(list);
    } catch (error) {
      Alert.alert('Notifications Error', error.message || 'Could not fetch notifications.');
    } finally {
      if (asRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [activeCategory]);

  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [fetchData])
  );

  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchData(false);
      }
    }, [selectedCategory])
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchData(true)}
          tintColor="#16384C"
        />
      }
    >
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>New updates feed</Text>
        <Text style={styles.title}>New Schemes and Announcements</Text>
        <Text style={styles.subtitle}>
          Latest government schemes, yojanas, policies, and public service announcements detected from official sources.
        </Text>
      </View>

      <View style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Category Filter</Text>
        <View style={styles.filtersRow}>
          {CATEGORY_OPTIONS.map((item) => {
            const active = item === selectedCategory;
            return (
              <Pressable
                key={item}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#16384C" />
          <Text style={styles.loaderText}>Loading new updates...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="notifications-off-outline" size={26} color="#66707A" />
          <Text style={styles.emptyTitle}>No new notifications right now</Text>
          <Text style={styles.emptyText}>
            Pull down to refresh. New scheme or policy alerts will appear here when detected.
          </Text>
        </View>
      ) : (
        items.map((item, index) => (
          <Pressable
            key={`${item.id || 'n'}-${index}`}
            style={styles.notificationCard}
            onPress={() => {
              if (item.page_url) {
                Linking.openURL(item.page_url).catch(() => {
                  Alert.alert('Open Link Failed', 'Could not open source URL.');
                });
              }
            }}
            android_ripple={{ color: '#1D4ED820' }}
          >
            <View style={styles.rowTop}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{item.category || 'Government Schemes'}</Text>
              </View>
              <Text style={styles.timeText}>{formatDate(item.created_at)}</Text>
            </View>

            <Text style={styles.cardTitle}>{item.title || 'Government update'}</Text>
            <Text style={styles.cardDesc} numberOfLines={3}>
              {item.description || 'Open source page to read details.'}
            </Text>

            <View style={styles.sourceRow}>
              <Ionicons name="shield-checkmark-outline" size={15} color="#16384C" />
              <Text style={styles.sourceText} numberOfLines={1}>{item.source_site || 'Official source'}</Text>
            </View>
            <Text style={styles.urlText} numberOfLines={1}>{item.page_url || ''}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F4F1EA' },
  container: { padding: 18, paddingBottom: 90 },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3E6DE',
    padding: 16,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#8B9387',
    fontFamily: 'Manrope_700Bold',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    color: '#16384C',
    fontFamily: 'Manrope_800ExtraBold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#55646F',
    fontFamily: 'Manrope_500Medium',
  },
  filtersCard: {
    backgroundColor: '#F9FAF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E7EA',
    padding: 12,
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#365469',
    fontFamily: 'Manrope_700Bold',
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#EDF2F5',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D3DEE6',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: '#16384C',
    borderColor: '#16384C',
  },
  filterText: {
    fontSize: 12,
    color: '#16384C',
    fontFamily: 'Manrope_700Bold',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    color: '#4C5F6D',
    fontFamily: 'Manrope_600SemiBold',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3E6DE',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#10212B',
    fontFamily: 'Manrope_700Bold',
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#66707A',
    textAlign: 'center',
    fontFamily: 'Manrope_500Medium',
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE1D8',
    padding: 14,
    marginBottom: 10,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#E8F0F4',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C9D9DF',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  categoryChipText: {
    fontSize: 11,
    color: '#365469',
    fontFamily: 'Manrope_700Bold',
  },
  timeText: {
    fontSize: 11,
    color: '#7B8790',
    fontFamily: 'Manrope_600SemiBold',
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 21,
    color: '#10212B',
    fontFamily: 'Manrope_800ExtraBold',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#4C5F6D',
    fontFamily: 'Manrope_500Medium',
    marginBottom: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sourceText: {
    flex: 1,
    fontSize: 12,
    color: '#16384C',
    fontFamily: 'Manrope_700Bold',
  },
  urlText: {
    fontSize: 12,
    color: '#3B7A9E',
    textDecorationLine: 'underline',
    fontFamily: 'Manrope_500Medium',
  },
});
