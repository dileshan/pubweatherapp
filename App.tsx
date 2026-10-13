import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from 'react-native';

import { CurrentConditionsSection } from './src/components/CurrentConditionsSection';
import { DailyForecastSection } from './src/components/DailyForecastSection';
import { HourlyForecastSection } from './src/components/HourlyForecastSection';
import { HourlyWindSection } from './src/components/HourlyWindSection';
import type { GeocodingResult, SavedLocation, Units, WeatherSnapshot } from './src/types';
import { convertTemperature, weatherDescription, weatherIcon } from './src/weather';

const SAVED_LOCATION_KEY = '@my-weather-app/saved-location';
const DEFAULT_LOCATION: SavedLocation = {
  // Kept as the original app fallback for devices without a usable location.
  name: 'Denver',
  region: 'Colorado',
  latitude: 39.094393,
  longitude: -104.869855,
};

const defaultWeather: WeatherSnapshot = {
  temperature: 71,
  apparentTemperature: 71,
  high: 71,
  low: 55,
  humidity: 42,
  pressure: 1014,
  dewPoint: 45,
  windSpeed: 0,
  windDirection: 225,
  weatherCode: 0,
  time: new Date().toISOString(),
  hourly: [],
  daily: [],
};

async function hasServicesEnabledAsync() {
  try {
    return await Location.hasServicesEnabledAsync();
  } catch (e) {
    console.error('Location Services Failed: ' + e);
    return false;
  }
}

function locationLabel(location: Pick<SavedLocation, 'name' | 'region'>) {
  return [location.name, location.region].filter(Boolean).join(', ');
}

async function getDeviceLocationAsync(): Promise<SavedLocation | null> {
  const locationServicesEnabled = await hasServicesEnabledAsync();
  if (!locationServicesEnabled) return null;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return null;

  const deviceLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = deviceLocation.coords;

  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return {
      name: place?.city || place?.subregion || place?.district || 'Current location',
      region: place?.region || '',
      latitude,
      longitude,
    };
  } catch {
    return { name: 'Current location', region: '', latitude, longitude };
  }
}

function App() {
  const [units, setUnits] = useState<Units>('F');
  const [weather, setWeather] = useState<WeatherSnapshot>(defaultWeather);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [locationName, setLocationName] = useState(locationLabel(DEFAULT_LOCATION));
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const weatherRequest = useRef(0);

  const loadWeather = useCallback(
    async (savedLocation: SavedLocation | null = selectedLocation) => {
      const requestId = ++weatherRequest.current;
      setRefreshing(true);
      try {
        // A saved city wins. Without one, use the phone; retain the original default as a last resort.
        const activeLocation = savedLocation || (await getDeviceLocationAsync().catch(() => null)) || DEFAULT_LOCATION;
        if (requestId !== weatherRequest.current) return;
        setLocationName(locationLabel(activeLocation));

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${activeLocation.latitude}&longitude=${activeLocation.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,dew_point_2m,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,wind_speed_10m_max&forecast_days=10&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
        );
        if (!response.ok) throw new Error('Weather service unavailable');
        const result = await response.json();
        const current = result.current;
        const currentHour = `${current.time.slice(0, 13)}:00`;
        const firstHourlyIndex = Math.max(
          0,
          result.hourly.time.findIndex((time: string) => time >= currentHour)
        );
        if (requestId !== weatherRequest.current) return;
        setWeather({
          temperature: Math.round(current.temperature_2m),
          apparentTemperature: Math.round(current.apparent_temperature),
          high: Math.round(result.daily.temperature_2m_max[0]),
          low: Math.round(result.daily.temperature_2m_min[0]),
          humidity: Math.round(current.relative_humidity_2m),
          pressure: Math.round(current.surface_pressure),
          dewPoint: Math.round(current.dew_point_2m),
          windSpeed: Math.round(current.wind_speed_10m),
          windDirection: Math.round(current.wind_direction_10m),
          weatherCode: current.weather_code,
          time: current.time,
          hourly: result.hourly.time
            .slice(firstHourlyIndex, firstHourlyIndex + 12)
            .map((time: string, index: number) => ({
              time,
              temperature: Math.round(result.hourly.temperature_2m[firstHourlyIndex + index]),
              precipitationProbability: Math.round(
                result.hourly.precipitation_probability[firstHourlyIndex + index] ?? 0
              ),
              weatherCode: result.hourly.weather_code[firstHourlyIndex + index],
              windSpeed: Math.round(result.hourly.wind_speed_10m[firstHourlyIndex + index]),
              windDirection: Math.round(result.hourly.wind_direction_10m[firstHourlyIndex + index]),
              windGusts: Math.round(result.hourly.wind_gusts_10m[firstHourlyIndex + index]),
            })),
          daily: result.daily.time.slice(0, 10).map((time: string, index: number) => ({
            time,
            high: Math.round(result.daily.temperature_2m_max[index]),
            low: Math.round(result.daily.temperature_2m_min[index]),
            precipitationProbability: Math.round(result.daily.precipitation_probability_max[index] ?? 0),
            weatherCode: result.daily.weather_code[index],
            windSpeed: Math.round(result.daily.wind_speed_10m_max[index] ?? 0),
          })),
        });
      } catch (execption) {
        // The friendly default makes the app usable without a network connection.
        console.error(execption);
      } finally {
        if (requestId === weatherRequest.current) setRefreshing(false);
      }
    },
    [selectedLocation]
  );

  useEffect(() => {
    async function restoreSavedLocation() {
      try {
        const value = await AsyncStorage.getItem(SAVED_LOCATION_KEY);
        if (value) {
          const location = JSON.parse(value) as SavedLocation;
          if (Number.isFinite(location.latitude) && Number.isFinite(location.longitude) && location.name) {
            setSelectedLocation(location);
          }
        }
      } catch (error) {
        console.warn('Could not restore saved location', error);
      } finally {
        setLocationReady(true);
      }
    }

    restoreSavedLocation();
  }, []);

  useEffect(() => {
    if (!locationReady) return;

    // Defer the network-driven state update until after this render commits.
    const timer = setTimeout(() => {
      void loadWeather(selectedLocation);
    }, 0);

    return () => clearTimeout(timer);
  }, [loadWeather, locationReady, selectedLocation]);

  useEffect(() => {
    const query = searchText.trim();
    if (query.length < 2) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
        );
        if (!response.ok) throw new Error('Location search unavailable');
        const result = (await response.json()) as { results?: GeocodingResult[] };
        if (!cancelled) setSearchResults(result.results || []);
      } catch (error) {
        if (!cancelled) {
          console.warn('Location search failed', error);
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchText]);

  const handleSearchTextChange = useCallback((value: string) => {
    setSearchText(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
    }
  }, []);

  const saveLocation = useCallback(async (result: GeocodingResult) => {
    const location: SavedLocation = {
      name: result.name,
      region: result.admin1 || result.country || '',
      latitude: result.latitude,
      longitude: result.longitude,
    };
    setSelectedLocation(location);
    setLocationName(locationLabel(location));
    setSearchText('');
    setSearchResults([]);
    try {
      await AsyncStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(location));
    } catch (error) {
      console.warn('Could not save selected location', error);
    }
  }, []);

  const clearSavedLocation = useCallback(async () => {
    setSelectedLocation(null);
    try {
      await AsyncStorage.removeItem(SAVED_LOCATION_KEY);
    } catch (error) {
      console.warn('Could not clear selected location', error);
    }
  }, []);

  const temp = useCallback((value: number) => convertTemperature(value, units), [units]);
  const currentTime = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(
        new Date(weather.time)
      ),
    [weather.time]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadWeather} tintColor="#d9f4ff" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.brand}>My Weather App</Text>
            <View style={styles.locationLine}>
              <Text style={styles.location}>{locationName}</Text>
              {selectedLocation && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${locationName} and use this phone's location`}
                  hitSlop={10}
                  onPress={clearSavedLocation}
                  style={styles.removeLocationButton}
                >
                  <Text style={styles.removeLocationText}>×</Text>
                </Pressable>
              )}
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch temperature units"
            onPress={() => setUnits((current) => (current === 'F' ? 'C' : 'F'))}
            style={styles.unitToggle}
          >
            <Text style={[styles.unit, units === 'F' && styles.unitActive]}>°F</Text>
            <Text style={[styles.unit, units === 'C' && styles.unitActive]}>°C</Text>
          </Pressable>
        </View>

        <View style={styles.locationSearch}>
          <TextInput
            accessibilityLabel="Search for a city"
            autoCapitalize="words"
            autoCorrect={false}
            clearButtonMode="while-editing"
            onChangeText={handleSearchTextChange}
            placeholder="Search city or state"
            placeholderTextColor="#83a9b9"
            style={styles.locationInput}
            value={searchText}
          />
          {searching && <ActivityIndicator color="#bde9ff" style={styles.searchSpinner} />}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((result) => {
                const resultLabel = [result.name, result.admin1 || result.country].filter(Boolean).join(', ');
                return (
                  <View key={result.id} style={styles.searchResultRow}>
                    <Text numberOfLines={1} style={styles.searchResultName}>
                      {resultLabel}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Set ${resultLabel} as current location`}
                      onPress={() => saveLocation(result)}
                      style={styles.addLocationButton}
                    >
                      <Text style={styles.addLocationText}>+</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
          {searchText.trim().length >= 2 && !searching && searchResults.length === 0 && (
            <Text style={styles.noSearchResults}>No locations found</Text>
          )}
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.now}>NOW · {currentTime}</Text>
            <View style={styles.temperatureRow}>
              <Text style={styles.temperature}>{temp(weather.temperature)}°</Text>
              <View style={styles.highLow}>
                <Text style={styles.highLowText}>High: {temp(weather.high)}°</Text>
                <Text style={styles.highLowText}>Low: {temp(weather.low)}°</Text>
              </View>
            </View>
            <Text style={styles.condition}>{weatherDescription(weather.weatherCode)}</Text>
            <Text style={styles.feels}>Feels like {temp(weather.apparentTemperature)}°</Text>
          </View>
          <View style={styles.currentWeatherScene}>
            <Text style={styles.weatherEmoji}>{weatherIcon(weather.weatherCode)}</Text>
            <View style={styles.hill} />
            <View style={[styles.reed, { left: 26, height: 20 }]} />
            <View style={[styles.reed, { left: 52, height: 32 }]} />
            <View style={[styles.reed, { left: 76, height: 25 }]} />
          </View>
        </View>

        <HourlyForecastSection hours={weather.hourly} units={units} loading={refreshing} />
        <DailyForecastSection days={weather.daily} units={units} />
        <CurrentConditionsSection conditions={weather} units={units} />
        <HourlyWindSection hours={weather.hourly} />
        <Text style={styles.footer}>Pull down anytime to refresh.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#112d42' },
  screen: { flex: 1, backgroundColor: '#112d42' },
  content: { padding: 20, paddingBottom: 36 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  brand: { color: '#effbff', fontSize: 23, fontWeight: '800', letterSpacing: -0.5, marginTop: 50 },
  location: { color: '#a7c7d5', fontSize: 14, marginTop: 2 },
  locationLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  removeLocationButton: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#31566a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  removeLocationText: { color: '#e6f8ff', fontSize: 19, lineHeight: 20, fontWeight: '500' },
  unitToggle: { flexDirection: 'row', backgroundColor: '#25475d', borderRadius: 18, padding: 3, marginTop: 50 },
  locationSearch: { marginBottom: 18, position: 'relative', zIndex: 3 },
  locationInput: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1a3a50',
    color: '#effbff',
    fontSize: 15,
    paddingHorizontal: 15,
    paddingRight: 44,
    borderWidth: 1,
    borderColor: '#315a70',
  },
  searchSpinner: { position: 'absolute', right: 14, top: 13 },
  searchResults: {
    backgroundColor: '#1a3a50',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#315a70',
    marginTop: 7,
    overflow: 'hidden',
  },
  searchResultRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a5064',
  },
  searchResultName: { flex: 1, color: '#effbff', fontSize: 15, fontWeight: '700', paddingRight: 10 },
  addLocationButton: {
    width: 52,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c6681',
  },
  addLocationText: { color: '#e8faff', fontSize: 27, lineHeight: 29, fontWeight: '400' },
  noSearchResults: { color: '#a7c7d5', fontSize: 13, marginTop: 8, marginLeft: 4 },
  unit: { color: '#acc9d5', fontWeight: '700', paddingHorizontal: 9, paddingVertical: 5, fontSize: 13 },
  unitActive: { backgroundColor: '#d8f4ff', color: '#153649', borderRadius: 14 },
  hero: {
    minHeight: 228,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#32739a',
    marginBottom: 25,
    padding: 20,
    justifyContent: 'space-between',
  },
  heroCopy: { zIndex: 2 },
  now: { color: '#d9f4ff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  temperatureRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  temperature: { color: '#fff', fontSize: 84, lineHeight: 94, fontWeight: '200', letterSpacing: -5 },
  highLow: { marginLeft: 13, gap: 3 },
  highLowText: { color: '#d8f4ff', fontSize: 14, fontWeight: '700' },
  condition: { color: '#fff', fontSize: 18, fontWeight: '700' },
  feels: { color: '#d9f4ff', fontSize: 14, marginTop: 4 },
  currentWeatherScene: { position: 'absolute', right: 0, bottom: 0, width: 188, height: 184 },
  weatherEmoji: { fontSize: 38, position: 'absolute', top: 5, right: 40 },
  hill: {
    position: 'absolute',
    height: 76,
    width: 240,
    backgroundColor: '#1f755e',
    borderTopLeftRadius: 130,
    borderTopRightRadius: 120,
    bottom: -40,
    right: -55,
  },
  reed: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    backgroundColor: '#144f42',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  footer: { color: '#88aeba', textAlign: 'center', fontSize: 12, marginTop: 24 }
});

export default App;
