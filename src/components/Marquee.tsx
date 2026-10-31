import React, { useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

const ROW_1 = [
  'React',
  'TypeScript',
  'MapLibre GL',
  'WebGL 2',
  'GLSL',
  'Zustand',
  'Tailwind CSS',
  'Recharts',
  'Web Workers',
  'REST APIs',
];

const ROW_2 = [
  'Node.js',
  'Supabase',
  'Gemini API',
  'OpenAPI',
  'Vite',
  'Vitest',
  'GeoJSON',
  'MongoDB',
  'Express.js',
  'Git',
];

export const Marquee: React.FC = () => {
  const { prefersReducedMotion, scrollVelocity } = usePortfolio();
  const track1Ref = useRef<HTMLDivElement | null>(null);
  const track2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let x1 = 0;
    let x2 = 0;
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const speed = 70 + Math.abs(scrollVelocity) * 0.25;
      x1 += dt * speed;
      x2 += dt * speed;

      if (track1Ref.current) {
        const period1 = track1Ref.current.scrollWidth / 2;
        const normX1 = ((x1 % period1) + period1) % period1;
        track1Ref.current.style.transform = `translate3d(-${normX1.toFixed(1)}px, 0, 0)`;
      }

      if (track2Ref.current) {
        const period2 = track2Ref.current.scrollWidth / 2;
        const normX2 = ((x2 % period2) + period2) % period2;
        track2Ref.current.style.transform = `translate3d(${normX2.toFixed(1)}px, 0, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [prefersReducedMotion, scrollVelocity]);

  const renderItems = (items: string[]) => (
    <>
      {items.map((word, i) => (
        <React.Fragment key={i}>
          <span className="whitespace-nowrap">{word}</span>
          <i
            className="inline-block w-[0.3em] h-[0.3em] border-2 border-warm rotate-45 animate-spin-diamond"
            aria-hidden="true"
          />
        </React.Fragment>
      ))}
    </>
  );

  return (
    <div
      className="relative z-10 my-8 md:my-14 overflow-hidden -mx-[calc(50vw-50%)] w-screen border-y border-line bg-bg/55 -rotate-[1.6deg] py-4 select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Row 1: Solid */}
      <div className="overflow-hidden whitespace-nowrap mb-2">
        <div
          ref={track1Ref}
          className="mtrack inline-flex items-center gap-7 font-display font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight text-fg will-change-transform"
        >
          {renderItems(ROW_1)}
          {renderItems(ROW_1)}
        </div>
      </div>

      {/* Row 2: Outline */}
      <div className="mrow-outline overflow-hidden whitespace-nowrap">
        <div
          ref={track2Ref}
          className="mtrack inline-flex items-center gap-7 font-display font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight will-change-transform"
        >
          {renderItems(ROW_2)}
          {renderItems(ROW_2)}
        </div>
      </div>
    </div>
  );
};

