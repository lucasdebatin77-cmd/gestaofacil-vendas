"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import HeroCanvas from "./HeroCanvas";
import HeroPrism from "./HeroPrism";
import HeroHud from "./HeroHud";
import MagneticButton from "./MagneticButton";

const v = (o: Record<string, string>) => o as CSSProperties;

const WORDS: { t: string; cls?: string }[] = [
  { t: "Sua" },
  { t: "operação" },
  { t: "comercial," },
  { t: "unificada", cls: "text-gradient" },
  { t: "e" },
  { t: "inteligente.", cls: "text-gradient-ai" },
];

const PILLARS = [
  { n: "01", label: "Marketplace" },
  { n: "02", label: "SaaS Comercial" },
  { n: "03", label: "Inteligência" },
];

export default function Hero({
  count,
  onEnter,
  goTo,
  isSignedIn,
}: {
  count: number;
  onEnter: () => void;
  goTo: (id: string) => void;
  isSignedIn: boolean;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Depth: pointer parallax + scroll-out, driven by CSS variables on the hero root.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let visible = true;

    const loop = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      hero.style.setProperty("--px", cx.toFixed(4));
      hero.style.setProperty("--py", cy.toFixed(4));
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      hero.style.setProperty("--sx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--sy", `${e.clientY - r.top}px`);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    const onScroll = () => {
      const p = Math.min(
        1,
        Math.max(0, window.scrollY / (hero.offsetHeight * 0.85)),
      );
      hero.style.setProperty("--sp", p.toFixed(4));
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(hero);

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(loop);
    onScroll();

    return () => {
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="top"
      ref={heroRef}
      className={`hero relative isolate min-h-[100svh] overflow-hidden ${ready ? "ready" : ""}`}
    >
      {/* L0 — cinematic stage with camera push-in */}
      <div className="hero-push absolute inset-0">
        <div className="hero-scrollscale absolute inset-0">
          <div
            className="hero-layer absolute -inset-[4%]"
            style={v({ "--dx": "-16px", "--dy": "-10px" })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/resources/arena/hero-stage.jpg"
              alt=""
              className="h-full w-full object-cover object-[50%_58%]"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>

      {/* L1 — readability scrims */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(4,6,15,0.92)_0%,rgba(4,6,15,0.62)_38%,rgba(4,6,15,0.12)_72%,rgba(4,6,15,0.3)_100%)]" />
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(4,6,15,0.78)_0%,transparent_24%,transparent_66%,rgba(4,6,15,0.96)_100%)]" />
      <div className="absolute inset-0 z-[1] bg-[rgba(4,6,15,0.42)] lg:hidden" />

      {/* L2 — drifting spectrum light */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
        aria-hidden="true"
      >
        <div className="animate-aurora absolute -left-[12%] top-[6%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_60%)] blur-[90px]" />
        <div
          className="animate-aurora absolute -right-[10%] top-[0%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.26),transparent_60%)] blur-[90px]"
          style={{ animationDelay: "-8s" }}
        />
        <div
          className="animate-aurora absolute right-[12%] bottom-[-10%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(251,146,60,0.16),transparent_60%)] blur-[80px]"
          style={{ animationDelay: "-16s" }}
        />
      </div>

      {/* L3 — living light ribbons + dust */}
      <div className="fade-in-ready absolute inset-0 z-[3] [mask-image:linear-gradient(90deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.5)_42%,#000_76%)]">
        <HeroCanvas />
      </div>

      {/* pointer spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(520px circle at var(--sx) var(--sy), rgba(125,211,252,0.10), rgba(168,85,247,0.07) 40%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* floor falloff */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[9] h-[40%] bg-[linear-gradient(180deg,transparent_0%,rgba(4,6,15,0.3)_32%,rgba(4,6,15,0.88)_100%)]" />

      {/* L4 — the prism stage */}
      <div
        className="pointer-events-none absolute right-[-24%] bottom-[34%] z-10 h-[32%] w-[88%] opacity-60 sm:right-[-10%] sm:w-[70%] lg:right-[2%] lg:bottom-[35%] lg:h-[50%] lg:w-[44%] lg:opacity-100"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 aspect-square h-[170%] -translate-x-1/2 -translate-y-1/2">
          <div className="rays" />
        </div>
        <div className="anamorphic top-[56%]" />

        <div
          className="hero-layer absolute inset-0"
          style={v({ "--dx": "-10px", "--dy": "-6px" })}
        >
          <div className="hero-prism h-full w-full">
            <div className="hero-tilt h-full w-full">
              <div className="animate-float h-full w-full drop-shadow-[0_0_50px_rgba(99,102,241,0.45)]">
                <HeroPrism className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* glossy floor reflection */}
        <div className="fade-in-ready absolute inset-x-0 top-full h-full [mask-image:linear-gradient(180deg,rgba(0,0,0,0.5),transparent_62%)]">
          <HeroPrism className="h-full w-full -scale-y-100 opacity-70 blur-[3px]" />
        </div>
        <div className="absolute left-1/2 top-full h-20 w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(168,85,247,0.5),rgba(34,211,238,0.18)_55%,transparent)] blur-2xl" />

        <HeroHud count={count} />
      </div>

      {/* L5 — copy */}
      <div className="container-lux relative z-20 flex min-h-[100svh] items-center pb-28 pt-28">
        <div className="hero-content max-w-3xl">
          <div
            className="hero-fade inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white/[0.03] px-4 py-1.5 text-[0.7rem] font-medium tracking-[0.2em] text-[var(--color-cyan)] backdrop-blur-sm"
            style={v({ "--d": "0.1s" })}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]" />
            <span>
              COMÉRCIO DIGITAL
              <span className="hidden sm:inline">&nbsp;· GESTÃO CONECTADA</span>
              <span className="sm:hidden">&nbsp;· GESTÃO</span>
            </span>
          </div>

          <h1 className="mt-7 text-[clamp(2.8rem,6.3vw,6.3rem)] font-light leading-[0.95] tracking-[-0.025em]">
            {WORDS.map((w, i) => (
              <Fragment key={w.t}>
                <span className="cine-word-mask">
                  <span
                    className={`cine-word ${w.cls ?? ""}`}
                    style={v({ "--d": `${0.2 + i * 0.09}s` })}
                  >
                    {w.t}
                  </span>
                </span>
                {i < WORDS.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </h1>

          <p
            className="hero-fade mt-8 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-mist)] sm:text-lg"
            style={v({ "--d": "0.9s" })}
          >
            Marketplace, produtos e gestão comercial reunidos em uma única
            plataforma. Crie sua vitrine, organize lojas, links de afiliados e
            registros financeiros — com uma operação clara para você e sua
            equipe.
          </p>

          <div
            className="hero-fade mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
            style={v({ "--d": "1.05s" })}
          >
            <MagneticButton
              onClick={onEnter}
              className="btn-gold w-full sm:w-auto"
            >
              {isSignedIn ? "Acessar meu painel" : "Começar agora"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </MagneticButton>
            <MagneticButton
              onClick={() => goTo("catalogo")}
              className="btn-ghost w-full sm:w-auto"
            >
              Explorar marketplace
            </MagneticButton>
          </div>

          <div
            className="hero-fade mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-[var(--color-mist-soft)]"
            style={v({ "--d": "1.2s" })}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {["#22d3ee", "#6366f1", "#a855f7", "#fb923c"].map((c) => (
                  <span
                    key={c}
                    className="h-7 w-7 rounded-full border border-[var(--color-ink)]"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, " +
                        c +
                        ", #1a1d27)",
                    }}
                  />
                ))}
              </div>
              <span>
                Produtos próprios{" "}
                <span className="text-[var(--color-cream)]">
                  e de afiliados
                </span>
              </span>
            </div>
            <span className="flex items-center gap-2.5 text-xs text-[var(--color-mist)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
              Sua operação, em um só lugar
            </span>
          </div>
        </div>
      </div>

      {/* L6 — control bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[rgba(4,6,15,0.6)] backdrop-blur-xl">
        <div className="container-lux flex h-16 items-center justify-between gap-4">
          <div className="hidden items-center sm:flex">
            {PILLARS.map((p) => (
              <a
                key={p.n}
                href="#ecossistema"
                data-cursor
                className="group flex items-center gap-2.5 border-r border-white/10 px-5 text-xs text-[var(--color-mist)] transition-colors first:pl-0 last:border-r-0 hover:text-[var(--color-cream)]"
              >
                <span className="font-display text-base text-spectrum">
                  {p.n}
                </span>
                {p.label}
              </a>
            ))}
          </div>

          <a
            href="#ecossistema"
            data-cursor
            className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-mist-soft)] transition-colors hover:text-[var(--color-cyan)]"
            aria-label="Rolar para o ecossistema"
          >
            <span className="grid h-8 w-5 place-items-start rounded-full border border-[var(--color-line)] p-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] [animation:scroll-hint_1.8s_ease-in-out_infinite]" />
            </span>
            Role
          </a>

          <div className="hidden items-center gap-2 font-mono text-[0.7rem] tracking-[0.2em] text-[var(--color-mist-soft)] sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-magenta)]" />
            GESTÃOFÁCIL VENDAS
          </div>
        </div>
      </div>
    </section>
  );
}
