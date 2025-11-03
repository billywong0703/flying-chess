import "./Board.css";
import Chess from "./Chess";
const Board = () => {
  return (
    <div className="container">
      <PlayerBoardSpace color="red" gridArea="1 / 4 / 4 / 1"></PlayerBoardSpace>
      <PlayerBoardSpace color="yellow" gridArea="16 / 13 / 13 / 16"></PlayerBoardSpace>
      <PlayerBoardSpace color="green" gridArea="1 / 13 / 4 / 16"></PlayerBoardSpace>
      <PlayerBoardSpace color="blue" gridArea="16 / 1 / 13 / 4"></PlayerBoardSpace>

      <Cell color="blue" x="3" y="4"></Cell>
      <Cell color="red" x="2" y="4"></Cell>
      <Cell color="green" x="1" y="4"></Cell>
      <Cell color="yellow" x="1" y="5"></Cell>
      <Cell color="blue" x="1" y="6"></Cell>
      <Cell color="red" x="1" y="7"></Cell>
      <Cell color="green" x="1" y="8"></Cell>
      <Cell color="yellow" x="1" y="9"></Cell>
      <Cell color="blue" x="1" y="10"></Cell>
      <Cell color="red" x="1" y="11"></Cell>
      <Cell color="green" x="1" y="12"></Cell>
      <Cell color="yellow" x="2" y="12"></Cell>
      <Cell color="blue" x="3" y="12"></Cell>

      <Cell color="yellow" x="4" y="3"></Cell>
      <Cell color="green" x="4" y="2"></Cell>
      <Cell color="red" x="4" y="1"></Cell>
      <Cell color="blue" x="5" y="1"></Cell>
      <Cell color="yellow" x="6" y="1"></Cell>
      <Cell color="green" x="7" y="1"></Cell>
      <Cell color="red" x="8" y="1"></Cell>
      <Cell color="blue" x="9" y="1"></Cell>
      <Cell color="yellow" x="10" y="1"></Cell>
      <Cell color="green" x="11" y="1"></Cell>
      <Cell color="red" x="12" y="1"></Cell>
      <Cell color="blue" x="12" y="2"></Cell>
      <Cell color="yellow" x="12" y="3"></Cell>

      <Cell color="green" x="13" y="4"></Cell>
      <Cell color="red" x="14" y="4"></Cell>
      <Cell color="blue" x="15" y="4"></Cell>
      <Cell color="yellow" x="15" y="5"></Cell>
      <Cell color="green" x="15" y="6"></Cell>
      <Cell color="red" x="15" y="7"></Cell>
      <Cell color="blue" x="15" y="8"></Cell>
      <Cell color="yellow" x="15" y="9"></Cell>
      <Cell color="green" x="15" y="10"></Cell>
      <Cell color="red" x="15" y="11"></Cell>
      <Cell color="blue" x="15" y="12"></Cell>
      <Cell color="yellow" x="14" y="12"></Cell>
      <Cell color="green" x="13" y="12"></Cell>

      <Cell color="red" x="4" y="13"></Cell>
      <Cell color="green" x="4" y="14"></Cell>
      <Cell color="yellow" x="4" y="15"></Cell>
      <Cell color="blue" x="5" y="15"></Cell>
      <Cell color="red" x="6" y="15"></Cell>
      <Cell color="green" x="7" y="15"></Cell>
      <Cell color="yellow" x="8" y="15"></Cell>
      <Cell color="blue" x="9" y="15"></Cell>
      <Cell color="red" x="10" y="15"></Cell>
      <Cell color="green" x="11" y="15"></Cell>
      <Cell color="yellow" x="12" y="15"></Cell>
      <Cell color="blue" x="12" y="14"></Cell>
      <Cell color="red" x="12" y="13"></Cell>

      <Cell color="blue" x="9" y="8"></Cell>
      <Cell color="blue" x="10" y="8"></Cell>
      <Cell color="blue" x="11" y="8"></Cell>
      <Cell color="blue" x="12" y="8"></Cell>
      <Cell color="blue" x="13" y="8"></Cell>
      <Cell color="blue" x="14" y="8"></Cell>

      <Cell color="yellow" x="8" y="9"></Cell>
      <Cell color="yellow" x="8" y="10"></Cell>
      <Cell color="yellow" x="8" y="11"></Cell>
      <Cell color="yellow" x="8" y="12"></Cell>
      <Cell color="yellow" x="8" y="13"></Cell>
      <Cell color="yellow" x="8" y="14"></Cell>

      <Cell color="green" x="2" y="8"></Cell>
      <Cell color="green" x="3" y="8"></Cell>
      <Cell color="green" x="4" y="8"></Cell>
      <Cell color="green" x="5" y="8"></Cell>
      <Cell color="green" x="6" y="8"></Cell>
      <Cell color="green" x="7" y="8"></Cell>

      <Cell color="red" x="8" y="2"></Cell>
      <Cell color="red" x="8" y="3"></Cell>
      <Cell color="red" x="8" y="4"></Cell>
      <Cell color="red" x="8" y="5"></Cell>
      <Cell color="red" x="8" y="6"></Cell>
      <Cell color="red" x="8" y="7"></Cell>
    </div>
  );
};

const Cell = ({ color = "", x, y }) => {
  return (
    <div className={`cell ` + color} style={{ gridRow: x, gridColumn: y }}>
      <div className="circle"></div>
    </div>
  );
};

const PlayerBoardSpace = ({ color = "", gridArea }) => {
  return (
    <div className={`player-space ` + color} style={{ gridArea: gridArea }}>
      <Cell x="1" y="1"></Cell>
      <Cell x="1" y="2"></Cell>
      <Cell x="2" y="1"></Cell>
      <Cell x="2" y="2"></Cell>
      <div style={{ gridRow: 1, gridColumn: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Chess color={color}></Chess>
      </div>
      <div style={{ gridRow: 1, gridColumn: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Chess color={color}></Chess>
      </div>
      <div style={{ gridRow: 2, gridColumn: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Chess color={color}></Chess>
      </div>
      <div style={{ gridRow: 2, gridColumn: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Chess color={color}></Chess>
      </div>
    </div>
  );
};

export default Board;
