async (page) => {
  const results=[];
  await page.goto('http://127.0.0.1:5174/?signedOut');
  await page.getByRole('button',{name:'Entrar na plataforma',exact:true}).waitFor({state:'visible'});
  for(const width of [375,390,768,1440,1920]){
    await page.setViewportSize({width,height:width<500?812:1000});
    await page.screenshot({path:'outputs/after-landing-'+width+'.png',animations:'disabled'});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(width<=980){
      await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
      await page.getByRole('button',{name:'Marketplace',exact:true}).last().click();
    }else await page.getByRole('button',{name:'Marketplace',exact:true}).click();
    await page.locator('#catalogo').scrollIntoViewIfNeeded();
    await page.getByRole('textbox',{name:'Buscar produtos',exact:true}).fill('teste visual');
    await page.getByRole('button',{name:'Afiliados',exact:true}).click();
    await page.screenshot({path:'outputs/after-catalog-'+width+'.png',animations:'disabled'});
    await page.getByRole('button',{name:'Consigo gerenciar mais de uma empresa?',exact:true}).click();
    const faq=await page.getByRole('button',{name:'Consigo gerenciar mais de uma empresa?',exact:true}).getAttribute('aria-expanded');
    results.push({width,screen:'landing',overflow,faqExpanded:faq,searchWorks:await page.getByRole('textbox',{name:'Buscar produtos',exact:true}).inputValue()==='teste visual'});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  }
  return results;
}
