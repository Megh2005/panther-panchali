import { GoogleGenAI } from "@google/genai";
import type { BengalPlaceGuide } from "@/lib/models/guide";

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
}): Promise<BengalPlaceGuide> {
  const { imageBase64, mimeType, userNotes } = params;
  const ai = getGeminiClient();

  // Strip prefix data URI headers if present so Gemini receives pure base64
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

  const prompt = `You are a warm cultural guide and master storyteller of West Bengal, India for the cultural archive "Panther Panchali".
Analyze the provided photograph carefully.

CRITICAL LANGUAGE RULE ACROSS ALL FIELDS:
Use simple, clear, vivid, and easily understandable English throughout every section. Avoid overly complex, academic, or obscure words so that any reader of any age can effortlessly understand, imagine, and connect with the place.

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
  You MUST write an engaging, comprehensive, and culturally grounded overview summary of approximately 300 words.
  Use easy-to-understand, natural, and simple English so any reader can follow along comfortably.
  MANDATORY REQUIREMENT: You MUST NATIVELY output ZERO Markdown characters in this field.
  DO NOT use any asterisks (* or **), hashes (#), underscores (_), backticks (\`), tildes (~), brackets, bullet marks (-), or numbered list prefixes.
  Every single sentence and paragraph must be standard, flowing literary English prose.
  The text must be generated natively as pure plain text without relying on post-processing replacement.
  Describe the geographical atmosphere, cultural aura, lived experience, and overall sensory identity of this place as a flowing 300-word story.
- "scenicBeauty":
  OPTIONAL (NOT MANDATORY): Not every location in West Bengal possesses prominent natural or scenic beauty. If this location has authentic natural landscape, topography, river currents, red laterite soils, hills, tea gardens, forests, or seasonal atmosphere, provide a dedicated scenic reflection.
  CRITICAL RULES:
  1. SINGLE PARAGRAPH ONLY: Must be written strictly as a single, cohesive, flowing paragraph (ZERO subheadings, ZERO bullet points, ZERO line breaks).
  2. INTERACTIVE STORYTELLING MODE: Do NOT write in a serious, dry, academic, or formal statement mode (avoid encyclopedic statements like "The area is characterized by dense vegetation and humid climate"). Instead, use an interactive storytelling mode that invites the reader in and makes the landscape feel alive.
  3. NO PERSONA: Do NOT adopt an artificial persona (do NOT say "I am your guide" or talk in the first person). Instead, use simple, friendly, and relatable words that bring the sunlight, breezes, rivers, and surroundings directly to life.
  4. EASY LANGUAGE: Use simple, plain, clear vocabulary that anyone can easily read and visualize.
  5. FORMAT: Rich Markdown single paragraph where key sensory and environmental highlights are emphasized in **bold**.
  If the location is strictly architectural or urban with no notable natural or scenic landscape, set this to null.
- "historicalSignificance":
  OPTIONAL (NOT MANDATORY): Not every location possesses ancient or historical architecture. If this location has genuine historical heritage, architectural style (e.g. terracotta plaques, Chala/Ratna temples, Nawabi palaces, colonial edifices), founding dynasties, or folklore, provide a dedicated historical reflection.
  CRITICAL RULES:
  1. SINGLE PARAGRAPH ONLY: Must be written strictly as a single, cohesive, flowing paragraph (ZERO subheadings, ZERO bullet points, ZERO line breaks).
  2. INTERACTIVE STORYTELLING MODE: Do NOT write in a serious, dry, museum-plaque, or textbook statement mode (avoid stiff statements like "This structure was constructed in 1704 by the ruler"). Instead, use an interactive storytelling mode that weaves time, craft, and human hands into an engaging story.
  3. NO PERSONA: Do NOT adopt an artificial persona. Instead, let simple, vivid vocabulary show the beauty of the craft—inviting the reader to notice the carved clay tiles, the old river paths, and the timeless heritage.
  4. EASY LANGUAGE: Use straightforward, accessible English without complicated historical jargon.
  5. FORMAT: Rich Markdown single paragraph where standout architectural styles, dynasties, and heritage facets are emphasized in **bold**.
  If the location is purely a natural landscape without notable historic architecture or heritage, set this to null.
  NOTE: A place may have only scenicBeauty, only historicalSignificance, or both if it has rich natural and historical significance.
- "predictedMood":
  - "moodName": The predicted emotional or contemplative atmosphere of the place (e.g. "Peaceful Solitude", "Serene Reverence", "Quiet Nostalgia", "Joyful Grandeur", "Gentle Rain Reflection", "Calm Stillness").
  - "moodParagraph": An evocative, cohesive narrative paragraph (strictly under 300 words) written in clear, simple, and relatable language describing the ideal mindset for visiting and what visitors can expect to feel and sense. CRITICAL RULE: Highlight all key terminologies, emotional mindsets, sensory expectations (such as fragrances, sounds, local teas, and architectural features), and optimal visiting moments with Markdown BOLD (e.g. **peaceful calm**, **scent of wet earth**, **cool morning breeze**).
  - "bestTimeToVisit": Recommended season and time of day (e.g. "Late Autumn to Spring (October–March), best experienced in the early morning when the air is cool and peaceful").

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
  "scenicBeauty": "A single flowing paragraph in interactive storytelling mode highlighting **natural landscape cues** in bold...",
  "historicalSignificance": "A single flowing paragraph in interactive storytelling mode highlighting **architectural and heritage facets** in bold...",
  "predictedMood": {
    "moodName": "...",
    "moodParagraph": "A rich flowing paragraph where **key terminologies**, **mindset**, and **sensory cues** are highlighted in bold...",
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
  const parsed = JSON.parse(cleaned) as BengalPlaceGuide;

  // Ensure default fallback coordinates if missing
  if (!parsed.coordinates || typeof parsed.coordinates.lat !== "number") {
    parsed.coordinates = { lat: 22.5726, lng: 88.3639 };
  }

  return parsed;
}
