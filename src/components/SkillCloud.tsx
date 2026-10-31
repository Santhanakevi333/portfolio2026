import React, { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

const WORDS = [
  'React',
  'TypeScript',
  'JavaScript',
  'MapLibre',
  'WebGL',
  'GLSL',
  'Tailwind',
  'Zustand',
  'Recharts',
  'Node.js',
  'Express',
  'MongoDB',
  'Supabase',
  'REST',
  'OpenAPI',
  'Vite',
  'Vitest',
  'Git',
  'GitHub',
  'GeoJSON',
  'Workers',
  'Gemini',
];

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const SkillCloud: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { prefersReducedMotion } = usePortfolio();

  const [tagStyles, setTagStyles] = useState<
    { transform: string; opacity: number; zIndex: number; color: string }[]
  >([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Fibonacci sphere distribution
    const pts: Point3D[] = WORDS.map((_, i) => {
      const k = (i + 0.5) / WORDS.length;
      const phi = Math.acos(1 - 2 * k);
      const th = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        x: Math.sin(phi) * Math.cos(th),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(th),
      };
    });

    let rx = 0.3;
    let ry = 0;
    let vx = 0;
    let vy = 0.25;
    let drag = false;
    let lx = 0;
    let ly = 0;
    let animId: number;
    let lastTime = performance.now();

    const draw = () => {
      if (!containerRef.current) return;
      const R = containerRef.current.clientWidth * 0.4;
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);

      const styles = pts.map((p) => {
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;

        const depth = (z2 + 1) / 2;
        const sc = 0.62 + 0.5 * depth;

        return {
          transform: `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) scale(${sc.toFixed(3)})`,
          opacity: Number((0.22 + 0.78 * depth).toFixed(3)),
          zIndex: Math.round(depth * 100),
          color: depth > 0.72 ? 'var(--accent)' : 'var(--fg)',
        };
      });

      setTagStyles(styles);
    };

    draw();

    if (prefersReducedMotion) return;

    const onPointerDown = (e: PointerEvent) => {
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      try {
        container.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;

      ry += dx * 0.012;
      rx += dy * 0.012;
      vy = Math.max(-6, Math.min(6, (dx * 0.012) / 0.016));
      vx = Math.max(-6, Math.min(6, (dy * 0.012) / 0.016));
      draw();
    };

    const onPointerUp = () => {
      drag = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const rect = container.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        if (!drag) {
          ry += vy * dt;
          rx += vx * dt;
          vx *= Math.exp(-dt * 1.6);
          vy += (0.25 - vy) * Math.min(1, dt * 0.8);
        }
        draw();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className="cloud" id="cloud" aria-hidden="true">
      {WORDS.map((word, i) => (
        <span
          key={word}
          style={tagStyles[i] || { transform: 'translate(-50%, -50%)', opacity: 0 }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};
