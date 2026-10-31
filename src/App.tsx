import React from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { ThreeScene } from './components/ThreeScene';
import { ScrollProgress } from './components/ScrollProgress';
import { NavDots } from './components/NavDots';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Work } from './components/Work';
import { Marquee } from './components/Marquee';
import { Experience } from './components/Experience';
import { Skills } from './components/Skills';
import { Resume } from './components/Resume';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <PortfolioProvider>
      <div className="relative min-h-screen bg-bg text-fg font-body antialiased selection:bg-accent selection:text-bg">
        {/* Background 3D WebGL Canvas */}
        <ThreeScene />

        {/* Shading Veil */}
        <div className="veil" aria-hidden="true" />

        {/* Scroll Progress Bar */}
        <ScrollProgress />

        {/* Section Navigation Dots */}
        <NavDots />

        {/* Interactive Custom Cursor */}
        <CustomCursor />

        {/* Main Content Container - sits above veil with z-index: 2 */}
        <div className="wrap">
          <Header />
          <main id="top">
            <Hero />
            <Work />
            <Marquee />
            <Experience />
            <Skills />
            <Resume />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>
    </PortfolioProvider>
  );
};

export default App;
