import React, { useState, useEffect, useRef } from "react";
import "./Board.css";
import Chess from "./Chess";
import Dice from "./Dice";

// =============================================================================
// 【飛行棋遊戲完整註解版】- 新手友好說明
// =============================================================================

/**
 * 🎯 遊戲核心概念：
 * 這是一個四人飛行棋遊戲，每位玩家有4架飛機，目標是讓所有飛機從起點飛到終點
 *
 * 📋 遊戲規則摘要：
 * 1. 擲骰子：擲到6才能起飛，連續3次6會受罰
 * 2. 移動：按骰子點數移動，踩到對手飛機可將其踢回起點
 * 3. 跳躍：走到自己顏色格子可往前跳4格
 * 4. 終點：進入專屬通道後需精確移動到終點
 *
 * 🏗️ 程式架構設計：
 * 用「數字位置」來模擬真實棋盤，每個格子都有對應的數字編號
 * 棋子移動 = 目前位置 + 骰子點數，透過數學計算來處理環形跑道
 */

// =============================================================================
// 遊戲地圖定義 - 用數字代表棋盤上的每個位置
// =============================================================================

/**
 * 🗺️ 地圖設計原理：
 * 為什麼用數字當key？ → 方便計算移動，棋子位置就是數字，加減骰子點數就能移動
 * 為什麼要有type？ → 不同類型的格子有不同的遊戲規則
 */
const PATH_MAP = {
  // 🏠 家區格子（每位玩家4個起始位置）
  // 紅色 (左上)
  0: { x: 1, y: 1, type: "home-base", player: "red" },
  1: { x: 1, y: 3, type: "home-base", player: "red" },
  2: { x: 3, y: 1, type: "home-base", player: "red" },
  3: { x: 3, y: 3, type: "home-base", player: "red" },

  // 綠色 (右上)
  4: { x: 13, y: 1, type: "home-base", player: "green" },
  5: { x: 13, y: 3, type: "home-base", player: "green" },
  6: { x: 15, y: 1, type: "home-base", player: "green" },
  7: { x: 15, y: 3, type: "home-base", player: "green" },

  // 藍色 (左下)
  8: { x: 1, y: 13, type: "home-base", player: "blue" },
  9: { x: 1, y: 15, type: "home-base", player: "blue" },
  10: { x: 3, y: 13, type: "home-base", player: "blue" },
  11: { x: 3, y: 15, type: "home-base", player: "blue" },

  // 黃色 (右下)
  12: { x: 13, y: 13, type: "home-base", player: "yellow" },
  13: { x: 13, y: 15, type: "home-base", player: "yellow" },
  14: { x: 15, y: 13, type: "home-base", player: "yellow" },
  15: { x: 15, y: 15, type: "home-base", player: "yellow" },

  // 🛣️ 外圈跑道（52格環形路徑）
  // 外圈總共 52 格（16 ~ 67），每格有顏色標記（紅黃綠藍交錯）
  // 每個顏色的「起飛點」用 type: "start" 標記
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
  26: { x: 1, y: 12, color: "green", type: "start", player: "green" }, // 綠色起飛點
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
  39: { x: 12, y: 15, color: "yellow", type: "start", player: "yellow" }, // 黃色起飛點
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
  52: { x: 15, y: 4, color: "blue", type: "start", player: "blue" }, // 藍色起飛點
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
  65: { x: 4, y: 1, color: "red", type: "start", player: "red" }, // 紅色起飛點
  66: { x: 4, y: 2, color: "green", type: "path" },
  67: { x: 4, y: 3, color: "yellow", type: "path" },

  // 🚪 家門通道（進入終點前的專屬通道）
  // 紅色家門
  68: { x: 8, y: 2, color: "red", type: "goal-path", player: "red" }, // 入口
  69: { x: 8, y: 3, color: "red", type: "goal-path", player: "red" },
  70: { x: 8, y: 4, color: "red", type: "goal-path", player: "red" },
  71: { x: 8, y: 5, color: "red", type: "goal-path", player: "red" },
  72: { x: 8, y: 6, color: "red", type: "goal-path", player: "red" },
  73: { x: 8, y: 7, color: "red", type: "goal", player: "red" }, // 終點

  // 黃色家門
  74: { x: 8, y: 14, color: "yellow", type: "goal-path", player: "yellow" }, // 入口
  75: { x: 8, y: 13, color: "yellow", type: "goal-path", player: "yellow" },
  76: { x: 8, y: 12, color: "yellow", type: "goal-path", player: "yellow" },
  77: { x: 8, y: 11, color: "yellow", type: "goal-path", player: "yellow" },
  78: { x: 8, y: 10, color: "yellow", type: "goal-path", player: "yellow" },
  79: { x: 8, y: 9, color: "yellow", type: "goal", player: "yellow" }, // 終點

  // 綠色家門
  80: { x: 2, y: 8, color: "green", type: "goal-path", player: "green" }, // 入口
  81: { x: 3, y: 8, color: "green", type: "goal-path", player: "green" },
  82: { x: 4, y: 8, color: "green", type: "goal-path", player: "green" },
  83: { x: 5, y: 8, color: "green", type: "goal-path", player: "green" },
  84: { x: 6, y: 8, color: "green", type: "goal-path", player: "green" },
  85: { x: 7, y: 8, color: "green", type: "goal", player: "green" }, // 終點

  // 藍色家門
  86: { x: 14, y: 8, color: "blue", type: "goal-path", player: "blue" }, // 入口
  87: { x: 13, y: 8, color: "blue", type: "goal-path", player: "blue" },
  88: { x: 12, y: 8, color: "blue", type: "goal-path", player: "blue" },
  89: { x: 11, y: 8, color: "blue", type: "goal-path", player: "blue" },
  90: { x: 10, y: 8, color: "blue", type: "goal-path", player: "blue" },
  91: { x: 9, y: 8, color: "blue", type: "goal", player: "blue" }, // 終點
};

// =============================================================================
// 遊戲配置常數 - 集中管理容易修改的參數
// =============================================================================

const GAME_CONFIG = {
  PLAYER_COLORS: ["red", "yellow", "green", "blue"], // 玩家顏色順序
  PLAYER_ORDER: { 0: "red", 1: "yellow", 2: "green", 3: "blue" }, // 玩家編號對應
  DICE_REQUIRED_FOR_TAKEOFF: 6, // 起飛需要的骰子點數
  MAX_CONSECUTIVE_SIXES: 3, // 連續6次數上限（超過會受罰）
  JUMP_STEPS: 4, // 跳躍步數
  RING_START: 16, // 環形跑道起始編號
  RING_SIZE: 52, // 環形跑道總格數
};

// =============================================================================
// 玩家位置配置 - 定義每位玩家的關鍵位置
// =============================================================================

const PLAYER_POSITIONS = {
  // 🛫 起飛點：每位玩家從家區起飛後到達的位置
  START: {
    red: 65, // 紅色起飛點
    yellow: 39, // 黃色起飛點
    green: 26, // 綠色起飛點
    blue: 52, // 藍色起飛點
  },

  // 🚪 家門入口：從環形跑道進入家門通道的位置
  GOAL_ENTRY: {
    red: 61, // 紅色入口
    blue: 48, // 藍色入口
    green: 22, // 綠色入口
    yellow: 35, // 黃色入口
  },

  // 🏁 家門通道起點：進入專屬通道後的第一格
  GOAL_PATH_ENTRY: {
    red: 68, // 紅色通道起點
    blue: 86, // 藍色通道起點
    green: 80, // 綠色通道起點
    yellow: 74, // 黃色通道起點
  },

  // 🏠 家區位置：每位玩家4架飛機的起始位置
  HOME_BASE_SLOTS: {
    red: [0, 1, 2, 3], // 紅色家區
    blue: [4, 5, 6, 7], // 藍色家區
    green: [8, 9, 10, 11], // 綠色家區
    yellow: [12, 13, 14, 15], // 黃色家區
  },
};

// =============================================================================
// 遊戲工具函數 - 純函數，專注於遊戲邏輯計算
// =============================================================================

const GameUtils = {
  /**
   * 📍 計算環形跑道上的下一個位置
   * 為什麼要這樣計算？ → 因為跑道是環形的，超過52格要回到起點
   */
  getNextPathPos: (currentPos, steps) => {
    const { RING_START, RING_SIZE } = GAME_CONFIG;
    // 計算在環形中的索引位置（0-51）
    const ringIndex = currentPos - RING_START;
    // 使用模運算確保在環形內移動
    const newRingIndex = (ringIndex + steps) % RING_SIZE;
    // 轉回實際的位置編號
    return RING_START + newRingIndex;
  },

  /**
   * 🔍 檢查移動是否會經過家門入口
   * 為什麼需要這個檢查？ → 經過入口時要轉入家門通道
   */
  willPassGoalEntry: (currentPos, newPos, playerColor) => {
    const entryPos = PLAYER_POSITIONS.GOAL_ENTRY[playerColor];
    const { RING_START } = GAME_CONFIG;

    // 情況1：正常經過入口（從入口前移動到入口後）
    if (currentPos <= entryPos && newPos >= entryPos) {
      return true;
    }

    // 情況2：環形經過（繞了一圈後經過入口）
    if (currentPos >= newPos && newPos >= RING_START) {
      return entryPos >= RING_START && entryPos <= newPos;
    }

    return false;
  },

  /**
   * 📏 計算到入口點還需要多少步
   * 用途：當經過入口時，計算有多少步要用於進入家門通道
   */
  getStepsToGoalEntry: (currentPos, entryPos) => {
    const { RING_START, RING_SIZE } = GAME_CONFIG;

    if (currentPos <= entryPos) {
      // 簡單情況：目標在當前位置之後
      return entryPos - currentPos;
    } else {
      // 環形情況：需要繞過環形末端
      return RING_SIZE - currentPos + RING_START + (entryPos - RING_START);
    }
  },

  /**
   * 🏠 尋找空的家區位置
   * 用途：當飛機被踢回起點時，需要找一個空的起始位置
   */
  getFreeHomeSlot: (players, color) => {
    const homeSlots = PLAYER_POSITIONS.HOME_BASE_SLOTS[color];
    // 找出已經被佔用的家區位置
    const occupiedSlots = new Set(players[color].filter((chess) => chess.state === "home").map((chess) => chess.position));
    // 返回第一個空的位置
    return homeSlots.find((slot) => !occupiedSlots.has(slot));
  },
};

// =============================================================================
// 主棋盤元件 - 遊戲的核心控制器
// =============================================================================

const Board = () => {
  // 🎲 骰子相關狀態
  const diceValue = useRef(0); // 使用 ref 避免不必要的重渲染

  // ✨ 高亮顯示相關狀態
  const [highlightedChessIds, setHighlightedChessIds] = useState(new Set());

  // 🎮 遊戲核心狀態
  const [gameState, setGameState] = useState({
    currentPlayer: 0, // 當前玩家索引（0=紅, 1=黃, 2=綠, 3=藍）
    consecutiveSixCount: 0, // 連續擲出6的次數
    players: {
      // 每位玩家的4架飛機狀態
      red: [
        { id: "red-0", state: "home", position: 0 }, // state: home|path|goal-path|goal
        { id: "red-1", state: "home", position: 1 },
        { id: "red-2", state: "home", position: 2 },
        { id: "red-3", state: "home", position: 3 }, // 測試用：預先放一架在通道
      ],
      blue: [
        { id: "blue-0", state: "home", position: 4 },
        { id: "blue-1", state: "home", position: 5 },
        { id: "blue-2", state: "home", position: 6 },
        { id: "blue-3", state: "home", position: 7 },
      ],
      green: [
        { id: "green-0", state: "home", position: 8 },
        { id: "green-1", state: "home", position: 9 },
        { id: "green-2", state: "home", position: 10 },
        { id: "green-3", state: "home", position: 11 },
      ],
      yellow: [
        { id: "yellow-0", state: "home", position: 12 },
        { id: "yellow-1", state: "home", position: 13 },
        { id: "yellow-2", state: "home", position: 14 },
        { id: "yellow-3", state: "home", position: 15 },
      ],
    },
  });

  // ===========================================================================
  // 遊戲核心邏輯函數
  // ===========================================================================

  /**
   * 🔄 計算下一位玩家
   * 為什麼要這樣計算？ → 4位玩家循環，到最後一位後回到第一位
   */
  const getNextPlayer = (currentPlayer) => (currentPlayer + 1) % GAME_CONFIG.PLAYER_COLORS.length;

  /**
   * 🧹 換玩家時清除高亮顯示
   * 為什麼要用 useEffect？ → 確保在 currentPlayer 變化後立即執行
   */
  useEffect(() => {
    setHighlightedChessIds(new Set());
  }, [gameState.currentPlayer]);

  /**
   * 🎲 處理骰子擲出結果
   * 這是遊戲的核心流程：判斷哪些棋子可以移動
   */
  const handleDiceRoll = (diceResult) => {
    const playerColor = GAME_CONFIG.PLAYER_ORDER[gameState.currentPlayer];
    const playerChess = gameState.players[playerColor];
    diceValue.current = diceResult;

    // 🔢 更新連續6的計數
    const newConsecutiveSixCount = diceResult === GAME_CONFIG.DICE_REQUIRED_FOR_TAKEOFF ? gameState.consecutiveSixCount + 1 : 0;

    // ⚠️ 連續三次6的處罰：所有在跑道上的飛機回家
    if (newConsecutiveSixCount === GAME_CONFIG.MAX_CONSECUTIVE_SIXES) {
      const updatedPlayers = { ...gameState.players };
      updatedPlayers[playerColor] = playerChess.map((chess, index) => ({
        ...chess,
        state: "home", // 狀態改為在家
        position: PLAYER_POSITIONS.HOME_BASE_SLOTS[playerColor][index], // 回到起始位置
      }));

      setGameState({
        players: updatedPlayers,
        currentPlayer: getNextPlayer(gameState.currentPlayer), // 換下一位玩家
        consecutiveSixCount: 0, // 重置連續6計數
      });
      return;
    }

    // 🔍 找出可以移動的棋子
    const movableChessIds = [];
    for (const chess of playerChess) {
      // 情況1：在跑道上 → 任何點數都能移動
      if (chess.state === "path") movableChessIds.push(chess.id);

      // 情況2：在家裡 + 擲到6 → 可以起飛
      if (chess.state === "home" && diceResult === 6) movableChessIds.push(chess.id);

      // 情況3：在家門通道 → 任何點數都能移動（精確移動到終點）
      if (chess.state === "goal-path") movableChessIds.push(chess.id);
    }

    // 🚫 沒有可移動的棋子 → 直接換下家
    if (movableChessIds.length === 0) {
      setGameState((prev) => ({
        ...prev,
        currentPlayer: getNextPlayer(prev.currentPlayer),
        consecutiveSixCount: 0,
      }));
      return;
    }

    // ✨ 高亮顯示可以移動的棋子
    setHighlightedChessIds(new Set(movableChessIds));
    setGameState((prev) => ({
      ...prev,
      consecutiveSixCount: newConsecutiveSixCount,
    }));
  };

  /**
   * 🛫 處理飛機起飛
   * 從家區移動到跑道的起飛點
   */
  const handleTakeoff = (chess, playerColor) => ({
    ...chess,
    state: "path", // 狀態改為在跑道
    position: PLAYER_POSITIONS.START[playerColor], // 移動到起飛點
  });

  /**
   * 🛣️ 處理跑道移動
   * 在環形跑道上移動，處理跳躍和進入家門通道
   */
  const handlePathMovement = (chess, playerColor, diceResult) => {
    let newPosition = GameUtils.getNextPathPos(chess.position, diceResult);
    let newState = "path";

    // 🚪 檢查是否會經過家門入口
    if (GameUtils.willPassGoalEntry(chess.position, newPosition, playerColor)) {
      const stepsToEntry = GameUtils.getStepsToGoalEntry(chess.position, PLAYER_POSITIONS.GOAL_ENTRY[playerColor]);
      const remainingSteps = diceResult - stepsToEntry;

      // 有剩餘步數表示可以進入家門通道
      if (remainingSteps > 0) {
        newPosition = PLAYER_POSITIONS.GOAL_PATH_ENTRY[playerColor] + remainingSteps - 1;
        const goalEnd = PLAYER_POSITIONS.GOAL_PATH_ENTRY[playerColor] + 5;
        newState = newPosition >= goalEnd ? "goal" : "goal-path";
        return { newPosition, newState };
      }
    }

    // 🦘 特殊規則：走到自己顏色的格子 → 跳躍4步
    if (PATH_MAP[newPosition] && PATH_MAP[newPosition].color === playerColor && newPosition !== PLAYER_POSITIONS.GOAL_ENTRY[playerColor]) {
      newPosition = GameUtils.getNextPathPos(newPosition, GAME_CONFIG.JUMP_STEPS);
    }

    return { newPosition, newState };
  };

  /**
   * 🏁 處理家門通道移動
   * 在家門通道內精確移動，處理超過終點的情況
   */
  const handleGoalPathMovement = (chess, playerColor, diceResult) => {
    const goalPathEntry = PLAYER_POSITIONS.GOAL_PATH_ENTRY[playerColor];
    const goalEnd = goalPathEntry + 5; // 終點位置
    const currentPosition = chess.position;

    // 📏 計算到終點還需要多少步
    const stepsToGoal = goalEnd - currentPosition;

    let newPosition;
    let newState;

    if (diceResult <= stepsToGoal) {
      // 情況1：正常移動，沒有超過終點
      newPosition = currentPosition + diceResult;
      newState = newPosition === goalEnd ? "goal" : "goal-path";
    } else {
      // 情況2：超過終點，需要後退
      const overshoot = diceResult - stepsToGoal; // 多出的步數
      newPosition = goalEnd - overshoot; // 從終點後退
      newState = "goal-path"; // 後退後一定是在通道內

      // 確保不會後退到家門通道入口之前
      if (newPosition < goalPathEntry) {
        newPosition = goalPathEntry;
      }
    }

    return { newPosition, newState };
  };

  /**
   * 👊 踢掉對手飛機
   * 當移動到對手位置時，將對手飛機踢回起點
   */
  const kickOpponents = (players, position, attackerColor) => {
    const updatedPlayers = { ...players };

    // 檢查所有對手的飛機
    GAME_CONFIG.PLAYER_COLORS.forEach((color) => {
      if (color === attackerColor) return; // 跳過自己

      // 找到在相同位置的對手飛機
      const opponentIndex = updatedPlayers[color].findIndex((chess) => chess.state === "path" && chess.position === position);

      if (opponentIndex !== -1) {
        // 找到空的起始位置
        const freeSlot = GameUtils.getFreeHomeSlot(updatedPlayers, color);
        if (freeSlot !== undefined) {
          // 將對手飛機送回起點
          updatedPlayers[color][opponentIndex] = {
            ...updatedPlayers[color][opponentIndex],
            state: "home", // 狀態改為在家
            position: freeSlot, // 移動到空的起始位置
          };
        }
      }
    });

    return updatedPlayers;
  };

  /**
   * 🎯 處理棋子點擊
   * 當玩家點擊高亮的棋子時執行移動
   */
  const handleChessClick = (chessId) => {
    // 檢查點擊的棋子是否可移動
    if (!highlightedChessIds.has(chessId)) return;

    // 解析棋子ID（格式："顏色-索引"）
    const [playerColor, chessIndex] = chessId.split("-");
    const players = { ...gameState.players };
    const chess = players[playerColor][parseInt(chessIndex)];

    let updatedChess = { ...chess };

    // 🛫 情況1：在家且擲到6 → 起飛
    if (chess.state === "home" && diceValue.current === GAME_CONFIG.DICE_REQUIRED_FOR_TAKEOFF) {
      updatedChess = handleTakeoff(chess, playerColor);
    }

    // 🛣️ 情況2：在跑道 → 正常移動
    else if (chess.state === "path") {
      const { newPosition, newState } = handlePathMovement(chess, playerColor, diceValue.current);
      updatedChess.position = newPosition;
      updatedChess.state = newState;
    }

    // 🏁 情況3：在家門通道 → 精確移動
    else if (chess.state === "goal-path") {
      const { newPosition, newState } = handleGoalPathMovement(chess, playerColor, diceValue.current);
      updatedChess.position = newPosition;
      updatedChess.state = newState;
    }

    // 🔄 更新棋子狀態
    players[playerColor][parseInt(chessIndex)] = updatedChess;

    // 👊 檢查是否需要踢掉對手
    const playersAfterKick = kickOpponents(players, updatedChess.position, playerColor);

    // 🎮 更新遊戲狀態
    const shouldReroll = diceValue.current === GAME_CONFIG.DICE_REQUIRED_FOR_TAKEOFF;
    setGameState((prev) => ({
      ...prev,
      players: playersAfterKick,
      // 擲到6可以再擲一次，否則換下家
      currentPlayer: shouldReroll ? prev.currentPlayer : getNextPlayer(prev.currentPlayer),
    }));

    // 🧹 重置狀態
    setHighlightedChessIds(new Set());
    diceValue.current = 0;
  };

  // ===========================================================================
  // 畫面渲染
  // ===========================================================================

  return (
    <>
      {/* 🎲 骰子元件 */}
      <Dice onRoll={handleDiceRoll} />

      {/* 📝 當前玩家顯示 */}
      <h1>{GAME_CONFIG.PLAYER_ORDER[gameState.currentPlayer]} player's turn</h1>

      <div className="container">
        {/* 🏠 玩家家區背景 */}
        <PlayerBoardSpace color="red" gridArea="1 / 4 / 4 / 1" />
        <PlayerBoardSpace color="yellow" gridArea="16 / 13 / 13 / 16" />
        <PlayerBoardSpace color="green" gridArea="1 / 13 / 4 / 16" />
        <PlayerBoardSpace color="blue" gridArea="16 / 1 / 13 / 4" />

        {/* 🗺️ 棋盤格子 */}
        {Object.values(PATH_MAP)
          .filter((cell) => ["home", "path", "start", "goal-entry", "goal", "goal-path"].includes(cell.type))
          .map((cell) => (
            <Cell key={`cell-${cell.x}-${cell.y}`} color={cell.color} x={cell.x} y={cell.y} />
          ))}

        {/* ✈️ 棋子 */}
        {Object.entries(gameState.players).map(([color, chessList]) =>
          chessList.map((chess) => <ChessPiece key={chess.id} chess={chess} color={color} isHighlighted={highlightedChessIds.has(chess.id)} onChessClick={handleChessClick} />)
        )}
      </div>
    </>
  );
};

// =============================================================================
// 輔助元件
// =============================================================================

/**
 * 🟦 棋盤格子元件
 * 每個格子根據顏色和類型顯示不同樣式
 */
const Cell = ({ color = "", x, y }) => (
  <div className={`cell ${color}`} style={{ gridRow: x, gridColumn: y }}>
    <div className="circle"></div>
  </div>
);

/**
 * 🏠 玩家家區元件
 * 每位玩家的起始區域，包含4個起始位置
 */
const PlayerBoardSpace = ({ color = "", gridArea }) => (
  <div className={`player-space ${color}`} style={{ gridArea }}>
    <Cell x="1" y="1" />
    <Cell x="1" y="2" />
    <Cell x="2" y="1" />
    <Cell x="2" y="2" />
  </div>
);

/**
 * ✈️ 棋子元件
 * 顯示棋子，處理點擊和高亮效果
 */
const ChessPiece = ({ chess, color, isHighlighted, onChessClick }) => {
  const cell = PATH_MAP[chess.position];
  if (!cell) return null;

  // 🏠 家區棋子需要偏移顯示，避免重疊
  const isInHomeBase = chess.state === "home";
  const homeBaseOffsets = [
    { top: "20px", left: "20px" },
    { top: "20px", left: "-20px" },
    { top: "-20px", left: "20px" },
    { top: "-20px", left: "-20px" },
  ];

  const homeBaseStyle = isInHomeBase ? { position: "relative", ...homeBaseOffsets[chess.position % 4] } : {};

  return (
    <div
      className={`center ${isHighlighted ? "highlight" : ""}`}
      style={{
        gridRow: cell.x,
        gridColumn: cell.y,
        ...homeBaseStyle,
        cursor: isHighlighted ? "pointer" : "default", // 只有可移動的棋子可以點擊
      }}
      onClick={() => onChessClick(chess.id)}
    >
      <Chess color={color} />
    </div>
  );
};

export default Board;
