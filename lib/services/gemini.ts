import { GoogleGenAI } from "@google/genai";

export interface PostCaptionResult {
  caption: string;
  hashtags: string[];
}

export async function generateKolkataPostCaption(params: {
  placeName: string;
  timeOfDay: string;
  yearSpan: string;
  vibe: string;
  userPromptNotes?: string;
}): Promise<PostCaptionResult> {
  const { placeName, timeOfDay, yearSpan, vibe, userPromptNotes } = params;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: "v1beta",
  });

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

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned) as PostCaptionResult;
}
