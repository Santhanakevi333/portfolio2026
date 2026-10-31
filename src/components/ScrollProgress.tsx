import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export const ScrollProgress: React.FC = () => {
  const { scrollProgress } = usePortfolio();

  return (
    <div className="prog fixed top-0 left-0 right-0 h-[3px] z-40 pointer-events-none" aria-hidden="true">
      <i
        className="block h-full origin-left bg-gradient-to-r from-accent to-warm transition-transform duration-75"
        style={{ transform: `scaleX(${scrollProgress.toFixed(4)})` }}
      />
    </div>
  );
};

