import React from "react";
import "./PlayerStatusGrid.css";

const PlayerStatusGrid = ({ currentPlayer, playersChess, playerOrder }) => {
  /**
   * 🎯 獲取玩家狀態摘要
   */
  const getPlayerStatus = (color) => {
    const player = playersChess[color];
    const atHome = player.filter((chess) => chess.state === "home").length;
    const onPath = player.filter((chess) => chess.state === "path").length;
    const inGoalPath = player.filter((chess) => chess.state === "goal-path").length;
    const atGoal = player.filter((chess) => chess.state === "goal").length;

    return { atHome, onPath, inGoalPath, atGoal };
  };

  const currentColor = playerOrder[currentPlayer];

  return (
    <div className="panel-section">
      <h3>📊 玩家狀態</h3>
      <div className="player-status-grid">
        {playerOrder.map((color) => {
          const status = getPlayerStatus(color);
          return (
            <div key={color} className={`player-status ${color} ${color === currentColor ? "active" : ""}`}>
              <div className="player-color">{color}</div>
              <div className="status-details">
                <span title="在家">🏠: {status.atHome}</span>
                <span title="在跑道">🛣️: {status.onPath}</span>
                <span title="在家門通道">🚪: {status.inGoalPath}</span>
                <span title="在終點">🎯: {status.atGoal}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerStatusGrid;
