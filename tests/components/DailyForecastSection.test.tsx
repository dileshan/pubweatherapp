import { render, screen } from '@testing-library/react-native';

import { DailyForecastSection } from '../../src/components/DailyForecastSection';
import { makeDay } from '../fixtures';

const days = [
  makeDay({ time: '2026-10-13', high: 68, low: 50 }),
  makeDay({ time: '2026-10-14', high: 59, low: 41 }),
  makeDay({ time: '2026-10-15', high: 86, low: 32 }),
];

describe('DailyForecastSection', () => {
  it('renders the default title', async () => {
    await render(<DailyForecastSection days={days} units="F" />);

    expect(screen.getByText('10-day forecast')).toBeOnTheScreen();
  });

  it('renders a custom title', async () => {
    await render(<DailyForecastSection days={days} units="F" title="This week" />);

    expect(screen.getByText('This week')).toBeOnTheScreen();
    expect(screen.queryByText('10-day forecast')).toBeNull();
  });

  it('labels days as Today, Tomorrow, then the weekday name', async () => {
    await render(<DailyForecastSection days={days} units="F" />);

    expect(screen.getByText('Today')).toBeOnTheScreen();
    expect(screen.getByText('Tomorrow')).toBeOnTheScreen();
    expect(screen.getByText('Thursday')).toBeOnTheScreen();
  });

  it('shows highs and lows in Fahrenheit', async () => {
    await render(<DailyForecastSection days={[makeDay({ high: 68, low: 50 })]} units="F" />);

    expect(screen.getByText('68°')).toBeOnTheScreen();
    expect(screen.getByText('50°')).toBeOnTheScreen();
  });

  it('converts highs and lows to Celsius', async () => {
    await render(<DailyForecastSection days={[makeDay({ high: 68, low: 50 })]} units="C" />);

    expect(screen.getByText('20°')).toBeOnTheScreen();
    expect(screen.getByText('10°')).toBeOnTheScreen();
  });

  it('shows the precipitation probability only above 1%', async () => {
    await render(
      <DailyForecastSection
        days={[
          makeDay({ time: '2026-10-13', precipitationProbability: 0 }),
          makeDay({ time: '2026-10-14', precipitationProbability: 1 }),
          makeDay({ time: '2026-10-15', precipitationProbability: 2 }),
          makeDay({ time: '2026-10-16', precipitationProbability: 60 }),
        ]}
        units="F"
      />
    );

    expect(screen.queryByText('0%')).toBeNull();
    expect(screen.queryByText('1%')).toBeNull();
    expect(screen.getByText('2%')).toBeOnTheScreen();
    expect(screen.getByText('60%')).toBeOnTheScreen();
  });

  it('flags a day as windy only above 15 mph', async () => {
    await render(
      <DailyForecastSection
        days={[
          makeDay({ time: '2026-10-13', windSpeed: 15 }),
          makeDay({ time: '2026-10-14', windSpeed: 16 }),
          makeDay({ time: '2026-10-15', windSpeed: 30 }),
        ]}
        units="F"
      />
    );

    expect(screen.getAllByText('💨')).toHaveLength(2);
  });

  it('shows the icon for each day’s weather code', async () => {
    await render(
      <DailyForecastSection
        days={[
          makeDay({ time: '2026-10-13', weatherCode: 0 }),
          makeDay({ time: '2026-10-14', weatherCode: 63 }),
          makeDay({ time: '2026-10-15', weatherCode: 73 }),
          makeDay({ time: '2026-10-16', weatherCode: 95 }),
        ]}
        units="F"
      />
    );

    expect(screen.getByText('☀️')).toBeOnTheScreen();
    expect(screen.getByText('🌧️')).toBeOnTheScreen();
    expect(screen.getByText('❄️')).toBeOnTheScreen();
    expect(screen.getByText('⛈️')).toBeOnTheScreen();
  });

  it('renders only the title when there are no days', async () => {
    await render(<DailyForecastSection days={[]} units="F" />);

    expect(screen.getByText('10-day forecast')).toBeOnTheScreen();
    expect(screen.queryByText('Today')).toBeNull();
  });
});
