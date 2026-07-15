// 天氣資料:使用 Open-Meteo 免費 API(不需金鑰)
// https://open-meteo.com/en/docs

export interface WeatherInfo {
  temperature: number; // °C
  apparentTemperature: number; // 體感溫度 °C
  weatherCode: number; // WMO weather code
  isDay: boolean;
  precipitationProbability: number; // 目前這個小時的降雨機率 %
}

/** WMO weather code → 中文描述 + App 內的圖示名稱 */
export function describeWeather(code: number, isDay: boolean): { label: string; icon: string } {
  if (code === 0) return { label: "晴朗", icon: isDay ? "sun.max.fill" : "moon.fill" };
  if (code === 1 || code === 2) return { label: "多雲時晴", icon: "cloud.sun.fill" };
  if (code === 3) return { label: "陰天", icon: "cloud.fill" };
  if (code === 45 || code === 48) return { label: "有霧", icon: "cloud.fog.fill" };
  if (code >= 51 && code <= 57) return { label: "毛毛雨", icon: "cloud.drizzle.fill" };
  if (code >= 61 && code <= 67) return { label: "下雨", icon: "cloud.rain.fill" };
  if (code >= 71 && code <= 77) return { label: "下雪", icon: "snowflake" };
  if (code >= 80 && code <= 82) return { label: "陣雨", icon: "cloud.rain.fill" };
  if (code >= 85 && code <= 86) return { label: "陣雪", icon: "snowflake" };
  if (code >= 95) return { label: "雷雨", icon: "cloud.bolt.fill" };
  return { label: "多雲", icon: "cloud.fill" };
}

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherInfo> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,is_day,weather_code` +
    `&hourly=precipitation_probability` +
    `&forecast_days=1&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();

  // 取目前時刻對應小時的降雨機率
  const currentTime: string = data.current.time; // e.g. "2026-07-14T15:30"
  const currentHour = currentTime.slice(0, 13); // "2026-07-14T15"
  const hourlyTimes: string[] = data.hourly?.time ?? [];
  const hourlyProb: number[] = data.hourly?.precipitation_probability ?? [];
  const idx = hourlyTimes.findIndex((t) => t.startsWith(currentHour));
  const precipitationProbability = idx >= 0 ? (hourlyProb[idx] ?? 0) : 0;

  return {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    precipitationProbability,
  };
}
