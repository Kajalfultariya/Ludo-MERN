import { COLOR_HEX, COLOR_LABEL } from "./boardData";
import { FINISHED } from "./gameEngine";

export default function PlayerPanel({ players, currentColor }) {
  return (
    <div className="player-panel">
      {players.map((player) => {
        const homeCount = player.pawns.filter((p) => p.steps === FINISHED).length;
        const isTurn = player.color === currentColor && !player.finished;
        return (
          <div
            key={player.color}
            className={`player-card ${isTurn ? "player-card--active" : ""} ${player.finished ? "player-card--done" : ""}`}
            style={{ "--player-color": COLOR_HEX[player.color] }}
          >
            <span className="player-card__dot" />
            <div className="player-card__info">
              <span className="player-card__name">{player.name || COLOR_LABEL[player.color]}</span>
              <span className="player-card__meta">
                {player.finished ? `Finished · Rank #${player.rank}` : `${homeCount}/4 home`}
              </span>
            </div>
            {isTurn && <span className="player-card__badge">Turn</span>}
          </div>
        );
      })}
    </div>
  );
}
