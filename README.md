# Ludo — MERN Stack (Local Pass-and-Play)

A fully playable 2–4 player Ludo game built with **MongoDB, Express, React, Node**.
Play locally by passing the device around; log in to save your match history.
Responsive from phones to desktops — no separate mobile app needed, it's the same
React app served responsively.

## What's included

- **Full rules engine**: bringing pawns out on a 6, capturing on shared cells,
  safe/star cells, home stretch, exact-count-to-finish, three-6s-forfeits-turn,
  extra turn on 6, and full 4-player ranking (not just "first to finish wins").
- **Responsive SVG board** that scales from a small phone screen up to desktop,
  built with plain SVG (no canvas/image assets needed).
- **Auth (optional)**: register/login with JWT, so guests can play without an
  account, but logged-in users get their match history saved.
- **Match history API**: every finished game can POST its result; logged-in
  users can view their past games.

## Project structure

```
ludo-mern/
├── backend/     Express + MongoDB API (auth + match history)
└── frontend/    React (Vite) app — the game itself
```

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET if needed
npm run dev                # or: npm start
```

Requires a MongoDB instance — either local (`mongodb://127.0.0.1:27017/ludo`)
or a connection string from MongoDB Atlas.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # point VITE_API_URL at your backend if not localhost
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`) — on your
phone, use `http://<your-computer's-LAN-IP>:5173` (the Vite config already
binds to `0.0.0.0`).

### 3. Play

- On the home page, pick 2–4 colors and (optionally) name each player.
- Pass the device around each turn — the active player is highlighted with a
  glowing ring on their movable pawns.
- Tap the dice, then tap a glowing pawn to move it.
- First to get all 4 pawns home wins; play continues to rank everyone.

## How the board/engine works (for extending it)

- `frontend/src/game/boardData.js` — all board geometry: the 52-cell shared
  track (as grid coordinates), each color's home column, safe/star cells, and
  yard layout. This is the only place that encodes *where things are*.
- `frontend/src/game/gameEngine.js` — pure functions only (no React): dice
  rolls, valid-move calculation, applying a move (including capture logic and
  win detection). Fully unit-testable in isolation.
- `frontend/src/game/useLudoGame.js` — a `useReducer`-based hook that wraps
  the engine with turn flow (extra turns on 6, auto-pass on no valid move,
  three-6s forfeit).
- `frontend/src/game/LudoBoard.jsx` — the SVG renderer; purely presentational,
  reads pawn positions computed by the engine.

## Notes / things you may want to extend

- **Online multiplayer**: the engine is UI-agnostic, so it's a reasonable
  base for adding Socket.io later — broadcast `state` after each `MOVE`/`ROLL`
  action instead of keeping it in local React state.
- **Blocking rule**: this build allows stacking same-color pawns on one cell
  without blocking opponents (a common simplification). Add it in
  `getValidMoves`/`applyMove` if you want the stricter rule.
- **PWA / installable mobile app**: since the frontend is already a responsive
  web app, adding a manifest + service worker (e.g. `vite-plugin-pwa`) is the
  fastest path to something installable on a phone home screen without
  maintaining a separate React Native codebase.
