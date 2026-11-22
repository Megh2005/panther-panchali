export interface PredictedMood {
  moodName: string;
  moodParagraph: string;
  moodDescription?: string;
  whatToExpect?: string[];
  bestTimeToVisit: string;
}

export interface VideoVariant {
  variantId: "variant1" | "variant2";
  name: string;
  prompt: string;
  videoUrl?: string;
  jobId?: string;
  status: "idle" | "generating" | "completed" | "failed";
  error?: string;
  updatedAt?: string | Date;
}

export interface BengalPlaceGuide {
  isWestBengal: boolean;
  placeName: string;
  district: string;
  state: string;
  detailedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  plainTextSummary: string;
  scenicBeauty?: string | null;
  historicalSignificance?: string | null;
  predictedMood: PredictedMood;
  nonBengalNotice?: string;
  imageUrl?: string;
  imageAssetId?: string;
  publicId?: string;
  extractedColors?: string[];
}

export interface ExploredPlace {
  id: string;
  userId: string;
  userEmail: string;
  placeName: string;
  district: string;
  state: string;
  detailedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  imageAssetId?: string;
  publicId?: string;
  videos?: {
    variant1?: VideoVariant;
    variant2?: VideoVariant;
  };
  plainTextSummary: string;
  scenicBeauty?: string;
  historicalSignificance?: string;
  predictedMood?: PredictedMood;
  extractedColors?: string[];
  exploredAt: string | Date;
}
