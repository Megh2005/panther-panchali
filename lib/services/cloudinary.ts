import * as cloudinaryPackage from "cloudinary";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  colors: string[];
}

export interface BengalSeason {
  id: "original" | "grishma" | "barsha" | "sharat" | "hemanta" | "sheet" | "basanta";
  name: string;
  bengaliName: string;
  bengaliScript: string;
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
    bengaliName: "আসল দৃশ্য",
    bengaliScript: "আসল",
    period: "Photographed Moment",
    poeticAtmosphere: "Authentic Camera Perception",
    description: "The raw landmark photograph as originally captured by the traveler.",
    paletteColors: ["#B5532F", "#EDE4D3", "#1B1A17", "#E3C27A", "#6B6458"],
    transformation: "",
    cssFilterFallback: "none",
  },
  {
    id: "grishma",
    name: "Grishma · Summer",
    bengaliName: "গ্রীষ্মকাল",
    bengaliScript: "গ্রীষ্ম",
    period: "Baisakh – Jyeshtha (April to June)",
    poeticAtmosphere: "Blazing Golden Light & Parched Red Earth",
    description: "Sun-drenched warmth, dry golden midday glow, and dramatic heat shimmers over the laterite soil.",
    paletteColors: ["#D97706", "#B45309", "#78350F", "#FDE68A", "#92400E"],
    transformation: "e_gen_recolor:prompt_(vegetation;trees;grass);to-color_goldenrod;multiple_true/e_warmth:35/e_brightness:8",
    cssFilterFallback: "sepia(0.2) saturate(1.25) brightness(1.06) hue-rotate(-8deg)",
  },
  {
    id: "barsha",
    name: "Barsha · Monsoon",
    bengaliName: "বর্ষাকাল",
    bengaliScript: "বর্ষা",
    period: "Ashadh – Shravan (June to August)",
    poeticAtmosphere: "Rain-Washed Emerald & Overcast Slate Skies",
    description: "Deep rain-soaked lush greenery, dark monsoon cloud reflections, and swollen, shimmering rivers.",
    paletteColors: ["#15803D", "#166534", "#1E293B", "#334155", "#064E3B"],
    transformation: "e_gen_recolor:prompt_(vegetation;trees;grass);to-color_forestgreen;multiple_true/e_tint:equalize:35:darkslategray/e_contrast:22",
    cssFilterFallback: "contrast(1.18) saturate(1.35) brightness(0.94) hue-rotate(6deg)",
  },
  {
    id: "sharat",
    name: "Sharat · Early Autumn",
    bengaliName: "শরৎকাল",
    bengaliScript: "শরৎ",
    period: "Bhadra – Ashwin (September to October · Durga Puja)",
    poeticAtmosphere: "Cerulean Skies & Blooming White Kash Reeds",
    description: "Sailing white autumn clouds, blossoming kash flowers along riverbeds, and golden festive radiance.",
    paletteColors: ["#0284C7", "#38BDF8", "#F8FAFC", "#F59E0B", "#FDE047"],
    transformation: "e_gen_recolor:prompt_(reeds;flowers;grass);to-color_white;multiple_true/e_gen_recolor:prompt_sky;to-color_deepskyblue/e_vibrance:25",
    cssFilterFallback: "saturate(1.28) contrast(1.08) brightness(1.04) hue-rotate(12deg)",
  },
  {
    id: "hemanta",
    name: "Hemanta · Late Autumn",
    bengaliName: "হেমন্তকাল",
    bengaliScript: "হেমন্ত",
    period: "Kartik – Agrahayana (October to December · Harvest)",
    poeticAtmosphere: "Golden Ripe Paddy & Dewy Twilight Calm",
    description: "Endless golden fields of ripe dhan, soft amber sunsets, and peaceful countryside calm.",
    paletteColors: ["#EAB308", "#CA8A04", "#854D0E", "#FEF08A", "#713F12"],
    transformation: "e_gen_recolor:prompt_(fields;grass;crops);to-color_gold;multiple_true/e_warmth:25/e_saturation:18",
    cssFilterFallback: "sepia(0.25) saturate(1.3) brightness(1.02) hue-rotate(-15deg)",
  },
  {
    id: "sheet",
    name: "Sheet · Winter",
    bengaliName: "শীতকাল",
    bengaliScript: "শীত",
    period: "Poush – Magha (December to February)",
    poeticAtmosphere: "Morning Mist, Cool Haze & Pale Sunlight",
    description: "Dew-kissed winter grass, soft morning fog drifting across ancient walls, and gentle, quiet air.",
    paletteColors: ["#64748B", "#94A3B8", "#E2E8F0", "#334155", "#CBD5E1"],
    transformation: "e_gen_recolor:prompt_(sky;atmosphere);to-color_aliceblue/e_tint:equalize:45:lightcyan/e_contrast:-8/e_brightness:6",
    cssFilterFallback: "saturate(0.72) contrast(0.92) brightness(1.08) blur(0.2px)",
  },
  {
    id: "basanta",
    name: "Basanta · Spring",
    bengaliName: "বসন্তকাল",
    bengaliScript: "বসন্ত",
    period: "Falgun – Chaitra (February to April · Dol Jatra)",
    poeticAtmosphere: "Fiery Palash Blossoms & Joyous Renewal",
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

const DEFAULT_BENGAL_PALETTE = [
  "#B5532F",
  "#EDE4D3",
  "#1B1A17",
  "#E3C27A",
  "#6B6458",
];

function normalizeHexColor(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
}

function getCloudinary() {
  const cld = (
    (cloudinaryPackage as any).v2 ||
    (cloudinaryPackage as any).default?.v2 ||
    (cloudinaryPackage as any).default ||
    cloudinaryPackage
  ) as typeof import("cloudinary").v2;

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cld.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cld;
}

/**
 * Uploads an image to Cloudinary storage and extracts its 5-color atmospheric palette.
 */
export async function uploadGuideImageWithColors(
  imageSource: string,
  folder = "panther_panchali/guide",
): Promise<CloudinaryUploadResult> {
  const cld = getCloudinary();

  if (!cld || typeof cld.uploader?.upload !== "function") {
    console.warn("Cloudinary credentials not configured; using fallback storage.");
    return {
      url: imageSource,
      publicId: `local-${Date.now()}`,
      colors: DEFAULT_BENGAL_PALETTE,
    };
  }

  try {
    const uploadRes = await cld.uploader.upload(imageSource, {
      folder,
      resource_type: "image",
      colors: true,
      predominant: true,
    });

    const candidateColors: string[] = [];

    if (Array.isArray(uploadRes.colors)) {
      for (const item of uploadRes.colors) {
        if (Array.isArray(item)) {
          const hex = normalizeHexColor(item[0]);
          if (hex && !candidateColors.includes(hex)) candidateColors.push(hex);
        } else if (item && typeof item === "object") {
          const raw = (item as { color?: unknown }).color;
          const hex = normalizeHexColor(raw);
          if (hex && !candidateColors.includes(hex)) candidateColors.push(hex);
        }
      }
    }

    const predominant = uploadRes.predominant as
      | { cloudinary?: unknown[][]; google?: unknown[][] }
      | undefined;

    if (predominant?.cloudinary && Array.isArray(predominant.cloudinary)) {
      for (const item of predominant.cloudinary) {
        if (Array.isArray(item)) {
          const hex = normalizeHexColor(item[0]);
          if (hex && !candidateColors.includes(hex)) candidateColors.push(hex);
        }
      }
    }

    for (const fallback of DEFAULT_BENGAL_PALETTE) {
      if (candidateColors.length >= 5) break;
      if (!candidateColors.includes(fallback)) candidateColors.push(fallback);
    }

    return {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      colors: candidateColors.slice(0, 5),
    };
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to original source:", error);
    return {
      url: imageSource,
      publicId: `fallback-${Date.now()}`,
      colors: DEFAULT_BENGAL_PALETTE,
    };
  }
}

export const uploadToCloudinary = async (
  imageSource: string,
  folder = "panther_panchali/guide",
): Promise<{ url: string; publicId: string }> => {
  const res = await uploadGuideImageWithColors(imageSource, folder);
  return { url: res.url, publicId: res.publicId };
};
