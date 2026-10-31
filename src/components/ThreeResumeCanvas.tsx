import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { usePortfolio } from '../context/PortfolioContext';

export type Resume3DMode = 'cyber' | 'holo' | 'clean';

interface ThreeResumeCanvasProps {
  mode: Resume3DMode;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onResetView: () => void;
  zoom: number;
}

export const ThreeResumeCanvas: React.FC<ThreeResumeCanvasProps> = ({
  mode,
  autoRotate,
  onToggleAutoRotate,
  onResetView,
  zoom,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { prefersReducedMotion, triggerBurst } = usePortfolio();
  const [isDragging, setIsDragging] = useState(false);
  const resetTriggerRef = useRef(0);

  // References to communicate with the render loop without re-triggering effects
  const stateRef = useRef({
    rx: 0.02,
    ry: 0.0,
    vx: 0,
    vy: 0,
    targetRx: 0.02,
    targetRy: 0.0,
    autoRotate,
    mode,
    zoom,
    pointerX: 0,
    pointerY: 0,
    isHovering: false,
  });

  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
    stateRef.current.mode = mode;
    stateRef.current.zoom = zoom;
  }, [autoRotate, mode, zoom]);

  // Method to draw the high-resolution 2D texture
  const drawResumeTexture = useCallback((theme: Resume3DMode): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1448;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const isHolo = theme === 'holo';
    const isClean = theme === 'clean';

    // 1. Background
    if (isClean) {
      ctx.fillStyle = '#0b111e';
      ctx.fillRect(0, 0, 1024, 1448);
    } else if (isHolo) {
      const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1448);
      bgGrad.addColorStop(0, '#060a14');
      bgGrad.addColorStop(0.5, '#0a1628');
      bgGrad.addColorStop(1, '#07101e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1024, 1448);
    } else {
      // Cyber HUD mode
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, 1024, 1448);
    }

    // 2. Subtle Cyber Grid
    ctx.strokeStyle = isHolo ? 'rgba(82, 214, 200, 0.07)' : 'rgba(82, 214, 200, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < 1024; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1448);
      ctx.stroke();
    }
    for (let y = 0; y < 1448; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // 3. Glowing Outer Border
    ctx.strokeStyle = isHolo
      ? 'rgba(255, 184, 77, 0.6)'
      : isClean
      ? 'rgba(147, 163, 188, 0.3)'
      : 'rgba(82, 214, 200, 0.65)';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, 1024 - 36, 1448 - 36);

    // Corner HUD Brackets
    const bracketSize = 28;
    const corners = [
      [14, 14, 1, 1],
      [1024 - 14, 14, -1, 1],
      [14, 1448 - 14, 1, -1],
      [1024 - 14, 1448 - 14, -1, -1],
    ];
    ctx.strokeStyle = isHolo ? '#ffb84d' : '#52d6c8';
    ctx.lineWidth = 4;
    corners.forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * bracketSize);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * bracketSize, cy);
      ctx.stroke();
    });

    // 4. Header Bar
    const primaryColor = isHolo ? '#ffb84d' : isClean ? '#e2e8f0' : '#52d6c8';
    const accentColor = isHolo ? '#52d6c8' : '#38bdf8';
    const mutedColor = '#8a99ad';
    const textColor = '#e6edf5';

    // Monogram Chip
    ctx.fillStyle = 'rgba(82, 214, 200, 0.12)';
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(50, 48, 64, 64, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'center';
    ctx.fillText('SK', 82, 90);

    // Name & Title
    ctx.textAlign = 'left';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SANTHANA KEVEEN A', 130, 84);

    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillStyle = primaryColor;
    ctx.fillText('JUNIOR WEB DEVELOPER • FRONTEND & GIS ENGINEER', 130, 110);

    // Status Pill
    ctx.fillStyle = 'rgba(82, 214, 200, 0.12)';
    ctx.strokeStyle = 'rgba(82, 214, 200, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(750, 56, 220, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(770, 72, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#52d6c8';
    ctx.fillText('VERIFIED DOSSIER', 785, 76);

    // Contact info bar
    ctx.font = '13.5px "JetBrains Mono", monospace';
    ctx.fillStyle = mutedColor;
    ctx.fillText('keveen2002@gmail.com  •  Coimbatore, Tamil Nadu, India  •  github.com/keveena', 50, 142);

    // Divider Line
    const divGrad = ctx.createLinearGradient(50, 154, 974, 154);
    divGrad.addColorStop(0, primaryColor);
    divGrad.addColorStop(0.6, accentColor);
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 156);
    ctx.lineTo(974, 156);
    ctx.stroke();

    let curY = 195;

    // Helper: Section Header
    const drawSectionHeader = (title: string, tag: string) => {
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillStyle = primaryColor;
      ctx.fillText(`// 0${tag}`, 50, curY);

      ctx.font = 'bold 20px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title.toUpperCase(), 115, curY);

      ctx.strokeStyle = 'rgba(82, 214, 200, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, curY + 8);
      ctx.lineTo(974, curY + 8);
      ctx.stroke();

      curY += 32;
    };

    // SECTION 1: PROFESSIONAL SUMMARY
    drawSectionHeader('Professional Summary', '1');
    ctx.font = '15px "Space Grotesk", sans-serif';
    ctx.fillStyle = textColor;
    const summaryLines = [
      'Frontend developer specializing in high-performance web applications, interactive geospatial maps, and renewable energy',
      'forecast dashboards. Proven experience as the sole front-end engineer building live production platforms at Leap Green Energy',
      'utilizing React.js, TypeScript, Tailwind CSS, Recharts, and WebGL with type-safe OpenAPI integration and client-side caching.',
    ];
    summaryLines.forEach((l) => {
      ctx.fillText(l, 50, curY);
      curY += 21;
    });
    curY += 15;

    // SECTION 2: WORK EXPERIENCE
    drawSectionHeader('Work Experience', '2');
    // Role title
    ctx.font = 'bold 18px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Junior Web Developer', 50, curY);

    ctx.font = 'bold 13.5px "JetBrains Mono", monospace';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'right';
    ctx.fillText('MAY 2025 – PRESENT', 974, curY);
    ctx.textAlign = 'left';
    curY += 22;

    ctx.font = '600 15px "JetBrains Mono", monospace';
    ctx.fillStyle = accentColor;
    ctx.fillText('Leap Green Energy Pvt. Ltd. — Coimbatore, Tamil Nadu', 50, curY);
    curY += 24;

    const expBullets = [
      'Sole front-end developer for four enterprise live platforms: leapmeteo.com, leapvayu.com, leapsurya.com, & leapsakthi.com.',
      'Architected color-coded 3-day forecast dashboards supporting 15-minute and hourly resolution views via React, Tailwind & Recharts.',
      'Engineered type-safe API communication generated from OpenAPI specs, implementing request cancellation for fluid map panning.',
      'Collaborated with data science teams to render wind vectors, solar irradiance curves, and grid scheduling analytics.',
      'Optimized backend response times by 35% through API pagination, caching layers, and custom Node.js microservices.',
    ];
    ctx.font = '14.5px "Space Grotesk", sans-serif';
    ctx.fillStyle = textColor;
    expBullets.forEach((bullet) => {
      ctx.fillStyle = primaryColor;
      ctx.fillText('▸', 52, curY);
      ctx.fillStyle = textColor;
      ctx.fillText(bullet, 72, curY);
      curY += 22;
    });
    curY += 15;

    // SECTION 3: KEY PRODUCTION PLATFORMS
    drawSectionHeader('Enterprise Platforms & Projects', '3');
    const projects = [
      {
        name: 'Leap Meteo Platform',
        tech: 'React, Tailwind, MapLibre GL, Recharts',
        desc: 'Live wind & solar forecast dashboard with animated vector streamlines, radar layers, and multi-model forecast charts.',
      },
      {
        name: 'Leap Vayu & Surya',
        tech: 'React, TypeScript, OpenAPI, WebGL',
        desc: 'Wind turbine dispatch & solar panel yield analytics spanning 9 Indian states with 15-minute telemetry blocks.',
      },
      {
        name: 'FitTracker Pro',
        tech: 'React, Zustand, PWA, Tailwind CSS',
        desc: 'Offline-first fitness telemetry app with interactive weight curves, streak timers, and responsive layout.',
      },
      {
        name: 'Bulk Mail Automator',
        tech: 'Node.js, Express, MongoDB, OAuth 2.0',
        desc: 'High-throughput automated mailing solution with custom variable templating, rate limiting, and delivery tracking.',
      },
    ];

    projects.forEach((p) => {
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(p.name, 50, curY);

      ctx.font = '12.5px "JetBrains Mono", monospace';
      ctx.fillStyle = primaryColor;
      ctx.fillText(`[ ${p.tech} ]`, 280, curY);
      curY += 19;

      ctx.font = '14px "Space Grotesk", sans-serif';
      ctx.fillStyle = mutedColor;
      ctx.fillText(p.desc, 68, curY);
      curY += 25;
    });
    curY += 8;

    // SECTION 4: TECHNICAL MATRIX
    drawSectionHeader('Technical Skills & Stack', '4');
    const skillRows = [
      ['LANGUAGES', 'JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL'],
      ['FRONTEND', 'React.js, Tailwind CSS, Zustand, Recharts, Responsive Design, Web Workers'],
      ['MAPS & 3D', 'MapLibre GL JS, WebGL 2, GLSL Shaders, GeoJSON, OpenStreetMap, Vector Tiles'],
      ['BACKEND & APIS', 'Node.js, Express.js, REST APIs, OpenAPI, MongoDB, Supabase, Gemini API, Caching'],
      ['DEVELOPER TOOLS', 'Git, GitHub, Vite, Vitest, VS Code, Chrome DevTools, Postman, Linux'],
    ];

    skillRows.forEach(([category, list]) => {
      ctx.font = 'bold 12.5px "JetBrains Mono", monospace';
      ctx.fillStyle = primaryColor;
      ctx.fillText(category, 50, curY);

      ctx.font = '14px "Space Grotesk", sans-serif';
      ctx.fillStyle = textColor;
      ctx.fillText(list, 200, curY);
      curY += 21;
    });
    curY += 15;

    // SECTION 5: EDUCATION & CERTIFICATIONS
    drawSectionHeader('Education & Credentials', '5');
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('B.E. Cyber Security', 50, curY);

    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText('Mahendra Engineering College, Namakkal', 240, curY);

    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'right';
    ctx.fillText('2020 – 2024  •  CGPA: 8.25', 974, curY);
    ctx.textAlign = 'left';
    curY += 22;

    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Full Stack MERN Certification', 50, curY);

    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.fillStyle = mutedColor;
    ctx.fillText('Error Makes Clever', 315, curY);

    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'right';
    ctx.fillText('CERT ID: EMCFSWDB1235', 974, curY);
    ctx.textAlign = 'left';

    // 5. Holographic Footer Stamp
    const stampX = 860;
    const stampY = 1360;
    ctx.strokeStyle = isHolo ? 'rgba(255, 184, 77, 0.65)' : 'rgba(82, 214, 200, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(stampX, stampY, 44, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = isHolo ? 'rgba(255, 184, 77, 0.35)' : 'rgba(82, 214, 200, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(stampX, stampY, 38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'center';
    ctx.fillText('AUTHENTICATED', stampX, stampY - 8);
    ctx.fillText('2025 • PROD', stampX, stampY + 6);
    ctx.fillText('LEAP METEO', stampX, stampY + 20);

    // Bottom Barcode / Hash
    ctx.textAlign = 'left';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(147, 163, 188, 0.55)';
    ctx.fillText('SEC-HASH: SK-FE-2025-LEAP-0482 // ATS-PARSER: COMPLIANT // DEPLOYED LIVE', 50, 1410);

    return canvas;
  }, []);

  // Three.js Scene Setup & Animation Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 640;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.7);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Texture & Resume Mesh
    const canvas = drawResumeTexture(stateRef.current.mode);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    // Dimensions: 3.4 x 4.8 x 0.08
    const slabW = 3.4;
    const slabH = 4.8;
    const slabD = 0.08;
    const geom = new THREE.BoxGeometry(slabW, slabH, slabD);

    const isHolo = stateRef.current.mode === 'holo';
    const isClean = stateRef.current.mode === 'clean';

    const faceMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: isHolo ? 0.15 : isClean ? 0.5 : 0.28,
      metalness: isHolo ? 0.45 : isClean ? 0.05 : 0.18,
      color: isHolo ? 0xfff4e6 : isClean ? 0xffffff : 0xe6f7f6,
    });

    // Load authentic user resume image texture
    const texLoader = new THREE.TextureLoader();
    texLoader.load('/resume_preview.png', (loadedTex) => {
      loadedTex.minFilter = THREE.LinearFilter;
      loadedTex.magFilter = THREE.LinearFilter;
      loadedTex.generateMipmaps = true;
      faceMaterial.map = loadedTex;
      faceMaterial.needsUpdate = true;
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: isHolo ? 0x221a10 : 0x091422,
      roughness: 0.35,
      metalness: 0.8,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      color: 0x060c18,
      roughness: 0.5,
      metalness: 0.3,
    });

    // Box materials: [right, left, top, bottom, front, back]
    const materials = [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      faceMaterial,
      backMaterial,
    ];

    const resumeMesh = new THREE.Mesh(geom, materials);
    scene.add(resumeMesh);

    // Glowing border outline
    const wireGeom = new THREE.EdgesGeometry(geom);
    const wireMat = new THREE.LineBasicMaterial({
      color: isHolo ? 0xffb84d : 0x52d6c8,
      transparent: true,
      opacity: 0.45,
    });
    const wireframe = new THREE.LineSegments(wireGeom, wireMat);
    resumeMesh.add(wireframe);

    // 3. Dynamic Laser Scanner Beam
    const scanGeom = new THREE.PlaneGeometry(slabW * 1.02, 0.07);
    const scanMat = new THREE.MeshBasicMaterial({
      color: isHolo ? 0xffb84d : 0x52d6c8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const scanMesh = new THREE.Mesh(scanGeom, scanMat);
    scanMesh.position.z = slabD / 2 + 0.01;
    resumeMesh.add(scanMesh);

    // Scanner Trail Glow
    const trailGeom = new THREE.PlaneGeometry(slabW * 1.02, 0.3);
    const trailMat = new THREE.MeshBasicMaterial({
      color: isHolo ? 0xffa028 : 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const trailMesh = new THREE.Mesh(trailGeom, trailMat);
    trailMesh.position.z = slabD / 2 + 0.008;
    resumeMesh.add(trailMesh);

    // 4. Orbiting Wireframe Polyhedra
    const orb1Geom = new THREE.IcosahedronGeometry(0.3, 0);
    const orb1Mat = new THREE.MeshBasicMaterial({
      color: 0x52d6c8,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const orb1 = new THREE.Mesh(orb1Geom, orb1Mat);
    scene.add(orb1);

    const orb2Geom = new THREE.OctahedronGeometry(0.24, 0);
    const orb2Mat = new THREE.MeshBasicMaterial({
      color: 0xffb84d,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const orb2 = new THREE.Mesh(orb2Geom, orb2Mat);
    scene.add(orb2);

    const ringGeom = new THREE.TorusGeometry(0.42, 0.018, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    scene.add(ring);

    // 5. Floating Star Dust Particles
    const particleCount = 140;
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 8.5;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 8.5;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: isHolo ? 0xffb84d : 0x52d6c8,
      size: 0.038,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0x223344, 1.4);
    scene.add(ambientLight);

    // Dynamic light tracking pointer
    const pointLight = new THREE.PointLight(isHolo ? 0xffd17a : 0x52d6c8, 3.5, 12);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    const warmLight = new THREE.PointLight(0xffa733, 1.8, 10);
    warmLight.position.set(3, -3, 3);
    scene.add(warmLight);

    // 7. Interactive Physics (Drag & Inertia)
    let isDown = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      setIsDragging(true);
      lastX = e.clientX;
      lastY = e.clientY;
      stateRef.current.vx = 0;
      stateRef.current.vy = 0;
      try {
        container.setPointerCapture(e.pointerId);
      } catch {}
      triggerBurst(e.clientX, e.clientY);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.pointerX = nx;
      stateRef.current.pointerY = ny;
      stateRef.current.isHovering = true;

      // Update light position for specular glint
      pointLight.position.x = nx * 3.5;
      pointLight.position.y = ny * 3.5;

      if (!isDown) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      stateRef.current.ry += dx * 0.009;
      stateRef.current.rx += dy * 0.009;
      stateRef.current.vy = dx * 0.009;
      stateRef.current.vx = dy * 0.009;
    };

    const onPointerUp = () => {
      isDown = false;
      setIsDragging(false);
    };

    const onPointerLeave = () => {
      stateRef.current.isHovering = false;
      isDown = false;
      setIsDragging(false);
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);

    // 8. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(0.05, clock.getDelta());
      const elapsed = clock.getElapsedTime();

      // Laser Scanner Animation
      const scanRange = slabH * 0.44;
      const scanY = Math.sin(elapsed * 1.8) * scanRange;
      scanMesh.position.y = scanY;
      trailMesh.position.y = scanY - 0.12 * Math.sign(Math.cos(elapsed * 1.8));

      // Orbiting Geometries
      orb1.position.x = Math.cos(elapsed * 0.9) * 2.5;
      orb1.position.y = Math.sin(elapsed * 0.7) * 2.2;
      orb1.position.z = Math.sin(elapsed * 0.9) * 1.4;
      orb1.rotation.x += 0.02;
      orb1.rotation.y += 0.03;

      orb2.position.x = Math.sin(-elapsed * 0.8) * 2.6;
      orb2.position.y = Math.cos(-elapsed * 0.6) * 2.0;
      orb2.position.z = Math.cos(-elapsed * 0.8) * 1.3;
      orb2.rotation.x -= 0.02;
      orb2.rotation.z += 0.03;

      ring.position.x = Math.sin(elapsed * 0.5) * 2.8;
      ring.position.y = -Math.cos(elapsed * 0.5) * 1.8;
      ring.position.z = Math.cos(elapsed * 0.5) * 1.1;
      ring.rotation.x = elapsed * 0.8;
      ring.rotation.y = elapsed * 0.4;

      // Particle subtle rotation
      particles.rotation.y = elapsed * 0.04;

      // Drag & Inertia
      if (!isDown) {
        if (stateRef.current.autoRotate && !prefersReducedMotion) {
          // Gentle floating holographic sway, always facing front
          const targetRy = Math.sin(elapsed * 0.75) * 0.22;
          const targetRx = 0.03 + Math.sin(elapsed * 0.5) * 0.04;
          stateRef.current.ry += (targetRy - stateRef.current.ry) * 0.04;
          stateRef.current.rx += (targetRx - stateRef.current.rx) * 0.04;
        } else if (stateRef.current.isHovering && !prefersReducedMotion) {
          // Subtle magnetic tilt towards cursor when hovering
          const targetRx = -stateRef.current.pointerY * 0.24;
          const targetRy = stateRef.current.pointerX * 0.3;
          stateRef.current.rx += (targetRx - stateRef.current.rx) * 0.08;
          stateRef.current.ry += (targetRy - stateRef.current.ry) * 0.08;
        } else {
          // Return smoothly to front when idle
          stateRef.current.rx += (0.02 - stateRef.current.rx) * 0.05;
          stateRef.current.ry += (0 - stateRef.current.ry) * 0.05;
        }
      }

      // Constrain vertical tilt to prevent unnatural flips
      stateRef.current.rx = Math.max(-0.65, Math.min(0.65, stateRef.current.rx));

      resumeMesh.rotation.x = stateRef.current.rx;
      resumeMesh.rotation.y = stateRef.current.ry;

      // Camera distance from zoom prop
      const targetZ = 7.7 / (stateRef.current.zoom || 1);
      camera.position.z += (targetZ - camera.position.z) * 0.1;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // 9. Resize Handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geom.dispose();
      texture.dispose();
      materials.forEach((m) => m.dispose());
      wireGeom.dispose();
      wireMat.dispose();
      scanGeom.dispose();
      scanMat.dispose();
      trailGeom.dispose();
      trailMat.dispose();
      orb1Geom.dispose();
      orb1Mat.dispose();
      orb2Geom.dispose();
      orb2Mat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      pGeom.dispose();
      pMat.dispose();
    };
  }, [drawResumeTexture, prefersReducedMotion, triggerBurst, mode]);

  // Method to trigger a reset animation
  const handleReset = () => {
    stateRef.current.rx = 0.02;
    stateRef.current.ry = 0;
    stateRef.current.vx = 0;
    stateRef.current.vy = 0;
    resetTriggerRef.current += 1;
    onResetView?.();
  };

  return (
    <div
      ref={mountRef}
      className={`resume-3d-canvas-wrap relative w-full h-[520px] sm:h-[580px] md:h-[640px] cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-xl border border-line bg-gradient-to-b from-[#060c18]/90 via-[#071120]/95 to-[#050a14]/90 backdrop-blur-md shadow-2xl transition-all ${
        isDragging ? 'cursor-grabbing scale-[1.008]' : ''
      }`}
      title="Click and drag to rotate the 3D Resume in space"
    >
      {/* 3D Viewport Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#091526]/80 border border-line backdrop-blur-md text-[11px] font-mono text-accent uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>3D Interactive Hologram</span>
        </div>

       
      </div>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none text-[11px] font-mono text-muted/75 px-3 py-1.5 rounded-md bg-[#091526]/60 backdrop-blur-sm border border-line/60">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent/60" />
          Drag to rotate 3D • Hover for specular glint
        </span>
        <span className="hidden sm:inline text-accent/80">60 FPS WebGL</span>
      </div>
    </div>
  );
};
