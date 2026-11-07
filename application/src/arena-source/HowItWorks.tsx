"use client";

import Reveal from "./Reveal";
import { useInView } from "./useInView";

const STEPS = [
  {
    n: "01",
    title: "Cadastre",
    body: "Crie sua empresa e sua loja. Convide colaboradores e defina as permissões de cada pessoa.",
  },
  {
    n: "02",
    title: "Unifique",
    body: "Organize produtos, links de afiliados e registros financeiros. Publique sua vitrine com os dados que você cadastrou.",
  },
  {
    n: "03",
    title: "Compartilhe",
    body: "Compartilhe a loja e as páginas individuais dos produtos. Acompanhe sua operação no painel com sua equipe.",
  },
];

const NODES = [16.66, 50, 83.33];

export default function HowItWorks() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);

  return (
    <section id="como-funciona" className="relative py-24 sm:py-32">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Como funciona</span>
          <h2 className="mt-6 text-[clamp(2.2rem,5vw,4rem)] font-light">
            Da sua conta à vitrine,{" "}
            <span className="text-gradient">em três passos.</span>
          </h2>
          <p className="mt-5 text-[var(--color-mist)]">
            Uma sequência clara para organizar seu negócio e apresentar seus
            produtos.
          </p>
        </Reveal>

        <div ref={ref} className="mt-16">
          {/* timeline: the line draws itself and lights each node in sequence */}
          <div className="relative mb-8 hidden h-4 md:block" aria-hidden="true">
            <span className="absolute left-[16.66%] right-[16.66%] top-1/2 h-px bg-[var(--color-line)]" />
            <span
              className={`absolute left-[16.66%] right-[16.66%] top-1/2 h-px origin-left bg-[linear-gradient(90deg,#22d3ee,#a855f7,#fb923c)] transition-transform duration-[2400ms] ease-out ${
                inView ? "scale-x-100" : "scale-x-0"
              }`}
            />
            {NODES.map((x, i) => (
              <span
                key={x}
                className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-700 ${
                  inView
                    ? "border-transparent bg-[linear-gradient(135deg,#22d3ee,#a855f7,#fb923c)] shadow-[0_0_18px_4px_rgba(168,85,247,0.55)]"
                    : "border-[var(--color-line)] bg-[var(--color-ink)]"
                }`}
                style={{ left: `${x}%`, transitionDelay: `${i * 900}ms` }}
              />
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={`card-lux group relative p-8 transition-all duration-1000 ${
                  inView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="text-outline pointer-events-none absolute -right-3 -top-4 font-display text-[8.5rem] font-light leading-none opacity-60 transition-opacity duration-700 group-hover:opacity-100"
                >
                  {s.n}
                </span>
                <span className="relative grid h-[68px] w-[68px] place-items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-ink-raised)] font-display text-2xl font-medium">
                  <span className="text-spectrum">{s.n}</span>
                </span>
                <h3 className="relative mt-8 text-3xl font-light">{s.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-[var(--color-mist)]">
                  {s.body}
                </p>
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,#22d3ee,#a855f7,#fb923c)] transition-transform duration-700 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
