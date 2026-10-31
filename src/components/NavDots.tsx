import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

const SECTIONS = [
  { id: 'top', targetId: 'hero', label: 'Home' },
  { id: 'work', targetId: 'work', label: 'Work' },
  { id: 'experience', targetId: 'experience', label: 'Experience' },
  { id: 'skills', targetId: 'skills', label: 'Skills' },
  { id: 'resume', targetId: 'resume', label: 'Resume' },
  { id: 'contact', targetId: 'contact', label: 'Contact' },
];

export const NavDots: React.FC = () => {
  const { activeSection } = usePortfolio();

  return (
    <nav className="dots" aria-label="Page sections">
      {SECTIONS.map(({ id, targetId, label }) => {
        const isActive = activeSection === targetId || (id === 'top' && activeSection === 'hero');
        return (
          <a
            key={id}
            href={`#${id}`}
            data-label={label}
            aria-label={label}
            className={isActive ? 'on' : ''}
          />
        );
      })}
    </nav>
  );
};
