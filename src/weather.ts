import type { Units } from './types';

/**
 * Converts a stored Fahrenheit value to the selected display units.
 */
export function convertTemperature(value: number, units: Units) {
  return units === 'F' ? value : Math.round(((value - 32) * 5) / 9);
}

export function degreesToDirection(degrees: number) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

export function degreesToEmoji(degrees: number) {
  const directions = ['↓', '↙︎', '←', '↖︎', '↑', '↗︎', '→', '↘︎'];
  return directions[Math.round(degrees / 45) % 8];
}

export function isNightHour(time: string) {
  const hour = Number(time.slice(11, 13));
  return hour < 6 || hour >= 18;
}

export function weatherIcon(code: number, night = false) {
  if (night) return '🌙';
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if ((code >= 51 && code <= 55) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
  if ((code >= 56 && code <= 57) || (code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '❄️';
  if (code >= 95) return '⛈️';
  return '🌥️';
}

/**
 * Returns a human-readable description of the weather code.
 *
 * @param code The weather code from the Open-Meteo API.
 */
export function weatherDescription(code: number) {
  switch (code) {
    case 0:
      return 'Sunny skies';
    case 2:
      return 'Partly cloudy';
    case 3:
      return 'Overcast';
    case 45:
      return 'Foggy';
    case 48:
      return 'Freezing fog';
    case 51:
      return 'Light drizzle';
    case 53:
      return 'Moderate drizzle';
    case 55:
      return 'Dense drizzle';
    case 56:
      return 'Light freezing drizzle';
    case 57:
      return 'Dense freezing drizzle';
    case 61:
      return 'Slight rain';
    case 63:
      return 'Moderate rain';
    case 65:
      return 'Heavy rain';
    case 66:
      return 'Light freezing rain';
    case 67:
      return 'Heavy freezing rain';
    case 71:
      return 'Slight snowfall';
    case 73:
      return 'Moderate snowfall';
    case 75:
      return 'Heavy snowfall';
    case 77:
      return 'Snow grains';
    case 80:
      return 'Slight rain showers';
    case 81:
      return 'Moderate rain showers';
    case 82:
      return 'Violent rain showers';
    case 85:
      return 'Slight snow showers';
    case 86:
      return 'Heavy snow showers';
    case 95:
      return 'Thunderstorm';
    case 96:
      return 'Thunderstorm with slight hail';
    case 97:
      return 'Heavy thunderstorm';
    case 99:
      return 'Thunderstorm with heavy hail';
    default:
      return 'Clear skies';
  }
}

export function hourlyLabel(time: string, index: number) {
  if (index === 0) return 'Now';

  const hour = Number(time.slice(11, 13));
  return `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export function dailyLabel(time: string, index: number) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';

  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(`${time}T12:00:00`));
}
