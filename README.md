# Santhana Keveen A — Portfolio (React + Tailwind CSS + Three.js)

A high-performance, interactive portfolio converted from `index.html` into a modular, production-ready React 19 + TypeScript + Tailwind CSS application powered by Vite.

## 🚀 Key Features Converted & Preserved

1. **Interactive 3D WebGL Background (`ThreeScene.tsx`)**:
   - Particle field vector simulation with dynamic modes: **Wind**, **Solar**, and **Demand**.
   - 3D Wireframe Globe with coordinate grid, Coimbatore home coordinates (`11.02°N, 76.96°E`), and animated flight arcs connecting Chennai, Mumbai, and Delhi.
   - Interactive draggable globe zone with realistic inertia and velocity decay.
   - Floating wireframe geometries (Icosahedron, Octahedron, Torus, Tetrahedron, Box) with scroll parallax.
   - Click shockwave bursts that physically push and disrupt particle streams.
   - Dynamic camera dolly transitions synchronized with active section scroll progress.

2. **Custom Interactive Cursor (`CustomCursor.tsx`)**:
   - Trailing magnetic cursor ring and core dot.
   - Expanding state with dynamic "Drag" label over 3D interactive elements (Globe, Skill Sphere).
   - Click shockwave ripple effect with automatic touch-screen fallback and `prefers-reduced-motion` compliance.

3. **Hero Section (`Hero.tsx`)**:
   - Decoded text scramble effect on the eyebrow.
   - 3D perspective letter entrance for **Santhana Keveen A** with periodic glowing wave animation.
   - Animated role text rotator (`React interfaces`, `GPU wind maps`, `forecast dashboards`, `API-driven screens`).
   - Mode switcher buttons toggling 3D particle colors and simulation dynamics.
   - Magnetic pointer physics on CTA buttons.
   - Animated stat counters (4 live platforms, 3 forecast models, 9 states, 15 min forecast block).
   - Real-time color legend with scale indicators for Wind, Solar, and Demand modes.

4. **Work Section (`Work.tsx`)**:
   - Parallax background watermark text `WORK`.
   - 3D card tilt physics and radial cursor spotlight on hover.
   - Card hover interaction that seamlessly alters the background Three.js simulation mode.
   - Featured project showcase: **Leap Meteo** with technical specifications table, tags, and live external links.
   - Projects: **Leap Vayu**, **Leap Surya**, **Leap Sakthi**, **FitTracker Pro**, and **Bulk Mail App**.

5. **Infinite Angled Marquee (`Marquee.tsx`)**:
   - 1.6-degree tilted double-row ticker with spinning diamond accents.
   - Solid and hollow outline text tracks with scroll velocity acceleration.

6. **Experience Section (`Experience.tsx`)**:
   - Parallax watermark `EXPERIENCE`.
   - Role card for **Leap Green Energy** with an animated vertical gradient border indicator.
   - Education and Certification cards.

7. **Skills Section & 3D Interactive Tag Cloud (`Skills.tsx` & `SkillCloud.tsx`)**:
   - Categorized skills breakdown.
   - Interactive 3D tag sphere distributing 22 tech keywords along a Fibonacci sphere with draggable momentum physics, 3D depth scaling, and opacity.

8. **Contact Section (`Contact.tsx`)**:
   - One-click copy email button with clipboard fallback, visual feedback, and 3D scene burst trigger.
   - Magnetic social buttons (LinkedIn, GitHub).

9. **Navigation & Progress**:
   - Top reading progress bar (`ScrollProgress.tsx`).
   - Sticky frosted header with text scramble hover effects (`Header.tsx`).
   - Right-side section navigation dots with tooltips (`NavDots.tsx`).

## 🛠️ Project Structure

```
portfolio/
├── src/
│   ├── components/
│   │   ├── Contact.tsx         # Contact section with copy & shockwave trigger
│   │   ├── CustomCursor.tsx    # Cursor ring, dot & ripple effects
│   │   ├── Experience.tsx     # Work experience timeline & education
│   │   ├── Footer.tsx         # Footer with attribution
│   │   ├── Header.tsx         # Sticky navigation with text scramble
│   │   ├── Hero.tsx           # Hero section, stats counters & rotator
│   │   ├── Marquee.tsx        # Diagonal running tech ticker
│   │   ├── NavDots.tsx        # Floating section dot indicators
│   │   ├── ScrollProgress.tsx # Top gradient scroll indicator
│   │   ├── SkillCloud.tsx     # 3D draggable Fibonacci tag sphere
│   │   ├── Skills.tsx         # Categorized skills grid
│   │   ├── ThreeScene.tsx     # Full Three.js particle & globe simulation
│   │   └── Work.tsx           # Projects grid with 3D tilt & mode sync
│   ├── context/
│   │   └── PortfolioContext.tsx # Centralized state (modes, bursts, scroll)
│   ├── utils/
│   │   └── textScramble.ts    # Scramble text effect generator
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # Main container layout
│   ├── main.tsx               # React root entry
│   └── index.css              # Tailwind directives & custom CSS
├── index.html                 # HTML shell with Google Fonts
├── tailwind.config.js         # Custom theme colors and font families
├── vite.config.ts             # Vite configuration
└── package.json
```

## 💻 How to Run

1. Open a terminal in the project directory:
   ```bash
   cd /home/frcstpc7/.gemini/antigravity/scratch/portfolio
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

