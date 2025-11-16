import { gameEngine } from "./gameEngine";
import MCTSNode from "./MCTSNode";

class GameAI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.mctsIterations = 500;
        this.maxDepth = 200;
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

        // 🎯 關鍵：過濾只考慮實際骰子點數的動作
        if (diceState._lastDiceResult !== 0) {
            rootNode.untriedActions = this.getLegalActions(diceState).filter(action => action.dice === diceState._lastDiceResult);
        }

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
        while (node.isFullyExpanded(this.generateActions.bind(this)) && !node.isTerminal()) {
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
        const action = node.selectUntriedAction(this.generateActions.bind(this));
        if (!action) {
            return node;
        }

        let diceState = node.gameState;

        if (node.gameState._lastDiceResult === 0) {
            diceState = this.gameEngine.rollDice(node.gameState, action.dice)
        }

        const nextState = this.gameEngine.moveChess(diceState, action.chessId);

        return node.addChild(nextState, action);
    }

    /**
     * 🎲 模擬階段 - 隨機模擬遊戲直到結束
     */
    simulate(node) {
        let state = this.cloneState(node.gameState);
        let depth = 0;

        while (!state.isGameOver && depth < this.maxDepth) {
            // 1. 隨機擲骰子
            const dice = Math.floor(Math.random() * 6) + 1;
            const diceState = this.gameEngine.rollDice(state, dice);

            // 2. 檢查是否有可移動棋子
            if (!diceState._movableChessIds || diceState._movableChessIds.size === 0) {
                state = diceState; // 換玩家
                depth++;
                continue;
            }

            // 3. 隨機選擇動作
            const chessIds = Array.from(diceState._movableChessIds);
            const chessId = chessIds[Math.floor(Math.random() * chessIds.length)];
            state = this.gameEngine.moveChess(diceState, chessId);
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
                chessId: chessId,
                dice: state._lastDiceResult
            });
        }

        return actions;
    }

    /**
     * 🛠️ 動作生成器（依賴注入的核心）
     */
    generateActions(gameState) {
        const actions = [];

        // 考慮所有可能的骰子點數 (1-6)

        for (let dice = 1; dice <= 6; dice++) {
            // 模擬擲這個點數的骰子
            const diceState = this.gameEngine.rollDice(gameState, dice);

            // 如果沒有可移動的棋子，跳過這個骰子點數
            if (!diceState._movableChessIds || diceState._movableChessIds.size === 0) {
                continue;
            }

            // 為每個可移動的棋子創建動作
            const movableChessIds = Array.from(diceState._movableChessIds);
            for (const chessId of movableChessIds) {
                actions.push({
                    type: 'move',
                    dice: dice,      // 🎲 骰子點數
                    chessId: chessId // ♟️ 棋子選擇
                });
            }
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

        return 0;
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