import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePortfolio } from '../context/PortfolioContext';

export const ThreeScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { effectiveMode, bursts, prefersReducedMotion } = usePortfolio();
  const effectiveModeRef = useRef(effectiveMode);
  effectiveModeRef.current = effectiveMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      if (canvas) canvas.hidden = true;
      return;
    }

    renderer.setClearColor(0x000000, 0);
    // Use up to 2.0 pixel ratio for maximum sharpness on modern displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
    camera.position.set(0, 0, 24);
    const TAN = Math.tan((camera.fov * Math.PI) / 360);

    const small = Math.min(window.innerWidth, window.innerHeight) < 600;
    const N = small ? 1400 : 2600;
    const X = 9.5;
    const Y = 5.8;
    const Z0 = -3.2;
    const Z1 = 2.2;

    const pos = new Float32Array(N * 6);
    const col = new Float32Array(N * 6);
    const hx = new Float32Array(N);
    const hy = new Float32Array(N);
    const hz = new Float32Array(N);
    const age = new Float32Array(N);
    const life = new Float32Array(N);

    function respawn(i: number, dom: number) {
      hx[i] = (Math.random() * 2 - 1) * X;
      hy[i] = (Math.random() * 2 - 1) * Y;
      hz[i] = Z0 + Math.random() * (Z1 - Z0);
      if (Math.random() < 0.6) {
        if (dom === 0) hx[i] = -X;
        else if (dom === 1) hy[i] = -Y;
      }
      age[i] = 0;
      life[i] = 4 + Math.random() * 6;
    }

    for (let i = 0; i < N; i++) {
      respawn(i, 2);
      age[i] = Math.random() * life[i];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const streaks = new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    streaks.frustumCulled = false;
    scene.add(streaks);

    const RAMPS = {
      wind: [
        [0, 0.16, 0.3, 0.8],
        [0.28, 0.1, 0.68, 0.82],
        [0.5, 0.32, 0.86, 0.56],
        [0.74, 0.96, 0.8, 0.3],
        [1, 0.96, 0.46, 0.3],
      ],
      solar: [
        [0, 0.3, 0.1, 0.04],
        [0.35, 0.8, 0.3, 0.06],
        [0.7, 0.98, 0.68, 0.14],
        [1, 1, 0.94, 0.6],
      ],
      demand: [
        [0, 0.22, 0.12, 0.55],
        [0.35, 0.52, 0.2, 0.85],
        [0.7, 0.93, 0.36, 0.68],
        [1, 1, 0.84, 0.35],
      ],
    };
    const NORM = { wind: 2.4, solar: 1.3, demand: 2.0 };
    const TINT = [
      [0.32, 0.84, 0.78],
      [0.96, 0.73, 0.29],
      [0.88, 0.44, 0.78],
    ];

    function ramp(stops: number[][], t: number, o: number[]) {
      let clamped = Math.max(0, Math.min(1, t));
      for (let k = 1; k < stops.length; k++) {
        if (clamped <= stops[k][0]) {
          const a = stops[k - 1];
          const b = stops[k];
          const f = (clamped - a[0]) / (b[0] - a[0]);
          o[0] = a[1] + (b[1] - a[1]) * f;
          o[1] = a[2] + (b[2] - a[2]) * f;
          o[2] = a[3] + (b[3] - a[3]) * f;
          return;
        }
      }
      const z = stops[stops.length - 1];
      o[0] = z[1];
      o[1] = z[2];
      o[2] = z[3];
    }

    // Globe Group
    const globe = new THREE.Group();
    scene.add(globe);
    const spin = new THREE.Group();
    globe.add(spin);

    const fadeMats: (THREE.Material & { userData: { base: number } })[] = [];
    function track<T extends THREE.Material>(m: T, base: number): T {
      (m as any).userData = { base };
      fadeMats.push(m as any);
      return m;
    }

    globe.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.985, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0x07101d })
      )
    );
    const haloMat = track(
      new THREE.MeshBasicMaterial({
        color: 0x52d6c8,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      0.08
    );
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(1.07, 48, 32), haloMat));

    function ll(lat: number, lon: number, r: number) {
      const la = (lat * Math.PI) / 180;
      const lo = (lon * Math.PI) / 180;
      return new THREE.Vector3(
        r * Math.cos(la) * Math.sin(lo),
        r * Math.sin(la),
        r * Math.cos(la) * Math.cos(lo)
      );
    }

    const dots: THREE.Vector3[] = [];
    for (let la = -82.5; la <= 82.5; la += 7.5) {
      const ls = Math.min(45, 7.5 / Math.max(0.2, Math.cos((la * Math.PI) / 180)));
      for (let lo = 0; lo < 360; lo += ls) dots.push(ll(la, lo, 1.0));
    }
    const dotMat = track(
      new THREE.PointsMaterial({
        color: 0x7fe3d8,
        size: 0.018,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      }),
      0.75
    );
    spin.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(dots), dotMat));

    const lineMat = track(
      new THREE.LineBasicMaterial({ color: 0x2f7aa6, transparent: true, opacity: 0.32 }),
      0.32
    );
    [-60, -30, 0, 30, 60].forEach((lat) => {
      const p: THREE.Vector3[] = [];
      for (let l = 0; l <= 360; l += 6) p.push(ll(lat, l, 1.001));
      spin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), lineMat));
    });
    for (let mer = 0; mer < 360; mer += 30) {
      const q: THREE.Vector3[] = [];
      for (let l2 = -90; l2 <= 90; l2 += 6) q.push(ll(l2, mer, 1.001));
      spin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(q), lineMat));
    }

    const home = ll(11.0168, 76.9558, 1);
    const targets = [ll(13.0827, 80.2707, 1), ll(19.076, 72.8777, 1), ll(28.6139, 77.209, 1)];
    const arcMat = track(
      new THREE.LineBasicMaterial({
        color: 0xf6b94b,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      0.7
    );

    targets.forEach((tg) => {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k < 41; k++) {
        const t = k / 40;
        pts.push(
          home
            .clone()
            .lerp(tg, t)
            .normalize()
            .multiplyScalar(1.002 + 0.16 * Math.sin(Math.PI * t))
        );
      }
      spin.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcMat));
      const d = new THREE.Mesh(
        new THREE.SphereGeometry(0.014, 10, 8),
        track(
          new THREE.MeshBasicMaterial({ color: 0xf6b94b, transparent: true, opacity: 0.9 }),
          0.9
        )
      );
      d.position.copy(tg.clone().multiplyScalar(1.004));
      spin.add(d);
    });

    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 14, 10),
      track(
        new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 1 }),
        1
      )
    );
    pin.position.copy(home.clone().multiplyScalar(1.004));
    spin.add(pin);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.04, 0.05, 48),
      new THREE.MeshBasicMaterial({
        color: 0xf6b94b,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ring.position.copy(home.clone().multiplyScalar(1.006));
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), home.clone().normalize());
    spin.add(ring);

    // Floating solids
    const shapes: {
      m: THREE.LineSegments;
      bx: number;
      by: number;
      z: number;
      d: number;
      rx: number;
      ry: number;
    }[] = [];
    const geos = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.8, 0.28, 8, 18),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.BoxGeometry(1.3, 1.3, 1.3),
    ];
    const NS = small ? 6 : 11;
    const shapeMats: THREE.LineBasicMaterial[] = [];

    for (let si = 0; si < NS; si++) {
      const front = si % 6 === 5;
      const mat = new THREE.LineBasicMaterial({
        color: 0x52d6c8,
        transparent: true,
        opacity: front ? 0.18 : 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      shapeMats.push(mat);
      const mesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(geos[si % geos.length]),
        mat
      );
      const depth = front ? 1 : Math.random() * 0.8;
      const z = front ? 3 + Math.random() : -1 - (1 - depth) * 8;
      const sc = front ? 0.5 : 0.35 + Math.random() * 0.7;
      mesh.scale.setScalar(sc);
      const s = {
        m: mesh,
        bx: (Math.random() * 2 - 1) * 9,
        by: (Math.random() * 2 - 1) * 6,
        z,
        d: depth,
        rx: (Math.random() - 0.5) * 0.8,
        ry: (Math.random() - 0.5) * 0.8,
      };
      mesh.position.set(s.bx, s.by, z);
      scene.add(mesh);
      shapes.push(s);
    }

    function wrapY(v: number) {
      const h = 6.8;
      return ((((v + h) % (2 * h)) + 2 * h) % (2 * h)) - h;
    }

    // Camera states per section (matching index.html)
    const ST = [
      { z: 10, gx: 0.2, gy: 0, gs: 1, sp: 1, roll: 0, go: 1 },
      { z: 8, gx: 0.32, gy: 0.08, gs: 1.25, sp: 1.7, roll: 0.05, go: 0.6 },
      { z: 12.5, gx: -0.3, gy: -0.05, gs: 0.85, sp: 0.8, roll: -0.05, go: 0.5 },
      { z: 9.5, gx: -0.3, gy: 0.08, gs: 1.15, sp: 1.2, roll: 0.03, go: 0.5 },
      { z: 8.2, gx: -0.15, gy: 0.04, gs: 1.25, sp: 1.5, roll: -0.02, go: 0.52 },
      { z: 6.8, gx: 0, gy: 0, gs: 1.35, sp: 2.1, roll: 0, go: 0.55 },
    ];
    const STM = [
      { z: 10, gx: 0, gy: 0.2, gs: 0.95, sp: 1, roll: 0, go: 0.9 },
      { z: 8.5, gx: 0, gy: 0.15, gs: 1.1, sp: 1.7, roll: 0.04, go: 0.35 },
      { z: 12, gx: 0, gy: 0.18, gs: 0.9, sp: 0.8, roll: -0.04, go: 0.3 },
      { z: 10, gx: 0, gy: 0.15, gs: 1, sp: 1.2, roll: 0.03, go: 0.3 },
      { z: 8.8, gx: 0, gy: 0.08, gs: 1.1, sp: 1.5, roll: -0.02, go: 0.35 },
      { z: 7.5, gx: 0, gy: 0, gs: 1.2, sp: 2, roll: 0, go: 0.4 },
    ];
    const KEYS: (keyof typeof ST[0])[] = ['z', 'gx', 'gy', 'gs', 'sp', 'roll', 'go'];

    const cur = prefersReducedMotion
      ? { z: 10, gx: 0.2, gy: 0, gs: 1, sp: 1, roll: 0, go: 1 }
      : { z: 24, gx: 0.2, gy: 0, gs: 0.05, sp: 1, roll: 0, go: 0 };
    const tg: Record<string, number> = {};

    let mobile = false;
    let R0 = 2.8;
    let vwc = 10;
    let vhc = 8;
    let T = 0;
    const mw = [1, 0, 0];
    const tmp = [0, 0, 0];
    let camX = 0;
    let camY = 0;
    let tiltX = 0.32;
    let tiltY = 0;
    let pulse = 0;
    let wmx = 99;
    let wmy = 99;
    let pmx = 99;
    let pmy = 99;
    const MI: Record<string, number> = { wind: 0, solar: 1, demand: 2 };
    const tint = new THREE.Color();

    // Globe drag interaction
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let globeVel = 0;
    let userOff = 0;
    let userTilt = 0;
    let idle = 0;

    const gz = document.getElementById('gzone');
    const onGzPointerDown = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      idle = 0;
      try {
        gz?.setPointerCapture(e.pointerId);
      } catch {}
      const h = gz?.querySelector('span');
      if (h) h.style.opacity = '0';
    };

    const onGzPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      userOff += dx * 0.009;
      userTilt = Math.max(-0.7, Math.min(0.7, userTilt + dy * 0.005));
      globeVel = Math.max(-9, Math.min(9, (dx * 0.009) / 0.016));
    };

    const onGzPointerUp = () => {
      dragging = false;
    };

    if (gz && !prefersReducedMotion) {
      gz.addEventListener('pointerdown', onGzPointerDown);
      gz.addEventListener('pointermove', onGzPointerMove);
      gz.addEventListener('pointerup', onGzPointerUp);
      gz.addEventListener('pointercancel', onGzPointerUp);
    }

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      mobile = camera.aspect <= 1.1;
      const vh10 = 2 * TAN * 10;
      const vw10 = vh10 * camera.aspect;
      R0 = mobile ? vw10 * 0.36 : Math.min(vh10 * 0.34, vw10 * 0.2);
    }

    resize();
    window.addEventListener('resize', resize);

    function stepParticles(dt: number, spd: number) {
      const curMode = effectiveModeRef.current;
      const kq = Math.min(1, dt * 6);
      const tgm = MI[curMode] ?? 0;

      for (let m = 0; m < 3; m++) {
        mw[m] += ((m === tgm ? 1 : 0) - mw[m]) * Math.min(1, dt * 2.2);
      }

      pmx += (wmx - pmx) * kq;
      pmy += (wmy - pmy) * kq;

      const w0 = mw[0];
      const w1 = mw[1];
      const w2 = mw[2];
      const dom = w0 >= w1 && w0 >= w2 ? 0 : w1 >= w2 ? 1 : 2;
      const sp = dt * spd;
      const tail = 0.18 * Math.min(2.4, spd);

      // Process shockwave bursts
      for (let b = bursts.length - 1; b >= 0; b--) {
        const bb = bursts[b];
        if (!bb.init) {
          bb.wx = camera.position.x + (bb.cx / window.innerWidth - 0.5) * vwc;
          bb.wy = camera.position.y - (bb.cy / window.innerHeight - 0.5) * vhc;
          bb.init = true;
          pulse = 1;
        }
        bb.t += dt;
        if (bb.t > 1.4) {
          bursts.splice(b, 1);
        }
      }

      for (let i = 0; i < N; i++) {
        let x = hx[i];
        let y = hy[i];
        let z = hz[i];
        let u = 0;
        let v = 0;
        let w = 0;

        if (w0 > 0.002) {
          u +=
            (1 +
              0.6 * Math.sin(y * 0.55 + T * 0.25) +
              0.3 * Math.sin(x * 0.3 + y * 0.4 - T * 0.2)) *
            w0;
          v += (0.5 * Math.sin(x * 0.45 + T * 0.3) + 0.3 * Math.cos(y * 0.8 - T * 0.15)) * w0;
          w += 0.12 * Math.sin(x * 0.3 + T * 0.2) * w0;
        }

        if (w1 > 0.002) {
          u += (0.28 * Math.sin(y * 0.6 + T * 0.3) + x * 0.03) * w1;
          v +=
            (0.55 +
              0.35 * Math.sin(x * 0.4 + T * 0.35) +
              0.15 * Math.cos(y * 0.5 - T * 0.2)) *
            w1;
          w += 0.1 * Math.cos(x * 0.3 - T * 0.25) * w1;
        }

        if (w2 > 0.002) {
          const r2 = x * x + y * y;
          const sw = 0.26 / (1 + r2 * 0.012);
          u += (-y * sw * 1.6 + 0.25 * Math.sin(x * 0.5 + T * 0.4)) * w2;
          v += (x * sw * 1.6 + 0.25 * Math.cos(y * 0.5 + T * 0.3)) * w2;
          w += 0.15 * Math.sin(r2 * 0.1 - T * 0.8) * w2;
        }

        const dx = x - pmx;
        const dy = y - pmy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12) {
          const fq = Math.exp(-d2 / 2.4) * 1.8;
          u += -dy * fq;
          v += dx * fq;
        }

        for (let q = 0; q < bursts.length; q++) {
          const bq = bursts[q];
          const bx = x - bq.wx;
          const by = y - bq.wy;
          const bd = Math.sqrt(bx * bx + by * by) + 0.001;
          const dd = bd - bq.t * 9;
          if (dd > -1.6 && dd < 1.6) {
            const g = Math.exp((-dd * dd) / 0.7) * (1.4 - bq.t) * 6;
            u += (bx / bd) * g;
            v += (by / bd) * g;
          }
        }

        x += u * sp;
        y += v * sp;
        z += w * sp;
        age[i] += dt;

        if (
          x > X ||
          x < -X - 1 ||
          y > Y + 0.5 ||
          y < -Y - 0.5 ||
          z > Z1 ||
          z < Z0 ||
          age[i] > life[i]
        ) {
          respawn(i, dom);
          x = hx[i];
          y = hy[i];
          z = hz[i];
        } else {
          hx[i] = x;
          hy[i] = y;
          hz[i] = z;
        }

        const s = Math.sqrt(u * u + v * v);
        let cr = 0;
        let cg = 0;
        let cb = 0;

        if (w0 > 0.002) {
          ramp(RAMPS.wind, s / NORM.wind, tmp);
          cr += tmp[0] * w0;
          cg += tmp[1] * w0;
          cb += tmp[2] * w0;
        }
        if (w1 > 0.002) {
          ramp(RAMPS.solar, s / NORM.solar, tmp);
          cr += tmp[0] * w1;
          cg += tmp[1] * w1;
          cb += tmp[2] * w1;
        }
        if (w2 > 0.002) {
          ramp(RAMPS.demand, s / NORM.demand, tmp);
          cr += tmp[0] * w2;
          cg += tmp[1] * w2;
          cb += tmp[2] * w2;
        }

        const fade = Math.min(1, age[i] * 1.5, Math.max(0, (life[i] - age[i]) * 1.5));
        const br = 0.52 * fade;
        const o = i * 6;

        pos[o] = x;
        pos[o + 1] = y;
        pos[o + 2] = z;
        pos[o + 3] = x - u * tail;
        pos[o + 4] = y - v * tail;
        pos[o + 5] = z - w * tail;

        col[o] = cr * br;
        col[o + 1] = cg * br;
        col[o + 2] = cb * br;
        col[o + 3] = cr * br * 0.08;
        col[o + 4] = cg * br * 0.08;
        col[o + 5] = cb * br * 0.08;
      }

      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    }

    let animFrameId: number;
    let lastTime = performance.now();
    let scrollY = window.scrollY;
    let scrollVel = 0;
    let nx = 0;
    let ny = 0;
    let px = -1;
    let py = -1;

    const onPointerMoveGlobal = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      nx = e.clientX / window.innerWidth - 0.5;
      ny = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onPointerMoveGlobal, { passive: true });

    // In original index.html, secEls are [hero, work, experience, skills, contact]
    const secIds = ['hero', 'work', 'experience', 'skills', 'resume', 'contact'];

    function getSecFrac() {
      const mid = window.innerHeight * 0.5;
      const centers = secIds.map((id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      if (mid < centers[0]) return 0;
      for (let i = 0; i < centers.length - 1; i++) {
        if (mid >= centers[i] && mid < centers[i + 1]) {
          const t = (mid - centers[i]) / (centers[i + 1] - centers[i]);
          return i + t * t * (3 - 2 * t);
        }
      }
      return centers.length - 1;
    }

    function animate(now: number) {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      T += dt;

      const y = window.scrollY;
      scrollVel += ((y - scrollY) / dt - scrollVel) * Math.min(1, dt * 8);
      scrollY = y;

      const secF = getSecFrac();

      const arr = mobile ? STM : ST;
      const f = Math.max(0, Math.min(arr.length - 1, secF));
      const i0 = Math.min(arr.length - 2, Math.floor(f));
      const t = f - i0;

      KEYS.forEach((k) => {
        tg[k] = arr[i0][k] + (arr[i0 + 1][k] - arr[i0][k]) * t;
      });

      const kd = prefersReducedMotion ? 1 : 1 - Math.exp(-dt * 2.8);
      KEYS.forEach((k) => {
        cur[k] += (tg[k] - cur[k]) * kd;
      });

      const kc = Math.min(1, dt * 3);
      camX += (nx * 0.9 - camX) * kc;
      camY += (-ny * 0.5 - camY) * kc;
      camera.position.set(camX, camY, cur.z);
      camera.rotation.z = cur.roll + Math.sin(T * 0.25) * 0.008;

      vhc = 2 * TAN * cur.z;
      vwc = vhc * camera.aspect;
      wmx = px < 0 ? 99 : camX + nx * vwc;
      wmy = px < 0 ? 99 : camY - ny * vhc;

      const warp = prefersReducedMotion ? 1 : 1 + 5 * Math.exp(-T * 1.5);
      const spd = 0.9 * cur.sp * warp * (1 + Math.min(2.5, Math.abs(scrollVel) / 1800));
      stepParticles(dt, spd);

      // Globe updates
      const gk = Math.min(1, dt * 4);
      const targetTiltY = 0.32 + ny * 0.3 + userTilt;
      const targetYaw = nx * 0.35;
      tiltX += (targetTiltY - tiltX) * gk;
      tiltY += (targetYaw - tiltY) * gk;
      globe.rotation.x = tiltX;
      globe.rotation.y = tiltY;
      globe.rotation.z = -0.12;

      pulse *= Math.exp(-dt * 3);
      const R = R0 * cur.gs * (1 + 0.07 * pulse);
      globe.scale.setScalar(R);
      globe.position.set(camX * 0.3 + cur.gx * vwc, camY * 0.3 + cur.gy * vhc, 0);

      if (!dragging) {
        userOff += globeVel * dt;
        globeVel *= Math.exp(-dt * 2.2);
        idle += dt;
        if (idle > 3.5) {
          const d = Math.exp(-dt * 0.8);
          userOff *= d;
          userTilt *= d;
        }
      } else {
        idle = 0;
      }
      spin.rotation.y =
        (-77 * Math.PI) / 180 + Math.sin(T * 0.12) * 0.35 + secF * 0.4 + userOff;

      const gf = cur.go;
      for (let m = 0; m < fadeMats.length; m++) {
        fadeMats[m].opacity = fadeMats[m].userData.base * gf;
      }
      const ph = (T * 0.6) % 1;
      ring.scale.setScalar(0.8 + ph * 2.4);
      ring.material.opacity = 0.8 * (1 - ph) * gf;

      // Color tints
      let tr = 0;
      let tgc = 0;
      let tb = 0;
      for (let q = 0; q < 3; q++) {
        tr += TINT[q][0] * mw[q];
        tgc += TINT[q][1] * mw[q];
        tb += TINT[q][2] * mw[q];
      }
      tint.setRGB(tr, tgc, tb);
      dotMat.color.copy(tint);
      haloMat.color.copy(tint);
      for (let sm = 0; sm < shapeMats.length; sm++) {
        shapeMats[sm].color.copy(tint);
      }

      // Floating wireframe solids parallax
      const sy = scrollY / Math.max(1, window.innerHeight);
      for (let s = 0; s < shapes.length; s++) {
        const sh = shapes[s];
        const mm = sh.m;
        mm.position.x = sh.bx + nx * sh.d * 1.8;
        mm.position.y = wrapY(sh.by + sy * (1.2 + 2.4 * sh.d));
        mm.rotation.x += sh.rx * dt * (1 + Math.abs(scrollVel) / 900);
        mm.rotation.y += sh.ry * dt * (1 + Math.abs(scrollVel) / 900);
      }

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    }

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMoveGlobal);
      if (gz) {
        gz.removeEventListener('pointerdown', onGzPointerDown);
        gz.removeEventListener('pointermove', onGzPointerMove);
        gz.removeEventListener('pointerup', onGzPointerUp);
        gz.removeEventListener('pointercancel', onGzPointerUp);
      }
      renderer.dispose();
    };
  }, [prefersReducedMotion, bursts]);

  return <canvas ref={canvasRef} id="scene" aria-hidden="true" />;
};
