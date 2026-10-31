import React, { useRef, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { scrambleText } from '../utils/textScramble';
import { SkillCloud } from './SkillCloud';
import { SkillCategory } from '../types';

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Languages',
    skills: ['JavaScript (ES6+)', 'TypeScript', 'HTML5', 'CSS3'],
  },
  {
    title: 'Front end',
    skills: ['React.js', 'Tailwind CSS', 'Zustand', 'Recharts', 'Responsive design', 'Web Workers'],
  },
  {
    title: 'Maps and graphics',
    skills: ['MapLibre GL JS', 'WebGL 2', 'GLSL shaders', 'GeoJSON', 'OpenStreetMap'],
  },
  {
    title: 'Backend and APIs',
    skills: ['REST APIs', 'OpenAPI', 'Node.js', 'Express.js', 'MongoDB', 'Supabase', 'Gemini API', 'Caching'],
  },
  {
    title: 'Tooling',
    skills: ['Git', 'GitHub', 'Vite', 'Vitest', 'VS Code', 'Chrome DevTools'],
  },
  {
    title: 'Languages spoken',
    skills: ['English (fluent)', 'Tamil'],
  },
];

export const Skills: React.FC = () => {
  const { prefersReducedMotion } = usePortfolio();
  const [eyebrow, setEyebrow] = useState('Skills');
  const sectionRef = useRef<HTMLElement | null>(null);

  let watermarkOffset = 0;
  if (sectionRef.current) {
    const rect = sectionRef.current.getBoundingClientRect();
    const p = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    watermarkOffset = p * 1 * (window.innerWidth * 0.16);
  }

  return (
    <section ref={sectionRef} className="sec" id="skills">
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
        SKILLS
      </div>

      {/* Header */}
      <div className="sec-head">
        <p
          className="eyebrow"
          data-scramble
          onMouseEnter={() => scrambleText('Skills', setEyebrow, 400, prefersReducedMotion)}
        >
          {eyebrow}
        </p>
        <h2>Tools I use every week</h2>
      </div>

      {/* Skills wrap */}
      <div className="skills-wrap">
        <div className="skills">
          {SKILL_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="skill">
              <h3>{cat.title}</h3>
              <p>
                {cat.skills.map((skill, sIdx) => (
                  <span key={sIdx}>{skill}</span>
                ))}
              </p>
            </div>
          ))}
        </div>

        <SkillCloud />
      </div>
    </section>
  );
};
