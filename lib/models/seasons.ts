export interface BengalSeason {
  id: "original" | "grishma" | "barsha" | "sharat" | "hemanta" | "sheet" | "basanta";
  name: string;
  seasonTag: string;
  period: string;
  poeticAtmosphere: string;
  description: string;
  paletteColors: string[];
  transformation: string;
  cssFilterFallback: string;
}

export const BENGAL_SEASONS: BengalSeason[] = [
  {
    id: "original",
    name: "Original Capture",
    seasonTag: "Original",
    period: "Photographed Moment",
    poeticAtmosphere: "Authentic Camera Perception",
    description: "The raw landmark photograph as originally captured by the traveler.",
    paletteColors: ["#B5532F", "#EDE4D3", "#1B1A17", "#E3C27A", "#6B6458"],
    transformation: "",
    cssFilterFallback: "none",
  },
  {
    id: "grishma",
    name: "Summer",
    seasonTag: "Summer",
    period: "April to June",
    poeticAtmosphere: "Blazing Golden Light & Parched Red Earth",
    description: "Sun-drenched warmth, dry golden midday glow, and dramatic heat shimmers over the laterite soil.",
    paletteColors: ["#D97706", "#B45309", "#78350F", "#FDE68A", "#92400E"],
    transformation: "e_gen_recolor:prompt_(vegetation;trees;grass);to-color_goldenrod;multiple_true/e_warmth:35/e_brightness:8",
    cssFilterFallback: "sepia(0.2) saturate(1.25) brightness(1.06) hue-rotate(-8deg)",
  },
  {
    id: "barsha",
    name: "Monsoon",
    seasonTag: "Monsoon",
    period: "June to August",
    poeticAtmosphere: "Rain-Washed Emerald & Overcast Slate Skies",
    description: "Deep rain-soaked lush greenery, dark monsoon cloud reflections, and swollen, shimmering rivers.",
    paletteColors: ["#15803D", "#166534", "#1E293B", "#334155", "#064E3B"],
    transformation: "e_gen_recolor:prompt_(vegetation;trees;grass);to-color_forestgreen;multiple_true/e_tint:equalize:35:darkslategray/e_contrast:22",
    cssFilterFallback: "contrast(1.18) saturate(1.35) brightness(0.94) hue-rotate(6deg)",
  },
  {
    id: "sharat",
    name: "Early Autumn",
    seasonTag: "Early Autumn",
    period: "September to October",
    poeticAtmosphere: "Cerulean Skies & Blooming White Reed Fields",
    description: "Sailing white autumn clouds, blossoming white reeds along riverbeds, and golden festive radiance.",
    paletteColors: ["#0284C7", "#38BDF8", "#F8FAFC", "#F59E0B", "#FDE047"],
    transformation: "e_gen_recolor:prompt_(reeds;flowers;grass);to-color_white;multiple_true/e_gen_recolor:prompt_sky;to-color_deepskyblue/e_vibrance:25",
    cssFilterFallback: "saturate(1.28) contrast(1.08) brightness(1.04) hue-rotate(12deg)",
  },
  {
    id: "hemanta",
    name: "Late Autumn",
    seasonTag: "Late Autumn",
    period: "October to December",
    poeticAtmosphere: "Golden Ripe Paddy & Dewy Twilight Calm",
    description: "Endless golden fields of ripe paddy, soft amber sunsets, and peaceful countryside calm.",
    paletteColors: ["#EAB308", "#CA8A04", "#854D0E", "#FEF08A", "#713F12"],
    transformation: "e_gen_recolor:prompt_(fields;grass;crops);to-color_gold;multiple_true/e_warmth:25/e_saturation:18",
    cssFilterFallback: "sepia(0.25) saturate(1.3) brightness(1.02) hue-rotate(-15deg)",
  },
  {
    id: "sheet",
    name: "Winter",
    seasonTag: "Winter",
    period: "December to February",
    poeticAtmosphere: "Morning Mist, Cool Haze & Pale Sunlight",
    description: "Dew-kissed winter grass, soft morning fog drifting across ancient walls, and gentle, quiet air.",
    paletteColors: ["#64748B", "#94A3B8", "#E2E8F0", "#334155", "#CBD5E1"],
    transformation: "e_gen_recolor:prompt_(sky;atmosphere);to-color_aliceblue/e_tint:equalize:45:lightcyan/e_contrast:-8/e_brightness:6",
    cssFilterFallback: "saturate(0.72) contrast(0.92) brightness(1.08) blur(0.2px)",
  },
  {
    id: "basanta",
    name: "Spring",
    seasonTag: "Spring",
    period: "February to April",
    poeticAtmosphere: "Fiery Red Blossoms & Joyous Renewal",
    description: "Vibrant scarlet flame-of-the-forest blossoms, tender green shoots, and cheerful celebration.",
    paletteColors: ["#EA580C", "#C2410C", "#9A3412", "#FED7AA", "#16A34A"],
    transformation: "e_gen_recolor:prompt_(flowers;leaves;trees);to-color_orangered;multiple_true/e_saturation:30/e_warmth:16",
    cssFilterFallback: "saturate(1.45) contrast(1.1) brightness(1.03) hue-rotate(-4deg)",
  },
];

export function buildSeasonalCloudinaryUrl(
  baseCloudinaryUrl: string,
  transformation: string,
): string {
  if (!baseCloudinaryUrl || !transformation) return baseCloudinaryUrl;
  if (!baseCloudinaryUrl.includes("/image/upload/")) return baseCloudinaryUrl;

  return baseCloudinaryUrl.replace(
    "/image/upload/",
    `/image/upload/${transformation}/`,
  );
}
