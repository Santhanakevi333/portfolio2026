import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { scrambleText } from '../utils/textScramble';
import { SceneMode } from '../types';

const ROLES = [
  'React interfaces',
  'GPU wind maps',
  'forecast dashboards',
  'API-driven screens',
];

const TICKS: Record<SceneMode, string[]> = {
  wind: ['0', '3', '6', '10', '15', '20', '30'],
  solar: ['0', '1k', '2k', '3k', '5k', '6k', '8k'],
  demand: ['10k', '12k', '13k', '14k', '15k', '17k', '18k'],
};

const CAPTIONS: Record<SceneMode, string> = {
  wind: 'Background: simulated wind field in m/s. Move your pointer through it, click for a gust.',
  solar: 'Background: illustrative solar heat rising, colored by output in MW. Click for a gust.',
  demand: 'Background: illustrative demand swirl, colored by load in MW. Click for a gust.',
};

const NAME_WORDS = ['Santhana', 'Keveen', 'A'];

export const Hero: React.FC = () => {
  const { mode, setMode, effectiveMode, prefersReducedMotion } = usePortfolio();
  const [eyebrow, setEyebrow] = useState('Front-end developer · Coimbatore 11.02°N 76.96°E');
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [litChar, setLitChar] = useState<number | null>(null);

  // Counters
  const [counts, setCounts] = useState({ platforms: 0, models: 0, states: 0, block: 0 });

  // Eyebrow scramble
  useEffect(() => {
    const timer = setTimeout(() => {
      scrambleText(
        'Front-end developer · Coimbatore 11.02°N 76.96°E',
        setEyebrow,
        900,
        prefersReducedMotion
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Role rotator
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Periodic wave glow across letters
  const totalChars = NAME_WORDS.join('').length;
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      for (let i = 0; i < totalChars; i++) {
        setTimeout(() => {
          setLitChar(i);
          setTimeout(() => setLitChar(null), 420);
        }, i * 55);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, totalChars]);

  // Animated counters
  useEffect(() => {
    if (prefersReducedMotion) {
      setCounts({ platforms: 4, models: 3, states: 9, block: 15 });
      return;
    }

    const t0 = performance.now();
    let animId: number;

    const animateCounts = (now: number) => {
      const p = Math.min(1, (now - t0) / 1200);
      const ease = 1 - Math.pow(1 - p, 3);
      setCounts({
        platforms: Math.round(4 * ease),
        models: Math.round(3 * ease),
        states: Math.round(9 * ease),
        block: Math.round(15 * ease),
      });

      if (p < 1) {
        animId = requestAnimationFrame(animateCounts);
      }
    };

    const timer = setTimeout(() => {
      animId = requestAnimationFrame(animateCounts);
    }, 900);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, [prefersReducedMotion]);

  // Magnetic button hover handler
  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate3d(${(dx * 0.3).toFixed(1)}px, ${(dy * 0.4).toFixed(1)}px, 0)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = '';
  };

  let globalCharIndex = 0;

  return (
    <section className="hero" id="hero">
      {/* Eyebrow */}
      <p
        className="eyebrow"
        data-scramble
        onMouseEnter={() =>
          scrambleText(
            'Front-end developer · Coimbatore 11.02°N 76.96°E',
            setEyebrow,
            500,
            prefersReducedMotion
          )
        }
      >
        {eyebrow}
      </p>

      {/* Main Heading with unbreakable words and 3D flip letters */}
      <h1 id="name" aria-label="Santhana Keveen A">
        {NAME_WORDS.map((word, wIdx) => (
          <React.Fragment key={wIdx}>
            <span className="word" aria-hidden="true">
              {word.split('').map((char) => {
                const charIdx = globalCharIndex++;
                return (
                  <span
                    key={charIdx}
                    className={`ch ${litChar === charIdx ? 'lit' : ''}`}
                    style={{ '--i': charIdx } as React.CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
            {wIdx < NAME_WORDS.length - 1 && ' '}
          </React.Fragment>
        ))}
      </h1>

      {/* Lead with role rotator */}
      <p className="lead">
        <span>I build</span>
        <span className="rot">
          <span
            className="rot-in"
            style={{
              transform: `translateY(-${activeRoleIndex * 1.2}em)`,
              transition: prefersReducedMotion ? 'none' : 'transform 0.7s cubic-bezier(0.7,0,0.2,1)',
            }}
          >
            {ROLES.map((role, idx) => (
              <b key={idx}>{role}</b>
            ))}
          </span>
        </span>
        <span>that make weather and power forecasts easy to read.</span>
      </p>

      {/* Intro text */}
      <p className="intro">
        React and TypeScript developer at Leap Green Energy. I work as the sole front-end
        developer on four live renewable energy platforms, from a GPU-rendered global wind
        map to 15-minute power forecast dashboards.
      </p>

      {/* Mode switcher */}
      <div className="modes-row">
        <small>Change the 3D scene</small>
        <div className="modes" role="group" aria-label="Background scene">
          {(['wind', 'solar', 'demand'] as SceneMode[]).map((m) => (
            <button
              key={m}
              type="button"
              data-mode={m}
              aria-pressed={mode === m ? 'true' : 'false'}
              onClick={() => setMode(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="cta">
        <a
          className="btn solid mag"
          href="#work"
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
        >
          See live work
        </a>
        <a
          className="btn mag"
          href="#contact"
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
        >
          Get in touch
        </a>
      </div>

      {/* Facts counters */}
      <dl className="facts">
        <div>
          <dt>{counts.platforms}</dt>
          <dd>live platforms, built solo on the front end</dd>
        </div>
        <div>
          <dt>{counts.models}</dt>
          <dd>forecast models on one map: GFS, ECMWF, AIFS</dd>
        </div>
        <div>
          <dt>{counts.states}</dt>
          <dd>states in the wind power forecast view</dd>
        </div>
        <div>
          <dt>{counts.block} min</dt>
          <dd>forecast block on the power dashboards</dd>
        </div>
      </dl>

      {/* Dynamic color legend */}
      <div className="legend" data-mode={effectiveMode} aria-label="Color key for the background animation">
        <div className="bar"></div>
        <div className="ticks">
          {TICKS[effectiveMode].map((tick, i) => (
            <span key={i}>{tick}</span>
          ))}
        </div>
        <p className="cap">{CAPTIONS[effectiveMode]}</p>
      </div>

      {/* Globe drag hint zone */}
      <div className="gzone" id="gzone" aria-hidden="true">
        <span>Drag the globe</span>
      </div>
    </section>
  );
};
