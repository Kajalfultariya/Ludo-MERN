import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { COLOR_HEX, COLOR_LABEL } from "../game/boardData";

export default function History() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/game/history")
      .then((res) => setResults(res.data.results))
      .catch((err) => setError(err.response?.data?.message || "Could not load history"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Match history</h1>
        <Link to="/" className="link-btn">← Back</Link>
      </header>

      <div className="setup-card">
        {loading && <p>Loading…</p>}
        {error && <p className="auth-error">{error}</p>}
        {!loading && !error && results.length === 0 && <p>No games saved yet — go play one!</p>}

        <ul className="history-list">
          {results.map((r) => (
            <li key={r._id} className="history-item">
              <span
                className="history-item__dot"
                style={{ background: COLOR_HEX[r.winnerColor] }}
              />
              <div>
                <p className="history-item__title">
                  {COLOR_LABEL[r.winnerColor]} won · {r.players.length} players
                </p>
                <p className="history-item__meta">
                  {new Date(r.createdAt).toLocaleString()} · {r.totalTurns} turns
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
