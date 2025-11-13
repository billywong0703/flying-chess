import "./VictoryScreen.css";

// =============================================================================
// 勝利畫面元件
// =============================================================================

/**
 * 🏆 勝利畫面元件
 * 顯示獲勝玩家和慶祝動畫
 */
const VictoryScreen = ({ winner, onRestart }) => {
  // 顏色對應的中文名稱
  const colorNames = {
    red: "紅色",
    yellow: "黃色",
    green: "綠色",
    blue: "藍色",
  };

  // 顏色對應的慶祝訊息
  const victoryMessages = {
    red: "🎉 熱烈祝賀紅色玩家獲得勝利！",
    yellow: "🎉 恭喜黃色玩家勇奪冠軍！",
    green: "🎉 綠色玩家展現了非凡的飛行技巧！",
    blue: "🎉 藍色玩家成功抵達終點！",
  };

  return (
    <div className="victory-overlay">
      <div className="victory-modal">
        <div className="victory-header">
          <h1>🏆 遊戲勝利 🏆</h1>
        </div>

        <div className="victory-content">
          <div className={`winner-trophy ${winner}`}>
            <div className="trophy">🏆</div>
            <div className="winner-color">{colorNames[winner]}</div>
          </div>

          <div className="victory-message">{victoryMessages[winner]}</div>

          <div className="celebration">
            <div className="confetti">🎊</div>
            <div className="confetti">🎉</div>
            <div className="confetti">✨</div>
          </div>
        </div>

        <div className="victory-actions">
          <button className="restart-button" onClick={onRestart}>
            🎮 再來一局
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
