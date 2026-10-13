import { StyleSheet, Text, View } from 'react-native';

import type { DailyForecast, Units } from '../types';
import { convertTemperature, dailyLabel, weatherIcon } from '../weather';
import { SectionTitle } from './SectionTitle';

type DailyForecastSectionProps = {
  days: DailyForecast[];
  units: Units;
  title?: string;
};

export function DailyForecastSection({ days, units, title = '10-day forecast' }: DailyForecastSectionProps) {
  return (
    <>
      <SectionTitle title={title} />
      <View style={styles.forecastCard}>
        {days.map((day, index) => (
          <View key={day.time} style={[styles.dayRow, index < days.length - 1 && styles.dayBorder]}>
            <Text style={styles.dayName}>{dailyLabel(day.time, index)}</Text>
            <PrecipitationProbabilityDetail probability={day.precipitationProbability} />
            <Text style={styles.dayIcon}>{weatherIcon(day.weatherCode)}</Text>
            <IsWindyDetail speed={day.windSpeed} />
            <View style={styles.range}>
              <Text style={styles.dayHigh}>{convertTemperature(day.high, units)}°</Text>
              <Text style={styles.highLowDivide}>/</Text>
              <Text style={styles.lowTemp}>{convertTemperature(day.low, units)}°</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function PrecipitationProbabilityDetail({ probability }: { probability: number }) {
  return (
    <View style={styles.dayPrecipitationSlot}>
      {probability > 1 && <Text style={styles.dayPrecipitation}>{probability}%</Text>}
    </View>
  );
}

function IsWindyDetail({ speed }: { speed: number }) {
  return <View style={styles.dayWindySlot}>{speed > 15 && <Text style={styles.dayWindy}>💨</Text>}</View>;
}

const styles = StyleSheet.create({
  forecastCard: { backgroundColor: '#19394f', borderRadius: 19, overflow: 'hidden', marginBottom: 28 },
  dayRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  dayBorder: { borderBottomWidth: 1, borderBottomColor: '#2a5064' },
  dayName: { color: '#eaf8ff', fontSize: 14, fontWeight: '700', width: 80 },
  dayIcon: { fontSize: 20, width: 32, marginLeft: 8 },
  range: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 1 },
  lowTemp: { color: '#a2bfce', fontSize: 13, width: 25, textAlign: 'right' },
  dayPrecipitationSlot: { width: 75, alignItems: 'flex-end' },
  dayPrecipitation: { color: '#8ed8f3', fontSize: 12, fontWeight: '800' },
  dayHigh: { color: '#f2fbff', fontSize: 13, fontWeight: '700', width: 25 },
  highLowDivide: { color: '#f2fbff', fontSize: 13, fontWeight: '700' },
  dayWindySlot: { width: 24, alignItems: 'center' },
  dayWindy: { fontSize: 21, color: '#9edced' },
});
