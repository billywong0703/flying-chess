import "./VictoryScreen.css";

// =============================================================================
// Victory Screen Component
// =============================================================================
const VictoryScreen = ({ winner, onRestart }) => {
  // Victory celebration messages for each color
  const victoryMessages = {
    red: "🎉 Congratulations to Red Player for the Victory!",
    yellow: "🎉 Yellow Player Wins the Championship!",
    green: "🎉 Green Player Shows Exceptional Flying Skills!",
    blue: "🎉 Blue Player Successfully Reaches the Finish Line!",
  };

  return (
    <div className="victory-overlay">
      <div className="victory-modal">
        <div className="victory-header">
          <h1>🏆 Victory! 🏆</h1>
        </div>

        <div className="victory-content">
          <div className={`winner-trophy ${winner}`}>
            <div className="trophy">🏆</div>
            <div className="winner-color">{winner}</div>
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
            🎮 Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
