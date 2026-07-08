import {
  PATH_COORDS,
  START_INDEX,
  SAFE_INDICES,
  HOME_COLUMN_COORDS,
  CENTER_COORD,
  YARD_CORNER,
  YARD_SLOT_OFFSETS,
  PLAYER_ORDER,
} from "./boardData";

export const PAWNS_PER_PLAYER = 4;
export const TOTAL_STEPS_TO_FINISH = 58; // 51 common cells + 6 home column cells + 1 "arrived"
export const HOME_COLUMN_START = 52;
export const FINISHED = 58;

/** Creates a brand new game state for the given list of colors (2-4). */
export function createInitialState(colorList, names = {}) {
  const players = colorList.map((color) => ({
    color,
    name: names[color] || color[0].toUpperCase() + color.slice(1),
    pawns: Array.from({ length: PAWNS_PER_PLAYER }, () => ({ steps: 0 })),
    finished: false,
    rank: null,
  }));

  return {
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    diceRolled: false,
    consecutiveSixes: 0,
    validPawnIndices: [],
    winners: [], // colors in finishing order
    gameOver: false,
    turnCount: 0,
    log: ["Game started. " + players[0].name + " goes first."],
  };
}

export function rollDice() {
  return 1 + Math.floor(Math.random() * 6);
}

function absolutePathIndex(color, steps) {
  // steps is 1..51 here
  return (START_INDEX[color] + steps - 1) % 52;
}

/** Returns indices (0-3) of pawns belonging to the current player that can legally move. */
export function getValidMoves(state, diceValue) {
  const player = state.players[state.currentPlayerIndex];
  const valid = [];
  player.pawns.forEach((pawn, idx) => {
    if (pawn.steps === 0) {
      if (diceValue === 6) valid.push(idx);
      return;
    }
    if (pawn.steps === FINISHED) return;
    const newSteps = pawn.steps + diceValue;
    if (newSteps <= FINISHED) valid.push(idx);
  });
  return valid;
}

/** Returns true if the given absolute path cell is a safe zone. */
export function isSafeCell(absIndex) {
  return SAFE_INDICES.has(absIndex);
}

/**
 * Applies a move for the current player's pawn at pawnIndex, given the last dice roll.
 * Returns a NEW state object (immutable update). Handles capturing and win detection.
 */
export function applyMove(state, pawnIndex, diceValue) {
  const players = state.players.map((p) => ({
    ...p,
    pawns: p.pawns.map((pw) => ({ ...pw })),
  }));
  const player = players[state.currentPlayerIndex];
  const pawn = player.pawns[pawnIndex];
  const log = [...state.log];

  const newSteps = pawn.steps === 0 ? 1 : pawn.steps + diceValue;
  pawn.steps = newSteps;

  let captured = false;

  if (newSteps >= 1 && newSteps <= 51) {
    const absIndex = absolutePathIndex(player.color, newSteps);
    if (!isSafeCell(absIndex)) {
      players.forEach((opponent) => {
        if (opponent.color === player.color) return;
        opponent.pawns.forEach((oppPawn) => {
          if (oppPawn.steps === 0 || oppPawn.steps > 51) return; // in yard or in home stretch = untouchable
          const oppAbs = absolutePathIndex(opponent.color, oppPawn.steps);
          if (oppAbs === absIndex) {
            oppPawn.steps = 0;
            captured = true;
          }
        });
      });
    }
  }

  if (newSteps === FINISHED) {
    log.push(`${player.name}'s pawn reached home!`);
  } else if (captured) {
    log.push(`${player.name} captured an opponent's pawn!`);
  } else {
    log.push(`${player.name} moved a pawn ${diceValue === undefined ? "" : diceValue + " steps"}.`.trim());
  }

  // Check if this player just finished all pawns
  const allHome = player.pawns.every((pw) => pw.steps === FINISHED);
  let winners = state.winners;
  if (allHome && !player.finished) {
    player.finished = true;
    winners = [...state.winners, player.color];
    player.rank = winners.length;
    log.push(`${player.name} finished all pawns! Rank #${player.rank}.`);
  }

  const activePlayers = players.filter((p) => !p.finished);
  const gameOver = activePlayers.length <= 1;
  if (gameOver && activePlayers.length === 1 && !winners.includes(activePlayers[0].color)) {
    activePlayers[0].finished = true;
    activePlayers[0].rank = winners.length + 1;
    winners = [...winners, activePlayers[0].color];
  }

  return {
    ...state,
    players,
    winners,
    gameOver,
    captured,
    justFinishedPawn: newSteps === FINISHED,
    log: log.slice(-40),
  };
}

/** Computes whose turn is next, skipping players who have already finished. */
export function getNextPlayerIndex(state) {
  const n = state.players.length;
  let idx = state.currentPlayerIndex;
  for (let i = 0; i < n; i++) {
    idx = (idx + 1) % n;
    if (!state.players[idx].finished) return idx;
  }
  return state.currentPlayerIndex;
}

/** Pixel-space (grid units, not px) position for a pawn, used by the board renderer. */
export function getPawnGridPosition(color, pawn, pawnIndex) {
  if (pawn.steps === 0) {
    const [cornerRow, cornerCol] = YARD_CORNER[color];
    const [offRow, offCol] = YARD_SLOT_OFFSETS[pawnIndex];
    return [cornerRow + offRow, cornerCol + offCol];
  }
  if (pawn.steps >= 1 && pawn.steps <= 51) {
    return PATH_COORDS[absolutePathIndex(color, pawn.steps)];
  }
  if (pawn.steps >= HOME_COLUMN_START && pawn.steps <= 57) {
    return HOME_COLUMN_COORDS[color][pawn.steps - HOME_COLUMN_START];
  }
  // Finished: stack near the center, slightly offset per pawn so they don't fully overlap.
  const [r, c] = CENTER_COORD;
  const dx = [-0.18, 0.18, -0.18, 0.18][pawnIndex % 4];
  const dy = [-0.18, -0.18, 0.18, 0.18][pawnIndex % 4];
  return [r + dy, c + dx];
}

export function colorTurnOrder(colorList) {
  return PLAYER_ORDER.filter((c) => colorList.includes(c));
}
