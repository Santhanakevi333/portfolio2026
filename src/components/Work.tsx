import React, { useRef, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { scrambleText } from '../utils/textScramble';
import { SceneMode } from '../types';

interface ProjectSpec {
  label: string;
  value: string;
}

interface ProjectData {
  title: string;
  kind: string;
  desc: string;
  extraDesc?: string;
  liveUrl?: string;
  tags: string[];
  specs?: ProjectSpec[];
  mode?: SceneMode;
  featured?: boolean;
  wide?: boolean;
}

const PROJECTS: ProjectData[] = [
  {
    title: 'Leap Meteo',
    kind: 'Weather platform',
    desc: 'A global weather map with wind, temperature, rain, cloud and pressure layers. Switch between GFS, ECMWF and AIFS forecasts, scrub a play/pause time slider, search any city or lat/lon, change units, and follow tropical cyclone tracks with forecast cones.',
    extraDesc:
      'A custom WebGL 2 and GLSL layer on MapLibre GL JS animates wind particles on the GPU, and 16-bit PNG tiles are decoded in Web Workers so panning stays smooth.',
    liveUrl: 'https://leapmeteo.com',
    tags: ['React', 'TypeScript', 'MapLibre GL JS', 'WebGL 2', 'GLSL', 'Zustand', 'Web Workers', 'Vite'],
    mode: 'wind',
    featured: true,
    specs: [
      { label: 'Layers', value: 'Wind, temperature, rain, cloud, pressure' },
      { label: 'Models', value: 'GFS, ECMWF, AIFS' },
      { label: 'Units', value: 'm/s, km/h, kt, mph' },
      { label: 'Render', value: 'WebGL 2 particle layer' },
      { label: 'Decode', value: '16-bit PNG in Web Workers' },
      { label: 'Tracking', value: 'Cyclone cones and tracks' },
    ],
  },
  {
    title: 'Leap Vayu',
    kind: 'Wind power',
    desc: 'A 15-minute block forecast for 9 states, with an interactive India map and a state table that shows previous and future blocks on demand.',
    liveUrl: 'https://leapvayu.com',
    tags: ['React', 'Tailwind CSS', 'REST APIs'],
    mode: 'wind',
  },
  {
    title: 'Leap Surya',
    kind: 'Solar forecast',
    desc: 'A 3-day solar output forecast in MW with 15-minute and hourly views, color-coded by output band so peaks and gaps read at a glance.',
    liveUrl: 'https://leapsurya.com',
    tags: ['React', 'Tailwind CSS', 'REST APIs'],
    mode: 'solar',
  },
  {
    title: 'Leap Sakthi',
    kind: 'Demand forecast',
    desc: 'A 3-day power demand forecast in MW with 15-minute and hourly views, a 10-band color legend and daily totals in million units.',
    liveUrl: 'https://leapsakthi.com',
    tags: ['React', 'Tailwind CSS', 'REST APIs'],
    mode: 'demand',
  },
  {
    title: 'FitTracker Pro',
    kind: 'Personal project',
    desc: "A progressive overload tracker that logs load progression, personal records and volume across 9 muscle groups. Google Gemini turns meal photos and voice notes into macros and exercise logs. Supabase Auth with PostgreSQL Row-Level Security keeps each user's data private, with a localStorage offline fallback.",
    tags: ['React 19', 'Vite', 'Tailwind CSS v4', 'Gemini API', 'Supabase', 'Vercel'],
    wide: true,
  },
  {
    title: 'Bulk Mail App',
    kind: 'Personal project',
    desc: 'A MERN application for email campaigns with scheduling, contact management and template customization, sending through Nodemailer.',
    tags: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Nodemailer', 'Tailwind CSS'],
    wide: true,
  },
];

export const Work: React.FC = () => {
  const { setHoverMode, prefersReducedMotion } = usePortfolio();
  const [eyebrow, setEyebrow] = useState('Work');
  const sectionRef = useRef<HTMLElement | null>(null);

  // 3D Card tilt handler
  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    card.style.transform = `perspective(1000px) rotateX(${((0.5 - py) * 7).toFixed(2)}deg) rotateY(${((px - 0.5) * 9).toFixed(2)}deg)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLElement>, mode?: SceneMode) => {
    e.currentTarget.style.transform = '';
    if (mode) {
      setHoverMode(null);
    }
  };

  const handleCardMouseEnter = (_e: React.MouseEvent<HTMLElement>, mode?: SceneMode) => {
    if (mode) {
      setHoverMode(mode);
    }
  };

  let watermarkOffset = 0;
  if (sectionRef.current) {
    const rect = sectionRef.current.getBoundingClientRect();
    const p = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    watermarkOffset = p * 1 * (window.innerWidth * 0.16);
  }

  return (
    <section ref={sectionRef} className="sec" id="work">
      {/* Background Watermark Word */}
      <div
        className="bgword"
        aria-hidden="true"
        style={{
          transform: prefersReducedMotion
            ? 'none'
            : `translate3d(${watermarkOffset.toFixed(1)}px, 0, 0)`,
        }}
      >
        WORK
      </div>

      {/* Section Header */}
      <div className="sec-head">
        <p
          className="eyebrow"
          data-scramble
          onMouseEnter={() => scrambleText('Work', setEyebrow, 400, prefersReducedMotion)}
        >
          {eyebrow}
        </p>
        <h2>Live platforms you can open right now</h2>
        <p>
          Four production sites for a wind and solar company, plus two personal full-stack
          builds. Hover a card to change the scene behind it.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid">
        {PROJECTS.map((proj, idx) => {
          const cardClass = `card ${proj.featured ? 'feature' : ''} ${proj.wide ? 'wide' : ''}`;

          return (
            <article
              key={idx}
              className={cardClass}
              data-tilt
              data-mode={proj.mode}
              onMouseMove={handleCardMouseMove}
              onMouseEnter={(e) => handleCardMouseEnter(e, proj.mode)}
              onMouseLeave={(e) => handleCardMouseLeave(e, proj.mode)}
            >
              {proj.featured ? (
                <>
                  <div className="main">
                    <span className="kind">{proj.kind}</span>
                    <h3>{proj.title}</h3>
                    <p>{proj.desc}</p>
                    {proj.extraDesc && <p>{proj.extraDesc}</p>}
                    {proj.liveUrl && (
                      <a
                        className="live"
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {proj.liveUrl.replace('https://', '')} ↗
                      </a>
                    )}
                    <ul className="tags">
                      {proj.tags.map((tag, tIdx) => (
                        <li key={tIdx}>{tag}</li>
                      ))}
                    </ul>
                  </div>

                  {proj.specs && (
                    <dl className="spec">
                      {proj.specs.map((spec, sIdx) => (
                        <div key={sIdx}>
                          <dt>{spec.label}</dt>
                          <dd>{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </>
              ) : (
                <>
                  <span className="kind">{proj.kind}</span>
                  <h3>{proj.title}</h3>
                  <p>{proj.desc}</p>
                  {proj.liveUrl && (
                    <a
                      className="live"
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {proj.liveUrl.replace('https://', '')} ↗
                    </a>
                  )}
                  <ul className="tags">
                    {proj.tags.map((tag, tIdx) => (
                      <li key={tIdx}>{tag}</li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
