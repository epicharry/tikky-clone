import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import VideoPlayer from '../components/VideoPlayer';
import {
  searchVideos,
  getVideoDetails,
  VideoSource,
  VideoSearchResult,
} from '../services/videoSourceService';
import { Video as VideoType } from '../mocks/videos';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverFeedScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [preloadedVideoIds, setPreloadedVideoIds] = useState<Set<string>>(new Set());
  const [showHeader, setShowHeader] = useState(true);

  const searchQuery = Array.isArray(params.query) ? params.query[0] : params.query;
  const source = (Array.isArray(params.source) ? params.source[0] : params.source) as VideoSource;
  const initialIndex = params.index ? parseInt(Array.isArray(params.index) ? params.index[0] : params.index) : 0;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useEffect(() => {
    loadInitialVideos();
  }, []);

  const loadInitialVideos = async () => {
    if (!searchQuery || !source) return;

    setIsLoading(true);
    try {
      const response = await searchVideos(source, searchQuery, 1);
      const convertedVideos = await convertSearchResultsToVideos(response.results, source);
      setVideos(convertedVideos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreVideos = async () => {
    if (isLoadingMore || !searchQuery || !source) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const response = await searchVideos(source, searchQuery, nextPage);
      const convertedVideos = await convertSearchResultsToVideos(response.results, source);
      setVideos((prev) => [...prev, ...convertedVideos]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load more videos:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const convertSearchResultsToVideos = async (
    results: VideoSearchResult[],
    source: VideoSource
  ): Promise<VideoType[]> => {
    const videoPromises = results.map(async (result) => {
      try {
        const details = await getVideoDetails(source, result.id);
        return {
          id: result.id,
          videoUrl: details.video_url,
          creator: {
            id: 'discovery',
            username: 'Discovered',
            avatar: 'https://i.pravatar.cc/150?img=50',
            bio: 'Discovered content',
            followers: 0,
            following: 0,
            totalLikes: 0,
          },
          description: result.title,
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          music: {
            name: result.title,
            artist: 'Unknown',
          },
          commentsList: [],
        };
      } catch (error) {
        console.error(`Failed to load video ${result.id}:`, error);
        return null;
      }
    });

    const videos = await Promise.all(videoPromises);
    return videos.filter((v): v is VideoType => v !== null);
  };

  useEffect(() => {
    preloadNextVideos(activeVideoIndex);
  }, [activeVideoIndex, videos]);

  const preloadNextVideos = async (currentIndex: number) => {
    const PRELOAD_COUNT = 5;
    const startIndex = currentIndex + 1;
    const endIndex = Math.min(startIndex + PRELOAD_COUNT, videos.length);

    for (let i = startIndex; i < endIndex; i++) {
      const video = videos[i];
      if (video && !preloadedVideoIds.has(video.id)) {
        try {
          if (Platform.OS === 'web') {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'video';
            preloadLink.href = video.videoUrl;
            document.head.appendChild(preloadLink);
          } else {
            fetch(video.videoUrl, { method: 'HEAD' }).catch(() => {});
          }

          setPreloadedVideoIds((prev) => new Set(prev).add(video.id));
        } catch (error) {
          console.log('Preload not supported or failed:', error);
        }
      }
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        setActiveVideoIndex(newIndex);

        if (newIndex >= videos.length - 3 && !isLoadingMore) {
          loadMoreVideos();
        }
      }
    }
  ).current;

  const handleLike = (id: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              isLiked: !v.isLiked,
              likes: v.isLiked ? v.likes - 1 : v.likes + 1,
            }
          : v
      )
    );
  };

  const handleUpdateComments = (videoId: string, newCommentText: string) => {
    console.log('New comment on video:', videoId, newCommentText);
  };

  const handleShare = (id: string) => {
    console.log('Share video:', id);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#ff2e4c" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>No videos found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {showHeader && (
        <SafeAreaView style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Discovery</Text>
          <View style={styles.headerPlaceholder} />
        </SafeAreaView>
      )}

      <FlatList
        data={videos}
        renderItem={({ item, index }) => (
          <VideoPlayer
            video={item}
            isActive={index === activeVideoIndex}
            onLike={handleLike}
            onShare={handleShare}
            onUpdateComments={handleUpdateComments}
            videoSource={source}
          />
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
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
        initialScrollIndex={initialIndex}
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
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  headerContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  headerPlaceholder: {
    width: 40,
  },
});
