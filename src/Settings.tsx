import React, { useState, useEffect } from "react";
import "./Settings.css";

interface PlayerSettings {
  red: boolean;
  green: boolean;
  yellow: boolean;
  blue: boolean;
}

type PlayerColor = keyof PlayerSettings;

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  aiPlayers: PlayerSettings;
  onAIPlayersChange: (newAIPlayers: PlayerSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, aiPlayers, onAIPlayersChange }) => {
  const [localSettings, setLocalSettings] = useState<PlayerSettings>(aiPlayers);

  useEffect(() => {
    setLocalSettings(aiPlayers);
  }, [aiPlayers]);

  const handlePlayerTypeChange = (player: PlayerColor, isAI: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      [player]: isAI,
    }));
  };

  const hasChanges = localSettings.red !== aiPlayers.red || localSettings.yellow !== aiPlayers.yellow || localSettings.green !== aiPlayers.green || localSettings.blue !== aiPlayers.blue;

  const handleSave = () => {
    if (hasChanges) {
      onAIPlayersChange(localSettings);
    }
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(aiPlayers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <h2>🎮 Game Settings</h2>

        <div className="settings-section">
          <h3>Player Type Settings</h3>
          <p className="settings-description">Choose whether each player is human or computer AI</p>
          <p className="settings-note">Game will restart automatically when settings are changed.</p>

          <div className="player-settings-grid">
            <PlayerSettingCard color="red" name="Red Player" isAI={localSettings.red} onChange={handlePlayerTypeChange} />
            <PlayerSettingCard color="yellow" name="Yellow Player" isAI={localSettings.yellow} onChange={handlePlayerTypeChange} />
            <PlayerSettingCard color="green" name="Green Player" isAI={localSettings.green} onChange={handlePlayerTypeChange} />
            <PlayerSettingCard color="blue" name="Blue Player" isAI={localSettings.blue} onChange={handlePlayerTypeChange} />
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className={`btn-save ${hasChanges ? "btn-save-changed" : ""}`} onClick={handleSave}>
            {hasChanges ? "Save & Restart" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface PlayerSettingCardProps {
  color: PlayerColor;
  name: string;
  isAI: boolean;
  onChange: (player: PlayerColor, isAI: boolean) => void;
}

const PlayerSettingCard: React.FC<PlayerSettingCardProps> = ({ color, name, isAI, onChange }) => {
  return (
    <div className={`player-card player-card-${color}`}>
      <div className="player-info">
        <div className={`player-color-indicator ${color}`}></div>
        <span className="player-name">{name}</span>
      </div>

      <div className="player-type-selector">
        <button className={`player-type-btn ${!isAI ? "active" : ""}`} onClick={() => onChange(color, false)}>
          👤 Player
        </button>
        <button className={`player-type-btn ${isAI ? "active" : ""}`} onClick={() => onChange(color, true)}>
          🤖 Computer
        </button>
      </div>
    </div>
  );
};

export default Settings;
export type { PlayerSettings, PlayerColor };
