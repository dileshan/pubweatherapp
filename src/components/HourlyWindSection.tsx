import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { HourlyForecast } from '../types';
import { degreesToDirection, degreesToEmoji, hourlyLabel } from '../weather';
import { SectionTitle } from './SectionTitle';

type HourlyWindSectionProps = {
  hours: HourlyForecast[];
  title?: string;
};

export function HourlyWindSection({ hours, title = 'Hourly wind' }: HourlyWindSectionProps) {
  return (
    <>
      <SectionTitle title={title} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.windList}>
        {hours.map((hour, index) => (
          <View key={hour.time} style={[styles.windCard, index === 0 && styles.windCardCurrent]}>
            <Text style={styles.windTime}>{hourlyLabel(hour.time, index)}</Text>
            <Text style={styles.windDirection}>
              {hour.windDirection}° {degreesToDirection(hour.windDirection)} {degreesToEmoji(hour.windDirection)}
            </Text>
            <Text style={styles.windSpeed}>{hour.windSpeed} mph</Text>
            <Text style={styles.windGusts}>Gusts {hour.windGusts} mph</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  windList: { gap: 10, paddingBottom: 27 },
  windCard: { width: 126, backgroundColor: '#1a3a50', borderRadius: 17, padding: 13 },
  windCardCurrent: { backgroundColor: '#2c6681' },
  windTime: { color: '#a8c8d6', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  windDirection: { color: '#d9f4ff', fontSize: 13, fontWeight: '700' },
  windSpeed: { color: '#f5fbff', fontSize: 18, fontWeight: '800', marginTop: 5 },
  windGusts: { color: '#8ed8f3', fontSize: 12, fontWeight: '700', marginTop: 4 },
});
