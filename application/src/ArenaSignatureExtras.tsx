
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, ExternalLink,
  FileCheck2, Fingerprint, Globe2, KeyRound, Layers3, Link2, LockKeyhole,
  Radar, ShieldCheck, ShoppingBag, SlidersHorizontal, Store, Users
} from 'lucide-react';

export function ArenaReveal({children, delay=0, className=''}:{
  children:ReactNode;delay?:number;className?:string;
}) {
  const container=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const target=container.current;
    if(!target)return;
    if(typeof IntersectionObserver==='undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      setVisible(true); return;
    }
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}
    },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
    observer.observe(target);
    return()=>observer.disconnect();
  },[]);
  return <div ref={container} className={'aro-reveal '+(visible?'aro-visible ':'')+className}
    style={{transitionDelay:delay+'ms'}}>{children}</div>;
}

const steps=[
  {number:'01',name:'Crie seu espaço',body:'Cadastre sua conta e configure a empresa ou loja. Seu ambiente terá produtos, registros e equipe próprios.',icon:Store},
  {number:'02',name:'Organize sua operação',body:'Adicione produtos, guarde links oficiais de afiliados e registre entradas e despesas manualmente.',icon:Layers3},
  {number:'03',name:'Publique e acompanhe',body:'Escolha quais produtos mostrar no marketplace e acompanhe seus registros. Os dados externos só aparecem após integração autorizada.',icon:Radar},
];
export function ArenaHowItWorks({onEnter}:{onEnter:()=>void}) {
  return <section id="como-funciona" className="aro-section aro-how">
    <div className="ar-container">
      <ArenaReveal className="aro-how-intro">
        <span className="ar-overline aro-eyebrow">COMO FUNCIONA</span>
        <h2>Da primeira ideia à sua operação, <em>em três passos.</em></h2>
        <p>Uma experiência organizada, sem configuração complicada e com tudo sob o controle da sua empresa.</p>
      </ArenaReveal>
      <div className="aro-steps">
        <span className="aro-steps-rail" aria-hidden="true"/>
        {steps.map((step,i)=>{
          const Icon=step.icon;
          return <ArenaReveal key={step.number} delay={i*90} className="aro-step">
            <div className="aro-step-mark"><span>{step.number}</span><Icon size={20}/></div>
            <h3>{step.name}</h3><p>{step.body}</p>
          </ArenaReveal>;
        })}
      </div>
      <ArenaReveal className="aro-how-action">
        <span><Check size={16}/> Produtos reais, informações claras e publicação sob sua aprovação.</span>
        <button onClick={onEnter}>Acessar a plataforma <ArrowUpRight size={17}/></button>
      </ArenaReveal>
    </div>
  </section>;
}

const trustItems=[
  {title:'Acesso autenticado',description:'Dados internos acessíveis apenas com sessão válida.',icon:Fingerprint},
  {title:'Papéis de equipe',description:'Proprietário, administrador, editor e visualizador.',icon:Users},
  {title:'Organizações separadas',description:'Espaços independentes para produtos e lançamentos.',icon:Layers3},
  {title:'Informações com origem',description:'Produtos e registros manuais são identificados como tal.',icon:FileCheck2},
];
const assurances=[
  'Links externos identificados antes de abrir a oferta',
  'Publicação e retirada de produtos controladas pelo vendedor',
  'Papéis de usuário aplicados no backend',
  'Recursos não integrados aparecem como indisponíveis',
];
export function ArenaSecurity(){
  return <section id="seguranca" className="aro-section aro-trust">
    <div className="ar-container aro-trust-grid">
      <ArenaReveal className="aro-trust-copy">
        <span className="ar-overline aro-eyebrow">CONTROLE E TRANSPARÊNCIA</span>
        <h2>Uma operação séria merece <em>clareza em cada detalhe.</em></h2>
        <p>O GestãoFácil distingue o que está disponível daquilo que ainda depende de integrações. Segurança e permissões fazem parte da base da plataforma.</p>
        <div className="aro-assurances">
          {assurances.map(value=><div key={value}><span><Check size={14}/></span>{value}</div>)}
        </div>
        <small>Esta apresentação não representa certificação ISO, auditoria independente ou SLA contratado.</small>
      </ArenaReveal>
      <div className="aro-trust-cards">
        {trustItems.map((item,i)=>{
          const Icon=item.icon;
          return <ArenaReveal delay={i*70} key={item.title} className="aro-trust-card">
            <span className="aro-trust-card-icon"><Icon size={22}/></span>
            <h3>{item.title}</h3><p>{item.description}</p>
          </ArenaReveal>;
        })}
      </div>
    </div>
  </section>;
}

const questions=[
  {q:'A GestãoFácil substitui minha loja atual?',a:'Não necessariamente. Nesta fase, o GestãoFácil funciona como vitrine pública e painel de gestão. Para finalizar uma compra, o consumidor segue para o link externo informado pelo anunciante. O checkout próprio ainda não está habilitado.'},
  {q:'Posso divulgar produtos como afiliado?',a:'Sim. Você pode organizar links de afiliados gerados oficialmente nas plataformas parceiras e cadastrar ofertas para o marketplace. Comissões e conversões externas não são calculadas sem uma integração autorizada.'},
  {q:'Consigo gerenciar mais de uma empresa?',a:'Sim. O painel oferece espaços de trabalho separados. Os usuários autorizados podem alternar entre empresas, e cada organização mantém seus próprios produtos, links e registros financeiros.'},
  {q:'O Radar de Produtos já usa inteligência artificial?',a:'O Radar atual organiza os produtos e mostra quais dados faltam para uma análise confiável. Os agentes de IA e conectores externos permanecem em desenvolvimento; não são apresentadas pontuações ou vendas fictícias.'},
  {q:'O GestãoFácil cobra ou recebe pagamentos de clientes?',a:'Ainda não. O marketplace atual direciona compradores para sites externos. O checkout, as taxas e o repasse aos vendedores dependem de uma futura integração de pagamentos homologada.'},
  {q:'Meus colaboradores podem acessar tudo?',a:'Não. O sistema possui papéis de proprietário, administrador, editor e visualizador. A disponibilidade de alterações depende das permissões do usuário na empresa correspondente.'}
];
export function ArenaFaq({onEnter}:{onEnter:()=>void}){
  const [open,setOpen]=useState<number|null>(0);
  return <section id="duvidas" className="aro-section aro-faq">
    <div className="ar-container aro-faq-layout">
      <ArenaReveal className="aro-faq-intro">
        <span className="ar-overline aro-eyebrow">DÚVIDAS FREQUENTES</span>
        <h2>O que você precisa saber, <em>sem letras pequenas.</em></h2>
        <p>O objetivo é deixar claro o que já funciona, o que está em desenvolvimento e como começar.</p>
        <button onClick={onEnter}>Acessar meu espaço <ArrowUpRight size={16}/></button>
      </ArenaReveal>
      <div className="aro-faq-items">
        {questions.map((item,i)=>{
          const expanded=open===i;
          return <div key={item.q} className="aro-faq-item">
            <button
              type="button" aria-expanded={expanded}
              aria-controls={'aro-answer-'+i}
              onClick={()=>setOpen(expanded?null:i)}>
              <span>{item.q}</span><span className={'aro-faq-plus '+(expanded?'aro-faq-plus-open':'')}>
                <ChevronDown size={19}/></span>
            </button>
            <div id={'aro-answer-'+i} className={'aro-faq-answer '+(expanded?'aro-faq-answer-open':'')}>
              <div><p>{item.a}</p></div>
            </div>
          </div>;
        })}
      </div>
    </div>
  </section>;
}

