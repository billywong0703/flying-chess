import MCTSNode from "./MCTSNode";
import { gameRules, GameState } from "./gameRules";

const ACTION_TYPE = {
  ROLL: "roll",
  MOVE: "move",
} as const;

type ActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

interface GameAction {
  type: ActionType;
  dice?: number | null;
  localIdx?: number;
  probability?: number;
}

class GameAI {
  private iterations: number;
  private maxDepth: number;

  constructor() {
    this.iterations = 10000;
    this.maxDepth = 400;
  }

  getBestMove(lightState: GameState): GameAction {
    // 1. Create root node (lightweight state)
    const rootNode = new MCTSNode(lightState);
    const currentPlayer = lightState.player;

    // 2. If dice has already been rolled, only consider legal moves for current dice value
    if (lightState.dice !== 0 && lightState.movable !== 0) {
      rootNode.untriedActions = this._getUniqueActions(lightState);
    }

    // 3. MCTS main loop
    this._runMCTS(rootNode, currentPlayer);

    // 4. Select child node with highest win rate → best action
    if (rootNode.children.length === 0) {
      // Fallback: return first available action or default roll
      const availableActions = this._getUniqueActions(lightState);
      return availableActions[0] || { type: ACTION_TYPE.ROLL, dice: null, probability: 1 };
    }

    const bestChild = rootNode.children.reduce((a, b) => {
      const aWinRate = a.wins / a.visits;
      const bWinRate = b.wins / b.visits;
      return aWinRate > bWinRate ? a : b;
    });

    // 5. Return best action
    return bestChild.action!;
  }

  private _runMCTS(rootNode: MCTSNode, currentPlayer: number): void {
    for (let i = 0; i < this.iterations; i++) {
      // Selection: pick a node from root
      let node = this._select(rootNode);

      // Expansion: if there are untried actions, randomly pick one to expand
      if (!node.isTerminal()) {
        node = this._expand(node);
      }

      // Simulation: randomly play until end or depth limit
      const winner = this._simulate(node);

      // Backpropagation: update results upwards
      const reward = winner === -1 ? 0 : winner === currentPlayer ? 1 : -1;
      this._backpropagate(node, reward);
    }
  }

  private _select(node: MCTSNode): MCTSNode {
    while (node.isFullyExpanded(this._getUniqueActions.bind(this)) && !node.isTerminal()) {
      const nextNode = this._getBestChild(node);
      if (!nextNode) break;
      node = nextNode;
    }
    return node;
  }

  private _expand(node: MCTSNode): MCTSNode {
    const action = node.selectUntriedAction(this._getUniqueActions.bind(this));
    if (!action) return node;

    const newState = this._cloneState(node.gameState);
    this._executeAction(newState, action);

    return node.addChild(newState, action);
  }

  private _simulate(node: MCTSNode): number {
    const state = this._cloneState(node.gameState);

    // Execute node action if applicable
    if (node.action?.type === ACTION_TYPE.MOVE && state.dice !== 0 && state.movable !== 0) {
      gameRules.move(state, node.action.localIdx!);
    }

    // Efficient while loop for random playout
    let depth = 0;
    while (depth < this.maxDepth && state.winner === -1) {
      // Roll dice
      const dice = ((Math.random() * 6) | 0) + 1;
      gameRules.roll(state, dice);

      // If no moves available, continue to next roll
      if (state.movable === 0) {
        depth++;
        continue;
      }

      // Find and execute random move
      const mask = state.movable;
      let choice: number;
      do {
        choice = (Math.random() * 4) | 0;
      } while (!(mask & (1 << choice)));

      gameRules.move(state, choice);
      depth++;
    }

    return state.winner !== -1 ? state.winner : -1;
  }

  private _backpropagate(node: MCTSNode, reward: number): void {
    let current: MCTSNode | null = node;
    while (current !== null) {
      const prob = current.action?.probability ?? 1.0;
      current.visits += 1;
      current.wins += reward * prob;
      current = current.parent;
    }
  }

  private _getUniqueActions(ls: GameState): GameAction[] {
    return ls.dice !== 0 && ls.movable !== 0 ? this._getMoves(ls) : this._getRolls(ls);
  }

  private _getMoves(ls: GameState): GameAction[] {
    const seen = new Set<string | number>();
    const base = ls.player * 4;
    const moves: GameAction[] = [];

    for (let i = 0; i < 4; i++) {
      if ((ls.movable & (1 << i)) === 0) continue;

      const idx = base + i;
      const target = ls.st[idx] === 0 ? "home" : ls.pos[idx];

      if (!seen.has(target)) {
        seen.add(target);
        moves.push({
          type: ACTION_TYPE.MOVE,
          dice: ls.dice,
          localIdx: i,
        });
      }
    }
    return moves;
  }

  private _getRolls(ls: GameState): GameAction[] {
    const counts = new Map<number, number>();

    for (let dice = 1; dice <= 6; dice++) {
      const test = this._cloneState(ls);
      gameRules.roll(test, dice);

      if (dice !== 6 && test.dice === 0 && test.movable === 0) {
        counts.set(-1, (counts.get(-1) || 0) + 1);
      } else {
        counts.set(dice, (counts.get(dice) || 0) + 1);
      }
    }

    return Array.from(counts, ([dice, count]) => ({
      type: ACTION_TYPE.ROLL,
      dice: dice === -1 ? null : dice,
      probability: count / 6,
    }));
  }

  private _getBestChild(node: MCTSNode): MCTSNode | null {
    const isChance = node.gameState.dice === 0 && node.gameState.movable === 0;

    if (isChance) {
      const rand = Math.random();
      let prob = 0;
      for (const child of node.children) {
        prob += child.action?.probability ?? 1.0 / node.children.length;
        if (rand <= prob) return child;
      }
      return node.children[0] || null;
    } else {
      let bestScore = -Infinity;
      let bestChild: MCTSNode | null = null;

      for (const child of node.children) {
        const score = child.getUCTScore(node.visits);
        if (score > bestScore) {
          bestScore = score;
          bestChild = child;
        }
      }
      return bestChild;
    }
  }

  private _executeAction(state: GameState, action: GameAction): void {
    if (action.type === ACTION_TYPE.ROLL && state.dice === 0) {
      gameRules.roll(state, action.dice!);
    } else if (action.type === ACTION_TYPE.MOVE) {
      gameRules.move(state, action.localIdx!);
    }
  }

  private _cloneState(ls: GameState): GameState {
    const clone = new GameState();
    clone.pos.set(ls.pos);
    clone.st.set(ls.st);
    clone.player = ls.player;
    clone.six = ls.six;
    clone.winner = ls.winner;
    clone.dice = ls.dice;
    clone.movable = ls.movable;
    return clone;
  }

  setIterations(n: number): void {
    this.iterations = n;
  }
}

export type { GameAction };

export const gameAI = new GameAI();
