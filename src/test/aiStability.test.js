// tests/ai-behavior.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { gameEngine } from '../engine/gameEngine'

describe('飛行棋 AI 行為與強度測試', () => {
    beforeEach(() => {
        gameEngine.setAIIterations(10000)
    })

    it('擲 6 點時，應極大概率起飛而不是移動跑道上的棋子', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0 // red
        state.players.red[1] = { id: 'red-1', state: 'path', position: 20 }

        const rolled = gameEngine.rollDice(state, 6)
        const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);


        const flyCount = decisions.filter(id => id === 'red-0').length
        console.log('起飛次數 / 總次數:', flyCount, '/', 10, decisions)

        expect(flyCount).toBeGreaterThanOrEqual(10)
    })

    it('進入家門通道後，應優先把最接近終點的棋子衝線', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0
        state.players.red[0] = { id: 'red-0', state: 'goal-path', position: 70 }
        state.players.red[1] = { id: 'red-1', state: 'goal-path', position: 69 }

        const rolled = gameEngine.rollDice(state, 4)
        const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);

        const count = decisions.filter(id => id === 'red-1').length
        console.log('衝線:', count, '/', 10, decisions)
        expect(count).toBeGreaterThanOrEqual(10)
    })

    it('當棋子即將被吃掉時，應優先移動該棋子', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0
        state.players.red[0] = { id: 'red-0', state: 'path', position: 64 }
        state.players.red[1] = { id: 'red-1', state: 'path', position: 25 }
        state.players.blue[0] = { id: 'blue-0', state: 'path', position: 22 }

        const rolled = gameEngine.rollDice(state, 3)
        const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);
        const count = decisions.filter(id => id === 'red-1').length

        console.log('防禦決策:', count, '/', 10, decisions)
        expect(count).toBeGreaterThanOrEqual(7)
    })

    it('疊棋測試', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0
        state.players.red[0] = { id: 'red-0', state: 'path', position: 20 }
        state.players.red[1] = { id: 'red-1', state: 'path', position: 16 }
        state.players.red[2] = { id: 'red-2', state: 'home', position: 3 }
        state.players.red[3] = { id: 'red-3', state: 'home', position: 4 }

        const rolled = gameEngine.rollDice(state, 4)
        const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);
        const count = decisions.filter(id => id === 'red-1').length

        console.log('疊棋測試:', decisions)
        expect(count).toBeGreaterThanOrEqual(7)
    })

    it('在複雜的多目標情況下，應該做出合理的權衡', () => {
        const state = gameEngine.createInitialState()
        state.currentPlayer = 0
        state.players.red[0] = { id: 'red-0', state: 'path', position: 20 }
        state.players.red[1] = { id: 'red-1', state: 'path', position: 6 }
        state.players.red[2] = { id: 'red-2', state: 'goal-path', position: 69 }
        state.players.blue[0] = { id: 'blue-0', state: 'path', position: 24 }

        const rolled = gameEngine.rollDice(state, 4)
        const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);

        console.log('多目標決策:', decisions)
        const finishCount = decisions.filter(id => id === 'red-2').length

        expect(finishCount).toBeGreaterThan(5)
    })
})