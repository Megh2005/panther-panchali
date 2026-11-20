import type { ObjectId } from "mongodb";

export type TimeOfDay = "Dawn" | "Afternoon" | "Twilight" | "Midnight";

export type Emotion =
  | "Monsoon Melancholy"
  | "Nostalgic Solitude"
  | "Vibrant Adda"
  | "Devotional Awe"
  | "Quiet Reverie";

export type CulturalCuriosity =
  | "Kumartuli Clay Sculptors"
  | "College Street Old Bookstalls"
  | "Bagbazar Ghat Ferry Bells"
  | "Midnight Chai at Shyambazar"
  | "Victoria Memorial Morning Mist"
  | "Durga Puja Pandal Procession";

export type TransformationType =
  | "gen_fill" // Cloudinary e_gen_fill (endless alleyway pan)
  | "gen_replace" // Cloudinary e_gen_replace (quiet street to puja festivity)
  | "celluloid" // Vintage Satyajit Ray film grain
  | "monsoon_overlay" // Raindrop & ripple overlay
  | "smart_crop"; // g_auto focus on human artisans

export interface TransformationAction {
  type: TransformationType;
  prompt?: string;
  appliedAt: Date;
  resultUrl: string;
}

export interface StoryBranch {
  id: string;
  label: string;
  promptSeed: string;
}

export interface Chapter {
  chapterIndex: number;
  chapterId: string;
  parentChapterId?: string; // Links branching tree
  emotion: Emotion;
  timeOfDay: TimeOfDay;
  location: CulturalCuriosity;
  storyProse: string;
  visualPrompt: string;
  originalImageUrl: string;
  currentImageUrl: string;
  transformations: TransformationAction[];
  branches: StoryBranch[];
  createdAt: Date;
}

export interface JourneyThread {
  _id?: ObjectId | string;
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  title: string;
  summary?: string;
  forkedFromThreadId?: string;
  forkCount: number;
  chapters: Chapter[];
  videoReelUrl?: string;
  pdfExportUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
