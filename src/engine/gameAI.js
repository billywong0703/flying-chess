import MCTSNode from "./MCTSNode";
import { gameRules, GameState } from "./gameRules";
import { fromFull } from "./gameEngine";

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
    getBestMove(fullState) {
        if (fullState.isGameOver || !fullState._movableChessIds?.size) return null;

        // 1. 建立根節點（輕量狀態）
        const rootLight = fromFull(fullState);
        const rootNode = new MCTSNode(rootLight);

        // 2. 若已經擲過骰子，只考慮當前點數的合法動作
        if (fullState._lastDiceResult !== 0 && fullState._movableChessIds.size > 0) {
            rootNode.untriedActions = this._getUniqueActions(rootLight, fullState._lastDiceResult);
        }

        // 3. MCTS 主迴圈
        for (let i = 0; i < this.iterations; i++) {
            // Selection：從 root 挑一個節點
            let node = this._select(rootNode);

            // Expansion：如果還有未嘗試的動作，就隨機挑一個展開
            if (!node.isTerminal()) {
                node = this._expand(node);
            }

            // Simulation：隨機玩到結束或達深度上限
            const winner = this._simulation(node);

            // Backpropagation：把結果往上更新
            const reward = winner === -1 ? 0 : (winner === fullState.currentPlayer ? 1 : -1);
            this._backpropagate(node, reward);
        }

        // 4. 選出被訪問最多次的子節點 → 最佳動作
        if (rootNode.children.length === 0) return null;
        const bestChild = rootNode.children.reduce((a, b) => a.visits > b.visits ? a : b);
        const act = bestChild.action;

        // 5. 轉回原始 gameEngine 要求的格式
        const color = gameRules.PLAYER_COLOR[fullState.currentPlayer];
        const chessId = `${color}-${act.localIdx}`;

        return {
            type: 'move',
            chessId: chessId,
            dice: act.dice
        };
    }

    _select(node) {
        while (node.isFullyExpanded(this._getUniqueActions.bind(this)) && !node.isTerminal()) {
            const nextNode = this._bestChild(node);
            if (!nextNode) {
                break;
            }
            node = nextNode;
        }
        return node;
    }

    _expand(node) {
        const action = node.selectUntriedAction(this._getUniqueActions.bind(this));
        if (!action) {
            return node;
        }

        const newLs = this._copyLight(node.gameState);

        if (action.type === ACTION_TYPE.ROLL && newLs.dice === 0) {
            gameRules.roll(newLs, action.dice)
        }

        if (action.type === ACTION_TYPE.MOVE) {
            gameRules.move(newLs, action.localIdx);
        }

        return node.addChild(newLs, action);
    }

    _simulation(node) {
        const ls = this._copyLight(node.gameState);

        if (node.action.type === ACTION_TYPE.MOVE && ls.dice !== 0 && ls.movable !== 0) {
            gameRules.move(ls, node.action.localIdx);
        }

        for (let d = 0; d < this.maxDepth; d++) {
            if (ls.winner !== -1) return ls.winner;

            const dice = Math.floor(Math.random() * 6) + 1;
            gameRules.roll(ls, dice);

            if (ls.movable === 0) continue;

            const mask = ls.movable;
            if (mask === 0) continue;

            let choice;
            do {
                choice = Math.random() * 4 | 0;
            } while (!(mask & (1 << choice)));

            gameRules.move(ls, choice);
        }

        return ls.winner !== -1 ? ls.winner : -1;
    }

    _backpropagate(node, rawReward) {
        let current = node;
        while (current !== null) {
            const prob = current.action?.probability ?? 1.0;

            current.visits += prob;
            current.wins += rawReward * prob;

            current = current.parent;
        }
    }

    _getUniqueActions(ls) {
        // Case 1: 已擲骰（dice > 0），且有可移動的棋子 → 產生唯一的移動動作（相同終點位置視為等價）
        if (ls.dice !== 0 && ls.movable !== 0) {
            const seenPositions = new Set();
            const base = ls.player * 4;
            const actions = [];

            for (let i = 0; i < 4; i++) {
                if ((ls.movable & (1 << i)) === 0) continue;

                const target = ls.st[base + i] === 0 ? 'home' : ls.pos[base + i];
                if (!seenPositions.has(target)) {
                    seenPositions.add(target);
                    actions.push({ type: ACTION_TYPE.MOVE, dice: ls.dice, localIdx: i });
                }
            }
            return actions;
        }

        // Case 2: 尚未擲骰 → 計算每個骰子面（1~6）擲出後是否導致「完全相同的下一狀態」
        // 只有在 dice=1~5 且完全無法移動的情況下，才視為等價狀態（擲哪個都一樣）
        // 擲 6 永遠不會被合併，因為連續三次 6 會觸發特殊規則
        const resultCount = new Map(); // key: 代表性 dice 值（或 -1 表示「無移動」群組），value: 出現次數

        for (let d = 1; d <= 6; d++) {
            const next = this._copyLight(ls);
            gameRules.roll(next, d);

            if (d !== 6 && next.dice === 0 && next.movable === 0) {
                // 1~5 且完全不能走 → 合併到同一個代表動作
                resultCount.set(-1, (resultCount.get(-1) || 0) + 1);
            } else {
                // 正常情況或擲到 6 → 各自獨立
                resultCount.set(d, (resultCount.get(d) || 0) + 1);
            }
        }

        const actions = [];
        for (const [reprDice, count] of resultCount) {
            const actualDice = reprDice === -1 ? null : reprDice; // 或選擇 1~5 其中任一作為代表值
            actions.push({
                type: ACTION_TYPE.ROLL,
                dice: actualDice,
                probability: count / 6
            });
        }

        return actions;
    }

    _bestChild(node) {
        // 根據當前遊戲狀態判斷節點類型，而不是根據 action
        const isChanceNode = node.gameState.dice === 0 && node.gameState.movable === 0;

        if (isChanceNode) {
            // 🎲 機會節點：按機率隨機選擇
            const random = Math.random();
            let cumulative = 0;
            for (const child of node.children) {
                cumulative += child.action?.probability ?? 1.0 / node.children.length;
                if (random <= cumulative) {
                    return child;
                }
            }
            return node.children[0];
        } else {
            // 🎯 決策節點：使用 UCT
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


    _copyLight(ls) {
        const n = new GameState();
        n.pos.set(ls.pos);
        n.st.set(ls.st);
        n.player = ls.player;
        n.six = ls.six;
        n.winner = ls.winner;
        n.dice = ls.dice;
        n.movable = ls.movable;
        return n;
    }

    setIterations(n) { this.iterations = n; }
}

export const gameAI = new GameAI();