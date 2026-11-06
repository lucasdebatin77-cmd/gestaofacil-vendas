/** VISUAL QA ONLY. Synthetic, empty workspace. No network or writes. */
export type AuthUser = {userId:string;name?:string;email?:string;scope:string};
const user:AuthUser={userId:'visual-fixture',name:'Revisão visual',email:'visual@example.invalid',scope:'openid profile email'};
const org={id:'visual-org',storeName:'Empresa de teste visual',accountType:'PJ',role:new URLSearchParams(location.search).get('role')||'owner'};
const product={id:'visual-product',title:'Produto de teste visual',description:'Fixture sintética para conferir o layout. Não é uma oferta comercial.',category:'Teste visual',kind:'own',price:null,imageUrl:'',status:'published',sellerName:org.storeName,storeId:org.id,source:'Fixture visual',createdAt:'2026-11-06T12:00:00Z',updatedAt:'2026-11-06T12:00:00Z',originalUrl:'https://example.invalid',affiliateUrl:''};
const blocked=async()=>{throw new Error('Prévia visual: gravações e autenticação reais indisponíveis.');};
export const auth={getUser:async()=>new URLSearchParams(location.search).has('signedOut')?null:user,signInWithRedirect:blocked,signOut:blocked};
export const api={
  get:async(path:string)=>{
    if(path.startsWith('/api/v2/catalog'))return {data:{items:[],nextCursor:null}};
    if(path.startsWith('/api/v2/workspace'))return {data:{organization:org,organizations:[org],profile:{storeName:org.storeName,accountType:'PJ'},products:[],links:[],finances:[]}};
    if(path.includes('/members'))return {data:{members:[]}};
    if(path.startsWith('/api/v2/stores/'))return {data:{store:org,items:[product]}};
    if(path.startsWith('/api/v2/public/products/'))return {data:{product}};
    throw new Error('Fixture não definida: '+path);
  },post:blocked,put:blocked,delete:blocked
};
export const invitesClient={getPendingCode:()=>null,clearPendingCode:()=>{},buildJoinUrl:()=>{throw new Error('Convites indisponíveis nesta prévia');}};
