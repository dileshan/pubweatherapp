import { render, screen } from '@testing-library/react-native';

import { HourlyForecastSection } from '../../src/components/HourlyForecastSection';
import { makeHour } from '../fixtures';

const hours = [
  makeHour({ time: '2026-10-13T14:00', temperature: 68, precipitationProbability: 20 }),
  makeHour({ time: '2026-10-13T15:00', temperature: 50, precipitationProbability: 35 }),
  makeHour({ time: '2026-10-13T20:00', temperature: 41, precipitationProbability: 0 }),
];

describe('HourlyForecastSection', () => {
  it('renders the default title', async () => {
    await render(<HourlyForecastSection hours={hours} units="F" />);

    expect(screen.getByText('Hourly forecast')).toBeOnTheScreen();
  });

  it('renders a custom title', async () => {
    await render(<HourlyForecastSection hours={hours} units="F" title="Next few hours" />);

    expect(screen.getByText('Next few hours')).toBeOnTheScreen();
    expect(screen.queryByText('Hourly forecast')).toBeNull();
  });

  it('labels the first hour as Now and the rest by clock time', async () => {
    await render(<HourlyForecastSection hours={hours} units="F" />);

    expect(screen.getByText('Now')).toBeOnTheScreen();
    expect(screen.getByText('3 PM')).toBeOnTheScreen();
    expect(screen.getByText('8 PM')).toBeOnTheScreen();
    expect(screen.queryByText('2 PM')).toBeNull();
  });

  it('shows temperatures in Fahrenheit', async () => {
    await render(<HourlyForecastSection hours={hours} units="F" />);

    expect(screen.getByText('68°')).toBeOnTheScreen();
    expect(screen.getByText('50°')).toBeOnTheScreen();
    expect(screen.getByText('41°')).toBeOnTheScreen();
  });

  it('converts temperatures to Celsius', async () => {
    await render(<HourlyForecastSection hours={hours} units="C" />);

    expect(screen.getByText('20°')).toBeOnTheScreen();
    expect(screen.getByText('10°')).toBeOnTheScreen();
    expect(screen.getByText('5°')).toBeOnTheScreen();
  });

  it('shows the precipitation probability for each hour', async () => {
    await render(<HourlyForecastSection hours={hours} units="F" />);

    expect(screen.getByText('💧 20%')).toBeOnTheScreen();
    expect(screen.getByText('💧 35%')).toBeOnTheScreen();
    expect(screen.getByText('💧 0%')).toBeOnTheScreen();
  });

  it('uses the sun for clear daytime hours and the moon for clear night hours', async () => {
    await render(<HourlyForecastSection hours={hours} units="F" />);

    expect(screen.getAllByText('☀️')).toHaveLength(2);
    expect(screen.getAllByText('🌙')).toHaveLength(1);
  });

  it('shows a spinner only while loading', async () => {
    const { rerender } = await render(<HourlyForecastSection hours={hours} units="F" />);
    expect(screen.queryByLabelText('Loading forecast')).toBeNull();

    await rerender(<HourlyForecastSection hours={hours} units="F" loading />);
    expect(screen.queryByLabelText('Loading forecast')).not.toBeNull();
  });

  it('renders only the title when there are no hours', async () => {
    await render(<HourlyForecastSection hours={[]} units="F" />);

    expect(screen.getByText('Hourly forecast')).toBeOnTheScreen();
    expect(screen.queryByText('Now')).toBeNull();
  });
});
