import React from "react";
import "./CurrentPlayerDisplay.css";

const CurrentPlayerDisplay = ({ currentPlayer, players, gameConfig }) => {
  /**
   * 🏆 檢查勝利條件
   */
  const checkWinner = () => {
    for (const color of gameConfig.PLAYER_COLORS) {
      const player = players[color];
      const allAtGoal = player.every((chess) => chess.state === "goal");
      if (allAtGoal) {
        return color;
      }
    }
    return null;
  };

  const currentColor = gameConfig.PLAYER_ORDER[currentPlayer];
  const winner = checkWinner();

  return (
    <div className="panel-section current-player-section">
      {winner ? (
        <div className="victory-message">🏆 {winner} 玩家獲得勝利！</div>
      ) : (
        <div className={`current-player-display ${currentColor}`}>
          <h2>當前玩家</h2>
          <div className="player-name-large">{currentColor}</div>
          <div className="player-turn-indicator">請擲骰子並移動飛機</div>
        </div>
      )}
    </div>
  );
};

export default CurrentPlayerDisplay;
