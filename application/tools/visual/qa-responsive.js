async (page) => {
  const results=[];
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:5174/');
  await page.getByRole('button',{name:'Meu painel',exact:true}).click();
  for(const width of [375,390,768,1440,1920]){
    await page.setViewportSize({width,height:width<500?812:1000});
    for(const [name,id] of [['Visão geral','dashboard'],['Meus produtos','products'],['Afiliados e links','affiliates'],['Financeiro','finance'],['Radar de produtos','radar'],['Equipe e acessos','team'],['Minha loja','store-settings']]){
      if(width<=980)await page.getByRole('button',{name:'Abrir navegação',exact:true}).click();
      await page.getByRole('button',{name,exact:true}).first().click();
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      const h1=await page.locator('main h1').innerText();
      results.push({width,screen:id,h1,overflow});
      if(width!==390)await page.screenshot({path:'outputs/after-'+id+'-'+width+'.png',fullPage:true,animations:"disabled"});
    }
    if(width<=980){
      await page.getByRole('button',{name:'Abrir navegação',exact:true}).click();
      await page.screenshot({path:'outputs/after-navigation-'+width+'.png',animations:'disabled'});
      await page.getByRole('button',{name:'Fechar navegação',exact:true}).click();
    }
  }
  return results;
}
