export type TimeOfDay =
  | "Dawn"
  | "Morning"
  | "Afternoon"
  | "Twilight"
  | "Evening"
  | "Midnight";

export type YearSpan =
  | "Poila Baisakh"
  | "Pooja"
  | "Deepavali"
  | "Winter Season"
  | "Monsoon Rain"
  | "Spring Breeze";

export type PostVibe =
  | "Aesthetic"
  | "Happy"
  | "Sad"
  | "Melancholy"
  | "Dazzling"
  | "Party";

export interface KolkataPlace {
  id: string;
  name: string;
  bengaliName: string;
  tagline: string;
  description: string;
  lat: number;
  lng: number;
  area: string;
}

export interface KolkataPost {
  _id?: string;
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  originalImageUrl: string;
  revampedImageUrl: string;
  placeId: string;
  placeName: string;
  placeCoords: {
    lat: number;
    lng: number;
  };
  timeOfDay: TimeOfDay;
  yearSpan: YearSpan;
  vibe: PostVibe;
  caption: string;
  hashtags: string[];
  extractedColors: string[];
  likesCount: number;
  createdAt: Date;
}
