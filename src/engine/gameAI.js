import { gameEngine } from "./gameEngine";
import MCTSNode from "./MCTSNode";

// 修復後的 GameAI 類
class GameAI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.mctsIterations = 300;
    }

    /**
     * 🎯 獲取AI的最佳移動決策
     */
    getBestMove(currentState) {
        const state = this.cloneState(currentState);

        if (state.isGameOver) {
            return null;
        }

        // 如果沒有可移動的棋子，返回null
        if (!state._movableChessIds || state._movableChessIds.size === 0) {
            return null;
        }

        // 使用MCTS搜索最佳移動
        return this.mctsSearch(state);
    }

    /**
     * 🔍 MCTS搜索主函數
     */
    mctsSearch(diceState) {
        const rootNode = new MCTSNode(diceState);

        for (let i = 0; i < this.mctsIterations; i++) {
            let node = this.select(rootNode);

            if (!node.isTerminal()) {
                node = this.expand(node);
            }

            const result = this.simulate(node);
            this.backpropagate(node, result);
        }

        return this.getBestAction(rootNode);
    }

    /**
     * 📝 選擇階段 - 選擇要擴展的節點
     */
    select(node) {
        while (node.isFullyExpanded() && !node.isTerminal()) {
            const nextNode = this.getBestChild(node);
            if (!nextNode) {
                break;
            }
            node = nextNode;
        }
        return node;
    }

    /**
     * 🌱 擴展階段 - 擴展新節點
     */
    expand(node) {
        const action = node.selectUntriedAction();
        if (!action) {
            return node;
        }

        // 執行移動動作
        const nextState = this.gameEngine.moveChess(node.gameState, action.chessId);

        return node.addChild(nextState, action);
    }

    /**
     * 🎲 模擬階段 - 隨機模擬遊戲直到結束
     */
    simulate(node) {
        let state = this.cloneState(node.gameState);
        let depth = 0;
        const maxDepth = 50;

        while (!state.isGameOver && depth < maxDepth) {
            // 在模擬中，每一步都需要先擲骰子
            const diceResult = Math.floor(Math.random() * 6) + 1;
            const diceState = this.gameEngine.rollDice(state, diceResult);

            // 如果沒有可移動的棋子，切換到下一個玩家狀態
            if (!diceState._movableChessIds || diceState._movableChessIds.size === 0) {
                state = diceState;
                depth++;
                continue;
            }

            // 隨機選擇一個可移動的棋子
            const actions = this.getLegalActions(diceState);
            if (actions.length === 0) {
                break;
            }

            const randomIndex = Math.floor(Math.random() * actions.length);
            const randomAction = actions[randomIndex];
            state = this.gameEngine.moveChess(diceState, randomAction.chessId);
            depth++;
        }

        return this.calculateReward(state, node.gameState.currentPlayer);
    }

    /**
     * 📊 反向傳播階段 - 更新節點統計信息
     */
    backpropagate(node, result) {
        while (node !== null) {
            node.update(result);
            node = node.parent;
        }
    }

    /**
     * 🏆 獲取最佳子節點（基於UCT分數）
     */
    getBestChild(node) {
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

    /**
     * 🎯 從根節點獲取最佳動作
     */
    getBestAction(rootNode) {
        let bestAction = null;
        let bestVisits = -1;

        for (const child of rootNode.children) {
            if (child.visits > bestVisits) {
                bestVisits = child.visits;
                bestAction = child.action;
            }
        }

        return bestAction;
    }

    /**
     * 📋 獲取合法動作列表
     */
    getLegalActions(state) {
        if (!state._movableChessIds || state._movableChessIds.size === 0) {
            return [];
        }

        const actions = [];
        const movableChessIds = Array.from(state._movableChessIds);

        for (const chessId of movableChessIds) {
            actions.push({
                type: 'move',
                chessId: chessId
            });
        }

        return actions;
    }

    /**
     * 💰 計算獎勵值
     */
    calculateReward(finalState, originalPlayer) {
        if (finalState.isGameOver) {
            const winnerIndex = this.colorToPlayerIndex(finalState.winner);
            if (winnerIndex === originalPlayer) {
                return 1; // 勝利
            } else {
                return -1; // 失敗
            }
        }

        // 計算中間獎勵
        const playerColor = this.gameEngine.getPlayerColor(originalPlayer);
        const playerChess = finalState.players[playerColor];

        let reward = 0;

        // 完成的飛機獎勵
        const completed = playerChess.filter(chess => chess.state === 'goal').length;
        reward += completed * 0.3;

        // 在終點通道的飛機獎勵
        const inGoalPath = playerChess.filter(chess => chess.state === 'goal-path').length;
        reward += inGoalPath * 0.2;

        // 在跑道上的飛機獎勵
        const onPath = playerChess.filter(chess => chess.state === 'path').length;
        reward += onPath * 0.1;

        // 在家裡的飛機懲罰
        const atHome = playerChess.filter(chess => chess.state === 'home').length;
        reward -= atHome * 0.1;

        return Math.max(-1, Math.min(1, reward));
    }

    /**
     * 🎨 將顏色轉換為玩家索引
     */
    colorToPlayerIndex(color) {
        const colorMap = { 'red': 0, 'yellow': 1, 'green': 2, 'blue': 3 };
        return colorMap[color] || 0;
    }

    /**
     * 🧬 克隆遊戲狀態
     */
    cloneState(state) {
        const serialized = this.gameEngine.serializeState(state);
        return this.gameEngine.deserializeState(serialized);
    }

    /**
     * ⚙️ 設置MCTS迭代次數
     */
    setIterations(iterations) {
        this.mctsIterations = iterations;
    }
}

export const gameAI = new GameAI(gameEngine);