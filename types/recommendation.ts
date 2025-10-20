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
