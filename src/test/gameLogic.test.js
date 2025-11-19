import { describe, it, expect } from 'vitest'
import { gameEngine, fromFull } from '../engine/gameEngine' // 假設路徑正確，用來產生完整狀態
import { gameRules, GameState } from '../engine/gameRules' // 從 gameAI.js 匯入 gameRules

describe('遊戲邏輯測試', () => {

    // 測試 1: fromFull - 從完整狀態轉換到輕量狀態
    it('應正確轉換完整狀態到輕量狀態，包括位置、狀態、玩家等', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 1 // yellow

        const ls = fromFull(fullState)

        // 驗證基本屬性
        expect(ls.player).toBe(1)
    })

    // 測試 3: move - 起飛邏輯
    it('在家區擲6應起飛到起始點', () => {
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 0
        fullState.consecutiveSixCount = 0
        fullState._lastDiceResult = 6
        fullState._movableChessIds = new Set(['red-0', 'red-1', 'red-2', 'red-3'])
        const ls = fromFull(fullState)
        gameRules.move(ls, 0)

        expect(ls.pos[0]).toBe(65) // red start
        expect(ls.st[0]).toBe(1) // path
    })

    // 測試 4: roll - 連續三個6，懲罰飛回家並換人
    it('連續三個6應懲罰，將跑道棋子飛回家並換下一玩家', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 0 // red
        fullState.consecutiveSixCount = 2
        // 修改一些棋子狀態
        fullState.players.red[0] = { id: 'red-0', state: 'path', position: 65 }
        fullState.players.yellow[1] = { id: 'yellow-1', state: 'goal-path', position: 75 }
        fullState.players.green[2] = { id: 'green-2', state: 'goal', position: 85 } // 注意 goal 位置會轉成 255
        fullState.players.blue[3] = { id: 'blue-3', state: 'home', position: 7 }

        const ls = fromFull(fullState)
        gameRules.roll(ls, 6)
        console.log(ls)


        // 初始全在家 → 只在6時可起飛
        expect(ls.pos[0]).toBe(0)
        expect(ls.pos[1]).toBe(1)
        expect(ls.pos[2]).toBe(2)
        expect(ls.pos[3]).toBe(3)
        expect(ls.st[0]).toBe(0)
        expect(ls.st[1]).toBe(0)
        expect(ls.st[2]).toBe(0)
        expect(ls.st[3]).toBe(0)
        expect(ls.six).toBe(0)
        expect(ls.player).toBe(1)
    })


    // 測試 5: 暢順進入家門
    it('暢順進入家門', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 3 // yellow
        fullState.consecutiveSixCount = 2
        // 修改一些棋子狀態
        fullState.players.yellow[0] = { id: 'yellow-0', state: 'path', position: 34 }

        const ls = fromFull(fullState)
        gameRules.roll(ls, 3)
        gameRules.move(ls, 0)
        console.log(ls)

        expect(ls.pos[12]).toBe(75)
        expect(ls.st[12]).toBe(2)
    })

    // 測試 5: 暢順進入家門2
    it('暢順進入家門123123', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 3 // yellow
        fullState.consecutiveSixCount = 2
        // 修改一些棋子狀態
        fullState.players.yellow[2] = { id: 'yellow-2', state: 'path', position: 63 }
        fullState.players.yellow[3] = { id: 'yellow-3', state: 'path', position: 63 }

        const ls = fromFull(fullState)
        gameRules.roll(ls, 4)
        console.log(ls)
        gameRules.move(ls, 2)
        console.log(ls)

        expect(ls.pos[14]).toBe(19)
        expect(ls.st[14]).toBe(1)
    })


    // 測試: move - 家門通道移動，過衝終點
    it('家門通道移動應處剛好進終點', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 3 // red
        fullState.consecutiveSixCount = 2
        // 修改一些棋子狀態
        fullState.players.yellow[1] = { id: 'yellow-1', state: 'goal-path', position: 75 }

        const ls = fromFull(fullState)

        gameRules.roll(ls, 4)
        gameRules.move(ls, 1)
        expect(ls.pos[13]).toBe(255)
        expect(ls.st[13]).toBe(3)
    })

    // 測試: move - 家門通道移動衝過頭要後退
    it('家門通道移動衝過頭要後退', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 3 // red
        fullState.consecutiveSixCount = 2
        // 修改一些棋子狀態
        fullState.players.yellow[1] = { id: 'yellow-1', state: 'goal-path', position: 75 }

        const ls = fromFull(fullState)

        gameRules.roll(ls, 5)
        gameRules.move(ls, 1)
        expect(ls.pos[13]).toBe(78)
        expect(ls.st[13]).toBe(2)
    })

    // 測試 7: move - 踢棋邏輯
    it('移動後應踢掉對手棋子回基地', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 0
        fullState.consecutiveSixCount = 0
        // 修改一些棋子狀態
        fullState.players.red[0] = { id: 'red-0', state: 'path', position: 20 }
        fullState.players.yellow[1] = { id: 'yellow-1', state: 'goal-path', position: 24 }

        const ls = fromFull(fullState)

        gameRules.roll(ls, 4)
        gameRules.move(ls, 0)

        expect(ls.pos[0]).toBe(24)
        expect(ls.st[0]).toBe(1)

        expect(ls.pos[12]).toBe(12)
        expect(ls.st[5]).toBe(0)
    })

    //  _checkWin - 檢查勝利
    it('四顆棋全到終點應設定贏家', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 0
        fullState.consecutiveSixCount = 0
        // 修改一些棋子狀態
        fullState.players.red[0] = { id: 'red-0', state: 'goal', position: 73 }
        fullState.players.red[1] = { id: 'red-0', state: 'goal', position: 73 }
        fullState.players.red[2] = { id: 'red-0', state: 'goal', position: 73 }
        fullState.players.red[3] = { id: 'red-0', state: 'goal-path', position: 72 }

        const ls = fromFull(fullState)
        expect(ls.winner).toBe(-1) // 仍保持之前的值，但實際呼叫時是移動後檢查

        gameRules.roll(ls, 1)
        gameRules.move(ls, 3)

        expect(ls.pos[3]).toBe(255)
        expect(ls.st[3]).toBe(3)
        expect(ls.winner).toBe(0)
    })

    //  _checkWin - 檢查勝利
    it('疊起的移動', () => {
        // 建立一個簡單的完整狀態
        const fullState = gameEngine.createInitialState()
        fullState.currentPlayer = 0
        fullState.consecutiveSixCount = 0
        // 修改一些棋子狀態
        fullState.players.red[0] = { id: 'red-0', state: 'path', position: 20 }
        fullState.players.red[1] = { id: 'red-1', state: 'path', position: 20 }
        fullState.players.red[2] = { id: 'red-2', state: 'path', position: 20 }
        fullState.players.red[3] = { id: 'red-3', state: 'home', position: 3 }

        const ls = fromFull(fullState)
        gameRules.roll(ls, 3)
        gameRules.move(ls, 0)

        expect(ls.pos[0]).toBe(23)
        expect(ls.st[0]).toBe(1)
        expect(ls.pos[1]).toBe(23)
        expect(ls.st[1]).toBe(1)
        expect(ls.pos[2]).toBe(23)
        expect(ls.st[2]).toBe(1)
    })
})