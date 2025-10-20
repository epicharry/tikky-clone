export type Comment = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  likes: number;
  timestamp: Date;
};

export type Video = {
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
};

export const mockVideos: Video[] = [
  {
    id: '1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    creator: {
      id: 'u1',
      username: 'naturevibes',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Nature lover 🌿 | Travel photographer 📸',
      followers: 1245000,
      following: 342,
      totalLikes: 5600000,
    },
    description: 'Beautiful sunset timelapse 🌅 #nature #sunset #peaceful',
    likes: 124500,
    comments: 892,
    shares: 431,
    isLiked: false,
    music: {
      name: 'Peaceful Moments',
      artist: 'Nature Sounds',
    },
    commentsList: [
      {
        id: 'c1',
        userId: 'u10',
        username: 'viewer123',
        avatar: 'https://i.pravatar.cc/150?img=10',
        text: 'This is absolutely stunning! 😍',
        likes: 234,
        timestamp: new Date('2024-01-15T10:30:00'),
      },
      {
        id: 'c2',
        userId: 'u11',
        username: 'naturefan',
        avatar: 'https://i.pravatar.cc/150?img=11',
        text: 'Where is this place?',
        likes: 45,
        timestamp: new Date('2024-01-15T11:20:00'),
      },
    ],
  },
  {
    id: '2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    creator: {
      id: 'u2',
      username: 'artcreator',
      avatar: 'https://i.pravatar.cc/150?img=2',
      bio: 'Digital artist | Animation lover 🎨',
      followers: 892000,
      following: 145,
      totalLikes: 3400000,
    },
    description: 'Creating magic ✨ #art #creative #animation',
    likes: 89300,
    comments: 567,
    shares: 234,
    isLiked: false,
    music: {
      name: 'Creative Flow',
      artist: 'Art Beats',
    },
    commentsList: [
      {
        id: 'c3',
        userId: 'u12',
        username: 'artenthusiast',
        avatar: 'https://i.pravatar.cc/150?img=12',
        text: 'Your art is incredible!',
        likes: 156,
        timestamp: new Date('2024-01-16T09:15:00'),
      },
    ],
  },
  {
    id: '3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    creator: {
      id: 'u3',
      username: 'techreview',
      avatar: 'https://i.pravatar.cc/150?img=3',
      bio: 'Tech reviewer | Gadget geek 📱',
      followers: 2034000,
      following: 89,
      totalLikes: 8900000,
    },
    description: 'Mind-blowing tech! 🚀 #technology #innovation #future',
    likes: 203400,
    comments: 1234,
    shares: 892,
    isLiked: false,
    music: {
      name: 'Future Vibes',
      artist: 'Tech Sounds',
    },
    commentsList: [],
  },
  {
    id: '4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    creator: {
      id: 'u4',
      username: 'travelmore',
      avatar: 'https://i.pravatar.cc/150?img=4',
      bio: 'World traveler 🌎 | Adventure seeker',
      followers: 1567000,
      following: 234,
      totalLikes: 6700000,
    },
    description: 'Dream destinations 🌍 #travel #adventure #explore',
    likes: 156700,
    comments: 743,
    shares: 521,
    isLiked: false,
    music: {
      name: 'Wanderlust',
      artist: 'Travel Tunes',
    },
    commentsList: [],
  },
  {
    id: '5',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    creator: {
      id: 'u5',
      username: 'funmoments',
      avatar: 'https://i.pravatar.cc/150?img=5',
      bio: 'Making you laugh daily 😂',
      followers: 3421000,
      following: 567,
      totalLikes: 12300000,
    },
    description: 'This made my day 😂 #funny #comedy #viral',
    likes: 342100,
    comments: 2134,
    shares: 1456,
    isLiked: false,
    music: {
      name: 'Comedy Gold',
      artist: 'Funny Sounds',
    },
    commentsList: [],
  },
  {
    id: '6',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    creator: {
      id: 'u6',
      username: 'carlifestyle',
      avatar: 'https://i.pravatar.cc/150?img=6',
      bio: 'Car enthusiast 🚗 | Luxury lifestyle',
      followers: 982000,
      following: 123,
      totalLikes: 4500000,
    },
    description: 'Speed and style 🏎️ #cars #luxury #lifestyle',
    likes: 98200,
    comments: 432,
    shares: 267,
    isLiked: false,
    music: {
      name: 'Engine Roar',
      artist: 'Car Sounds',
    },
    commentsList: [],
  },
  {
    id: '7',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    creator: {
      id: 'u7',
      username: 'foodielove',
      avatar: 'https://i.pravatar.cc/150?img=7',
      bio: 'Food blogger 🍕 | Recipe creator',
      followers: 1876000,
      following: 456,
      totalLikes: 7800000,
    },
    description: 'Pure satisfaction 🍫 #food #yummy #satisfying',
    likes: 187600,
    comments: 891,
    shares: 634,
    isLiked: false,
    music: {
      name: 'Tasty Beats',
      artist: 'Food Music',
    },
    commentsList: [],
  },
  {
    id: '8',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    creator: {
      id: 'u8',
      username: 'cinematic',
      avatar: 'https://i.pravatar.cc/150?img=8',
      bio: 'Filmmaker 🎬 | Visual storyteller',
      followers: 765000,
      following: 234,
      totalLikes: 3200000,
    },
    description: 'Epic storytelling 🎬 #film #cinematic #artistic',
    likes: 76500,
    comments: 456,
    shares: 289,
    isLiked: false,
    music: {
      name: 'Cinematic Score',
      artist: 'Film Music',
    },
    commentsList: [],
  },
];
