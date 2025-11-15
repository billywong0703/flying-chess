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
            expect(gameEngine.getPlayerColor(1)).toBe('yellow')
            expect(gameEngine.getPlayerColor(2)).toBe('green')
            expect(gameEngine.getPlayerColor(3)).toBe('blue')
        })
    })

    describe('骰子邏輯', () => {
        it('擲出6時應該增加連續6計數', () => {
            const newState = gameEngine.rollDice(initialState, 6)
            expect(newState.consecutiveSixCount).toBe(1)
        })

        it('擲出非6時應該重置連續6計數', () => {
            // 先擲一次6
            let state = gameEngine.rollDice(initialState, 6)
            expect(state.consecutiveSixCount).toBe(1)

            // 再擲非6
            state = gameEngine.rollDice(state, 3)
            expect(state.consecutiveSixCount).toBe(0)
        })

        it('連續三次6應該觸發處罰', () => {
            let state = initialState

            // 連續三次擲出6
            for (let i = 0; i < 3; i++) {
                state = gameEngine.rollDice(state, 6)
            }

            expect(state._lastAction).toBe('penalty')
            expect(state.consecutiveSixCount).toBe(0)
        })

        it('沒有可移動棋子時應該轉換玩家', () => {
            // 擲出非6點數，飛機在家不能起飛
            const state = gameEngine.rollDice(initialState, 3)

            expect(state._lastAction).toBe('no_movable_chess')
            expect(state.currentPlayer).toBe(1) // 應該轉到黃色玩家
        })
    })

    describe('移動驗證', () => {
        it('在家時只有擲出6才能移動', () => {
            // 擲出6，應該可以移動
            const stateWithSix = gameEngine.rollDice(initialState, 6)
            expect(gameEngine.isValidMove(stateWithSix, 'red-0')).toBe(true)

            // 擲出3，不能移動
            const stateWithThree = gameEngine.rollDice(initialState, 3)
            expect(gameEngine.isValidMove(stateWithThree, 'red-0')).toBe(false)
        })

        it('在跑道上時任何點數都能移動', () => {
            // 先讓一架飛機起飛
            let state = gameEngine.rollDice(initialState, 6)
            state = gameEngine.moveChess(state, 'red-0')

            // 現在在跑道上，擲出3應該可以移動
            state = gameEngine.rollDice(state, 3)
            expect(gameEngine.isValidMove(state, 'red-0')).toBe(true)
        })
    })

    describe('飛機移動', () => {
        it('應該正確處理起飛', () => {
            let state = gameEngine.rollDice(initialState, 6)
            state = gameEngine.moveChess(state, 'red-0')

            const redChess = state.players.red[0]
            expect(redChess.state).toBe('path')
            expect(redChess.position).toBe(gameEngine.playerPositions.START.red)
        })

        it('應該在跑道上正確移動', () => {
            // 起飛並移動
            let state = gameEngine.rollDice(initialState, 6)
            state = gameEngine.moveChess(state, 'red-0')
            state = gameEngine.rollDice(state, 3)
            state = gameEngine.moveChess(state, 'red-0')

            const redChess = state.players.red[0]
            expect(redChess.state).toBe('path')
            expect(redChess.position).toBe(16) // 65 + 3
        })
    })

    describe('勝利條件', () => {
        it('所有飛機到達終點應該獲勝', () => {
            // 創建一個所有紅色飛機都在終點的狀態
            const winningState = {
                ...initialState,
                players: {
                    ...initialState.players,
                    red: [
                        { id: 'red-0', state: 'goal', position: 73 },
                        { id: 'red-1', state: 'goal', position: 73 },
                        { id: 'red-2', state: 'goal', position: 73 },
                        { id: 'red-3', state: 'goal', position: 73 }
                    ]
                }
            }

            const winner = gameEngine._checkWinCondition(winningState.players)
            expect(winner).toBe('red')
        })
    })
})