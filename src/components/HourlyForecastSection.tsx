import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { HourlyForecast, Units } from '../types';
import { convertTemperature, hourlyLabel, isNightHour, weatherIcon } from '../weather';
import { SectionTitle } from './SectionTitle';

type HourlyForecastSectionProps = {
  hours: HourlyForecast[];
  units: Units;
  loading?: boolean;
  title?: string;
};

export function HourlyForecastSection({
  hours,
  units,
  loading = false,
  title = 'Hourly forecast',
}: HourlyForecastSectionProps) {
  return (
    <>
      <SectionTitle
        title={title}
        action={loading ? <ActivityIndicator accessibilityLabel="Loading forecast" color="#bde9ff" /> : undefined}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyList}>
        {hours.map((hour, index) => (
          <View key={hour.time} style={[styles.hourCard, index === 0 && styles.hourCardCurrent]}>
            <Text style={styles.hourTemp}>{convertTemperature(hour.temperature, units)}°</Text>
            <Text style={styles.hourIcon}>{weatherIcon(hour.weatherCode, isNightHour(hour.time))}</Text>
            <Text style={styles.hourPrecipitation}>💧 {hour.precipitationProbability}%</Text>
            <Text style={styles.hourLabel}>{hourlyLabel(hour.time, index)}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  hourlyList: { gap: 10, paddingBottom: 27 },
  hourCard: { width: 76, alignItems: 'center', backgroundColor: '#1a3a50', paddingVertical: 13, borderRadius: 17 },
  hourCardCurrent: { backgroundColor: '#2c6681' },
  hourTemp: { color: '#f5fbff', fontWeight: '800', fontSize: 16 },
  hourIcon: { fontSize: 24, marginTop: 9 },
  hourPrecipitation: { color: '#8ed8f3', fontSize: 12, fontWeight: '800', marginTop: 2, marginBottom: 7 },
  hourLabel: { color: '#a8c8d6', fontSize: 12, fontWeight: '700' },
});
