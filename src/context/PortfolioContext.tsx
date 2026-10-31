import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SceneMode, Burst } from '../types';

interface PortfolioContextType {
  mode: SceneMode;
  hoverMode: SceneMode | null;
  effectiveMode: SceneMode;
  setMode: (mode: SceneMode) => void;
  setHoverMode: (mode: SceneMode | null) => void;
  bursts: Burst[];
  triggerBurst: (cx: number, cy: number) => void;
  activeSection: string;
  scrollFraction: number;
  scrollProgress: number;
  isFinePointer: boolean;
  prefersReducedMotion: boolean;
  pointerPos: { x: number; y: number; nx: number; ny: number };
  scrollVelocity: number;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SceneMode>('wind');
  const [hoverMode, setHoverModeState] = useState<SceneMode | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [scrollFraction, setScrollFraction] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isFinePointer, setIsFinePointer] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [scrollVelocity, setScrollVelocity] = useState<number>(0);
  const [pointerPos, setPointerPos] = useState({ x: -1, y: -1, nx: 0, ny: 0 });

  const burstsRef = useRef<Burst[]>([]);

  const setMode = useCallback((m: SceneMode) => {
    setModeState(m);
  }, []);

  const setHoverMode = useCallback((m: SceneMode | null) => {
    setHoverModeState(m);
  }, []);

  const triggerBurst = useCallback((cx: number, cy: number) => {
    const burst: Burst = { cx, cy, t: 0, wx: 0, wy: 0, init: false };
    burstsRef.current.push(burst);
  }, []);

  useEffect(() => {
    const fineQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsFinePointer(fineQuery.matches);
    setPrefersReducedMotion(motionQuery.matches);

    const onFineChange = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    fineQuery.addEventListener('change', onFineChange);
    motionQuery.addEventListener('change', onMotionChange);

    return () => {
      fineQuery.removeEventListener('change', onFineChange);
      motionQuery.removeEventListener('change', onMotionChange);
    };
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let currentVel = 0;

    const onPointerMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      setPointerPos({ x: e.clientX, y: e.clientY, nx, ny });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // In original index.html, secEls are [hero, work, experience, skills, contact]
    const sectionIds = ['hero', 'work', 'experience', 'skills', 'resume', 'contact'];

    const updateScroll = () => {
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const maxScroll = Math.max(1, docH - winH);
      const prog = Math.min(1, Math.max(0, y / maxScroll));
      setScrollProgress(prog);

      currentVel += ((y - lastY) / dt - currentVel) * Math.min(1, dt * 8);
      lastY = y;
      setScrollVelocity(currentVel);

      // Section fraction calculation matching original index.html exactly
      const mid = winH * 0.5;
      const centers = sectionIds.map((id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });

      let frac = 0;
      if (mid < centers[0]) {
        frac = 0;
      } else {
        for (let i = 0; i < centers.length - 1; i++) {
          if (mid >= centers[i] && mid < centers[i + 1]) {
            const t = (mid - centers[i]) / (centers[i + 1] - centers[i]);
            frac = i + t * t * (3 - 2 * t);
            break;
          }
        }
        if (mid >= centers[centers.length - 1]) {
          frac = centers.length - 1;
        }
      }
      setScrollFraction(frac);

      const activeIndex = Math.min(sectionIds.length - 1, Math.max(0, Math.round(frac)));
      setActiveSection(sectionIds[activeIndex]);
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    updateScroll();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const effectiveMode = hoverMode || mode;

  return (
    <PortfolioContext.Provider
      value={{
        mode,
        hoverMode,
        effectiveMode,
        setMode,
        setHoverMode,
        bursts: burstsRef.current,
        triggerBurst,
        activeSection,
        scrollFraction,
        scrollProgress,
        isFinePointer,
        prefersReducedMotion,
        pointerPos,
        scrollVelocity,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
