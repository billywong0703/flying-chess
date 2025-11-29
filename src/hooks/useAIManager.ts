import { useState, useRef, useCallback } from "react";
import { GameAIWorkerAPI } from "../workers/gameAI.worker";
import { wrap } from "comlink";

export const useAIManager = () => {
  const aiWorkerRef = useRef<ReturnType<typeof wrap<GameAIWorkerAPI>> | null>(null);
  const [aiPlayers, setAIPlayers] = useState({
    red: true,
    yellow: true,
    green: true,
    blue: true,
  });

  const initializeAIWorker = useCallback(() => {
    const worker = new Worker(new URL("./workers/gameAI.worker.ts", import.meta.url), {
      type: "module",
    });
    aiWorkerRef.current = wrap<GameAIWorkerAPI>(worker);
    return () => worker.terminate();
  }, []);

  return {
    aiWorkerRef,
    aiPlayers,
    setAIPlayers,
    initializeAIWorker,
  };
};
