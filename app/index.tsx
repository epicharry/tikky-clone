import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import VideoPlayer from '../components/VideoPlayer';
import { useApp } from '../contexts/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const { videos, likeVideo, moveToNextVideo, isRecommendationReady } = useApp();

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        
        if (newIndex > activeVideoIndex) {
          moveToNextVideo();
        }
        
        setActiveVideoIndex(newIndex);
      }
    }
  ).current;

  const handleLike = (id: string) => {
    likeVideo(id);
  };

  const handleUpdateComments = (videoId: string, newCommentText: string) => {
    console.log('New comment on video:', videoId, newCommentText);
  };

  const handleShare = (id: string) => {
    console.log('Share video:', id);
  };

  if (!isRecommendationReady || videos.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Loading your personalized feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => router.push('/record')}
        activeOpacity={0.8}
      >
        <Plus size={32} color="#fff" strokeWidth={3} />
      </TouchableOpacity>
      <FlatList
        data={videos}
        renderItem={({ item, index }) => (
          <VideoPlayer
            video={item}
            isActive={index === activeVideoIndex}
            onLike={handleLike}
            onShare={handleShare}
            onUpdateComments={handleUpdateComments}
          />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  recordButton: {
    position: 'absolute' as const,
    bottom: 120,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff2e4c',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowColor: '#ff2e4c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});
