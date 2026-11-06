
import { useEffect, useMemo, useState } from 'react';
import { api, invitesClient } from '@appdeploy/client';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCheck, CheckCircle2,
  ChevronDown, Copy, ExternalLink, Globe2, Layers3, Link2, LockKeyhole,
  Package, Plus, Search, ShieldCheck, Sparkles, Store, Trash2, Users, X
} from 'lucide-react';

export type OrgSummary = {
  id: string;
  storeName: string;
  accountType: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
};
export type PublicProduct = {
  id: string;
  title: string;
  description: string;
  category: string;
  kind: 'own' | 'affiliate' | 'third_party';
  price: number | null;
  imageUrl: string;
  originalUrl: string;
  affiliateUrl: string;
  sellerName: string;
  source: string;
  updatedAt: string;
  storeId: string;
};
type StoreData = { id: string; storeName: string; description: string; accountType: string };
type Notification = (message: string) => void;
export const roleLabels = {owner:'Proprietário',admin:'Administrador',editor:'Editor',viewer:'Visualizador'};
const brl = (n: number) => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(n);
const productKind = {own:'Produto próprio',affiliate:'Produto de afiliado',third_party:'Produto de terceiro'};

function ProductArt({item}: {item: PublicProduct}) {
  return item.imageUrl ? <img src={item.imageUrl} alt={item.title}/> :
    <div className="v2-product-art"><Package size={44}/><span>Imagem não informada</span></div>;
}

export function PublicExperience({
  route, onBack, onProduct, onStore, userSignedIn, onSignIn, onJoined, notify
}: {
  route: string;
  onBack: () => void;
  onProduct: (id: string) => void;
  onStore: (id: string) => void;
  userSignedIn: boolean;
  onSignIn: () => void;
  onJoined: (orgId: string) => void;
  notify: Notification;
}) {
  const [loading,setLoading] = useState(true);
  const [issue,setIssue] = useState('');
  const [store,setStore] = useState<StoreData | null>(null);
  const [products,setProducts] = useState<PublicProduct[]>([]);
  const [product,setProduct] = useState<PublicProduct | null>(null);
  const [invite,setInvite] = useState<{status:string;role:string} | null>(null);
  const [inviteCode,setInviteCode] = useState('');
  const [search,setSearch] = useState('');
  const [joining,setJoining] = useState(false);
  useEffect(()=>{
    let live=true;
    setLoading(true);setIssue('');setStore(null);setProduct(null);setProducts([]);
    const load=async()=>{
      try{
        if(route.startsWith('/loja/')){
          const id=decodeURIComponent(route.slice('/loja/'.length));
          const response=await api.get('/api/v2/stores/'+encodeURIComponent(id));
          if(live){setStore(response.data.store);setProducts(response.data.items||[]);}
        }else if(route.startsWith('/produto/')){
          const id=decodeURIComponent(route.slice('/produto/'.length));
          const response=await api.get('/api/v2/public/products/'+encodeURIComponent(id));
          if(live)setProduct(response.data.product);
        }else if(route==='/join'){
          const code=invitesClient.getPendingCode();
          if(!code){if(live)setIssue('Este convite não foi encontrado. Solicite um novo link ao administrador.');}
          else{
            if(live)setInviteCode(code);
            const response=await api.get('/api/v2/invites/'+encodeURIComponent(code));
            if(live)setInvite(response.data);
          }
        }else if(live)setIssue('Página não encontrada.');
      }catch{if(live)setIssue('Não foi possível carregar esta página. A oferta pode ter sido retirada.');}
      finally{if(live)setLoading(false);}
    };
    void load();
    return()=>{live=false;};
  },[route]);
  const found=useMemo(()=>products.filter(p=>(p.title+' '+p.category).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))),[products,search]);
  const external=(item:PublicProduct)=>{
    const url=item.kind==='affiliate'?item.affiliateUrl:(item.originalUrl||item.affiliateUrl);
    if(!url){notify('O vendedor ainda não cadastrou um destino válido.');return;}
    try{const u=new URL(url);if(u.protocol!=='https:')throw new Error('invalid');
      window.open(u.href,'_blank','noopener,noreferrer');
    }catch{notify('O endereço de destino não é seguro.');}
  };
  const copyLink=async()=>{
    try{await navigator.clipboard.writeText(window.location.href);notify('Link copiado.');}
    catch{notify('Não foi possível copiar automaticamente. Copie o endereço da página no navegador.');}
  };
  const join=async()=>{
    if(!userSignedIn){onSignIn();return;}
    if(!inviteCode){notify('O convite não foi encontrado.');return;}
    setJoining(true);
    try{
      const response=await api.post('/api/v2/invites/'+encodeURIComponent(inviteCode)+'/join');
      invitesClient.clearPendingCode();
      notify('Convite aceito! Seu novo espaço de trabalho está disponível.');
      onJoined(response.data.orgId);
    }catch{notify('Não foi possível aceitar o convite. Verifique se ele foi enviado para o e-mail da sua conta.');}
    finally{setJoining(false);}
  };
  if(loading)return <div className="v2-page-loading"><span className="v2-spinner"></span> Carregando dados reais...</div>;
  if(issue)return <section className="v2-public-page"><div className="v2-error"><LockKeyhole size={28}/><h2>Não foi possível abrir</h2><p>{issue}</p><button className="v2-button" onClick={onBack}><ArrowLeft size={16}/> Voltar ao marketplace</button></div></section>;
  if(route==='/join')return <section className="v2-public-page v2-join">
    <span className="v2-overline"><ShieldCheck size={17}/> ACESSO A EQUIPE</span>
    <h1>Você foi convidado para <em>colaborar.</em></h1>
    <p>O acesso à empresa só será liberado depois que você entrar na conta de e-mail autorizada e aceitar o convite.</p>
    <div className="v2-join-card"><span><Users size={28}/></span><h3>Convite para equipe</h3><p>Papel solicitado: <strong>{roleLabels[(invite?.role || 'viewer') as keyof typeof roleLabels] || 'Colaborador'}</strong></p><small>Situação: {invite?.status==='open'?'Disponível':invite?.status==='expired'?'Expirado':'Indisponível'}</small>
    <button className="v2-button" disabled={invite?.status!=='open'||joining} onClick={join}>{userSignedIn?'Aceitar convite':'Entrar para aceitar'} <ArrowRight size={16}/></button></div>
  </section>;
  if(store)return <section className="v2-public-page">
    <button className="v2-back" onClick={onBack}><ArrowLeft size={17}/> Voltar ao marketplace</button>
    <div className="v2-store-hero">
      <div className="v2-store-monogram"><Store size={42}/></div>
      <div><span className="v2-overline"><Store size={16}/> VITRINE DO VENDEDOR</span>
        <h1>{store.storeName}</h1><p>{store.description || 'Conheça os produtos apresentados por esta loja no GestãoFácil.'}</p>
        <div className="v2-store-info"><span>{store.accountType}</span><span>{products.length} produtos publicados nesta vitrine</span><span>Ofertas cadastradas manualmente</span></div>
      </div>
      <button className="v2-link-outline" onClick={copyLink}><Copy size={17}/> Copiar link</button>
    </div>
    <div className="v2-store-products-head"><div><span className="v2-overline">SELEÇÃO DE PRODUTOS</span><h2>Explore esta <em>vitrine.</em></h2></div>
      <div className="v2-search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar nesta loja"/></div>
    </div>
    {found.length ? <div className="v2-cards">{found.map(item=><button key={item.id} className="v2-product-card" onClick={()=>onProduct(item.id)}>
      <div className="v2-product-thumb"><ProductArt item={item}/></div>
      <div className="v2-product-data"><small>{item.category} · {productKind[item.kind]}</small><h3>{item.title}</h3><strong>{item.price===null?'Preço não informado':brl(item.price)}</strong><span>Ver detalhes <ArrowUpRight size={15}/></span></div>
    </button>)}</div>:<div className="v2-empty-list">Nenhum produto encontrado nesta seleção.</div>}
  </section>;
  if(product)return <section className="v2-public-page">
    <button className="v2-back" onClick={onBack}><ArrowLeft size={17}/> Voltar ao marketplace</button>
    <div className="v2-product-page"><div className="v2-product-image"><ProductArt item={product}/></div>
    <div className="v2-product-info"><span className="v2-overline"><Package size={16}/> {productKind[product.kind]} · {product.category}</span>
      <h1>{product.title}</h1><p>{product.description || 'O anunciante ainda não informou uma descrição detalhada para este produto.'}</p>
      <button className="v2-seller-link" onClick={()=>onStore(product.storeId)}><Store size={18}/><span>Vendido / divulgado por <strong>{product.sellerName||'Loja parceira'}</strong></span><ArrowUpRight size={17}/></button>
      <div className="v2-price-wrap"><span>Preço informado pelo anunciante</span><strong>{product.price===null?'Não disponível':brl(product.price)}</strong></div>
      <div className="v2-safety"><ShieldCheck size={19}/> Dados informados manualmente. O GestãoFácil não confirmou preço, estoque, avaliações ou comissões. O pagamento ocorre fora desta plataforma.</div>
      <div className="v2-product-actions"><button className="v2-button" onClick={()=>external(product)}>Ver oferta externa <ExternalLink size={17}/></button><button className="v2-link-outline" onClick={copyLink}><Copy size={17}/> Compartilhar</button></div>
      <small className="v2-disclaimer">O anunciante pode receber comissão se este for um link de afiliado. Confira preço, condições e políticas no site de destino.</small>
    </div></div>
  </section>;
  return null;
}

export function OrgCreator({open,onClose,onCreated,notify}: {
  open:boolean;onClose:()=>void;onCreated:(id:string)=>void;notify:Notification;
}){
  const [name,setName]=useState('');
  const [type,setType]=useState('PJ');
  const [saving,setSaving]=useState(false);
  if(!open)return null;
  const submit=async()=>{
    if(!name.trim()){notify('Informe o nome da empresa.');return;}
    setSaving(true);
    try{
      const result=await api.post('/api/v2/organizations',{storeName:name,accountType:type});
      setName('');onClose();onCreated(result.data.organization.id);notify('Empresa criada. Seu novo espaço está pronto.');
    }catch{notify('Não foi possível criar a empresa. Tente novamente.');}
    finally{setSaving(false);}
  };
  return <div className="modal-backdrop" onClick={onClose}><div className="v2-dialog" onClick={e=>e.stopPropagation()}>
    <div className="v2-dialog-head"><div><span className="v2-overline">AMBIENTE MULTIEMPRESA</span><h2>Criar nova empresa</h2></div><button className="v2-icon-button" onClick={onClose}><X size={20}/></button></div>
    <p>Uma empresa tem seus próprios produtos, links, lançamentos e equipe. Nada será movido ou apagado da sua conta original.</p>
    <label className="v2-field">Nome público da empresa ou loja<input value={name} maxLength={100} onChange={e=>setName(e.target.value)} placeholder="Ex.: Minha nova loja"/></label>
    <label className="v2-field">Natureza da conta<select value={type} onChange={e=>setType(e.target.value)}><option value="PF">Pessoa física</option><option value="MEI">MEI</option><option value="PJ">Pessoa jurídica</option></select></label>
    <div className="v2-actions"><button className="v2-link-outline" onClick={onClose}>Cancelar</button><button className="v2-button" disabled={saving} onClick={submit}><Plus size={17}/>{saving?'Criando...':'Criar empresa'}</button></div>
  </div></div>;
}

type TeamMember = {id:string;userId:string;email:string;role:'owner'|'admin'|'editor'|'viewer';joinedAt?:string};
export function TeamPanel({orgId,role,notify}: {orgId:string;role:OrgSummary['role'];notify:Notification}) {
  const [members,setMembers]=useState<TeamMember[]>([]);
  const [loading,setLoading]=useState(true);
  const [email,setEmail]=useState('');
  const [inviteRole,setInviteRole]=useState('editor');
  const [inviteUrl,setInviteUrl]=useState('');
  const [busy,setBusy]=useState(false);
  const canManage=role==='owner'||role==='admin';
  const load=async()=>{
    setLoading(true);
    try {
      const res=await api.get('/api/v2/organizations/'+encodeURIComponent(orgId)+'/members');
      setMembers(res.data.members||[]);
    }catch{notify('Não foi possível carregar os membros da empresa.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{
    setInviteUrl('');
    setEmail('');
    setMembers([]);
    if(orgId&&canManage)void load();
  },[orgId,role]);
  const sendInvite=async()=>{
    if(!email.trim()){notify('Informe o e-mail do colaborador.');return;}
    setBusy(true);
    try{
      const response=await api.post('/api/v2/organizations/'+encodeURIComponent(orgId)+'/invites',{email,role:inviteRole});
      const link=invitesClient.buildJoinUrl(response.data.code,{path:'#/join'});
      setInviteUrl(link);
      notify('Convite criado. Copie o link e envie ao destinatário autorizado.');
    }catch{notify('Não foi possível criar o convite. Confira o e-mail e a permissão.');}
    finally{setBusy(false);}
  };
  const copyInvite=async()=>{
    try{await navigator.clipboard.writeText(inviteUrl);notify('Link de convite copiado.');}
    catch{notify('Copie o endereço exibido no campo.');}
  };
  const changeRole=async(member:TeamMember,next:string)=>{
    if(!window.confirm('Alterar a permissão deste colaborador?'))return;
    setBusy(true);
    try{
      await api.put('/api/v2/organizations/'+encodeURIComponent(orgId)+'/members/'+encodeURIComponent(member.userId),{role:next});
      await load();notify('Permissão atualizada.');
    }catch{notify('Não foi possível atualizar a permissão.');}
    finally{setBusy(false);}
  };
  const remove=async(member:TeamMember)=>{
    if(!window.confirm('Remover o acesso de '+member.email+' a esta empresa?'))return;
    setBusy(true);
    try{
      await api.delete('/api/v2/organizations/'+encodeURIComponent(orgId)+'/members/'+encodeURIComponent(member.userId));
      await load();notify('Acesso removido.');
    }catch{notify('Não foi possível remover o colaborador.');}
    finally{setBusy(false);}
  };
  return <section className="v2-team-page">
    <div className="page-intro"><div><span className="page-kicker">CONTROLE DE ACESSO</span><h1>Minha <em>equipe.</em></h1><p>Convites privados e permissões aplicadas no servidor.</p></div></div>
    {!canManage?<div className="v2-role-notice"><LockKeyhole size={22}/><div><strong>Gestão de equipe restrita</strong><p>Somente proprietários e administradores podem visualizar e gerenciar membros.</p></div></div>:
    <div className="v2-team-grid"><div className="panel">
      <div className="panel-head"><div><h3>Membros da empresa</h3><p>{members.length} membro(s) visível(is)</p></div><Users size={20}/></div>
      {loading?<div className="v2-empty-list">Carregando membros...</div>:members.map(member=><div className="v2-member" key={member.userId}>
        <div className="v2-member-avatar">{member.email.slice(0,1).toUpperCase()}</div>
        <div><strong>{member.email}</strong><small>{roleLabels[member.role]}</small></div>
        {member.role==='owner'?<span className="v2-owner-tag"><ShieldCheck size={14}/> Owner</span>:
          <><select aria-label={'Permissão de '+member.email} value={member.role} disabled={busy||(role==='admin'&&member.role==='admin')} onChange={e=>void changeRole(member,e.target.value)}>
            <option value="viewer">Visualizador</option><option value="editor">Editor</option>{role==='owner'&&<option value="admin">Administrador</option>}
          </select><button className="v2-icon-button" aria-label={'Remover '+member.email} disabled={busy||(role==='admin'&&member.role==='admin')} onClick={()=>void remove(member)}><Trash2 size={17}/></button></>}
      </div>)}
    </div>
    <div className="panel v2-invite-panel"><div className="panel-head"><div><h3>Convidar colaborador</h3><p>Convite válido por 7 dias</p></div><Link2 size={20}/></div>
      <div className="v2-invite-body"><label className="v2-field">E-mail autorizado<input type="email" placeholder="colaborador@empresa.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label className="v2-field">Nível de acesso<select value={inviteRole} onChange={e=>setInviteRole(e.target.value)}><option value="viewer">Visualizador · somente leitura</option><option value="editor">Editor · gerencia cadastros</option>{role==='owner'&&<option value="admin">Administrador · gerencia equipe</option>}</select></label>
      <button className="v2-button" disabled={busy} onClick={()=>void sendInvite()}><Plus size={17}/> Criar convite privado</button>
      {inviteUrl&&<div className="v2-invite-link"><small>Compartilhe este link apenas com o e-mail convidado:</small><input readOnly value={inviteUrl} aria-label="Link de convite"/><button className="v2-link-outline" onClick={()=>void copyInvite()}><Copy size={16}/> Copiar convite</button></div>}
      <div className="v2-invite-help"><ShieldCheck size={17}/> A pessoa deverá entrar com o e-mail autorizado e aceitar o convite. O acesso não é público.</div>
      </div>
    </div></div>}
  </section>;
}

export function DashboardUpgrade({orgId,storeName,role,productCount,onOpenStore,onCreateProduct}:{
  orgId:string;storeName:string;role:OrgSummary['role'];productCount:number;
  onOpenStore:()=>void;onCreateProduct:()=>void;
}){
  return <div className="v2-dashboard-banner"><div className="v2-dashboard-pattern"></div>
    <div className="v2-dashboard-copy"><span className="v2-overline"><Sparkles size={15}/> SUA OPERAÇÃO, UM NOVO NÍVEL</span>
      <h2>Uma empresa. <em>Todas as possibilidades.</em></h2>
      <p>{storeName || 'Seu espaço'} · {roleLabels[role]}. Seus produtos e movimentações estão vinculados exclusivamente a esta empresa.</p>
      <div className="v2-banner-actions"><button onClick={onOpenStore}><Globe2 size={16}/> Abrir vitrine pública <ArrowUpRight size={15}/></button>
      {role!=='viewer'&&<button onClick={onCreateProduct}><Plus size={16}/> Adicionar produto</button>}</div>
    </div>
    <div className="v2-dashboard-art"><div><img src="/gestaofacil-symbol.svg" alt="" /><span>WORKSPACE</span><strong>{String(productCount).padStart(2,'0')}</strong><small>produtos cadastrados</small></div></div>
  </div>;
}

