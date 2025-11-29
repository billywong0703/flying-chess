import { useState } from "react";
import "./Dice.css";

interface DiceProps {
  onRoll: (value: number) => void;
  disabled?: boolean;
}

const Dice: React.FC<DiceProps> = ({ onRoll, disabled = false }) => {
  const [value, setValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const roll = () => {
    if (isRolling || disabled) return;

    setIsRolling(true);
    setValue(-1);

    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setValue(finalValue);
      setIsRolling(false);
      onRoll(finalValue);
    }, 1000);
  };

  const showDot = (positions: number[]) => positions.includes(value);

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
    </div>
  );
};

export default Dice;
