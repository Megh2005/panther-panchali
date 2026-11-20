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
  tagline: string;
  description: string;
  lat: number;
  lng: number;
  area: string;
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
  likedBy?: string[];
  comments?: PostComment[];
  sharesCount?: number;
  createdAt: Date;
}
