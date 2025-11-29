import React from "react";
import "./Board.css";
import { PATH_MAP } from "./engine/gameEngine";

export interface GameBoardProps {
  children?: React.ReactNode;
}

const GameBoard: React.FC<GameBoardProps> = ({ children }) => {
  return (
    <div className="game-board">
      <div className="container">
        <PlayerBoardSpace color="red" gridArea="1 / 4 / 4 / 1" />
        <PlayerBoardSpace color="green" gridArea="1 / 13 / 4 / 16" />
        <PlayerBoardSpace color="blue" gridArea="16 / 1 / 13 / 4" />
        <PlayerBoardSpace color="yellow" gridArea="16 / 13 / 13 / 16" />

        {Object.values(PATH_MAP)
          .filter((cell) => ["home", "path", "start", "goal-entry", "goal", "goal-path"].includes(cell.type))
          .map((cell, index) => (
            <Cell key={`cell-${cell.x}-${cell.y}-${index}`} color={cell.color} x={cell.x} y={cell.y} />
          ))}

        {children}
      </div>
    </div>
  );
};

const Cell: React.FC<{ color?: string; x: number; y: number }> = ({ color = "", x, y }) => (
  <div className={`cell ${color}`} style={{ gridRow: x, gridColumn: y }}>
    <div className="circle"></div>
  </div>
);

const PlayerBoardSpace: React.FC<{ color: string; gridArea: string }> = ({ color = "", gridArea }) => (
  <div className={`player-space ${color}`} style={{ gridArea }}>
    <Cell x={1} y={1} />
    <Cell x={1} y={2} />
    <Cell x={2} y={1} />
    <Cell x={2} y={2} />
  </div>
);

export default GameBoard;
