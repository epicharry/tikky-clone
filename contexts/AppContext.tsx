import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { mockVideos, Video } from '../mocks/videos';
import { RecommendationEngine } from '../services/recommendationEngine';
import { UserInteractionTracker } from '../services/userInteractionTracker';
import { VideoQueueManager } from '../services/videoQueueManager';

type FollowState = {
  [userId: string]: boolean;
};

export type NewVideoData = {
  videoUri: string;
  description?: string;
  music?: {
    name: string;
    artist: string;
  };
};

const [AppContext, useApp] = createContextHook(() => {
  const [followedUsers, setFollowedUsers] = useState({} as FollowState);
  const [allVideos, setAllVideos] = useState(mockVideos as Video[]);
  const [recommendedVideos, setRecommendedVideos] = useState([] as Video[]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const recommendationEngineRef = useRef(null as RecommendationEngine | null);
  const interactionTrackerRef = useRef(null as UserInteractionTracker | null);
  const queueManagerRef = useRef(null as VideoQueueManager | null);

  const toggleFollow = useCallback((userId: string) => {
    setFollowedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  }, []);

  const isFollowing = useCallback(
    (userId: string) => followedUsers[userId] || false,
    [followedUsers]
  );

  useEffect(() => {
    const initializeRecommendations = async () => {
      console.log('[AppContext] Initializing recommendation system...');
      
      if (!recommendationEngineRef.current) {
        recommendationEngineRef.current = new RecommendationEngine();
      }
      
      if (!interactionTrackerRef.current) {
        interactionTrackerRef.current = new UserInteractionTracker();
        await interactionTrackerRef.current.loadFromStorage();
      }
      
      if (!queueManagerRef.current) {
        queueManagerRef.current = new VideoQueueManager(
          allVideos,
          recommendationEngineRef.current,
          interactionTrackerRef.current
        );
        
        const initialQueue = await queueManagerRef.current.initialize();
        setRecommendedVideos(initialQueue);
        setIsInitialized(true);
        console.log('[AppContext] Recommendation system initialized');
      }
    };
    
    initializeRecommendations();
  }, [allVideos]);

  useEffect(() => {
    if (queueManagerRef.current && isInitialized) {
      queueManagerRef.current.updateAllVideos(allVideos);
    }
  }, [allVideos, isInitialized]);

  const addVideo = useCallback((newVideoData: NewVideoData) => {
    const newVideo: Video = {
      id: `user_${Date.now()}`,
      videoUrl: newVideoData.videoUri,
      creator: {
        id: 'current_user',
        username: 'You',
        avatar: 'https://i.pravatar.cc/150?img=99',
        bio: 'Just joined! 🎉',
        followers: 0,
        following: 0,
        totalLikes: 0,
      },
      description: newVideoData.description || 'My new video 🎥',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      music: newVideoData.music || {
        name: 'Original Sound',
        artist: 'You',
      },
      commentsList: [],
    };

    setAllVideos((prev) => [newVideo, ...prev]);
    
    if (queueManagerRef.current) {
      queueManagerRef.current.addNewVideo(newVideo);
      setRecommendedVideos(queueManagerRef.current.getVisibleQueue());
    }
    
    console.log('Video added to feed:', newVideo.id);
  }, []);

  const updateVideo = useCallback((videoId: string, updates: Partial<Video>) => {
    setAllVideos((prev) =>
      prev.map((video) => (video.id === videoId ? { ...video, ...updates } : video))
    );
    
    setRecommendedVideos((prev) =>
      prev.map((video) => (video.id === videoId ? { ...video, ...updates } : video))
    );
  }, []);

  const likeVideo = useCallback((videoId: string) => {
    setAllVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              likes: video.isLiked ? video.likes - 1 : video.likes + 1,
            }
          : video
      )
    );
    
    setRecommendedVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              likes: video.isLiked ? video.likes - 1 : video.likes + 1,
            }
          : video
      )
    );
  }, []);

  const trackVideoView = useCallback(
    (videoId: string, watchTime: number, videoDuration: number) => {
      if (!interactionTrackerRef.current) return;
      
      const video = allVideos.find(v => v.id === videoId);
      if (!video) return;
      
      const hashtags = video.description.match(/#(\w+)/g)?.map(tag => tag.toLowerCase()) || [];
      
      interactionTrackerRef.current.trackVideoView(
        videoId,
        watchTime,
        videoDuration,
        video.isLiked,
        video.commentsList.length > 0,
        false,
        video.creator.id,
        hashtags
      );
    },
    [allVideos]
  );

  const moveToNextVideo = useCallback(async () => {
    if (!queueManagerRef.current) return;
    
    await queueManagerRef.current.moveToNext();
    setRecommendedVideos(queueManagerRef.current.getVisibleQueue());
  }, []);

  const refreshFeed = useCallback(async () => {
    if (!queueManagerRef.current) return;
    
    console.log('[AppContext] Refreshing feed...');
    const newQueue = await queueManagerRef.current.refreshFeed();
    setRecommendedVideos(newQueue);
  }, []);

  const clearRecommendationData = useCallback(() => {
    if (interactionTrackerRef.current) {
      interactionTrackerRef.current.clear();
    }
    refreshFeed();
  }, [refreshFeed]);

  return useMemo(
    () => ({
      followedUsers,
      toggleFollow,
      isFollowing,
      videos: recommendedVideos,
      allVideos,
      addVideo,
      updateVideo,
      likeVideo,
      trackVideoView,
      moveToNextVideo,
      refreshFeed,
      clearRecommendationData,
      isRecommendationReady: isInitialized,
    }),
    [
      followedUsers,
      toggleFollow,
      isFollowing,
      recommendedVideos,
      allVideos,
      addVideo,
      updateVideo,
      likeVideo,
      trackVideoView,
      moveToNextVideo,
      refreshFeed,
      clearRecommendationData,
      isInitialized,
    ]
  );
});

export { useApp, AppContext };

// The context hook library returns [Context, hook], so the Context is the provider
export const AppProvider = AppContext.Provider;
