# My Weather App

A cross-platform Expo weather app that doesn't have ads! The landing screen includes the current temperature, daily high and low, feels-like temperature, hourly forecast, 10-day outlook, humidity, pressure, dew point, wind speed, and wind direction.

The app starts and loads a saved city if there is one persisted in AsyncStorage local then proceeds if the location permission is set pull the phone's locaiton and if not uses default values in the app (which is Denver).  then the app uses that. Pulls data from the keyless Open-Meteo service when a connection is available. Pull down to refresh, or tap the temperature-unit control to switch between Fahrenheit and Celsius.

## Run it

```bash
npm install
npm run start
```

Then open the Expo development link on an iOS or Android device, or run `npm run ios` / `npm run android` with an emulator connected.

## Project layout

- `App.tsx` — the screen: location lookup, city search, weather fetching, header, and hero card.
- `src/components/` — reusable forecast sections, each with its own styles:
  - `HourlyForecastSection` — horizontal list of hourly temperature, icon, and rain chance.
  - `DailyForecastSection` — the 10-day high/low list.
  - `CurrentConditionsSection` — humidity, dew point, wind, and pressure cards.
  - `HourlyWindSection` — horizontal list of hourly wind speed, direction, and gusts.
  - `SectionTitle` — the heading shared by the sections.
- `src/types.ts` — shared weather and location types.
- `src/weather.ts` — formatting helpers (weather-code icons and descriptions, labels, wind direction, unit conversion).
- `tests/` — unit tests, mirroring `src/`: `tests/components/` has one test file per component and `tests/fixtures.ts` holds shared test data builders.

Each section takes plain data and can be dropped into any screen:

```tsx
<HourlyForecastSection hours={weather.hourly} units={units} loading={refreshing} />
<DailyForecastSection days={weather.daily} units={units} />
<CurrentConditionsSection conditions={weather} units={units} />
<HourlyWindSection hours={weather.hourly} />
```

Temperatures are passed in Fahrenheit; the `units` prop controls how they are displayed. Every section also accepts an optional `title` to override its heading.

## Tests

Component tests use Jest (`jest-expo`) and React Native Testing Library.

```bash
npm test                    # run everything
npm test -- HourlyWind      # run one test file
npm test -- --watch         # re-run on change
npm run test:coverage       # run with a coverage report (written to coverage/)
```

Coverage is measured for the code in `src/` and must stay at or above 90%; `npm run test:coverage` fails otherwise.

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and on pushes to `main`:

- **Build** — typecheck, lint, and `npm run build`, which bundles the app's JavaScript for Android to confirm it compiles.
- **Test and coverage** — runs the tests, enforces the coverage threshold, and uploads the coverage report as a build artifact.

## Build with Expo

First login to expo and then run build configure, this will create a configuration file named `eas.json`. If this file already exists then skip the configure command.
```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Then build an installable APK using preview setting:
```bash
npx eas-cli@latest build --platform android --profile preview
```

For an iPhone, an internal install requires an Apple Developer membership and device registration:
```bash
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

When you’re ready for actual store release, use the production profile, then submit:
```bash
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest submit --platform android --latest
```

For iOS, replace android with ios; users install it through TestFlight rather than directly.
