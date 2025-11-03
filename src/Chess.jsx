import "./Chess.css";

const Chess = ({ color = "red", size = "medium", selected = false, onClick }) => {
  const colors = {
    red: { main: "#ef4444", light: "#fca5a5", dark: "#b91c1c" },
    yellow: { main: "#f59e0b", light: "#fcd34d", dark: "#d97706" },
    blue: { main: "#3b82f6", light: "#93c5fd", dark: "#1d4ed8" },
    green: { main: "#10b981", light: "#6ee7b7", dark: "#059669" },
  };

  const c = colors[color] || colors.red;

  return (
    <div
      className={`
        chess-piece ${size} 
        ${selected ? "selected" : ""} 
      `}
      style={{
        "--color-main": c.main,
        "--color-light": c.light,
        "--color-dark": c.dark,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      {/* 內部高光 */}
      <div className="shine"></div>
    </div>
  );
};

export default Chess;
