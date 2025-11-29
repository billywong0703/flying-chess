import "./ActionLog.css";

export interface Log {
  id: number;
  message: string;
  type: string;
  timestamp: string;
}

const ActionLog = ({ playerLog }: { playerLog: Log[] }) => {
  return (
    <div className="panel-section">
      <h3>📝 Action Log</h3>
      <div className="action-log">
        {playerLog.length === 0 ? (
          <div className="log-entry info">
            <span className="log-message">game start</span>
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
