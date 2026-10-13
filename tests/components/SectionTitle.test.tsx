import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { SectionTitle } from '../../src/components/SectionTitle';

describe('SectionTitle', () => {
  it('renders the title', async () => {
    await render(<SectionTitle title="Hourly forecast" />);

    expect(screen.getByText('Hourly forecast')).toBeOnTheScreen();
  });

  it('renders the action beside the title', async () => {
    await render(<SectionTitle title="Hourly forecast" action={<Text>Refreshing</Text>} />);

    expect(screen.getByText('Refreshing')).toBeOnTheScreen();
  });
});
