// All coordinates are [row, col] on a 15x15 grid (0-indexed).
// This is the classic Ludo board layout with 4-fold rotational symmetry.

export const GRID_SIZE = 15;

// The 52-cell shared track, starting at Red's entry square (index 0)
// and proceeding clockwise.
export const PATH_COORDS = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0],
];

// Each color's start index into PATH_COORDS (offset by 13, a quarter of 52).
export const START_INDEX = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe cells (stars + all start squares) - opponents can never be captured here.
export const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Home column (final stretch) cells per color, index 0..5, leading to the center.
export const HOME_COLUMN_COORDS = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

export const CENTER_COORD = [7, 7];

// Corner (top-left cell) of each color's 6x6 yard block, used to lay out
// the 4 pawn "nests" inside it.
export const YARD_CORNER = {
  red: [0, 0],
  green: [0, 9],
  yellow: [9, 9],
  blue: [9, 0],
};

// Offsets (within a yard block) for each of the 4 pawn nest slots.
export const YARD_SLOT_OFFSETS = [
  [1.3, 1.3],
  [1.3, 3.7],
  [3.7, 1.3],
  [3.7, 3.7],
];

export const PLAYER_ORDER = ["red", "green", "yellow", "blue"];

export const COLOR_HEX = {
  red: "#e63946",
  green: "#2a9d8f",
  yellow: "#f4a300",
  blue: "#3a5ba0",
};

export const COLOR_LABEL = {
  red: "Red",
  green: "Green",
  yellow: "Yellow",
  blue: "Blue",
};
