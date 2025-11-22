import { gameAI } from "./gameAI";
import { gameRules, GameState } from "./gameRules";

interface PathMapEntry {
  x: number;
  y: number;
  type: string;
  color?: string;
  player?: string;
}

interface PathMap {
  [key: number]: PathMapEntry;
}

interface ChessPiece {
  id: string;
  state: string;
  position: number;
}

interface PlayerPieces {
  [key: string]: ChessPiece[];
}

export interface FullGameState {
  currentPlayer: number;
  consecutiveSixCount: number;
  winner: string | null;
  isGameOver: boolean;
  players: PlayerPieces;
  _movableChessIds: Set<string>;
  _lastDiceResult: number;
}

interface BestMoveResult {
  type: string;
  chessId: string;
  dice: number | null;
}

export const PATH_MAP: PathMap = {
  // 家區格子 (Home base squares)
  0: { x: 1, y: 1, type: "home-base", player: "red" },
  1: { x: 1, y: 3, type: "home-base", player: "red" },
  2: { x: 3, y: 1, type: "home-base", player: "red" },
  3: { x: 3, y: 3, type: "home-base", player: "red" },
  4: { x: 13, y: 1, type: "home-base", player: "green" },
  5: { x: 13, y: 3, type: "home-base", player: "green" },
  6: { x: 15, y: 1, type: "home-base", player: "green" },
  7: { x: 15, y: 3, type: "home-base", player: "green" },
  8: { x: 1, y: 13, type: "home-base", player: "blue" },
  9: { x: 1, y: 15, type: "home-base", player: "blue" },
  10: { x: 3, y: 13, type: "home-base", player: "blue" },
  11: { x: 3, y: 15, type: "home-base", player: "blue" },
  12: { x: 13, y: 13, type: "home-base", player: "yellow" },
  13: { x: 13, y: 15, type: "home-base", player: "yellow" },
  14: { x: 15, y: 13, type: "home-base", player: "yellow" },
  15: { x: 15, y: 15, type: "home-base", player: "yellow" },

  // 外圈跑道 (Outer track)
  16: { x: 2, y: 4, color: "red", type: "path" },
  17: { x: 1, y: 4, color: "green", type: "path" },
  18: { x: 1, y: 5, color: "yellow", type: "path" },
  19: { x: 1, y: 6, color: "blue", type: "path" },
  20: { x: 1, y: 7, color: "red", type: "path" },
  21: { x: 1, y: 8, color: "green", type: "goal-entry", player: "green" },
  22: { x: 1, y: 9, color: "yellow", type: "path" },
  23: { x: 1, y: 10, color: "blue", type: "path" },
  24: { x: 1, y: 11, color: "red", type: "path" },
  25: { x: 1, y: 12, color: "green", type: "start", player: "green" },
  26: { x: 2, y: 12, color: "yellow", type: "path" },
  27: { x: 3, y: 12, color: "blue", type: "path" },
  28: { x: 4, y: 13, color: "red", type: "path" },
  29: { x: 4, y: 14, color: "green", type: "path" },
  30: { x: 4, y: 15, color: "yellow", type: "path" },
  31: { x: 5, y: 15, color: "blue", type: "path" },
  32: { x: 6, y: 15, color: "red", type: "path" },
  33: { x: 7, y: 15, color: "green", type: "path" },
  34: { x: 8, y: 15, color: "yellow", type: "goal-entry", player: "yellow" },
  35: { x: 9, y: 15, color: "blue", type: "path" },
  36: { x: 10, y: 15, color: "red", type: "path" },
  37: { x: 11, y: 15, color: "green", type: "path" },
  38: { x: 12, y: 15, color: "yellow", type: "start", player: "yellow" },
  39: { x: 12, y: 14, color: "blue", type: "path" },
  40: { x: 12, y: 13, color: "red", type: "path" },
  41: { x: 13, y: 12, color: "green", type: "path" },
  42: { x: 14, y: 12, color: "yellow", type: "path" },
  43: { x: 15, y: 12, color: "blue", type: "path" },
  44: { x: 15, y: 11, color: "red", type: "path" },
  45: { x: 15, y: 10, color: "green", type: "path" },
  46: { x: 15, y: 9, color: "yellow", type: "path" },
  47: { x: 15, y: 8, color: "blue", type: "goal-entry", player: "blue" },
  48: { x: 15, y: 7, color: "red", type: "path" },
  49: { x: 15, y: 6, color: "green", type: "path" },
  50: { x: 15, y: 5, color: "yellow", type: "path" },
  51: { x: 15, y: 4, color: "blue", type: "start", player: "blue" },
  52: { x: 14, y: 4, color: "red", type: "path" },
  53: { x: 13, y: 4, color: "green", type: "path" },
  54: { x: 12, y: 3, color: "yellow", type: "path" },
  55: { x: 12, y: 2, color: "blue", type: "path" },
  56: { x: 12, y: 1, color: "red", type: "path" },
  57: { x: 11, y: 1, color: "green", type: "path" },
  58: { x: 10, y: 1, color: "yellow", type: "path" },
  59: { x: 9, y: 1, color: "blue", type: "path" },
  60: { x: 8, y: 1, color: "red", type: "goal-entry", player: "red" },
  61: { x: 7, y: 1, color: "green", type: "path" },
  62: { x: 6, y: 1, color: "yellow", type: "path" },
  63: { x: 5, y: 1, color: "blue", type: "path" },
  64: { x: 4, y: 1, color: "red", type: "start", player: "red" },
  65: { x: 4, y: 2, color: "green", type: "path" },
  66: { x: 4, y: 3, color: "yellow", type: "path" },
  67: { x: 3, y: 4, color: "blue", type: "path" },

  // 家門通道 (Goal path)
  68: { x: 8, y: 2, color: "red", type: "goal-path", player: "red" },
  69: { x: 8, y: 3, color: "red", type: "goal-path", player: "red" },
  70: { x: 8, y: 4, color: "red", type: "goal-path", player: "red" },
  71: { x: 8, y: 5, color: "red", type: "goal-path", player: "red" },
  72: { x: 8, y: 6, color: "red", type: "goal-path", player: "red" },
  73: { x: 8, y: 7, color: "red", type: "goal", player: "red" },

  74: { x: 8, y: 14, color: "yellow", type: "goal-path", player: "yellow" },
  75: { x: 8, y: 13, color: "yellow", type: "goal-path", player: "yellow" },
  76: { x: 8, y: 12, color: "yellow", type: "goal-path", player: "yellow" },
  77: { x: 8, y: 11, color: "yellow", type: "goal-path", player: "yellow" },
  78: { x: 8, y: 10, color: "yellow", type: "goal-path", player: "yellow" },
  79: { x: 8, y: 9, color: "yellow", type: "goal", player: "yellow" },

  80: { x: 2, y: 8, color: "green", type: "goal-path", player: "green" },
  81: { x: 3, y: 8, color: "green", type: "goal-path", player: "green" },
  82: { x: 4, y: 8, color: "green", type: "goal-path", player: "green" },
  83: { x: 5, y: 8, color: "green", type: "goal-path", player: "green" },
  84: { x: 6, y: 8, color: "green", type: "goal-path", player: "green" },
  85: { x: 7, y: 8, color: "green", type: "goal", player: "green" },

  86: { x: 14, y: 8, color: "blue", type: "goal-path", player: "blue" },
  87: { x: 13, y: 8, color: "blue", type: "goal-path", player: "blue" },
  88: { x: 12, y: 8, color: "blue", type: "goal-path", player: "blue" },
  89: { x: 11, y: 8, color: "blue", type: "goal-path", player: "blue" },
  90: { x: 10, y: 8, color: "blue", type: "goal-path", player: "blue" },
  91: { x: 9, y: 8, color: "blue", type: "goal", player: "blue" },
};

export function createInitialState(): FullGameState {
  const state: FullGameState = {
    currentPlayer: 0,
    consecutiveSixCount: 0,
    winner: null,
    isGameOver: false,
    players: {
      red: [
        { id: "red-0", state: "home", position: 0 },
        { id: "red-1", state: "home", position: 1 },
        { id: "red-2", state: "home", position: 2 },
        { id: "red-3", state: "home", position: 3 },
      ],
      blue: [
        { id: "blue-0", state: "home", position: 4 },
        { id: "blue-1", state: "home", position: 5 },
        { id: "blue-2", state: "home", position: 6 },
        { id: "blue-3", state: "home", position: 7 },
      ],
      green: [
        { id: "green-0", state: "home", position: 8 },
        { id: "green-1", state: "home", position: 9 },
        { id: "green-2", state: "home", position: 10 },
        { id: "green-3", state: "home", position: 11 },
      ],
      yellow: [
        { id: "yellow-0", state: "home", position: 12 },
        { id: "yellow-1", state: "home", position: 13 },
        { id: "yellow-2", state: "home", position: 14 },
        { id: "yellow-3", state: "home", position: 15 },
      ],
    },
    _movableChessIds: new Set<string>(),
    _lastDiceResult: 0,
  };

  return state;
}

export function fromFull(state: FullGameState): GameState {
  const ls = new GameState();
  ls.player = state.currentPlayer as 0 | 1 | 2 | 3;
  ls.six = state.consecutiveSixCount;
  ls.dice = state._lastDiceResult;

  gameRules.PLAYER_COLOR.forEach((color, pIdx) => {
    const base = pIdx * 4; // Each player occupies 4 indices
    state.players[color].forEach((c, i) => {
      const idx = base + i;
      if (c.state === "home") {
        ls.pos[idx] = c.position;
        ls.st[idx] = 0;
      } else if (c.state === "goal") {
        ls.pos[idx] = 255;
        ls.st[idx] = 3;
      } else {
        ls.pos[idx] = c.position;
        ls.st[idx] = c.state === "path" ? 1 : 2;
      }
    });
  });

  if (state._lastDiceResult > 0 && state._movableChessIds.size > 0) {
    const currentColor = gameRules.PLAYER_COLOR[state.currentPlayer];
    let mask = 0;

    for (const chessId of state._movableChessIds) {
      if (!chessId.startsWith(currentColor + "-")) continue; // Just in case
      const localIdx = parseInt(chessId.split("-")[1]);
      if (localIdx >= 0 && localIdx < 4) {
        mask |= 1 << localIdx;
      }
    }

    ls.movable = mask;
  }

  return ls;
}

export function toFull(lightState: GameState): FullGameState {
  const full = createInitialState();

  full.currentPlayer = lightState.player;
  full.consecutiveSixCount = lightState.six;
  full._lastDiceResult = lightState.dice;
  full.winner = lightState.winner === -1 ? null : gameRules.PLAYER_COLOR[lightState.winner];
  full.isGameOver = lightState.winner !== -1;

  gameRules.PLAYER_COLOR.forEach((color, pIdx) => {
    const base = pIdx * 4;
    for (let i = 0; i < 4; i++) {
      const idx = base + i;
      const pos = lightState.pos[idx];
      const st = lightState.st[idx];

      let stateStr = "home";
      if (st === 1) stateStr = "path";
      else if (st === 2) stateStr = "goal-path";
      else if (st === 3) stateStr = "goal";

      full.players[color][i] = {
        id: `${color}-${i}`,
        state: stateStr,
        position: st === 3 ? gameRules.GOAL_PATH_START[pIdx] + 5 : pos,
      };
    }
  });

  full._movableChessIds.clear();

  if (lightState.movable !== 0) {
    const color = gameRules.PLAYER_COLOR[lightState.player];
    for (let i = 0; i < 4; i++) {
      if (lightState.movable & (1 << i)) {
        full._movableChessIds.add(`${color}-${i}`);
      }
    }
  }

  return full;
}

export const gameEngine = {
  createInitialState,

  rollDice(fullState: FullGameState, dice: number): FullGameState {
    const light = fromFull(fullState);
    gameRules.roll(light, dice);
    return toFull(light);
  },

  moveChess(fullState: FullGameState, chessId: string): FullGameState {
    const light = fromFull(fullState);
    const localIdx = parseInt(chessId.split("-")[1]);
    gameRules.move(light, localIdx);
    return toFull(light);
  },

  getBestMove(fullState: FullGameState): BestMoveResult | null {
    if (fullState.isGameOver || !fullState._movableChessIds?.size) return null;

    const light = fromFull(fullState);
    const action = gameAI.getBestMove(light);

    const color = gameRules.PLAYER_COLOR[fullState.currentPlayer];
    const chessId = `${color}-${action.localIdx}`;

    return {
      type: "move",
      chessId: chessId,
      dice: action.dice ? action.dice : 0,
    };
  },

  getPlayerColor(playerIdx: number): string {
    return gameRules.PLAYER_COLOR[playerIdx];
  },

  getAllPlayerColors(): readonly string[] {
    return gameRules.PLAYER_COLOR;
  },

  cloneState(state: FullGameState): FullGameState {
    // Deep clone the state
    const cloned = JSON.parse(JSON.stringify(state));
    // Recreate the Set for movableChessIds since JSON.stringify loses Set information
    cloned._movableChessIds = new Set(state._movableChessIds);
    return cloned;
  },

  setAIIterations(iterations: number): void {
    gameAI.setIterations(iterations);
  },
};
