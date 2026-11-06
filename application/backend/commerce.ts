import { db, router, json, error, requireAuth } from '@appdeploy/sdk';
import { v02Routes, publicProduct } from './v02';

type Product = {
  title: string;
  description: string;
  category: string;
  kind: 'own' | 'affiliate' | 'third_party';
  price: number | null;
  imageUrl: string;
  originalUrl: string;
  affiliateUrl: string;
  status: 'draft' | 'published';
  sellerName: string;
  source: 'manual';
  createdAt: string;
  updatedAt: string;
  ownerId: string;
};
type Profile = {
  storeName: string;
  accountType: string;
  updatedAt: string;
  ownerId: string;
};
type Finance = {
  name: string;
  kind: 'income' | 'expense';
  amount: number;
  source: 'manual';
  createdAt: string;
  ownerId: string;
};
type AffiliateLink = {
  title: string;
  platform: string;
  originalUrl: string;
  affiliateUrl: string;
  createdAt: string;
  ownerId: string;
};

const productsTable = (userId: string) =>
  'gf_products_' + userId.replace(/[^a-zA-Z0-9]/g, '');
const linksTable = (userId: string) =>
  'gf_links_' + userId.replace(/[^a-zA-Z0-9]/g, '');
const financeTable = (userId: string) =>
  'gf_finance_' + userId.replace(/[^a-zA-Z0-9]/g, '');
const textValue = (input: unknown, max = 300) =>
  typeof input === 'string' ? input.trim().slice(0, max) : '';
const safeUrl = (input: unknown): string => {
  const value = textValue(input, 1500);
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};
const getProduct = async (uid: string, id: string) => {
  const [record] = await db.get<Product>(productsTable(uid), [id], {
    consistent: true,
  });
  return record;
};
const getProfile = async (uid: string) => {
  const [record] = await db.get<Profile>('gf_profiles', [uid]);
  return record;
};
const parseProduct = (body: unknown) => {
  const data = (body && typeof body === 'object' ? body : {}) as Record<
    string,
    unknown
  >;
  const title = textValue(data.title, 120);
  const description = textValue(data.description, 1200);
  const category = textValue(data.category, 80) || 'Outros';
  const kind =
    data.kind === 'affiliate' || data.kind === 'third_party'
      ? data.kind
      : 'own';
  const rawPrice = data.price;
  const price =
    rawPrice === '' || rawPrice === null || rawPrice === undefined
      ? null
      : Number(rawPrice);
  if (!title) return { message: 'Informe o nome do produto.' };
  if (
    price !== null &&
    (!Number.isFinite(price) || price < 0 || price > 100000000)
  )
    return { message: 'O preço informado é inválido.' };
  const originalRaw = textValue(data.originalUrl, 1500);
  const affiliateRaw = textValue(data.affiliateUrl, 1500);
  const imageRaw = textValue(data.imageUrl, 1500);
  const originalUrl = safeUrl(originalRaw);
  const affiliateUrl = safeUrl(affiliateRaw);
  const imageUrl = safeUrl(imageRaw);
  if (
    (originalRaw && !originalUrl) ||
    (affiliateRaw && !affiliateUrl) ||
    (imageRaw && !imageUrl)
  )
    return { message: 'Use apenas URLs HTTPS válidas.' };
  return {
    product: {
      title,
      description,
      category,
      kind,
      price,
      originalUrl,
      affiliateUrl,
      imageUrl,
    },
  };
};

export const handler = router({
  ...v02Routes,
  'GET /api/_healthcheck': [
    async () =>
      json({ ok: true, product: 'GestãoFácil Vendas', version: '0.1.0' }),
  ],
  'GET /api/catalog': [
    async ({ query }) => {
      const results = await db.list<Product>('gf_public', { limit: 100 });
      const term = textValue(query.q, 120).toLocaleLowerCase('pt-BR');
      const kind = textValue(query.kind, 20);
      const items = results.items.filter(
        p =>
          p.status === 'published' &&
          (!term ||
            (p.title + ' ' + p.category)
              .toLocaleLowerCase('pt-BR')
              .includes(term)) &&
          (!kind || p.kind === kind)
      );
      return json({ items: items.map(p => publicProduct(p)) });
    },
  ],
  'GET /api/workspace': [
    requireAuth(),
    async ({ user }) => {
      const uid = user!.userId;
      const [p, l, f, profile] = await Promise.all([
        db.list<Product>(productsTable(uid), { limit: 100 }),
        db.list<AffiliateLink>(linksTable(uid), { limit: 100 }),
        db.list<Finance>(financeTable(uid), { limit: 100 }),
        getProfile(uid),
      ]);
      return json({
        products: p.items,
        links: l.items,
        finances: f.items,
        profile: profile || null,
      });
    },
  ],
  'PUT /api/profile': [
    requireAuth(),
    async ({ user, body }) => {
      const uid = user!.userId;
      const data = (body && typeof body === 'object' ? body : {}) as Record<
        string,
        unknown
      >;
      const storeName = textValue(data.storeName, 100);
      const accountType = textValue(data.accountType, 20);
      if (!storeName)
        return error('Informe o nome da sua loja ou negócio.', 400);
      if (!['PF', 'MEI', 'PJ'].includes(accountType))
        return error('Selecione um perfil válido.', 400);
      const record: Profile = {
        storeName,
        accountType,
        updatedAt: new Date().toISOString(),
        ownerId: uid,
      };
      await db.tx.update('gf_profiles', [{ id: uid, record }]);
      return json({ profile: record });
    },
  ],
  'POST /api/products': [
    requireAuth(),
    async ({ user, body }) => {
      const parsed = parseProduct(body);
      if ('message' in parsed) return error(parsed.message!, 400);
      const now = new Date().toISOString();
      const product: Product = {
        ...parsed.product!,
        status: 'draft',
        source: 'manual',
        sellerName: '',
        ownerId: user!.userId,
        createdAt: now,
        updatedAt: now,
      };
      const [id] = await db.add(productsTable(user!.userId), [product]);
      if (!id) return error('Não foi possível cadastrar o produto.', 500);
      return json({ product: { ...product, id } }, 201);
    },
  ],
  'PUT /api/products/:id': [
    requireAuth(),
    async ({ user, params, body }) => {
      const uid = user!.userId;
      const existing = await getProduct(uid, params.id);
      if (!existing) return error('Produto não encontrado.', 404);
      const parsed = parseProduct(body);
      if ('message' in parsed) return error(parsed.message!, 400);
      const updated = {
        ...existing,
        ...parsed.product!,
        updatedAt: new Date().toISOString(),
      };
      if (existing.status === 'published') {
        if (!(updated.affiliateUrl || updated.originalUrl))
          return error(
            'Para manter a publicação, informe um link HTTPS de destino.',
            400
          );
        await db.transact([
          db.tx.update(productsTable(uid), [
            { id: params.id, record: updated },
          ]),
          db.tx.update('gf_public', [{ id: params.id, record: updated }]),
        ]);
      } else {
        await db.tx.update(productsTable(uid), [
          { id: params.id, record: updated },
        ]);
      }
      return json({ product: { ...updated, id: params.id } });
    },
  ],
  'POST /api/products/:id/publish': [
    requireAuth(),
    async ({ user, params }) => {
      const uid = user!.userId;
      const product = await getProduct(uid, params.id);
      if (!product) return error('Produto não encontrado.', 404);
      if (!product.affiliateUrl && !product.originalUrl)
        return error(
          'Informe um link HTTPS para onde o comprador será direcionado. Checkout próprio ainda não está ativo.',
          400
        );
      const profile = await getProfile(uid);
      if (!profile?.storeName)
        return error(
          'Configure o nome da loja em Perfil antes de publicar.',
          400
        );
      const updated: Product = {
        ...product,
        status: 'published',
        sellerName: profile.storeName,
        updatedAt: new Date().toISOString(),
      };
      await db.transact([
        db.tx.update(productsTable(uid), [{ id: params.id, record: updated }]),
        db.tx.update('gf_public', [{ id: params.id, record: updated }]),
      ]);
      return json({ product: { ...updated, id: params.id } });
    },
  ],
  'POST /api/products/:id/unpublish': [
    requireAuth(),
    async ({ user, params }) => {
      const uid = user!.userId;
      const product = await getProduct(uid, params.id);
      if (!product) return error('Produto não encontrado.', 404);
      const updated = {
        ...product,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };
      if (product.status === 'published') {
        await db.transact([
          db.tx.update(productsTable(uid), [
            { id: params.id, record: updated },
          ]),
          db.tx.delete('gf_public', [params.id]),
        ]);
      }
      return json({ product: { ...updated, id: params.id } });
    },
  ],
  'DELETE /api/products/:id': [
    requireAuth(),
    async ({ user, params }) => {
      const uid = user!.userId;
      const product = await getProduct(uid, params.id);
      if (!product) return error('Produto não encontrado.', 404);
      if (product.status === 'published') {
        await db.transact([
          db.tx.delete(productsTable(uid), [params.id]),
          db.tx.delete('gf_public', [params.id]),
        ]);
      } else {
        await db.delete(productsTable(uid), [params.id]);
      }
      return json({ deleted: true });
    },
  ],
  'POST /api/links': [
    requireAuth(),
    async ({ user, body }) => {
      const data = (body && typeof body === 'object' ? body : {}) as Record<
        string,
        unknown
      >;
      const title = textValue(data.title, 120);
      const platform = textValue(data.platform, 60);
      const originalUrl = safeUrl(data.originalUrl);
      const affiliateUrl = safeUrl(data.affiliateUrl);
      if (!title || !platform) return error('Informe nome e plataforma.', 400);
      if (!originalUrl || !affiliateUrl)
        return error(
          'Informe links HTTPS originais e de afiliado válidos.',
          400
        );
      const record: AffiliateLink = {
        title,
        platform,
        originalUrl,
        affiliateUrl,
        createdAt: new Date().toISOString(),
        ownerId: user!.userId,
      };
      const [id] = await db.add(linksTable(user!.userId), [record]);
      if (!id) return error('Não foi possível registrar o link.', 500);
      return json({ link: { ...record, id } }, 201);
    },
  ],
  'DELETE /api/links/:id': [
    requireAuth(),
    async ({ user, params }) => {
      const table = linksTable(user!.userId);
      const [record] = await db.get<AffiliateLink>(table, [params.id], {
        consistent: true,
      });
      if (!record) return error('Link não encontrado.', 404);
      await db.delete(table, [params.id]);
      return json({ deleted: true });
    },
  ],
  'POST /api/finances': [
    requireAuth(),
    async ({ user, body }) => {
      const data = (body && typeof body === 'object' ? body : {}) as Record<
        string,
        unknown
      >;
      const name = textValue(data.name, 120);
      const kind = data.kind === 'income' ? 'income' : 'expense';
      const amount = Number(data.amount);
      if (
        !name ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 100000000
      )
        return error('Informe uma descrição e valor positivo válido.', 400);
      const record: Finance = {
        name,
        kind,
        amount,
        source: 'manual',
        createdAt: new Date().toISOString(),
        ownerId: user!.userId,
      };
      const [id] = await db.add(financeTable(user!.userId), [record]);
      if (!id) return error('Não foi possível salvar o lançamento.', 500);
      return json({ finance: { ...record, id } }, 201);
    },
  ],
  'DELETE /api/finances/:id': [
    requireAuth(),
    async ({ user, params }) => {
      const table = financeTable(user!.userId);
      const [record] = await db.get<Finance>(table, [params.id], {
        consistent: true,
      });
      if (!record) return error('Lançamento não encontrado.', 404);
      await db.delete(table, [params.id]);
      return json({ deleted: true });
    },
  ],
});

