'use client';

import ColorBends from '../ColorBends.jsx';

interface ColorBendsSurfaceProps {
  className?: string;
  opacity?: number;
}

export function ColorBendsSurface({ className = '', opacity = 0.5 }: ColorBendsSurfaceProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} style={{ opacity }}>
      <ColorBends
        speed={0.12}
        rotation={38}
        autoRotate={0.06}
        scale={1.2}
        frequency={1.3}
        warpStrength={0.9}
        mouseInfluence={0.4}
        parallax={0.6}
        noise={0.06}
        colors={["#0ea5e9", "#22c55e", "#f59e0b", "#38bdf8", "#10b981"]}
      />
    </div>
  );
}
