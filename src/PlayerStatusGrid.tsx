import "./PlayerStatusGrid.css";
import { PlayerPieces } from "./engine/gameEngine";

interface PlayerStatusGridProps {
  currentPlayer: number;
  playersChess: PlayerPieces;
  playerOrder: readonly string[];
}

const PlayerStatusGrid: React.FC<PlayerStatusGridProps> = ({ currentPlayer, playersChess, playerOrder }) => {
  const currentColor = playerOrder[currentPlayer];

  const getPlayerStatus = (color: string) => {
    const player = playersChess[color];
    const atHome = player.filter((chess) => chess.state === "home").length;
    const onPath = player.filter((chess) => chess.state === "path").length;
    const inGoalPath = player.filter((chess) => chess.state === "goal-path").length;
    const atGoal = player.filter((chess) => chess.state === "goal").length;

    return { atHome, onPath, inGoalPath, atGoal };
  };

  return (
    <div className="panel-section">
      <h3>📊 Player Status</h3>
      <div className="player-status-grid">
        {playerOrder.map((color) => {
          const status = getPlayerStatus(color);
          return (
            <div key={color} className={`player-status ${color} ${color === currentColor ? "active" : ""}`}>
              <div className="player-color">{color}</div>
              <div className="status-details">
                <span title="At Home">🏠: {status.atHome}</span>
                <span title="On Track">🛣️: {status.onPath}</span>
                <span title="In Home Stretch">🚪: {status.inGoalPath}</span>
                <span title="At Goal">🎯: {status.atGoal}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerStatusGrid;
