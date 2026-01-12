# Offline-first Market Replay (Expo Router + SQLite + Zustand)

This app replays a market data stream offline using Expo + `expo-sqlite`, with UI built on Expo Router and Zustand for local state. It ships with bundled NDJSON + JSON snapshots in `assets/data/new_data` and applies them into SQLite while keeping UI in sync.

## Stack
- **Expo Router** (file-based navigation)
- **React Native 0.81 / React 19**
- **TypeScript (strict)**
- **expo-sqlite** for on-device storage
- **Zustand** for UI state slices
- **expo-asset + expo-file-system** to read bundled NDJSON/JSON seeds

## Installation
```bash
npm install
```

If you have a stale Metro cache, clear it:
```bash
npx expo start -c
```

## Running
```bash
npx expo start        # choose iOS / Android / Web or Expo Go
npm run ios           # shortcut to iOS simulator
npm run android       # shortcut to Android emulator
npm run web           # run in web target
npm run lint          # typecheck + lint
```

## Data workflow (high level)
1) **Bootstrap** (`playback/bootstrap.ts`)
   - Initializes SQLite schema (`db/schema.ts`).
   - Loads bundled markets/orderbooks/balances/ndjson events from `assets/data/new_data` via `playback/streamReader.ts`.
   - Seeds markets into SQLite and sets total event count in the playback store.

2) **Playback** (`playback/player.ts`)
   - Consumes `MarketEvent[]` produced by the stream reader.
   - Writes events to SQLite tables (`markets`, `orderbook_levels`, `trades`, `balances`).
   - Mirrors updates into Zustand stores so UI stays in sync (markets list, market detail orderbook/trades).

3) **UI**
   - Tabs: `app/(tabs)/markets.tsx`, `orders.tsx`, `wallet.tsx`.
   - Market detail: `app/market/[marketId].tsx` (orderbook + recent trades preview + playback controls).
   - Full trades: `app/market/[marketId]/trades.tsx` (all trades + playback controls).

## Directory overview
- `app/` — Routes (Expo Router). Tabs under `(tabs)/`, market detail under `market/[marketId].tsx` and `market/[marketId]/trades.tsx`.
- `playback/` — Stream reader (bundled data), player loop, bootstrap helpers.
- `db/` — SQLite init (`sqlite.ts`, `schema.ts`) and repos (`repos/*.ts`).
- `stores/` — Zustand slices for markets, market detail, playback, prefs.
- `assets/data/new_data/` — Seeds: markets.json, orderbook snapshots, balances, market_stream.ndjson.
- `components/` — Layout primitives, buttons, pills, etc.

## Resources used & how
- **expo-sqlite**: async DB (`db/sqlite.ts`), migrations (`db/schema.ts`), CRUD via repos.
- **expo-asset + expo-file-system**: load bundled JSON/NDJSON in `playback/streamReader.ts`.
- **Zustand**: local state slices for markets/playback/detail (`stores/*`).
- **Expo Router**: file-based navigation; tabs in `app/(tabs)/_layout.tsx`; stack root in `app/_layout.tsx`.
- **react-native-safe-area-context**: Safe area handling in layout components.

## App flow (user-facing)
- Launch → bootstrap seeds DB → Markets tab shows seeded markets.
- Tap a market → detail screen shows orderbook + recent trades and playback controls (Play/Pause/Restart).
- "See all" trades → navigates to full trades list with the same playback controls.

## Notes / tips
- If assets change, restart Metro with `npx expo start -c` to ensure new NDJSON/JSON are bundled.
- SQLite is local-only; to reset data, reinstall the app or bump the DB name in `db/sqlite.ts`.
- Lint/typecheck before committing: `npm run lint -- --max-warnings=0`.
