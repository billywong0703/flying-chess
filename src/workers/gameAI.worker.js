// gameAI.worker.js
import { gameAI } from '../engine/gameAI';

// 延遲工具函數
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 帶最小延遲的執行函數
const executeWithMinDelay = async (fn, minDelay = 200) => {
    const startTime = Date.now();
    const result = await Promise.resolve(fn());
    const elapsedTime = Date.now() - startTime;

    if (elapsedTime < minDelay) {
        await delay(minDelay - elapsedTime);
    }

    return result;
};

export const getBestMove = async (gameState) => {
    return executeWithMinDelay(
        () => gameAI.getBestMove(gameState),
        200
    );
};