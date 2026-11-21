export interface PredictedMood {
  moodName: string;
  moodParagraph: string;
  moodDescription?: string;
  whatToExpect?: string[];
  bestTimeToVisit: string;
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
  plainTextSummary: string;
  scenicBeauty?: string;
  historicalSignificance?: string;
  predictedMood?: PredictedMood;
  extractedColors: string[];
  exploredAt: string | Date;
}
