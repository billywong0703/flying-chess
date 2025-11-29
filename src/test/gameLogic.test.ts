import { describe, it, expect } from "vitest";
import { gameEngine, fromFull } from "../engine/gameEngine";
import { gameRules } from "../engine/gameRules";

describe("Game Logic Tests", () => {
  it("Should correctly convert full state to lightweight state, including position, state, player, etc.", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 1;

    const ls = fromFull(fullState);

    expect(ls.player).toBe(1);
  });

  it("Rolling a 6 in home area should launch piece to starting point", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 0;
    fullState.consecutiveSixCount = 0;
    fullState._lastDiceResult = 6;
    fullState._movableChessIds = new Set(["red-0", "red-1", "red-2", "red-3"]);
    const ls = fromFull(fullState);
    gameRules.move(ls, 0);

    expect(ls.pos[0]).toBe(64);
    expect(ls.st[0]).toBe(1);
  });

  it("Three consecutive 6s should trigger penalty, return track pieces to home and switch to next player", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 0; // red
    fullState.consecutiveSixCount = 2;
    fullState.players.red[0] = { id: "red-0", state: "path", position: 65 };
    fullState.players.yellow[1] = { id: "yellow-1", state: "goal-path", position: 75 };
    fullState.players.green[2] = { id: "green-2", state: "goal", position: 85 };
    fullState.players.blue[3] = { id: "blue-3", state: "home", position: 7 };

    const ls = fromFull(fullState);
    gameRules.roll(ls, 6);

    expect(ls.pos[0]).toBe(0);
    expect(ls.pos[1]).toBe(1);
    expect(ls.pos[2]).toBe(2);
    expect(ls.pos[3]).toBe(3);
    expect(ls.st[0]).toBe(0);
    expect(ls.st[1]).toBe(0);
    expect(ls.st[2]).toBe(0);
    expect(ls.st[3]).toBe(0);
    expect(ls.six).toBe(0);
    expect(ls.player).toBe(1);
  });

  it("Three consecutive 6s should trigger penalty, return track pieces to home and switch to next player - version 2", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 0;
    fullState.consecutiveSixCount = 0;
    fullState.players.red[0] = { id: "red-0", state: "path", position: 65 };
    fullState.players.yellow[1] = { id: "yellow-1", state: "goal-path", position: 75 };
    fullState.players.green[2] = { id: "green-2", state: "goal", position: 85 };
    fullState.players.blue[3] = { id: "blue-3", state: "home", position: 7 };

    const ls = fromFull(fullState);
    gameRules.roll(ls, 6);
    gameRules.move(ls, 1);
    gameRules.roll(ls, 6);
    gameRules.move(ls, 2);
    gameRules.roll(ls, 6);
    gameRules.move(ls, 3);
    console.log(ls);

    expect(ls.pos[0]).toBe(0);
    expect(ls.pos[1]).toBe(1);
    expect(ls.pos[2]).toBe(2);
    expect(ls.pos[3]).toBe(3);
    expect(ls.st[0]).toBe(0);
    expect(ls.st[1]).toBe(0);
    expect(ls.st[2]).toBe(0);
    expect(ls.st[3]).toBe(0);
    expect(ls.six).toBe(0);
    expect(ls.player).toBe(1);
  });

  it("Should smoothly enter home stretch", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 2;
    fullState.consecutiveSixCount = 2;
    fullState.players.yellow[0] = { id: "yellow-0", state: "path", position: 34 };

    const ls = fromFull(fullState);
    gameRules.roll(ls, 3);
    gameRules.move(ls, 0);
    console.log(ls);

    expect(ls.pos[8]).toBe(76);
    expect(ls.st[8]).toBe(2);
  });

  it("Should smoothly enter home stretch - version 2", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 2;
    fullState.players.yellow[1] = { id: "yellow-2", state: "path", position: 31 };
    fullState.players.yellow[2] = { id: "yellow-3", state: "path", position: 31 };

    const ls = fromFull(fullState);
    gameRules.roll(ls, 4);
    console.log(ls);
    gameRules.move(ls, 2);
    console.log(ls);

    expect(ls.pos[10]).toBe(74);
    expect(ls.st[10]).toBe(2);
  });

  it("Moving in home stretch should reach finish line exactly", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 3;
    fullState.consecutiveSixCount = 2;
    fullState.players.blue[1] = { id: "blue-1", state: "goal-path", position: 87 };

    const ls = fromFull(fullState);

    gameRules.roll(ls, 4);
    gameRules.move(ls, 1);
    expect(ls.pos[13]).toBe(255);
    expect(ls.st[13]).toBe(3);
  });

  it("Moving too far in home stretch should trigger backward movement", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 3;
    fullState.consecutiveSixCount = 2;
    fullState.players.blue[1] = { id: "blue-1", state: "goal-path", position: 88 };

    const ls = fromFull(fullState);

    gameRules.roll(ls, 5);
    gameRules.move(ls, 1);
    expect(ls.pos[13]).toBe(89);
    expect(ls.st[13]).toBe(2);
  });

  it("Moving should knock opponent pieces back to base", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 0;
    fullState.consecutiveSixCount = 0;
    fullState.players.red[0] = { id: "red-0", state: "path", position: 19 };
    fullState.players.yellow[1] = { id: "yellow-1", state: "goal-path", position: 23 };

    const ls = fromFull(fullState);

    gameRules.roll(ls, 4);
    gameRules.move(ls, 0);

    expect(ls.pos[0]).toBe(23);
    expect(ls.st[0]).toBe(1);

    expect(ls.pos[12]).toBe(12);
    expect(ls.st[5]).toBe(0);
  });

  it("Should set winner when all four pieces reach finish line", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 0;
    fullState.consecutiveSixCount = 0;
    fullState.players.red[0] = { id: "red-0", state: "goal", position: 73 };
    fullState.players.red[1] = { id: "red-0", state: "goal", position: 73 };
    fullState.players.red[2] = { id: "red-0", state: "goal", position: 73 };
    fullState.players.red[3] = { id: "red-0", state: "goal-path", position: 72 };

    const ls = fromFull(fullState);
    expect(ls.winner).toBe(-1); // Should maintain previous value, but actually checked after move

    gameRules.roll(ls, 1);
    gameRules.move(ls, 3);

    expect(ls.pos[3]).toBe(255);
    expect(ls.st[3]).toBe(3);
    expect(ls.winner).toBe(0);
  });

  it("Stacked pieces movement", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 0;
    fullState.consecutiveSixCount = 0;
    fullState.players.red[0] = { id: "red-0", state: "path", position: 20 };
    fullState.players.red[1] = { id: "red-1", state: "path", position: 20 };
    fullState.players.red[2] = { id: "red-2", state: "path", position: 20 };
    fullState.players.red[3] = { id: "red-3", state: "home", position: 3 };

    const ls = fromFull(fullState);
    gameRules.roll(ls, 3);
    gameRules.move(ls, 0);

    expect(ls.pos[0]).toBe(23);
    expect(ls.st[0]).toBe(1);
    expect(ls.pos[1]).toBe(23);
    expect(ls.st[1]).toBe(1);
    expect(ls.pos[2]).toBe(23);
    expect(ls.st[2]).toBe(1);
  });

  it("Should jump at the end of cycle track", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 0;
    fullState.consecutiveSixCount = 0;
    fullState.players.red[0] = { id: "red-0", state: "path", position: 62 };

    const ls = fromFull(fullState);
    gameRules.roll(ls, 2);
    gameRules.move(ls, 0);

    expect(ls.pos[0]).toBe(16);
    expect(ls.st[0]).toBe(1);
  });

  it("Should jump", () => {
    const fullState = gameEngine.createInitialState();
    fullState.currentPlayer = 2;
    fullState.consecutiveSixCount = 0;
    fullState.players.yellow[0] = { id: "yellow-0", state: "path", position: 38 };

    const ls = fromFull(fullState);
    gameRules.roll(ls, 4);
    gameRules.move(ls, 0);

    expect(ls.pos[8]).toBe(46);
    expect(ls.st[8]).toBe(1);
  });
});
