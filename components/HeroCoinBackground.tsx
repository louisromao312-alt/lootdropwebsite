/**
 * Riesiger drehender LootCoin im Hero-Hintergrund (pure CSS 3D).
 */
export default function HeroCoinBackground() {
  return (
    <div
      className="hero-coin-scene pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Zweiter, kleinerer Coin für Tiefe */}
      <div className="hero-coin hero-coin--small">
        <div className="hero-coin-spinner">
          <div className="hero-coin-face hero-coin-face--front">
            <span className="hero-coin-mark">LC</span>
          </div>
          <div className="hero-coin-face hero-coin-face--back">
            <span className="hero-coin-mark">LC</span>
          </div>
          <div className="hero-coin-rim" />
        </div>
      </div>

      {/* Haupt-Coin */}
      <div className="hero-coin hero-coin--main">
        <div className="hero-coin-spinner">
          <div className="hero-coin-face hero-coin-face--front">
            <span className="hero-coin-mark">LC</span>
            <span className="hero-coin-sub">LootDrop</span>
          </div>
          <div className="hero-coin-face hero-coin-face--back">
            <span className="hero-coin-mark">LC</span>
            <span className="hero-coin-sub">LootDrop</span>
          </div>
          <div className="hero-coin-rim" />
        </div>
      </div>

      {/* Orbit-Ring */}
      <div className="hero-coin-orbit" />
    </div>
  );
}
