import React from "react";
import "./ActionLog.css";

const ActionLog = ({ playerLog }) => {
  return (
    <div className="panel-section">
      <h3>📝 行動記錄</h3>
      <div className="action-log">
        {playerLog.length === 0 ? (
          <div className="log-entry info">
            <span className="log-message">遊戲開始！請擲骰子</span>
          </div>
        ) : (
          playerLog.map((log) => (
            <div key={log.id} className={`log-entry ${log.type}`}>
              <span className="log-time">{log.timestamp}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionLog;
