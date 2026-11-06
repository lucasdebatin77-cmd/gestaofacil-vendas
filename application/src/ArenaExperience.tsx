
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import BrandIdentity from './BrandIdentity';
import { ArenaHowItWorks, ArenaSecurity, ArenaFaq } from './ArenaSignatureExtras';
import {
  Activity, ArrowRight, ArrowUpRight, Check, ChevronDown,
  Globe2, Layers3, Link2, Menu,
  Package, Radar, Search, ShieldCheck, Sparkles, Store, X
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
const pillars = [
  {
    n:'01',title:'Marketplace Público',subtitle:'O palco das marcas',
    description:'Produtos reais, físicos e digitais, em vitrines individuais. Descubra ofertas e confira as condições diretamente no destino do vendedor.',
    points:['Lojas com identidade própria','Produtos publicados por vendedores','Ofertas com origem identificada'],
    icon:Store,tone:'gold'
  },
  {
    n:'02',title:'SaaS Comercial',subtitle:'O centro de comando',
    description:'Seu espaço de operação com produtos, empresas, links de afiliados, equipe e lançamentos financeiros organizados no mesmo ambiente.',
    points:['Gestão de produtos e empresas','Permissões e colaboradores','Finanças e links manuais'],
    icon:Layers3,tone:'purple'
  },
  {
    n:'03',title:'Inteligência Comercial',subtitle:'O radar de oportunidades',
    description:'Uma base para analisar seus produtos com critérios transparentes. As pontuações permanecem indisponíveis até haver fontes de dados suficientes.',
    points:['Análise com fontes identificadas','Status de dados incompletos','Conectores planejados e auditáveis'],
    icon:Radar,tone:'cyan'
  }
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
function OrbitVisual() {
  return <div className="ar-orbit-scene" aria-hidden="true">
    <div className="ar-orbit-glow"/>
    <div className="ar-orbit-grid"/>
    <div className="ar-orbit-circle ar-orbit-outer"/>
    <div className="ar-orbit-circle ar-orbit-inner"/>
    <div className="ar-orbit-core-wrap">
      <div className="ar-orbit-core">
        <div className="ar-radar-sweep"/>
        <img className="gf-core-icon" src="/gestaofacil-symbol.svg" alt="" />
        <small>ECOSSISTEMA</small>
      </div>
    </div>
    <div className="ar-orbit-rotation">
      {[
        {deg:0,label:'Marketplace',sub:'Vitrine pública',icon:Store,color:'gold'},
        {deg:120,label:'SaaS Comercial',sub:'Centro de comando',icon:Layers3,color:'violet'},
        {deg:240,label:'Inteligência',sub:'Radar de produtos',icon:Radar,color:'cyan'}
      ].map(item=>{
        const Icon = item.icon;
        return <div key={item.label} className="ar-orbit-item" style={{transform:'rotate('+item.deg+'deg) translateY(-210px)'}}>
          <div className={'ar-orbit-card ar-tone-'+item.color}><span className="ar-orbit-icon"><Icon size={21}/></span><strong>{item.label}</strong><small>{item.sub}</small></div>
        </div>;
      })}
    </div>
    <div className="ar-orbit-floating ar-floating-first">3 experiências integradas</div>
    <div className="ar-orbit-floating ar-floating-second">ecossistema conectado</div>
    <div className="ar-orbit-caption">COMPOSIÇÃO VISUAL · NÃO REPRESENTA MÉTRICAS REAIS</div>
  </div>;
}

export default function ArenaExperience({
  catalog, loadingMore, hasMore, onMore, onProduct, onEnter, onSignIn, isSignedIn, authReady
}:Props) {
  const [menuOpen,setMenuOpen] = useState(false);
  const [scrolled,setScrolled] = useState(false);
  const [search,setSearch] = useState('');
  const [kind,setKind] = useState('all');
  const [ready,setReady] = useState(false);
  const progress = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroGlowRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    setReady(true);
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
  useEffect(()=>{
    const hero=heroRef.current, glow=heroGlowRef.current;
    if(!hero || !glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const onMove=(e:PointerEvent)=>{
      if(e.pointerType==='touch')return;
      const r=hero.getBoundingClientRect();
      const x=Math.max(0,Math.min(100,(e.clientX-r.left)/Math.max(1,r.width)*100)).toFixed(1);
      const y=Math.max(0,Math.min(100,(e.clientY-r.top)/Math.max(1,r.height)*100)).toFixed(1);
      glow.style.background='radial-gradient(445px circle at '+x+'% '+y+'%, rgba(139,109,255,.17),rgba(233,207,160,.08) 42%,transparent 72%)';
    };
    hero.addEventListener('pointermove',onMove,{passive:true});
    return()=>hero.removeEventListener('pointermove',onMove);
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
      <section className="ar-hero" id="top" ref={heroRef}>
        <div className="ar-aurora ar-aurora-one"/><div className="ar-aurora ar-aurora-two"/><div className="ar-aurora ar-aurora-three"/>
        <div className="ar-hero-grid"/>
        <div className="ar-hero-glow" ref={heroGlowRef} aria-hidden="true"/>
        <div className="ar-container ar-hero-layout">
          <div className={'ar-hero-copy '+(ready?'is-ready':'')}>
            <div className="ar-kicker"><span className="ar-kicker-dot"/> COMÉRCIO DIGITAL · INTELIGÊNCIA ARTIFICIAL</div>
            <h1>
              <span className="ar-reveal-word">Sua operação</span>{' '}
              <span className="ar-reveal-word">comercial,</span>{' '}
              <span className="ar-reveal-word ar-gradient-gold">unificada</span>{' '}
              <span className="ar-reveal-word">e</span>{' '}
              <span className="ar-reveal-word ar-gradient-ai">inteligente.</span>
            </h1>
            <p>Marketplace, SaaS comercial e inteligência de negócios reunidos em uma só experiência. Produtos, vendedores e afiliados conectados em uma plataforma feita para crescer.</p>
            <div className="ar-hero-actions">
              <ArrowLink onClick={isSignedIn?onEnter:onSignIn}>{isSignedIn?'Acessar meu painel':'Começar agora'}</ArrowLink>
              <button className="ar-btn ar-btn-outline" onClick={()=>goTo('catalogo')}>Explorar marketplace <ArrowRight size={17}/></button>
            </div>
            <div className="ar-hero-foot">
              <span className="ar-avatar-cluster" aria-hidden="true"><i/><i/><i/><i/></span>
              <span>Produtos próprios e de afiliados <strong>em um só lugar</strong></span>
            </div>
            <div className="ar-hero-disclosure"><ShieldCheck size={15}/> Dados reais cadastrados por usuários; nenhuma venda ou comissão simulada.</div>
          </div>
          <OrbitVisual/>
        </div>
        <button className="ar-scroll-hint" onClick={()=>goTo('ecossistema')} aria-label="Descer para o ecossistema">SCROLL PARA DESCOBRIR <ChevronDown size={17}/></button>
      </section>

      <div className="ar-marquee" aria-label="Recursos da plataforma">
        <div className="ar-marquee-track">
          {[0,1].map(copy=><div className="ar-marquee-contents" key={copy}>
            {['MARKETPLACE','GESTÃO DE EMPRESAS','LINKS DE AFILIADOS','RADAR DE PRODUTOS','OPERAÇÃO DIGITAL','PAINEL SAAS'].map(item=>
              <span key={item}><span className="ar-marquee-star">✦</span>{item}</span>)}
          </div>)}
        </div>
      </div>
      <div className="ar-trust-strip"><div className="ar-container">
        <span><ShieldCheck size={17}/> Autenticação e permissões</span>
        <span><Store size={17}/> Vitrines individuais</span>
        <span><Link2 size={17}/> Links separados</span>
        <span><Globe2 size={17}/> Dados de origem identificada</span>
      </div></div>

      <section id="ecossistema" className="ar-section ar-ecosystem">
        <div className="ar-container">
          <div className="ar-centered-heading"><span className="ar-overline">O ECOSSISTEMA</span>
            <h2>Um ecossistema. <em className="ar-gradient-gold">Três forças.</em></h2>
            <p>Três experiências diferentes, conectadas na mesma plataforma. Da descoberta de produtos ao controle da sua empresa.</p>
          </div>
          <div className="ar-pillars">
            {pillars.map(p=>{
              const Icon=p.icon;
              return <article key={p.n} className={'ar-pillar ar-pillar-'+p.tone}>
                <div className="ar-pillar-top"><span className="ar-index">{p.n}</span><span className="ar-pill">{p.subtitle}</span></div>
                <div className="ar-pillar-icon"><Icon size={29}/></div>
                <h3>{p.title}</h3><p>{p.description}</p>
                <div className="ar-pillar-list">{p.points.map(pt=><span key={pt}><Check size={15}/>{pt}</span>)}</div>
                <button className="ar-pillar-cta" onClick={()=>p.n==='01'?goTo('catalogo'):onEnter()}>{p.n==='01'?'Explorar catálogo':'Conhecer no painel'}<ArrowUpRight size={15}/></button>
              </article>;
            })}
          </div>
        </div>
      </section>

      <ArenaHowItWorks onEnter={onEnter}/>

      <section id="catalogo" className="ar-section ar-catalog">
        <div className="ar-container">
          <div className="ar-section-heading">
            <div><span className="ar-overline">MARKETPLACE PÚBLICO</span>
              <h2>Descubra novas <em>possibilidades.</em></h2>
              <p>Um catálogo de produtos publicados por vendedores. Sem avaliações, preços ou descontos inventados.</p></div>
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
            <p>{catalog.length?'Experimente outro termo de busca ou selecione outra categoria.':'A vitrine exibirá apenas produtos reais depois que vendedores publicarem suas ofertas.'}</p>
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
            <div className="ar-radar-visual"><span className="ar-radar-ring ring-one"/><span className="ar-radar-ring ring-two"/><span className="ar-radar-ring ring-three"/><span className="ar-radar-line"/><span className="ar-radar-center"><Radar size={29}/><small>ANÁLISE</small></span></div>
            <div className="ar-radar-data">{kpis.map(it=><div key={it.label}><small>{it.label}</small><strong>{it.value}</strong><span>{it.note}</span></div>)}</div>
            <p className="ar-radar-disclaimer">Painel ilustrativo de critérios. Nenhum gráfico ou resultado financeiro foi fabricado.</p>
          </div>
        </div>
      </section>

      <section id="inteligencia" className="ar-section ar-intelligence">
        <div className="ar-container">
          <div className="ar-section-heading"><div><span className="ar-overline">O PRÓXIMO CAPÍTULO</span>
            <h2>Inteligência para o que <em>realmente importa.</em></h2>
            <p>Visão de evolução: automações e agentes comerciais só serão ativados após integração e testes.</p></div></div>
          <div className="ar-agent-grid">
            {[
              {icon:Activity,title:'Análises comerciais',description:'Acompanhe produtos publicados, dados informados e resultados registrados.'},
              {icon:Link2,title:'Central de afiliados',description:'Organize os links oficiais que você gera nas plataformas parceiras.'},
              {icon:Sparkles,title:'Agentes de IA',description:'Módulo planejado para trabalhar apenas com dados e ferramentas autorizadas.'}
            ].map((it,index)=>{const Icon=it.icon;return <article className={'ar-agent ar-agent-'+index} key={it.title}><div className="ar-agent-icon"><Icon size={23}/></div>
              <div><span>{index===2?'EM DESENVOLVIMENTO':'DISPONÍVEL NO PAINEL'}</span><h3>{it.title}</h3><p>{it.description}</p></div>
              {index<2&&<button onClick={onEnter} aria-label={'Abrir '+it.title}><ArrowUpRight size={18}/></button>}
            </article>;})}
          </div>
        </div>
      </section>

      <ArenaSecurity/>
      <ArenaFaq onEnter={onEnter}/>

      <section className="ar-final"><div className="ar-container"><span className="ar-overline">UM NOVO JEITO DE OPERAR</span>
        <h2>Seu negócio merece <em>outra dimensão.</em></h2>
        <p>Comece com sua vitrine, organize produtos e evolua sua operação em um só lugar.</p>
        <ArrowLink onClick={isSignedIn?onEnter:onSignIn}>{isSignedIn?'Abrir minha operação':'Criar minha conta'}</ArrowLink>
      </div></section>
    </main>
    <footer className="ar-footer"><div className="ar-container ar-footer-main"><BrandMark/>
      <p>Marketplace e gestão comercial unificados. Produtos, links e dados sem promessas artificiais de resultados.</p>
      <button onClick={onEnter}>Área do vendedor <ArrowUpRight size={16}/></button>
    </div><div className="ar-container ar-footer-bottom"><span>© 2026 GestãoFácil Vendas</span><span>Versão de evolução visual · Pagamentos internos não disponíveis</span></div></footer>
  </div>;
}

