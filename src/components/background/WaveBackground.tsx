"use client";

import * as React from "react";

type Props = {
  /** Lower = subtler. Recommended 0.35–0.7 */
  intensity?: number;
  /** Overall opacity of waves */
  opacity?: number;
};

export default function WaveBackground({ intensity = 0.55, opacity = 0.22 }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // DPR
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse state (smoothed)
    let mx = window.innerWidth * 0.5;
    let my = window.innerHeight * 0.45;
    let tx = mx;
    let ty = my;

    // Resize
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });

    let t = 0;

    // Utility: clamp
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    // Draw loop
    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Smooth mouse (inertia)
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;

      t += 0.008;

      ctx.clearRect(0, 0, w, h);

      const dark = document.documentElement.classList.contains("dark");

      // Antigravity-ish palette (very subtle)
      const c1 = dark ? "rgba(120, 170, 255, 0.10)" : "rgba(90, 145, 255, 0.10)";
      const c2 = dark ? "rgba(180, 120, 255, 0.08)" : "rgba(165, 110, 255, 0.08)";
      const c3 = dark ? "rgba(110, 255, 200, 0.06)" : "rgba(80, 220, 200, 0.06)";

      // Mouse influence center & strength
      const cx = mx;
      const cy = my;
      const influence = clamp(intensity, 0.2, 1.2);

      // Layers (depth)
      const layers = [
        { color: c1, amp: 22, freq: 0.010, speed: 0.9, blur: 0.0 },
        { color: c2, amp: 16, freq: 0.012, speed: 0.7, blur: 0.0 },
        { color: c3, amp: 12, freq: 0.014, speed: 0.55, blur: 0.0 },
      ];

      ctx.globalAlpha = opacity;

      // Draw as horizontal strips (fast & smooth)
      for (let li = 0; li < layers.length; li++) {
        const L = layers[li];

        ctx.fillStyle = L.color;

        // Step size controls quality/perf
        const yStep = 3;
        for (let y = 0; y <= h; y += yStep) {
          const dy = y - cy;
          const falloff = Math.exp(-(dy * dy) / (2 * (h * 0.18) * (h * 0.18))); // gaussian-ish
          const mouseTerm = (cx / w - 0.5) * 60 * falloff * influence;

          // layered sine “noise”
          const base =
            Math.sin(y * L.freq + t * L.speed) * L.amp +
            Math.sin(y * (L.freq * 1.6) + t * (L.speed * 1.2) + 2.1) * (L.amp * 0.45) +
            Math.sin(y * (L.freq * 2.3) + t * (L.speed * 1.7) + 4.2) * (L.amp * 0.25);

          const xOffset = base + mouseTerm;

          // Draw a soft band (centered)
          const bandW = w * 0.9;
          const x = (w - bandW) / 2 + xOffset * (1 + li * 0.25);

          ctx.fillRect(x, y, bandW, 1.6);
        }
      }

      // Add a subtle vignette for premium feel (theme-aware)
      ctx.globalAlpha = dark ? 0.22 : 0.18;
      const grd = ctx.createRadialGradient(w * 0.5, h * 0.35, 80, w * 0.5, h * 0.35, Math.max(w, h));
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = 1;
      rafRef.current = window.requestAnimationFrame(draw);
    };

    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [intensity, opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}
