import MCTSNode from "./MCTSNode";
import { gameRules, GameState } from "./gameRules";

const ACTION_TYPE = {
    ROLL: 'roll',     // { type: ACTION_TYPE.MOVE, dice: ls.dice, localIdx: i }
    MOVE: 'move'      // { type: ACTION_TYPE.ROLL, dice: key, probability: value / 6 }
};

class GameAI {
    constructor() {
        this.iterations = 10000;
        this.maxDepth = 400;     // 隨機模擬最大深度
    }

    // 公開 API：傳入原始完整 state，回傳原始格式的動作
    getBestMove(lightState) {

        // 1. 建立根節點（輕量狀態）
        const rootNode = new MCTSNode(lightState);
        const currentPlayer = lightState.player;

        // 2. 若已經擲過骰子，只考慮當前點數的合法動作
        if (lightState.dice !== 0 && lightState.movable !== 0) {
            rootNode.untriedActions = this._getUniqueActions(lightState);
        }

        // 3. MCTS 主迴圈
        this._runMCTS(rootNode, currentPlayer);

        // 4. 選出勝率最高的子節點 → 最佳動作
        const bestChild = rootNode.children.reduce((a, b) => {
            const aWinRate = a.wins / a.visits;
            const bWinRate = b.wins / b.visits;
            return aWinRate > bWinRate ? a : b;
        });

        // 5. 返回最佳動作
        return bestChild.action;
    }

    _runMCTS(rootNode, currentPlayer) {
        for (let i = 0; i < this.iterations; i++) {
            // Selection：從 root 挑一個節點
            let node = this._select(rootNode);

            // Expansion：如果還有未嘗試的動作，就隨機挑一個展開
            if (!node.isTerminal()) {
                node = this._expand(node);
            }

            // Simulation：隨機玩到結束或達深度上限
            const winner = this._simulate(node);

            // Backpropagation：把結果往上更新
            const reward = winner === -1 ? 0 : (winner === currentPlayer ? 1 : -1);
            this._backpropagate(node, reward);
        }
    }

    _select(node) {
        while (node.isFullyExpanded(this._getUniqueActions.bind(this)) && !node.isTerminal()) {
            const nextNode = this._getBestChild(node);
            if (!nextNode) break;
            node = nextNode;
        }
        return node;
    }

    _expand(node) {
        const action = node.selectUntriedAction(this._getUniqueActions.bind(this));
        if (!action) return node;

        const newState = this._cloneState(node.gameState);
        this._executeAction(newState, action);

        return node.addChild(newState, action);
    }

    _simulate(node) {
        const state = this._cloneState(node.gameState);

        // Execute node action if applicable
        if (node.action?.type === ACTION_TYPE.MOVE && state.dice !== 0 && state.movable !== 0) {
            gameRules.move(state, node.action.localIdx);
        }

        // Efficient while loop for random playout
        let depth = 0;
        while (depth < this.maxDepth && state.winner === -1) {
            // Roll dice
            const dice = (Math.random() * 6 | 0) + 1;
            gameRules.roll(state, dice);

            // If no moves available, continue to next roll
            if (state.movable === 0) {
                depth++;
                continue;
            }

            // Find and execute random move
            const mask = state.movable;
            let choice;
            do {
                choice = Math.random() * 4 | 0;
            } while (!(mask & (1 << choice)));

            gameRules.move(state, choice);
            depth++;
        }

        return state.winner !== -1 ? state.winner : -1;
    }

    _backpropagate(node, reward) {
        let current = node;
        while (current !== null) {
            const prob = current.action?.probability ?? 1.0;
            current.visits += prob;
            current.wins += reward * prob;
            current = current.parent;
        }
    }

    _getUniqueActions(ls) {
        return ls.dice !== 0 && ls.movable !== 0 ? this._getMoves(ls) : this._getRolls(ls);
    }

    _getMoves(ls) {
        const seen = new Set();
        const base = ls.player * 4;
        const moves = [];

        for (let i = 0; i < 4; i++) {
            if ((ls.movable & (1 << i)) === 0) continue;

            const idx = base + i;
            const target = ls.st[idx] === 0 ? 'home' : ls.pos[idx];

            if (!seen.has(target)) {
                seen.add(target);
                moves.push({
                    type: ACTION_TYPE.MOVE,
                    dice: ls.dice,
                    localIdx: i
                });
            }
        }
        return moves;
    }

    _getRolls(ls) {
        const counts = new Map();

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
            probability: count / 6
        }));
    }

    _getBestChild(node) {
        const isChance = node.gameState.dice === 0 && node.gameState.movable === 0;

        if (isChance) {
            const rand = Math.random();
            let prob = 0;
            for (const child of node.children) {
                prob += child.action?.probability ?? 1.0 / node.children.length;
                if (rand <= prob) return child;
            }
            return node.children[0];
        } else {
            let bestScore = -Infinity;
            let bestChild = null;

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

    _executeAction(state, action) {
        if (action.type === ACTION_TYPE.ROLL && state.dice === 0) {
            gameRules.roll(state, action.dice);
        } else if (action.type === ACTION_TYPE.MOVE) {
            gameRules.move(state, action.localIdx);
        }
    }

    _cloneState(ls) {
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


    setIterations(n) { this.iterations = n; }
}

export const gameAI = new GameAI();