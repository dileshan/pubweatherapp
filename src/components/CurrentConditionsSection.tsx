import { StyleSheet, Text, View } from 'react-native';

import type { Units, WeatherSnapshot } from '../types';
import { convertTemperature, degreesToDirection, degreesToEmoji } from '../weather';
import { SectionTitle } from './SectionTitle';

type CurrentConditionsSectionProps = {
  conditions: Pick<WeatherSnapshot, 'humidity' | 'dewPoint' | 'windSpeed' | 'windDirection' | 'pressure'>;
  units: Units;
  title?: string;
};

export function CurrentConditionsSection({
  conditions,
  units,
  title = 'Current Conditions',
}: CurrentConditionsSectionProps) {
  return (
    <>
      <SectionTitle title={title} />
      <View style={styles.detailsGrid}>
        <Detail label="Humidity" value={`${conditions.humidity}%`} emoji="💧" />
        <Detail label="Dew point" value={`${convertTemperature(conditions.dewPoint, units)}°`} emoji="💦" />
        <Detail label="Wind High" value={`${conditions.windSpeed} mph`} emoji="〰" />
        <Detail
          label="Wind direction"
          value={`${conditions.windDirection}° ${degreesToDirection(conditions.windDirection)}`}
          emoji={degreesToEmoji(conditions.windDirection)}
        />
        <Detail label="Pressure" value={`${conditions.pressure} hPa`} emoji="◌" />
      </View>
    </>
  );
}

function Detail({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailEmoji}>{emoji}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  detailCard: {
    width: '48.5%',
    minHeight: 112,
    backgroundColor: '#1a3a50',
    borderRadius: 17,
    padding: 13,
    justifyContent: 'space-between',
  },
  detailEmoji: { fontSize: 21, color: '#9edced' },
  detailLabel: { color: '#a6c5d2', fontSize: 12, fontWeight: '700', marginTop: 4 },
  detailValue: { color: '#f3fbff', fontSize: 17, fontWeight: '800', marginTop: 3 },
});
