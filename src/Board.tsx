import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Board.css";
import Chess from "./Chess";
import Dice from "./Dice";
import CurrentPlayerDisplay from "./CurrentPlayerDisplay";
import PlayerStatusGrid from "./PlayerStatusGrid";
import ActionLog, { Log } from "./ActionLog";
import VictoryScreen from "./VictoryScreen";
import GameBoard from "./GameBoard";
import Settings, { PlayerSettings, PlayerColor } from "./Settings";
import { gameEngine, PATH_MAP, Piece as PieceTS } from "./engine/gameEngine";
import { GameAIWorkerAPI } from "./workers/gameAI.worker";
import { wrap } from "comlink";

const Board = () => {
  const aiWorkerRef = useRef<ReturnType<typeof wrap<GameAIWorkerAPI>> | null>(null);
  const currentResetRef = useRef(0);

  // Game state
  const [gameState, setGameState] = useState(() => gameEngine.createInitialState());
  const [resetCounter, setResetCounter] = useState(0);
  const playerOrder = gameEngine.getAllPlayerColors();

  // UI state
  const [highlightedChessIds, setHighlightedChessIds] = useState<Set<string>>(new Set());
  const [isDiceDisabled, setIsDiceDisabled] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Player info log
  const [playerLog, setPlayerLog] = useState<Log[]>([]);
  const logId = useRef(0);

  // AI configuration - define which players are AI
  const [aiPlayers, setAIPlayers] = useState<PlayerSettings>({
    red: true,
    yellow: true,
    green: true,
    blue: true,
  });

  // ===========================================================================
  // Utility functions
  // ===========================================================================

  const addLog = (message: string, type: string = "info") => {
    const newLog: Log = {
      id: logId.current++,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPlayerLog((prev) => [newLog, ...prev]);
  };

  const syncUIWithGameState = useCallback((newGameState: typeof gameState) => {
    setGameState(newGameState);
    setHighlightedChessIds(newGameState._movableChessIds || new Set());

    const shouldDisableDice = newGameState.isGameOver || (newGameState._movableChessIds && newGameState._movableChessIds.size > 0) || isAITurn;
    setIsDiceDisabled(shouldDisableDice);

    if (newGameState.isGameOver && newGameState.winner) {
      setShowVictoryScreen(true);
      addLog(`🎉 ${newGameState.winner} player won the game!`, "victory");
    }
  }, []);

  const cancellableDelay = (ms: number, shouldCancel: () => boolean) => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (shouldCancel()) {
          clearInterval(interval);
          resolve(null);
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        resolve(null);
      }, ms);
    });
  };

  // ===========================================================================
  // AI turn handling
  // ===========================================================================
  const handleAITurn = useCallback(
    async (resetId: number) => {
      if (resetId !== currentResetRef.current || gameState.isGameOver || !isAITurn) return;

      const currentPlayerColor = gameEngine.getPlayerColor(gameState.currentPlayer);
      addLog(`🤖 ${currentPlayerColor} AI is thinking...`, "info");

      const diceResult = Math.floor(Math.random() * 6) + 1;
      addLog(`🎲 ${currentPlayerColor} AI rolled ${diceResult}`, "roll");

      let newGameState = gameEngine.rollDice(gameState, diceResult);

      if (newGameState._movableChessIds && newGameState._movableChessIds.size > 0) {
        const action = await aiWorkerRef.current!.getBestMove(newGameState);

        if (resetId !== currentResetRef.current) return;

        if (action) {
          newGameState = gameEngine.moveChess(newGameState, action.chessId);
          addLog(`➡️ ${currentPlayerColor} AI moved plane`, "move");
        }
      } else {
        await cancellableDelay(500, () => resetId !== currentResetRef.current);
      }

      if (resetId !== currentResetRef.current) return;

      setIsAITurn(false);
      syncUIWithGameState(newGameState);
    },
    [gameState, isAITurn, syncUIWithGameState]
  );

  const handleAIPlayersChange = (newAIPlayers: PlayerSettings) => {
    setAIPlayers(newAIPlayers);
    resetGame();
    addLog("🔄 AI players have been updated", "info");
  };

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
    if (gameState.isGameOver || isAITurn || !highlightedChessIds.has(chessId)) return;

    const [playerColor] = chessId.split("-");
    const newGameState = gameEngine.moveChess(gameState, chessId);
    const movedChess = newGameState.players[playerColor].find((chess: PieceTS) => chess.id === chessId);
    const cellInfo = PATH_MAP[movedChess!.position];

    if (cellInfo.type === "goal") {
      addLog(`🎉 ${playerColor} player's plane reached the goal!`, "goal");
    } else {
      addLog(`➡️ ${playerColor} player moved plane`, "move");
    }

    syncUIWithGameState(newGameState);
  };

  const resetGame = () => {
    const resetId = Date.now();
    currentResetRef.current = resetId;

    const newGameState = gameEngine.createInitialState();
    setIsAITurn(false);
    setGameState(newGameState);
    setHighlightedChessIds(new Set());
    setIsDiceDisabled(false);
    setPlayerLog([]);
    setShowVictoryScreen(false);
    setResetCounter((prev) => prev + 1);
  };

  // ===========================================================================
  // Effect hooks
  // ===========================================================================
  useEffect(() => {
    if (gameState.isGameOver) return;

    if (aiPlayers[gameEngine.getPlayerColor(gameState.currentPlayer) as PlayerColor]) {
      setIsAITurn(true);
    }
  }, [gameState.currentPlayer, isAITurn, resetCounter]);

  useEffect(() => {
    if (!isAITurn) return;
    const currentResetId = currentResetRef.current;
    handleAITurn(currentResetId);
  }, [isAITurn, resetCounter]);

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
      {showVictoryScreen && <VictoryScreen winner={gameState.winner ?? ""} onRestart={resetGame} />}
      <div className="game-controls">
        <Dice onRoll={handleDiceRoll} disabled={isDiceDisabled || gameState.isGameOver || isAITurn} />
        <CurrentPlayerDisplay currentPlayer={gameState.currentPlayer} playersChess={gameState.players} playerOrder={playerOrder} isAITurn={isAITurn} aiPlayers={aiPlayers} />
        <PlayerStatusGrid currentPlayer={gameState.currentPlayer} playersChess={gameState.players} playerOrder={playerOrder} />
      </div>
      <GameBoard>
        {Object.entries(gameState.players).map(([color, chessList]) =>
          (chessList as PieceTS[]).map((chess) => (
            <Piece key={chess.id} chess={chess} color={color} isHighlighted={highlightedChessIds.has(chess.id) && !isAITurn} onChessClick={handleChessClick} isAITurn={isAITurn} />
          ))
        )}
      </GameBoard>
      <div className="game-controls">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            style={{
              padding: "8px 16px",
              background: "#6c757d",
              color: "white",
              border: "none",
              fontSize: "14px",
            }}
          >
            ⚙️ Settings
          </button>
        </div>
        <ActionLog playerLog={playerLog} />
      </div>
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} aiPlayers={aiPlayers} onAIPlayersChange={handleAIPlayersChange} />
    </div>
  );
};

export interface PieceProps {
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

const Piece: React.FC<PieceProps> = ({ chess, color, isHighlighted, onChessClick, isAITurn }) => {
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

export default Board;
