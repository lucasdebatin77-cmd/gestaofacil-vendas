type BrandIdentityProps = {
  compact?: boolean;
  vertical?: boolean;
  className?: string;
};

export default function BrandIdentity({
  compact = false,
  vertical = false,
  className = ''
}: BrandIdentityProps) {
  return (
    <span
      className={'gf-brand-identity' + (compact ? ' gf-brand-compact' : '') + (vertical ? ' gf-brand-vertical' : '') + (className ? ' ' + className : '')}
      aria-label="GestãoFácil Vendas"
    >
      <img className="gf-brand-symbol" src="/gestaofacil-symbol.svg" width="46" height="46" alt="" />
      {!compact && (
        <span className="gf-brand-type">
          <span className="gf-brand-name"><span className="gf-brand-gestao">Gestão</span><span className="gf-brand-facil">Fácil</span></span>
          <span className="gf-brand-subline"><i aria-hidden="true"/><small>VENDAS</small><i aria-hidden="true"/></span>
        </span>
      )}
    </span>
  );
}

