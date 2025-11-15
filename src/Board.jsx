import React, { useState, useEffect, useRef } from "react";
import "./Board.css";
import Chess from "./Chess";
import Dice from "./Dice";
import CurrentPlayerDisplay from "./CurrentPlayerDisplay";
import PlayerStatusGrid from "./PlayerStatusGrid";
import ActionLog from "./ActionLog";
import VictoryScreen from "./VictoryScreen";
import { gameEngine } from "./engine/gameEngine";

// =============================================================================
// 主棋盤元件 - 使用遊戲引擎管理狀態
// =============================================================================

const Board = () => {
  // 🎮 遊戲狀態
  const [gameState, setGameState] = useState(() => gameEngine.createInitialState());

  // ✨ UI 狀態
  const [highlightedChessIds, setHighlightedChessIds] = useState(new Set());
  const [isDiceDisabled, setIsDiceDisabled] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);

  // 📝 玩家資訊記錄
  const [playerLog, setPlayerLog] = useState([]);
  const logId = useRef(0);

  // ===========================================================================
  // 工具函數
  // ===========================================================================

  /**
   * 📝 添加玩家行動記錄
   */
  const addLog = (message, type = "info") => {
    const newLog = {
      id: logId.current++,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPlayerLog((prev) => [newLog, ...prev]);
  };

  /**
   * 🔄 同步 UI 狀態與遊戲狀態
   */
  const syncUIWithGameState = (newGameState) => {
    setGameState(newGameState);

    // 更新高亮顯示
    setHighlightedChessIds(newGameState._movableChessIds || new Set());

    // 更新骰子狀態
    const shouldDisableDice = newGameState.isGameOver || (newGameState._movableChessIds && newGameState._movableChessIds.size > 0);
    setIsDiceDisabled(shouldDisableDice);

    // 處理勝利顯示
    if (newGameState.isGameOver && newGameState.winner) {
      setShowVictoryScreen(true);
      addLog(`🎉 ${newGameState.winner} 玩家獲得了遊戲勝利！`, "victory");
    }
  };

  // ===========================================================================
  // 遊戲操作處理函數
  // ===========================================================================

  /**
   * 🎲 處理骰子擲出
   */
  const handleDiceRoll = (diceResult) => {
    if (isDiceDisabled || gameState.isGameOver) return;

    const playerColor = gameEngine.getPlayerColor(gameState.currentPlayer);
    addLog(`🎲 ${playerColor} 玩家擲出 ${diceResult} 點`, "roll");

    // 使用引擎處理骰子結果
    const newGameState = gameEngine.rollDice(gameState, diceResult);

    // 處理不同情況的日誌記錄
    switch (newGameState._lastAction) {
      case "penalty":
        addLog(`⚡ ${playerColor} 玩家連續三次擲出 6！所有飛機返回基地！`, "penalty");
        break;
      case "no_movable_chess":
        addLog(`❌ ${playerColor} 玩家沒有可以移動的飛機，輪到下一位玩家`, "info");
        break;
      default:
        addLog(`✅ ${playerColor} 玩家有 ${newGameState._movableChessIds.size} 架飛機可以移動`, "info");
        break;
    }

    syncUIWithGameState(newGameState);
  };

  /**
   * 🎯 處理棋子點擊
   */
  const handleChessClick = (chessId) => {
    // 檢查遊戲狀態
    if (gameState.isGameOver) return;

    // 檢查移動是否有效
    if (!gameEngine.isValidMove(gameState, chessId)) return;

    const [playerColor] = chessId.split("-");
    const newGameState = gameEngine.moveChess(gameState, chessId);

    // 記錄移動操作
    const cellInfo = gameEngine.getCellInfo(newGameState.players[playerColor].find((chess) => chess.id === chessId).position);

    switch (newGameState._lastAction) {
      case "move":
        if (cellInfo.type === "goal") {
          addLog(`🎉 ${playerColor} 玩家的飛機到達終點！`, "goal");
        } else {
          addLog(`➡️ ${playerColor} 玩家移動 ${gameState._lastDiceResult} 步`, "move");
        }
        break;
      default:
        addLog(`🛫 ${playerColor} 玩家的飛機從基地起飛！`, "move");
        break;
    }

    syncUIWithGameState(newGameState);
  };

  /**
   * 🔄 重置遊戲
   */
  const resetGame = () => {
    syncUIWithGameState(gameEngine.createInitialState());
    setPlayerLog([]);
    setShowVictoryScreen(false);
    addLog("🔄 遊戲已重置，開始新遊戲！", "info");
  };

  // ===========================================================================
  // 效果鉤子
  // ===========================================================================

  /**
   * 🔄 玩家切換時重置 UI 狀態
   */
  useEffect(() => {
    if (gameState._movableChessIds && gameState._movableChessIds.size !== 0) return;
    
    setHighlightedChessIds(new Set());
    setIsDiceDisabled(gameState.isGameOver);
  }, [gameState._movableChessIds, gameState.currentPlayer, gameState.isGameOver]);

  // ===========================================================================
  // 畫面渲染
  // ===========================================================================

  return (
    <div className="game-container">
      {/* 勝利畫面 */}
      {showVictoryScreen && <VictoryScreen winner={gameState.winner} onRestart={resetGame} />}

      {/* 遊戲控制面板 */}
      <div className="game-controls">
        <Dice onRoll={handleDiceRoll} disabled={isDiceDisabled || gameState.isGameOver} />
        <CurrentPlayerDisplay currentPlayer={gameState.currentPlayer} players={gameState.players} gameConfig={gameEngine.config} />
        <PlayerStatusGrid currentPlayer={gameState.currentPlayer} players={gameState.players} gameConfig={gameEngine.config} />
      </div>

      {/* 遊戲棋盤 */}
      <div className="game-board">
        <div className="container">
          {/* 玩家家區 */}
          <PlayerBoardSpace color="red" gridArea="1 / 4 / 4 / 1" />
          <PlayerBoardSpace color="yellow" gridArea="16 / 13 / 13 / 16" />
          <PlayerBoardSpace color="green" gridArea="1 / 13 / 4 / 16" />
          <PlayerBoardSpace color="blue" gridArea="16 / 1 / 13 / 4" />

          {/* 棋盤格子 */}
          {Object.values(gameEngine.pathMap)
            .filter((cell) => ["home", "path", "start", "goal-entry", "goal", "goal-path"].includes(cell.type))
            .map((cell, index) => (
              <Cell key={`cell-${cell.x}-${cell.y}-${index}`} color={cell.color} x={cell.x} y={cell.y} />
            ))}

          {/* 棋子 */}
          {Object.entries(gameState.players).map(([color, chessList]) =>
            chessList.map((chess) => <ChessPiece key={chess.id} chess={chess} color={color} isHighlighted={highlightedChessIds.has(chess.id)} onChessClick={handleChessClick} />)
          )}
        </div>
      </div>

      {/* 操作日誌 */}
      <div className="game-controls" style={{ minWidth: 300 }}>
        <ActionLog playerLog={playerLog} />
      </div>
    </div>
  );
};

// =============================================================================
// 輔助元件（保持不變）
// =============================================================================

/**
 * 🟦 棋盤格子元件
 */
const Cell = ({ color = "", x, y }) => (
  <div className={`cell ${color}`} style={{ gridRow: x, gridColumn: y }}>
    <div className="circle"></div>
  </div>
);

/**
 * 🏠 玩家家區元件
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
 */
const ChessPiece = ({ chess, color, isHighlighted, onChessClick }) => {
  const cell = gameEngine.getCellInfo(chess.position);
  if (!cell) return null;

  // 家區棋子偏移顯示
  const isInHomeBase = chess.state === "home";
  const homeBaseOffsets = [
    { top: "20px", left: "20px" },
    { top: "20px", left: "-20px" },
    { top: "-20px", left: "20px" },
    { top: "-20px", left: "-20px" },
  ];

  const homeBaseStyle = isInHomeBase
    ? {
        position: "relative",
        ...homeBaseOffsets[chess.position % 4],
      }
    : {};

  return (
    <div
      className={`center ${isHighlighted ? "highlight" : ""}`}
      style={{
        gridRow: cell.x,
        gridColumn: cell.y,
        ...homeBaseStyle,
        cursor: isHighlighted ? "pointer" : "default",
      }}
      onClick={() => onChessClick(chess.id)}
    >
      <Chess color={color} />
    </div>
  );
};

export default Board;
