export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  tempMax: number;
  tempMin: number;
  observedAt: string;
}

export function getWeatherConditionInfo(code: number): {
  label: string;
  iconName: "sun" | "cloud-sun" | "cloud" | "smog" | "cloud-rain" | "cloud-showers-heavy" | "cloud-bolt" | "snowflake";
} {
  switch (code) {
    case 0:
      return { label: "Clear Sky", iconName: "sun" };
    case 1:
      return { label: "Mainly Clear", iconName: "cloud-sun" };
    case 2:
      return { label: "Partly Cloudy", iconName: "cloud-sun" };
    case 3:
      return { label: "Overcast", iconName: "cloud" };
    case 45:
    case 48:
      return { label: "Foggy", iconName: "smog" };
    case 51:
    case 53:
    case 55:
      return { label: "Drizzle", iconName: "cloud-rain" };
    case 61:
    case 63:
      return { label: "Rainy", iconName: "cloud-rain" };
    case 65:
      return { label: "Heavy Rain", iconName: "cloud-showers-heavy" };
    case 71:
    case 73:
    case 75:
      return { label: "Snow", iconName: "snowflake" };
    case 80:
    case 81:
    case 82:
      return { label: "Rain Showers", iconName: "cloud-showers-heavy" };
    case 95:
      return { label: "Thunderstorm", iconName: "cloud-bolt" };
    case 96:
    case 99:
      return { label: "Severe Thunderstorm", iconName: "cloud-bolt" };
    default:
      return { label: "Mild & Clear", iconName: "sun" };
  }
}

/**
 * Fetches real-time weather telemetry from Open-Meteo open-source meteorological API
 * for given coordinates in West Bengal.
 */
export async function fetchPlaceWeather(
  lat: number,
  lng: number,
): Promise<WeatherData | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Weather service response not OK (${response.status})`);
      return null;
    }

    const data = await response.json();
    const current = data?.current;
    if (!current) return null;

    const weatherCode = Number(current.weather_code ?? 0);
    const { label } = getWeatherConditionInfo(weatherCode);

    const tempMax = Array.isArray(data?.daily?.temperature_2m_max)
      ? Number(data.daily.temperature_2m_max[0] ?? current.temperature_2m)
      : Math.round(current.temperature_2m + 3);

    const tempMin = Array.isArray(data?.daily?.temperature_2m_min)
      ? Number(data.daily.temperature_2m_min[0] ?? current.temperature_2m)
      : Math.round(current.temperature_2m - 4);

    return {
      temperature: Math.round(Number(current.temperature_2m)),
      apparentTemperature: Math.round(Number(current.apparent_temperature ?? current.temperature_2m)),
      humidity: Math.round(Number(current.relative_humidity_2m ?? 60)),
      precipitation: Number(current.precipitation ?? 0),
      windSpeed: Math.round(Number(current.wind_speed_10m ?? 0)),
      weatherCode,
      condition: label,
      tempMax: Math.round(tempMax),
      tempMin: Math.round(tempMin),
      observedAt: current.time || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to retrieve weather data:", error);
    return null;
  }
}
