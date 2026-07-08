import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LudoBoard from "../game/LudoBoard";
import Dice from "../game/Dice";
import PlayerPanel from "../game/PlayerPanel";
import { useLudoGame } from "../game/useLudoGame";
import { COLOR_HEX, COLOR_LABEL } from "../game/boardData";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const setup = location.state;

  useEffect(() => {
    if (!setup?.colors?.length) navigate("/", { replace: true });
  }, [setup, navigate]);

  const colors = setup?.colors || ["red", "yellow"];
  const names = setup?.names || {};

  const { state, roll, move, reset } = useLudoGame(colors, names);
  const [rolling, setRolling] = useState(false);
  const startTimeRef = useRef(Date.now());
  const [saved, setSaved] = useState(false);

  const currentPlayer = state.players[state.currentPlayerIndex];

  function handleRoll() {
    if (state.diceRolled || rolling || state.gameOver) return;
    setRolling(true);
    setTimeout(() => {
      roll();
      setRolling(false);
    }, 550);
  }

  function handleSelectPawn(pawnIndex) {
    if (!state.diceRolled) return;
    if (!state.validPawnIndices.includes(pawnIndex)) return;
    move(pawnIndex);
  }

  function handlePlayAgain() {
    startTimeRef.current = Date.now();
    setSaved(false);
    reset(colors, names);
  }

  useEffect(() => {
    if (!state.gameOver || saved) return;
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const players = state.players.map((p) => ({
      name: p.name,
      color: p.color,
      rank: p.rank,
    }));
    const winnerColor = state.winners[0];
    api
      .post("/game/result", { players, winnerColor, totalTurns: state.turnCount, durationSeconds })
      .catch(() => {
        /* saving history is best-effort; ignore failures (e.g. backend not running) */
      });
    setSaved(true);
  }, [state.gameOver, saved, state.players, state.winners, state.turnCount]);

  const winnerName = useMemo(() => {
    if (!state.gameOver || !state.winners.length) return null;
    const winnerColor = state.winners[0];
    const p = state.players.find((pl) => pl.color === winnerColor);
    return p?.name || COLOR_LABEL[winnerColor];
  }, [state.gameOver, state.winners, state.players]);

  return (
    <div className="game-page">
      <header className="game-header">
        <Link to="/" className="link-btn">← Exit</Link>
        <h1>🎲 Ludo</h1>
        <span className="turn-count">Turn {state.turnCount}</span>
      </header>

      <div className="game-layout">
        <div className="board-wrap">
          <LudoBoard
            players={state.players}
            currentColor={currentPlayer.color}
            validPawnIndices={state.validPawnIndices}
            onSelectPawn={handleSelectPawn}
          />
        </div>

        <aside className="game-sidebar">
          <PlayerPanel players={state.players} currentColor={currentPlayer.color} />

          <div className="turn-box" style={{ "--c": COLOR_HEX[currentPlayer.color] }}>
            <p className="turn-box__label">
              {state.gameOver ? "Game over" : `${currentPlayer.name}'s turn`}
            </p>
            <Dice
              value={state.diceValue}
              rolling={rolling}
              disabled={state.diceRolled || rolling || state.gameOver}
              onRoll={handleRoll}
              colorHex={COLOR_HEX[currentPlayer.color]}
            />
            {state.diceRolled && state.validPawnIndices.length === 0 && (
              <p className="hint">No legal move — turn will pass.</p>
            )}
            {state.diceRolled && state.validPawnIndices.length > 0 && (
              <p className="hint">Tap a glowing pawn to move it.</p>
            )}
          </div>

          <div className="game-log">
            {state.log.slice(-6).reverse().map((entry, i) => (
              <p key={i}>{entry}</p>
            ))}
          </div>
        </aside>
      </div>

      {state.gameOver && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>🏆 {winnerName} wins!</h2>
            <ol className="rank-list">
              {[...state.players]
                .sort((a, b) => (a.rank || 99) - (b.rank || 99))
                .map((p) => (
                  <li key={p.color} style={{ "--c": COLOR_HEX[p.color] }}>
                    <span className="rank-list__dot" /> {p.name} — Rank #{p.rank || "-"}
                  </li>
                ))}
            </ol>
            {!user && <p className="hint">Log in next time to save your match history.</p>}
            <div className="modal-actions">
              <button className="primary-btn" onClick={handlePlayAgain}>Play again</button>
              <Link className="link-btn" to="/">Change players</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
