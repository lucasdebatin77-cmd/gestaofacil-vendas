import BrandIdentity from "../BrandIdentity";
export function PrismMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/gestaofacil-symbol.svg"
      width={size}
      height={size}
      alt=""
      style={{ width: size, height: size }}
    />
  );
}
export default function Logo({
  size,
  withTagline,
}: {
  size?: string;
  withTagline?: boolean;
}) {
  return (
    <BrandIdentity
      className={
        (size === "lg" ? "source-brand-large" : "source-brand-small") +
        (withTagline ? " source-tagline" : "")
      }
    />
  );
}
