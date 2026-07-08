import { useCallback, useReducer, useRef } from "react";
import {
  createInitialState,
  rollDice as rollDiceValue,
  getValidMoves,
  applyMove,
  getNextPlayerIndex,
} from "./gameEngine";

const MAX_CONSECUTIVE_SIXES = 3;

function reducer(state, action) {
  switch (action.type) {
    case "RESET":
      return createInitialState(action.colors, action.names);

    case "ROLL": {
      if (state.gameOver || state.diceRolled) return state;
      const diceValue = action.forcedValue ?? rollDiceValue();
      const consecutiveSixes = diceValue === 6 ? state.consecutiveSixes + 1 : 0;

      if (consecutiveSixes >= MAX_CONSECUTIVE_SIXES) {
        const nextIndex = getNextPlayerIndex(state);
        return {
          ...state,
          diceValue: null,
          diceRolled: false,
          validPawnIndices: [],
          consecutiveSixes: 0,
          log: [...state.log, `${state.players[state.currentPlayerIndex].name} rolled three 6s in a row — turn forfeited.`].slice(-40),
          currentPlayerIndex: nextIndex,
          turnCount: state.turnCount + 1,
        };
      }

      const validPawnIndices = getValidMoves(state, diceValue);

      if (validPawnIndices.length === 0) {
        // No legal move: pass turn (unless it was a 6, which still passes here
        // since bringing a pawn out is the only 6-only action and none exist).
        const nextIndex = getNextPlayerIndex(state);
        return {
          ...state,
          diceValue,
          diceRolled: false,
          validPawnIndices: [],
          consecutiveSixes: diceValue === 6 ? consecutiveSixes : 0,
          currentPlayerIndex: diceValue === 6 ? state.currentPlayerIndex : nextIndex,
          turnCount: state.turnCount + 1,
          log: [...state.log, `${state.players[state.currentPlayerIndex].name} rolled ${diceValue} — no valid move.`].slice(-40),
        };
      }

      return {
        ...state,
        diceValue,
        diceRolled: true,
        validPawnIndices,
        consecutiveSixes,
      };
    }

    case "MOVE": {
      if (!state.diceRolled || state.gameOver) return state;
      if (!state.validPawnIndices.includes(action.pawnIndex)) return state;

      const moved = applyMove(state, action.pawnIndex, state.diceValue);
      const extraTurn = state.diceValue === 6 && !moved.gameOver;

      const nextIndex = extraTurn ? moved.currentPlayerIndex : getNextPlayerIndex(moved);

      return {
        ...moved,
        diceValue: null,
        diceRolled: false,
        validPawnIndices: [],
        currentPlayerIndex: moved.gameOver ? moved.currentPlayerIndex : nextIndex,
        turnCount: moved.turnCount + 1,
      };
    }

    default:
      return state;
  }
}

export function useLudoGame(colors, names) {
  const initRef = useRef({ colors, names });
  const [state, dispatch] = useReducer(reducer, null, () =>
    createInitialState(initRef.current.colors, initRef.current.names)
  );

  const roll = useCallback((forcedValue) => dispatch({ type: "ROLL", forcedValue }), []);
  const move = useCallback((pawnIndex) => dispatch({ type: "MOVE", pawnIndex }), []);
  const reset = useCallback(
    (newColors, newNames) => dispatch({ type: "RESET", colors: newColors, names: newNames }),
    []
  );

  return { state, roll, move, reset };
}
