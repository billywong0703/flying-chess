/**
 * MCTS節點類 - 表示遊戲狀態樹中的一個節點
 */
class MCTSNode {
    constructor(gameState, parent = null, action = null) {
        this.gameState = gameState;
        this.parent = parent;
        this.action = action;
        this.children = [];
        this.visits = 0;
        this.wins = 0;
        this.untriedActions = null;
    }

    isFullyExpanded() {
        if (this.untriedActions === null) {
            this.untriedActions = this.getLegalActions();
        }
        return this.untriedActions.length === 0;
    }

    isTerminal() {
        return this.gameState.isGameOver;
    }

    getLegalActions() {
        if (!this.gameState._movableChessIds ||
            this.gameState._movableChessIds.size === 0) {
            return [];
        }

        const actions = [];
        const movableChessIds = Array.from(this.gameState._movableChessIds);

        for (let i = 0; i < movableChessIds.length; i++) {
            actions.push({
                type: 'move',
                chessId: movableChessIds[i]
            });
        }

        return actions;
    }

    selectUntriedAction() {
        if (this.untriedActions === null) {
            this.untriedActions = this.getLegalActions();
        }

        if (this.untriedActions.length === 0) {
            return null;
        }

        return this.untriedActions.pop();
    }

    getUCTScore(totalVisits, explorationParam = 1.414) {
        if (this.visits === 0) {
            return Number.MAX_VALUE;
        }

        const exploitation = this.wins / this.visits;
        const exploration = explorationParam * Math.sqrt(Math.log(totalVisits) / this.visits);

        return exploitation + exploration;
    }

    addChild(gameState, action) {
        const childNode = new MCTSNode(gameState, this, action);
        this.children.push(childNode);
        return childNode;
    }

    update(result) {
        this.visits += 1;
        this.wins += result;
    }
}