"use client";

const COINS = [
  { size: 200, top: "8%",  right: "4%",  animClass: "coin-float coin-spin-slow",   opacity: 0.9, delay: "0s"    },
  { size: 140, top: "55%", right: "18%", animClass: "coin-float-slow coin-spin-medium", opacity: 0.75, delay: "-2s" },
  { size: 100, top: "75%", right: "2%",  animClass: "coin-float-fast coin-spin-fast",  opacity: 0.55, delay: "-1s" },
  { size: 80,  top: "30%", left: "2%",   animClass: "coin-float coin-spin-medium",  opacity: 0.45, delay: "-4s"  },
  { size: 60,  top: "65%", left: "8%",   animClass: "coin-float-slow coin-spin-slow",  opacity: 0.35, delay: "-6s" },
];

function CoinSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))" }}
    >
      <defs>
        <radialGradient id={`grad-${size}`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#d4f5c4" />
          <stop offset="40%"  stopColor="#86efac" />
          <stop offset="70%"  stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </radialGradient>
        <radialGradient id={`shimmer-${size}`} cx="30%" cy="28%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shadow ellipse */}
      <ellipse cx="50" cy="88" rx="32" ry="6" fill="black" fillOpacity="0.08" />

      {/* Main coin body */}
      <circle cx="50" cy="50" r="44" fill={`url(#grad-${size})`} />

      {/* Rim highlight */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.4" />

      {/* Inner ring */}
      <circle cx="50" cy="50" r="36" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.25" />

      {/* Shimmer */}
      <circle cx="50" cy="50" r="44" fill={`url(#shimmer-${size})`} />

      {/* LC monogram */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="900"
        fontSize="28"
        fill="white"
        fillOpacity="0.95"
        letterSpacing="-1"
      >
        LC
      </text>
    </svg>
  );
}

export default function FloatingCoins() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {COINS.map((coin, i) => (
        <div
          key={i}
          className={coin.animClass}
          style={{
            position: "absolute",
            top: coin.top,
            right: "right" in coin ? coin.right : undefined,
            left: "left" in coin ? coin.left : undefined,
            animationDelay: coin.delay,
          }}
        >
          <CoinSVG size={coin.size} opacity={coin.opacity} />
        </div>
      ))}
    </div>
  );
}
