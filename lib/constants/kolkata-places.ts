import type { KolkataPlace } from "@/lib/models/post";

export interface KolkataPlaceWithBackdrop extends KolkataPlace {
  backdropUrl: string;
}

export const KOLKATA_PLACES: readonly KolkataPlaceWithBackdrop[] = [
  {
    id: "howrah-bridge",
    name: "Howrah Bridge",
    tagline: "The beating cantilever heart of the riverfront",
    description:
      "Iconic steel giant overlooking bustling flower bazaars and ferries bathed in golden morning light.",
    lat: 22.5851,
    lng: 88.3468,
    area: "Riverfront",
    backdropUrl:
      "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "victoria-memorial",
    name: "Victoria Memorial",
    tagline: "White marble under sprawling morning skies",
    description:
      "Grand historic monument reflected in pristine water bodies, surrounded by horse-drawn carriages and lush open lawns.",
    lat: 22.5448,
    lng: 88.3426,
    area: "Central Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "kumartuli",
    name: "Kumartuli",
    tagline: "Where river silt turns into sacred idols",
    description:
      "Narrow maze of workshops along the Hooghly where generational sculptors craft Durga and Kali with straw and clay.",
    lat: 22.5997,
    lng: 88.3662,
    area: "North Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1601055903647-87e224e772ea?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "college-street",
    name: "College Street",
    tagline: "The world's largest second-hand book quarter",
    description:
      "Centuries of literature stacked high on wooden stalls, accompanied by heated intellectual adda over black coffee.",
    lat: 22.5744,
    lng: 88.3629,
    area: "Central Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "prinsep-ghat",
    name: "Prinsep Ghat",
    tagline: "Gothic arches by the river current",
    description:
      "Palladian porch with wooden rowboats gliding at sunset, and evening breezes along the promenade.",
    lat: 22.5558,
    lng: 88.3327,
    area: "Riverfront",
    backdropUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "park-street",
    name: "Park Street",
    tagline: "The avenue of golden lights and heritage nightlife",
    description:
      "Kolkata's historic dining artery, illuminated with festive lighting, legacy cafes, and lively conversation.",
    lat: 22.5517,
    lng: 88.3524,
    area: "Central Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "sovabazar-rajbari",
    name: "Sovabazar Rajbari",
    tagline: "Aristocratic courtyards and red-oxide verandas",
    description:
      "Grand palace courtyards with fluted columns where community festivities echo through classical heritage.",
    lat: 22.5976,
    lng: 88.3686,
    area: "North Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "dakshineswar",
    name: "Dakshineswar Kali Temple",
    tagline: "Nine-spire sanctuary upon the riverbank",
    description:
      "Historic temple architecture where spiritual quietude echoes over bathing ghat steps and morning bells.",
    lat: 22.6533,
    lng: 88.3575,
    area: "North Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1598890777032-bde13fba5be3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "kalighat",
    name: "Kalighat Temple",
    tagline: "Ancient sacred pilgrimage on the Adi Ganga",
    description:
      "One of the 51 Shakti Peethas steeped in deep historical reverence, vermilion offerings, and flower garlands.",
    lat: 22.5205,
    lng: 88.3426,
    area: "South Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "shyambazar",
    name: "Shyambazar",
    tagline: "Tram tracks, bronze statues, and clay pot chai",
    description:
      "Electric North Kolkata intersection where clanging blue trams meet midnight conversation over hot tea.",
    lat: 22.6025,
    lng: 88.3719,
    area: "North Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "gariahat",
    name: "Gariahat",
    tagline: "Vibrant shopping canopies and sidewalk street adda",
    description:
      "Bustling avenues of traditional handloom sarees, roadside jewelry, and evening city energy.",
    lat: 22.5173,
    lng: 88.3657,
    area: "South Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "new-market",
    name: "New Market",
    tagline: "Victorian brick arcade of a thousand memories",
    description:
      "Historic clock tower marketplace bustling with bakers, florists, and Kolkata celebration across decades.",
    lat: 22.5601,
    lng: 88.3528,
    area: "Central Kolkata",
    backdropUrl:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85",
  },
];

export const TIMES_OF_DAY = [
  "Dawn",
  "Morning",
  "Afternoon",
  "Twilight",
  "Evening",
  "Midnight",
] as const;

export const YEAR_SPANS = [
  "Pooja",
  "Deepavali",
  "Poila Baisakh",
  "Winter Season",
  "Monsoon Rain",
  "Spring Breeze",
] as const;

export const POST_VIBES = [
  "Aesthetic",
  "Happy",
  "Sad",
  "Melancholy",
  "Dazzling",
  "Party",
] as const;
