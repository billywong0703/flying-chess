// hooks/useGameLog.ts
import { useState, useRef, useCallback } from "react";
import { Log } from "../ActionLog";

export const useGameLog = () => {
  const [playerLog, setPlayerLog] = useState<Log[]>([]);
  const logId = useRef(0);

  const addLog = useCallback((message: string, type: string = "info") => {
    const newLog: Log = {
      id: logId.current++,
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPlayerLog((prev) => [newLog, ...prev]);
  }, []);

  const clearLog = useCallback(() => {
    setPlayerLog([]);
  }, []);

  return {
    playerLog,
    addLog,
    clearLog,
  };
};
