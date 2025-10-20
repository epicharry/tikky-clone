import { Video as ExpoVideo, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music2 } from 'lucide-react-native';
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Animated,
  Image,
  Platform,
} from 'react-native';


import { Video as VideoType } from '../mocks/videos';
import { useApp } from '../contexts/AppContext';
import CommentsModal from './CommentsModal';

type VideoPlayerProps = {
  video: VideoType;
  isActive: boolean;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onUpdateComments: (videoId: string, newComment: string) => void;
};

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export default function VideoPlayer({ video, isActive, onLike, onShare, onUpdateComments }: VideoPlayerProps) {
  const { isFollowing, toggleFollow, trackVideoView } = useApp();
  const videoRef = useRef(null as any);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [lastTap, setLastTap] = useState(0 as number);
  const [totalWatchTime, setTotalWatchTime] = useState(0 as number);
  const [videoDuration, setVideoDuration] = useState(0 as number);
  const watchTimeIntervalRef = useRef(null as ReturnType<typeof setInterval> | null);
  const hasTrackedViewRef = useRef(false);
  const likeScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const musicRotation = useRef(new Animated.Value(0)).current;
  const isUserFollowing = isFollowing(video.creator.id);

  const startMusicRotation = () => {
    musicRotation.setValue(0);
    Animated.loop(
      Animated.timing(musicRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopMusicRotation = () => {
    musicRotation.stopAnimation();
  };

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.playAsync();
      setIsPaused(false);
      startMusicRotation();
      
      watchTimeIntervalRef.current = setInterval(() => {
        setTotalWatchTime(prev => prev + 1);
      }, 1000);
    } else if (videoRef.current) {
      videoRef.current.pauseAsync();
      stopMusicRotation();
      
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
        watchTimeIntervalRef.current = null;
      }
      
      if (!hasTrackedViewRef.current && totalWatchTime > 0 && videoDuration > 0) {
        trackVideoView(video.id, totalWatchTime, videoDuration);
        hasTrackedViewRef.current = true;
      }
    }
    
    return () => {
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
      }
    };
  }, [isActive, startMusicRotation, stopMusicRotation, totalWatchTime, videoDuration, video.id, trackVideoView]);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPaused) {
      await videoRef.current.playAsync();
      setIsPaused(false);
    } else {
      await videoRef.current.pauseAsync();
      setIsPaused(true);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        handleLike();
      }
    } else {
      setLastTap(now);
      setTimeout(() => {
        if (Date.now() - now >= DOUBLE_TAP_DELAY) {
          handlePlayPause();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLike(video.id);

    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (newLikedState) {
      heartScale.setValue(0);
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (!videoDuration && status.durationMillis) {
        setVideoDuration(status.durationMillis / 1000);
      }
      
      if (status.didJustFinish) {
        videoRef.current?.replayAsync();
        
        if (!hasTrackedViewRef.current && videoDuration > 0) {
          trackVideoView(video.id, videoDuration, videoDuration);
          hasTrackedViewRef.current = true;
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (!hasTrackedViewRef.current && totalWatchTime >= 3 && videoDuration > 0) {
        trackVideoView(video.id, totalWatchTime, videoDuration);
        hasTrackedViewRef.current = true;
      }
    };
  }, [video.id, totalWatchTime, videoDuration, trackVideoView]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <video
          src={video.videoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          loop
          playsInline
          muted={false}
          autoPlay={isActive}
          onClick={handlePlayPause}
        />
      ) : (
        <ExpoVideo
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={isActive}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
      )}

      <TouchableOpacity
        style={styles.videoOverlay}
        activeOpacity={1}
        onPress={handleDoubleTap}
      >
        {isPaused && (
          <View style={styles.pausedOverlay}>
            <View style={styles.pauseIcon} />
          </View>
        )}
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.centerHeart,
          {
            opacity: heartScale,
            transform: [{ scale: heartScale }],
          },
        ]}
      >
        <Heart size={120} color="#fff" fill="#fff" />
      </Animated.View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.avatarContainer}
          activeOpacity={0.8}
          onPress={() => {
            if (Platform.OS === 'web') {
              console.log('Navigate to profile:', video.creator.id);
            } else {
              const router = require('expo-router').router;
              router.push(`/profile/${video.creator.id}`);
            }
          }}
        >
          <Image source={{ uri: video.creator.avatar }} style={styles.avatar} />
          {!isUserFollowing && (
            <TouchableOpacity
              style={styles.followButton}
              onPress={() => toggleFollow(video.creator.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.followButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <View style={styles.actionButton}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <TouchableOpacity onPress={handleLike} activeOpacity={0.8}>
              <Heart
                size={34}
                color="#fff"
                fill={isLiked ? '#ff2e4c' : 'transparent'}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.actionText}>
            {formatCount(video.likes + (isLiked && !video.isLiked ? 1 : 0))}
          </Text>
        </View>

        <View style={styles.actionButton}>
          <TouchableOpacity onPress={() => setCommentsVisible(true)} activeOpacity={0.8}>
            <MessageCircle size={32} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.actionText}>{formatCount(video.commentsList.length)}</Text>
        </View>

        <View style={styles.actionButton}>
          <TouchableOpacity onPress={() => onShare(video.id)} activeOpacity={0.8}>
            <Share2 size={30} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.actionText}>{formatCount(video.shares)}</Text>
        </View>

        <View style={styles.actionButton}>
          <TouchableOpacity activeOpacity={0.8}>
            <MoreHorizontal size={32} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.username}>@{video.creator.username}</Text>
        <Text style={styles.description}>{video.description}</Text>
        <View style={styles.musicContainer}>
          <Music2 size={14} color="#fff" />
          <Text style={styles.musicText} numberOfLines={1}>
            {video.music.name} - {video.music.artist}
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.musicDisc,
          {
            transform: [
              {
                rotate: musicRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.musicDiscInner}>
          <Image source={{ uri: video.creator.avatar }} style={styles.musicDiscImage} />
        </View>
      </Animated.View>

      <CommentsModal
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        comments={video.commentsList}
        commentCount={video.commentsList.length}
        onAddComment={(text) => {
          onUpdateComments(video.id, text);
          setCommentsVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    position: 'relative' as const,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  pauseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerHeart: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    marginLeft: -60,
    marginTop: -60,
    pointerEvents: 'none',
  },
  rightActions: {
    position: 'absolute' as const,
    right: 12,
    bottom: 100,
    gap: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButton: {
    position: 'absolute' as const,
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff2e4c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 18,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomInfo: {
    position: 'absolute' as const,
    bottom: 100,
    left: 12,
    right: 80,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  musicText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    flex: 1,
  },
  musicDisc: {
    position: 'absolute' as const,
    bottom: 100,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2c2c2c',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  musicDiscInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  musicDiscImage: {
    width: '100%',
    height: '100%',
  },
});
