import React from "react";
import "./CurrentPlayerDisplay.css";

const CurrentPlayerDisplay = ({ currentPlayer, players, gameConfig, isAITurn, aiPlayers }) => {
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

  // 檢查當前玩家是否為AI
  const isCurrentPlayerAI = aiPlayers && aiPlayers[currentColor];

  // 玩家顯示名稱
  const playerDisplayName = isCurrentPlayerAI ? `🤖 ${currentColor} AI` : `👤 ${currentColor} 玩家`;

  return (
    <div className="panel-section current-player-section">
      {winner ? (
        <div className="victory-message">🏆 {winner} 玩家獲得勝利！</div>
      ) : (
        <div className={`current-player-display ${currentColor} ${isAITurn ? "ai-turn" : ""}`}>
          <h2>當前玩家</h2>
          <div className="player-name-large">{playerDisplayName}</div>
          <div className="player-turn-indicator">{isAITurn ? "🤖 AI 思考中..." : "請擲骰子並移動飛機"}</div>
        </div>
      )}
    </div>
  );
};

export default CurrentPlayerDisplay;
