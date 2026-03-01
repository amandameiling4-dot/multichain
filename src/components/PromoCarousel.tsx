"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    title: "Trade Binary Options",
    subtitle: "Predict market direction and earn up to 85% payout",
    color: "from-blue-900/60 to-blue-800/30",
    icon: "📈",
  },
  {
    title: "AI-Powered Arbitrage",
    subtitle: "Let our AI find the best opportunities across exchanges",
    color: "from-purple-900/60 to-purple-800/30",
    icon: "🤖",
  },
  {
    title: "Stake & Earn",
    subtitle: "Earn passive income with competitive APY rates",
    color: "from-green-900/60 to-green-800/30",
    icon: "💰",
  },
];

export default function PromoCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current]!;

  return (
    <div className={`bg-gradient-to-r ${slide.color} border border-gray-800 rounded-xl p-8 relative overflow-hidden transition-all duration-500`}>
      <div className="relative z-10">
        <div className="text-4xl mb-3">{slide.icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{slide.title}</h2>
        <p className="text-gray-300 text-sm">{slide.subtitle}</p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current ? "bg-white" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
