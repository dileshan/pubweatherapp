import { render, screen } from '@testing-library/react-native';

import { CurrentConditionsSection } from '../../src/components/CurrentConditionsSection';

const conditions = {
  humidity: 42,
  dewPoint: 50,
  windSpeed: 12,
  windDirection: 225,
  pressure: 1014,
};

describe('CurrentConditionsSection', () => {
  it('renders the default title', async () => {
    await render(<CurrentConditionsSection conditions={conditions} units="F" />);

    expect(screen.getByText('Current Conditions')).toBeOnTheScreen();
  });

  it('renders a custom title', async () => {
    await render(<CurrentConditionsSection conditions={conditions} units="F" title="Right now" />);

    expect(screen.getByText('Right now')).toBeOnTheScreen();
    expect(screen.queryByText('Current Conditions')).toBeNull();
  });

  it('renders a labelled card for each condition', async () => {
    await render(<CurrentConditionsSection conditions={conditions} units="F" />);

    expect(screen.getByText('Humidity')).toBeOnTheScreen();
    expect(screen.getByText('42%')).toBeOnTheScreen();
    expect(screen.getByText('Dew point')).toBeOnTheScreen();
    expect(screen.getByText('50°')).toBeOnTheScreen();
    expect(screen.getByText('Wind High')).toBeOnTheScreen();
    expect(screen.getByText('12 mph')).toBeOnTheScreen();
    expect(screen.getByText('Wind direction')).toBeOnTheScreen();
    expect(screen.getByText('225° SW')).toBeOnTheScreen();
    expect(screen.getByText('Pressure')).toBeOnTheScreen();
    expect(screen.getByText('1014 hPa')).toBeOnTheScreen();
  });

  it('converts only the dew point to Celsius', async () => {
    await render(<CurrentConditionsSection conditions={conditions} units="C" />);

    expect(screen.getByText('10°')).toBeOnTheScreen();
    expect(screen.getByText('12 mph')).toBeOnTheScreen();
    expect(screen.getByText('1014 hPa')).toBeOnTheScreen();
  });

  it.each([
    [0, 'N', '↓'],
    [90, 'E', '←'],
    [180, 'S', '↑'],
    [270, 'W', '→'],
    [350, 'N', '↓'],
  ])('describes a wind direction of %i° as %s with a %s arrow', async (windDirection, compass, arrow) => {
    await render(<CurrentConditionsSection conditions={{ ...conditions, windDirection }} units="F" />);

    expect(screen.getByText(`${windDirection}° ${compass}`)).toBeOnTheScreen();
    expect(screen.getByText(arrow)).toBeOnTheScreen();
  });
});
