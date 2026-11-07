import SourceHero from './arena-source/Hero';
import SourceEcosystem from './arena-source/Ecosystem';
import SourceHow from './arena-source/HowItWorks';
import SourceIntelligence from './arena-source/Intelligence';
import SourceBrandBand from './arena-source/BrandBand';
import SourceBigMarquee from './arena-source/BigMarquee';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import BrandIdentity from './BrandIdentity';
import { ArenaSecurity, ArenaFaq } from './ArenaSignatureExtras';
import {
  ArrowRight, ArrowUpRight, Check,
  Menu,
  Package, Radar, Search, X
} from 'lucide-react';

export type ArenaCatalogProduct = {
  id: string;
  title: string;
  description: string;
  category: string;
  kind: 'own' | 'affiliate' | 'third_party';
  price: number | null;
  imageUrl: string;
  sellerName: string;
  storeId?: string;
  source?: string;
};

type Props = {
  catalog: ArenaCatalogProduct[];
  loadingMore: boolean;
  hasMore: boolean;
  onMore: () => void;
  onProduct: (productId: string) => void;
  onEnter: () => void;
  onSignIn: () => void;
  isSignedIn: boolean;
  authReady: boolean;
};

const kinds: Record<string,string> = {
  own:'Produto próprio',
  affiliate:'Link de afiliado',
  third_party:'Produto de terceiro'
};
const menuItems = [
  {id:'ecossistema',label:'Ecossistema'},
  {id:'como-funciona',label:'Como funciona'},
  {id:'catalogo',label:'Marketplace'},
  {id:'radar',label:'Radar'},
  {id:'duvidas',label:'Dúvidas'}
];
const kpis = [
  {label:'Origem dos dados',value:'Manual',note:'Identificada por produto'},
  {label:'Integrações externas',value:'Pendentes',note:'Somente após autorização'},
  {label:'Pontuação do Radar',value:'—',note:'Sem métricas inventadas'},
  {label:'Checkout interno',value:'Pendente',note:'Pagamento externo nesta fase'}
];
const formatPrice = (n:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);

function BrandMark() {
  return <BrandIdentity />;
}
function ArrowLink({children,onClick,secondary=false}:{children:ReactNode;onClick:()=>void;secondary?:boolean}) {
  return <button className={secondary?'ar-btn ar-btn-outline':'ar-btn ar-btn-gold'} onClick={onClick}>
    {children}<ArrowUpRight size={17}/>
  </button>;
}
export default function ArenaExperience({
  catalog, loadingMore, hasMore, onMore, onProduct, onEnter, onSignIn, isSignedIn, authReady
}:Props) {
  const [menuOpen,setMenuOpen] = useState(false);
  const [scrolled,setScrolled] = useState(false);
  const [search,setSearch] = useState('');
  const [kind,setKind] = useState('all');
  const progress = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let raf=0;
    const update=()=>{
      if(raf) return;
      raf=window.requestAnimationFrame(()=>{
        setScrolled(window.scrollY>30);
        const doc=document.documentElement;
        const max=Math.max(1,doc.scrollHeight-window.innerHeight);
        if(progress.current)progress.current.style.transform='scaleX('+Math.min(1,window.scrollY/max)+')';
        raf=0;
      });
    };
    update();
    window.addEventListener('scroll',update,{passive:true});
    return()=>{window.removeEventListener('scroll',update);if(raf)cancelAnimationFrame(raf);};
  },[]);
  const display=useMemo(()=>catalog.filter(p=>
    (kind==='all'||p.kind===kind) &&
    (p.title+' '+p.category+' '+p.sellerName).toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR'))
  ),[catalog,kind,search]);
  const goTo=(id:string)=>{
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  };
  return <div className="arena-app gf-visual-release">
    <div className="ar-scroll-progress" ref={progress}/>
    <div className="ar-grain" aria-hidden="true"/>
    <header className={'ar-navbar '+(scrolled?'is-scrolled':'')}>
      <div className="ar-container ar-nav-inner">
        <button type="button" className="ar-brand-button" aria-label="GestãoFácil Vendas, início" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><BrandMark/></button>
        <nav className="ar-nav-links" aria-label="Navegação principal">
          {menuItems.map(item=><button key={item.id} onClick={()=>goTo(item.id)}>{item.label}</button>)}
        </nav>
        <div className="ar-nav-actions">
          <button className="ar-navbar-cta" disabled={!authReady} onClick={isSignedIn?onEnter:onSignIn}>
            {isSignedIn?'Meu painel':'Entrar na plataforma'}<ArrowUpRight size={15}/>
          </button>
          <button className="ar-menu-toggle" aria-label={menuOpen?'Fechar menu':'Abrir menu'} aria-expanded={menuOpen} aria-controls="ar-mobile-menu" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>
        </div>
      </div>
      {menuOpen&&<div className="ar-mobile-nav" id="ar-mobile-menu">
        {menuItems.map(item=><button key={item.id} onClick={()=>goTo(item.id)}>{item.label}<ArrowRight size={15}/></button>)}
        <button onClick={()=>{setMenuOpen(false);isSignedIn?onEnter():onSignIn();}}>Acessar plataforma<ArrowUpRight size={15}/></button>
      </div>}
    </header>

    <main id="gf-main" tabIndex={-1}>
      <div className="arena-source"><SourceHero count={catalog.length} onEnter={isSignedIn?onEnter:onSignIn} goTo={goTo} isSignedIn={isSignedIn}/><SourceEcosystem catalog={catalog} onProduct={onProduct} onEnter={onEnter}/><SourceHow/></div>

      <section id="catalogo" className="ar-section ar-catalog">
        <div className="ar-container">
          <div className="ar-section-heading">
            <div><span className="ar-overline">MARKETPLACE PÚBLICO</span>
              <h2>Descubra novas <em>possibilidades.</em></h2>
              <p>Produtos físicos e digitais publicados por vendedores. Encontre sua próxima escolha.</p></div>
            <span className="ar-count">{catalog.length}{hasMore?'+':''} {catalog.length===1?'produto carregado':'produtos carregados'}</span>
          </div>
          <div className="ar-catalog-tools">
            <label className="ar-search-field"><Search size={19}/>
              <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Busque produtos, marcas ou categorias" aria-label="Buscar produtos"/>
              <span>BUSCAR</span>
            </label>
            <div className="ar-chips">
              {[{id:'all',label:'Todos'},{id:'own',label:'Lojas'},{id:'affiliate',label:'Afiliados'},{id:'third_party',label:'Terceiros'}].map(it=>
                <button key={it.id} className={kind===it.id?'selected':''} onClick={()=>setKind(it.id)}>{it.label}</button>)}
            </div>
          </div>
          {display.length? <div className="ar-product-grid">
            {display.map(p=><button key={p.id} className="ar-product" onClick={()=>onProduct(p.id)}>
              <div className="ar-product-image">{p.imageUrl?<img src={p.imageUrl} loading="lazy" alt={p.title}/>:<div className="ar-product-placeholder"><Package size={32}/><span>Imagem não informada</span></div>}
                <span className="ar-product-tag">{kinds[p.kind]}</span></div>
              <div className="ar-product-info"><span>{p.category}</span><h3>{p.title}</h3><small>{p.sellerName||'Loja parceira'}</small>
                <div className="ar-product-bottom"><strong>{p.price===null?'Preço não disponível':formatPrice(p.price)}</strong><i><ArrowUpRight size={18}/></i></div></div>
            </button>)}
          </div>:<div className="ar-catalog-empty"><span className="ar-empty-orbit"><Package size={33}/></span>
            <h3>{catalog.length?'Nenhum produto encontrado':'Seu próximo achado começa aqui.'}</h3>
            <p>{catalog.length?'Experimente outro termo de busca ou selecione outra categoria.':'Os produtos aparecerão aqui assim que as lojas publicarem suas ofertas.'}</p>
            <ArrowLink onClick={onEnter}>Publicar meu produto</ArrowLink>
          </div>}
          {hasMore&&<div className="ar-catalog-more"><button className="ar-btn ar-btn-outline" disabled={loadingMore} onClick={onMore}>{loadingMore?'Carregando...':'Carregar mais ofertas'}<ArrowRight size={16}/></button></div>}
        </div>
      </section>

      <section id="radar" className="ar-section ar-radar-section">
        <div className="ar-container ar-radar-layout">
          <div className="ar-radar-copy"><span className="ar-overline">RADAR DE PRODUTOS</span>
            <h2>Decisões melhores começam com <em className="ar-gradient-ai">dados confiáveis.</em></h2>
            <p>O Radar organiza critérios de qualidade, preços e comissões quando existem fontes autorizadas. A plataforma avisa quando os dados estão incompletos e não inventa uma previsão de lucro.</p>
            <div className="ar-checked"><span><Check size={15}/> Critérios explicáveis e auditáveis</span><span><Check size={15}/> Produtos com origem registrada</span><span><Check size={15}/> Sem pontuação fictícia</span></div>
            <button className="ar-text-link" onClick={onEnter}>Explorar o Radar no painel <ArrowRight size={18}/></button>
          </div>
          <div className="ar-radar-interface">
            <div className="ar-radar-head"><span><i/> RADAR · ESTRUTURA INICIAL</span><small>Sem conexão oficial</small></div>
            <div className="ar-radar-visual"><span className="ar-radar-ring ar-ring-one"/><span className="ar-radar-ring ar-ring-two"/><span className="ar-radar-ring ar-ring-three"/><span className="ar-radar-line"/><span className="ar-radar-center"><Radar size={29}/><small>ANÁLISE</small></span></div>
            <div className="ar-radar-data">{kpis.map(it=><div key={it.label}><small>{it.label}</small><strong>{it.value}</strong><span>{it.note}</span></div>)}</div>
            <p className="ar-radar-disclaimer">Painel ilustrativo de critérios. Nenhum gráfico ou resultado financeiro foi fabricado.</p>
          </div>
        </div>
      </section>

      <div className="arena-source"><SourceIntelligence onEnter={onEnter}/><SourceBrandBand/><SourceBigMarquee/></div>

      <ArenaSecurity/>
      <ArenaFaq onEnter={onEnter}/>

      <section className="ar-final"><div className="ar-container"><span className="ar-overline">UM NOVO JEITO DE OPERAR</span>
        <h2>Seu negócio merece <em>outra dimensão.</em></h2>
        <p>Comece com sua vitrine, organize produtos e evolua sua operação em um só lugar.</p>
        <ArrowLink onClick={isSignedIn?onEnter:onSignIn}>{isSignedIn?'Abrir minha operação':'Criar minha conta'}</ArrowLink>
      </div></section>
    </main>
    <footer className="ar-footer"><div className="ar-container ar-footer-main"><BrandMark/>
      <p>Marketplace e gestão comercial unificados. Sua vitrine, seus produtos e sua operação em um só lugar.</p>
      <button onClick={onEnter}>Área do vendedor <ArrowUpRight size={16}/></button>
    </div><div className="ar-container ar-footer-bottom"><span>© 2026 GestãoFácil Vendas</span><span>Versão de evolução visual · Pagamentos internos não disponíveis</span></div></footer>
  </div>;
}

