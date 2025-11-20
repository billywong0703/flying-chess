// Board.js - 修改版本
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Board.css";
import Chess from "./Chess";
import Dice from "./Dice";
import CurrentPlayerDisplay from "./CurrentPlayerDisplay";
import PlayerStatusGrid from "./PlayerStatusGrid";
import ActionLog from "./ActionLog";
import VictoryScreen from "./VictoryScreen";
import { gameEngine, PATH_MAP } from "./engine/gameEngine";

// eslint-disable-next-line no-undef
const aiWorker = new ComlinkWorker(new URL("./workers/gameAI.worker.js", import.meta.url));

const Board = () => {
  // 🎮 遊戲狀態
  const [gameState, setGameState] = useState(() => gameEngine.createInitialState());
  const playerOrder = gameEngine.getAllPlayerColors();

  // ✨ UI 狀態
  const [highlightedChessIds, setHighlightedChessIds] = useState(new Set());
  const [isDiceDisabled, setIsDiceDisabled] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);

  // 📝 玩家資訊記錄
  const [playerLog, setPlayerLog] = useState([]);
  const logId = useRef(0);

  // 🎯 AI配置 - 定義哪些玩家是AI
  const aiPlayers = useRef({
    red: true, // 紅色玩家
    yellow: true, // 黃色玩家
    green: true, // 綠色玩家
    blue: true, // 藍色玩家
  });

  // ===========================================================================
  // 工具函數
  // ===========================================================================

  const addLog = (message, type = "info") => {
    const newLog = {
      id: logId.current++,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPlayerLog((prev) => [newLog, ...prev]);
  };

  const syncUIWithGameState = useCallback(
    (newGameState) => {
      setGameState(newGameState);
      setHighlightedChessIds(newGameState._movableChessIds || new Set());

      const shouldDisableDice = newGameState.isGameOver || (newGameState._movableChessIds && newGameState._movableChessIds.size > 0) || isAITurn;
      setIsDiceDisabled(shouldDisableDice);

      if (newGameState.isGameOver && newGameState.winner) {
        setShowVictoryScreen(true);
        addLog(`🎉 ${newGameState.winner} 玩家獲得了遊戲勝利！`, "victory");
      }
    },
    [isAITurn]
  );

  // ===========================================================================
  // AI回合處理
  // ===========================================================================

  /**
   * 🤖 處理AI回合
   */
  const handleAITurn = useCallback(async () => {
    if (gameState.isGameOver || !isAITurn) return;

    const currentPlayerColor = gameEngine.getPlayerColor(gameState.currentPlayer);
    addLog(`🤖 ${currentPlayerColor} AI 正在思考...`, "info");

    // AI擲骰子
    const diceResult = Math.floor(Math.random() * 6) + 1;
    addLog(`🎲 ${currentPlayerColor} AI 擲出 ${diceResult} 點`, "roll");

    let newGameState = gameEngine.rollDice(gameState, diceResult);

    if (newGameState._movableChessIds && newGameState._movableChessIds.size > 0) {
      const action = await aiWorker.getBestMove(newGameState);

      if (action) {
        newGameState = gameEngine.moveChess(newGameState, action.chessId);

        const cellInfo = PATH_MAP[newGameState.players[currentPlayerColor].find((chess) => chess.id === action.chessId).position];

        if (cellInfo.type === "goal") {
          addLog(`🎉 ${currentPlayerColor} AI 的飛機到達終點！`, "goal");
        } else {
          addLog(`➡️ ${currentPlayerColor} AI 移動了飛機 ${action.chessId}`, "move");
        }
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsAITurn(false);
    syncUIWithGameState(newGameState);
  }, [gameState, isAITurn, syncUIWithGameState]);

  // ===========================================================================
  // 遊戲操作處理函數
  // ===========================================================================

  const handleDiceRoll = (diceResult) => {
    if (isDiceDisabled || gameState.isGameOver || isAITurn) return;

    const playerColor = gameEngine.getPlayerColor(gameState.currentPlayer);
    addLog(`🎲 ${playerColor} 玩家擲出 ${diceResult} 點`, "roll");

    const newGameState = gameEngine.rollDice(gameState, diceResult);

    syncUIWithGameState(newGameState);
  };

  const handleChessClick = (chessId) => {
    if (gameState.isGameOver || isAITurn) return;

    const [playerColor] = chessId.split("-");
    const newGameState = gameEngine.moveChess(gameState, chessId);
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

  const resetGame = () => {
    const newGameState = gameEngine.createInitialState();
    syncUIWithGameState(newGameState);
    setPlayerLog([]);
    setShowVictoryScreen(false);
    addLog("🔄 遊戲已重置，開始新遊戲！", "info");
  };

  // ===========================================================================
  // 效果鉤子
  // ===========================================================================

  /**
   * 🔄 監聽遊戲狀態變化，觸發AI回合
   */
  useEffect(() => {
    if (gameState.isGameOver) return;
    if (aiPlayers.current[gameEngine.getPlayerColor(gameState.currentPlayer)]) {
      setIsAITurn(true);
    }
  }, [gameState.currentPlayer, gameState.isGameOver, isAITurn]);

  useEffect(() => {
    if (!isAITurn) return;
    handleAITurn();
  }, [isAITurn, handleAITurn]);

  useEffect(() => {
    if (gameState._movableChessIds && gameState._movableChessIds.size !== 0) return;

    setHighlightedChessIds(new Set());
    setIsDiceDisabled(gameState.isGameOver || isAITurn);
  }, [gameState._movableChessIds, gameState.currentPlayer, gameState.isGameOver, isAITurn]);

  // ===========================================================================
  // 畫面渲染
  // ===========================================================================

  return (
    <div className="game-container">
      {showVictoryScreen && <VictoryScreen winner={gameState.winner} onRestart={resetGame} />}
      <div className="game-controls">
        <Dice onRoll={handleDiceRoll} disabled={isDiceDisabled || gameState.isGameOver || isAITurn} />
        <CurrentPlayerDisplay currentPlayer={gameState.currentPlayer} playersChess={gameState.players} playerOrder={playerOrder} isAITurn={isAITurn} aiPlayers={aiPlayers.current} />
        <PlayerStatusGrid currentPlayer={gameState.currentPlayer} playersChess={gameState.players} playerOrder={playerOrder} aiPlayers={aiPlayers.current} />
      </div>
      <div className="game-board">
        <div className="container">
          <PlayerBoardSpace color="red" gridArea="1 / 4 / 4 / 1" />
          <PlayerBoardSpace color="green" gridArea="1 / 13 / 4 / 16" />
          <PlayerBoardSpace color="blue" gridArea="16 / 1 / 13 / 4" />
          <PlayerBoardSpace color="yellow" gridArea="16 / 13 / 13 / 16" />

          {Object.values(PATH_MAP)
            .filter((cell) => ["home", "path", "start", "goal-entry", "goal", "goal-path"].includes(cell.type))
            .map((cell, index) => (
              <Cell key={`cell-${cell.x}-${cell.y}-${index}`} color={cell.color} x={cell.x} y={cell.y} />
            ))}

          {Object.entries(gameState.players).map(([color, chessList]) =>
            chessList.map((chess) => (
              <ChessPiece key={chess.id} chess={chess} color={color} isHighlighted={highlightedChessIds.has(chess.id) && !isAITurn} onChessClick={handleChessClick} isAITurn={isAITurn} />
            ))
          )}
        </div>
      </div>
      <div className="game-controls" style={{ minWidth: 300 }}>
        <ActionLog playerLog={playerLog} />
      </div>
    </div>
  );
};

const ChessPiece = ({ chess, color, isHighlighted, onChessClick, isAITurn }) => {
  const cell = PATH_MAP[chess.position];
  if (!cell) return null;

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
        cursor: isHighlighted && !isAITurn ? "pointer" : "default",
      }}
      onClick={() => !isAITurn && onChessClick(chess.id)}
    >
      <Chess color={color} />
    </div>
  );
};

const Cell = ({ color = "", x, y }) => (
  <div className={`cell ${color}`} style={{ gridRow: x, gridColumn: y }}>
    <div className="circle"></div>
  </div>
);

const PlayerBoardSpace = ({ color = "", gridArea }) => (
  <div className={`player-space ${color}`} style={{ gridArea }}>
    <Cell x="1" y="1" />
    <Cell x="1" y="2" />
    <Cell x="2" y="1" />
    <Cell x="2" y="2" />
  </div>
);

export default Board;
