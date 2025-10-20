import { Video } from '../mocks/videos';
import { RecommendationEngine } from './recommendationEngine';
import { UserInteractionTracker } from './userInteractionTracker';

export class VideoQueueManager {
  private queue: Video[] = [];
  private currentIndex: number = 0;
  private allVideos: Video[] = [];
  private recommendationEngine: RecommendationEngine;
  private interactionTracker: UserInteractionTracker;
  private prefetchThreshold: number = 3;
  private batchSize: number = 10;
  private isRefreshing: boolean = false;

  constructor(
    allVideos: Video[],
    recommendationEngine: RecommendationEngine,
    interactionTracker: UserInteractionTracker
  ) {
    this.allVideos = allVideos;
    this.recommendationEngine = recommendationEngine;
    this.interactionTracker = interactionTracker;
  }

  async initialize(): Promise<Video[]> {
    console.log('[Queue Manager] Initializing video queue...');
    
    const preferences = this.interactionTracker.getPreferences();
    const interactions = this.interactionTracker.getInteractions();

    if (preferences.totalVideosWatched === 0) {
      console.log('[Queue Manager] New user - generating initial feed');
      this.queue = this.recommendationEngine.generateInitialFeed(
        this.allVideos,
        this.batchSize * 2
      );
    } else {
      console.log('[Queue Manager] Returning user - generating personalized feed');
      this.queue = this.recommendationEngine.recommendVideos(
        this.allVideos,
        preferences,
        interactions,
        [],
        this.batchSize * 2
      );
    }

    this.currentIndex = 0;
    console.log('[Queue Manager] Queue initialized with', this.queue.length, 'videos');
    return this.getVisibleQueue();
  }

  getCurrentVideo(): Video | undefined {
    return this.queue[this.currentIndex];
  }

  getVisibleQueue(): Video[] {
    return this.queue.slice(0, this.currentIndex + 5);
  }

  async moveToNext(): Promise<void> {
    this.currentIndex++;
    console.log(`[Queue Manager] Moved to video ${this.currentIndex + 1}/${this.queue.length}`);

    const remainingVideos = this.queue.length - this.currentIndex;
    
    if (remainingVideos <= this.prefetchThreshold && !this.isRefreshing) {
      console.log('[Queue Manager] Prefetching more videos...');
      await this.prefetchMoreVideos();
    }
  }

  async prefetchMoreVideos(): Promise<void> {
    if (this.isRefreshing) {
      console.log('[Queue Manager] Already refreshing, skipping...');
      return;
    }

    this.isRefreshing = true;

    try {
      const preferences = this.interactionTracker.getPreferences();
      const interactions = this.interactionTracker.getInteractions();
      const recentVideos = this.queue.slice(Math.max(0, this.currentIndex - 5), this.currentIndex);

      const newVideos = this.recommendationEngine.recommendVideos(
        this.allVideos,
        preferences,
        interactions,
        recentVideos,
        this.batchSize
      );

      const uniqueNewVideos = newVideos.filter(
        newVideo => !this.queue.some(queueVideo => queueVideo.id === newVideo.id)
      );

      if (uniqueNewVideos.length > 0) {
        this.queue.push(...uniqueNewVideos);
        console.log('[Queue Manager] Added', uniqueNewVideos.length, 'new videos to queue');
      } else {
        console.log('[Queue Manager] No new unique videos found, adding fallback videos');
        const fallbackVideos = this.allVideos
          .filter(video => !this.queue.some(qv => qv.id === video.id))
          .slice(0, this.batchSize);
        
        this.queue.push(...fallbackVideos);
      }
    } catch (error) {
      console.error('[Queue Manager] Error prefetching videos:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  async refreshFeed(): Promise<Video[]> {
    console.log('[Queue Manager] Refreshing feed...');
    this.currentIndex = 0;
    this.queue = [];
    return this.initialize();
  }

  updateAllVideos(newVideos: Video[]): void {
    console.log('[Queue Manager] Updating video library');
    this.allVideos = newVideos;
  }

  addNewVideo(video: Video): void {
    console.log('[Queue Manager] Adding new video to top of queue');
    this.queue.unshift(video);
    this.currentIndex++;
    this.allVideos.unshift(video);
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  setCurrentIndex(index: number): void {
    if (index >= 0 && index < this.queue.length) {
      this.currentIndex = index;
      console.log(`[Queue Manager] Index set to ${index}`);
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getQueue(): Video[] {
    return [...this.queue];
  }
}
