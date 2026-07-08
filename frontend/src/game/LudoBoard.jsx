import {
  GRID_SIZE,
  PATH_COORDS,
  HOME_COLUMN_COORDS,
  YARD_CORNER,
  SAFE_INDICES,
  START_INDEX,
  COLOR_HEX,
} from "./boardData";
import { getPawnGridPosition } from "./gameEngine";

const CELL = 40;
const BOARD_PX = GRID_SIZE * CELL;

function cellRect(row, col, fill, opts = {}) {
  return (
    <rect
      key={opts.key || `${row}-${col}`}
      x={col * CELL}
      y={row * CELL}
      width={CELL}
      height={CELL}
      fill={fill}
      stroke="var(--board-line)"
      strokeWidth="1"
    />
  );
}

function Yard({ color }) {
  const [row, col] = YARD_CORNER[color];
  const size = 6 * CELL;
  return (
    <g>
      <rect
        x={col * CELL}
        y={row * CELL}
        width={size}
        height={size}
        fill={COLOR_HEX[color]}
      />
      <rect
        x={col * CELL + CELL}
        y={row * CELL + CELL}
        width={4 * CELL}
        height={4 * CELL}
        rx={16}
        fill="var(--board-bg)"
      />
    </g>
  );
}

function HomeColumnCells({ color }) {
  return HOME_COLUMN_COORDS[color].map(([r, c], i) =>
    cellRect(r, c, COLOR_HEX[color], { key: `${color}-home-${i}` })
  );
}

function PathCells() {
  return PATH_COORDS.map(([r, c], i) => {
    let fill = "var(--board-bg)";
    const isStart = Object.values(START_INDEX).includes(i);
    if (isStart) {
      const startColor = Object.keys(START_INDEX).find((k) => START_INDEX[k] === i);
      fill = COLOR_HEX[startColor];
    }
    return (
      <g key={`path-${i}`}>
        {cellRect(r, c, fill)}
        {SAFE_INDICES.has(i) && !isStart && (
          <text
            x={c * CELL + CELL / 2}
            y={r * CELL + CELL / 2 + 5}
            textAnchor="middle"
            fontSize="18"
            fill="var(--star-color)"
          >
            ★
          </text>
        )}
      </g>
    );
  });
}

function CenterTriangle() {
  const cx = 6 * CELL;
  const cy = 6 * CELL;
  const s = 3 * CELL;
  const mid = cx + s / 2;
  const midY = cy + s / 2;
  return (
    <g>
      <polygon points={`${cx},${cy} ${mid},${midY} ${cx},${cy + s}`} fill={COLOR_HEX.red} />
      <polygon points={`${cx},${cy} ${mid},${midY} ${cx + s},${cy}`} fill={COLOR_HEX.green} />
      <polygon points={`${cx + s},${cy} ${mid},${midY} ${cx + s},${cy + s}`} fill={COLOR_HEX.yellow} />
      <polygon points={`${cx},${cy + s} ${mid},${midY} ${cx + s},${cy + s}`} fill={COLOR_HEX.blue} />
    </g>
  );
}

function Pawn({ color, row, col, isActive, isSelectable, onClick, label }) {
  const cx = col * CELL + CELL / 2;
  const cy = row * CELL + CELL / 2;
  return (
    <g
      transform={`translate(${cx}, ${cy})`}
      onClick={isSelectable ? onClick : undefined}
      style={{ cursor: isSelectable ? "pointer" : "default" }}
    >
      {isSelectable && (
        <circle r={CELL * 0.42} fill="none" stroke="var(--select-ring)" strokeWidth="3">
          <animate attributeName="r" values={`${CELL * 0.36};${CELL * 0.46};${CELL * 0.36}`} dur="1.1s" repeatCount="indefinite" />
        </circle>
      )}
      <circle r={CELL * 0.3} fill={COLOR_HEX[color]} stroke="#fff" strokeWidth="2.5" />
      <circle r={CELL * 0.12} fill="#fff" opacity="0.85" />
    </g>
  );
}

export default function LudoBoard({ players, currentColor, validPawnIndices, onSelectPawn }) {
  return (
    <svg
      viewBox={`0 0 ${BOARD_PX} ${BOARD_PX}`}
      className="ludo-board"
      role="img"
      aria-label="Ludo board"
    >
      <rect x="0" y="0" width={BOARD_PX} height={BOARD_PX} fill="var(--board-bg)" />
      <Yard color="red" />
      <Yard color="green" />
      <Yard color="yellow" />
      <Yard color="blue" />
      <PathCells />
      <HomeColumnCells color="red" />
      <HomeColumnCells color="green" />
      <HomeColumnCells color="yellow" />
      <HomeColumnCells color="blue" />
      <CenterTriangle />
      <rect
        x={0}
        y={0}
        width={BOARD_PX}
        height={BOARD_PX}
        fill="none"
        stroke="var(--board-frame)"
        strokeWidth="6"
      />

      {players.map((player) =>
        player.pawns.map((pawn, pawnIndex) => {
          const [row, col] = getPawnGridPosition(player.color, pawn, pawnIndex);
          const isSelectable =
            player.color === currentColor && validPawnIndices.includes(pawnIndex);
          return (
            <Pawn
              key={`${player.color}-${pawnIndex}`}
              color={player.color}
              row={row}
              col={col}
              isSelectable={isSelectable}
              onClick={() => onSelectPawn(pawnIndex)}
            />
          );
        })
      )}
    </svg>
  );
}
