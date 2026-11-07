export default function HeroPrism({ className = "" }: { className?: string }) {
  return (
    <img
      src="/gestaofacil-symbol.svg"
      alt=""
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
