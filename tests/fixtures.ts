import type { DailyForecast, HourlyForecast } from '../src/types';

export function makeHour(overrides: Partial<HourlyForecast> = {}): HourlyForecast {
  return {
    time: '2026-10-13T14:00',
    temperature: 68,
    precipitationProbability: 20,
    weatherCode: 0,
    windSpeed: 8,
    windDirection: 225,
    windGusts: 14,
    ...overrides,
  };
}

export function makeDay(overrides: Partial<DailyForecast> = {}): DailyForecast {
  return {
    time: '2026-10-13',
    high: 68,
    low: 50,
    precipitationProbability: 0,
    weatherCode: 0,
    windSpeed: 5,
    ...overrides,
  };
}
