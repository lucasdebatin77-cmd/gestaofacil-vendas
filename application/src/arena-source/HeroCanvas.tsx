"use client";

import { useEffect, useRef } from "react";

const STOPS: [number, string][] = [
  [0, "#22d3ee"],
  [0.28, "#6366f1"],
  [0.52, "#a855f7"],
  [0.76, "#ec4899"],
  [1, "#fb923c"],
];
const MOTE_COLORS = ["#7dd3fc", "#c4b5fd", "#f9a8d4", "#fdba74", "#ffffff"];

type Strand = { off: number; alpha: number; width: number };
type Ribbon = {
  base: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  strands: Strand[];
};
type Mote = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  tw: number;
  z: number;
  c: string;
};

export default function HeroCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const small = window.matchMedia("(max-width: 767px)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let mx = 0;
    let my = 0;
    let cmx = 0;
    let cmy = 0;
    let grad: CanvasGradient | null = null;
    let motes: Mote[] = [];

    const ribbons: Ribbon[] = Array.from({ length: small ? 3 : 5 }, (_, i) => ({
      base: 0.5 + i * 0.05,
      amp: 0.06 + i * 0.012,
      freq: 0.0014 + i * 0.00026,
      speed: 0.00042 + i * 0.00007,
      phase: i * 1.9,
      strands: Array.from({ length: small ? 7 : 13 }, (_, k) => ({
        off: (k - 6) * 2.4,
        alpha: 0.1 + Math.random() * 0.24,
        width: 0.6 + Math.random() * 0.9,
      })),
    }));

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      cmx += (mx - cmx) * 0.05;
      cmy += (my - cmy) * 0.05;

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      if (grad) ctx.strokeStyle = grad;

      ribbons.forEach((rb, ri) => {
        const depth = 1 + ri * 0.35;
        rb.strands.forEach((s) => {
          ctx.globalAlpha = s.alpha;
          ctx.lineWidth = s.width;
          ctx.beginPath();
          for (let x = -20; x <= w + 20; x += 10) {
            const a = x * rb.freq + cmx * 0.5 * depth;
            const wave =
              Math.sin(a + t * rb.speed + rb.phase) * 0.7 +
              Math.sin(a * 2.1 - t * rb.speed * 1.3 + rb.phase * 2) * 0.3;
            const fan =
              s.off *
              (1 +
                0.9 *
                  Math.sin(x * rb.freq * 0.7 + t * rb.speed * 0.5 + rb.phase));
            const y = h * rb.base + h * rb.amp * wave + fan + cmy * 12 * depth;
            if (x === -20) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      });

      motes.forEach((m) => {
        m.y -= m.vy * dt;
        m.x += m.vx * dt + Math.sin(t * 0.0005 + m.tw) * 0.06;
        if (m.y < -8) {
          m.y = h + 8;
          m.x = Math.random() * w;
        }
        if (m.x < -8) m.x = w + 8;
        if (m.x > w + 8) m.x = -8;
        const twinkle =
          0.35 + 0.65 * Math.abs(Math.sin(t * 0.0012 * m.z + m.tw));
        ctx.globalAlpha = twinkle * 0.85;
        ctx.fillStyle = m.c;
        ctx.beginPath();
        ctx.arc(m.x + cmx * 14 * m.z, m.y + cmy * 9 * m.z, m.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const g = ctx.createLinearGradient(0, 0, w, 0);
      STOPS.forEach(([offset, color]) => g.addColorStop(offset, color));
      grad = g;

      motes = Array.from({ length: small ? 26 : 70 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.6,
        vy: 0.008 + Math.random() * 0.03,
        vx: (Math.random() - 0.5) * 0.008,
        tw: Math.random() * 6.28,
        z: 0.4 + Math.random() * 1.2,
        c: MOTE_COLORS[Math.floor(Math.random() * MOTE_COLORS.length)],
      }));

      if (reduce) draw(4200, 16);
    };

    const loop = (now: number) => {
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduce) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      {
        threshold: 0,
      },
    );
    io.observe(canvas);
    if (!reduce)
      window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full mix-blend-screen ${className}`}
    />
  );
}
