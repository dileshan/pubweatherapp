import {
  convertTemperature,
  dailyLabel,
  degreesToDirection,
  degreesToEmoji,
  hourlyLabel,
  isNightHour,
  weatherDescription,
  weatherIcon,
} from '../src/weather';

describe('convertTemperature', () => {
  it('returns Fahrenheit values unchanged', () => {
    expect(convertTemperature(68, 'F')).toBe(68);
  });

  it.each([
    [32, 0],
    [68, 20],
    [-40, -40],
    [71, 22],
  ])('converts %i°F to %i°C, rounded', (fahrenheit, celsius) => {
    expect(convertTemperature(fahrenheit, 'C')).toBe(celsius);
  });
});

describe('degreesToDirection and degreesToEmoji', () => {
  it.each([
    [0, 'N', '↓'],
    [45, 'NE', '↙︎'],
    [90, 'E', '←'],
    [135, 'SE', '↖︎'],
    [180, 'S', '↑'],
    [225, 'SW', '↗︎'],
    [270, 'W', '→'],
    [315, 'NW', '↘︎'],
    [360, 'N', '↓'],
    [22, 'N', '↓'],
    [23, 'NE', '↙︎'],
  ])('maps %i° to %s and %s', (degrees, compass, arrow) => {
    expect(degreesToDirection(degrees)).toBe(compass);
    expect(degreesToEmoji(degrees)).toBe(arrow);
  });
});

describe('isNightHour', () => {
  it.each([
    ['2026-10-13T00:00', true],
    ['2026-10-13T05:00', true],
    ['2026-10-13T06:00', false],
    ['2026-10-13T17:00', false],
    ['2026-10-13T18:00', true],
    ['2026-10-13T23:00', true],
  ])('treats %s as night: %s', (time, expected) => {
    expect(isNightHour(time)).toBe(expected);
  });
});

describe('weatherIcon', () => {
  it('default clear skies and sunny', () => {
    expect(weatherIcon(0)).toBe('☀️');
  });

  it('ensures that the moon is used regardless of weather', () => {
    expect(weatherIcon(3, true)).toBe('🌙');
  });

  it.each([[0,1,2,3,30,45,48,51,55,56,57,61,67,71,77,80,82,85,86,95,99]])
  ('ensures that the moon is used regardless of weather', (code) => {
    expect(weatherIcon(code, true)).toBe('🌙');
  });

  it.each([
    [1, '🌤️'],
    [2, '🌤️'],
    [3, '☁️'],
    [45, '🌫️'],
    [48, '🌫️'],
    [51, '🌧️'],
    [55, '🌧️'],
    [56, '❄️'],
    [57, '❄️'],
    [61, '🌧️'],
    [67, '🌧️'],
    [71, '❄️'],
    [77, '❄️'],
    [80, '🌧️'],
    [82, '🌧️'],
    [85, '❄️'],
    [86, '❄️'],
    [95, '⛈️'],
    [99, '⛈️'],
    [30, '🌥️'],
  ])('maps code %i to %s', (code, icon) => {
    expect(weatherIcon(code)).toBe(icon);
  });
});

describe('weatherDescription', () => {
  it.each([
    [0, 'Sunny skies'],
    [2, 'Partly cloudy'],
    [3, 'Overcast'],
    [45, 'Foggy'],
    [48, 'Freezing fog'],
    [51, 'Light drizzle'],
    [53, 'Moderate drizzle'],
    [55, 'Dense drizzle'],
    [56, 'Light freezing drizzle'],
    [57, 'Dense freezing drizzle'],
    [61, 'Slight rain'],
    [63, 'Moderate rain'],
    [65, 'Heavy rain'],
    [66, 'Light freezing rain'],
    [67, 'Heavy freezing rain'],
    [71, 'Slight snowfall'],
    [73, 'Moderate snowfall'],
    [75, 'Heavy snowfall'],
    [77, 'Snow grains'],
    [80, 'Slight rain showers'],
    [81, 'Moderate rain showers'],
    [82, 'Violent rain showers'],
    [85, 'Slight snow showers'],
    [86, 'Heavy snow showers'],
    [95, 'Thunderstorm'],
    [96, 'Thunderstorm with slight hail'],
    [97, 'Heavy thunderstorm'],
    [99, 'Thunderstorm with heavy hail'],
  ])('describes code %i as %s', (code, description) => {
    expect(weatherDescription(code)).toBe(description);
  });

  it('falls back to Clear skies for codes without their own description', () => {
    expect(weatherDescription(1)).toBe('Clear skies');
    expect(weatherDescription(42)).toBe('Clear skies');
  });
});

describe('hourlyLabel', () => {
  it('labels the first entry as Now', () => {
    expect(hourlyLabel('2026-10-13T14:00', 0)).toBe('Now');
  });

  it.each([
    ['2026-10-13T00:00', '12 AM'],
    ['2026-10-13T09:00', '9 AM'],
    ['2026-10-13T12:00', '12 PM'],
    ['2026-10-13T15:00', '3 PM'],
    ['2026-10-13T23:00', '11 PM'],
  ])('labels %s as %s', (time, label) => {
    expect(hourlyLabel(time, 1)).toBe(label);
  });
});

describe('dailyLabel', () => {
  it('labels the first two entries as Today and Tomorrow', () => {
    expect(dailyLabel('2026-10-13', 0)).toBe('Today');
    expect(dailyLabel('2026-10-14', 1)).toBe('Tomorrow');
  });

  it('labels later entries with the weekday name', () => {
    expect(dailyLabel('2026-10-15', 2)).toBe('Thursday');
    expect(dailyLabel('2026-10-18', 5)).toBe('Sunday');
  });
});
