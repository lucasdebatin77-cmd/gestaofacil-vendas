import Reveal from "./Reveal";
import SpotlightCard from "./SpotlightCard";
import RoadmapFeed from "./RoadmapFeed";

const AGENTS = [
  {
    title: "Agente de Precificação",
    desc: "Planejado para apoiar análises de preço e margem com fontes autorizadas.",
    icon: (
      <path
        d="M3 17l5-5 4 4 8-9M21 7v5M21 7h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Agente de Campanhas",
    desc: "Conectores e gestão de campanhas dependem de desenvolvimento e homologação.",
    icon: (
      <path
        d="M3 11l18-8-8 18-2-7-8-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Agente de Afiliados",
    desc: "Análises de afiliados estão planejadas. Os links atuais são cadastrados manualmente.",
    icon: (
      <path
        d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M2 21v-2a4 4 0 013-3.87"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Agente de Atendimento",
    desc: "Atendimento com IA é uma possibilidade futura, ainda indisponível na plataforma.",
    icon: (
      <path
        d="M21 15a2 2 0 01-2 2H8l-4 4V5a2 2 0 012-2h13a2 2 0 012 2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function Intelligence({ onEnter }: { onEnter: () => void }) {
  return (
    <section id="inteligencia" className="relative py-24 sm:py-32">
      <div className="container-lux">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">O próximo capítulo</span>
          <h2 className="mt-6 text-[clamp(2rem,4.5vw,3.4rem)] font-light">
            Inteligência para evoluir com o seu negócio.{" "}
            <span className="text-gradient">Em desenvolvimento.</span>
          </h2>
          <p className="mt-5 text-[var(--color-mist)]">
            Agentes, conectores e automações fazem parte da evolução planejada.
            Essas funções ainda não executam tarefas nem tomam decisões por
            você.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:auto-rows-[212px] lg:grid-cols-3 [grid-flow:dense]">
          {/* Live operation (large) */}
          <Reveal className="lg:col-span-2 lg:row-span-2" delay={0}>
            <SpotlightCard className="card-lux flex h-full flex-col p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium">
                    O horizonte da operação
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-mist)]">
                    Uma visão das próximas camadas da plataforma.
                  </p>
                </div>
                <span className="chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_2px_rgba(88,214,230,0.6)]" />
                  Planejado
                </span>
              </div>
              <div className="mt-5 flex-1">
                <RoadmapFeed />
              </div>
            </SpotlightCard>
          </Reveal>

          {AGENTS.map((a, i) => (
            <Reveal key={a.title} delay={(i + 1) * 80}>
              <SpotlightCard className="card-lux flex h-full flex-col p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--color-line)] bg-[rgba(139,109,255,0.08)] text-[var(--color-violet)]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    {a.icon}
                  </svg>
                </span>
                <h3 className="mt-4 text-lg font-medium">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-mist)]">
                  {a.desc}
                </p>
              </SpotlightCard>
            </Reveal>
          ))}

          {/* CTA card */}
          <Reveal delay={5 * 80}>
            <SpotlightCard className="card-lux flex h-full flex-col items-start justify-between gap-4 bg-[linear-gradient(160deg,rgba(34,211,238,0.12),rgba(168,85,247,0.10))] p-6">
              <div>
                <h3 className="text-lg font-medium">
                  Comece pela sua vitrine.
                </h3>
                <p className="mt-2 text-sm text-[var(--color-mist)]">
                  Produtos, lojas, equipe e registros financeiros já fazem parte
                  do painel.
                </p>
              </div>
              <button onClick={onEnter} className="btn-ghost text-sm">
                Abrir o painel
                <svg
                  width="15"
                  height="15"
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
              </button>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
