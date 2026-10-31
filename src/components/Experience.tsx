import React, { useRef, useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { scrambleText } from '../utils/textScramble';

export const Experience: React.FC = () => {
  const { prefersReducedMotion } = usePortfolio();
  const [eyebrow, setEyebrow] = useState('Experience');
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let watermarkOffset = 0;
  if (sectionRef.current) {
    const rect = sectionRef.current.getBoundingClientRect();
    const p = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    watermarkOffset = p * -1 * (window.innerWidth * 0.16);
  }

  return (
    <section ref={sectionRef} className="sec" id="experience">
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
        EXPERIENCE
      </div>

      {/* Section Header */}
      <div className="sec-head">
        <p
          className="eyebrow"
          data-scramble
          onMouseEnter={() => scrambleText('Experience', setEyebrow, 400, prefersReducedMotion)}
        >
          {eyebrow}
        </p>
        <h2>Shipping for a wind and solar company</h2>
      </div>

      {/* Main Job Card */}
      <div className={`job ${inView ? 'in' : ''}`}>
        <div className="when">
          May 2025 – Present
          <br />
          Coimbatore
        </div>

        <div>
          <h3>Junior Web Developer</h3>
          <p className="org">Leap Green Energy Pvt. Ltd.</p>

          <ul>
            <li>
              Sole front-end developer on four live platforms:{' '}
              <a href="https://leapmeteo.com" target="_blank" rel="noopener noreferrer">
                leapmeteo.com
              </a>
              ,{' '}
              <a href="https://leapvayu.com" target="_blank" rel="noopener noreferrer">
                leapvayu.com
              </a>
              ,{' '}
              <a href="https://leapsurya.com" target="_blank" rel="noopener noreferrer">
                leapsurya.com
              </a>{' '}
              and{' '}
              <a href="https://leapsakthi.com" target="_blank" rel="noopener noreferrer">
                leapsakthi.com
              </a>
              .
            </li>
            <li>
              Built color-coded 3-day forecast dashboards with 15-minute and hourly views
              using React.js, Tailwind CSS and Recharts.
            </li>
            <li>
              Integrated REST APIs through a type-safe client generated from OpenAPI
              specs, cancelling in-flight requests so map interactions stay responsive.
            </li>
            <li>
              Optimized backend APIs by reducing response times and adding pagination and
              caching, and built Node.js endpoints where needed.
            </li>
          </ul>
        </div>
      </div>

      {/* Two Column Mini Cards */}
      <div className="twocol">
        <div className="mini">
          <p className="k">Education</p>
          <h3>B.E. Cyber Security</h3>
          <p>
            Mahendra Engineering College, Namakkal
            <br />
            2020 – 2024 · CGPA 8.25
          </p>
        </div>

        <div className="mini">
          <p className="k">Certification</p>
          <h3>Full Stack MERN Development</h3>
          <p>
            Error Makes Clever
            <br />
            Certificate ID EMCFSWDB1235
          </p>
        </div>
      </div>
    </section>
  );
};
