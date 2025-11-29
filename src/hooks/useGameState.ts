// hooks/useGameState.ts
import { useState, useCallback } from "react";
import { gameEngine } from "../engine/gameEngine";

export const useGameState = () => {
  const [gameState, setGameState] = useState(() => gameEngine.createInitialState());
  const [highlightedChessIds, setHighlightedChessIds] = useState<Set<string>>(new Set());
  const [isDiceDisabled, setIsDiceDisabled] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);

  const resetGame = useCallback(() => {
    const newGameState = gameEngine.createInitialState();
    setGameState(newGameState);
    setHighlightedChessIds(new Set());
    setIsDiceDisabled(false);
    setShowVictoryScreen(false);
    setIsAITurn(false);
    return newGameState;
  }, []);

  const syncUIWithGameState = useCallback(
    (newGameState: typeof gameState) => {
      setGameState(newGameState);
      setHighlightedChessIds(newGameState._movableChessIds || new Set());

      const shouldDisableDice = newGameState.isGameOver || newGameState._movableChessIds?.size > 0 || isAITurn;
      setIsDiceDisabled(shouldDisableDice);

      if (newGameState.isGameOver && newGameState.winner) {
        setShowVictoryScreen(true);
      }
    },
    [isAITurn]
  );

  return {
    gameState,
    highlightedChessIds,
    isDiceDisabled,
    showVictoryScreen,
    isAITurn,
    setIsAITurn,
    setShowVictoryScreen,
    resetGame,
    syncUIWithGameState,
  };
};
