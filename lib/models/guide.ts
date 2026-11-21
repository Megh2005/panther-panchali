export interface PredictedMood {
  moodName: string;
  moodDescription: string;
  whatToExpect: string[];
  bestTimeToVisit: string;
}

export interface BengalPlaceGuide {
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
  imageUrl?: string;
  extractedColors?: string[];
}
