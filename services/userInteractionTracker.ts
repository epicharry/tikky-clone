import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInteraction, UserPreferences } from '../types/recommendation';

const STORAGE_KEY = '@user_interactions';
const PREFERENCES_KEY = '@user_preferences';
const MAX_INTERACTIONS = 200;

export class UserInteractionTracker {
  private interactions: UserInteraction[] = [];
  private preferences: UserPreferences = {
    favoriteCreators: new Set(),
    favoriteHashtags: new Set(),
    categoryScores: new Map(),
    avgWatchTime: 0,
    totalVideosWatched: 0,
  };

  async loadFromStorage(): Promise<void> {
    try {
      const [interactionsData, preferencesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(PREFERENCES_KEY),
      ]);

      if (interactionsData) {
        this.interactions = JSON.parse(interactionsData);
      }

      if (preferencesData) {
        const parsed = JSON.parse(preferencesData);
        this.preferences = {
          favoriteCreators: new Set(parsed.favoriteCreators || []),
          favoriteHashtags: new Set(parsed.favoriteHashtags || []),
          categoryScores: new Map(parsed.categoryScores || []),
          avgWatchTime: parsed.avgWatchTime || 0,
          totalVideosWatched: parsed.totalVideosWatched || 0,
        };
      }
    } catch (error) {
      console.error('Failed to load interactions from storage:', error);
    }
  }

  async saveToStorage(): Promise<void> {
    try {
      const preferencesObj = {
        favoriteCreators: Array.from(this.preferences.favoriteCreators),
        favoriteHashtags: Array.from(this.preferences.favoriteHashtags),
        categoryScores: Array.from(this.preferences.categoryScores.entries()),
        avgWatchTime: this.preferences.avgWatchTime,
        totalVideosWatched: this.preferences.totalVideosWatched,
      };

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.interactions)),
        AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferencesObj)),
      ]);
    } catch (error) {
      console.error('Failed to save interactions to storage:', error);
    }
  }

  trackVideoView(
    videoId: string,
    watchTime: number,
    videoDuration: number,
    liked: boolean,
    commented: boolean,
    shared: boolean,
    creatorId: string,
    hashtags: string[]
  ): void {
    const completionRate = Math.min((watchTime / videoDuration) * 100, 100);
    
    const interaction: UserInteraction = {
      videoId,
      viewed: true,
      watchTime,
      completionRate,
      liked,
      commented,
      shared,
      timestamp: Date.now(),
    };

    const existingIndex = this.interactions.findIndex(i => i.videoId === videoId);
    if (existingIndex !== -1) {
      this.interactions[existingIndex] = {
        ...this.interactions[existingIndex],
        watchTime: Math.max(this.interactions[existingIndex].watchTime, watchTime),
        completionRate: Math.max(this.interactions[existingIndex].completionRate, completionRate),
        liked: this.interactions[existingIndex].liked || liked,
        commented: this.interactions[existingIndex].commented || commented,
        shared: this.interactions[existingIndex].shared || shared,
        timestamp: Date.now(),
      };
    } else {
      this.interactions.unshift(interaction);
    }

    if (this.interactions.length > MAX_INTERACTIONS) {
      this.interactions = this.interactions.slice(0, MAX_INTERACTIONS);
    }

    this.updatePreferences(interaction, creatorId, hashtags);
    this.saveToStorage();
  }

  private updatePreferences(
    interaction: UserInteraction,
    creatorId: string,
    hashtags: string[]
  ): void {
    if (interaction.liked || interaction.completionRate > 75) {
      this.preferences.favoriteCreators.add(creatorId);
      
      hashtags.forEach(tag => {
        this.preferences.favoriteHashtags.add(tag);
      });
    }

    const totalWatchTime = this.interactions.reduce((sum, i) => sum + i.watchTime, 0);
    const watchedVideos = this.interactions.filter(i => i.viewed).length;
    this.preferences.avgWatchTime = watchedVideos > 0 ? totalWatchTime / watchedVideos : 0;
    this.preferences.totalVideosWatched = watchedVideos;
  }

  getInteractions(): UserInteraction[] {
    return [...this.interactions];
  }

  getPreferences(): UserPreferences {
    return {
      ...this.preferences,
      favoriteCreators: new Set(this.preferences.favoriteCreators),
      favoriteHashtags: new Set(this.preferences.favoriteHashtags),
      categoryScores: new Map(this.preferences.categoryScores),
    };
  }

  hasSeenVideo(videoId: string): boolean {
    return this.interactions.some(i => i.videoId === videoId);
  }

  getVideoInteraction(videoId: string): UserInteraction | undefined {
    return this.interactions.find(i => i.videoId === videoId);
  }

  clear(): void {
    this.interactions = [];
    this.preferences = {
      favoriteCreators: new Set(),
      favoriteHashtags: new Set(),
      categoryScores: new Map(),
      avgWatchTime: 0,
      totalVideosWatched: 0,
    };
    AsyncStorage.multiRemove([STORAGE_KEY, PREFERENCES_KEY]);
  }
}
