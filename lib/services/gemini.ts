import { GoogleGenAI } from "@google/genai";
import type { BengalPlaceAnalysis } from "@/lib/models/place-discovery";

export interface PostCaptionResult {
  caption: string;
  hashtags: string[];
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }

  return new GoogleGenAI({
    apiKey,
    apiVersion: "v1beta",
  });
}

function cleanJsonText(raw: string): string {
  return raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/**
 * Multimodal image analysis using Gemini 2.5 Flash (`gemini-2.5-flash`).
 * Identifies whether an uploaded photograph is in West Bengal,
 * determines exact coordinates, district, address, ~300-word pure plain-text summary,
 * Markdown-enabled scenic beauty, Markdown-enabled historical significance,
 * and predicted mood / sensory expectations.
 */
export async function analyzeWestBengalPlaceFromImage(params: {
  imageBase64: string;
  mimeType: string;
  userNotes?: string;
}): Promise<BengalPlaceAnalysis> {
  const { imageBase64, mimeType, userNotes } = params;
  const ai = getGeminiClient();

  // Strip prefix data URI headers if present so Gemini receives pure base64
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

  const prompt = `You are an expert cultural geographer, architectural historian, and master storyteller of West Bengal, India for the cultural archive "Panther Panchali".
Analyze the provided photograph carefully.

TASK:
1. Identify the location shown in the photograph.
2. Determine whether this location is situated within the Indian state of West Bengal.

CASE A: THE LOCATION IS NOT IN WEST BENGAL
Set "isWestBengal": false. Identify the location or landmark accurately in "placeName" (e.g. "Taj Mahal, Agra", "Eiffel Tower, Paris", etc.) and specify its actual state or country. In "nonBengalNotice", provide a courteous, culturally warm explanation that Panther Panchali is an application devoted to discovering hidden places across the 23 districts of West Bengal, and warmly invite the user to upload a photograph from anywhere in West Bengal. Provide default coordinates and placeholders for the remaining fields.

CASE B: THE LOCATION IS IN WEST BENGAL
Set "isWestBengal": true. Provide accurate, culturally rich details:
- "placeName": The authentic iconic or local name of the place/landmark in English (e.g. "Bishnupur Terracotta Temples", "Batasia Loop", "Hazarduari Palace", "Victoria Memorial", "Mukutmanipur Dam", "Susunia Hills", "Kumartuli", "Belur Math", "Santiniketan Ashram", "Jaldapara National Park", "Dakshineswar Kali Temple").
- "bengaliName": The authentic name in Bengali script (e.g. "বিষ্ণুপুর টেরাকোটা মন্দির", "বাতাসিয়া লুপ", "হাজারদুয়ারি প্রাসাদ").
- "district": The specific district in West Bengal (e.g. "Bankura", "Darjeeling", "Murshidabad", "Purulia", "Kolkata", "Birbhum", "Hooghly", "Howrah", "South 24 Parganas", "North 24 Parganas", "Nadia", "Kalimpong", "Jalpaiguri", "Alipurduar", "Cooch Behar", "Malda", "Paschim Bardhaman", "Purba Bardhaman", "Paschim Medinipur", "Purba Medinipur", "Jhargram", "Dakshin Dinajpur", "Uttar Dinajpur").
- "state": "West Bengal"
- "detailedAddress": Full real-world postal address or landmark vicinity description.
- "coordinates": Exact latitude and longitude { "lat": number, "lng": number } for OpenStreetMap positioning.
- "plainTextSummary":
  CRITICAL CONSTRAINED PROMPT RULE FOR "plainTextSummary":
  You MUST write an evocative, comprehensive, and culturally grounded overview summary of approximately 300 words.
  MANDATORY REQUIREMENT: You MUST NATIVELY output ZERO Markdown characters in this field.
  DO NOT use any asterisks (* or **), hashes (#), underscores (_), backticks (\`), tildes (~), brackets, bullet marks (-), or numbered list prefixes.
  Every single sentence and paragraph must be standard, flowing literary English prose.
  The text must be generated natively as pure plain text without relying on post-processing replacement.
  Describe the geographical atmosphere, cultural aura, lived experience, and overall sensory identity of this place as a flowing 300-word story.
- "scenicBeauty":
  Rich, vivid Markdown text describing the natural landscape, topography, river currents, red laterite soils, hills, tea gardens, forests, or seasonal atmosphere. You ARE ENCOURAGED to use Markdown formatting here (such as ### subheadings, **bold**, and - bullet lists) to emphasize scenic elements.
- "historicalSignificance":
  Rich, deep Markdown text explaining the architectural style (e.g. terracotta plaques, Chala/Ratna temples, Indo-Saracenic, colonial), founding rulers/dynasties (e.g. Malla Kings, Nawabs of Bengal, Pala era), and literary or folkloric legends. You ARE ENCOURAGED to use Markdown formatting here (such as ### subheadings, **bold**, and - bullet lists) to emphasize historical points.
- "predictedMood":
  - "moodName": The predicted emotional or contemplative mood of the place (e.g. "Contemplative Solitude", "Serene Reverence", "Verdant Nostalgia", "Festive Grandeur", "Monsoon Melancholy", "Mystical Stillness").
  - "moodDescription": 2-3 sentences explaining why a visitor should enter this place in this exact mood and what inner resonance it brings.
  - "whatToExpect": An array of 4 to 6 specific sensory highlights (e.g. ["Fragrance of damp red earth and sal leaves", "Echo of temple bells across ancient dighi lakes", "Clay teacups (bhnaar) served at local village stalls", "Chiselled terracotta reliefs depicting epic poetry"]).
  - "bestTimeToVisit": Recommended season and time of day (e.g. "Late Autumn to Spring (October–March), best experienced at dawn when mist envelops the monument").

${userNotes ? `User Hint / Memory Note: "${userNotes}"` : ""}

Respond ONLY with valid JSON conforming to this structure:
{
  "isWestBengal": true,
  "placeName": "...",
  "bengaliName": "...",
  "district": "...",
  "state": "West Bengal",
  "detailedAddress": "...",
  "coordinates": { "lat": 23.0768, "lng": 87.3242 },
  "plainTextSummary": "Continuous literary plain text summary of approximately 300 words without any markdown characters.",
  "scenicBeauty": "### Scenic Highlights\\n\\nMarkdown formatted text...",
  "historicalSignificance": "### Heritage & Architecture\\n\\nMarkdown formatted text...",
  "predictedMood": {
    "moodName": "...",
    "moodDescription": "...",
    "whatToExpect": ["...", "...", "...", "..."],
    "bestTimeToVisit": "..."
  },
  "nonBengalNotice": null
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.65,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Empty response received from Gemini 2.5 Flash model.");
  }

  const cleaned = cleanJsonText(text);
  const parsed = JSON.parse(cleaned) as BengalPlaceAnalysis;

  // Ensure default fallback coordinates if missing
  if (!parsed.coordinates || typeof parsed.coordinates.lat !== "number") {
    parsed.coordinates = { lat: 22.5726, lng: 88.3639 }; // Kolkata default
  }

  return parsed;
}

export async function generateKolkataPostCaption(params: {
  placeName: string;
  timeOfDay: string;
  yearSpan: string;
  vibe: string;
  userPromptNotes?: string;
}): Promise<PostCaptionResult> {
  const { placeName, timeOfDay, yearSpan, vibe, userPromptNotes } = params;
  const ai = getGeminiClient();

  const prompt = `You are an authentic voice of Kolkata capturing moments for a cultural social feed ("Panther Panchali").
Generate a poetic, atmospheric, and culturally grounded social feed post caption and relevant hashtags for an image.
Details:
- Location / Landmark: ${placeName}
- Visual Format: Classic 1:1 Square Instagram/Facebook photo framed at the landmark
- Time of Day: ${timeOfDay}
- Season / Festival / Span of Year: ${yearSpan}
- Vibe / Mood: ${vibe}
${userPromptNotes ? `- Personal Note from User: ${userPromptNotes}` : ""}

Guidelines:
1. Caption must be plain text (no markdown formatting, no bold, no asterisks).
2. It should be 2 to 4 evocative sentences reflecting the chosen location, festival, and vibe with sensory Bengali flavor (e.g. mentions of adda, river currents, dhoop incense, morning mist, warm clay cups, festive lighting).
3. Generate 5 to 7 trending, hyper-relevant hashtags that include the place, festival, and aesthetic.

Respond ONLY with valid JSON in this exact structure:
{
  "caption": "Your evocative plain text caption here.",
  "hashtags": ["#Kolkata", "#CityOfJoy", "#Kumartuli", "#AestheticCalcutta", "#DurgaPuja"]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.85,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Empty response returned by AI model.");
  }

  const cleaned = cleanJsonText(text);
  return JSON.parse(cleaned) as PostCaptionResult;
}
