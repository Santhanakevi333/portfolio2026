import React, { useRef, useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { scrambleText } from '../utils/textScramble';

const EMAIL = 'kevinkevi2003@gmail.com';

export const Contact: React.FC = () => {
  const { prefersReducedMotion, triggerBurst } = usePortfolio();
  const [eyebrow, setEyebrow] = useState('Contact');
  const [copyState, setCopyState] = useState('');
  const sectionRef = useRef<HTMLElement | null>(null);
  const emailRef = useRef<HTMLElement | null>(null);

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

    const fallback = () => {
      if (emailRef.current) {
        const range = document.createRange();
        range.selectNodeContents(emailRef.current);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        setCopyState('Selected');
        setTimeout(() => setCopyState(''), 2200);
      }
    };

    try {
      navigator.clipboard
        .writeText(EMAIL)
        .then(() => {
          setCopyState('Copied');
          setTimeout(() => setCopyState(''), 2200);
        })
        .catch(fallback);
    } catch {
      fallback();
    }
  };

  const handleMagneticMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate3d(${(dx * 0.3).toFixed(1)}px, ${(dy * 0.4).toFixed(1)}px, 0)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = '';
  };

  let watermarkOffset = 0;
  if (sectionRef.current) {
    const rect = sectionRef.current.getBoundingClientRect();
    const p = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    watermarkOffset = p * -1 * (window.innerWidth * 0.16);
  }

  return (
    <section ref={sectionRef} className="sec" id="contact">
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
        CONTACT
      </div>

      <div className="contact">
        <p
          className="eyebrow"
          data-scramble
          onMouseEnter={() => scrambleText('Contact', setEyebrow, 400, prefersReducedMotion)}
        >
          {eyebrow}
        </p>
        <h2>Open to front-end roles</h2>
        <p className="intro" style={{ marginTop: '14px' }}>
          If you are hiring for a React front-end position, email me and I will reply quickly.
        </p>

        {/* Email Box & Copy */}
        <div className="addr">
          <code id="email" ref={emailRef}>
            {EMAIL}
          </code>
          <button
            type="button"
            id="copy"
            className="mag"
            onClick={handleCopy}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
          >
            Copy
          </button>
          <span id="copystate" role="status" aria-live="polite">
            {copyState}
          </span>
        </div>

        {/* Social Links */}
        <div className="links">
          <a
            className="btn mag"
            href="https://www.linkedin.com/in/kevin003"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
          >
            LinkedIn ↗
          </a>
          <a
            className="btn mag"
            href="https://github.com/Santhanakevi333"
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
};
