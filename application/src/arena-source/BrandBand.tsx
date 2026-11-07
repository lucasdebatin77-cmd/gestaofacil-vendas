import Reveal from "./Reveal";
import Logo, { PrismMark } from "./Logo";

export default function BrandBand() {
  return (
    <section className="relative overflow-hidden border-y border-[var(--color-line)]">
      <img
        src="/resources/arena/prism.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        style={{
          objectPosition: "center 45%",
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 35%, #000 65%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 35%, #000 65%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,6,15,0.86)_0%,rgba(4,6,15,0.55)_50%,rgba(4,6,15,0.9)_100%)]" />

      <div className="container-lux relative py-24 text-center sm:py-28">
        <Reveal>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[rgba(125,211,252,0.3)] bg-[rgba(4,6,15,0.6)] backdrop-blur-sm">
            <PrismMark size={40} />
          </span>

          <h2 className="mx-auto mt-8 max-w-3xl text-[clamp(2rem,4.6vw,3.6rem)] font-light leading-[1.06]">
            Uma marca. <span className="text-spectrum">Um ecossistema.</span>{" "}
            <span className="text-chrome">Toda a sua operação.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-[var(--color-mist)]">
            Da vitrine pública ao painel de gestão, cada camada da GestãoFácil
            Vendas conecta seus produtos, suas lojas e sua equipe.
          </p>

          <div className="mt-10 flex justify-center">
            <Logo size="lg" withTagline />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
