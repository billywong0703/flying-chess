/* eslint-disable no-case-declarations */
// gameEngine.js

// =============================================================================
// 遊戲配置和常量
// =============================================================================

export const GAME_CONFIG = {
    PLAYER_COLORS: ["red", "yellow", "green", "blue"],
    PLAYER_ORDER: { 0: "red", 1: "yellow", 2: "green", 3: "blue" },
    DICE_REQUIRED_FOR_TAKEOFF: 6,
    MAX_CONSECUTIVE_SIXES: 3,
    JUMP_STEPS: 4,
    RING_START: 16,
    RING_SIZE: 52,
};

export const PATH_MAP = {
    // 家區格子
    0: { x: 1, y: 1, type: "home-base", player: "red" },
    1: { x: 1, y: 3, type: "home-base", player: "red" },
    2: { x: 3, y: 1, type: "home-base", player: "red" },
    3: { x: 3, y: 3, type: "home-base", player: "red" },
    4: { x: 13, y: 1, type: "home-base", player: "green" },
    5: { x: 13, y: 3, type: "home-base", player: "green" },
    6: { x: 15, y: 1, type: "home-base", player: "green" },
    7: { x: 15, y: 3, type: "home-base", player: "green" },
    8: { x: 1, y: 13, type: "home-base", player: "blue" },
    9: { x: 1, y: 15, type: "home-base", player: "blue" },
    10: { x: 3, y: 13, type: "home-base", player: "blue" },
    11: { x: 3, y: 15, type: "home-base", player: "blue" },
    12: { x: 13, y: 13, type: "home-base", player: "yellow" },
    13: { x: 13, y: 15, type: "home-base", player: "yellow" },
    14: { x: 15, y: 13, type: "home-base", player: "yellow" },
    15: { x: 15, y: 15, type: "home-base", player: "yellow" },

    // 外圈跑道
    16: { x: 3, y: 4, color: "blue", type: "path" },
    17: { x: 2, y: 4, color: "red", type: "path" },
    18: { x: 1, y: 4, color: "green", type: "path" },
    19: { x: 1, y: 5, color: "yellow", type: "path" },
    20: { x: 1, y: 6, color: "blue", type: "path" },
    21: { x: 1, y: 7, color: "red", type: "path" },
    22: { x: 1, y: 8, color: "green", type: "goal-entry", player: "green" },
    23: { x: 1, y: 9, color: "yellow", type: "path" },
    24: { x: 1, y: 10, color: "blue", type: "path" },
    25: { x: 1, y: 11, color: "red", type: "path" },
    26: { x: 1, y: 12, color: "green", type: "start", player: "green" },
    27: { x: 2, y: 12, color: "yellow", type: "path" },
    28: { x: 3, y: 12, color: "blue", type: "path" },
    29: { x: 4, y: 13, color: "red", type: "path" },
    30: { x: 4, y: 14, color: "green", type: "path" },
    31: { x: 4, y: 15, color: "yellow", type: "path" },
    32: { x: 5, y: 15, color: "blue", type: "path" },
    33: { x: 6, y: 15, color: "red", type: "path" },
    34: { x: 7, y: 15, color: "green", type: "path" },
    35: { x: 8, y: 15, color: "yellow", type: "goal-entry", player: "yellow" },
    36: { x: 9, y: 15, color: "blue", type: "path" },
    37: { x: 10, y: 15, color: "red", type: "path" },
    38: { x: 11, y: 15, color: "green", type: "path" },
    39: { x: 12, y: 15, color: "yellow", type: "start", player: "yellow" },
    40: { x: 12, y: 14, color: "blue", type: "path" },
    41: { x: 12, y: 13, color: "red", type: "path" },
    42: { x: 13, y: 12, color: "green", type: "path" },
    43: { x: 14, y: 12, color: "yellow", type: "path" },
    44: { x: 15, y: 12, color: "blue", type: "path" },
    45: { x: 15, y: 11, color: "red", type: "path" },
    46: { x: 15, y: 10, color: "green", type: "path" },
    47: { x: 15, y: 9, color: "yellow", type: "path" },
    48: { x: 15, y: 8, color: "blue", type: "goal-entry", player: "blue" },
    49: { x: 15, y: 7, color: "red", type: "path" },
    50: { x: 15, y: 6, color: "green", type: "path" },
    51: { x: 15, y: 5, color: "yellow", type: "path" },
    52: { x: 15, y: 4, color: "blue", type: "start", player: "blue" },
    53: { x: 14, y: 4, color: "red", type: "path" },
    54: { x: 13, y: 4, color: "green", type: "path" },
    55: { x: 12, y: 3, color: "yellow", type: "path" },
    56: { x: 12, y: 2, color: "blue", type: "path" },
    57: { x: 12, y: 1, color: "red", type: "path" },
    58: { x: 11, y: 1, color: "green", type: "path" },
    59: { x: 10, y: 1, color: "yellow", type: "path" },
    60: { x: 9, y: 1, color: "blue", type: "path" },
    61: { x: 8, y: 1, color: "red", type: "goal-entry", player: "red" },
    62: { x: 7, y: 1, color: "green", type: "path" },
    63: { x: 6, y: 1, color: "yellow", type: "path" },
    64: { x: 5, y: 1, color: "blue", type: "path" },
    65: { x: 4, y: 1, color: "red", type: "start", player: "red" },
    66: { x: 4, y: 2, color: "green", type: "path" },
    67: { x: 4, y: 3, color: "yellow", type: "path" },

    // 家門通道
    68: { x: 8, y: 2, color: "red", type: "goal-path", player: "red" },
    69: { x: 8, y: 3, color: "red", type: "goal-path", player: "red" },
    70: { x: 8, y: 4, color: "red", type: "goal-path", player: "red" },
    71: { x: 8, y: 5, color: "red", type: "goal-path", player: "red" },
    72: { x: 8, y: 6, color: "red", type: "goal-path", player: "red" },
    73: { x: 8, y: 7, color: "red", type: "goal", player: "red" },

    74: { x: 8, y: 14, color: "yellow", type: "goal-path", player: "yellow" },
    75: { x: 8, y: 13, color: "yellow", type: "goal-path", player: "yellow" },
    76: { x: 8, y: 12, color: "yellow", type: "goal-path", player: "yellow" },
    77: { x: 8, y: 11, color: "yellow", type: "goal-path", player: "yellow" },
    78: { x: 8, y: 10, color: "yellow", type: "goal-path", player: "yellow" },
    79: { x: 8, y: 9, color: "yellow", type: "goal", player: "yellow" },

    80: { x: 2, y: 8, color: "green", type: "goal-path", player: "green" },
    81: { x: 3, y: 8, color: "green", type: "goal-path", player: "green" },
    82: { x: 4, y: 8, color: "green", type: "goal-path", player: "green" },
    83: { x: 5, y: 8, color: "green", type: "goal-path", player: "green" },
    84: { x: 6, y: 8, color: "green", type: "goal-path", player: "green" },
    85: { x: 7, y: 8, color: "green", type: "goal", player: "green" },

    86: { x: 14, y: 8, color: "blue", type: "goal-path", player: "blue" },
    87: { x: 13, y: 8, color: "blue", type: "goal-path", player: "blue" },
    88: { x: 12, y: 8, color: "blue", type: "goal-path", player: "blue" },
    89: { x: 11, y: 8, color: "blue", type: "goal-path", player: "blue" },
    90: { x: 10, y: 8, color: "blue", type: "goal-path", player: "blue" },
    91: { x: 9, y: 8, color: "blue", type: "goal", player: "blue" },
};

export const PLAYER_POSITIONS = {
    START: {
        red: 65,
        yellow: 39,
        green: 26,
        blue: 52,
    },
    GOAL_ENTRY: {
        red: 61,
        blue: 48,
        green: 22,
        yellow: 35,
    },
    GOAL_PATH_ENTRY: {
        red: 68,
        blue: 86,
        green: 80,
        yellow: 74,
    },
    HOME_BASE_SLOTS: {
        red: [0, 1, 2, 3],
        blue: [4, 5, 6, 7],
        green: [8, 9, 10, 11],
        yellow: [12, 13, 14, 15],
    },
};

// =============================================================================
// 主遊戲引擎類
// =============================================================================

class FlyingChessEngine {
    constructor(GAME_CONFIG, PATH_MAP, PLAYER_POSITIONS) {
        this.config = GAME_CONFIG;
        this.pathMap = PATH_MAP;
        this.playerPositions = PLAYER_POSITIONS;
    }

    // ===========================================================================
    // 🎮 公共遊戲API
    // ===========================================================================

    /**
     * 創建初始遊戲狀態
     */
    createInitialState() {
        return {
            currentPlayer: 0,
            consecutiveSixCount: 0,
            players: this._initializePlayers(),
            winner: null,
            isGameOver: false,
        };
    }

    /**
     * 處理骰子擲出
     */
    rollDice(state, diceResult) {
        const currentState = this.cloneState(state);

        const playerColor = this.config.PLAYER_ORDER[state.currentPlayer];
        const newConsecutiveSixCount = diceResult === this.config.DICE_REQUIRED_FOR_TAKEOFF ? currentState.consecutiveSixCount + 1 : 0;

        // 處理連續三次6的處罰
        if (newConsecutiveSixCount === this.config.MAX_CONSECUTIVE_SIXES) {
            return this._handleThreeSixesPenalty(currentState, playerColor);
        }

        // 找出可移動的棋子
        const movableChessIds = this._findMovableChess(
            currentState.players[playerColor],
            diceResult
        );

        // 🆕 如果沒有可移動的棋子，自動轉換到下一玩家
        if (movableChessIds.size === 0) {
            return {
                ...currentState,
                currentPlayer: this._getNextPlayer(currentState.currentPlayer),
                consecutiveSixCount: 0, // 重置連續6計數
                _movableChessIds: movableChessIds,
                _lastAction: 'no_movable_chess',
                _lastDiceResult: diceResult,
            };
        }

        return {
            ...currentState,
            consecutiveSixCount: newConsecutiveSixCount,
            _movableChessIds: movableChessIds,
            _lastAction: 'dice_roll',
            _lastDiceResult: diceResult,
        };
    }

    /**
     * 移動指定棋子
     */
    moveChess(state, chessId) {
        const currentState = this.cloneState(state);
        const [playerColor, chessIndex] = chessId.split("-");
        const chess = currentState.players[playerColor][parseInt(chessIndex)];
        const diceValue = currentState._lastDiceResult;

        let updatedPlayers = currentState.players;

        // 執行移動邏輯
        const updatedChess = this._executeMove(chess, playerColor, diceValue);
        updatedPlayers[playerColor][parseInt(chessIndex)] = updatedChess;

        // 處理疊棋
        updatedPlayers = this._updateStackedChess(
            updatedPlayers,
            chess,
            updatedChess.position,
            updatedChess.state
        );

        // 處理踢對手
        updatedPlayers = this._kickOpponents(
            updatedPlayers,
            updatedChess.position,
            playerColor
        );

        // 檢查勝利條件
        const winner = this._checkWinCondition(updatedPlayers);
        const isGameOver = !!winner;

        // 決定下一位玩家
        const shouldReroll = diceValue === this.config.DICE_REQUIRED_FOR_TAKEOFF;
        const nextPlayer = shouldReroll && !isGameOver
            ? currentState.currentPlayer
            : this._getNextPlayer(currentState.currentPlayer);

        return {
            ...currentState,
            players: updatedPlayers,
            currentPlayer: nextPlayer,
            winner,
            isGameOver,
            _movableChessIds: new Set(),
            _lastDiceResult: 0,
            _lastAction: 'move',
            _lastMovedChess: chessId,
        };
    }
    /**
     * 檢查移動是否有效
     */
    isValidMove(currentState, chessId) {
        if (!currentState._movableChessIds) return false;
        return currentState._movableChessIds.has(chessId);
    }

    /**
     * 獲取玩家顏色
     */
    getPlayerColor(playerIndex) {
        return this.config.PLAYER_ORDER[playerIndex];
    }

    /**
     * 獲取格子信息
     */
    getCellInfo(position) {
        return this.pathMap[position];
    }

    // ===========================================================================
    // 🧠 遊戲狀態管理
    // ===========================================================================

    /**
     * 初始化所有玩家和棋子
     */
    _initializePlayers() {
        return {
            red: this._createPlayerPieces("red", [0, 1, 2, 3]),
            blue: this._createPlayerPieces("blue", [4, 5, 6, 7]),
            green: this._createPlayerPieces("green", [8, 9, 10, 11]),
            yellow: this._createPlayerPieces("yellow", [12, 13, 14, 15]),
        };
    }

    /**
     * 創建玩家棋子
     */
    _createPlayerPieces(color, positions) {
        return positions.map((pos, index) => ({
            id: `${color}-${index}`,
            state: "home",
            position: pos,
        }));
    }

    /**
     * 處理連續三次6的處罰
     */
    _handleThreeSixesPenalty(currentState, playerColor) {
        const updatedPlayers = this.cloneState(currentState).players;

        // 將所有在跑道上的飛機返回基地
        updatedPlayers[playerColor] = updatedPlayers[playerColor].map((chess, index) => {
            if (chess.state !== "home") {
                return {
                    ...chess,
                    state: "home",
                    position: this.playerPositions.HOME_BASE_SLOTS[playerColor][index],
                };
            }
            return chess;
        });

        return {
            ...currentState,
            players: updatedPlayers,
            currentPlayer: this._getNextPlayer(currentState.currentPlayer),
            consecutiveSixCount: 0,
            _lastDiceResult: 6,
            _movableChessIds: new Set(),
            _lastAction: 'penalty',
        };
    }

    /**
     * 檢查勝利條件
     */
    _checkWinCondition(players) {
        for (const [color, chessList] of Object.entries(players)) {
            const allInGoal = chessList.every((chess) => chess.state === "goal");
            if (allInGoal) {
                return color;
            }
        }
        return null;
    }

    // ===========================================================================
    // 🎲 骰子邏輯
    // ===========================================================================

    /**
     * 找出可移動的棋子
     */
    _findMovableChess(playerChess, diceResult) {
        const movableChessIds = [];

        for (const chess of playerChess) {
            if (chess.state === "path") movableChessIds.push(chess.id);
            if (chess.state === "home" && diceResult === this.config.DICE_REQUIRED_FOR_TAKEOFF) {
                movableChessIds.push(chess.id);
            }
            if (chess.state === "goal-path") movableChessIds.push(chess.id);
        }

        return new Set(movableChessIds);
    }

    // ===========================================================================
    // 🚀 移動系統
    // ===========================================================================

    /**
     * 執行棋子移動
     */
    _executeMove(chess, playerColor, diceResult) {
        let updatedChess = { ...chess };

        switch (chess.state) {
            case "home":
                if (diceResult === this.config.DICE_REQUIRED_FOR_TAKEOFF) {
                    updatedChess = this._handleTakeoff(chess, playerColor);
                }
                break;

            case "path":
                const pathResult = this._handlePathMovement(chess, playerColor, diceResult);
                updatedChess.position = pathResult.newPosition;
                updatedChess.state = pathResult.newState;
                break;

            case "goal-path":
                const goalResult = this._handleGoalPathMovement(chess, playerColor, diceResult);
                updatedChess.position = goalResult.newPosition;
                updatedChess.state = goalResult.newState;
                break;

            default:
                break;
        }

        return updatedChess;
    }

    /**
     * 處理起飛
     */
    _handleTakeoff(chess, playerColor) {
        return {
            ...chess,
            state: "path",
            position: this.playerPositions.START[playerColor],
        };
    }

    /**
     * 處理跑道移動
     */
    _handlePathMovement(chess, playerColor, diceResult) {
        let newPosition = this._getNextPathPos(chess.position, diceResult);
        let newState = "path";

        // 檢查是否經過家門入口
        if (this._willPassGoalEntry(chess.position, newPosition, playerColor)) {
            const stepsToEntry = this._getStepsToGoalEntry(
                chess.position,
                this.playerPositions.GOAL_ENTRY[playerColor]
            );
            const remainingSteps = diceResult - stepsToEntry;

            if (remainingSteps > 0) {
                newPosition = this.playerPositions.GOAL_PATH_ENTRY[playerColor] + remainingSteps - 1;
                const goalEnd = this.playerPositions.GOAL_PATH_ENTRY[playerColor] + 5;
                newState = newPosition >= goalEnd ? "goal" : "goal-path";
                return { newPosition, newState };
            }
        }

        // 跳躍規則：走到自己顏色的格子
        if (this.pathMap[newPosition] &&
            this.pathMap[newPosition].color === playerColor &&
            newPosition !== this.playerPositions.GOAL_ENTRY[playerColor]) {
            newPosition = this._getNextPathPos(newPosition, this.config.JUMP_STEPS);
        }

        return { newPosition, newState };
    }

    /**
     * 處理家門通道移動
     */
    _handleGoalPathMovement(chess, playerColor, diceResult) {
        const goalPathEntry = this.playerPositions.GOAL_PATH_ENTRY[playerColor];
        const goalEnd = goalPathEntry + 5;
        const currentPosition = chess.position;

        const stepsToGoal = goalEnd - currentPosition;

        let newPosition;
        let newState;

        if (diceResult <= stepsToGoal) {
            // 正常移動，沒有超過終點
            newPosition = currentPosition + diceResult;
            newState = newPosition === goalEnd ? "goal" : "goal-path";
        } else {
            // 超過終點，需要後退
            const overshoot = diceResult - stepsToGoal;
            newPosition = goalEnd - overshoot;
            newState = "goal-path";

            // 確保不會後退到家門通道入口之前
            if (newPosition < goalPathEntry) {
                newPosition = goalPathEntry;
            }
        }

        return { newPosition, newState };
    }

    // ===========================================================================
    // ⚡ 互動系統
    // ===========================================================================

    /**
     * 踢掉對手棋子
     */
    _kickOpponents(players, position, attackerColor) {
        const updatedPlayers = { ...players };

        this.config.PLAYER_COLORS.forEach((color) => {
            if (color === attackerColor) return;

            const opponentChessList = updatedPlayers[color].filter(
                (chess) => chess.position === position && chess.state !== "home" && chess.state !== "goal"
            );

            const freeSlots = this._getFreeHomeSlots(updatedPlayers, color);

            opponentChessList.forEach((opponentChess, index) => {
                const chessIndex = updatedPlayers[color].findIndex(
                    (chess) => chess.id === opponentChess.id
                );

                if (chessIndex !== -1 && index < freeSlots.length) {
                    updatedPlayers[color][chessIndex] = {
                        ...updatedPlayers[color][chessIndex],
                        state: "home",
                        position: freeSlots[index],
                    };
                }
            });
        });

        return updatedPlayers;
    }

    /**
     * 處理疊棋移動
     */
    _updateStackedChess(players, targetChess, newPosition, newState) {
        const updatedPlayers = { ...players };
        const stackedChess = this._findStackedChess(updatedPlayers, targetChess);

        const allChessToUpdate = [targetChess, ...stackedChess];

        allChessToUpdate.forEach((chess) => {
            const [playerColor, chessIndex] = chess.id.split("-");
            updatedPlayers[playerColor][parseInt(chessIndex)].position = newPosition;
            updatedPlayers[playerColor][parseInt(chessIndex)].state = newState;
        });

        return updatedPlayers;
    }

    /**
     * 找出相同位置的疊棋
     */
    _findStackedChess(players, targetChess) {
        const { id, position, state } = targetChess;
        const [playerColor] = id.split("-");

        if (!players[playerColor]) return [];

        return players[playerColor].filter(
            (chess) =>
                chess.id !== id &&
                chess.position === position &&
                chess.state === state
        );
    }

    // ===========================================================================
    // 📍 位置計算工具
    // ===========================================================================

    /**
     * 計算環形跑道位置
     */
    _getNextPathPos(currentPos, steps) {
        const { RING_START, RING_SIZE } = this.config;
        const ringIndex = currentPos - RING_START;
        const newRingIndex = (ringIndex + steps) % RING_SIZE;
        return RING_START + newRingIndex;
    }

    /**
     * 檢查是否經過家門入口
     */
    _willPassGoalEntry(currentPos, newPos, playerColor) {
        const entryPos = this.playerPositions.GOAL_ENTRY[playerColor];
        const { RING_START } = this.config;

        if (currentPos <= entryPos && newPos >= entryPos) {
            return true;
        }

        if (currentPos >= newPos && newPos >= RING_START) {
            return entryPos >= RING_START && entryPos <= newPos;
        }

        return false;
    }

    /**
     * 計算到入口點的步數
     */
    _getStepsToGoalEntry(currentPos, entryPos) {
        const { RING_START, RING_SIZE } = this.config;

        if (currentPos <= entryPos) {
            return entryPos - currentPos;
        } else {
            return RING_SIZE - currentPos + RING_START + (entryPos - RING_START);
        }
    }

    /**
     * 獲取空的家區位置
     */
    _getFreeHomeSlots(players, color) {
        const homeSlots = this.playerPositions.HOME_BASE_SLOTS[color];
        const occupiedSlots = new Set(
            players[color]
                .filter((chess) => chess.state === "home")
                .map((chess) => chess.position)
        );
        return homeSlots.filter((slot) => !occupiedSlots.has(slot));
    }

    // ===========================================================================
    // 🔄 玩家管理
    // ===========================================================================

    /**
     * 獲取下一位玩家
     */
    _getNextPlayer(currentPlayer) {
        return (currentPlayer + 1) % this.config.PLAYER_COLORS.length;
    }

    // ===========================================================================
    // 💾 數據持久化
    // ===========================================================================
    /**
     * 高效深度拷貝遊戲狀態
     * 避免 JSON 序列化開銷，精確處理 Set、物件嵌套
     */
    cloneState(state) {
        return {
            // 基本屬性：直接複製
            currentPlayer: state.currentPlayer,
            consecutiveSixCount: state.consecutiveSixCount,
            winner: state.winner,
            isGameOver: state.isGameOver,

            // 玩家棋子：深度複製每個玩家
            players: {
                red: this._clonePlayerChess(state.players.red),
                yellow: this._clonePlayerChess(state.players.yellow),
                green: this._clonePlayerChess(state.players.green),
                blue: this._clonePlayerChess(state.players.blue),
            },

            // MCTS 臨時屬性
            _movableChessIds: state._movableChessIds ? new Set(state._movableChessIds) : new Set(),
            _lastDiceResult: state._lastDiceResult || 0,
            _lastAction: state._lastAction,
            _lastMovedChess: state._lastMovedChess,
        };
    }

    /**
     * 深度複製單一玩家的 4 顆棋子
     */
    _clonePlayerChess(chessArray) {
        return chessArray.map(chess => ({
            id: chess.id,
            state: chess.state,
            position: chess.position,
        }));
    }

    /**
     * 序列化遊戲狀態
     */
    serializeState(state) {
        return JSON.stringify({
            ...state,
            _movableChessIds: state._movableChessIds ? Array.from(state._movableChessIds) : [],
        });
    }

    /**
     * 反序列化遊戲狀態
     */
    deserializeState(serializedState) {
        const state = JSON.parse(serializedState);
        return {
            ...state,
            _movableChessIds: new Set(state._movableChessIds || []),
        };
    }
}

// 導出單例實例
export const gameEngine = new FlyingChessEngine(GAME_CONFIG, PATH_MAP, PLAYER_POSITIONS);