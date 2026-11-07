"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { PrismMark } from "./Logo";

type PillarId = "marketplace" | "saas" | "ia";

const PILLARS: {
  id: PillarId;
  n: string;
  title: string;
  tag: string;
  body: string;
  points: string[];
}[] = [
  {
    id: "marketplace",
    n: "01",
    title: "Marketplace Público",
    tag: "O palco das marcas",
    body: "Consumidores descobrem os produtos publicados nas lojas. Cada oferta mantém sua origem e o destino de compra informado pelo vendedor.",
    points: ["Lojas individuais", "Produtos reais", "Destino identificado"],
  },
  {
    id: "saas",
    n: "02",
    title: "SaaS Comercial",
    tag: "O centro de comando",
    body: "Produtos, empresas, links de afiliados, equipe e registros financeiros no mesmo painel. Sua operação organizada, com permissões por colaborador.",
    points: ["Produtos e empresas", "Links de afiliados", "Financeiro manual"],
  },
  {
    id: "ia",
    n: "03",
    title: "Inteligência Comercial",
    tag: "O Radar",
    body: "O Radar está em estrutura inicial. Conectores, automações e agentes de IA permanecem em desenvolvimento e dependem de fontes autorizadas.",
    points: [
      "Critérios transparentes",
      "Fontes identificadas",
      "Evolução planejada",
    ],
  },
];

type CatalogItem = {
  id: string;
  title: string;
  category: string;
  sellerName: string;
  imageUrl: string;
};
function Panel({
  id,
  catalog,
  onProduct,
  onEnter,
}: {
  id: PillarId;
  catalog: CatalogItem[];
  onProduct: (id: string) => void;
  onEnter: () => void;
}) {
  if (id === "marketplace")
    return (
      <div className="space-y-3">
        {catalog.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => onProduct(p.id)}
                className="rounded-xl border border-[var(--color-line)] bg-white/[0.02] p-3.5 text-left"
              >
                <span className="block text-sm text-[var(--color-cream)]">
                  {p.title}
                </span>
                <span className="block mt-2 text-xs text-[var(--color-mist)]">
                  {p.sellerName} · {p.category}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid min-h-[210px] place-items-center rounded-xl border border-[var(--color-line)] bg-white/[0.02] p-8 text-center">
            <div>
              <PrismMark size={50} />
              <h3 className="mt-4 text-2xl text-[var(--color-cream)]">
                Um palco para seus produtos.
              </h3>
              <p className="mt-3 text-sm text-[var(--color-mist)]">
                A vitrine recebe os produtos publicados pelos vendedores.
              </p>
              <button className="btn-ghost mt-5 !text-xs" onClick={onEnter}>
                Publicar meu produto →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  const items =
    id === "saas"
      ? [
          ["Produtos", "Cadastro e publicação"],
          ["Lojas", "Vitrines individuais"],
          ["Afiliados", "Links organizados"],
          ["Financeiro", "Registros manuais"],
        ]
      : [
          ["Radar de Produtos", "Estrutura inicial"],
          ["Fontes de dados", "Conectores pendentes"],
          ["Agentes de IA", "Em desenvolvimento"],
          ["Automações", "Disponibilidade futura"],
        ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([title, note]) => (
        <div
          key={title}
          className="rounded-xl border border-[var(--color-line)] bg-white/[0.02] p-5"
        >
          <span className="block h-1 w-8 rounded-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#fb923c)]" />
          <h3 className="mt-4 text-xl text-[var(--color-cream)]">{title}</h3>
          <p className="mt-2 text-xs text-[var(--color-mist)]">{note}</p>
        </div>
      ))}
    </div>
  );
}

export default function Ecosystem({
  catalog,
  onProduct,
  onEnter,
}: {
  catalog: CatalogItem[];
  onProduct: (id: string) => void;
  onEnter: () => void;
}) {
  const [active, setActive] = useState<PillarId>("marketplace");
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = PILLARS.find((p) => p.id === active)!;
  const currentIndex = PILLARS.findIndex((p) => p.id === active);

  // Desktop: the section is pinned and scrolling advances through the three layers.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrapRef.current;
      if (
        !el ||
        window.innerWidth < 1024 ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(0.9999, Math.max(0, -rect.top / total));
      setActive(PILLARS[Math.floor(p * PILLARS.length)].id);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const select = useCallback((index: number) => {
    setActive(PILLARS[index].id);
    const el = wrapRef.current;
    if (
      !el ||
      window.innerWidth < 1024 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + total * ((index + 0.5) / PILLARS.length);
    window.scrollTo({
      top: y,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  return (
    <section id="ecossistema" className="relative">
      <div ref={wrapRef} className="relative lg:h-[300vh]">
        <div className="py-24 sm:py-32 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-0">
          <div className="container-lux">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
              {/* narrative */}
              <div>
                <Reveal>
                  <span className="eyebrow">O Ecossistema</span>
                  <h2 className="mt-6 text-[clamp(2.2rem,4.6vw,3.8rem)] font-light">
                    Um ecossistema.{" "}
                    <span className="text-spectrum">Três forças.</span>
                  </h2>
                  <p className="mt-5 max-w-md text-[var(--color-mist)]">
                    Da vitrine pública ao controle da sua operação comercial.
                    <span className="hidden lg:inline">
                      {" "}
                      Role para atravessar cada camada.
                    </span>
                    <span className="lg:hidden">
                      {" "}
                      Toque para entrar em cada camada.
                    </span>
                  </p>
                </Reveal>

                <div
                  role="tablist"
                  aria-label="Camadas do ecossistema"
                  className="mt-9 flex flex-col"
                >
                  {PILLARS.map((p, i) => {
                    const on = active === p.id;
                    return (
                      <button
                        key={p.id}
                        role="tab"
                        aria-selected={on}
                        onClick={() => select(i)}
                        data-cursor
                        className="group relative flex items-center gap-5 border-l border-[var(--color-line)] py-4 pl-6 text-left"
                      >
                        <span
                          className={`absolute -left-px top-0 w-px origin-top bg-[linear-gradient(180deg,#22d3ee,#a855f7,#fb923c)] transition-all duration-700 ${
                            on ? "h-full opacity-100" : "h-0 opacity-0"
                          }`}
                        />
                        <span
                          className={`font-display text-3xl font-light transition-colors duration-500 ${
                            on ? "text-spectrum" : "text-outline"
                          }`}
                        >
                          {p.n}
                        </span>
                        <span>
                          <span
                            className={`block text-lg font-medium transition-colors duration-500 ${
                              on
                                ? "text-[var(--color-cream)]"
                                : "text-[var(--color-mist)] group-hover:text-[var(--color-cream)]"
                            }`}
                          >
                            {p.title}
                          </span>
                          <span className="block text-xs text-[var(--color-mist-soft)]">
                            {p.tag}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-6 hidden items-center gap-3 text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-mist-soft)] lg:flex">
                  <span className="font-display text-base normal-case tracking-normal text-[var(--color-cream)]">
                    {String(currentIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px w-10 bg-[var(--color-line)]" />
                  03
                </p>
              </div>

              {/* console */}
              <Reveal delay={100}>
                <div className="glass-strong border-glow overflow-hidden rounded-3xl shadow-[0_50px_130px_-50px_rgba(0,0,0,0.95)]">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-5 py-3.5">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <PrismMark size={22} />
                      <span className="truncate text-sm font-medium text-[var(--color-cream)]">
                        GestãoFácil{" "}
                        <span className="text-[var(--color-mist-soft)]">/</span>{" "}
                        <span className="text-spectrum">{current.title}</span>
                      </span>
                    </span>
                    <span className="chip shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]" />
                      Plataforma
                    </span>
                  </div>

                  <div className="p-5">
                    <div key={active}>
                      <Panel
                        id={active}
                        catalog={catalog}
                        onProduct={onProduct}
                        onEnter={onEnter}
                      />
                    </div>

                    <div className="mt-5 border-t border-[var(--color-line)] pt-4">
                      <p className="max-w-3xl text-sm leading-relaxed text-[var(--color-mist)]">
                        {current.body}
                      </p>
                      <ul className="mt-4 flex flex-wrap gap-2.5">
                        {current.points.map((pt) => (
                          <li key={pt} className="chip">
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                              className="text-[var(--color-cyan)]"
                            >
                              <path
                                d="M20 6L9 17l-5-5"
                                stroke="currentColor"
                                strokeWidth="2.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
