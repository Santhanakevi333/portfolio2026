import React, { useState } from 'react';
import { scrambleText } from '../utils/textScramble';
import { usePortfolio } from '../context/PortfolioContext';

export const Header: React.FC = () => {
  const { prefersReducedMotion } = usePortfolio();
  const [brandText, setBrandText] = useState('Santhana Keveen A');
  const [navTexts, setNavTexts] = useState<Record<string, string>>({
    work: 'Work',
    experience: 'Experience',
    skills: 'Skills',
    resume: 'Resume',
    contact: 'Contact',
  });

  const handleBrandHover = () => {
    scrambleText('Santhana Keveen A', setBrandText, 380, prefersReducedMotion);
  };

  const handleNavHover = (key: string, original: string) => {
    scrambleText(
      original,
      (txt) => setNavTexts((prev) => ({ ...prev, [key]: txt })),
      380,
      prefersReducedMotion
    );
  };

  return (
    <header className="top">
      <a
        className="mark"
        href="#top"
        onMouseEnter={handleBrandHover}
      >
        {brandText}
      </a>
      <nav className="nav" aria-label="Sections">
        {[
          { key: 'work', href: '#work', label: 'Work' },
          { key: 'experience', href: '#experience', label: 'Experience' },
          { key: 'skills', href: '#skills', label: 'Skills' },
          { key: 'resume', href: '#resume', label: 'Resume' },
          { key: 'contact', href: '#contact', label: 'Contact' },
        ].map(({ key, href, label }) => (
          <a
            key={key}
            href={href}
            onMouseEnter={() => handleNavHover(key, label)}
          >
            {navTexts[key]}
          </a>
        ))}
      </nav>
    </header>
  );
};
