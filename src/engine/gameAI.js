import { gameEngine } from "./gameEngine";
import { MCTSNode } from "./NctsNode";

/**
 * 飛行棋AI主類
 */
class GameAI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentState = null;
        this.mctsIterations = 300;
    }

    startNewGame() {
        this.currentState = this.gameEngine.createInitialState();
        return this.currentState;
    }

    playAITurn() {
        if (this.currentState.isGameOver) {
            return null;
        }

        const diceResult = Math.floor(Math.random() * 6) + 1;
        this.currentState = this.gameEngine.rollDice(this.currentState, diceResult);

        if (this.currentState._movableChessIds.size > 0) {
            const bestAction = this.mctsSearch(this.currentState);
            if (bestAction) {
                this.currentState = this.gameEngine.moveChess(this.currentState, bestAction.chessId);
            }
        }

        return this.currentState;
    }

    mctsSearch(currentState) {
        const rootNode = new MCTSNode(currentState);

        for (let i = 0; i < this.mctsIterations; i++) {
            let node = rootNode;
            node = this.select(node);

            if (!node.isTerminal()) {
                node = this.expand(node);
            }

            const result = this.simulate(node);
            this.backpropagate(node, result);
        }

        return this.getBestAction(rootNode);
    }

    select(node) {
        while (node.isFullyExpanded() && !node.isTerminal()) {
            node = this.getBestChild(node);
        }
        return node;
    }

    expand(node) {
        const action = node.selectUntriedAction();
        if (!action) {
            return node;
        }

        const nextState = this.executeAction(node.gameState, action);
        return node.addChild(nextState, action);
    }

    simulate(node) {
        let state = this.cloneState(node.gameState);
        let depth = 0;
        const maxDepth = 50;

        while (!state.isGameOver && depth < maxDepth) {
            const actions = this.getLegalActions(state);
            if (actions.length === 0) {
                break;
            }

            const randomIndex = Math.floor(Math.random() * actions.length);
            const randomAction = actions[randomIndex];
            state = this.executeAction(state, randomAction);
            depth++;
        }

        return this.calculateReward(state, node.gameState.currentPlayer);
    }

    backpropagate(node, result) {
        while (node !== null) {
            node.update(result);
            node = node.parent;
        }
    }

    /**
     * 獲取最佳子節點（基於UCT分數）
     */
    getBestChild(node) {
        let bestChild = null;
        let bestScore = -1;

        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            const score = child.getUCTScore(node.visits);

            if (score > bestScore) {
                bestScore = score;
                bestChild = child;
            }
        }

        return bestChild;
    }

    getBestAction(rootNode) {
        let bestAction = null;
        let bestVisits = -1;

        for (let i = 0; i < rootNode.children.length; i++) {
            const child = rootNode.children[i];
            if (child.visits > bestVisits) {
                bestVisits = child.visits;
                bestAction = child.action;
            }
        }

        return bestAction;
    }

    executeAction(state, action) {
        return this.gameEngine.moveChess(this.cloneState(state), action.chessId);
    }

    cloneState(state) {
        const serialized = this.gameEngine.serializeState(state);
        return this.gameEngine.deserializeState(serialized);
    }

    getLegalActions(state) {
        if (!state._movableChessIds) {
            return [];
        }

        const actions = [];
        const movableChessIds = Array.from(state._movableChessIds);

        for (let i = 0; i < movableChessIds.length; i++) {
            actions.push({
                type: 'move',
                chessId: movableChessIds[i]
            });
        }

        return actions;
    }

    calculateReward(finalState, originalPlayer) {
        if (finalState.isGameOver) {
            const winnerIndex = this.colorToPlayerIndex(finalState.winner);
            if (winnerIndex === originalPlayer) {
                return 1;
            } else {
                return 0;
            }
        }
        return 0;
    }

    colorToPlayerIndex(color) {
        if (color === 'red') return 0;
        if (color === 'yellow') return 1;
        if (color === 'green') return 2;
        if (color === 'blue') return 3;
        return 0;
    }

    setIterations(iterations) {
        this.mctsIterations = iterations;
    }

    printState() {
        const state = this.currentState;
        console.log(`玩家: ${state.currentPlayer}, 結束: ${state.isGameOver}, 勝利: ${state.winner || "無"}`);
    }
}

export const gameAI = new GameAI(gameEngine);