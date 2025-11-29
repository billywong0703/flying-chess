import "./CurrentPlayerDisplay.css";
import { PlayerPieces, Piece } from "./engine/gameEngine";

interface CurrentPlayerDisplayProps {
  currentPlayer: number;
  playersChess: PlayerPieces;
  playerOrder: readonly string[];
  isAITurn: boolean;
  aiPlayers: { [color: string]: boolean };
}

const CurrentPlayerDisplay: React.FC<CurrentPlayerDisplayProps> = ({ currentPlayer, playersChess, playerOrder, isAITurn, aiPlayers }) => {
  const currentColor = playerOrder[currentPlayer];

  const getWinner = () => {
    for (const color of playerOrder) {
      const player = playersChess[color];
      const allAtGoal = player.every((chess: Piece) => chess.state === "goal");
      if (allAtGoal) {
        return color;
      }
    }
    return null;
  };

  const winner = getWinner();

  const isCurrentPlayerAI = aiPlayers && aiPlayers[currentColor];

  const playerDisplayName = isCurrentPlayerAI ? `🤖 ${currentColor} AI` : `👤 ${currentColor} Player`;

  return (
    <div className="panel-section current-player-section">
      {winner ? (
        <div className="victory-message">🏆 {winner} Player Wins!</div>
      ) : (
        <div className={`current-player-display ${currentColor} ${isAITurn ? "ai-turn" : ""}`}>
          <h2>Current Player</h2>
          <div className="player-name-large">{playerDisplayName}</div>
          <div className="player-turn-indicator">{isAITurn ? "🤖 AI Thinking..." : "Please roll dice and move your plane"}</div>
        </div>
      )}
    </div>
  );
};

export default CurrentPlayerDisplay;
