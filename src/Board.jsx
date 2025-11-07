import React, { useState, useEffect, useRef } from "react";
import "./Board.css";
import Chess from "./Chess";
import Dice from "./Dice";

/**
 * ===================================================================
 * 【飛行棋完整遊戲邏輯】- 總體設計說明（新手必讀）
 * ===================================================================
 *
 * 一、這段程式碼實現了「經典四人飛行棋」的完整規則：
 *    - 4 位玩家（紅、黃、綠、藍），每人 4 顆飛機
 *    - 擲 6 才能起飛
 *    - 連續擲 3 次 6 → 罰回一顆在跑道上的棋子
 *    - 踩到對手 → 踢回老家
 *    - 踩到自己顏色格子 → 往前跳 4 步
 *    - 外圈 52 格環狀跑道 + 每人專屬「家門通道」
 *
 * 二、整體設計大方向：「用數字位置 + 狀態驅動」模擬真實棋盤
 *    - 不用圖片畫路徑，而是用 PATH_MAP 定義每格的「數字編號」
 *      例如：65 = 紅色起飛點，26 = 綠色起飛點
 *    - 棋子移動 = 「目前位置 + 骰子點數」，用 getNextPathPos 計算
 *    - 外圈是環狀：超過 52 格就 % 52 繞回
 *    - 狀態用 gameStat 管理：目前玩家、連 6 次數、每顆棋子位置
 *
 * 三、遊戲流程（像真人玩一樣）：
 *    1. 擲骰子 → handleDiceRoll(點數)
 *       → 判斷哪些棋子可動（在跑道 or 在家+擲6）
 *       → 高亮可點擊的棋子
 *    2. 點棋子 → handleChessClick()
 *       → 起飛：家區 → 起飛點
 *       → 移動：目前位置 + 點數
 *       → 若踩自己色 → 再 +4 步
 *       → 若有對手 → 踢回空家區
 *    3. 結束 → 清除高亮，換下家（擲 6 可再擲）
 *
 * 四、關鍵技術設計：
 *    | 功能           | 怎麼做                        | 為什麼這樣做 |
 *    |----------------|-------------------------------|-------------|
 *    | 棋子位置       | position: 數字                | 方便加減計算 |
 *    | 環狀跑道       | (pos - 16 + 步數) % 52 + 16   | 自動繞圈     |
 *    | 高亮可點       | Set 存 ID                     | 快速查詢     |
 *    | 踢人           | 找同位置對手 → 送回空家區     | 真實規則     |
 *    | 家區不重疊     | top/left 偏移                 | 畫面美觀     |
 *    | 骰子點數       | useRef 儲存                   | 不觸發重繪   |
 *
 * 五、畫面呈現：
 *    - CSS Grid 16×16 格子佈局
 *    - 每顆棋子是 <div>，用 gridRow/gridColumn 定位
 *    - 家區四顆棋子用 position: relative + 偏移錯開
 *    - 可點擊棋子加 .highlight 類別（發光動畫）
 *
 * 總結：這是一款「用程式碼還原飛行棋」的完整遊戲，
 *      結構清晰、規則完整、適合學習 React 狀態管理與遊戲邏輯！
 * ===================================================================
 */


// ── 地圖定義：每一個數字對應棋盤上的一格位置（x, y）座標 ─────────────────────
// 為什麼用數字當 key？ → 因為棋子移動時用「數字位置」比對，方便計算下一個格子
// 為什麼有 type？ → 區分「家區」「跑道」「起飛點」「家門」，不同規則用
const PATH_MAP = {
  // ── 家區起飛格（home-base）────────────────────
  // 紅色 (左上)
  0: { x: 1, y: 1, type: "home-base", player: "red" },
  1: { x: 1, y: 3, type: "home-base", player: "red" },
  2: { x: 3, y: 1, type: "home-base", player: "red" },
  3: { x: 3, y: 3, type: "home-base", player: "red" },

  // 綠色 (右上)
  4: { x: 13, y: 1, type: "home-base", player: "green" },
  5: { x: 13, y: 3, type: "home-base", player: "green" },
  6: { x: 15, y: 1, type: "home-base", player: "green" },
  7: { x: 15, y: 3, type: "home-base", player: "green" },

  // 綠色 (左下) ← 注意：這裡是綠色，不是藍色！
  8: { x: 1, y: 13, type: "home-base", player: "green" },
  9: { x: 1, y: 15, type: "home-base", player: "green" },
  10: { x: 3, y: 13, type: "home-base", player: "green" },
  11: { x: 3, y: 15, type: "home-base", player: "green" },

  // 黃色 (右下)
  12: { x: 13, y: 13, type: "home-base", player: "yellow" },
  13: { x: 13, y: 15, type: "home-base", player: "yellow" },
  14: { x: 15, y: 13, type: "home-base", player: "yellow" },
  15: { x: 15, y: 15, type: "home-base", player: "yellow" },

  // ── 外圈路徑（path / start）────────────────────
  // 外圈總共 52 格（16 ~ 67），每格有顏色標記（紅黃綠藍交錯）
  // 每個顏色的「起飛點」用 type: "start" 標記
  16: { x: 3, y: 4, color: "blue", type: "path" },
  17: { x: 2, y: 4, color: "red", type: "path" },
  18: { x: 1, y: 4, color: "green", type: "path" },
  19: { x: 1, y: 5, color: "yellow", type: "path" },
  20: { x: 1, y: 6, color: "blue", type: "path" },
  21: { x: 1, y: 7, color: "red", type: "path" },
  22: { x: 1, y: 8, color: "green", type: "path" },
  23: { x: 1, y: 9, color: "yellow", type: "path" },
  24: { x: 1, y: 10, color: "blue", type: "path" },
  25: { x: 1, y: 11, color: "red", type: "path" },
  26: { x: 1, y: 12, color: "green", type: "start", player: "green" }, // 綠色起飛點
  27: { x: 2, y: 12, color: "yellow", type: "path" },
  28: { x: 3, y: 12, color: "blue", type: "path" },

  29: { x: 4, y: 13, color: "red", type: "path" },
  30: { x: 4, y: 14, color: "green", type: "path" },
  31: { x: 4, y: 15, color: "yellow", type: "path" },
  32: { x: 5, y: 15, color: "blue", type: "path" },
  33: { x: 6, y: 15, color: "red", type: "path" },
  34: { x: 7, y: 15, color: "green", type: "path" },
  35: { x: 8, y: 15, color: "yellow", type: "path" },
  36: { x: 9, y: 15, color: "blue", type: "path" },
  37: { x: 10, y: 15, color: "red", type: "path" },
  38: { x: 11, y: 15, color: "green", type: "path" },
  39: { x: 12, y: 15, color: "yellow", type: "start", player: "yellow" }, // 黃色起飛點
  40: { x: 12, y: 14, color: "blue", type: "path" },
  41: { x: 12, y: 13, color: "red", type: "path" },

  42: { x: 13, y: 12, color: "green", type: "path" },
  43: { x: 14, y: 12, color: "yellow", type: "path" },
  44: { x: 15, y: 12, color: "blue", type: "path" },
  45: { x: 15, y: 11, color: "red", type: "path" },
  46: { x: 15, y: 10, color: "green", type: "path" },
  47: { x: 15, y: 9, color: "yellow", type: "path" },
  48: { x: 15, y: 8, color: "blue", type: "path" },
  49: { x: 15, y: 7, color: "red", type: "path" },
  50: { x: 15, y: 6, color: "green", type: "path" },
  51: { x: 15, y: 5, color: "yellow", type: "path" },
  52: { x: 15, y: 4, color: "blue", type: "start", player: "blue" }, // 藍色起飛點
  53: { x: 14, y: 4, color: "red", type: "path" },
  54: { x: 13, y: 4, color: "green", type: "path" },

  55: { x: 12, y: 3, color: "yellow", type: "path" },
  56: { x: 12, y: 2, color: "blue", type: "path" },
  57: { x: 12, y: 1, color: "red", type: "path" },
  58: { x: 11, y: 1, color: "green", type: "path" },
  59: { x: 10, y: 1, color: "yellow", type: "path" },
  60: { x: 9, y: 1, color: "blue", type: "path" },
  61: { x: 8, y: 1, color: "red", type: "path" },
  62: { x: 7, y: 1, color: "green", type: "path" },
  63: { x: 6, y: 1, color: "yellow", type: "path" },
  64: { x: 5, y: 1, color: "blue", type: "path" },
  65: { x: 4, y: 1, color: "red", type: "start", player: "red" }, // 紅色起飛點
  66: { x: 4, y: 2, color: "green", type: "path" },
  67: { x: 4, y: 3, color: "yellow", type: "path" },

  // ── 紅色家門（home-entry / home）──────────────
  // 紅色玩家快到終點時，會走這條「紅色通道」進家
  68: { x: 8, y: 7, color: "red", type: "home-entry", player: "red" }, // 入口
  69: { x: 8, y: 6, color: "red", type: "home", player: "red" },
  70: { x: 8, y: 5, color: "red", type: "home", player: "red" },
  71: { x: 8, y: 4, color: "red", type: "home", player: "red" },
  72: { x: 8, y: 3, color: "red", type: "home", player: "red" },
  73: { x: 8, y: 2, color: "red", type: "home", player: "red" },

  // 黃色家門
  74: { x: 8, y: 9, color: "yellow", type: "home-entry", player: "yellow" },
  75: { x: 8, y: 10, color: "yellow", type: "home", player: "yellow" },
  76: { x: 8, y: 11, color: "yellow", type: "home", player: "yellow" },
  77: { x: 8, y: 12, color: "yellow", type: "home", player: "yellow" },
  78: { x: 8, y: 13, color: "yellow", type: "home", player: "yellow" },
  79: { x: 8, y: 14, color: "yellow", type: "home", player: "yellow" },

  // 綠色家門
  80: { x: 7, y: 8, color: "green", type: "home-entry", player: "green" },
  81: { x: 6, y: 8, color: "green", type: "home", player: "green" },
  82: { x: 5, y: 8, color: "green", type: "home", player: "green" },
  83: { x: 4, y: 8, color: "green", type: "home", player: "green" },
  84: { x: 3, y: 8, color: "green", type: "home", player: "green" },
  85: { x: 2, y: 8, color: "green", type: "home", player: "green" },

  // 藍色家門
  86: { x: 9, y: 8, color: "blue", type: "home-entry", player: "blue" },
  87: { x: 10, y: 8, color: "blue", type: "home", player: "blue" },
  88: { x: 11, y: 8, color: "blue", type: "home", player: "blue" },
  89: { x: 12, y: 8, color: "blue", type: "home", player: "blue" },
  90: { x: 13, y: 8, color: "blue", type: "home", player: "blue" },
  91: { x: 14, y: 8, color: "blue", type: "home", player: "blue" },
};

// ── 玩家順序對應顏色（0~3） ─────────────────────────────────────
const COLOR = {
  0: "red",
  1: "yellow",
  2: "green",
  3: "blue",
};

// ── 每個顏色的起飛點位置（擲 6 才能出發） ─────────────────────────────
const PLAYER_START_POS = {
  red: 65,
  yellow: 39,
  green: 26,
  blue: 52,
};

// ── 家區四個位置的編號（用來找空位） ─────────────────────────────────
const HOME_BASE_SLOTS = {
  red: [0, 1, 2, 3],
  blue: [4, 5, 6, 7],
  green: [8, 9, 10, 11],
  yellow: [12, 13, 14, 15],
};

// ── 主棋盤元件 ─────────────────────────────────────────────────────
const Board = () => {
  // 用 useRef 儲存目前骰子點數（不會因 render 重置）
  // 為什麼不用 useState？ → 不用觸發畫面更新，只記錄用
  const dice = useRef(0);

  // 換下一個玩家：0→1→2→3→0（紅→黃→綠→藍）
  const nextPlayer = (current) => (current + 1) % 4;

  // 可點擊的棋子（高亮顯示）
  const [highlightChess, setHighlightChess] = useState(new Set());

  // 遊戲狀態：目前玩家、連續擲 6 次數、每位玩家的 4 顆棋子狀態
  const [gameStat, setGameStat] = useState({
    currentPlayer: 0, // 0=紅, 1=黃, 2=綠, 3=藍
    sixCount: 0, // 連續擲到 6 的次數
    players: {
      red: [
        { id: "red-0", state: "home-base", position: 0 },
        { id: "red-1", state: "home-base", position: 1 },
        { id: "red-2", state: "home-base", position: 2 },
        { id: "red-3", state: "home-base", position: 3 },
      ],
      blue: [
        { id: "blue-0", state: "home-base", position: 4 },
        { id: "blue-1", state: "home-base", position: 5 },
        { id: "blue-2", state: "home-base", position: 6 },
        { id: "blue-3", state: "home-base", position: 7 },
      ],
      green: [
        { id: "green-0", state: "home-base", position: 8 },
        { id: "green-1", state: "home-base", position: 9 },
        { id: "green-2", state: "home-base", position: 10 },
        { id: "green-3", state: "home-base", position: 11 },
      ],
      yellow: [
        { id: "yellow-0", state: "home-base", position: 12 },
        { id: "yellow-1", state: "home-base", position: 13 },
        { id: "yellow-2", state: "home-base", position: 14 },
        { id: "yellow-3", state: "home-base", position: 15 },
      ],
    },
  });

  // ── 換玩家時清除高亮 ─────────────────────────────────────
  // 為什麼要清除？ → 避免上一個玩家的可移動棋子還在發光
  useEffect(() => {
    setHighlightChess(new Set());
  }, [gameStat.currentPlayer]);

  // ── 擲骰子後觸發：決定哪些棋子可以點 ─────────────────────────────
  const handleDiceRoll = (value) => {
    const playerColor = COLOR[gameStat.currentPlayer]; // 目前是誰在擲
    const playerChess = gameStat.players[playerColor]; // 他的 4 顆棋子
    const toHighlight = new Set(); // 準備高亮的棋子 ID

    dice.current = value; // 記住這次擲了幾點

    // ── 1. 計算連續擲 6 的次數 ─────────────────────────────
    const sixCount = value === 6 ? gameStat.sixCount + 1 : 0;

    // ── 2. 連續三次 6 → 罰回家的棋子（如果有在跑道上） ─────────────
    if (sixCount === 3) {
      const inPath = playerChess.find((c) => c.state === "path"); // 找一顆在跑道的
      if (inPath) {
        const freeSlot = getFreeHomeSlot(gameStat.players, playerColor); // 找空家區
        if (freeSlot !== undefined) {
          const newPlayers = { ...gameStat.players };
          const idx = newPlayers[playerColor].findIndex((c) => c.id === inPath.id);
          newPlayers[playerColor][idx] = {
            ...inPath,
            state: "home-base",
            position: freeSlot,
          };

          setGameStat({
            players: newPlayers,
            currentPlayer: nextPlayer(gameStat.currentPlayer),
            sixCount: 0,
          });
          return;
        }
      }
      // 沒有棋子可送回 → 直接換人
      setGameStat((prev) => ({
        ...prev,
        currentPlayer: nextPlayer(prev.currentPlayer),
        sixCount: 0,
      }));
      return;
    }

    // ── 3. 正常情況：哪些棋子可以移動？ ───────────────────────
    playerChess.forEach((chess) => {
      if (chess.state === "path") toHighlight.add(chess.id); // 在跑道 → 可走
      if (chess.state === "home-base" && value === 6) toHighlight.add(chess.id); // 在家 + 擲 6 → 可起飛
    });

    // 沒有可移動的棋子 → 換下家
    if (toHighlight.size === 0) {
      setGameStat((prev) => ({
        ...prev,
        currentPlayer: nextPlayer(prev.currentPlayer),
        sixCount: 0,
      }));
      return;
    }

    // 顯示可點的棋子（高亮）
    setHighlightChess(toHighlight);
    setGameStat((prev) => ({ ...prev, sixCount: sixCount }));
  };

  // ── 點擊棋子：移動邏輯 ─────────────────────────────────────
  const handleChessClick = (chessId) => {
    if (!highlightChess.has(chessId)) return; // 不是可點的 → 忽略

    const [color, _] = chessId.split("-");
    const chess = gameStat.players[color].find((c) => c.id === chessId);
    if (!chess) return;

    const newPlayers = { ...gameStat.players };
    const chessIndex = newPlayers[color].findIndex((c) => c.id === chessId);

    let newPosition = chess.position;
    let newState = chess.state;

    // ── 起飛邏輯（從家區出發） ─────────────────────────────
    if (chess.state === "home-base" && dice.current === 6) {
      newPosition = PLAYER_START_POS[color]; // 飛到起飛點
      newState = "path";

      // 如果起飛點有對手 → 踢回去！
      kickOpponents(newPlayers, newPosition, color, gameStat);
    }

    // ── 一般移動（已在跑道上） ─────────────────────────────
    if (chess.state === "path") {
      let tempPos = getNextPathPos(chess.position, dice.current); // 先走骰子步數

      // 特殊規則：走到「自己顏色的格子」→ 再往前跳 4 步！
      if (PATH_MAP[tempPos] && PATH_MAP[tempPos].color === color) {
        tempPos = getNextPathPos(tempPos, 4);
      }

      newPosition = tempPos;
      kickOpponents(newPlayers, newPosition, color, gameStat); // 踢人
    }

    // 更新這顆棋子的位置與狀態
    newPlayers[color][chessIndex] = {
      ...chess,
      state: newState,
      position: newPosition,
    };

    // 清除高亮與骰子
    setHighlightChess(new Set());
    dice.current = 0;

    // 換下家（除非又擲 6）
    setGameStat({
      players: newPlayers,
      currentPlayer: dice.current === 6 ? gameStat.currentPlayer : nextPlayer(gameStat.currentPlayer),
      sixCount: dice.current === 6 ? gameStat.sixCount : 0,
    });
  };

  // ── 計算下一個外圈位置（環狀 52 格） ─────────────────────
  const getNextPathPos = (currentPos, steps) => {
    const RING_START = 16; // 外圈從 16 開始
    const RING_SIZE = 52; // 外圈總共 52 格
    const ringIndex = currentPos - RING_START;
    const newRingIndex = (ringIndex + steps) % RING_SIZE;
    // 為什麼 % RING_SIZE？ → 超過 52 格就繞回 16
    return RING_START + newRingIndex;
  };

  // ── 找一個空的家區位置（給被踢回來的棋子） ─────────────────────
  const getFreeHomeSlot = (players, color) => {
    return HOME_BASE_SLOTS[color].find((slot) => !players[color].some((c) => c.state === "home-base" && c.position === slot));
  };

  // ── 踢掉對手（同一格只能一顆棋子） ─────────────────────────
  const kickOpponents = (newPlayers, pos, currentColor, gameStat) => {
    for (const [color, list] of Object.entries(gameStat.players)) {
      if (color === currentColor) continue; // 自己不踢自己

      const idx = list.findIndex((c) => c.state === "path" && c.position === pos);
      if (idx === -1) continue;

      const slot = getFreeHomeSlot(newPlayers, color);
      if (slot === undefined) continue;

      newPlayers[color][idx] = { ...list[idx], state: "home-base", position: slot };
    }
  };

  // ── 畫面渲染 ───────────────────────────────────────────────
  return (
    <>
      <Dice onRoll={handleDiceRoll} /> {/* 骰子按鈕 */}
      <h1>{gameStat.currentPlayer} turn</h1> {/* 顯示目前玩家編號 */}
      <div className="container">
        {/* 四個玩家家區背景 */}
        <PlayerBoardSpace color="red" gridArea="1 / 4 / 4 / 1"></PlayerBoardSpace>
        <PlayerBoardSpace color="yellow" gridArea="16 / 13 / 13 / 16"></PlayerBoardSpace>
        <PlayerBoardSpace color="green" gridArea="1 / 13 / 4 / 16"></PlayerBoardSpace>
        <PlayerBoardSpace color="blue" gridArea="16 / 1 / 13 / 4"></PlayerBoardSpace>

        {/* 畫出所有跑道格子 */}
        {Object.values(PATH_MAP)
          .filter((cell) => ["path", "start", "home-entry", "home"].includes(cell.type))
          .map((cell) => (
            <Cell key={`cell-${cell.x}-${cell.y}`} color={cell.color} x={cell.x} y={cell.y} />
          ))}

        {/* 畫出每顆棋子 */}
        {Object.entries(gameStat.players).map(([color, chessList]) =>
          chessList.map((chess) => {
            const cell = PATH_MAP[chess.position];
            if (!cell) return null;

            const isInHomeBase = chess.state === "home-base"; // 是否在家區
            const isHighlighted = highlightChess.has(chess.id); // 是否可點

            // 家區內的四顆棋子要錯開位置（避免重疊）
            const homeBaseOffset = isInHomeBase
              ? [
                  { top: "20px", left: "20px" },
                  { top: "20px", left: "-20px" },
                  { top: "-20px", left: "20px" },
                  { top: "-20px", left: "-20px" },
                ][chess.position % 4]
              : null;

            return (
              <div
                key={chess.id}
                className={`center ${isHighlighted ? "highlight" : ""}`}
                style={{
                  gridRow: cell.x,
                  gridColumn: cell.y,
                  ...(isInHomeBase ? { position: "relative", ...homeBaseOffset } : {}),
                  transition: "all 0.6s ease-in-out",
                  cursor: isHighlighted ? "pointer" : "default",
                }}
                onClick={() => handleChessClick(chess.id)} // 點擊移動
              >
                <Chess color={color} /> {/* 棋子圖示 */}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

// ── 單一格子元件（畫圓圈） ─────────────────────────────────────
const Cell = ({ color = "", x, y }) => {
  return (
    <div className={`cell ` + color} style={{ gridRow: x, gridColumn: y }}>
      <div className="circle"></div>
    </div>
  );
};

// ── 玩家家區背景（4個小格子） ─────────────────────────────────
const PlayerBoardSpace = ({ color = "", gridArea }) => {
  return (
    <div className={`player-space ${color}`} style={{ gridArea }}>
      <Cell x="1" y="1" />
      <Cell x="1" y="2" />
      <Cell x="2" y="1" />
      <Cell x="2" y="2" />
    </div>
  );
};

export default Board;
