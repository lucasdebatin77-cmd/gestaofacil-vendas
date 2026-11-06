
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleHelp, ExternalLink, FilePlus2, Globe2, Layers3, Link2, Package, Plus, ShieldCheck, Store, Users, Wallet2 } from 'lucide-react';

type Role = 'owner' | 'admin' | 'editor' | 'viewer';
type Product = {
  id:string; title:string; description?:string; category:string;
  kind:'own'|'affiliate'|'third_party'; price:number|null;
  imageUrl:string;status:'draft'|'published';createdAt:string;
};
type Link = {id:string;title:string;platform:string};
type Finance = {id:string;name:string;kind:'income'|'expense';amount:number;createdAt:string};
type Screen = 'dashboard'|'products'|'affiliates'|'radar'|'finance'|'integrations'|'team'|'profile';
type Props = {
  storeName:string;
  accountType:string;
  role:Role;
  products:Product[];
  links:Link[];
  finances:Finance[];
  onNavigate:(screen:Screen)=>void;
  onCreateProduct:()=>void;
  onOpenStore:()=>void;
};
const money = (value:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const labels = {own:'Produto próprio',affiliate:'Afiliado',third_party:'Terceiro'};
const roles = {owner:'Proprietário',admin:'Administrador',editor:'Editor',viewer:'Visualizador'};

export default function PremiumDashboard({storeName,accountType,role,products,links,finances,onNavigate,onCreateProduct,onOpenStore}:Props){
  const published = products.filter(p=>p.status==='published').length;
  const drafts = products.length - published;
  const income = finances.filter(f=>f.kind==='income').reduce((s,f)=>s+f.amount,0);
  const expenses = finances.filter(f=>f.kind==='expense').reduce((s,f)=>s+f.amount,0);
  const canEdit = role!=='viewer';
  const setup = [
    {title:'Identidade da loja',detail:'Nome público e informações do negócio',complete:!!storeName,screen:'profile' as Screen},
    {title:'Primeiro produto',detail:'Cadastre uma oferta no seu catálogo',complete:products.length>0,screen:'products' as Screen},
    {title:'Publicar uma oferta',detail:'Disponibilize produtos para visitantes',complete:published>0,screen:'products' as Screen},
    {title:'Central de afiliados',detail:'Organize links originais e de parceiros',complete:links.length>0,screen:'affiliates' as Screen}
  ];
  const progress = setup.filter(s=>s.complete).length;
  const recentProducts = [...products].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,5);
  return <div className="gf-premium-dashboard">
    <section className="gf-dashboard-hero">
      <div className="gf-dashboard-hero-text">
        <div className="gf-eyebrow"><span className="gf-live-dot"/> WORKSPACE / GESTÃO COMERCIAL</div>
        <div className="gf-dashboard-hero-heading">
          <span className="gf-dashboard-hero-overline">Seu centro de operações</span>
          <h1>Uma visão mais <em>clara</em> do seu negócio.</h1>
          <p>Gerencie suas ofertas, organize sua operação e acompanhe informações reais da empresa selecionada.</p>
        </div>
        <div className="gf-dashboard-hero-actions">
          {canEdit&&<button className="gf-action-primary" onClick={onCreateProduct}><Plus size={18}/> Novo produto <ArrowUpRight size={17}/></button>}
          <button className="gf-action-secondary" onClick={onOpenStore}><Globe2 size={17}/> Minha vitrine <ExternalLink size={15}/></button>
        </div>
        <div className="gf-dashboard-hero-meta"><span><ShieldCheck size={15}/> {roles[role]}</span><span>•</span><span>{accountType || 'Perfil não informado'}</span><span>•</span><span>{storeName||'Configure o nome da sua loja'}</span></div>
      </div>
      <div className="gf-dashboard-emblem" aria-hidden="true">
        <div className="gf-emblem-halo gf-halo-outer"/><div className="gf-emblem-halo gf-halo-mid"/>
        <div className="gf-emblem-glass"><img src="/gestaofacil-symbol.svg" alt=""/></div>
        <span className="gf-emblem-corner gf-emblem-corner-a"/>
        <span className="gf-emblem-corner gf-emblem-corner-b"/>
        <div className="gf-emblem-caption">GESTÃOFÁCIL <span>VENDAS</span></div>
      </div>
    </section>

    <div className="gf-dashboard-section-title">
      <div><span className="gf-eyebrow">PANORAMA DA OPERAÇÃO</span><h2>Indicadores do seu espaço</h2></div>
      <span className="gf-data-note"><ShieldCheck size={15}/> Dados cadastrados, sem simulações</span>
    </div>
    <div className="gf-metric-grid">
      {[
        {label:'Produtos cadastrados',value:products.length,description:'Total no catálogo',icon:Package,tone:'cyan',go:'products' as Screen},
        {label:'Produtos publicados',value:published,description:published===1?'1 oferta visível':'Ofertas visíveis',icon:Globe2,tone:'violet',go:'products' as Screen},
        {label:'Links de afiliados',value:links.length,description:'Links manuais registrados',icon:Link2,tone:'orange',go:'affiliates' as Screen},
        {label:'Saldo registrado',value:money(income-expenses),description:'Entradas − despesas manuais',icon:Wallet2,tone:'silver',go:'finance' as Screen}
      ].map(stat=>{const Icon=stat.icon;return <button key={stat.label} className={'gf-metric-card gf-tone-'+stat.tone} onClick={()=>onNavigate(stat.go)}>
        <div className="gf-metric-card-top"><span>{stat.label}</span><span className="gf-metric-icon"><Icon size={19}/></span></div>
        <strong className={typeof stat.value==='string'?'gf-money-value':''}>{stat.value}</strong>
        <div className="gf-metric-card-bottom"><span>{stat.description}</span><ArrowUpRight size={16}/></div>
      </button>;})}
    </div>

    <div className="gf-dashboard-grid">
      <section className="gf-dashboard-panel gf-panel-products">
        <div className="gf-dashboard-panel-header">
          <div><span className="gf-eyebrow">CATÁLOGO</span><h3>Produtos recentes</h3><p>{drafts} rascunho(s) e {published} publicado(s)</p></div>
          <button className="gf-mini-link" onClick={()=>onNavigate('products')}>Ver catálogo <ArrowRight size={16}/></button>
        </div>
        {recentProducts.length ? <div className="gf-product-rows">{recentProducts.map(p=>
          <button key={p.id} className="gf-dashboard-product-row" onClick={()=>onNavigate('products')}>
            <span className="gf-row-image">{p.imageUrl ? <img src={p.imageUrl} alt=""/> : <Package size={19}/>}</span>
            <span className="gf-row-description"><strong>{p.title}</strong><small>{p.category} · {labels[p.kind]}</small></span>
            <span className="gf-row-price">{p.price===null?'A consultar':money(p.price)}</span>
            <span className={'gf-row-status '+(p.status==='published'?'is-published':'is-draft')}>{p.status==='published'?'Publicado':'Rascunho'}</span>
            <ChevronRight size={16} className="gf-row-arrow"/>
          </button>
        )}</div>:
        <div className="gf-dashboard-empty"><span><Package size={26}/></span><strong>Seu catálogo começa aqui.</strong>
          <p>Cadastre produtos reais e publique sua primeira oferta no marketplace.</p>
          {canEdit&&<button onClick={onCreateProduct}>Cadastrar um produto <ArrowRight size={15}/></button>}
        </div>}
      </section>
      <section className="gf-dashboard-panel gf-panel-setup">
        <div className="gf-dashboard-panel-header"><div><span className="gf-eyebrow">CHECKLIST</span><h3>Preparação da loja</h3><p>Configure o essencial para vender</p></div><span className="gf-progress-count">{progress}/4</span></div>
        <div className="gf-progress-track"><span style={{width:(progress/4*100)+'%'}}/></div>
        <div className="gf-setup-rows">{setup.map((step,i)=>
          <button key={step.title} className="gf-setup-row" onClick={()=>onNavigate(step.screen)}>
            <span className={'gf-step-check '+(step.complete?'is-complete':'')}>{step.complete?<Check size={16}/>:String(i+1)}</span>
            <span><strong>{step.title}</strong><small>{step.detail}</small></span><ChevronRight size={16}/>
          </button>
        )}</div>
        <div className="gf-setup-footer"><ShieldCheck size={17}/> Todas as informações exibidas vêm dos registros desta empresa.</div>
      </section>
    </div>

    <div className="gf-secondary-grid">
      <section className="gf-secondary-panel"><span className="gf-secondary-icon"><Layers3 size={20}/></span>
        <div><strong>Empresa & equipe</strong><p>Gerencie a identidade pública e os acessos dos colaboradores.</p></div>
        <button onClick={()=>onNavigate('team')} aria-label="Abrir gestão de equipe"><ArrowUpRight size={19}/></button>
      </section>
      <section className="gf-secondary-panel"><span className="gf-secondary-icon"><CircleHelp size={20}/></span>
        <div><strong>Radar de produtos</strong><p>Critérios de análise transparentes, sem notas ou comissões presumidas.</p></div>
        <button onClick={()=>onNavigate('radar')} aria-label="Abrir Radar"><ArrowUpRight size={19}/></button>
      </section>
    </div>
  </div>;
}

