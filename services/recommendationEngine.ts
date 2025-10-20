import { Video } from '../mocks/videos';
import { UserInteraction, VideoEngagementScore, UserPreferences } from '../types/recommendation';

export class RecommendationEngine {
  private extractHashtags(description: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = description.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  }

  private calculateEngagementRate(video: Video): number {
    const totalEngagements = video.likes + video.comments + video.shares;
    const views = Math.max(video.likes * 10, 1000);
    return (totalEngagements / views) * 100;
  }

  private calculateRecencyScore(video: Video): number {
    const videoIdNum = parseInt(video.id.replace(/\D/g, ''), 10) || 0;
    const maxId = 1000;
    return Math.min((videoIdNum / maxId) * 100, 100);
  }

  private calculateCreatorScore(video: Video, preferences: UserPreferences): number {
    let score = 0;

    if (preferences.favoriteCreators.has(video.creator.id)) {
      score += 50;
    }

    const followerTier = Math.min(video.creator.followers / 1000000, 5);
    score += followerTier * 5;

    return Math.min(score, 100);
  }

  private calculateContentScore(
    video: Video,
    preferences: UserPreferences,
    userInteractions: UserInteraction[]
  ): number {
    let score = 0;
    const hashtags = this.extractHashtags(video.description);

    const matchingHashtags = hashtags.filter(tag => 
      preferences.favoriteHashtags.has(tag)
    ).length;
    
    score += matchingHashtags * 15;

    const similarVideos = userInteractions.filter(interaction => {
      const interactionVideo = interaction.videoId;
      return (
        interaction.completionRate > 75 &&
        interactionVideo !== video.id
      );
    });

    if (similarVideos.length > 0) {
      score += Math.min(similarVideos.length * 5, 30);
    }

    return Math.min(score, 100);
  }

  private calculateViralityScore(video: Video): number {
    const engagementRate = this.calculateEngagementRate(video);
    const likesScore = Math.min((video.likes / 100000) * 20, 40);
    const commentsScore = Math.min((video.comments / 1000) * 20, 30);
    const sharesScore = Math.min((video.shares / 500) * 30, 30);

    return likesScore + commentsScore + sharesScore + engagementRate;
  }

  private calculateDiversityPenalty(
    video: Video,
    recentVideos: Video[]
  ): number {
    if (recentVideos.length === 0) return 0;

    const sameCreatorCount = recentVideos.filter(
      v => v.creator.id === video.creator.id
    ).length;

    if (sameCreatorCount >= 2) {
      return -40;
    }

    const videoHashtags = this.extractHashtags(video.description);
    const recentHashtags = recentVideos.flatMap(v => 
      this.extractHashtags(v.description)
    );

    const overlapCount = videoHashtags.filter(tag =>
      recentHashtags.includes(tag)
    ).length;

    if (overlapCount > 2) {
      return -20;
    }

    return 0;
  }

  calculateVideoScore(
    video: Video,
    preferences: UserPreferences,
    userInteractions: UserInteraction[],
    recentVideos: Video[]
  ): VideoEngagementScore {
    const reasons: string[] = [];
    let totalScore = 0;

    const engagementRate = this.calculateEngagementRate(video);
    const engagementScore = Math.min(engagementRate * 2, 40);
    totalScore += engagementScore;
    if (engagementScore > 20) {
      reasons.push(`High engagement (${engagementRate.toFixed(1)}%)`);
    }

    const viralityScore = this.calculateViralityScore(video);
    totalScore += viralityScore * 0.3;
    if (viralityScore > 50) {
      reasons.push('Trending content');
    }

    const creatorScore = this.calculateCreatorScore(video, preferences);
    totalScore += creatorScore * 0.5;
    if (preferences.favoriteCreators.has(video.creator.id)) {
      reasons.push('From creator you like');
    }

    const contentScore = this.calculateContentScore(video, preferences, userInteractions);
    totalScore += contentScore * 0.6;
    if (contentScore > 40) {
      reasons.push('Matches your interests');
    }

    const recencyScore = this.calculateRecencyScore(video);
    totalScore += recencyScore * 0.2;

    const diversityPenalty = this.calculateDiversityPenalty(video, recentVideos);
    totalScore += diversityPenalty;
    if (diversityPenalty < -30) {
      reasons.push('Diversity adjustment');
    }

    const interaction = userInteractions.find(i => i.videoId === video.id);
    if (interaction) {
      if (interaction.completionRate < 50) {
        totalScore -= 50;
        reasons.push('Previously skipped');
      } else if (interaction.liked) {
        totalScore += 30;
        reasons.push('You liked this');
      }
    }

    return {
      videoId: video.id,
      score: Math.max(totalScore, 0),
      reasons: reasons.length > 0 ? reasons : ['Discover new content'],
    };
  }

  recommendVideos(
    allVideos: Video[],
    preferences: UserPreferences,
    userInteractions: UserInteraction[],
    recentlyShownVideos: Video[],
    count: number = 10
  ): Video[] {
    console.log('[Recommendation Engine] Generating recommendations...');
    console.log('[Recommendation Engine] Total videos:', allVideos.length);
    console.log('[Recommendation Engine] User interactions:', userInteractions.length);
    console.log('[Recommendation Engine] Favorite creators:', preferences.favoriteCreators.size);
    console.log('[Recommendation Engine] Favorite hashtags:', preferences.favoriteHashtags.size);

    const seenVideoIds = new Set(userInteractions.map(i => i.videoId));
    const recentVideoIds = new Set(recentlyShownVideos.slice(-5).map(v => v.id));

    let candidateVideos = allVideos.filter(video => !recentVideoIds.has(video.id));

    const unseenVideos = candidateVideos.filter(v => !seenVideoIds.has(v.id));
    const seenVideos = candidateVideos.filter(v => seenVideoIds.has(v.id));

    const scoredUnseen = unseenVideos.map(video => ({
      video,
      scoreData: this.calculateVideoScore(video, preferences, userInteractions, recentlyShownVideos),
    }));

    const scoredSeen = seenVideos.map(video => ({
      video,
      scoreData: this.calculateVideoScore(video, preferences, userInteractions, recentlyShownVideos),
    }));

    scoredUnseen.sort((a, b) => b.scoreData.score - a.scoreData.score);
    scoredSeen.sort((a, b) => b.scoreData.score - a.scoreData.score);

    const unseenCount = Math.ceil(count * 0.8);
    const seenCount = count - unseenCount;

    const selectedUnseen = scoredUnseen.slice(0, unseenCount);
    const selectedSeen = scoredSeen.slice(0, seenCount);

    const finalSelection = [...selectedUnseen, ...selectedSeen]
      .sort((a, b) => b.scoreData.score - a.scoreData.score)
      .slice(0, count);

    finalSelection.forEach(({ video, scoreData }) => {
      console.log(
        `[Recommendation Engine] ${video.creator.username} - Score: ${scoreData.score.toFixed(1)} - ${scoreData.reasons.join(', ')}`
      );
    });

    const result = finalSelection.map(item => item.video);
    
    if (result.length < count && allVideos.length > 0) {
      const remaining = count - result.length;
      const fallbackVideos = allVideos
        .filter(v => !result.some(r => r.id === v.id))
        .slice(0, remaining);
      result.push(...fallbackVideos);
    }

    return result;
  }

  generateInitialFeed(allVideos: Video[], count: number = 10): Video[] {
    console.log('[Recommendation Engine] Generating initial feed for new user...');
    
    const scoredVideos = allVideos.map(video => ({
      video,
      score: this.calculateViralityScore(video) + this.calculateEngagementRate(video) * 2,
    }));

    scoredVideos.sort((a, b) => b.score - a.score);

    const diverseFeed: Video[] = [];
    const usedCreators = new Set<string>();
    
    for (const { video } of scoredVideos) {
      if (diverseFeed.length >= count) break;
      
      if (!usedCreators.has(video.creator.id) || diverseFeed.length > count / 2) {
        diverseFeed.push(video);
        usedCreators.add(video.creator.id);
      }
    }

    if (diverseFeed.length < count) {
      const remaining = scoredVideos
        .map(s => s.video)
        .filter(v => !diverseFeed.includes(v))
        .slice(0, count - diverseFeed.length);
      diverseFeed.push(...remaining);
    }

    console.log('[Recommendation Engine] Initial feed generated:', diverseFeed.length, 'videos');
    return diverseFeed;
  }
}
