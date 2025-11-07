import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Grid3x3, Heart } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import { mockVideos, Video } from '../../mocks/videos';
import { useApp } from '../../contexts/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_SIZE = (SCREEN_WIDTH - 4) / 3;

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { isFollowing, toggleFollow } = useApp();
  const [activeTab, setActiveTab] = useState('videos' as 'videos' | 'liked');

  // Ensure userId is a string
  const userIdString = Array.isArray(userId) ? userId[0] || '' : userId || '';
  
  const userVideos = mockVideos.filter((video) => video.creator.id === userIdString);
  const creator = userVideos[0]?.creator;

  if (!creator) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  const isUserFollowing = isFollowing(userIdString);

  const renderVideoItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.videoItem}
      activeOpacity={0.8}
      onPress={() => console.log('Open video:', item.id)}
    >
      <View style={styles.videoThumbnail}>
        <View style={styles.videoOverlay}>
          <Heart size={20} color="#fff" fill="#fff" />
          <Text style={styles.videoStats}>{formatCount(item.likes)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerUsername}>@{creator.username}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <FlatList
        data={activeTab === 'videos' ? userVideos : []}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.profileHeader}>
              <Image source={{ uri: creator.avatar }} style={styles.avatar} />

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(userVideos.length)}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(creator.followers)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(creator.following)}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            <Text style={styles.bio}>{creator.bio}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.followButton, isUserFollowing && styles.followingButton]}
                onPress={() => toggleFollow(userIdString)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.followButtonText, isUserFollowing && styles.followingButtonText]}
                >
                  {isUserFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.messageButton} activeOpacity={0.8}>
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
                onPress={() => setActiveTab('videos')}
              >
                <Grid3x3 size={20} color={activeTab === 'videos' ? '#000' : '#666'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
                onPress={() => setActiveTab('liked')}
              >
                <Heart
                  size={20}
                  color={activeTab === 'liked' ? '#000' : '#666'}
                  fill={activeTab === 'liked' ? '#000' : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  headerPlaceholder: {
    width: 32,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  bio: {
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#ff2e4c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  followingButtonText: {
    color: '#000',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  row: {
    gap: 2,
    paddingHorizontal: 0,
  },
  videoItem: {
    width: VIDEO_SIZE,
    height: VIDEO_SIZE * 1.4,
    marginBottom: 2,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  videoOverlay: {
    position: 'absolute' as const,
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoStats: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
});
