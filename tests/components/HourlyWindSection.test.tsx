import { render, screen } from '@testing-library/react-native';

import { HourlyWindSection } from '../../src/components/HourlyWindSection';
import { makeHour } from '../fixtures';

const hours = [
  makeHour({ time: '2026-10-13T09:00', windSpeed: 8, windDirection: 225, windGusts: 14 }),
  makeHour({ time: '2026-10-13T10:00', windSpeed: 11, windDirection: 90, windGusts: 21 }),
  makeHour({ time: '2026-10-14T00:00', windSpeed: 3, windDirection: 0, windGusts: 6 }),
];

describe('HourlyWindSection', () => {
  it('renders the default title', async () => {
    await render(<HourlyWindSection hours={hours} />);

    expect(screen.getByText('Hourly wind')).toBeOnTheScreen();
  });

  it('renders a custom title', async () => {
    await render(<HourlyWindSection hours={hours} title="Wind" />);

    expect(screen.getByText('Wind')).toBeOnTheScreen();
    expect(screen.queryByText('Hourly wind')).toBeNull();
  });

  it('labels the first hour as Now and the rest by clock time', async () => {
    await render(<HourlyWindSection hours={hours} />);

    expect(screen.getByText('Now')).toBeOnTheScreen();
    expect(screen.getByText('10 AM')).toBeOnTheScreen();
    expect(screen.getByText('12 AM')).toBeOnTheScreen();
  });

  it('shows the speed and gusts for each hour', async () => {
    await render(<HourlyWindSection hours={hours} />);

    expect(screen.getByText('8 mph')).toBeOnTheScreen();
    expect(screen.getByText('Gusts 14 mph')).toBeOnTheScreen();
    expect(screen.getByText('11 mph')).toBeOnTheScreen();
    expect(screen.getByText('Gusts 21 mph')).toBeOnTheScreen();
    expect(screen.getByText('3 mph')).toBeOnTheScreen();
    expect(screen.getByText('Gusts 6 mph')).toBeOnTheScreen();
  });

  it('shows the direction in degrees, compass point, and arrow', async () => {
    await render(<HourlyWindSection hours={hours} />);

    expect(screen.getByText('225° SW ↗︎')).toBeOnTheScreen();
    expect(screen.getByText('90° E ←')).toBeOnTheScreen();
    expect(screen.getByText('0° N ↓')).toBeOnTheScreen();
  });

  it('renders only the title when there are no hours', async () => {
    await render(<HourlyWindSection hours={[]} />);

    expect(screen.getByText('Hourly wind')).toBeOnTheScreen();
    expect(screen.queryByText('Now')).toBeNull();
  });
});
