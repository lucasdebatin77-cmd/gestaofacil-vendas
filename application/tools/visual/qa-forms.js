async (page) => {
 const results=[];
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:5174/');
 await page.getByRole('button',{name:'Meu painel',exact:true}).click();
 for(const width of [375,768,1440]){
  await page.setViewportSize({width,height:width===375?812:1000});
  const navigate=async name=>{if(width<=980)await page.getByRole('button',{name:'Abrir navegação',exact:true}).click();await page.getByRole('button',{name,exact:true}).first().click();};
  for(const [screen,button,id] of [['Meus produtos','Novo produto','product-form'],['Afiliados e links','Adicionar link','link-form'],['Financeiro','Novo lançamento','finance-form']]){
   await navigate(screen);
   await page.getByRole('button',{name:button,exact:true}).first().click();
   await page.screenshot({path:'outputs/after-'+id+'-'+width+'.png',animations:'disabled'});
   const cancel=page.getByRole('button',{name:'Cancelar',exact:true});
   await cancel.scrollIntoViewIfNeeded();
   await page.screenshot({path:'outputs/after-'+id+'-footer-'+width+'.png',animations:'disabled'});
   results.push({width,screen:id,cancelVisible:await cancel.isVisible(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
   await cancel.click();
  }
  if(width<=980)await page.getByRole('button',{name:'Abrir navegação',exact:true}).click();
  await page.getByRole('button',{name:'Criar nova empresa',exact:true}).click();
  await page.screenshot({path:'outputs/after-organization-form-'+width+'.png',animations:'disabled'});
  await page.getByRole('button',{name:'Cancelar',exact:true}).click();
  if(width<=980)await page.getByRole('button',{name:'Fechar navegação',exact:true}).click();
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5174/?signedOut');
 await page.getByRole('button',{name:'Entrar na plataforma',exact:true}).waitFor();
 const animations=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
 await page.keyboard.press('Tab');
 const skipLink=await page.getByRole('link',{name:'Pular para o conteúdo',exact:true}).evaluate(el=>el===document.activeElement);
 await page.emulateMedia({reducedMotion:'no-preference'});
 return {forms:results,reducedMotionRunningAnimations:animations,keyboardSkipLinkFocused:skipLink};
}
