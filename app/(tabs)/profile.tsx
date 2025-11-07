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
import { StatusBar } from 'expo-status-bar';
import { Settings, Grid3x3, Heart, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

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
  const router = useRouter();
  const { allVideos } = useApp();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('videos' as 'videos' | 'liked');

  if (!user) {
    return null;
  }

  const userVideos = allVideos.filter((video) => video.creator.id === user.id);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const renderVideoItem = ({ item }: { item: any }) => (
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
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerUsername}>@{user.username}</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
          <LogOut size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'videos' ? userVideos : []}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={userVideos.length > 0 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.profileHeader}>
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(userVideos.length)}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(user.followers_count)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(user.following_count)}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            <Text style={styles.bio}>{user.bio}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
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
            <Text style={styles.emptyText}>
              {activeTab === 'videos' ? 'No videos yet' : 'No liked videos'}
            </Text>
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
  headerUsername: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  settingsButton: {
    padding: 4,
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editButtonText: {
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
});
