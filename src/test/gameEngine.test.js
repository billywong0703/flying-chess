import { describe, it, expect, beforeEach } from 'vitest'
import { gameEngine } from '../engine/gameEngine'

describe('飛行棋遊戲引擎', () => {
    let initialState

    beforeEach(() => {
        initialState = gameEngine.createInitialState()
    })

    describe('初始狀態', () => {
        it('應該正確創建初始遊戲狀態', () => {
            expect(initialState.currentPlayer).toBe(0)
            expect(initialState.consecutiveSixCount).toBe(0)
            expect(initialState.isGameOver).toBe(false)
            expect(initialState.winner).toBeNull()

            // 檢查所有玩家都有4架飛機
            const { players } = initialState
            expect(players.red).toHaveLength(4)
            expect(players.blue).toHaveLength(4)
            expect(players.green).toHaveLength(4)
            expect(players.yellow).toHaveLength(4)

            // 檢查紅色飛機初始狀態
            players.red.forEach((chess, index) => {
                expect(chess.state).toBe('home')
                expect(chess.id).toBe(`red-${index}`)
            })
        })

        it('應該正確獲取玩家顏色', () => {
            expect(gameEngine.getPlayerColor(0)).toBe('red')
            expect(gameEngine.getPlayerColor(1)).toBe('blue')
            expect(gameEngine.getPlayerColor(2)).toBe('green')
            expect(gameEngine.getPlayerColor(3)).toBe('yellow')
        })
    })

    describe('飛機移動', () => {
        it('應該在跑道上正確移動', () => {
            // 起飛並移動
            let state = gameEngine.rollDice(initialState, 6)
            state = gameEngine.moveChess(state, 'red-0')
            state = gameEngine.rollDice(state, 3)
            state = gameEngine.moveChess(state, 'red-0')

            const redChess = state.players.red[0]
            expect(redChess.state).toBe('path')
            expect(redChess.position).toBe(67) // 65 + 3
        })
    })
})