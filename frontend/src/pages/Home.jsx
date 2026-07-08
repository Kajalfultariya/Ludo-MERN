import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COLOR_HEX, COLOR_LABEL, PLAYER_ORDER } from "../game/boardData";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["red", "yellow"]);
  const [names, setNames] = useState({});
  const [error, setError] = useState("");

  function toggleColor(color) {
    setError("");
    setSelected((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  }

  function startGame() {
    if (selected.length < 2) {
      setError("Pick at least 2 players.");
      return;
    }
    const orderedColors = PLAYER_ORDER.filter((c) => selected.includes(c));
    navigate("/game", { state: { colors: orderedColors, names } });
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>🎲 Ludo</h1>
        {user ? (
          <div className="home-user">
            <span>Hi, {user.username}</span>
            <Link to="/history">History</Link>
            <button className="link-btn" onClick={logout}>Log out</button>
          </div>
        ) : (
          <div className="home-user">
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </header>

      <div className="setup-card">
        <h2>Pass-and-play setup</h2>
        <p className="setup-sub">Choose 2–4 players. Everyone shares this device and takes turns.</p>

        <div className="color-grid">
          {PLAYER_ORDER.map((color) => {
            const isOn = selected.includes(color);
            return (
              <button
                key={color}
                type="button"
                className={`color-toggle ${isOn ? "color-toggle--on" : ""}`}
                style={{ "--c": COLOR_HEX[color] }}
                onClick={() => toggleColor(color)}
              >
                <span className="color-toggle__dot" />
                {COLOR_LABEL[color]}
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div className="name-inputs">
            {PLAYER_ORDER.filter((c) => selected.includes(c)).map((color) => (
              <label key={color} style={{ "--c": COLOR_HEX[color] }}>
                <span className="name-inputs__swatch" />
                <input
                  placeholder={COLOR_LABEL[color]}
                  value={names[color] || ""}
                  onChange={(e) => setNames((prev) => ({ ...prev, [color]: e.target.value }))}
                  maxLength={16}
                />
              </label>
            ))}
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button className="primary-btn" onClick={startGame}>
          Start game
        </button>
      </div>
    </div>
  );
}
