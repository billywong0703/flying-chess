/**
 * MCTS節點類 - 表示遊戲狀態樹中的一個節點
 */
class MCTSNode {
    constructor(gameState, parent = null, action = null) {
        this.gameState = gameState;      // 🎮 當前遊戲狀態
        this.parent = parent;            // 👨‍👦 父節點引用
        this.action = action;            // 🎯 導致此節點的動作
        this.children = [];              // 🌱 子節點列表
        this.visits = 0;                 // 📊 節點訪問次數
        this.wins = 0;                   // 🏆 節點勝利次數/累積獎勵
        this.untriedActions = null;      // 📦 尚未嘗試的動作列表
    }

    /**
     * ✅ 檢查節點是否完全擴展
     */
    isFullyExpanded(getActionsCallback = null) {
        if (this.untriedActions === null) {
            this.untriedActions = getActionsCallback(this.gameState);
        }
        return this.untriedActions.length === 0;
    }

    /**
     * 🏁 檢查節點是否為終止狀態（遊戲結束）
     */
    isTerminal() {
        return this.gameState.isGameOver;
    }

    /**
     * 🎲 從未嘗試的動作中選擇一個動作
     */
    selectUntriedAction(getActionsCallback = null) {
        // 如果未初始化，先獲取合法動作
        if (this.untriedActions === null) {
            this.untriedActions = getActionsCallback(this.gameState);
        }

        // 如果沒有未嘗試的動作，返回null
        if (this.untriedActions.length === 0) {
            return null;
        }

        // 從未嘗試動作列表中取出一個動作（後進先出）
        return this.untriedActions.pop();
    }

    /**
     * 📈 計算UCT（上限置信區間）分數
     */
    getUCTScore(totalVisits, explorationParam = 1.414) {
        // 如果節點從未被訪問過，返回最大分數以鼓勵探索
        if (this.visits === 0) {
            return Number.MAX_VALUE;
        }

        // 開發項：當前節點的勝率
        const exploitation = this.wins / this.visits;
        // 探索項：鼓勵訪問次數較少的節點
        const exploration = explorationParam * Math.sqrt(Math.log(totalVisits) / this.visits);

        return exploitation + exploration;
    }

    /**
     * 👶 添加子節點
     */
    addChild(gameState, action) {
        const childNode = new MCTSNode(gameState, this, action);
        this.children.push(childNode);
        return childNode;
    }

    /**
     * 📊 更新節點統計信息
     */
    update(result) {
        this.visits += 1;    // 增加訪問次數
        this.wins += result; // 累積獎勵
    }
}

export default MCTSNode;