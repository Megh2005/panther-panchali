export interface PredictedMood {
  moodName: string;
  moodDescription: string;
  whatToExpect: string[];
  bestTimeToVisit: string;
}

export interface BengalPlaceAnalysis {
  isWestBengal: boolean;
  placeName: string;
  bengaliName?: string;
  district: string;
  state: string;
  detailedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  plainTextSummary: string;
  scenicBeauty: string;
  historicalSignificance: string;
  predictedMood: PredictedMood;
  nonBengalNotice?: string;
}

export interface PostComment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string | Date;
}

export interface BengalPost {
  _id?: string;
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  imageUrl?: string;
  originalImageUrl?: string;
  revampedImageUrl?: string;
  placeId: string;
  placeName: string;
  bengaliName?: string;
  district: string;
  state: string;
  detailedAddress?: string;
  placeCoords: {
    lat: number;
    lng: number;
  };
  timeOfDay?: string;
  yearSpan?: string;
  vibe?: string;
  caption: string;
  plainTextSummary?: string;
  scenicBeauty?: string;
  historicalSignificance?: string;
  predictedMood?: PredictedMood;
  hashtags: string[];
  extractedColors: string[];
  likesCount: number;
  likedBy?: string[];
  comments?: PostComment[];
  sharesCount?: number;
  createdAt: Date;
}

export type KolkataPost = BengalPost;
