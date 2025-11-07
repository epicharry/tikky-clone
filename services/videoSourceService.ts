const XANIMU_BASE_URL = 'https://harrypersonal.haryvibes.workers.dev/xanimu';

export interface VideoSearchResult {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
}

export interface VideoDetails {
  id: string;
  title: string;
  thumbnail: string;
  video_url: string;
}

export interface SearchResponse {
  current_page: number;
  results: VideoSearchResult[];
}

export type VideoSource = 'xanimu';

export const VIDEO_SOURCES: { id: VideoSource; name: string }[] = [
  { id: 'xanimu', name: 'Xanimu' },
];

export async function searchVideos(
  source: VideoSource,
  query: string,
  page: number = 1
): Promise<SearchResponse> {
  try {
    if (source === 'xanimu') {
      const response = await fetch(
        `${XANIMU_BASE_URL}?action=search&q=${encodeURIComponent(query)}&page=${page}`
      );

      if (!response.ok) {
        throw new Error('Failed to search videos');
      }

      const data = await response.json();
      return data;
    }

    throw new Error('Unsupported video source');
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

export async function getVideoDetails(
  source: VideoSource,
  videoId: string
): Promise<VideoDetails> {
  try {
    if (source === 'xanimu') {
      const response = await fetch(
        `${XANIMU_BASE_URL}?action=video&id=${encodeURIComponent(videoId)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch video details');
      }

      const data = await response.json();
      return data;
    }

    throw new Error('Unsupported video source');
  } catch (error) {
    console.error('Video details error:', error);
    throw error;
  }
}
