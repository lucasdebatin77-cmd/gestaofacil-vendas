import { useEffect, useMemo, useRef, useState } from 'react';
import { api, auth, invitesClient } from '@appdeploy/client';
import type { AuthUser } from '@appdeploy/client';
import { PublicExperience, OrgCreator, TeamPanel, DashboardUpgrade, roleLabels } from './V02';
import type { OrgSummary } from './V02';
import BrandIdentity from './BrandIdentity';
import PremiumDashboard from './PremiumDashboard';
import ArenaExperience from './ArenaExperience';
import './v02.css';
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Compass,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe2,
  Heart,
  Home,
  Layers3,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Radar,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  kind: 'own' | 'affiliate' | 'third_party';
  price: number | null;
  originalUrl: string;
  affiliateUrl: string;
  imageUrl: string;
  status: 'draft' | 'published';
  sellerName: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  storeId?: string;
};
type Link = {
  id: string;
  title: string;
  platform: string;
  originalUrl: string;
  affiliateUrl: string;
  createdAt: string;
};
type Finance = {
  id: string;
  name: string;
  kind: 'income' | 'expense';
  amount: number;
  createdAt: string;
  source: string;
};
type Profile = { storeName: string; accountType: string; description?: string };
type View =
  | 'marketplace'
  | 'dashboard'
  | 'products'
  | 'affiliates'
  | 'radar'
  | 'finance'
  | 'integrations'
  | 'team'
  | 'profile';
const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value
  );
const dateText = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
    new Date(value)
  );
const EMPTY_PRODUCT = {
  title: '',
  description: '',
  category: 'Moda e acessórios',
  kind: 'own',
  price: '',
  originalUrl: '',
  affiliateUrl: '',
  imageUrl: '',
};
const kinds: Record<string, string> = {
  own: 'Produto próprio',
  affiliate: 'Afiliado',
  third_party: 'Terceiro',
};
const platforms = [
  'Mercado Livre',
  'Shopee',
  'Amazon',
  'AliExpress',
  'Temu',
  'Magalu',
  'Hotmart',
  'Kiwify',
  'Eduzz',
  'Monetizze',
  'Braip',
  'Lomadee',
  'Awin',
];
const menu: { id: View; title: string; icon: typeof Home }[] = [
  { id: 'dashboard', title: 'Visão geral', icon: LayoutDashboard },
  { id: 'products', title: 'Meus produtos', icon: Package },
  { id: 'affiliates', title: 'Afiliados e links', icon: Link2 },
  { id: 'radar', title: 'Radar de produtos', icon: Radar },
  { id: 'finance', title: 'Financeiro', icon: WalletCards },
  { id: 'integrations', title: 'Integrações', icon: Layers3 },
  { id: 'team', title: 'Equipe e acessos', icon: Users },
  { id: 'profile', title: 'Minha loja', icon: Store },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <BrandIdentity compact={compact} />
    </div>
  );
}
function Placeholder({
  icon: Icon = Package,
  title,
  body,
  action,
}: {
  icon?: typeof Home;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-symbol">
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}
function CardProduct({
  item,
  open,
}: {
  item: Product;
  open: (p: Product) => void;
}) {
  return (
    <button
      className="product-card"
      onClick={() => open(item)}
      aria-label={'Ver ' + item.title}
    >
      <div className="product-cover">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} />
        ) : (
          <div className="product-placeholder">
            <Package size={34} />
            <span>Imagem não informada</span>
          </div>
        )}
        <div className="top-tag">{kinds[item.kind]}</div>
      </div>
      <div className="product-details">
        <div className="product-category">{item.category}</div>
        <h3>{item.title}</h3>
        <p>{item.sellerName || 'Loja parceira'}</p>
        <div className="product-bottom">
          <strong>
            {item.price === null ? 'Consultar preço' : currency(item.price)}
          </strong>
          <span className="icon-square">
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </button>
  );
}
function Alert({ value, clear }: { value: string; clear: () => void }) {
  return value ? (
    <div className="toast" role="alert">
      <span>{value}</span>
      <button onClick={clear}>
        <X size={15} />
      </button>
    </div>
  ) : null;
}

export default function GestaoFacil() {
  const [view, setView] = useState<View>('marketplace');
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [finances, setFinances] = useState<Finance[]>([]);
  const [profile, setProfile] = useState<Profile>({
    storeName: '',
    accountType: 'PF',
  });
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [selected, setSelected] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Record<string, string>>({
    ...EMPTY_PRODUCT,
  });
  const [linkForm, setLinkForm] = useState({
    title: '',
    platform: 'Mercado Livre',
    originalUrl: '',
    affiliateUrl: '',
  });
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [financeForm, setFinanceForm] = useState({
    name: '',
    kind: 'income',
    amount: '',
  });
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [deleteAsk, setDeleteAsk] = useState<{
    type: 'product' | 'link' | 'finance';
    id: string;
  } | null>(null);
  const [organizations, setOrganizations] = useState<OrgSummary[]>([]);
  const [orgId, setOrgId] = useState('');
  const [role, setRole] = useState<OrgSummary['role']>('owner');
  const [showOrgCreator, setShowOrgCreator] = useState(false);
  const [orgPickerOpen, setOrgPickerOpen] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const workspaceSeq = useRef(0);
  const [catalogCursor, setCatalogCursor] = useState<string | null>(null);
  const [catalogLoadingMore, setCatalogLoadingMore] = useState(false);
  const [publicRoute, setPublicRoute] = useState(() => window.location.hash.startsWith('#/') ? window.location.hash.slice(1).split('?')[0] : '');
  const canWrite = role === 'owner' || role === 'admin' || role === 'editor';
  const canAdmin = role === 'owner' || role === 'admin';
  const notify = (text: string) => {
    setNotice(text);
  };
  const loadCatalog = async () => {
    try {
      const response = await api.get('/api/v2/catalog');
      setCatalog(response.data.items || []);
      setCatalogCursor(response.data.nextCursor || null);
    } catch {
      notify('Não foi possível carregar o catálogo. Tente atualizar a página.');
    }
  };
  const loadMoreCatalog = async () => {
    if (!catalogCursor || catalogLoadingMore) return;
    setCatalogLoadingMore(true);
    try {
      const response = await api.get('/api/v2/catalog?cursor=' + encodeURIComponent(catalogCursor));
      setCatalog(previous => {
        const seen = new Set(previous.map(item => item.id));
        const fresh = (response.data.items || []) as Product[];
        return [...previous, ...fresh.filter(item => !seen.has(item.id))];
      });
      setCatalogCursor(response.data.nextCursor || null);
    } catch {
      notify('Erro ao carregar mais ofertas. Tente novamente.');
    } finally {
      setCatalogLoadingMore(false);
    }
  };
  const loadWorkspace = async (selectedOrg?: string): Promise<boolean> => {
    const requestId = ++workspaceSeq.current;
    setWorkspaceLoading(true);
    try {
      const chosen = selectedOrg || orgId;
      const response = await api.get('/api/v2/workspace' + (chosen ? '?orgId=' + encodeURIComponent(chosen) : ''));
      if (requestId !== workspaceSeq.current) return false;
      setProducts(response.data.products || []);
      setLinks(response.data.links || []);
      setFinances(response.data.finances || []);
      setProfile(response.data.profile || { storeName: '', accountType: 'PF' });
      setOrganizations(response.data.organizations || []);
      setOrgId(response.data.organization.id);
      setRole(response.data.organization.role);
      return true;
    } catch {
      if (requestId === workspaceSeq.current)
        notify('Não foi possível carregar seu espaço. Verifique suas permissões e tente novamente.');
      return false;
    } finally {
      if (requestId === workspaceSeq.current) setWorkspaceLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    const init = async () => {
      const results = await Promise.allSettled([
        auth.getUser(),
        api.get('/api/v2/catalog'),
      ]);
      if (!active) return;
      const current =
        results[0].status === 'fulfilled' ? results[0].value : null;
      if (results[0].status === 'rejected')
        notify(
          'Não foi possível restaurar sua sessão. Você pode tentar entrar novamente.'
        );
      if (results[1].status === 'fulfilled') {
        setCatalog(results[1].value.data.items || []);
        setCatalogCursor(results[1].value.data.nextCursor || null);
      }
      setUser(current);
      setAuthReady(true);
      if (current) {
        let preferred = '';
        try { preferred = window.localStorage.getItem('gf_org_' + current.userId) || ''; } catch { /* optional */ }
        const loaded = await loadWorkspace(preferred || undefined);
        if (!loaded && preferred) await loadWorkspace();
      }
    };
    void init();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const update = () => setPublicRoute(window.location.hash.startsWith('#/') ? window.location.hash.slice(1).split('?')[0] : '');
    const code = invitesClient.getPendingCode();
    if (code && !window.location.hash.startsWith('#/join')) window.location.hash = '/join';
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const navigate = (next: View) => {
    if (window.location.hash.startsWith('#/')) {
      window.location.hash = '';
      setPublicRoute('');
    }
    setView(next);
    setMenuOpen(false);
    setSelected(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openPublicProduct = (pid: string) => {
    setView('marketplace'); setSelected(null);
    window.location.hash = '/produto/' + encodeURIComponent(pid);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const openPublicStore = (sid: string) => {
    if (!sid) { notify('Loja não encontrada.'); return; }
    setView('marketplace'); setSelected(null);
    window.location.hash = '/loja/' + encodeURIComponent(sid);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const switchOrganization = async (next: string) => {
    setOrgPickerOpen(false);
    const previous = orgId;
    const ok = await loadWorkspace(next);
    if (!ok) await loadWorkspace(previous);
    else try { if (user) window.localStorage.setItem('gf_org_' + user.userId,next); } catch { /* optional */ }
  };
  const scoped = (path: string) => path + (path.includes('?') ? '&' : '?') + 'orgId=' + encodeURIComponent(orgId);
  const signIn = async () => {
    try {
      setBusy(true);
      await auth.signInWithRedirect();
    } catch (e) {
      setBusy(false);
      notify(
        'Não foi possível abrir o login. Verifique as permissões do navegador e tente novamente.'
      );
    }
  };
  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setProducts([]);
      setLinks([]);
      setFinances([]);
      setOrganizations([]);
      setOrgId('');
      setOrgPickerOpen(false);
      workspaceSeq.current += 1;
      navigate('marketplace');
    } catch {
      notify('Não foi possível sair da sua conta.');
    }
  };
  const enterSaas = () => (user ? navigate('dashboard') : void signIn());
  const visibleCatalog = useMemo(
    () =>
      catalog.filter(
        p =>
          (kindFilter === 'all' || p.kind === kindFilter) &&
          (p.title + ' ' + p.category + ' ' + p.sellerName)
            .toLocaleLowerCase('pt-BR')
            .includes(search.toLocaleLowerCase('pt-BR'))
      ),
    [catalog, kindFilter, search]
  );
  const financeIncome = finances
    .filter(f => f.kind === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  const financeExpense = finances
    .filter(f => f.kind === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);
  const publishedCount = products.filter(p => p.status === 'published').length;
  const request = async (action: () => Promise<void>, message: string) => {
    try {
      setBusy(true);
      await action();
      notify(message);
    } catch (e) {
      const value = e as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      notify(
        value?.response?.data?.error ||
          value?.response?.data?.message ||
          value?.message ||
          'Ocorreu um erro. Tente novamente.'
      );
    } finally {
      setBusy(false);
    }
  };
  const addProduct = () => {
    if (!productForm.title.trim()) {
      notify('Informe um nome para o produto.');
      return;
    }
    void request(
      async () => {
        if (editing)
          await api.put(
            '/api/v2/products/' + encodeURIComponent(editing),
            { ...productForm, orgId }
          );
        else await api.post('/api/v2/products', { ...productForm, orgId });
        await loadWorkspace();
        setShowProductForm(false);
        setEditing(null);
        setProductForm({ ...EMPTY_PRODUCT });
      },
      editing ? 'Produto atualizado.' : 'Produto cadastrado como rascunho.'
    );
  };
  const editProduct = (p: Product) => {
    setProductForm({
      title: p.title,
      description: p.description,
      category: p.category,
      kind: p.kind,
      price: p.price === null ? '' : String(p.price),
      originalUrl: p.originalUrl,
      affiliateUrl: p.affiliateUrl,
      imageUrl: p.imageUrl,
    });
    setEditing(p.id);
    setShowProductForm(true);
  };
  const publish = (p: Product) => {
    if (
      p.status === 'draft' &&
      !window.confirm(
        'Publicar este produto no marketplace público? Ele ficará visível para qualquer visitante.'
      )
    )
      return;
    void request(
      async () => {
        await api.post(
          scoped('/api/v2/products/' +
            encodeURIComponent(p.id) +
            (p.status === 'published' ? '/unpublish' : '/publish'))
        );
        await Promise.all([loadWorkspace(), loadCatalog()]);
      },
      p.status === 'published'
        ? 'Produto retirado do marketplace.'
        : 'Produto publicado no marketplace.'
    );
  };
  const confirmDelete = () => {
    if (!deleteAsk) return;
    const { type, id } = deleteAsk;
    void request(async () => {
      await api.delete(
        '/api/v2/' +
          (type === 'product'
            ? 'products'
            : type === 'link'
              ? 'links'
              : 'finances') +
          '/' +
          encodeURIComponent(id) + '?orgId=' + encodeURIComponent(orgId)
      );
      await Promise.all([loadWorkspace(), loadCatalog()]);
      setDeleteAsk(null);
    }, 'Registro excluído.');
  };
  const addLink = () =>
    void request(async () => {
      await api.post('/api/v2/links', { ...linkForm, orgId });
      await loadWorkspace();
      setShowLinkForm(false);
      setLinkForm({
        title: '',
        platform: 'Mercado Livre',
        originalUrl: '',
        affiliateUrl: '',
      });
    }, 'Link de afiliado salvo.');
  const addFinance = () =>
    void request(async () => {
      await api.post('/api/v2/finances', { ...financeForm, orgId });
      await loadWorkspace();
      setShowFinanceForm(false);
      setFinanceForm({ name: '', kind: 'income', amount: '' });
    }, 'Lançamento manual salvo.');
  const saveProfile = () =>
    void request(async () => {
      await api.put('/api/v2/profile', { ...profile, orgId });
      await loadWorkspace();
    }, 'Dados da loja atualizados.');
  const goDestination = (p: Product) => {
    const url =
      p.kind === 'affiliate' ? p.affiliateUrl : p.originalUrl || p.affiliateUrl;
    if (!url) {
      notify('Este produto não possui link de destino válido.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const headerAction =
    authReady && user ? (
      <button className="nav-dashboard" onClick={() => navigate('dashboard')}>
        <LayoutDashboard size={16} /> Meu painel <ArrowUpRight size={15} />
      </button>
    ) : (
      <button
        className="nav-dashboard"
        onClick={signIn}
        disabled={!authReady || busy}
      >
        <LockKeyhole size={15} /> Entrar / Criar conta{' '}
        <ArrowUpRight size={15} />
      </button>
    );
  if (view === 'marketplace' && !publicRoute) {
    return (
      <>
        <ArenaExperience
          catalog={catalog}
          hasMore={!!catalogCursor}
          loadingMore={catalogLoadingMore}
          onMore={() => void loadMoreCatalog()}
          onProduct={openPublicProduct}
          onEnter={enterSaas}
          onSignIn={() => void signIn()}
          isSignedIn={!!user}
          authReady={authReady}
        />
        <Alert value={notice} clear={() => setNotice('')} />
      </>
    );
  }
  return (
    <div className="app-shell arena-workspace">
      {view === 'marketplace' ? (
        <>
          <div className="announcement">
            <span className="announcement-dot"></span> VERSÃO 0.2.1 · EXPERIENCE EDITION{' '}
            <span className="announcement-line"></span> Marketplace em
            construção · pagamentos não disponíveis
          </div>
          <header className="public-nav">
            <div className="public-nav-inner">
              <button className="bare" onClick={() => navigate('marketplace')}>
                <Brand />
              </button>
              <nav className="public-links">
                <a href="#catalogo">Explorar produtos</a>
                <a href="#como-funciona">Como funciona</a>
                <button onClick={enterSaas}>Para vendedores</button>
              </nav>
              {headerAction}
            </div>
          </header>
          <main>
            {publicRoute ? (
              <PublicExperience
                route={publicRoute}
                onBack={() => navigate('marketplace')}
                onProduct={openPublicProduct}
                onStore={openPublicStore}
                userSignedIn={!!user}
                onSignIn={() => void signIn()}
                onJoined={id => {
                  void loadWorkspace(id).then(ok => {
                    if (ok) {
                      try { if (user) window.localStorage.setItem('gf_org_' + user.userId,id); } catch { /* optional */ }
                      navigate('dashboard');
                    }
                  });
                }}
                notify={notify}
              />
            ) : (
              <>
                <section className="hero">
              <div className="hero-noise"></div>
              <div className="hero-content">
                <div className="eyebrow">
                  <Sparkles size={13} /> COMÉRCIO INTELIGENTE, EM UM SÓ LUGAR{' '}
                  <span></span>
                </div>
                <h1>
                  O próximo nível do <em>comércio digital.</em>
                </h1>
                <p>
                  Descubra produtos, conecte negócios e transforme informação em
                  decisões melhores. Uma plataforma para quem compra, vende e
                  empreende.
                </p>
                <div className="hero-actions">
                  <a href="#catalogo" className="btn-primary">
                    Explorar marketplace <ArrowUpRight size={18} />
                  </a>
                  <button onClick={enterSaas} className="btn-outline">
                    Acessar minha operação <ArrowRight size={17} />
                  </button>
                </div>
                <div className="hero-footnote">
                  <ShieldCheck size={17} /> Preços, links e informações com
                  origem identificada.
                </div>
              </div>
              <div
                className="hero-art"
                aria-label="Representação conceitual da plataforma"
              >
                <div className="art-glow"></div>
                <div className="art-grid"></div>
                <div className="art-main">
                  <div className="art-head">
                    <span className="art-dot blue"></span>
                    <span className="art-dot pink"></span>
                    <span className="art-dot yellow"></span>
                    <span className="art-head-title">
                      GESTÃOFÁCIL / PLATAFORMA
                    </span>
                  </div>
                  <div className="art-body">
                    <div className="art-upper">
                      <span>COMÉRCIO EM MOVIMENTO</span>
                      <Activity size={18} />
                    </div>
                    <div className="art-big-logo">
                      <Layers3 size={52} />
                      <span>
                        ONE <b>ECOSYSTEM</b>
                      </span>
                    </div>
                    <div className="art-line"></div>
                    <div className="art-metrics">
                      <span>
                        <ShoppingBag size={17} /> MARKETPLACE
                      </span>
                      <span>
                        <Radar size={17} /> INTELIGÊNCIA
                      </span>
                    </div>
                    <div className="art-bars">
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>
                  </div>
                </div>
                <div className="art-chip chip-top">
                  <span className="art-chip-icon">
                    <Store size={17} />
                  </span>
                  <span>
                    <strong>Sua vitrine digital</strong>
                    <small>Produtos e marcas</small>
                  </span>
                  <CheckCircle2 size={16} />
                </div>
                <div className="art-chip chip-bottom">
                  <span className="art-chip-icon">
                    <Radar size={17} />
                  </span>
                  <span>
                    <strong>Radar de oportunidades</strong>
                    <small>Análise baseada em dados</small>
                  </span>
                  <ArrowUpRight size={16} />
                </div>
                <span className="art-caption">
                  VISUALIZAÇÃO CONCEITUAL · SEM MÉTRICAS SIMULADAS
                </span>
              </div>
            </section>
            <div className="trust-band">
              <span>
                <ShieldCheck size={19} /> Dados com transparência
              </span>
              <span>
                <Store size={19} /> Produtos próprios e afiliados
              </span>
              <span>
                <Layers3 size={19} /> Tudo em uma plataforma
              </span>
              <span>
                <LockKeyhole size={19} /> Segurança por conta
              </span>
            </div>
            <section className="catalog-section" id="catalogo">
              <div className="section-kicker">
                EXPLORE O MARKETPLACE <span></span>
              </div>
              <div className="section-heading">
                <div>
                  <h2>
                    Encontre o que <em>importa.</em>
                  </h2>
                  <p>
                    Um catálogo em evolução, com ofertas publicadas pelos
                    vendedores.
                  </p>
                </div>
                <div className="catalog-count">
                  <span className="green-dot"></span> {catalog.length}{' '}
                  {catalogCursor
                    ? 'ofertas carregadas'
                    : catalog.length === 1
                      ? 'produto publicado'
                      : 'produtos publicados'}
                </div>
              </div>
              <div className="catalog-controls">
                <div className="search-field">
                  <Search size={19} />
                  <input
                    aria-label="Buscar produtos"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Busque produtos, marcas ou categorias"
                  />
                  <span>BUSCAR</span>
                </div>
                <div className="filter-row">
                  {[
                    { v: 'all', n: 'Todos os produtos' },
                    { v: 'own', n: 'Lojas' },
                    { v: 'affiliate', n: 'Afiliados' },
                    { v: 'third_party', n: 'Terceiros' },
                  ].map(k => (
                    <button
                      key={k.v}
                      className={
                        'filter-chip ' + (kindFilter === k.v ? 'chosen' : '')
                      }
                      onClick={() => setKindFilter(k.v)}
                    >
                      {k.n}
                    </button>
                  ))}
                </div>
              </div>
              {visibleCatalog.length > 0 ? (
                <div className="product-grid">
                  {visibleCatalog.map(p => (
                    <CardProduct key={p.id} item={p} open={p => openPublicProduct(p.id)} />
                  ))}
                </div>
              ) : (
                <Placeholder
                  icon={Search}
                  title={
                    catalog.length
                      ? 'Nenhum resultado encontrado'
                      : 'Em breve, novas ofertas aqui'
                  }
                  body={
                    catalog.length
                      ? 'Tente outro termo ou remova os filtros.'
                      : 'Nosso marketplace está em implantação. Produtos reais aparecerão assim que os primeiros vendedores publicarem suas ofertas.'
                  }
                  action={
                    <button className="btn-small" onClick={enterSaas}>
                      Quero cadastrar um produto <ArrowRight size={15} />
                    </button>
                  }
                />
              )}
              {catalogCursor && (
                <div className="lux-catalog-more">
                  <button className="v2-link-outline" disabled={catalogLoadingMore} onClick={() => void loadMoreCatalog()}>
                    {catalogLoadingMore ? 'Carregando ofertas...' : 'Carregar mais produtos'}
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </section>
            <section className="feature-section" id="como-funciona">
              <div className="feature-side">
                <div className="section-kicker">FEITO PARA QUEM EMPREENDE</div>
                <h2>
                  Mais que uma vitrine. <em>Uma operação completa.</em>
                </h2>
                <p>
                  Produtos, links de afiliados, organização financeira e
                  inteligência de dados conectados por uma experiência única.
                </p>
                <button className="feature-cta" onClick={enterSaas}>
                  Conhecer meu painel <ArrowUpRight size={18} />
                </button>
              </div>
              <div className="feature-list">
                <div>
                  <span>
                    <Package size={23} />
                  </span>
                  <section>
                    <h3>Catálogo e marketplace</h3>
                    <p>
                      Gerencie produtos e escolha quais aparecem na vitrine
                      pública.
                    </p>
                  </section>
                  <ArrowUpRight size={17} />
                </div>
                <div>
                  <span>
                    <Link2 size={23} />
                  </span>
                  <section>
                    <h3>Links e campanhas de afiliados</h3>
                    <p>
                      Organize os links originais e de afiliados sem misturar
                      informações.
                    </p>
                  </section>
                  <ArrowUpRight size={17} />
                </div>
                <div>
                  <span>
                    <Radar size={23} />
                  </span>
                  <section>
                    <h3>Radar de produtos</h3>
                    <p>
                      Visualize a qualidade dos dados e os critérios ainda não
                      verificados.
                    </p>
                  </section>
                  <ArrowUpRight size={17} />
                </div>
              </div>
            </section>
            <section className="end-cta">
              <div className="section-kicker">COMECE SUA JORNADA</div>
              <h2>
                Seu negócio pode começar <em>por aqui.</em>
              </h2>
              <p>Crie sua conta e organize sua presença comercial.</p>
              <button className="btn-primary" onClick={enterSaas}>
                Abrir meu espaço <ArrowUpRight size={18} />
              </button>
            </section>
              </>
            )}
          </main>
          <footer>
            <Brand />
            <span>
              © 2026 GestãoFácil Vendas · Versão 0.2.1 em desenvolvimento
            </span>
            <button onClick={enterSaas}>
              Área do vendedor <ArrowUpRight size={15} />
            </button>
          </footer>
        </>
      ) : (
        <>
          <div className="workspace">
            <aside className={'sidebar ' + (menuOpen ? 'sidebar-open' : '')}>
              <div className="side-top">
                <button
                  className="bare"
                  onClick={() => navigate('marketplace')}
                >
                  <Brand />
                </button>
                <button
                  className="close-side"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="lux-org-switcher" onKeyDown={event => {
                if (event.key === 'Escape') setOrgPickerOpen(false);
              }}>
                <button
                  type="button"
                  className="lux-org-trigger"
                  aria-haspopup="menu"
                  aria-controls="gf-org-menu"
                  aria-expanded={orgPickerOpen}
                  onClick={() => setOrgPickerOpen(current => !current)}
                >
                  <span className="lux-org-symbol"><Store size={20} /></span>
                  <span className="lux-org-info">
                    <b>EMPRESA ATIVA</b>
                    <strong>{profile.storeName || 'Meu espaço de trabalho'}</strong>
                    <small>{roleLabels[role]} · {profile.accountType}</small>
                  </span>
                  <ChevronDown className="lux-org-chevron" size={16} />
                </button>
                <button
                  type="button"
                  className="lux-org-create"
                  aria-label="Criar nova empresa"
                  title="Criar empresa"
                  onClick={() => { setOrgPickerOpen(false); setShowOrgCreator(true); }}
                ><Plus size={19} /></button>
                {orgPickerOpen && (
                  <>
                    <button type="button" className="lux-org-dismiss" aria-label="Fechar seletor de empresas" onClick={() => setOrgPickerOpen(false)} />
                    <div id="gf-org-menu" className="lux-org-picker" role="menu">
                      <div className="lux-org-picker-label">Alternar espaço</div>
                      {organizations.map(org => (
                        <button
                          role="menuitem"
                          type="button"
                          className={'lux-org-option ' + (org.id === orgId ? 'selected' : '')}
                          key={org.id}
                          onClick={() => void switchOrganization(org.id)}
                        >
                          <span>
                            <strong>{org.storeName || 'Minha empresa'}</strong>
                            <small>{org.accountType} · {roleLabels[org.role]}</small>
                          </span>
                          {org.id === orgId && <Check size={16} />}
                        </button>
                      ))}
                      <button
                        type="button"
                        role="menuitem"
                        className="lux-org-picker-new"
                        onClick={() => { setOrgPickerOpen(false); setShowOrgCreator(true); }}
                      ><Plus size={16} /> Criar outra empresa</button>
                    </div>
                  </>
                )}
              </div>
              <span className="v2-side-role">{organizations.length} {organizations.length === 1 ? 'espaço disponível' : 'espaços disponíveis'}</span>
              <div className="nav-label">PRINCIPAL</div>
              <nav className="side-menu">
                {menu.slice(0,4).map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => navigate(m.id)}
                      aria-current={view === m.id ? 'page' : undefined}
                      className={'side-link ' + (view === m.id ? 'active' : '')}
                    >
                      <Icon size={18} />
                      <span>{m.title}</span>
                      {view === m.id && <ChevronRight size={15} />}
                    </button>
                  );
                })}
              </nav>
              <div className="nav-label gf-nav-group">GESTÃO E CONFIGURAÇÕES</div>
              <nav className="side-menu">
                {menu.slice(4).map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => navigate(m.id)}
                      aria-current={view === m.id ? 'page' : undefined}
                      className={'side-link ' + (view === m.id ? 'active' : '')}
                    >
                      <Icon size={18} />
                      <span>{m.title}</span>
                      {view === m.id && <ChevronRight size={15} />}
                    </button>
                  );
                })}
              </nav>
              <div className="side-bottom">
                <div className="side-card">
                  <Sparkles size={21} />
                  <h4>Seu negócio, organizado.</h4>
                  <p>Comece com produtos reais e construa sua operação.</p>
                  <button onClick={() => navigate('products')}>
                    {canWrite ? 'Cadastrar produto' : 'Visualizar produtos'} <ArrowRight size={14} />
                  </button>
                </div>
                <button
                  className="side-public"
                  onClick={() => navigate('marketplace')}
                >
                  <Globe2 size={17} /> Ver marketplace{' '}
                  <ExternalLink size={15} />
                </button>
                <button className="side-public" onClick={signOut}>
                  <LogOut size={17} /> Sair da conta
                </button>
              </div>
            </aside>
            {menuOpen && (
              <button
                className="side-scrim"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
              />
            )}
            <div className="work-main">
              <header className="work-header">
                <button
                  className="mobile-menu"
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu size={22} />
                </button>
                <div className="breadcrumb">
                  <span>GestãoFácil</span>
                  <ChevronRight size={15} />
                  <strong>
                    {menu.find(m => m.id === view)?.title || 'Painel'}
                  </strong>
                </div>
                <div className="work-header-right">
                  <span className="build-label">
                    <span className="green-dot"></span> BETA · HOMOLOGAÇÃO
                  </span>
                  <button
                    className="round-header"
                    onClick={() => navigate('integrations')}
                    title="Integrações"
                  >
                    <Settings2 size={18} />
                  </button>
                  <button
                    className="avatar"
                    onClick={() => navigate('profile')}
                  >
                    {(user?.name || user?.email || 'U')
                      .slice(0, 1)
                      .toUpperCase()}
                  </button>
                </div>
              </header>
              <main className="work-content">
                {workspaceLoading && <div className="lux-work-loading" role="status"><Sparkles size={18} /> Atualizando dados da empresa selecionada...</div>}
                {role === 'viewer' && <div className="v2-readonly">Acesso de visualização: você pode consultar os dados desta empresa, mas não alterar produtos, links ou lançamentos.</div>}
                {view === 'dashboard' && !workspaceLoading && (
                  <PremiumDashboard
                    storeName={profile.storeName}
                    accountType={profile.accountType}
                    role={role}
                    products={products}
                    links={links}
                    finances={finances}
                    onNavigate={navigate}
                    onCreateProduct={() => {
                      setEditing(null);
                      setProductForm({ ...EMPTY_PRODUCT });
                      navigate('products');
                      setShowProductForm(true);
                    }}
                    onOpenStore={() => openPublicStore(orgId)}
                  />
                )}
                {view === 'products' && !workspaceLoading && (
                  <>
                    <div className="page-intro">
                      <div>
                        <span className="page-kicker">GESTÃO DE CATÁLOGO</span>
                        <h1>
                          Meus <em>produtos.</em>
                        </h1>
                        <p>
                          Cadastre, edite e publique produtos. A compra ocorre
                          no link externo informado.
                        </p>
                      </div>
                      <button
                        className="work-button"
                        disabled={!canWrite}
                        onClick={() => {
                          setEditing(null);
                          setProductForm({ ...EMPTY_PRODUCT });
                          setShowProductForm(true);
                        }}
                      >
                        <Plus size={17} /> Novo produto
                      </button>
                    </div>
                    <div className="section-note">
                      <ShieldCheck size={17} /> Dados de produtos são informados
                      manualmente. Nenhum preço, estoque ou comissão foi
                      verificado por integração.
                    </div>
                    <div className="panel list-panel">
                      <div className="panel-head">
                        <h3>
                          Catálogo{' '}
                          <span className="muted-count">{products.length}</span>
                        </h3>
                        <span className="muted-mini">Minha conta</span>
                      </div>
                      {products.length === 0 ? (
                        <Placeholder
                          title="Seu catálogo começa aqui"
                          body="Adicione produtos próprios, de terceiros ou promovidos por afiliados. Nada será publicado sem sua confirmação."
                          action={
                            <button
                              className="btn-small"
                              disabled={!canWrite}
                              onClick={() => setShowProductForm(true)}
                            >
                              Cadastrar primeiro produto <Plus size={15} />
                            </button>
                          }
                        />
                      ) : (
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Produto</th>
                                <th>Tipo</th>
                                <th>Preço manual</th>
                                <th>Situação</th>
                                <th>Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.map(p => (
                                <tr key={p.id}>
                                  <td>
                                    <div className="gf-catalog-row">
                                      <span className="gf-catalog-thumb">
                                        {p.imageUrl ? <img src={p.imageUrl} alt="" loading="lazy"/> : <Package size={20}/>}
                                      </span>
                                      <span className="gf-catalog-info">
                                        <strong>{p.title}</strong>
                                        <small>{p.category} · {dateText(p.createdAt)}</small>
                                      </span>
                                    </div>
                                  </td>
                                  <td>{kinds[p.kind]}</td>
                                  <td>
                                    {p.price === null
                                      ? 'Não disponível'
                                      : currency(p.price)}
                                  </td>
                                  <td>
                                    <span
                                      className={
                                        'status ' +
                                        (p.status === 'published'
                                          ? 'published'
                                          : 'draft')
                                      }
                                    >
                                      {p.status === 'published'
                                        ? 'Publicado'
                                        : 'Rascunho'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="row-actions">
                                      <button
                                        title="Editar"
                                        disabled={!canWrite}
                                        onClick={() => editProduct(p)}
                                      >
                                        <Settings2 size={17} />
                                      </button>
                                      <button
                                        title={
                                          p.status === 'published'
                                            ? 'Retirar da vitrine'
                                            : 'Publicar no marketplace'
                                        }
                                        disabled={!canWrite}
                                        onClick={() => publish(p)}
                                      >
                                        <Globe2 size={17} />
                                      </button>
                                      <button
                                        title="Excluir"
                                        disabled={!canWrite}
                                        onClick={() =>
                                          setDeleteAsk({
                                            type: 'product',
                                            id: p.id,
                                          })
                                        }
                                      >
                                        <Trash2 size={17} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {view === 'affiliates' && !workspaceLoading && (
                  <>
                    <div className="page-intro">
                      <div>
                        <span className="page-kicker">
                          AFILIADOS E PARCEIROS
                        </span>
                        <h1>
                          Seus links. <em>Seu controle.</em>
                        </h1>
                        <p>
                          Organize os links oficiais que você mesmo gerar nas
                          plataformas parceiras.
                        </p>
                      </div>
                      <button
                        className="work-button"
                        onClick={() => setShowLinkForm(true)}
                      >
                        <Plus size={17} /> Adicionar link
                      </button>
                    </div>
                    <div className="stat-grid compact">
                      <div className="stat-card">
                        <div>
                          <span>Links cadastrados</span>
                          <Link2 size={19} />
                        </div>
                        <strong>{links.length}</strong>
                        <small>Informados manualmente</small>
                      </div>
                      <div className="stat-card">
                        <div>
                          <span>Plataformas usadas</span>
                          <Layers3 size={19} />
                        </div>
                        <strong>
                          {new Set(links.map(l => l.platform)).size}
                        </strong>
                        <small>Sem conexões automáticas</small>
                      </div>
                      <div className="stat-card">
                        <div>
                          <span>Cliques verificados</span>
                          <Activity size={19} />
                        </div>
                        <strong>—</strong>
                        <small>Rastreamento não integrado</small>
                      </div>
                    </div>
                    <div className="panel list-panel">
                      <div className="panel-head">
                        <h3>Links organizados</h3>
                        <span className="muted-mini">
                          Origem e destino separados
                        </span>
                      </div>
                      {links.length === 0 ? (
                        <Placeholder
                          icon={Link2}
                          title="Nenhum link registrado"
                          body="Salve a URL original e seu link de afiliado gerado pela própria plataforma. Não criamos links de comissão automaticamente."
                          action={
                            <button
                              className="btn-small"
                              onClick={() => setShowLinkForm(true)}
                            >
                              Adicionar link <Plus size={15} />
                            </button>
                          }
                        />
                      ) : (
                        links.map(l => (
                          <div className="link-row" key={l.id}>
                            <span className="small-product-icon">
                              <Link2 size={19} />
                            </span>
                            <div>
                              <strong>{l.title}</strong>
                              <small>
                                {l.platform} · Informado manualmente ·{' '}
                                {dateText(l.createdAt)}
                              </small>
                              <div className="link-row-urls">
                                <a
                                  href={l.originalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  URL original <ExternalLink size={13} />
                                </a>
                                <a
                                  href={l.affiliateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Link de afiliado <ExternalLink size={13} />
                                </a>
                              </div>
                            </div>
                            <button
                              className="icon-outline"
                              title="Excluir"
                              onClick={() =>
                                setDeleteAsk({ type: 'link', id: l.id })
                              }
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
                {view === 'radar' && !workspaceLoading && (
                  <>
                    <div className="page-intro">
                      <div>
                        <span className="page-kicker">
                          INTELIGÊNCIA COMERCIAL
                        </span>
                        <h1>
                          Radar de <em>produtos.</em>
                        </h1>
                        <p>
                          Transparência sobre as evidências disponíveis e o que
                          ainda precisa ser verificado.
                        </p>
                      </div>
                      <span className="coming-chip">
                        <Radar size={16} /> Modo inicial
                      </span>
                    </div>
                    <div className="radar-explain">
                      <div className="radar-orbit">
                        <Radar size={40} />
                      </div>
                      <div>
                        <div className="page-kicker">
                          SEM PONTUAÇÕES FICTÍCIAS
                        </div>
                        <h2>A decisão começa nos dados.</h2>
                        <p>
                          A pontuação 0–100 dependerá de demanda oficial,
                          avaliações, preço competitivo, comissão confirmada,
                          qualidade do vendedor e atualização. Como ainda não
                          existem conectores oficiais, não calculamos pontuação
                          nem projetamos vendas.
                        </p>
                      </div>
                    </div>
                    <div className="panel list-panel">
                      <div className="panel-head">
                        <div>
                          <h3>Produtos em análise</h3>
                          <p>
                            {products.length} produtos cadastrados na sua conta
                          </p>
                        </div>
                        <button
                          className="text-action"
                          onClick={() => navigate('products')}
                        >
                          Gerenciar <ArrowRight size={16} />
                        </button>
                      </div>
                      {products.length === 0 ? (
                        <Placeholder
                          icon={Radar}
                          title="O Radar começa no seu catálogo"
                          body="Cadastre produtos para analisar a disponibilidade dos dados. O sistema não inventará demanda, notas ou comissões."
                        />
                      ) : (
                        products.map(p => (
                          <div className="radar-row" key={p.id}>
                            <span className="small-product-icon">
                              <Package size={19} />
                            </span>
                            <div>
                              <strong>{p.title}</strong>
                              <small>
                                {kinds[p.kind]} · Dados manuais · Atualizado em{' '}
                                {dateText(p.updatedAt)}
                              </small>
                            </div>
                            <span className="radar-status">
                              Sem pontuação <small>Dados insuficientes</small>
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="weights-grid">
                      {[
                        { w: 25, t: 'Demanda / ranking oficial' },
                        { w: 20, t: 'Nota média verificada' },
                        { w: 15, t: 'Avaliações e recência' },
                        { w: 10, t: 'Competitividade do preço' },
                        { w: 15, t: 'Comissão confirmada' },
                        { w: 10, t: 'Qualidade da página/vendedor' },
                        { w: 5, t: 'Atualidade dos dados' },
                      ].map(s => (
                        <div className="weight" key={s.t}>
                          <span>{s.w} pts</span>
                          <strong>{s.t}</strong>
                          <small>Não avaliado</small>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {view === 'finance' && !workspaceLoading && (
                  <>
                    <div className="page-intro">
                      <div>
                        <span className="page-kicker">GESTÃO FINANCEIRA</span>
                        <h1>
                          Clareza para <em>crescer.</em>
                        </h1>
                        <p>
                          Registre suas entradas e despesas manualmente. Sem
                          simular vendas recebidas.
                        </p>
                      </div>
                      <button
                        className="work-button"
                        onClick={() => setShowFinanceForm(true)}
                      >
                        <Plus size={17} /> Novo lançamento
                      </button>
                    </div>
                    <div className="stat-grid compact">
                      <div className="stat-card">
                        <div>
                          <span>Entradas manuais</span>
                          <ArrowDownRight size={19} />
                        </div>
                        <strong className="money-stat">
                          {currency(financeIncome)}
                        </strong>
                        <small>Não verificadas por pagamento</small>
                      </div>
                      <div className="stat-card">
                        <div>
                          <span>Saídas manuais</span>
                          <ArrowUpRight size={19} />
                        </div>
                        <strong className="money-stat">
                          {currency(financeExpense)}
                        </strong>
                        <small>Lançamentos informados</small>
                      </div>
                      <div className="stat-card">
                        <div>
                          <span>Resultado manual</span>
                          <WalletCards size={19} />
                        </div>
                        <strong className="money-stat">
                          {currency(financeIncome - financeExpense)}
                        </strong>
                        <small>Entradas menos saídas registradas</small>
                      </div>
                    </div>
                    <div className="panel list-panel">
                      <div className="panel-head">
                        <h3>Últimos lançamentos</h3>
                        <span className="muted-mini">
                          Informado manualmente
                        </span>
                      </div>
                      {finances.length === 0 ? (
                        <Placeholder
                          icon={WalletCards}
                          title="Nenhum lançamento financeiro"
                          body="Adicione uma entrada ou despesa para acompanhar sua movimentação informada manualmente."
                          action={
                            <button
                              className="btn-small"
                              onClick={() => setShowFinanceForm(true)}
                            >
                              Novo lançamento <Plus size={15} />
                            </button>
                          }
                        />
                      ) : (
                        finances.map(f => (
                          <div className="finance-row" key={f.id}>
                            <span className={'finance-icon ' + f.kind}>
                              {f.kind === 'income' ? (
                                <ArrowDownRight size={19} />
                              ) : (
                                <ArrowUpRight size={19} />
                              )}
                            </span>
                            <div>
                              <strong>{f.name}</strong>
                              <small>{dateText(f.createdAt)} · Manual</small>
                            </div>
                            <strong
                              className={
                                f.kind === 'income'
                                  ? 'plus-amount'
                                  : 'minus-amount'
                              }
                            >
                              {f.kind === 'income' ? '+' : '−'}{' '}
                              {currency(f.amount)}
                            </strong>
                            <button
                              className="icon-outline"
                              onClick={() =>
                                setDeleteAsk({ type: 'finance', id: f.id })
                              }
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
                {view === 'integrations' && (
                  <>
                    <div className="page-intro">
                      <div>
                        <span className="page-kicker">
                          ECOSSISTEMA DE PARCEIROS
                        </span>
                        <h1>
                          Conecte quando <em>estiver pronto.</em>
                        </h1>
                        <p>
                          Essas são plataformas candidatas. Nenhuma integração
                          está conectada nesta versão.
                        </p>
                      </div>
                    </div>
                    <div className="section-note">
                      <LockKeyhole size={18} /> Integrações exigem documentação,
                      autorização e credenciais seguras. Não coloque tokens ou
                      senhas em formulários de produto.
                    </div>
                    <div className="integration-grid">
                      {platforms.map(p => (
                        <div className="integration-card" key={p}>
                          <div className="integration-icon">
                            <Layers3 size={22} />
                          </div>
                          <div>
                            <strong>{p}</strong>
                            <small>Integração candidata</small>
                          </div>
                          <span>Não configurada</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {view === 'team' && <TeamPanel orgId={orgId} role={role} notify={notify} />}
                {view === 'profile' && !workspaceLoading && (
                  <>
                    <div className="page-intro">
                      <div>
                        <span className="page-kicker">
                          CONFIGURAÇÃO DO NEGÓCIO
                        </span>
                        <h1>
                          Sua loja. <em>Sua identidade.</em>
                        </h1>
                        <p>
                          Essas informações identificam o vendedor nas ofertas
                          públicas.
                        </p>
                      </div>
                    </div>
                    <div className="panel profile-panel">
                      <div className="v2-profile-tools">
                        <span><ShieldCheck size={16} /> {roleLabels[role]} nesta empresa</span>
                        <button className="v2-link-outline" onClick={() => openPublicStore(orgId)}><Globe2 size={16} /> Ver vitrine pública <ArrowUpRight size={15} /></button>
                      </div>
                      <div className="panel-head">
                        <div>
                          <h3>Informações do negócio</h3>
                          <p>Dados da sua conta</p>
                        </div>
                        <Store size={20} />
                      </div>
                      <div className="form-grid">
                        <label className="field full">
                          <span>Nome público da loja</span>
                          <input
                            maxLength={100}
                            value={profile.storeName}
                            onChange={e =>
                              setProfile({
                                ...profile,
                                storeName: e.target.value,
                              })
                            }
                            placeholder="Ex.: Loja Exemplo"
                            disabled={!canAdmin}
                          />
                        </label>
                        <label className="field">
                          <span>Tipo de conta</span>
                          <select
                            value={profile.accountType}
                            disabled={!canAdmin}
                            onChange={e =>
                              setProfile({
                                ...profile,
                                accountType: e.target.value,
                              })
                            }
                          >
                            <option value="PF">Pessoa física</option>
                            <option value="MEI">MEI</option>
                            <option value="PJ">Pessoa jurídica</option>
                          </select>
                        </label>
                        <label className="field full">
                          <span>Descrição pública da loja</span>
                          <textarea
                            rows={3}
                            maxLength={500}
                            disabled={!canAdmin}
                            value={profile.description || ''}
                            onChange={e => setProfile({ ...profile, description: e.target.value })}
                            placeholder="Apresente sua marca para os visitantes da vitrine."
                          />
                        </label>
                        <label className="field">
                          <span>E-mail da conta</span>
                          <input
                            value={user?.email || 'Não disponível'}
                            disabled
                          />
                        </label>
                      </div>
                      <button
                        className="work-button"
                        disabled={busy || !canAdmin}
                        onClick={saveProfile}
                      >
                        <Check size={17} /> Salvar alterações
                      </button>
                      <div className="info-hint">
                        <ShieldCheck size={17} /> Seus registros são separados por empresa; somente usuários com acesso autorizado podem consultá-los.
                      </div>
                    </div>
                  </>
                )}
              </main>
            </div>
          </div>
        </>
      )}
      <OrgCreator
        open={showOrgCreator}
        onClose={() => setShowOrgCreator(false)}
        onCreated={next => void switchOrganization(next)}
        notify={notify}
      />
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              <X size={20} />
            </button>
            <div className="detail-image">
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={selected.title} />
              ) : (
                <Package size={45} />
              )}
            </div>
            <div className="detail-content">
              <div className="page-kicker">
                {kinds[selected.kind]} · {selected.category}
              </div>
              <h2>{selected.title}</h2>
              <p>
                {selected.description ||
                  'Descrição não informada pelo anunciante.'}
              </p>
              <span className="seller-line">
                <Store size={16} /> {selected.sellerName}
              </span>
              <strong className="detail-price">
                {selected.price === null
                  ? 'Preço não disponível'
                  : currency(selected.price)}
              </strong>
              <div className="section-note">
                <ShieldCheck size={17} /> Informações cadastradas manualmente
                pelo anunciante. O pagamento acontece fora do GestãoFácil.
              </div>
              <button
                className="work-button"
                onClick={() => goDestination(selected)}
              >
                Ver oferta no site externo <ExternalLink size={17} />
              </button>
              <small className="detail-disclosure">
                Você será direcionado para um site de terceiros. Se for um link
                de afiliado, o anunciante poderá receber comissão.
              </small>
            </div>
          </div>
        </div>
      )}
      {showProductForm && canWrite && (
        <div
          className="modal-backdrop"
          onClick={() => setShowProductForm(false)}
        >
          <div className="form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="page-kicker">CATÁLOGO DA SUA CONTA</span>
                <h2>{editing ? 'Editar produto' : 'Cadastrar produto'}</h2>
              </div>
              <button
                className="modal-close-static"
                onClick={() => setShowProductForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="form-grid">
              <label className="field full">
                <span>Nome do produto *</span>
                <input
                  value={productForm.title}
                  onChange={e =>
                    setProductForm({ ...productForm, title: e.target.value })
                  }
                  placeholder="Ex.: Camiseta oversized algodão"
                />
              </label>
              <label className="field">
                <span>Tipo de anúncio</span>
                <select
                  value={productForm.kind}
                  onChange={e =>
                    setProductForm({ ...productForm, kind: e.target.value })
                  }
                >
                  <option value="own">Produto próprio</option>
                  <option value="affiliate">Produto de afiliado</option>
                  <option value="third_party">Produto de terceiro</option>
                </select>
              </label>
              <label className="field">
                <span>Categoria</span>
                <select
                  value={productForm.category}
                  onChange={e =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                >
                  {[
                    'Moda e acessórios',
                    'Eletrônicos',
                    'Casa e decoração',
                    'Beleza e saúde',
                    'Alimentos e naturais',
                    'Educação e infoprodutos',
                    'Esporte e lazer',
                    'Outros',
                  ].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Preço em R$ (opcional)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={e =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  placeholder="129.90"
                />
              </label>
              <label className="field">
                <span>URL HTTPS da imagem (opcional)</span>
                <input
                  value={productForm.imageUrl}
                  onChange={e =>
                    setProductForm({ ...productForm, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </label>
              <label className="field full">
                <span>Descrição</span>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={e =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descreva seu produto com informações reais..."
                />
              </label>
              <label className="field full">
                <span>URL original do produto</span>
                <input
                  value={productForm.originalUrl}
                  onChange={e =>
                    setProductForm({
                      ...productForm,
                      originalUrl: e.target.value,
                    })
                  }
                  placeholder="https://site-do-produto.com/item"
                />
              </label>
              <label className="field full">
                <span>Seu link de afiliado (quando aplicável)</span>
                <input
                  value={productForm.affiliateUrl}
                  onChange={e =>
                    setProductForm({
                      ...productForm,
                      affiliateUrl: e.target.value,
                    })
                  }
                  placeholder="https://link-gerado-pela-plataforma.com/item"
                />
              </label>
            </div>
            <div className="form-tip">
              <ShieldCheck size={18} /> O produto será salvo como rascunho.
              Publicação exige confirmação, loja configurada e um link externo
              HTTPS.
            </div>
            <div className="form-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowProductForm(false)}
              >
                Cancelar
              </button>
              <button
                className="work-button"
                onClick={addProduct}
                disabled={busy}
              >
                {busy
                  ? 'Salvando...'
                  : editing
                    ? 'Salvar alterações'
                    : 'Cadastrar produto'}{' '}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      {showLinkForm && canWrite && (
        <div className="modal-backdrop" onClick={() => setShowLinkForm(false)}>
          <div
            className="form-modal small-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="page-kicker">CONTROLE DE AFILIADOS</span>
                <h2>Adicionar link</h2>
              </div>
              <button
                className="modal-close-static"
                onClick={() => setShowLinkForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="form-grid">
              <label className="field full">
                <span>Nome da campanha ou produto *</span>
                <input
                  value={linkForm.title}
                  onChange={e =>
                    setLinkForm({ ...linkForm, title: e.target.value })
                  }
                  placeholder="Ex.: Promoção de novembro"
                />
              </label>
              <label className="field full">
                <span>Plataforma *</span>
                <select
                  value={linkForm.platform}
                  onChange={e =>
                    setLinkForm({ ...linkForm, platform: e.target.value })
                  }
                >
                  {platforms.map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="field full">
                <span>URL original *</span>
                <input
                  value={linkForm.originalUrl}
                  onChange={e =>
                    setLinkForm({ ...linkForm, originalUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </label>
              <label className="field full">
                <span>Link de afiliado gerado pela plataforma *</span>
                <input
                  value={linkForm.affiliateUrl}
