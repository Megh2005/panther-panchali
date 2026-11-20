import type {
  CulturalCuriosity,
  Emotion,
  TimeOfDay,
  TransformationType,
} from "@/lib/models/journey";

export const EMOTIONS: readonly Emotion[] = [
  "Monsoon Melancholy",
  "Nostalgic Solitude",
  "Vibrant Adda",
  "Devotional Awe",
  "Quiet Reverie",
];

export const TIMES_OF_DAY: readonly TimeOfDay[] = [
  "Dawn",
  "Afternoon",
  "Twilight",
  "Midnight",
];

export const CULTURAL_CURIOSITIES: readonly CulturalCuriosity[] = [
  "Kumartuli Clay Sculptors",
  "College Street Old Bookstalls",
  "Bagbazar Ghat Ferry Bells",
  "Midnight Chai at Shyambazar",
  "Victoria Memorial Morning Mist",
  "Durga Puja Pandal Procession",
];

export const TRANSFORMATION_TYPES: readonly TransformationType[] = [
  "gen_fill",
  "gen_replace",
  "celluloid",
  "monsoon_overlay",
  "smart_crop",
];

export function isEmotion(value: unknown): value is Emotion {
  return typeof value === "string" && EMOTIONS.includes(value as Emotion);
}

export function isTimeOfDay(value: unknown): value is TimeOfDay {
  return typeof value === "string" && TIMES_OF_DAY.includes(value as TimeOfDay);
}

export function isCulturalCuriosity(
  value: unknown,
): value is CulturalCuriosity {
  return (
    typeof value === "string" &&
    CULTURAL_CURIOSITIES.includes(value as CulturalCuriosity)
  );
}

export function isTransformationType(
  value: unknown,
): value is TransformationType {
  return (
    typeof value === "string" &&
    TRANSFORMATION_TYPES.includes(value as TransformationType)
  );
}

export function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}
