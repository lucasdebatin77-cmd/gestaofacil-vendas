async (page) => {
  const results=[];
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:5174/');
  await page.getByRole('button',{name:'Meu painel',exact:true}).click();
  for(const [name,id] of [['Visão geral','dashboard'],['Meus produtos','products'],['Afiliados e links','affiliates'],['Financeiro','finance'],['Radar de produtos','radar'],['Equipe e acessos','team'],['Minha loja','store-settings'],['Integrações','integrations']]){
    await page.getByRole('button',{name,exact:true}).first().click();
    await page.screenshot({path:'outputs/after-'+id+'-1440.png',fullPage:true,animations:"disabled"});
    results.push({screen:id,h1:await page.locator('main h1').innerText(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  }
  await page.getByRole('button',{name:'Novo produto',exact:true}).count();
  return results;
}
