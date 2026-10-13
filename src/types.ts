export type Units = 'F' | 'C';

export type HourlyForecast = {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
};

export type DailyForecast = {
  time: string;
  high: number;
  low: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
};

export type WeatherSnapshot = {
  temperature: number;
  apparentTemperature: number;
  high: number;
  low: number;
  humidity: number;
  pressure: number;
  dewPoint: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  time: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
};

export type SavedLocation = {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};

export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
};
