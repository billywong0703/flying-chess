import { GameState } from "./gameRules";
import { GameAction } from "./gameAI";

class MCTSNode {
  public gameState: GameState; // 🎮 Current game state
  public parent: MCTSNode | null; // 👨‍👦 Parent node reference
  public action: GameAction | null; // 🎯 Action that led to this node
  public children: MCTSNode[]; // 🌱 Child node list
  public visits: number; // 📊 Node visit count
  public wins: number; // 🏆 Node win count/cumulative reward
  public untriedActions: GameAction[] | null; // 📦 List of untried actions

  constructor(gameState: GameState, parent: MCTSNode | null = null, action: GameAction | null = null) {
    this.gameState = gameState;
    this.parent = parent;
    this.action = action;
    this.children = [];
    this.visits = 0;
    this.wins = 0;
    this.untriedActions = null;
  }

  isFullyExpanded(getActionsCallback: ((state: GameState) => GameAction[]) | null = null): boolean {
    if (this.untriedActions === null) {
      if (getActionsCallback) {
        this.untriedActions = getActionsCallback(this.gameState);
      } else {
        // If no callback provided, assume no actions available
        this.untriedActions = [];
      }
    }
    return this.untriedActions.length === 0;
  }

  isTerminal(): boolean {
    return this.gameState.winner !== -1;
  }

  selectUntriedAction(getActionsCallback: ((state: GameState) => GameAction[]) | null = null): GameAction | null {
    // If not initialized, get legal actions first
    if (this.untriedActions === null) {
      if (getActionsCallback) {
        this.untriedActions = getActionsCallback(this.gameState);
      } else {
        this.untriedActions = [];
      }
    }

    // If no untried actions, return null
    if (this.untriedActions.length === 0) {
      return null;
    }

    // Take an action from untried actions list (LIFO)
    return this.untriedActions.pop() || null;
  }

  getUCTScore(totalVisits: number, explorationParam: number = 1.414): number {
    // If node has never been visited, return maximum score to encourage exploration
    if (this.visits === 0) {
      return Number.MAX_VALUE;
    }

    // Exploitation term: current node's win rate
    const exploitation = this.wins / this.visits;
    // Exploration term: encourage less visited nodes
    const exploration = explorationParam * Math.sqrt(Math.log(totalVisits) / this.visits);

    return exploitation + exploration;
  }

  addChild(gameState: GameState, action: GameAction): MCTSNode {
    const childNode = new MCTSNode(gameState, this, action);
    this.children.push(childNode);
    return childNode;
  }

  update(result: number): void {
    this.visits += 1; // Increase visit count
    this.wins += result; // Accumulate reward
  }

  getBestChild(): MCTSNode | null {
    if (this.children.length === 0) {
      return null;
    }

    return this.children.reduce((best, current) => {
      return current.visits > best.visits ? current : best;
    });
  }

  toString(): string {
    return `MCTSNode[visits: ${this.visits}, wins: ${this.wins}, winRate: ${this.visits > 0 ? (this.wins / this.visits).toFixed(3) : 0}, children: ${this.children.length}]`;
  }
}

export default MCTSNode;
