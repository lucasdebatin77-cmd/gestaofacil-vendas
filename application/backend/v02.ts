
import { db, json, error, requireAuth, invites, isInviteError } from '@appdeploy/sdk';
import type { RouterContext, RouterRoutes } from '@appdeploy/sdk';
import { randomUUID } from 'node:crypto';

type Role = 'owner' | 'admin' | 'editor' | 'viewer';
type Org = {
  id: string;
  ownerId: string;
  storeName: string;
  accountType: 'PF' | 'MEI' | 'PJ';
  description: string;
  createdAt: string;
  updatedAt: string;
};
type Member = {
  userId: string;
  email: string;
  role: Exclude<Role, 'owner'> | 'revoked';
  joinedAt: string;
  revokedAt?: string;
};
type Product = {
  id?: string;
  orgId?: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  kind: 'own' | 'affiliate' | 'third_party';
  price: number | null;
  originalUrl: string;
  affiliateUrl: string;
  imageUrl: string;
  sellerName: string;
  status: 'draft' | 'published';
  source: 'manual';
  createdAt: string;
  updatedAt: string;
};
type Finance = { ownerId: string; orgId: string; name: string; kind: 'income' | 'expense'; amount: number; source: 'manual'; createdAt: string };
type AffiliateLink = { ownerId: string; orgId: string; title: string; platform: string; originalUrl: string; affiliateUrl: string; createdAt: string };
type Access = { org: Org; role: Role; tableKey: string };
const safe = (s: string) => s.replace(/[^A-Za-z0-9]/g, '');
const personalId = (userId: string) => 'personal-' + safe(userId);
const tableKey = (org: Org) => org.id === personalId(org.ownerId) ? safe(org.ownerId) : safe(org.id);
const productsTable = (access: Access) => 'gf_products_' + access.tableKey;
const financeTable = (access: Access) => 'gf_finance_' + access.tableKey;
const linksTable = (access: Access) => 'gf_links_' + access.tableKey;
const membersTable = (orgId: string) => 'gf_members_' + safe(orgId);
const userIndex = (userId: string) => 'gf_orgindex_' + safe(userId);
const textValue = (value: unknown, max = 250) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const safeUrl = (value: unknown) => {
  const raw = textValue(value, 1500);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.href : '';
  } catch { return ''; }
};
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const getId = (ctx: RouterContext) => textValue(ctx.query.orgId || object(ctx.body).orgId, 100) || personalId(ctx.user!.userId);
const canWrite = (role: Role) => role === 'owner' || role === 'admin' || role === 'editor';
const canAdmin = (role: Role) => role === 'owner' || role === 'admin';
const publicProduct = (product: Product & { id?: string }) => ({
  id: product.id,
  title: product.title,
  description: product.description,
  category: product.category,
  kind: product.kind,
  price: product.price,
  originalUrl: product.originalUrl,
  affiliateUrl: product.affiliateUrl,
  imageUrl: product.imageUrl,
  sellerName: product.sellerName,
  status: product.status,
  source: product.source || 'manual',
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  storeId: product.orgId || personalId(product.ownerId),
});
export { publicProduct };

async function ensurePersonal(uid: string): Promise<Org> {
  const id = personalId(uid);
  const [saved, legacy] = await Promise.all([
    db.get<Org>('gf_orgs_v2', [id], { consistent: true }),
    db.get<{storeName: string; accountType: 'PF'|'MEI'|'PJ'}>('gf_profiles', [uid]),
  ]);
  if (saved[0]) return {
    ...saved[0],
    storeName: legacy[0]?.storeName || saved[0].storeName,
    accountType: legacy[0]?.accountType || saved[0].accountType,
  };
  const now = new Date().toISOString();
  const org: Org = {
    id, ownerId: uid,
    storeName: legacy[0]?.storeName || '',
    accountType: legacy[0]?.accountType || 'PF',
    description: '',
    createdAt: now, updatedAt: now,
  };
  const [created] = await db.tx.add('gf_orgs_v2', [org]);
  if (created) return org;
  const [after] = await db.get<Org>('gf_orgs_v2', [id], { consistent: true });
  return after || org;
}
async function accessFor(uid: string, id: string): Promise<Access | null> {
  if (id === personalId(uid)) {
    const org = await ensurePersonal(uid);
    return { org, role: 'owner', tableKey: safe(uid) };
  }
  if (!/^(personal-|org-)[A-Za-z0-9]+$/.test(id)) return null;
  const [org] = await db.get<Org>('gf_orgs_v2', [id], { consistent: true });
  if (!org) return null;
  if (org.ownerId === uid) return { org, role: 'owner', tableKey: tableKey(org) };
  const [member] = await db.get<Member>(membersTable(id), [uid], { consistent: true });
  if (!member || !['admin', 'editor', 'viewer'].includes(member.role)) return null;
  return { org, role: member.role, tableKey: tableKey(org) };
}
const fromContext = (ctx: RouterContext) => accessFor(ctx.user!.userId, getId(ctx));
async function organizationsFor(uid: string) {
  const personal = await ensurePersonal(uid);
  const index = await db.list<{id:string}>(userIndex(uid), {limit:50});
  const ids = [...new Set([personal.id, ...index.items.map(item=>item.id)])];
  const accessible = await Promise.all(ids.map(id=>accessFor(uid,id)));
  return accessible.filter((item): item is Access => !!item)
    .map(item => ({ id:item.org.id, storeName:item.org.storeName, accountType:item.org.accountType, role:item.role }));
}
function parseProduct(body: unknown) {
  const data = object(body);
  const title = textValue(data.title,120);
  const description = textValue(data.description,1200);
  const category = textValue(data.category,80) || 'Outros';
  const kind = data.kind==='affiliate' || data.kind==='third_party' ? data.kind : 'own';
  const rawPrice = data.price;
  const price = rawPrice==='' || rawPrice===null || rawPrice===undefined ? null : Number(rawPrice);
  const originalUrl = safeUrl(data.originalUrl);
  const affiliateUrl = safeUrl(data.affiliateUrl);
  const imageUrl = safeUrl(data.imageUrl);
  if (!title) return { message:'Informe o nome do produto.' };
  if (price!==null && (!Number.isFinite(price) || price<0 || price>100000000))
    return { message:'O preço informado é inválido.' };
  if ((textValue(data.originalUrl,1500) && !originalUrl)
    || (textValue(data.affiliateUrl,1500) && !affiliateUrl)
    || (textValue(data.imageUrl,1500) && !imageUrl))
    return { message:'Use apenas URLs HTTPS válidas.' };
  return { product: {title,description,category,kind,price,originalUrl,affiliateUrl,imageUrl} };
}
const readProduct = async (access: Access, id: string) => {
  const [record] = await db.get<Product>(productsTable(access), [id], {consistent:true});
  return record;
};
const forbidden = () => error('Acesso negado à empresa ou permissão insuficiente.',403);
function responseInviteError(e: unknown) {
  if (isInviteError(e)) return error('Convite inválido, expirado, revogado ou não autorizado: '+e.code,400);
  throw e;
}

export const v02Routes: RouterRoutes = {
  'GET /api/v2/_healthcheck': [async () => json({ok:true,version:'0.2.1'})],
  'GET /api/v2/catalog': [async ({ query }) => {
    const cursor = textValue(query.cursor, 2500);
    const page = await db.list<Product>('gf_public',{limit:100,...(cursor ? {nextToken:cursor} : {})});
    const q = textValue(query.q,120).toLocaleLowerCase('pt-BR');
    const kind = textValue(query.kind,20);
    return json({items:page.items.filter(p=>
      p.status==='published' && (!q || (p.title+' '+p.category+' '+p.sellerName).toLocaleLowerCase('pt-BR').includes(q))
      && (!kind || p.kind===kind)).map(p=>publicProduct(p)),
      hasMore:!!page.nextToken,nextCursor:page.nextToken || null
    });
  }],
  'GET /api/v2/public/products/:id': [async ({params}) => {
    const [product] = await db.get<Product>('gf_public',[params.id],{consistent:true});
    if (!product || product.status!=='published') return error('Produto não encontrado.',404);
    return json({product:publicProduct({...product,id:params.id})});
  }],
  'GET /api/v2/stores/:id': [async ({params}) => {
    if (!/^(personal-|org-)[A-Za-z0-9]+$/.test(params.id)) return error('Loja não encontrada.',404);
    const [saved] = await db.get<Org>('gf_orgs_v2',[params.id],{consistent:true});
    if (!saved || !saved.storeName) return error('Loja não encontrada.',404);
    let org = saved;
    if(saved.id===personalId(saved.ownerId)) {
      const [legacy] = await db.get<{storeName:string;accountType:'PF'|'MEI'|'PJ'}>('gf_profiles',[saved.ownerId]);
      if(legacy) org={...saved,storeName:legacy.storeName,accountType:legacy.accountType};
    }
    const access = {org,role:'owner' as Role,tableKey:tableKey(org)};
    const list = await db.list<Product>(productsTable(access),{limit:100});
    const items = list.items.filter(p=>p.status==='published').map(p=>publicProduct({...p,orgId:org.id,sellerName:org.storeName}));
    return json({store:{id:org.id,storeName:org.storeName,description:org.description||'',accountType:org.accountType},items,hasMore:!!list.nextToken});
  }],
  'GET /api/v2/organizations': [requireAuth(), async ({user}) =>
    json({organizations:await organizationsFor(user!.userId)})],
  'POST /api/v2/organizations': [requireAuth(), async ({user,body}) => {
    const data=object(body);
    const storeName=textValue(data.storeName,100);
    const accountType=textValue(data.accountType,15);
    if(!storeName) return error('Informe o nome da nova empresa.',400);
    if(!['PF','MEI','PJ'].includes(accountType)) return error('Tipo de conta inválido.',400);
    const uid=user!.userId;
    const now=new Date().toISOString();
    const org:Org={id:'org-'+randomUUID().replace(/-/g,''),ownerId:uid,storeName,
      accountType:accountType as Org['accountType'],description:'',createdAt:now,updatedAt:now};
    const [id]=await db.tx.add('gf_orgs_v2',[org]);
    if(!id)return error('Não foi possível criar a empresa.',500);
    await db.tx.update(userIndex(uid),[{id:org.id,record:{id:org.id,role:'owner'}}]);
    return json({organization:{id:org.id,storeName:org.storeName,accountType:org.accountType,role:'owner'}},201);
  }],
  'GET /api/v2/workspace': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access)return forbidden();
    const [p,l,f,orgs]=await Promise.all([
      db.list<Product>(productsTable(access),{limit:100}),
      db.list<AffiliateLink>(linksTable(access),{limit:100}),
      db.list<Finance>(financeTable(access),{limit:100}),
      organizationsFor(ctx.user!.userId),
    ]);
    return json({
      products:p.items,links:l.items,finances:f.items,
      profile:{storeName:access.org.storeName,accountType:access.org.accountType,description:access.org.description||''},
      organization:{id:access.org.id,storeName:access.org.storeName,role:access.role},
      organizations:orgs,
      pagination:{products:!!p.nextToken,links:!!l.nextToken,finances:!!f.nextToken}
    });
  }],
  'PUT /api/v2/profile': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access || !canAdmin(access.role))return forbidden();
    const data=object(ctx.body);
    const storeName=textValue(data.storeName,100);
    const accountType=textValue(data.accountType,15);
    const description=textValue(data.description,500);
    if(!storeName)return error('Informe o nome público da loja.',400);
    if(!['PF','MEI','PJ'].includes(accountType))return error('Tipo de conta inválido.',400);
    const updated:Org={...access.org,storeName,accountType:accountType as Org['accountType'],
      description,updatedAt:new Date().toISOString()};
    if (access.org.id===personalId(ctx.user!.userId)) {
      await db.transact([
        db.tx.update('gf_orgs_v2',[{id:access.org.id,record:updated}]),
        db.tx.update('gf_profiles',[{id:ctx.user!.userId,record:{
          storeName,accountType,ownerId:ctx.user!.userId,updatedAt:updated.updatedAt
        }}])
      ]);
    } else await db.tx.update('gf_orgs_v2',[{id:access.org.id,record:updated}]);
    return json({profile:{storeName,accountType,description}});
  }],
  'POST /api/v2/products': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const parsed=parseProduct(ctx.body);
    if('message'in parsed)return error(parsed.message!,400);
    const now=new Date().toISOString();
    const product:Product={...parsed.product!,orgId:access.org.id,ownerId:ctx.user!.userId,
      sellerName:access.org.storeName,status:'draft',source:'manual',createdAt:now,updatedAt:now};
    const [id]=await db.add(productsTable(access),[product]);
    if(!id)return error('Não foi possível cadastrar o produto.',500);
    return json({product:{...product,id}},201);
  }],
  'PUT /api/v2/products/:id': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const old=await readProduct(access,ctx.params.id);
    if(!old)return error('Produto não encontrado.',404);
    const parsed=parseProduct(ctx.body);
    if('message'in parsed)return error(parsed.message!,400);
    const updated:Product={...old,...parsed.product!,orgId:access.org.id,
      sellerName:access.org.storeName,updatedAt:new Date().toISOString()};
    if(old.status==='published') {
      if(!updated.originalUrl && !updated.affiliateUrl)return error('Informe URL externa HTTPS para manter a publicação.',400);
      await db.transact([
        db.tx.update(productsTable(access),[{id:ctx.params.id,record:updated}]),
        db.tx.update('gf_public',[{id:ctx.params.id,record:updated}])
      ]);
    } else await db.tx.update(productsTable(access),[{id:ctx.params.id,record:updated}]);
    return json({product:{...updated,id:ctx.params.id}});
  }],
  'POST /api/v2/products/:id/publish': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const product=await readProduct(access,ctx.params.id);
    if(!product)return error('Produto não encontrado.',404);
    if(!product.originalUrl && !product.affiliateUrl)return error('Informe um link HTTPS externo. Checkout próprio ainda não está habilitado.',400);
    if(!access.org.storeName)return error('Configure o nome da loja antes de publicar.',400);
    const updated:Product={...product,orgId:access.org.id,status:'published',
      sellerName:access.org.storeName,updatedAt:new Date().toISOString()};
    await db.transact([
      db.tx.update(productsTable(access),[{id:ctx.params.id,record:updated}]),
      db.tx.update('gf_public',[{id:ctx.params.id,record:updated}])
    ]);
    return json({product:{...updated,id:ctx.params.id}});
  }],
  'POST /api/v2/products/:id/unpublish': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const old=await readProduct(access,ctx.params.id);
    if(!old)return error('Produto não encontrado.',404);
    const updated:Product={...old,status:'draft',updatedAt:new Date().toISOString()};
    if(old.status==='published')await db.transact([
      db.tx.update(productsTable(access),[{id:ctx.params.id,record:updated}]),
      db.tx.delete('gf_public',[ctx.params.id])
    ]);
    return json({product:{...updated,id:ctx.params.id}});
  }],
  'DELETE /api/v2/products/:id': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const old=await readProduct(access,ctx.params.id);
    if(!old)return error('Produto não encontrado.',404);
    if(old.status==='published') await db.transact([
      db.tx.delete(productsTable(access),[ctx.params.id]),
      db.tx.delete('gf_public',[ctx.params.id])
    ]);
    else await db.delete(productsTable(access),[ctx.params.id]);
    return json({deleted:true});
  }],
  'POST /api/v2/links': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const data=object(ctx.body);
    const title=textValue(data.title,120),platform=textValue(data.platform,60);
    const originalUrl=safeUrl(data.originalUrl),affiliateUrl=safeUrl(data.affiliateUrl);
    if(!title||!platform)return error('Informe nome e plataforma.',400);
    if(!originalUrl||!affiliateUrl)return error('Informe URL original e de afiliado HTTPS válidas.',400);
    const link:AffiliateLink={orgId:access.org.id,ownerId:ctx.user!.userId,title,platform,
      originalUrl,affiliateUrl,createdAt:new Date().toISOString()};
    const [id]=await db.add(linksTable(access),[link]);
    return id?json({link:{...link,id}},201):error('Não foi possível salvar o link.',500);
  }],
  'DELETE /api/v2/links/:id': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const [record]=await db.get<AffiliateLink>(linksTable(access),[ctx.params.id],{consistent:true});
    if(!record)return error('Link não encontrado.',404);
    await db.delete(linksTable(access),[ctx.params.id]);
    return json({deleted:true});
  }],
  'POST /api/v2/finances': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const data=object(ctx.body);
    const name=textValue(data.name,120);
    const kind=data.kind==='income'?'income':'expense';
    const amount=Number(data.amount);
    if(!name||!Number.isFinite(amount)||amount<=0||amount>100000000)return error('Informe descrição e valor positivo.',400);
    const record:Finance={orgId:access.org.id,ownerId:ctx.user!.userId,name,kind,
      amount,source:'manual',createdAt:new Date().toISOString()};
    const [id]=await db.add(financeTable(access),[record]);
    return id?json({finance:{...record,id}},201):error('Não foi possível salvar o lançamento.',500);
  }],
  'DELETE /api/v2/finances/:id': [requireAuth(), async ctx => {
    const access=await fromContext(ctx);
    if(!access||!canWrite(access.role))return forbidden();
    const [record]=await db.get<Finance>(financeTable(access),[ctx.params.id],{consistent:true});
    if(!record)return error('Lançamento não encontrado.',404);
    await db.delete(financeTable(access),[ctx.params.id]);
    return json({deleted:true});
  }],
  'GET /api/v2/organizations/:id/members': [requireAuth(), async ctx => {
    const access=await accessFor(ctx.user!.userId,ctx.params.id);
    if(!access||!canAdmin(access.role))return forbidden();
    const list=await db.list<Member>(membersTable(ctx.params.id),{limit:100});
    return json({
      members:[
        {id:access.org.ownerId,userId:access.org.ownerId,email:'Responsável da conta',role:'owner'},
        ...list.items.filter(m=>m.role!=='revoked')
      ],
      role:access.role
    });
  }],
  'POST /api/v2/organizations/:id/invites': [requireAuth(), async ctx => {
    const access=await accessFor(ctx.user!.userId,ctx.params.id);
    if(!access||!canAdmin(access.role))return forbidden();
    const data=object(ctx.body);
    const emailAddress=textValue(data.email,180).toLowerCase();
    const role=textValue(data.role,20);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress))return error('Informe um e-mail válido.',400);
    if(!['admin','editor','viewer'].includes(role))return error('Papel inválido.',400);
    if(role==='admin' && access.role!=='owner')return forbidden();
    if(ctx.user!.email?.toLowerCase()===emailAddress)return error('Você já pertence a esta empresa.',400);
    try {
      const result=await invites.create({resourceType:'gestaofacil_org',authMode:'required',
        actor:ctx.user!,allowList:[emailAddress],expiresInSec:7*24*3600,
        context:{orgId:access.org.id,role,email:emailAddress,issuedAt:new Date().toISOString()}});
      return json({code:result.code,role,email:emailAddress});
    }catch(e){return responseInviteError(e);}
  }],
  'GET /api/v2/invites/:code': [async ({params}) => {
    try {
      const resolved=await invites.resolve({code:params.code});
      if(resolved.resourceType!=='gestaofacil_org')return error('Convite não reconhecido.',400);
      return json({status:resolved.status,role:resolved.context?.role,authMode:resolved.authMode});
    }catch(e){return responseInviteError(e);}
  }],
  'POST /api/v2/invites/:code/join': [requireAuth(), async ctx => {
    try {
      const joined=await invites.join({code:ctx.params.code,actor:ctx.user!});
      if(joined.resourceType!=='gestaofacil_org')return error('Convite não reconhecido.',400);
      const c=object(joined.context);
      const id=textValue(c.orgId,100),role=textValue(c.role,20);
      const issuedAt=textValue(c.issuedAt,40);
      const allowedEmail=textValue(c.email,180).toLowerCase();
      if(!allowedEmail || ctx.user!.email?.trim().toLowerCase()!==allowedEmail)return forbidden();
      if(!['admin','editor','viewer'].includes(role))return error('Papel de convite inválido.',400);
      const [org]=await db.get<Org>('gf_orgs_v2',[id],{consistent:true});
      if(!org)return error('Empresa do convite não encontrada.',404);
      const uid=ctx.user!.userId;
      if(org.ownerId===uid)return json({orgId:id,role:'owner'});
      const member:Member={
        userId:uid,email:ctx.user!.email||'',role:role as Member['role'],
        joinedAt:new Date().toISOString()
      };
      const [old]=await db.get<Member>(membersTable(id),[uid],{consistent:true});
      if(old && old.role!=='revoked')return json({orgId:id,role:old.role});
      if(old?.role==='revoked' && (!issuedAt || !old.revokedAt ||
        Date.parse(issuedAt)<=Date.parse(old.revokedAt))) {
        return error('Este convite é anterior à remoção do colaborador. Solicite novo convite.',403);
      }
      if(old?.role==='revoked') {
        await db.transact([
          db.tx.update(membersTable(id),[{id:uid,record:member,
            if:{role:'revoked',revokedAt:old.revokedAt}}]),
          db.tx.update(userIndex(uid),[{id,record:{id,role:member.role}}])
        ]);
      } else {
        await db.transact([
          db.tx.add(membersTable(id),[{id:uid,...member}]),
          db.tx.update(userIndex(uid),[{id,record:{id,role:member.role}}])
        ]);
      }
      return json({orgId:id,role:member.role});
    }catch(e){return responseInviteError(e);}
  }],
  'PUT /api/v2/organizations/:id/members/:uid': [requireAuth(), async ctx => {
    const access=await accessFor(ctx.user!.userId,ctx.params.id);
    if(!access||!canAdmin(access.role))return forbidden();
    if(ctx.params.uid===access.org.ownerId)return error('O proprietário não pode ter o papel alterado.',400);
    const [member]=await db.get<Member>(membersTable(ctx.params.id),[ctx.params.uid],{consistent:true});
    if(!member || member.role==='revoked')return error('Membro não encontrado.',404);
    if(access.role==='admin' && member.role==='admin')return forbidden();
    const role=textValue(object(ctx.body).role,15);
    if(!['admin','editor','viewer'].includes(role))return error('Papel inválido.',400);
    if(role==='admin' && access.role!=='owner')return forbidden();
    const updated={...member,role:role as Member['role']};
    await db.transact([
      db.tx.update(membersTable(ctx.params.id),[{id:ctx.params.uid,record:updated}]),
      db.tx.update(userIndex(ctx.params.uid),[{id:ctx.params.id,record:{id:ctx.params.id,role}}])
    ]);
    return json({member:updated});
  }],
  'DELETE /api/v2/organizations/:id/members/:uid': [requireAuth(), async ctx => {
    const access=await accessFor(ctx.user!.userId,ctx.params.id);
    if(!access||!canAdmin(access.role))return forbidden();
    if(ctx.params.uid===access.org.ownerId)return error('O proprietário não pode ser removido.',400);
    const [member]=await db.get<Member>(membersTable(ctx.params.id),[ctx.params.uid],{consistent:true});
    if(!member || member.role==='revoked')return error('Membro não encontrado.',404);
    if(access.role==='admin' && member.role==='admin')return forbidden();
    const now=new Date().toISOString();
    await db.transact([
      db.tx.update(membersTable(ctx.params.id),[{
        id:ctx.params.uid,
        record:{...member,role:'revoked',revokedAt:now}
      }]),
      db.tx.delete(userIndex(ctx.params.uid),[ctx.params.id])
    ]);
    return json({removed:true});
  }]
};

