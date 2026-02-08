'use client';

import FloatingLines from '../FloatingLines';

interface FloatingLinesSurfaceProps {
  className?: string;
  opacity?: number;
}

export function FloatingLinesSurface({ className = '', opacity = 0.35 }: FloatingLinesSurfaceProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} style={{ opacity }}>
      <FloatingLines
        linesGradient={["#38bdf8", "#22c55e", "#f59e0b", "#0ea5e9"]}
        lineCount={[6, 10, 6]}
        lineDistance={[8, 6, 8]}
        animationSpeed={0.7}
        parallax
        parallaxStrength={0.15}
        interactive
        bendStrength={-0.35}
        bendRadius={4}
        mouseDamping={0.06}
        mixBlendMode="screen"
      />
    </div>
  );
}
