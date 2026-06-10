"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * App-wide ambient background — the floating particle + connection field from
 * the admin dashboard, promoted to a reusable global layer. Renders in BOTH
 * light and dark themes and re-tints live when the theme toggles.
 *
 * Mounted behind page content (fixed, pointer-events-none). The login page
 * keeps its own unique background and does NOT use this.
 */
export default function AmbientBackground() {
  const { resolvedTheme } = useTheme();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme === "dark";
    let raf = 0;

    const particles: {
      x: number; y: number; r: number;
      vx: number; vy: number; alpha: number; va: number;
    }[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 100;
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.6 + 0.1,
        va: (Math.random() - 0.5) * 0.002,
      });
    }

    // Violet field — brighter on OLED black, deeper/softer on white.
    const dot = (a: number) => (isDark ? `rgba(167,139,250,${a * 1.5})` : `rgba(109,40,217,${a * 1.2})`);
    const line = (a: number) => (isDark ? `rgba(167,139,250,${a})` : `rgba(109,40,217,${a * 0.8})`);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0.05, Math.min(0.5, p.alpha + p.va));
        if (p.alpha <= 0.05 || p.alpha >= 0.5) p.va *= -1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dot(p.alpha);
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            const a = (1 - d / 110) * (isDark ? 0.25 : 0.2);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = line(a);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [mounted, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
