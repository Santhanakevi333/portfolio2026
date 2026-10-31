import React, { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export const CustomCursor: React.FC = () => {
  const { isFinePointer, prefersReducedMotion, triggerBurst } = usePortfolio();
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [ringLabel, setRingLabel] = useState<string>('');
  const [isBig, setIsBig] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion) return;

    let rx = -100;
    let ry = -100;
    let px = -100;
    let py = -100;
    let animId: number;
    let lastTime = performance.now();

    document.body.classList.add('has-cur');

    const onPointerMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!visible) setVisible(true);
    };

    const onPointerOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a, button, .card-spotlight, .gzone, .cloud-sphere');
      if (target) {
        setIsBig(true);
        if (target.classList.contains('gzone') || target.classList.contains('cloud-sphere')) {
          setRingLabel('Drag');
        } else {
          setRingLabel('');
        }
      } else {
        setIsBig(false);
        setRingLabel('');
      }
    };

    const onPointerLeave = () => {
      setVisible(false);
      document.body.classList.remove('has-cur');
    };

    const onPointerEnter = () => {
      setVisible(true);
      document.body.classList.add('has-cur');
    };

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('a, button, input, textarea, code, .cloud-sphere, .gzone')) {
        return;
      }

      // Create DOM ripple
      const rip = document.createElement('span');
      rip.className = 'ripple';
      rip.style.left = `${e.clientX}px`;
      rip.style.top = `${e.clientY}px`;
      document.body.appendChild(rip);
      setTimeout(() => rip.remove(), 1000);

      // Trigger 3D scene gust shockwave
      triggerBurst(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseover', onPointerOver);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.documentElement.addEventListener('pointerenter', onPointerEnter);
    document.addEventListener('pointerdown', onPointerDown);

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const k = 1 - Math.exp(-dt * 14);
      rx += (px - rx) * k;
      ry += (py - ry) * k;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseover', onPointerOver);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.documentElement.removeEventListener('pointerenter', onPointerEnter);
      document.removeEventListener('pointerdown', onPointerDown);
      document.body.classList.remove('has-cur');
    };
  }, [isFinePointer, prefersReducedMotion, visible, triggerBurst]);

  if (!isFinePointer || prefersReducedMotion) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="cur pointer-events-none fixed top-0 left-0 z-50 rounded-full w-[6px] h-[6px] -mt-[3px] -ml-[3px] bg-accent transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className={`cur-ring pointer-events-none fixed top-0 left-0 z-50 rounded-full border border-accent/65 grid place-items-center font-mono text-[10px] tracking-widest uppercase text-accent transition-all duration-300 ${
          isBig ? 'big w-[68px] h-[68px] -mt-[34px] -ml-[34px] bg-accent/10' : 'w-[36px] h-[36px] -mt-[18px] -ml-[18px]'
        }`}
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      >
        {ringLabel}
      </div>
    </>
  );
};

