import "./App.css";
import Board from "./Board";
import Dice from "./Dice";

const App = () => {
  return (
    <div className="App">
      <Dice></Dice>
      <Board></Board>
    </div>
  );
};

export default App;
