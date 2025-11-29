import { describe, it, expect, beforeEach } from "vitest";
import { gameEngine } from "../engine/gameEngine";

describe("Flying Chess AI Behavior and Strength Testing", () => {
  beforeEach(() => {
    gameEngine.setAIIterations(15000);
  });

  it("When rolling a 6, should prioritize launching new pieces over moving pieces on track", () => {
    const state = gameEngine.createInitialState();
    state.currentPlayer = 0;
    state.players.red[1] = { id: "red-1", state: "path", position: 20 };

    const rolled = gameEngine.rollDice(state, 6);
    const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);

    const flyCount = decisions.filter((id) => id === "red-0").length;
    console.log("Launch count:", flyCount, "/", 10, decisions);

    expect(flyCount).toBeGreaterThanOrEqual(7);
  });

  it("After entering home stretch, should prioritize moving the piece closest to finish line", () => {
    const state = gameEngine.createInitialState();
    state.currentPlayer = 0;
    state.players.red[0] = { id: "red-0", state: "goal-path", position: 70 };
    state.players.red[1] = { id: "red-1", state: "goal-path", position: 69 };

    const rolled = gameEngine.rollDice(state, 4);
    const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);

    const count = decisions.filter((id) => id === "red-1").length;
    console.log("Finish line moves:", count, "/", 10, decisions);
    expect(count).toBeGreaterThanOrEqual(7);
  });

  it("When a piece is about to be captured, should prioritize moving that piece", () => {
    const state = gameEngine.createInitialState();
    state.currentPlayer = 0;
    state.players.red[0] = { id: "red-0", state: "path", position: 64 };
    state.players.red[1] = { id: "red-1", state: "path", position: 25 };
    state.players.blue[0] = { id: "blue-0", state: "path", position: 22 };

    const rolled = gameEngine.rollDice(state, 3);
    const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);
    const count = decisions.filter((id) => id === "red-1").length;

    console.log("Defensive decisions:", count, "/", 10, decisions);
    expect(count).toBeGreaterThanOrEqual(7);
  });

  it("Stacked pieces test", () => {
    const state = gameEngine.createInitialState();
    state.currentPlayer = 0;
    state.players.red[0] = { id: "red-0", state: "path", position: 21 };
    state.players.red[1] = { id: "red-1", state: "path", position: 17 };
    state.players.red[2] = { id: "red-2", state: "home", position: 3 };
    state.players.red[3] = { id: "red-3", state: "home", position: 4 };

    const rolled = gameEngine.rollDice(state, 4);
    const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);
    const count = decisions.filter((id) => id === "red-1").length;

    console.log("Stack test:", count, "/", 10, decisions);
    expect(count).toBeGreaterThanOrEqual(7);
  });

  it("Should make reasonable trade-offs in complex multi-objective situations", () => {
    const state = gameEngine.createInitialState();
    state.currentPlayer = 0;
    state.players.red[0] = { id: "red-0", state: "path", position: 20 };
    state.players.red[1] = { id: "red-1", state: "path", position: 6 };
    state.players.red[2] = { id: "red-2", state: "goal-path", position: 69 };
    state.players.blue[0] = { id: "blue-0", state: "path", position: 24 };

    const rolled = gameEngine.rollDice(state, 4);
    const decisions = Array.from({ length: 10 }, () => gameEngine.getBestMove(rolled)?.chessId);
    const count = decisions.filter((id) => id === "red-2").length;

    console.log("Multi-objective decisions:", count, "/", 10, decisions);

    expect(count).toBeGreaterThan(5);
  });
});
