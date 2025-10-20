// Global type declarations for better module resolution

declare module '@/*' {
  const content: any;
  export = content;
}

declare module '@/mocks/videos' {
  export interface Video {
    id: string;
    videoUrl: string;
    creator: {
      id: string;
      username: string;
      avatar: string;
      bio: string;
      followers: number;
      following: number;
      totalLikes: number;
    };
    description: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    music: {
      name: string;
      artist: string;
    };
    commentsList: Comment[];
  }

  export interface Comment {
    id: string;
    userId: string;
    username: string;
    avatar: string;
    text: string;
    likes: number;
    timestamp: Date;
  }

  export const mockVideos: Video[];
}

declare module '@/types/recommendation' {
  export type UserInteraction = {
    videoId: string;
    viewed: boolean;
    watchTime: number;
    completionRate: number;
    liked: boolean;
    commented: boolean;
    shared: boolean;
    timestamp: number;
  };

  export type VideoEngagementScore = {
    videoId: string;
    score: number;
    reasons: string[];
  };

  export type UserPreferences = {
    favoriteCreators: Set<string>;
    favoriteHashtags: Set<string>;
    categoryScores: Map<string, number>;
    avgWatchTime: number;
    totalVideosWatched: number;
  };

  export type RecommendationContext = {
    recentInteractions: UserInteraction[];
    preferences: UserPreferences;
    lastRefreshTime: number;
  };
}
