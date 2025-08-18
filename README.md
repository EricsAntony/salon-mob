# Salon App Boilerplate (React Native + Expo + TypeScript)

## Tech Stack

- React Native (Expo SDK 53)
- TypeScript (strict)
- React Navigation (stack + tabs)
- Redux Toolkit + RTK Query
- React Native Paper (UI + theming)
- React Native Reanimated + Gesture Handler
- AsyncStorage + Redux Persist
- ESLint + Prettier + Husky

## Folder Structure

```
/salon-app
  └── src
      ├── api/
      ├── assets/
      ├── components/
      ├── constants/
      ├── hooks/
      ├── navigation/
      ├── screens/
      ├── store/
      ├── styles/
      ├── utils/
      └── App.tsx
```

## Getting Started

1. Copy `.env.example` to `.env` and set values.
2. Install deps:
   - `npm install`
3. Run app:
   - `npm run start`
   - `npm run android` or `npm run ios` or `npm run web`

## Scripts

- `npm run lint` – Lint code
- `npm run format` – Format with Prettier
- `npm run typecheck` – TypeScript check

## Environment

- Edit `.env`. Values are exposed via `app.config.ts` to `Constants.expoConfig.extra`.
- Access in code via `src/constants/config.ts`.

## Theming

- Light/Dark with React Native Paper (`src/styles/paperTheme.ts`).
- Global tokens in `src/styles/theme.ts` and `src/constants/colors.ts`.

## State & API

- Redux Toolkit store with persistence in `src/store`.
- RTK Query base in `src/api/baseApi.ts` with auth header.
- Dummy endpoints in `src/api/authApi.ts` and `src/api/bookingsApi.ts`.

## Navigation

- Root `AppNavigator` decides between Auth vs Main tabs.
- Tabs: Home (Salons), Bookings, Profile.

## Reanimated

- `babel.config.js` includes `react-native-reanimated/plugin` as last plugin.

## Code Quality

- ESLint + Prettier pre-commit via Husky + lint-staged.

## Notes

- Endpoints are placeholders. Point `API_URL` to your backend.
- Add real screens and business logic as needed.
