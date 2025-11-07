const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export interface VideoLike {
  id: string;
  user_id: string;
  video_id: string;
  video_source: string;
  video_url?: string;
  thumbnail_url?: string;
  video_data?: any;
  created_at: string;
}

export async function likeVideo(
  userId: string,
  videoId: string,
  videoSource: string,
  videoData?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = {
      user_id: userId,
      video_id: videoId,
      video_source: videoSource,
    };

    if (videoData) {
      payload.video_url = videoData.videoUrl;
      payload.thumbnail_url = videoData.thumbnail_url || videoData.videoUrl;
      payload.video_data = videoData;
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/video_likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to like video' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error liking video:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function unlikeVideo(
  userId: string,
  videoId: string,
  videoSource: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/video_likes?user_id=eq.${userId}&video_id=eq.${encodeURIComponent(videoId)}&video_source=eq.${encodeURIComponent(videoSource)}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to unlike video' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error unliking video:', error);
    return { success: false, error: 'Network error' };
  }
}

export async function checkIfVideoIsLiked(
  userId: string,
  videoId: string,
  videoSource: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/video_likes?user_id=eq.${userId}&video_id=eq.${encodeURIComponent(videoId)}&video_source=eq.${encodeURIComponent(videoSource)}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.length > 0;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
}

export async function getUserLikedVideos(
  userId: string
): Promise<Array<VideoLike>> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/video_likes?user_id=eq.${userId}&select=*&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching liked videos:', error);
    return [];
  }
}

export async function getVideoLikeCount(
  videoId: string,
  videoSource: string
): Promise<number> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/video_likes?video_id=eq.${encodeURIComponent(videoId)}&video_source=eq.${encodeURIComponent(videoSource)}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.length;
  } catch (error) {
    console.error('Error fetching like count:', error);
    return 0;
  }
}
