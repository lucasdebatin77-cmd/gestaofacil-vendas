const items = [
  ["01", "Dados com origem", "Conectores autorizados", "Planejado"],
  [
    "02",
    "Análise explicável",
    "Critérios e fontes visíveis",
    "Estrutura inicial",
  ],
  [
    "03",
    "Agentes especializados",
    "Apoio às tarefas comerciais",
    "Em desenvolvimento",
  ],
  [
    "04",
    "Automação supervisionada",
    "Revisão humana antes de agir",
    "Planejado",
  ],
];
export default function RoadmapFeed() {
  return (
    <div className="space-y-3">
      {items.map(([n, title, desc, state]) => (
        <div
          key={n}
          className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-white/[0.02] p-4"
        >
          <span className="font-display text-2xl text-spectrum">{n}</span>
          <div className="flex-1">
            <p className="text-sm text-[var(--color-cream)]">{title}</p>
            <p className="mt-1 text-xs text-[var(--color-mist)]">{desc}</p>
          </div>
          <span className="text-[0.65rem] text-[var(--color-cyan)]">
            {state}
          </span>
        </div>
      ))}
    </div>
  );
}
