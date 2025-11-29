export class GameState {
  // If dice = 0 and movable = 0, it means (state = waiting to roll), otherwise (state = waiting to move)
  pos: Uint8Array; // Position of each piece (0~15 = home, 16~67 = track, 68~91 = goal path, 255 = finished)
  st: Uint8Array; // Status: 0=home, 1=outer track, 2=goal path, 3=finished
  player: 0 | 1 | 2 | 3; // Current player 0~3
  six: number; // Consecutive sixes count
  winner: number; // Winner (-1 means game not over)
  dice: number; // Current dice value (for move)
  movable: number; // Bitmask of movable pieces (for move)

  constructor() {
    this.pos = new Uint8Array(16);
    this.st = new Uint8Array(16);
    this.player = 0;
    this.six = 0;
    this.winner = -1;
    this.dice = 0;
    this.movable = 0;
  }
}

export const gameRules = {
  // Starting points, goal entry points, goal path starts for each color
  PLAYER_COLOR: ["red", "green", "yellow", "blue"] as const,
  START: [64, 25, 38, 51] as const,
  GOAL_ENTRY: [60, 21, 34, 47] as const,
  GOAL_PATH_START: [68, 80, 74, 86] as const,
  RING_SIZE: 52,
  RING_START: 16,

  // Roll the dice and set the bitmask of which pieces the current player can move (0~15)
  // Also handle the "three consecutive 6s" penalty
  roll(ls: GameState, dice: number): void {
    ls.dice = dice;
    const p = ls.player;
    const base = p * 4;
    ls.six = dice === 6 ? ls.six + 1 : 0;

    // Three consecutive 6s → all pieces on the track or goal path return to home
    if (ls.six === 3) {
      for (let i = base; i < base + 4; i++) {
        if (ls.st[i] !== 0 && ls.st[i] !== 3) {
          // Not in home and not finished
          ls.pos[i] = base + (i % 4); // Return to respective home slot
          ls.st[i] = 0;
        }
      }
      ls.six = 0;
      ls.dice = 0;
      ls.player = ((p + 1) % 4) as 0 | 1 | 2 | 3; // Next player
      ls.movable = 0;
      return;
    }

    // Normal case: calculate movable pieces
    let movable = 0;
    for (let i = 0; i < 4; i++) {
      const s = ls.st[base + i];
      if ((s === 0 && dice === 6) || s === 1 || s === 2) {
        movable |= 1 << i;
      }
    }

    if (movable === 0) {
      ls.dice = 0;
      ls.player = ((p + 1) % 4) as 0 | 1 | 2 | 3;
    }

    ls.movable = movable;
  },

  // Actually move one piece (localIdx is 0~3)
  move(ls: GameState, localIdx: number): void {
    if (ls.movable === 0) return;

    const idx = ls.player * 4 + localIdx; // Global index 0~15
    let pos = ls.pos[idx];
    let st = ls.st[idx];
    const p = ls.player;
    const dice = ls.dice;

    // ── 1. Takeoff ─────────────────────────────────────
    if (st === 0) {
      // Take off from home
      pos = this.START[p];
      st = 1;
    }
    // ── 2. Move on outer track ─────────────────────────────
    else if (st === 1) {
      const entry = this.GOAL_ENTRY[p];
      const goalPath = this.GOAL_PATH_START[p];
      const nextPos = this.RING_START + ((pos - this.RING_START + dice) % this.RING_SIZE);

      if (this._willPassGoalEntry(pos, nextPos, entry)) {
        // Enter goal path
        const stepsToEntry = this._getStepsToGoalEntry(pos, entry);
        const remainingSteps = dice - stepsToEntry;

        if (remainingSteps > 0) {
          pos = goalPath + remainingSteps - 1;
          st = 2;
          if (pos >= this.GOAL_PATH_START[p] + 5) {
            // Directly fly into goal
            pos = 255;
            st = 3;
          }
        }
      } else {
        // Normal move on track
        pos = nextPos;
        st = 1;

        // Glide rule: land on same color tile (except entry tile)
        if (pos !== entry && pos % 4 === p) {
          pos = this.RING_START + ((nextPos - this.RING_START + 4) % this.RING_SIZE);
        }
      }
    }
    // ── 3. Move in goal path (can bounce back if overshoot) ───────────────
    else if (st === 2) {
      const goalEnd = this.GOAL_PATH_START[p] + 5; // Actual goal tile (e.g. red is 73)

      if (pos + dice < goalEnd) {
        // Normal forward
        pos += dice;
        st = 2;
      } else if (pos + dice === goalEnd) {
        // Reach goal
        pos = 255;
        st = 3;
      } else {
        // Overshoot → bounce back
        const overshoot = dice - (goalEnd - pos);
        pos = goalEnd - overshoot;
        st = 2;
      }
    }

    // ── 4. Knock opponent (same tile and not home/goal) ─────────────
    for (let i = 0; i < 16; i++) {
      if (Math.floor(i / 4) === p) continue;
      if (ls.pos[i] === pos && ls.st[i] !== 0 && ls.st[i] !== 3) {
        ls.pos[i] = this._getFreeHomeSlot(ls, Math.floor(i / 4));
        ls.st[i] = 0;
      }
    }

    // ── Handle stacked pieces ─────────────────────────────────────
    const stackIndices: number[] = [];
    for (let i = 0; i < 4; i++) {
      if (ls.pos[p * 4 + i] === ls.pos[idx] && ls.st[p * 4 + i] === ls.st[idx]) {
        stackIndices.push(p * 4 + i);
      }
    }

    // Move the entire stack to new position
    for (const sIdx of stackIndices) {
      ls.pos[sIdx] = pos;
      ls.st[sIdx] = st;
    }

    // Reach goal
    if (pos === 255) {
      this._checkWin(ls);
    }

    // ── 5. Determine next player (roll 6 → roll again) ───────────────
    ls.dice = 0;
    ls.movable = 0;
    ls.player = ((p + (dice === 6 ? 0 : 1)) % 4) as 0 | 1 | 2 | 3;
  },

  _getFreeHomeSlot(ls: GameState, player: number): number {
    const base = player * 4;
    const used = new Set<number>();
    for (let i = 0; i < 4; i++) {
      const idx = base + i;
      if (ls.st[idx] === 0) {
        used.add(ls.pos[idx] - base);
      }
    }
    for (let local = 0; local < 4; local++) {
      if (!used.has(local)) {
        return base + local;
      }
    }
    return -1;
  },

  _willPassGoalEntry(currentPos: number, newPos: number, entryPos: number): boolean {
    if (currentPos <= entryPos && newPos >= entryPos) {
      return true;
    }

    if (currentPos >= newPos && newPos >= this.RING_START) {
      return entryPos >= this.RING_START && entryPos <= newPos;
    }

    return false;
  },

  _getStepsToGoalEntry(currentPos: number, entryPos: number): number {
    if (currentPos <= entryPos) {
      return entryPos - currentPos;
    }
    return this.RING_SIZE - currentPos + this.RING_START + (entryPos - this.RING_START);
  },

  _checkWin(ls: GameState): void {
    const base = ls.player * 4;

    if (ls.st[base] === 3 && ls.st[base + 1] === 3 && ls.st[base + 2] === 3 && ls.st[base + 3] === 3) {
      ls.winner = ls.player;
    }
  },
};
