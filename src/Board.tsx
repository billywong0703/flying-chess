// Board.tsx - TypeScript version
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Board.css";
import Chess from "./Chess";
import Dice from "./Dice";
import CurrentPlayerDisplay from "./CurrentPlayerDisplay";
import PlayerStatusGrid from "./PlayerStatusGrid";
import ActionLog from "./ActionLog";
import VictoryScreen from "./VictoryScreen";
import { gameEngine, PATH_MAP } from "./engine/gameEngine";
import { GameAIWorkerAPI } from "./workers/gameAI.worker";
import { wrap } from "comlink";

interface LogEntry {
  id: number;
  message: string;
  type: string;
  timestamp: string;
}

interface ChessPieceProps {
  chess: {
    id: string;
    state: string;
    position: number;
  };
  color: string;
  isHighlighted: boolean;
  onChessClick: (chessId: string) => void;
  isAITurn: boolean;
}

const Board: React.FC = () => {
  const aiWorkerRef = useRef<ReturnType<typeof wrap<GameAIWorkerAPI>> | null>(null);

  // 🎮 Game state
  const [gameState, setGameState] = useState(() => gameEngine.createInitialState());
  const playerOrder = gameEngine.getAllPlayerColors();

  // ✨ UI state
  const [highlightedChessIds, setHighlightedChessIds] = useState<Set<string>>(new Set());
  const [isDiceDisabled, setIsDiceDisabled] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);

  // 📝 Player info log
  const [playerLog, setPlayerLog] = useState<LogEntry[]>([]);
  const logId = useRef(0);

  // 🎯 AI configuration - define which players are AI
  const aiPlayers = useRef<Record<string, boolean>>({
    red: true, // Red player
    yellow: true, // Yellow player
    green: true, // Green player
    blue: true, // Blue player
  });

  // ===========================================================================
  // Utility functions
  // ===========================================================================

  const addLog = (message: string, type: string = "info") => {
    const newLog: LogEntry = {
      id: logId.current++,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPlayerLog((prev) => [newLog, ...prev]);
  };

  const syncUIWithGameState = useCallback(
    (newGameState: typeof gameState) => {
      setGameState(newGameState);
      setHighlightedChessIds(newGameState._movableChessIds || new Set());

      const shouldDisableDice = newGameState.isGameOver || (newGameState._movableChessIds && newGameState._movableChessIds.size > 0) || isAITurn;
      setIsDiceDisabled(shouldDisableDice);

      if (newGameState.isGameOver && newGameState.winner) {
        setShowVictoryScreen(true);
        addLog(`🎉 ${newGameState.winner} player won the game!`, "victory");
      }
    },
    [isAITurn]
  );

  // ===========================================================================
  // AI turn handling
  // ===========================================================================

  /**
   * 🤖 Handle AI turn
   */
  const handleAITurn = useCallback(async () => {
    if (gameState.isGameOver || !isAITurn) return;

    const currentPlayerColor = gameEngine.getPlayerColor(gameState.currentPlayer);
    addLog(`🤖 ${currentPlayerColor} AI is thinking...`, "info");

    // AI rolls dice
    const diceResult = Math.floor(Math.random() * 6) + 1;
    addLog(`🎲 ${currentPlayerColor} AI rolled ${diceResult}`, "roll");

    let newGameState = gameEngine.rollDice(gameState, diceResult);

    if (newGameState._movableChessIds && newGameState._movableChessIds.size > 0) {
      const action = await aiWorkerRef.current!.getBestMove(newGameState);

      if (action) {
        newGameState = gameEngine.moveChess(newGameState, action.chessId);

        const movedChess = newGameState.players[currentPlayerColor].find((chess: any) => chess.id === action.chessId);
        const cellInfo = PATH_MAP[movedChess!.position];

        if (cellInfo.type === "goal") {
          addLog(`🎉 ${currentPlayerColor} AI's plane reached the goal!`, "goal");
        } else {
          addLog(`➡️ ${currentPlayerColor} AI moved plane ${action.chessId}`, "move");
        }
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsAITurn(false);
    syncUIWithGameState(newGameState);
  }, [gameState, isAITurn, syncUIWithGameState]);

  // ===========================================================================
  // Game operation handling functions
  // ===========================================================================

  const handleDiceRoll = (diceResult: number) => {
    if (isDiceDisabled || gameState.isGameOver || isAITurn) return;

    const playerColor = gameEngine.getPlayerColor(gameState.currentPlayer);
    addLog(`🎲 ${playerColor} player rolled ${diceResult}`, "roll");

    const newGameState = gameEngine.rollDice(gameState, diceResult);
    syncUIWithGameState(newGameState);
  };

  const handleChessClick = (chessId: string) => {
    if (gameState.isGameOver || isAITurn) return;

    const [playerColor] = chessId.split("-");
    const newGameState = gameEngine.moveChess(gameState, chessId);
    const movedChess = newGameState.players[playerColor].find((chess: any) => chess.id === chessId);
    const cellInfo = PATH_MAP[movedChess!.position];

    if (cellInfo.type === "goal") {
      addLog(`🎉 ${playerColor} player's plane reached the goal!`, "goal");
    } else {
      addLog(`➡️ ${playerColor} player moved plane ${chessId}`, "move");
    }

    syncUIWithGameState(newGameState);
  };

  const resetGame = () => {
    const newGameState = gameEngine.createInitialState();
    syncUIWithGameState(newGameState);
    setPlayerLog([]);
    setShowVictoryScreen(false);
    addLog("🔄 Game has been reset, starting new game!", "info");
  };

  // ===========================================================================
  // Effect hooks
  // ===========================================================================

  /**
   * 🔄 Listen for game state changes, trigger AI turn
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

  useEffect(() => {
    const worker = new Worker(new URL("./workers/gameAI.worker.ts", import.meta.url), {
      type: "module",
    });

    aiWorkerRef.current = wrap<GameAIWorkerAPI>(worker);

    return () => {
      worker.terminate();
    };
  }, []);
  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="game-container">
      {showVictoryScreen && <VictoryScreen winner={gameState.winner} onRestart={resetGame} />}
      <div className="game-controls">
        <Dice onRoll={handleDiceRoll} disabled={isDiceDisabled || gameState.isGameOver || isAITurn} />
        <CurrentPlayerDisplay currentPlayer={gameState.currentPlayer} playersChess={gameState.players} playerOrder={playerOrder} isAITurn={isAITurn} aiPlayers={aiPlayers.current} />
        <PlayerStatusGrid currentPlayer={gameState.currentPlayer} playersChess={gameState.players} playerOrder={playerOrder} />
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
            (chessList as any[]).map((chess) => (
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

const ChessPiece: React.FC<ChessPieceProps> = ({ chess, color, isHighlighted, onChessClick, isAITurn }) => {
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
        position: "relative" as const,
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

const Cell: React.FC<{ color?: string; x: number; y: number }> = ({ color = "", x, y }) => (
  <div className={`cell ${color}`} style={{ gridRow: x, gridColumn: y }}>
    <div className="circle"></div>
  </div>
);

const PlayerBoardSpace: React.FC<{ color: string; gridArea: string }> = ({ color = "", gridArea }) => (
  <div className={`player-space ${color}`} style={{ gridArea }}>
    <Cell x={1} y={1} />
    <Cell x={1} y={2} />
    <Cell x={2} y={1} />
    <Cell x={2} y={2} />
  </div>
);

export default Board;
