import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, TrendingUp, Hash } from 'lucide-react-native';

export default function DiscoverScreen() {
  const trendingHashtags = [
    { tag: 'fyp', views: '125.4B' },
    { tag: 'viral', views: '89.2B' },
    { tag: 'trending', views: '67.8B' },
    { tag: 'comedy', views: '45.3B' },
    { tag: 'dance', views: '38.9B' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Search users, hashtags, sounds...</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#ff2e4c" />
            <Text style={styles.sectionTitle}>Trending Hashtags</Text>
          </View>

          {trendingHashtags.map((item, index) => (
            <View key={index} style={styles.hashtagItem}>
              <View style={styles.hashtagIconContainer}>
                <Hash size={20} color="#000" />
              </View>
              <View style={styles.hashtagInfo}>
                <Text style={styles.hashtagText}>#{item.tag}</Text>
                <Text style={styles.hashtagViews}>{item.views} views</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.placeholderSection}>
          <Text style={styles.placeholderText}>More content coming soon...</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: '#666',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  hashtagIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
    marginBottom: 2,
  },
  hashtagViews: {
    fontSize: 13,
    color: '#666',
  },
  placeholderSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
  },
});
