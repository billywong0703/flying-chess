import MCTSNode from "./MCTSNode";
import { gameRules, GameState } from "./gameRules";
import { fromFull } from "./gameEngine";

class GameAI {
    constructor() {
        this.iterations = 10000;  
        this.maxDepth = 300;     // 隨機模擬最大深度
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

        if (newLs.dice === 0) {
            gameRules.roll(newLs, action.dice)
        }

        gameRules.move(newLs, action.localIdx);

        return node.addChild(newLs, action);
    }

    _simulation(node) {
        const ls = this._copyLight(node.gameState);

        for (let d = 0; d < this.maxDepth; d++) {
            if (ls.winner !== -1) return ls.winner;

            const dice = Math.floor(Math.random() * 6) + 1;
            gameRules.roll(ls, dice);

            if (ls.movable === 0) continue;                 // 無棋可動 → 換人

            const bits = [];
            for (let i = 0; i < 4; i++) {
                if (ls.movable & (1 << i)) bits.push(i);
            }

            const choice = bits[Math.floor(Math.random() * bits.length)];
            gameRules.move(ls, choice);
        }
        return ls.winner !== -1 ? ls.winner : -1;        // -1 = 未分勝負（算平手）
    }


    _backpropagate(node, result) {
        while (node !== null) {
            node.update(result);
            node = node.parent;
        }
    }

    _getUniqueActions(ls, fixedDice = null) {
        const actions = [];

        // 情況1：已經擲過骰子 → 直接用 ls.dice（此時 ls 已經是 roll 後的狀態）
        if (fixedDice !== null) {
            // 重要：此時 ls 已經是 roll 完的狀態，movable 直接從當前 ls 計算
            const movable = this._computeMovableMask(ls, fixedDice); // 下面會給定義

            if (movable !== 0) {
                const seen = new Set();
                const base = ls.player * 4;

                for (let i = 0; i < 4; i++) {
                    if ((movable & (1 << i)) === 0) continue;

                    const key = ls.st[base + i] === 0 ? 'home' : ls.pos[base + i];
                    if (!seen.has(key)) {
                        seen.add(key);
                        actions.push({ dice: fixedDice, localIdx: i });
                    }
                }
            }
            return actions;
        }

        // 情況2：還沒擲骰子 → 才需要試 1~6
        for (let d = 1; d <= 6; d++) {
            const temp = this._copyLight(ls);

            gameRules.roll(temp, d);

            if (temp.movable === 0) continue;

            const seen = new Set();
            const base = ls.player * 4;

            for (let i = 0; i < 4; i++) {
                if ((temp.movable & (1 << i)) === 0) continue;

                const key = temp.st[base + i] === 0 ? 'home' : temp.pos[base + i];
                if (!seen.has(key)) {
                    seen.add(key);
                    actions.push({ dice: d, localIdx: i });
                }
            }
        }

        return actions;
    }

    _computeMovableMask(ls, dice) {
        let mask = 0;
        const base = ls.player * 4;

        for (let i = 0; i < 4; i++) {
            const st = ls.st[base + i];
            if ((st === 0 && dice === 6) || st === 1 || st === 2) {
                mask |= (1 << i);
            }
        }
        return mask;
    }

    _bestChild(node) {
        let bestChild = null;
        let bestScore = -1;

        for (const child of node.children) {
            const score = child.getUCTScore(node.visits);

            if (score > bestScore) {
                bestScore = score;
                bestChild = child;
            }
        }

        return bestChild;
    }

    // 極速複製輕量狀態
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

    // 外部可動態調整思考時間
    setIterations(n) { this.iterations = n; }
}

// 匯出單例
export const gameAI = new GameAI();