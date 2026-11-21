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
  plainTextSummary: string; // Exactly ~300 words, strictly pure plain text, ZERO markdown
  scenicBeauty: string; // Rich Markdown detailing landscape, nature, flora, water bodies
  historicalSignificance: string; // Rich Markdown detailing architectural heritage, dynasties, lore
  predictedMood: PredictedMood;
  nonBengalNotice?: string;
}
