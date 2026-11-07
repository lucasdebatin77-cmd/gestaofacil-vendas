export default function HeroHud({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 hidden xl:block" aria-hidden="true">
      <div
        className="hero-layer absolute -left-[8%] top-[-3%]"
        style={{ "--dx": "26px", "--dy": "18px" } as React.CSSProperties}
      >
        <div className="hero-fade animate-float hud w-[232px] p-4">
          <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-mist-soft)]">
            <span>Marketplace</span>
            <span>Catálogo</span>
          </div>
          <p className="mt-3 font-display text-[2.6rem] font-light leading-none text-gradient-ai">
            {count}
          </p>
          <p className="mt-3 text-xs text-[var(--color-mist)]">
            {count === 1 ? "produto publicado" : "produtos publicados"}
          </p>
          <div className="mt-4 h-px bg-[linear-gradient(90deg,#22d3ee,#a855f7,#fb923c)]" />
        </div>
      </div>
      <div
        className="hero-layer absolute right-[-2%] top-[35%]"
        style={
          {
            "--dx": "-22px",
            "--dy": "12px",
            right: "-2%",
          } as React.CSSProperties
        }
      >
        <div
          className="hero-fade animate-float hud w-[236px] p-4"
          style={{ animationDelay: "-3s" }}
        >
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-mist-soft)]">
            Inteligência comercial
          </p>
          <div className="mt-3 flex items-center justify-between border border-[var(--color-line)] rounded-lg px-2.5 py-2 text-xs">
            <span>Radar de produtos</span>
            <span className="text-[var(--color-cyan)]">Estrutura inicial</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-mist)]">
            Agentes de IA e integrações em desenvolvimento.
          </p>
        </div>
      </div>
      <div className="hero-layer absolute -left-[8%] bottom-[3%]">
        <div
          className="hero-fade animate-float hud w-[212px] p-4"
          style={{ animationDelay: "-5s" }}
        >
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-mist-soft)]">
            Sua operação
          </p>
          <p className="mt-2 font-display text-[2rem] font-light text-[var(--color-cream)]">
            Em um só lugar
          </p>
          <p className="mt-2 text-xs text-[var(--color-mist)]">
            Produtos · lojas · equipe
          </p>
        </div>
      </div>
    </div>
  );
}
