// tests/ai-behavior.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { gameEngine } from '../engine/gameEngine'
import { gameAI } from '../engine/gameAI'

describe('飛行棋 AI 行為與強度測試', () => {
    // 讓每次測試都從乾淨的 AI 開始（避免內部快取影響）
    beforeEach(() => {
        gameAI.setIterations(10000)
    })

    // 1. 經典「起飛優先」測試
    it('擲 6 點時，應極大概率起飛而不是移動跑道上的棋子', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0 // red
        state.players.red[1] = { id: 'red-1', state: 'path', position: 20 }

        const rolled = gameEngine.rollDice(state, 6)
        const decisions = Array.from({ length: 10 }, () => gameAI.getBestMove(rolled)?.chessId)

        const flyCount = decisions.filter(id => id === 'red-0').length
        console.log('起飛次數 / 總次數:', flyCount, '/', 10, decisions)

        expect(flyCount).toBeGreaterThanOrEqual(10)
    })

    // 衝家優先（終盤）
    it('進入家門通道後，應優先把最接近終點的棋子衝線', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0
        // red-0 在 goal-path 第 3 格（70），再走 4 步剛好到終點 (73)
        // red-1 在 goal-path 第 1 格（68）
        state.players.red[0] = { id: 'red-0', state: 'goal-path', position: 70 }
        state.players.red[1] = { id: 'red-1', state: 'goal-path', position: 69 }

        const rolled = gameEngine.rollDice(state, 4)
        const decisions = Array.from({ length: 10 }, () => gameAI.getBestMove(rolled)?.chessId)
        const count = decisions.filter(id => id === 'red-1').length

        console.log('衝線:', count, '/', 10, decisions)
        expect(count).toBeGreaterThanOrEqual(10)
    })

    // 防禦策略測試
    it('當棋子即將被吃掉時，應優先移動該棋子', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0 // red
        state.players.red[0] = { id: 'red-0', state: 'path', position: 65 }
        state.players.red[1] = { id: 'red-1', state: 'path', position: 26 }
        state.players.blue[0] = { id: 'blue-0', state: 'path', position: 23 }

        const rolled = gameEngine.rollDice(state, 3)
        const decisions = Array.from({ length: 10 }, () => gameAI.getBestMove(rolled)?.chessId)
        const count = decisions.filter(id => id === 'red-1').length

        console.log('防禦決策:', count, '/', 10, decisions)
        expect(count).toBeGreaterThanOrEqual(7)
    })

    // 疊棋測試
    it('疊棋測試', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0
        state.players.red[0] = { id: 'red-0', state: 'path', position: 20 }
        state.players.red[1] = { id: 'red-1', state: 'path', position: 16 }
        state.players.red[2] = { id: 'red-2', state: 'home', position: 3 }
        state.players.red[3] = { id: 'red-3', state: 'home', position: 4 }

        const rolled = gameEngine.rollDice(state, 4)
        const decisions = Array.from({ length: 10 }, () => gameAI.getBestMove(rolled)?.chessId)
        const count = decisions.filter(id => id === 'red-1').length

        console.log('疊棋測試:', decisions)
        expect(count).toBeGreaterThanOrEqual(7)
    })

    // 多目標競爭測試
    it('在複雜的多目標情況下，應該做出合理的權衡', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0
        state.players.red[0] = { id: 'red-0', state: 'path', position: 20 }
        state.players.red[1] = { id: 'red-1', state: 'path', position: 6 }
        state.players.red[2] = { id: 'red-2', state: 'goal-path', position: 69 }
        state.players.blue[0] = { id: 'blue-0', state: 'path', position: 24 }

        const rolled = gameEngine.rollDice(state, 4)
        const decisions = Array.from({ length: 20 }, () => gameAI.getBestMove(rolled)?.chessId)

        console.log('多目標決策:', decisions)
        // 期望AI能夠在攻擊和衝線之間做出合理選擇
        const finishCount = decisions.filter(id => id === 'red-2').length

        // 至少應該有一定比例選擇衝線（更優先的目標）
        expect(finishCount).toBeGreaterThan(5)
    })
})