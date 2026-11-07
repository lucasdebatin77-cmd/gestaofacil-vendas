const ROWS = [
  {
    items: [
      "Marketplace",
      "SaaS Comercial",
      "Gestão Comercial",
      "Radar de Produtos",
    ],
    reverse: false,
  },
  {
    items: ["Afiliados", "Lojas", "Produtos", "Equipe", "Gestão"],
    reverse: true,
  },
];

export default function BigMarquee() {
  return (
    <section
      aria-hidden="true"
      className="relative select-none overflow-hidden py-14 sm:py-24"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.14),transparent)] blur-3xl" />
      <div className="relative space-y-2 sm:space-y-4">
        {ROWS.map((row, ri) => {
          const half = [...row.items, ...row.items];
          const full = [...half, ...half];
          return (
            <div
              key={ri}
              className="group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
            >
              <div
                className={`flex w-max shrink-0 items-center gap-8 pr-8 group-hover:[animation-play-state:paused] sm:gap-12 sm:pr-12 ${
                  row.reverse
                    ? "[animation:marquee_64s_linear_infinite_reverse]"
                    : "[animation:marquee_56s_linear_infinite]"
                }`}
              >
                {full.map((text, i) => (
                  <span
                    key={`${text}-${i}`}
                    className="flex shrink-0 items-center gap-8 sm:gap-12"
                  >
                    <span
                      className={`font-display text-[clamp(3rem,8.5vw,7.5rem)] font-light leading-[1.05] tracking-[-0.02em] ${
                        i % 2 === 0 ? "text-outline" : "text-spectrum italic"
                      }`}
                    >
                      {text}
                    </span>
                    <span className="text-[clamp(1rem,2vw,1.6rem)] text-[var(--color-cyan)]/70">
                      ✦
                    </span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
