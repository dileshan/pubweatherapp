# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

My Weather App — a single-screen Expo (SDK 54) / React Native 0.81 / React 19 weather app written in TypeScript (strict). Portrait only, dark UI. Bundle/package id `com.myweather.app`.

## Commands

```bash
npm install
npm run start        # expo start --clear
npm run android      # runs scripts/start-android.ps1 (Windows-only, see below)
npm run ios          # expo start --ios
npm run web          # expo start --web
npm run typecheck    # tsc --noEmit
npm test             # jest (all tests)
npm run test:coverage # jest --coverage, fails below the thresholds
npm run build        # expo export --platform android (JS bundle into dist/)
npm test -- HourlyWind              # one file, by path pattern
npm test -- -t "converts temperatures" # tests matching a name
npm run lint         # eslint . (eslint-config-expo flat config)
npm run format       # prettier --write .
npm run format:check
```

Verify changes with `npm test`, `npm run typecheck`, and `npm run lint`. Only `src/` has tests (components under `tests/components/`, helpers in `tests/weather.test.ts`); `App.tsx` (fetching, location, search) is untested, so check changes there by running the app.

`npm run android` goes through [scripts/start-android.ps1](scripts/start-android.ps1), which locates the Android SDK (`ANDROID_HOME`, else `%LOCALAPPDATA%\Android\Sdk`), fails fast if `adb.exe`/`emulator.exe` are missing, puts them on `PATH`, then runs `expo start --android`. On non-Windows machines call `npx expo start --android` directly.

Builds use EAS ([eas.json](eas.json)): `development` (dev client), `preview` (internal distribution, installable APK), `production` (auto-incremented version, remote version source). Example: `npx eas-cli@latest build --platform android --profile preview`. See [README.md](README.md) for the full build/submit steps.

## Architecture

Entry point is `expo/AppEntry`, which loads [App.tsx](App.tsx). There is no navigation, state library, or API layer.

- [App.tsx](App.tsx) — the single screen. Owns all state and side effects (location resolution, city search, weather fetch, AsyncStorage) and renders the header, search box, and hero card, then composes the four sections below.
- [src/components/](src/components/) — presentational sections with no state or data fetching. Each renders its own `SectionTitle`, owns its `StyleSheet`, and accepts an optional `title` override:
  - `HourlyForecastSection` — props `hours`, `units`, `loading` (shows a spinner in the heading).
  - `DailyForecastSection` — props `days`, `units`. Contains the private `PrecipitationProbabilityDetail` and `IsWindyDetail` slots.
  - `CurrentConditionsSection` — props `conditions` (a `Pick` of `WeatherSnapshot`, so the whole snapshot can be passed), `units`. Contains the private `Detail` card.
  - `HourlyWindSection` — props `hours`.
  - `SectionTitle` — shared heading with an optional `action` node.
- [src/types.ts](src/types.ts) — `Units`, `HourlyForecast`, `DailyForecast`, `WeatherSnapshot`, `SavedLocation`, `GeocodingResult`. The data types are named `HourlyForecast`/`DailyForecast`, which is why the components carry a `Section` suffix.
- [src/weather.ts](src/weather.ts) — pure helpers: `convertTemperature`, `weatherIcon`, `weatherDescription`, `hourlyLabel`, `dailyLabel`, `isNightHour`, `degreesToDirection`, `degreesToEmoji`.
- [tests/](tests/) — all unit tests, kept out of `src/`. The folder mirrors `src/`: [tests/components/](tests/components/) has one `*.test.tsx` per component, and [tests/fixtures.ts](tests/fixtures.ts) has the `makeHour`/`makeDay` builders. Jest picks tests up by the `.test.ts(x)` suffix, so helper files in `tests/` must not use it.

Components use named exports and take raw forecast data plus `units`; they do their own label/icon/unit formatting through `src/weather.ts`. Follow that pattern for new sections rather than pre-formatting data in `App.tsx`.

### Data sources (both keyless Open-Meteo)

- Forecast: `api.open-meteo.com/v1/forecast` — current, hourly, and 10-day daily fields in one request, with `timezone=auto`.
- City search: `geocoding-api.open-meteo.com/v1/search` — debounced 250 ms, minimum 2 characters, up to 8 results.

The Postman collection in [postman/](postman/) mirrors both requests for manual testing. Keep it in sync when the query parameters in `App.tsx` change.

### Location resolution

`loadWeather` picks the active location in this order:

1. Saved city — chosen from search, persisted in AsyncStorage under `@my-weather-app/saved-location`.
2. Device location — `expo-location`, foreground permission, reverse-geocoded for the label.
3. `DEFAULT_LOCATION` (Denver) — when location services are off, permission is denied, or lookup throws.

Tapping the × beside the location name clears the saved city and falls back to device location. On startup the saved location is restored first; the `locationReady` flag gates the initial weather fetch until that finishes.

### Things to know before editing

- **Units:** the API is always queried in °F and mph, and `WeatherSnapshot` stores °F. The °F/°C toggle converts at render time via `convertTemperature(value, units)` in [src/weather.ts](src/weather.ts) (wrapped as `temp()` inside `App`). Any new temperature value must go through it when displayed; wind and pressure (hPa) are never converted.
- **Stale requests:** `weatherRequest` (a ref counter) guards against out-of-order responses. Any new `await` in `loadWeather` that precedes a `setState` needs the `requestId !== weatherRequest.current` check after it.
- **Failure mode:** fetch errors are logged and swallowed, leaving the previous snapshot (initially `defaultWeather`, which has empty `hourly`/`daily`) on screen. There is no error UI.
- **Times:** Open-Meteo returns local ISO strings without an offset. Hour labels and day/night icon selection parse the hour with `time.slice(11, 13)` rather than `Date` (`hourlyLabel`, `isNightHour`), deliberately avoiding device-timezone conversion. Night is hour < 6 or >= 18.
- **Weather codes:** WMO codes map to an emoji in `weatherIcon` (by range) and to text in `weatherDescription` (by exact code). A new code needs both.
- **Daily row layout:** in `DailyForecastSection`, the 10-day rows align as columns using fixed-width slots (`dayName`, `dayPrecipitationSlot`, `dayIcon`, `dayWindySlot`, `range`). The precipitation and windy slots always render their wrapper `View` even when empty so columns stay aligned; keep that pattern when adding a column. Thresholds: precipitation shown above 1%, 💨 shown above 15 mph.

## Testing

Jest with the `jest-expo` preset (configured in `package.json`) and React Native Testing Library v14.

- RNTL v14 is async: `await render(...)` and `await rerender(...)`. It runs on `test-renderer`, not `react-test-renderer`, and has no `UNSAFE_*ByType` queries — find elements by text, role, or accessibility label.
- Tests assert on rendered text, so they double as a spec for display rules (labels, unit conversion, the precipitation and windy thresholds). Build inputs with `makeHour`/`makeDay` and override only the fields the test is about.
- Fixture timestamps are fixed strings; nothing depends on the current date.

### Coverage and CI

Coverage is collected from `src/**` only (`src/types.ts` excluded; `App.tsx` is not measured) and must stay at or above 90% for statements, branches, functions, and lines — set in `jest.coverageThreshold` in `package.json`. It is currently 100%, so new code in `src/` needs tests to keep CI green.

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on pushes to `main` and on pull requests, with two jobs on Node 24: **Build** (`typecheck`, `lint`, `build`) and **Test and coverage** (`test:coverage`, uploading `coverage/` as an artifact). `build` is a Metro JS bundle, not a native EAS build. `format:check` is not part of CI.

## Conventions

- Prettier ([.prettierrc.json](.prettierrc.json)): 120-column width, single quotes, semicolons, 2-space indent, ES5 trailing commas, LF line endings.
- Styling is a `StyleSheet` at the bottom of each file with hard-coded hex colors from a blue/teal palette (background `#112d42`, cards `#1a3a50`, highlighted cards `#2c6681`); there is no theme module.
- Interactive elements carry `accessibilityRole` and `accessibilityLabel`; keep that up for new controls.
- Static assets are in [assets/](assets/) and loaded with `require()`.
