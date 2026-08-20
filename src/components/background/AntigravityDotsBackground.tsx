"use client";

import * as React from "react";

type Props = {
  className?: string;

  /** distance between grid points (bigger = fewer dots) */
  dotSpacing?: number;

  /** dot radius in px */
  dotRadius?: number;

  /** base alpha (overall transparency) */
  dotAlpha?: number;

  /** cursor strength (bigger = stronger “hive”) */
  intensity?: number;

  /** radius around cursor that wakes up the dots */
  influenceRadius?: number;

  /** how many dots are visible when cursor is FAR (0.02, 0.12 is typical) */
  baseVisibility?: number;

  /** how many blue accent dots (0, 0.35). Higher = more blue pop near cursor */
  blueBoost?: number;
};

type Pt = {
  x0: number;
  y0: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  seed: number;
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export default function AntigravityDotsBackground({
  className,
  dotSpacing = 18,
  dotRadius = 0.9,
  dotAlpha = 0.22,
  intensity = 1.15,
  influenceRadius = 280,
  baseVisibility = 0.06,
  blueBoost = 0.22,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ptsRef = React.useRef<Pt[]>([]);
  const rafRef = React.useRef<number | null>(null);

  const pointerRef = React.useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
  });

  // Build grid points
  const rebuild = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = parent.clientWidth;
    const h = parent.clientHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const pts: Pt[] = [];
    const step = dotSpacing;

    // staggered grid for nicer “organic” look
    let row = 0;
    for (let y = step; y < h - step; y += step) {
      const offset = (row % 2) * (step * 0.5);
      for (let x = step; x < w - step; x += step) {
        const xx = x + offset;
        const seed = (Math.sin(xx * 12.9898 + y * 78.233) * 43758.5453) % 1;
        pts.push({
          x0: xx,
          y0: y,
          x: xx,
          y: y,
          vx: 0,
          vy: 0,
          seed: seed < 0 ? -seed : seed,
        });
      }
      row++;
    }

    ptsRef.current = pts;
  }, [dotSpacing]);

  React.useEffect(() => {
    rebuild();
    const onResize = () => rebuild();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [rebuild]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      pointerRef.current.tx = e.clientX - r.left;
      pointerRef.current.ty = e.clientY - r.top;
      pointerRef.current.active = true;
    };

    const onLeave = () => {
      pointerRef.current.active = false;
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);






  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const c = canvasRef.current;
      const context = c?.getContext("2d");
      if (!c || !context) return;

      const parent = c.parentElement;
      if (!parent) return;

      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = parent.clientWidth;
      const h = parent.clientHeight;

      // Smooth pointer
      const p = pointerRef.current;
      p.x += (p.tx - p.x) * 0.12;
      p.y += (p.ty - p.y) * 0.12;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, w, h);

      // Theme-aware colors (no DOM reads every frame)
      // We use computed “dark” by checking documentElement class.
      const isDark = document.documentElement.classList.contains("dark");

      // Very subtle base color, blue accent near cursor.
      const base = isDark ? "rgba(255,255,255," : "rgba(15,23,42,"; // slate-ish
      const blue = isDark ? "rgba(96,165,250," : "rgba(59,130,246,"; // sky/blue

      const pts = ptsRef.current;
      const R = influenceRadius;
      const R2 = R * R;

      // Physics params (tuned to feel like “hive”)
      const spring = 0.055;
      const damping = 0.82;
      const repel = 0.65 * intensity;

      // Dots: sparse far away, wake up near cursor
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];

        const dx = pt.x - p.x;
        const dy = pt.y - p.y;
        const d2 = dx * dx + dy * dy;

        // far away: most points should be invisible
        const farVisible = pt.seed < baseVisibility;

        // near cursor: visibility increases
        const t = d2 < R2 ? 1 - d2 / R2 : 0; // 0..1
        const visible = farVisible || t > 0.02;

        // Apply “hive” force only when near cursor & pointer active
        if (p.active && t > 0) {
          const d = Math.sqrt(d2) + 0.001;
          const ux = dx / d;
          const uy = dy / d;

          // small repulsion + swirl (gives that antigravity motion)
          const swirl = 0.35 * intensity * t;
          const fx = (-ux * repel * t) + (-uy * swirl);
          const fy = (-uy * repel * t) + (ux * swirl);

          pt.vx += fx;
          pt.vy += fy;
        }

        // Spring back to original grid position
        pt.vx += (pt.x0 - pt.x) * spring;
        pt.vy += (pt.y0 - pt.y) * spring;

        pt.vx *= damping;
        pt.vy *= damping;

        pt.x += pt.vx;
        pt.y += pt.vy;

        if (!visible) continue;

        // Alpha:
        // - far dots are faint
        // - near dots become more visible
        const a =
          dotAlpha * (farVisible ? 0.35 : 0.0) +
          dotAlpha * (0.9 * t);

        const alpha = clamp(a, 0.02, 0.28);

        // Blue accent: only near cursor + some random dots
        const blueChance = blueBoost * t;
        const useBlue = pt.seed < blueChance;

        context.beginPath();
        context.fillStyle = (useBlue ? blue : base) + `${alpha})`;
        context.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
        context.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dotAlpha, dotRadius, intensity, influenceRadius, baseVisibility, blueBoost]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}


// "use client";

// import * as React from "react";

// type Props = {
//   className?: string;

//   /** distance between grid points (bigger = fewer dots) */
//   dotSpacing?: number;

//   /** dot radius in px */
//   dotRadius?: number;

//   /** base alpha (overall transparency) */
//   dotAlpha?: number;

//   /** cursor strength (bigger = stronger “hive”) */
//   intensity?: number;

//   /** radius around cursor that wakes up the dots */
//   influenceRadius?: number;

//   /** how many dots are visible when cursor is FAR (0.02, 0.12 is typical) */
//   baseVisibility?: number;

//   /** how many blue accent dots (0, 0.35). Higher = more blue pop near cursor */
//   blueBoost?: number;
// };

// type Pt = {
//   x0: number;
//   y0: number;
//   x: number;
//   y: number;
//   vx: number;
//   vy: number;
//   seed: number;
// };

// function clamp(v: number, a: number, b: number) {
//   return Math.max(a, Math.min(b, v));
// }

// export default function AntigravityDotsBackground({
//   className,
//   dotSpacing = 18,
//   dotRadius = 0.9,
//   dotAlpha = 0.22,
//   intensity = 1.15,
//   influenceRadius = 280,
//   baseVisibility = 0.06,
//   blueBoost = 0.22,
// }: Props) {
//   const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
//   const ptsRef = React.useRef<Pt[]>([]);
//   const rafRef = React.useRef<number | null>(null);

//   const pointerRef = React.useRef({
//     x: 0,
//     y: 0,
//     tx: 0,
//     ty: 0,
//     active: false,
//   });

//   // Build grid points
//   const rebuild = React.useCallback(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const parent = canvas.parentElement;
//     if (!parent) return;

//     const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
//     const w = parent.clientWidth;
//     const h = parent.clientHeight;

//     canvas.width = Math.floor(w * dpr);
//     canvas.height = Math.floor(h * dpr);
//     canvas.style.width = `${w}px`;
//     canvas.style.height = `${h}px`;

//     const pts: Pt[] = [];
//     const step = dotSpacing;

//     // staggered grid for nicer “organic” look
//     let row = 0;
//     for (let y = step; y < h - step; y += step) {
//       const offset = (row % 2) * (step * 0.5);
//       for (let x = step; x < w - step; x += step) {
//         const xx = x + offset;
//         const seed = (Math.sin(xx * 12.9898 + y * 78.233) * 43758.5453) % 1;

//         pts.push({
//           x0: xx,
//           y0: y,
//           x: xx,
//           y: y,
//           vx: 0,
//           vy: 0,
//           seed: seed < 0 ? -seed : seed,
//         });
//       }
//       row++;
//     }

//     ptsRef.current = pts;
//   }, [dotSpacing]);

//   React.useEffect(() => {
//     rebuild();
//     const onResize = () => rebuild();
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, [rebuild]);

//   // ✅ FIX: remove "any" and properly remove listeners
//   React.useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const parent = canvas.parentElement;
//     if (!parent) return;

//     const onMove = (e: PointerEvent) => {
//       const r = parent.getBoundingClientRect();
//       pointerRef.current.tx = e.clientX - r.left;
//       pointerRef.current.ty = e.clientY - r.top;
//       pointerRef.current.active = true;
//     };

//     const onLeave = () => {
//       pointerRef.current.active = false;
//     };

//     parent.addEventListener("pointermove", onMove, { passive: true });
//     parent.addEventListener("pointerleave", onLeave);

//     return () => {
//       parent.removeEventListener("pointermove", onMove);
//       parent.removeEventListener("pointerleave", onLeave);
//     };
//   }, []);

//   React.useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const draw = () => {
//       const c = canvasRef.current;
//       const context = c?.getContext("2d");
//       if (!c || !context) return;

//       const parent = c.parentElement;
//       if (!parent) return;

//       const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
//       const w = parent.clientWidth;
//       const h = parent.clientHeight;

//       // Smooth pointer
//       const p = pointerRef.current;
//       p.x += (p.tx - p.x) * 0.12;
//       p.y += (p.ty - p.y) * 0.12;

//       context.setTransform(dpr, 0, 0, dpr, 0, 0);
//       context.clearRect(0, 0, w, h);

//       const isDark = document.documentElement.classList.contains("dark");

//       // Very subtle base color, blue accent near cursor.
//       const base = isDark ? "rgba(255,255,255," : "rgba(15,23,42,";
//       const blue = isDark ? "rgba(96,165,250," : "rgba(59,130,246,";

//       const pts = ptsRef.current;
//       const R = influenceRadius;
//       const R2 = R * R;

//       // Physics params
//       const spring = 0.055;
//       const damping = 0.82;
//       const repel = 0.65 * intensity;

//       for (let i = 0; i < pts.length; i++) {
//         const pt = pts[i];

//         const dx = pt.x - p.x;
//         const dy = pt.y - p.y;
//         const d2 = dx * dx + dy * dy;

//         const farVisible = pt.seed < baseVisibility;
//         const t = d2 < R2 ? 1 - d2 / R2 : 0;
//         const visible = farVisible || t > 0.02;

//         if (p.active && t > 0) {
//           const d = Math.sqrt(d2) + 0.001;
//           const ux = dx / d;
//           const uy = dy / d;

//           const swirl = 0.35 * intensity * t;
//           const fx = -ux * repel * t + -uy * swirl;
//           const fy = -uy * repel * t + ux * swirl;

//           pt.vx += fx;
//           pt.vy += fy;
//         }

//         // Spring back
//         pt.vx += (pt.x0 - pt.x) * spring;
//         pt.vy += (pt.y0 - pt.y) * spring;

//         pt.vx *= damping;
//         pt.vy *= damping;

//         pt.x += pt.vx;
//         pt.y += pt.vy;

//         if (!visible) continue;

//         const a = dotAlpha * (farVisible ? 0.35 : 0.0) + dotAlpha * (0.9 * t);
//         const alpha = clamp(a, 0.02, 0.28);

//         const blueChance = blueBoost * t;
//         const useBlue = pt.seed < blueChance;

//         context.beginPath();
//         context.fillStyle = (useBlue ? blue : base) + `${alpha})`;
//         context.arc(pt.x, pt.y, dotRadius, 0, Math.PI * 2);
//         context.fill();
//       }

//       rafRef.current = requestAnimationFrame(draw);
//     };

//     rafRef.current = requestAnimationFrame(draw);
//     return () => {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     };
//   }, [dotAlpha, dotRadius, intensity, influenceRadius, baseVisibility, blueBoost]);

//   return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
// }
