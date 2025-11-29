import "./VictoryScreen.css";
import {} from "./engine/gameEngine";

interface VictoryScreenProps {
  winner: string;
  onRestart: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ winner, onRestart }) => {
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

          <div className="victory-message">Congratulations to {winner} Player for the Victory!</div>

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
