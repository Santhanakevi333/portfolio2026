import React, { useRef, useState, useEffect } from 'react';
import {
  Download,
  Eye,
  Check,
  Copy,
  Printer,
  X,
  Compass,
  Layers,
  Code2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { scrambleText } from '../utils/textScramble';
import { ThreeResumeCanvas, Resume3DMode } from './ThreeResumeCanvas';

const RESUME_PDF_PATH = '/Santhana_Keveen_A_Resume.pdf';

const RESUME_SUMMARY_TEXT = `SANTHANA KEVEEN A
Front-End Web Developer (React JS)
Phone: +91-7695971980 | Email: kevinkevi2003@gmail.com
LinkedIn: https://linkedin.com/in/kevin003 | GitHub: https://github.com/Santhanakevi333
Location: Coimbatore, Tamil Nadu

PROFESSIONAL SUMMARY:
Front-End Web Developer with 1+ year of professional experience building production React.js and TypeScript applications for a renewable energy company. Delivered four live forecasting platforms with interactive dashboards, real-time weather maps, and custom WebGL visualizations. Strong in REST API integration, API optimization (pagination, caching), and responsive UI with Tailwind CSS.

TECHNICAL SKILLS:
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3
- Frontend: React.js, Tailwind CSS, Zustand, Recharts, Responsive Design, Web Workers
- Mapping and Visualization: MapLibre GL JS, WebGL 2, GLSL Shaders, GeoJSON, OpenStreetMap
- Backend and APIs: REST APIs, OpenAPI, Node.js, Express.js, MongoDB, Supabase, Gemini API, Caching
- Tools: Git, GitHub, Vite, Vitest, VS Code, Chrome DevTools
- Spoken Languages: English (Fluent), Tamil

PROFESSIONAL EXPERIENCE:
Junior Web Developer — Leap Green Energy Pvt. Ltd., Coimbatore (May 2025 – Present)
- Built front-end applications for four live renewable energy platforms: leapmeteo.com (weather), leapvayu.com (state-wise wind forecast), leapsurya.com (solar forecast), and leapsakthi.com (demand forecast).
- Developed data-heavy dashboards using React.js, Tailwind CSS, and Recharts to visualize wind, solar, and demand forecast data.
- Integrated REST APIs with a type-safe client generated from OpenAPI specs, using request cancellation to keep map interactions responsive.
- Optimized backend APIs by reducing response times and adding pagination and caching; built Node.js endpoints where needed.
- Collaborated using Git and GitHub to deliver and maintain production releases.

KEY PROJECTS:
- Leap Meteo – Interactive Weather Forecasting Platform (leapmeteo.com)
  Stack: React, TypeScript, MapLibre GL JS, WebGL 2, GLSL, Zustand, Vite, Vitest
- Bulk Mail App (MERN)
  Stack: MongoDB, Express.js, React.js, Node.js, Nodemailer, Tailwind CSS
- FitTracker Pro – AI-Powered Fitness Analytics Platform
  Stack: React 19, Vite, Tailwind CSS v4, Google Gemini API, Supabase (PostgreSQL), Vercel

EDUCATION & CERTIFICATIONS:
- B.E. Cyber Security, Mahendra Engineering College, Namakkal (2020 – 2024, CGPA: 8.25)
- Full Stack MERN Development – Error Makes Clever (Certificate ID: EMCFSWDB1235)`;

export const Resume: React.FC = () => {
  const { prefersReducedMotion, triggerBurst } = usePortfolio();
  const [eyebrow, setEyebrow] = useState('Curriculum Vitae');
  const [mode, setMode] = useState<Resume3DMode>('cyber');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [modalZoom, setModalZoom] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement | null>(null);

  // Parallax background watermark text offset
  let watermarkOffset = 0;
  if (sectionRef.current) {
    const rect = sectionRef.current.getBoundingClientRect();
    const p = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    watermarkOffset = p * 1 * (window.innerWidth * 0.16);
  }

  // Handle Download PDF
  const handleDownload = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);

    const link = document.createElement('a');
    link.href = RESUME_PDF_PATH;
    link.download = 'Santhana_Keveen_A_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Print ATS Version
  const handlePrint = () => {
    window.print();
  };

  // Handle Copy Text Summary
  const handleCopySummary = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

    navigator.clipboard.writeText(RESUME_SUMMARY_TEXT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  };

  // Close inspector on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsInspectorOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section ref={sectionRef} className="sec" id="resume">
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
        RESUME
      </div>

      {/* Section Header */}
      <div className="sec-head text-center mx-auto max-w-xl">
        <p
          className="eyebrow"
          data-scramble
          onMouseEnter={() =>
            scrambleText('Curriculum Vitae', setEyebrow, 400, prefersReducedMotion)
          }
        >
          {eyebrow}
        </p>
        <h2>Interactive 3D Resume</h2>
      </div>

      {/* Centered 3D Interactive Hologram Stage */}
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
        {/* Mode Selector Bar Above 3D Canvas */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>3D Interactive Hologram</span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-line bg-[#09101c]/80 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMode('cyber')}
              className={`py-1.5 px-3 rounded uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                mode === 'cyber'
                  ? 'bg-accent text-[#04110f] font-bold shadow-[0_0_12px_rgba(82,214,200,0.35)]'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Cyber HUD
            </button>
            <button
              type="button"
              onClick={() => setMode('holo')}
              className={`py-1.5 px-3 rounded uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                mode === 'holo'
                  ? 'bg-warm text-[#04110f] font-bold shadow-[0_0_12px_rgba(255,184,77,0.35)]'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Holo Foil
            </button>
            <button
              type="button"
              onClick={() => setMode('clean')}
              className={`py-1.5 px-3 rounded uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                mode === 'clean'
                  ? 'bg-slate-200 text-[#09101c] font-bold shadow-md'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Clean Tech
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Container */}
        <div className="w-full relative shadow-2xl rounded-xl">
          <ThreeResumeCanvas
            mode={mode}
            autoRotate={autoRotate}
            onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
            onResetView={() => setZoomLevel(1)}
            zoom={zoomLevel}
          />
        </div>

        {/* Centered Action Buttons Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
          {/* Primary Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="btn inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-md bg-accent text-[#04110f] font-mono text-sm font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_24px_rgba(82,214,200,0.55)] hover:scale-[1.02] active:scale-[0.98]"
            title="Download Santhana Keveen A Resume (PDF)"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#04110f]" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Resume (PDF)</span>
              </>
            )}
          </button>

          {/* Full View Button */}
          <button
            type="button"
            onClick={() => {
              setModalZoom(1);
              setIsInspectorOpen(true);
            }}
            className="btn inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md border border-line bg-panel/80 hover:border-accent text-fg font-mono text-xs font-semibold uppercase tracking-wider transition-all hover:bg-panel shadow-sm hover:scale-[1.02]"
            title="Full View of Resume"
          >
            <Eye className="w-4 h-4 text-accent" />
            <span>Full View</span>
          </button>

          {/* Print ATS Version */}
          

          {/* Copy Summary Text */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="btn inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-md border border-line bg-panel/80 hover:border-accent text-muted hover:text-fg font-mono text-xs uppercase tracking-wider transition-all hover:bg-panel"
            title="Copy Text to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* FULLSCREEN RESUME VIEWER MODAL */}
      {isInspectorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsInspectorOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[96vh] bg-[#070e1b] border border-accent/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-fg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-[#091526]/95">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <h4 className="font-display font-bold text-base sm:text-lg text-fg">
                  Santhana Keveen A — Full Resume
                </h4>
              </div>

              {/* Header Actions: Zoom, Download, Close */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[#0b172a] border border-line text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setModalZoom((z) => Math.max(0.7, z - 0.15))}
                    className="p-1 text-muted hover:text-fg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1 text-[11px] text-accent min-w-[38px] text-center">
                    {Math.round(modalZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalZoom((z) => Math.min(1.6, z + 0.15))}
                    className="p-1 text-muted hover:text-fg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalZoom(1)}
                    className="p-1 text-muted hover:text-fg transition-colors"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-accent text-[#04110f] font-mono text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] hover:shadow-[0_0_14px_rgba(82,214,200,0.4)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-1.5 rounded-lg border border-line text-muted hover:text-fg hover:border-accent transition-colors"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Full Resume View */}
            <div className="p-3 sm:p-6 overflow-y-auto flex justify-center bg-[#050912]">
              <div
                className="max-w-2xl w-full transition-transform duration-150 origin-top"
                style={{ transform: `scale(${modalZoom})` }}
              >
                <img
                  src="/resume_preview.png"
                  alt="Santhana Keveen A Full Resume"
                  className="w-full h-auto rounded shadow-2xl border border-line/60 bg-white"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-line bg-[#091526]/95 text-xs font-mono text-muted">
              <span>Press ESC or click outside to close</span>
              <button
                type="button"
                onClick={handleDownload}
                className="text-accent hover:underline flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF File
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
