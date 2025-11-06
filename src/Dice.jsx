import { useState } from "react";
import "./Dice.css";

// Dice.jsx
const Dice = ({ onRoll, disabled = false }) => {
  const [value, setValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const roll = () => {
    if (isRolling || disabled) return;

    setIsRolling(true);
    setValue(null);

    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setValue(finalValue);
      setIsRolling(false);
      onRoll(finalValue); // 關鍵：通知父組件
    }, 1000);
  };

  const showDot = (positions) => positions.includes(value);

  return (
    <div className="dice-container">
      <div className={`dice ${isRolling ? "rolling" : ""}`} onClick={roll}>
        <div className={`dot ${showDot([4, 5, 6]) ? "" : "hidden"} top-left`}></div>
        <div className={`dot ${showDot([2, 3, 4, 5, 6]) ? "" : "hidden"} top-right`}></div>
        <div className={`dot ${showDot([2, 3, 4, 5, 6]) ? "" : "hidden"} bottom-left`}></div>
        <div className={`dot ${showDot([4, 5, 6]) ? "" : "hidden"} bottom-right`}></div>
        <div className={`dot ${showDot([1, 3, 5]) ? "" : "hidden"} center`}></div>
        <div className={`dot ${showDot([6]) ? "" : "hidden"} center-left`}></div>
        <div className={`dot ${showDot([6]) ? "" : "hidden"} center-right`}></div>
      </div>

      <button onClick={roll} disabled={isRolling} className="roll-button">
        {isRolling ? "Rolling..." : "Roll Dice"}
      </button>

      <p className="result">
        You rolled: <strong>{value}</strong>
      </p>
    </div>
  );
};

export default Dice;
