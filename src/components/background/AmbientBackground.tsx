"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * Master switch for the ambient dot field.
 *
 * Turned off so the authenticated pages sit on the plain `--background`
 * surface. Nothing below has been removed, flip this back to `true` to
 * restore the particle field exactly as it was.
 */
const ENABLED = false;

/**
 * App-wide ambient background, two layers of tiny dots.
 * The bottom layer moves slowly with the mouse direction,
 * and the upper layer moves faster, creating a parallax effect.
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

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX - window.innerWidth / 2;
      targetY = e.clientY - window.innerHeight / 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots(); // Re-initialize to cover new bounds
    }

    const layer1: { x: number; y: number; r: number; alpha: number }[] = [];
    const layer2: { x: number; y: number; r: number; alpha: number }[] = [];

    const L1_COUNT = 1800; // Increased dot count for bottom layer
    const L2_COUNT = 400; // Keep top layer count as is

    // Extra padding around the screen to ensure dots don't vanish immediately when wrapping
    const PADDING = 300;

    const initDots = () => {
      if (!canvas) return;
      layer1.length = 0;
      layer2.length = 0;

      // Helper to split brightness 50/50: half low-bright, half high-bright
      const getAlpha = (i: number, total: number) => {
        const isHighBright = i >= total / 2;
        return isHighBright
          ? Math.random() * 0.3 + 0.5 // High bright: 0.5 to 0.8
          : Math.random() * 0.2 + 0.1; // Less bright: 0.1 to 0.3
      };

      for (let i = 0; i < L1_COUNT; i++) {
        layer1.push({
          x: Math.random() * (canvas.width + PADDING * 2) - PADDING,
          y: Math.random() * (canvas.height + PADDING * 2) - PADDING,
          r: Math.random() * 1.2 + 0.5,
          alpha: getAlpha(i, L1_COUNT),
        });
      }
      for (let i = 0; i < L2_COUNT; i++) {
        layer2.push({
          x: Math.random() * (canvas.width + PADDING * 2) - PADDING,
          y: Math.random() * (canvas.height + PADDING * 2) - PADDING,
          r: Math.random() * 1.8 + 1,
          alpha: getAlpha(i, L2_COUNT),
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const dotColor = (a: number) => (isDark ? `rgba(167,139,250,${a})` : `rgba(109,40,217,${a})`);

    let driftY = 0;
    let driftX = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoothly interpolate towards mouse target
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Add a tiny constant drift to keep the background alive when the mouse is still
      driftY -= 0.1;
      driftX -= 0.05;

      // Draw Layer 1 (Bottom, moves slower)
      const l1_offsetX = mouseX * 0.126 + driftX * 0.5;
      const l1_offsetY = mouseY * 0.126 + driftY * 0.5;

      for (const p of layer1) {
        let px = p.x + l1_offsetX;
        let py = p.y + l1_offsetY;

        px = ((px + PADDING) % (canvas.width + PADDING * 2));
        if (px < 0) px += (canvas.width + PADDING * 2);
        px -= PADDING;

        py = ((py + PADDING) % (canvas.height + PADDING * 2));
        if (py < 0) py += (canvas.height + PADDING * 2);
        py -= PADDING;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor(p.alpha);
        ctx.fill();
      }

      // Draw Layer 2 (Top, moves faster)
      const l2_offsetX = mouseX * 0.18 + driftX;
      const l2_offsetY = mouseY * 0.18 + driftY;

      for (const p of layer2) {
        let px = p.x + l2_offsetX;
        let py = p.y + l2_offsetY;

        px = ((px + PADDING) % (canvas.width + PADDING * 2));
        if (px < 0) px += (canvas.width + PADDING * 2);
        px -= PADDING;

        py = ((py + PADDING) % (canvas.height + PADDING * 2));
        if (py < 0) py += (canvas.height + PADDING * 2);
        py -= PADDING;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor(p.alpha);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mounted, resolvedTheme]);

  // Placed after every hook so the hook order stays constant, an early return
  // above them would break the rules of hooks. With no canvas rendered, the
  // effect above bails at its `if (!canvas) return` guard before attaching any
  // listener or starting the animation frame loop, so nothing keeps running.
  if (!ENABLED) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  );
}
