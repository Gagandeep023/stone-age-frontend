# @gagandeep023/stone-age-frontend

A complete React frontend for the **Stone Age** board game, built with TypeScript. Includes all game UI components, Socket.IO multiplayer hooks, SVG board rendering, dice animations, and a pre-built lobby system.

Designed as a standalone npm package that can be dropped into any React application.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Components](#components)
- [Hooks](#hooks)
- [Styling](#styling)
- [Package Exports](#package-exports)
- [Socket.IO Integration](#socketio-integration)
- [Game Flow](#game-flow)
- [Customization](#customization)
- [Project Structure](#project-structure)
- [License](#license)

## Features

- **Complete Game UI** - Lobby, board, player boards, action panels, scoring screen
- **SVG Game Board** - Interactive board with 15 clickable locations, worker visualization, and resource tracking
- **Real-time Multiplayer** - Socket.IO hooks with automatic reconnection and connection status
- **Room Management** - Create, join, and manage game rooms with public/private support
- **3-Phase UI** - Distinct interfaces for worker placement, action resolution, and feeding
- **Dice Animations** - 3D rolling animation with tool bonus previews
- **Responsive Design** - Dark theme with a Stone Age-inspired color palette
- **TypeScript** - Full type safety with exported interfaces for all game state

## Installation

```bash
npm install @gagandeep023/stone-age-frontend
```

### Peer Dependencies

These must be installed separately in your project:

```bash
npm install react react-dom socket.io-client
```

Compatible with React 18 and React 19.

## Quick Start

### Drop-in Lobby + Game

The fastest way to get started. The lobby handles room creation and joining, and calls `onJoinGame` when a game starts:

```tsx
import { useState } from 'react';
import { StoneAgeLobby, StoneAgeGame } from '@gagandeep023/stone-age-frontend';
import '@gagandeep023/stone-age-frontend/frontend/styles.css';

function App() {
  const [gameId, setGameId] = useState<string | null>(null);

  const user = {
    id: 'user-123',
    name: 'Alice',
    picture: '/avatars/alice.png',
  };

  if (gameId) {
    return (
      <StoneAgeGame
        gameId={gameId}
        wsBase="http://localhost:3001"
        user={user}
        authToken="your-auth-token"
        onLeave={() => setGameId(null)}
      />
    );
  }

  return (
    <StoneAgeLobby
      apiBase="http://localhost:3001"
      wsBase="http://localhost:3001"
      user={user}
      authToken="your-auth-token"
      onJoinGame={(id) => setGameId(id)}
    />
  );
}
```

## Components

### StoneAgeLobby

The pre-game lobby for browsing, creating, and joining game rooms.

```tsx
<StoneAgeLobby
  apiBase="http://localhost:3001"
  wsBase="http://localhost:3001"
  user={{ id: 'user-1', name: 'Alice' }}
  authToken="token"
  onJoinGame={(gameId) => console.log('Joined:', gameId)}
/>
```

**Features:**
- Create rooms (set name, max players 2-4, private/public, optional passcode)
- Browse and join public rooms
- Join private rooms by code + passcode
- Player list with real-time connection status
- Start game button (host only, requires 2+ players)

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `apiBase` | `string` | Backend API base URL |
| `wsBase` | `string` | WebSocket server base URL |
| `user` | `{ id, name, picture? }` | Current user info |
| `authToken` | `string` | Auth token for Socket.IO |
| `onJoinGame` | `(gameId: string) => void` | Called when game starts |

---

### StoneAgeGame

The main game interface. Renders the board, player panels, action controls, and game log.

```tsx
<StoneAgeGame
  gameId="game-abc-123"
  wsBase="http://localhost:3001"
  user={{ id: 'user-1', name: 'Alice' }}
  authToken="token"
  onLeave={() => navigate('/lobby')}
/>
```

**Layout:**
- **Top**: HUD showing round number, current phase, active player
- **Left**: Interactive SVG game board
- **Right**: Action panel (changes per phase), player boards, game log
- **Overlays**: Phase change notifications, turn alerts, game over scoring

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `gameId` | `string` | ID of the game to join |
| `wsBase` | `string` | WebSocket server base URL |
| `user` | `{ id, name, picture? }` | Current user info |
| `authToken` | `string` | Auth token for Socket.IO |
| `onLeave` | `() => void` | Called when player leaves game |

---

### GameBoard

SVG-based interactive game board with all 15 locations.

**Locations displayed:**
- 5 resource gathering areas (Hunting Grounds, Forest, Clay Pit, Quarry, River)
- 3 village locations (Tool Maker, Hut, Field)
- 4 building stacks
- 4 civilization card slots

**Visual features:**
- Color-coded locations by type
- Gold highlight on available locations (clickable)
- Worker dots colored by player
- Worker count badges
- Supply counter display
- Blocked location indicators

---

### Action Panels

Three phase-specific control panels:

**PlacementPanel** (Worker Placement phase)
- Location selection with worker count adjustment
- Fixed worker count for village locations (1 for Tool Maker/Field, 2 for Hut)
- Variable count with +/- controls for resource locations

**ActionPanel** (Action Resolution phase)
- Dice roller with animated results
- Tool selection toggles with bonus preview
- Resource collection confirmation
- Skip option for building/card locations
- Unresolved location list

**FeedingPanel** (Feeding phase)
- Food needed vs. available display
- Resource-to-food conversion controls (+/- per resource type)
- Running total tracker
- Starvation penalty option (-10 VP)

---

### Supporting Components

| Component | Description |
|-----------|-------------|
| `GameHUD` | Top bar showing round, phase, and current player |
| `PlayerBoard` | Player status card (resources, workers, tools, score) |
| `GameLog` | Scrolling event log, color-coded by event type |
| `FinalScoring` | Game over screen with ranked score breakdown |
| `DiceRoller` | Animated dice faces with 3D roll effect |
| `ResourceIcon` | SVG icons for wood, brick, stone, gold, food |
| `WorkerMeeple` | SVG meeple in player colors |
| `ToolIcon` | SVG hammer icon with level indicator |

## Hooks

### useStoneAgeSocket

Manages the Socket.IO connection and provides all game action emitters.

```tsx
import { useStoneAgeSocket } from '@gagandeep023/stone-age-frontend';

const {
  connected,
  connectionError,
  createRoom,
  joinRoom,
  leaveRoom,
  startGame,
  placeWorkers,
  resolveAction,
  useTools,
  confirmResourceGathering,
  payForBuilding,
  payForCard,
  skipAction,
  feedWorkers,
  acceptStarvation,
  chooseDiceReward,
  reconnect,
} = useStoneAgeSocket({
  wsBase: 'http://localhost:3001',
  authToken: 'token',
  onGameState: (state) => console.log('Game updated:', state),
  onRoomUpdate: (room) => console.log('Room updated:', room),
  onRoomList: (rooms) => console.log('Rooms:', rooms),
  onError: (msg) => console.error('Error:', msg),
  onGameOver: (scores) => console.log('Game over:', scores),
  onPhaseChange: (phase, round) => console.log('Phase:', phase, round),
  onTurnChange: (playerId) => console.log('Turn:', playerId),
  onPlayerDisconnected: (playerId) => console.log('Disconnected:', playerId),
  onPlayerReconnected: (playerId) => console.log('Reconnected:', playerId),
});
```

**Actions:**

| Method | Args | Description |
|--------|------|-------------|
| `createRoom` | `name, maxPlayers, passcode?` | Create a new room |
| `joinRoom` | `roomId, passcode?` | Join an existing room |
| `leaveRoom` | - | Leave current room |
| `startGame` | - | Start game (host only) |
| `placeWorkers` | `location, count` | Place workers on board |
| `resolveAction` | `location` | Resolve a location (triggers dice) |
| `useTools` | `toolIndices` | Apply tools to dice roll |
| `confirmResourceGathering` | - | Confirm resource collection |
| `payForBuilding` | `resources` | Pay for building tile |
| `payForCard` | `resources` | Pay for civilization card |
| `skipAction` | - | Skip optional action |
| `feedWorkers` | `resourcesAsFood?` | Feed workers |
| `acceptStarvation` | - | Accept -10 VP penalty |
| `chooseDiceReward` | `choice` | Choose dice-for-items reward |
| `reconnect` | - | Manual reconnection |

---

### useGameState

Manages game state and provides computed values for the current player.

```tsx
import { useGameState } from '@gagandeep023/stone-age-frontend';

const {
  gameState,
  updateGameState,
  myPlayer,
  isMyTurn,
  currentPlayer,
  availableLocations,
} = useGameState('user-123');
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `gameState` | `GameState \| null` | Current game state |
| `updateGameState` | `(state) => void` | State setter |
| `myPlayer` | `PlayerState \| undefined` | Current user's player data |
| `isMyTurn` | `boolean` | Whether it's the current user's turn |
| `currentPlayer` | `PlayerState \| undefined` | Active player data |
| `availableLocations` | `LocationId[]` | Valid placement targets (filters by capacity, rules, etc.) |

## Styling

Import the included stylesheet for the complete Stone Age theme:

```tsx
import '@gagandeep023/stone-age-frontend/frontend/styles.css';
```

### Color Palette

| Token | Color | Usage |
|-------|-------|-------|
| Primary BG | `#1a1207` | Main background |
| Secondary BG | `#2a1f0e` | Cards, panels |
| Board BG | `#4a3c1f` | Game board |
| Primary Text | `#f0e6d2` | Main text |
| Secondary Text | `#b8a88a` | Muted text |
| Accent Gold | `#d4a017` | Highlights, buttons |
| Wood | `#8B6914` | Wood resource |
| Brick | `#c45a3c` | Brick resource |
| Stone | `#6B6B6B` | Stone resource |
| Gold | `#d4a017` | Gold resource |
| Food | `#2D5016` | Food resource |

### CSS Classes

All classes are prefixed with `sa-` (Stone Age) to avoid conflicts:

- `sa-btn`, `sa-btn-primary`, `sa-btn-danger` - Buttons
- `sa-card` - Card containers
- `sa-resource-badge` - Resource count badges
- `sa-lobby`, `sa-lobby-*` - Lobby-specific styles

### Animations

- `sa-dice-roll` - 3D dice rotation (0.5s)
- `sa-dice-bounce` - Dice landing bounce (0.3s)
- `sa-score-pop` - Score reveal pulse (0.4s)
- `sa-fade-in` - Element entry (0.3s)
- `sa-pulse` - Infinite attention pulse (1.5s)

## Package Exports

```typescript
// Main export - everything
import {
  StoneAgeLobby,
  StoneAgeGame,
  useStoneAgeSocket,
  useGameState,
} from '@gagandeep023/stone-age-frontend';
import type { GameState, PlayerState } from '@gagandeep023/stone-age-frontend';

// Frontend components only
import {
  StoneAgeLobby,
  StoneAgeGame,
  useStoneAgeSocket,
  useGameState,
} from '@gagandeep023/stone-age-frontend/frontend';

// Types only
import type { GameState, PlayerState, LocationId } from '@gagandeep023/stone-age-frontend/types';

// Styles
import '@gagandeep023/stone-age-frontend/frontend/styles.css';
```

### Subpath Exports

| Path | Contents |
|------|----------|
| `.` | All components, hooks, and type definitions |
| `./frontend` | Components and hooks only |
| `./frontend/styles.css` | Compiled CSS stylesheet |
| `./types` | TypeScript type definitions only |

## Socket.IO Integration

The frontend connects to a Stone Age backend server (see [@gagandeep023/stone-age-backend](https://github.com/Gagandeep023/stone-age-backend)) via Socket.IO. The connection is managed by the `useStoneAgeSocket` hook.

### Connection Flow

1. Hook initializes Socket.IO connection with auth token
2. Server sends `roomList` with available rooms
3. User creates or joins a room; server sends `roomUpdate`
4. Host starts game; server sends initial `gameState`
5. Each player action emits an event; server validates and broadcasts updated `gameState`
6. Phase/turn changes trigger `phaseChange` and `turnChange` events
7. Game over triggers `gameOver` with final score breakdown

### Reconnection

- Automatic Socket.IO reconnection on disconnect
- Server maintains 2-minute grace period for reconnecting players
- Manual `reconnect()` method available
- Connection status shown in UI via `connected` / `connectionError` state

## Game Flow

```
┌──────────────┐     createRoom / joinRoom     ┌──────────────┐
│              │ ─────────────────────────────> │              │
│    Lobby     │                                │  Room Wait   │
│              │ <───────────────────────────── │              │
│  Browse/     │         leaveRoom              │  See players │
│  Create/     │                                │  Start game  │
│  Join rooms  │                                │  (host only) │
└──────────────┘                                └──────┬───────┘
                                                       │ startGame
                                                       v
┌──────────────────────────────────────────────────────────────────┐
│                         Game Screen                               │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Worker Placement │─>│Action Resolution│─>│    Feeding       │  │
│  │                  │  │                 │  │                  │  │
│  │ Click location   │  │ Roll dice       │  │ Convert food     │  │
│  │ Set worker count │  │ Apply tools     │  │ Use resources    │  │
│  │ Place workers    │  │ Collect/skip    │  │ Accept penalty   │  │
│  └─────────────────┘  └─────────────────┘  └────────┬────────┘  │
│           ^                                          │           │
│           └──────────── next round ──────────────────┘           │
│                                                                   │
│  Game ends when card deck is empty or a building stack runs out   │
└──────────────────────────────────────────────────────┬────────────┘
                                                       │
                                                       v
                                              ┌─────────────────┐
                                              │  Final Scoring   │
                                              │                  │
                                              │  Ranked results  │
                                              │  Score breakdown │
                                              │  Back to lobby   │
                                              └─────────────────┘
```

## Customization

### Using Individual Components

You can use the hooks independently to build a custom UI:

```tsx
import { useStoneAgeSocket, useGameState } from '@gagandeep023/stone-age-frontend';

function CustomGame({ gameId, user }) {
  const { gameState, myPlayer, isMyTurn, availableLocations } = useGameState(user.id);

  const socket = useStoneAgeSocket({
    wsBase: 'http://localhost:3001',
    authToken: 'token',
    onGameState: (state) => updateGameState(state),
  });

  // Build your own UI using the state and socket actions
  return (
    <div>
      <p>Round: {gameState?.roundNumber}</p>
      <p>My Score: {myPlayer?.score}</p>
      {isMyTurn && <button onClick={() => socket.placeWorkers('forest', 2)}>Place in Forest</button>}
    </div>
  );
}
```

### Overriding Styles

All CSS uses class selectors (no IDs or elements), so you can override any style:

```css
/* Override the accent color */
.sa-btn-primary {
  background-color: #your-color;
  border-color: #your-color;
}

/* Override the board background */
.sa-board {
  background-color: #your-board-color;
}
```

## Project Structure

```
src/
├── index.ts                          # Main package exports
├── frontend/
│   └── index.ts                      # Frontend-only exports
├── components/
│   ├── Actions/
│   │   ├── ActionPanel.tsx           # Action resolution phase UI
│   │   ├── FeedingPanel.tsx          # Feeding phase UI
│   │   └── PlacementPanel.tsx        # Worker placement phase UI
│   ├── Board/
│   │   └── GameBoard.tsx             # SVG interactive game board
│   ├── Common/
│   │   ├── ResourceIcon.tsx          # Resource SVG icons + badges
│   │   ├── ToolIcon.tsx              # Tool SVG icon with level
│   │   └── WorkerMeeple.tsx          # Player meeple SVG
│   ├── Dice/
│   │   └── DiceRoller.tsx            # Animated dice faces
│   ├── HUD/
│   │   ├── GameHUD.tsx               # Round/phase/turn status bar
│   │   └── GameLog.tsx               # Scrolling event log
│   ├── PlayerBoard/
│   │   └── PlayerBoard.tsx           # Player resources, tools, score
│   ├── Scoreboard/
│   │   └── FinalScoring.tsx          # End-game score breakdown
│   ├── StoneAgeGame/
│   │   └── StoneAgeGame.tsx          # Main game container
│   └── StoneAgeLobby/
│       └── StoneAgeLobby.tsx         # Lobby + room management
├── hooks/
│   ├── useGameState.ts               # Game state + computed values
│   └── useStoneAgeSocket.ts          # Socket.IO connection + actions
├── styles/
│   └── stone-age.css                 # Complete theme stylesheet
└── types/
    └── index.ts                      # All TypeScript interfaces
```

## Tech Stack

- **Framework**: React 18/19
- **Language**: TypeScript (ES2022 target, JSX automatic)
- **Networking**: Socket.IO Client 4.x
- **Build**: tsup (ESM + CommonJS dual output)
- **Testing**: Vitest

## Related

- [@gagandeep023/stone-age-backend](https://github.com/Gagandeep023/stone-age-backend) - Backend game engine, Socket.IO server, and SQLite persistence

## License

MIT
