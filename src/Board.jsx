import React, { useState, useEffect } from "react";
import "./Board.css";
import Chess from "./Chess";
import Dice from "./Dice";

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

  // 綠色 (左下)
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
  26: { x: 1, y: 12, color: "green", type: "start", player: "green" },
  27: { x: 2, y: 12, color: "yellow", type: "path" },
  28: { x: 3, y: 12, color: "blue", type: "path" },

  29: { x: 4, y: 3, color: "yellow", type: "path" },
  30: { x: 4, y: 2, color: "green", type: "path" },
  31: { x: 4, y: 1, color: "red", type: "start", player: "red" },
  32: { x: 5, y: 1, color: "blue", type: "path" },
  33: { x: 6, y: 1, color: "yellow", type: "path" },
  34: { x: 7, y: 1, color: "green", type: "path" },
  35: { x: 8, y: 1, color: "red", type: "path" },
  36: { x: 9, y: 1, color: "blue", type: "path" },
  37: { x: 10, y: 1, color: "yellow", type: "path" },
  38: { x: 11, y: 1, color: "green", type: "path" },
  39: { x: 12, y: 1, color: "red", type: "path" },
  40: { x: 12, y: 2, color: "blue", type: "path" },
  41: { x: 12, y: 3, color: "yellow", type: "path" },

  42: { x: 13, y: 4, color: "green", type: "path" },
  43: { x: 14, y: 4, color: "red", type: "path" },
  44: { x: 15, y: 4, color: "blue", type: "start", player: "blue" }, // 黃色起飛點
  45: { x: 15, y: 5, color: "yellow", type: "path" },
  46: { x: 15, y: 6, color: "green", type: "path" },
  47: { x: 15, y: 7, color: "red", type: "path" },
  48: { x: 15, y: 8, color: "blue", type: "path" },
  49: { x: 15, y: 9, color: "yellow", type: "path" },
  50: { x: 15, y: 10, color: "green", type: "path" },
  51: { x: 15, y: 11, color: "red", type: "path" },
  52: { x: 15, y: 12, color: "blue", type: "path" },
  53: { x: 14, y: 12, color: "yellow", type: "path" },
  54: { x: 13, y: 12, color: "green", type: "path" },

  55: { x: 12, y: 13, color: "red", type: "path" },
  56: { x: 12, y: 14, color: "blue", type: "path" },
  57: { x: 12, y: 15, color: "yellow", type: "start", player: "yellow" },
  58: { x: 11, y: 15, color: "green", type: "path" },
  59: { x: 10, y: 15, color: "red", type: "path" },
  60: { x: 9, y: 15, color: "blue", type: "path" },
  61: { x: 8, y: 15, color: "yellow", type: "path" },
  62: { x: 7, y: 15, color: "green", type: "path" },
  63: { x: 6, y: 15, color: "red", type: "path" },
  64: { x: 5, y: 15, color: "blue", type: "path" },
  65: { x: 4, y: 15, color: "yellow", type: "path" },
  66: { x: 4, y: 14, color: "green", type: "path" },
  67: { x: 4, y: 13, color: "red", type: "path" },

  // ── 紅色家門（home-entry / home）──────────────
  68: { x: 8, y: 7, color: "red", type: "home-entry", player: "red" },
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

const COLOR = {
  0: "red",
  1: "yellow",
  2: "green",
  3: "blue",
};

const Board = () => {
  const nextPlayer = (currentPlayer) => (currentPlayer + 1) % 4;

  const [gameStat, setGameStat] = useState({
    currentPlayer: 0,
    playerStat: {
      red: {
        chess1: { state: "start", position: 0 },
        chess2: { state: "start", position: 1 },
        chess3: { state: "start", position: 2 },
        chess4: { state: "start", position: 3 },
      },
      blue: {
        chess1: { state: "start", position: 4 },
        chess2: { state: "start", position: 5 },
        chess3: { state: "start", position: 6 },
        chess4: { state: "start", position: 7 },
      },
      green: {
        chess1: { state: "start", position: 8 },
        chess2: { state: "start", position: 9 },
        chess3: { state: "start", position: 10 },
        chess4: { state: "start", position: 11 },
      },
      yellow: {
        chess1: { state: "start", position: 12 },
        chess2: { state: "start", position: 13 },
        chess3: { state: "start", position: 14 },
        chess4: { state: "start", position: 15 },
      },
    },
  });

  // 新增：記錄哪些棋子要亮燈
  const [highlightChess, setHighlightChess] = useState(new Set());

  // 當 currentPlayer 改變時，清除上一個玩家的亮燈
  useEffect(() => {
    setHighlightChess(new Set());
  }, [gameStat.currentPlayer]);

  // 擲骰後：如果擲出 6，亮起所有在基地的棋子
  const handleDiceRoll = (value) => {
    const playerColor = COLOR[gameStat.currentPlayer];
    const player = gameStat.playerStat[playerColor];

    const toHighlight = new Set();
    Object.entries(player).forEach(([id, chess]) => {
      if (chess.state === "start") {
        toHighlight.add(`${playerColor}-${id}`);
      }
    });

    setHighlightChess(toHighlight);
  };

  // 點擊亮燈的棋子 → 起飛
  const handleChessClick = (color, chessId) => {
    const key = `${color}-${chessId}`;
    if (!highlightChess.has(key)) return; // 不是可移動的棋子

    const player = gameStat.playerStat[color];

    // 找出該顏色的起飛點 (start type)
    const startCell = Object.values(PATH_MAP).find((cell) => cell.type === "start" && cell.player === color);

    if (!startCell) return;

    // 更新狀態：從 start → path，位置改為起飛點
    const newPlayerStat = {
      ...gameStat.playerStat,
      [color]: {
        ...player,
        [chessId]: {
          state: "path",
          position: Object.keys(PATH_MAP).find((k) => PATH_MAP[k] === startCell),
        },
      },
    };

    setGameStat({
      ...gameStat,
      playerStat: newPlayerStat,
      currentPlayer: nextPlayer(gameStat.currentPlayer),
    });

    // 清除亮燈
    setHighlightChess(new Set());
  };

  return (
    <>
      <Dice onRoll={handleDiceRoll} />
      <div className="container">
        <PlayerBoardSpace color="red" gridArea="1 / 4 / 4 / 1"></PlayerBoardSpace>
        <PlayerBoardSpace color="yellow" gridArea="16 / 13 / 13 / 16"></PlayerBoardSpace>
        <PlayerBoardSpace color="green" gridArea="1 / 13 / 4 / 16"></PlayerBoardSpace>
        <PlayerBoardSpace color="blue" gridArea="16 / 1 / 13 / 4"></PlayerBoardSpace>

        {/* 渲染路徑 */}
        {Object.values(PATH_MAP)
          .filter((cell) => ["path", "start", "home-entry", "home"].includes(cell.type))
          .map((cell) => (
            <div key={`cell-${cell.x}-${cell.y}`} className={`cell ${cell.color || ""}`} style={{ gridRow: cell.x, gridColumn: cell.y }}>
              <div className="circle" />
            </div>
          ))}

        {/* 渲染棋子 */}
        {Object.entries(gameStat.playerStat).map(([color, player]) =>
          Object.entries(player).map(([chessId, chess]) => {
            const cell = PATH_MAP[chess.position];
            if (!cell) return null;

            const offsetMap = {
              0: { top: "20px", left: "20px" },
              1: { top: "20px", left: "-20px" },
              2: { top: "-20px", left: "20px" },
              3: { top: "-20px", left: "-20px" },
              4: { top: "20px", left: "20px" },
              5: { top: "20px", left: "-20px" },
              6: { top: "-20px", left: "20px" },
              7: { top: "-20px", left: "-20px" },
              8: { top: "20px", left: "20px" },
              9: { top: "20px", left: "-20px" },
              10: { top: "-20px", left: "20px" },
              11: { top: "-20px", left: "-20px" },
              12: { top: "20px", left: "20px" },
              13: { top: "20px", left: "-20px" },
              14: { top: "-20px", left: "20px" },
              15: { top: "-20px", left: "-20px" },
            };

            const offset = offsetMap[chess.position];
            const isHighlighted = highlightChess.has(`${color}-${chessId}`);

            return (
              <div
                key={`${color}-${chessId}`}
                className={`center ${isHighlighted ? "highlight" : ""}`}
                style={{
                  gridRow: cell.x,
                  gridColumn: cell.y,
                  ...(chess.position <= 15 ? { position: "relative", ...offset } : {}),
                  transition: "all 0.6s ease-in-out",
                  cursor: isHighlighted ? "pointer" : "default",
                }}
                onClick={() => handleChessClick(color, chessId)}
              >
                <Chess color={color} />
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

const Cell = ({ color = "", x, y }) => {
  return (
    <div className={`cell ` + color} style={{ gridRow: x, gridColumn: y }}>
      <div className="circle"></div>
    </div>
  );
};

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
