// workers/gameAI.worker.ts
import { expose } from 'comlink';
import { gameEngine } from '../engine/gameEngine';
import type { FullGameState } from '../engine/gameEngine';

// 延遲工具函數
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 帶最小延遲的執行函數
const executeWithMinDelay = async < T > (fn: () => T | Promise < T >, minDelay = 200): Promise < T > => {
    const startTime = Date.now();
    const result = await Promise.resolve(fn());
    const elapsedTime = Date.now() - startTime;

    if (elapsedTime < minDelay) {
        await delay(minDelay - elapsedTime);
    }

    return result;
};

const workerAPI = {
    async getBestMove(gameState: FullGameState) {
        return executeWithMinDelay(
            () => gameEngine.getBestMove(gameState),
            200
        );
    }
};

export type GameAIWorkerAPI = typeof workerAPI;

expose(workerAPI);