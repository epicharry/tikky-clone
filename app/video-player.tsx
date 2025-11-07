import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Video, ResizeMode } from 'expo-av';
import { ArrowLeft } from 'lucide-react-native';
import { getVideoDetails, VideoSource, VideoDetails } from '../services/videoSourceService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const videoId = Array.isArray(params.videoId) ? params.videoId[0] : params.videoId;
  const source = (Array.isArray(params.source) ? params.source[0] : params.source) as VideoSource;
  const title = Array.isArray(params.title) ? params.title[0] : params.title;
  const videoDataParam = Array.isArray(params.videoData) ? params.videoData[0] : params.videoData;

  useEffect(() => {
    loadVideoDetails();
  }, [videoId, source, videoDataParam]);

  const loadVideoDetails = async () => {
    if (videoDataParam) {
      try {
        const parsedVideoData = JSON.parse(videoDataParam);
        setVideoDetails({
          video_url: parsedVideoData.videoUrl,
          title: parsedVideoData.description || 'Liked Video',
        });
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Failed to parse video data:', err);
      }
    }

    if (!videoId || !source) {
      setError('Invalid video parameters');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const details = await getVideoDetails(source, videoId);
      setVideoDetails(details);
    } catch (err) {
      console.error('Failed to load video:', err);
      setError('Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.videoContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff2e4c" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadVideoDetails}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : videoDetails ? (
          <Video
            source={{ uri: videoDetails.video_url }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
          />
        ) : null}
      </View>

      {videoDetails && !isLoading && !error && (
        <View style={styles.infoContainer}>
          <Text style={styles.videoTitle}>{videoDetails.title}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 32,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff2e4c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  infoContainer: {
    padding: 20,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    lineHeight: 24,
  },
});
