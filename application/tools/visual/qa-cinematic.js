async (page) => {
 const results=[];const failed=[];
 page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
 await page.goto('http://127.0.0.1:5174/?signedOut');
 await page.getByRole('button',{name:'Entrar na plataforma',exact:true}).waitFor();
 for(const width of [375,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:width<500?812:1000});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:'outputs/cinematic-hero-'+width+'.png',animations:'disabled'});
  results.push({screen:'hero',width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  if(width===375||width===768){
   await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
   await page.screenshot({path:'outputs/cinematic-menu-'+width+'.png',animations:'disabled'});
   await page.getByRole('button',{name:'Marketplace',exact:true}).last().click();
  }
  for(const id of ['ecossistema','como-funciona','catalogo','radar','inteligencia','seguranca','duvidas']){
   await page.locator('#'+id).evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-110,behavior:'instant'}));
   if(width===375||width===768||width===1440)await page.screenshot({path:'outputs/cinematic-'+id+'-'+width+'.png',animations:'disabled'});
   results.push({screen:id,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  }
 }
 await page.goto('http://127.0.0.1:5174/?signedOut&catalogFixture');
 await page.setViewportSize({width:375,height:812});
 const search=page.getByRole('textbox',{name:'Buscar produtos',exact:true});
 await search.fill('Sem correspondência');
 const noMatch=await page.getByRole('heading',{name:'Nenhum produto encontrado',exact:true}).isVisible();
 await search.fill('Produto de teste visual');
 const card=page.getByRole('button').filter({has:page.getByRole('heading',{name:'Produto de teste visual',exact:true})});
 await card.scrollIntoViewIfNeeded();
 await page.screenshot({path:'outputs/cinematic-real-catalog-component-375.png',animations:'disabled'});
 await card.click();
 await page.getByRole('heading',{name:'Produto de teste visual',exact:true}).waitFor();
 const productNavigation=page.url().includes('#/produto/visual-product');
 await page.goto('http://127.0.0.1:5174/?signedOut&motionCheck');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();
 await page.getByRole('button',{name:'Entrar na plataforma',exact:true}).waitFor();
 const runningAnimations=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
 const brokenImages=await page.locator('.arena-app img').evaluateAll(images=>images.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src));
 await page.keyboard.press('Tab');
 const skipFocused=await page.getByRole('link',{name:'Pular para o conteúdo',exact:true}).evaluate(el=>el===document.activeElement);
 await page.emulateMedia({reducedMotion:'no-preference'});
 return {responsive:results,searchNoMatch:noMatch,productNavigation,runningAnimations,brokenImages,skipFocused,failedResponses:failed};
}
