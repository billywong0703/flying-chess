export class GameState {
    // 如果 dice = 0 和 movable = 0 的話，代表(狀態 = 等待擲骰)，否則(狀態 = 等待行動)
    constructor() {
        this.pos = new Uint8Array(16); // 每顆棋子的位置（0~15 = 家區，16~67 = 跑道， 68~91 = 家門通道，255 = 已到終點）
        this.st = new Uint8Array(16);   // 狀態：0=家區, 1=外圈跑道, 2=家門通道, 3=已到終點
        this.player = 0;      // 當前玩家 0~3
        this.six = 0;         // 連續擲出 6 的次數
        this.winner = -1;     // 贏家（-1 表示未結束）
        this.dice = 0;        // 當前這回合的骰子點數（給 move 使用）
        this.movable = 0;     // 可移動的棋子（給 move 使用）
    }
}

export const gameRules = {
    // 各顏色起飛點、入口、家門通道起點
    PLAYER_COLOR: ['red', 'blue', 'green', 'yellow'],
    START: { 0: 64, 1: 51, 2: 25, 3: 38 },
    GOAL_ENTRY: { 0: 60, 1: 47, 2: 21, 3: 34 },
    GOAL_PATH_START: { 0: 68, 1: 86, 2: 80, 3: 74 },
    RING_SIZE: 52,
    RING_START: 16,

    // 擲骰子並回傳「本玩家哪幾顆棋子可以移動」的位掩碼（0~15）
    // 同時處理「連續三個6」懲罰
    roll(ls, dice) {
        ls.dice = dice;
        const p = ls.player;
        const base = p * 4;
        ls.six = dice === 6 ? ls.six + 1 : 0;

        // 連續三個6 → 所有在跑道上的棋子飛回基地
        if (ls.six === 3) {
            for (let i = base; i < base + 4; i++) {
                if (ls.st[i] !== 0 && ls.st[i] !== 3) {   // 不在家也不在終點
                    ls.pos[i] = base + (i % 4);      // 回各自家區格子
                    ls.st[i] = 0;
                }
            }
            ls.six = 0;
            ls.dice = 0;
            ls.player = (p + 1) % 4;              // 換下家
            return;                                     // 無棋可移動
        }

        // 正常情況：計算可移動的棋子
        let movable = 0;
        for (let i = 0; i < 4; i++) {
            const s = ls.st[base + i];
            if ((s === 0 && dice === 6) || s === 1 || s === 2) {
                movable |= (1 << i);
            }
        }

        if (movable === 0) {
            ls.dice = 0;
            ls.player = (p + 1) % 4;
        };

        ls.movable = movable;
    },

    // 實際移動一顆棋子（localIdx 為 0~3）
    move(ls, localIdx) {
        if (ls.movable === 0 && ls.dice <= 6 && ls.dice >= 0) return;

        const idx = ls.player * 4 + localIdx;   // 全局索引 0~15
        let pos = ls.pos[idx];
        let st = ls.st[idx];
        const p = ls.player;
        const dice = ls.dice;

        // ── 1. 起飛 ─────────────────────────────────────
        if (st === 0) {                            // 從家區起飛
            pos = this.START[p];
            st = 1;
        }
        // ── 2. 外圈跑道移動 ─────────────────────────────
        else if (st === 1) {
            const entry = this.GOAL_ENTRY[p];
            const goalPath = this.GOAL_PATH_START[p];
            const nextPos = this.RING_START + (pos - this.RING_START + dice) % this.RING_SIZE;

            if (this._willPassGoalEntry(pos, nextPos, entry)) {
                // 進入家門通道
                const stepsToEntry = this._getStepsToGoalEntry(pos, entry);
                const remainingSteps = dice - stepsToEntry;

                if (remainingSteps > 0) {
                    pos = goalPath + remainingSteps - 1;
                    st = 2;
                    if (pos >= this.GOAL_PATH_START[p] + 5) { // 直接飛進終點
                        pos = 255;
                        st = 3;
                    }
                }
            } else {
                // 正常在跑道上走
                pos = nextPos;
                st = 1;

                // 跳躍規則：踩到自己顏色的格子（不包含入口格）
                if (pos !== entry && pos % 4 === p) {
                    pos = this.RING_START + (nextPos - this.RING_START + 4) % this.RING_SIZE;
                }
            }
        }
        // ── 3. 家門通道移動（可超終點後退） ───────────────
        else if (st === 2) {
            const goalEnd = this.GOAL_PATH_START[p] + 5;   // 真正的終點格編號（如 red 是 73）

            if (pos + dice < goalEnd) {
                // 正常往前走
                pos += dice;
                st = 2;
            }
            else if (pos + dice === goalEnd) {
                // 進家
                pos = 255;
                st = 3;
            }
            else {
                // 擲太大 → 往回彈
                const overshoot = dice - (goalEnd - pos);
                pos = goalEnd - overshoot;
                st = 2;
            }
        }

        // ── 4. 踢掉對手（同一格且不在家/終點） ─────────────
        for (let i = 0; i < 16; i++) {
            if (Math.floor(i / 4) === p) continue;
            if (ls.pos[i] === pos && ls.st[i] !== 0 && ls.st[i] !== 3) {
                ls.pos[i] = this._getFreeHomeSlot(ls, Math.floor(i / 4));
                ls.st[i] = 0;
            }
        }

        // ── 處理疊棋 ─────────────────────────────────────
        const stackIndices = [];  // 收集所有疊在一起的棋子全局索引
        for (let i = 0; i < 4; i++) {
            if (ls.pos[p * 4 + i] === ls.pos[idx] && ls.st[p * 4 + i] === ls.st[idx]) {
                stackIndices.push(p * 4 + i);
            }
        }

        // 將整個疊棋移動到新位置
        for (const sIdx of stackIndices) {
            ls.pos[sIdx] = pos;
            ls.st[sIdx] = st;
        }

        // 飛進終點
        if (pos === 255) {
            this._checkWin(ls);
        }

        // ── 5. 決定下一位玩家（擲到6可再擲） ───────────────
        ls.dice = 0;
        ls.movable = 0;
        ls.player = (p + (dice === 6 ? 0 : 1)) % 4;
    },

    _getFreeHomeSlot(ls, player) {
        const base = player * 4;
        const used = new Set();
        for (let i = 0; i < 4; i++) {
            const idx = base + i;
            if (ls.st[idx] === 0) {
                used.add(ls.pos[idx] - base);
            }
        }
        for (let local = 0; local < 4; local++) {
            if (!used.has(local)) {
                return base + local;
            }
        }
        return -1;
    },

    _willPassGoalEntry(currentPos, newPos, entryPos) {
        if (currentPos <= entryPos && newPos >= entryPos) {
            return true;
        }

        if (currentPos >= newPos && newPos >= this.RING_START) {
            return entryPos >= this.RING_START && entryPos <= newPos;
        }

        return false;
    },

    _getStepsToGoalEntry(currentPos, entryPos) {
        if (currentPos <= entryPos) {
            return entryPos - currentPos;
        }
        return this.RING_SIZE - currentPos + this.RING_START + (entryPos - this.RING_START);
    },

    _checkWin(ls) {
        const base = ls.player * 4;

        if (ls.st[base] === 3 && ls.st[base + 1] === 3 && ls.st[base + 2] === 3 && ls.st[base + 3] === 3) {
            ls.winner = ls.player;
        }
    }
};
