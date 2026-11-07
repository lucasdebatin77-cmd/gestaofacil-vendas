async(page)=>{
await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:5174/?signedOut');await page.locator('.hero.ready').waitFor();
await page.mouse.move(1200,400);await page.waitForFunction(()=>Math.abs(parseFloat(getComputedStyle(document.querySelector('.hero')).getPropertyValue('--px')))>.01);const parallax=await page.locator('.hero').evaluate(e=>getComputedStyle(e).getPropertyValue('--px'));
const canvas=await page.locator('canvas').evaluate(e=>({width:e.width,height:e.height,pixelData:e.getContext('2d').getImageData(0,0,e.width,e.height).data.some(v=>v>0)}));
const tabs=[];for(let i=0;i<3;i++){await page.getByRole('tab').nth(i).click();await page.waitForFunction(i=>document.querySelectorAll('[role="tab"]')[i].getAttribute('aria-selected')==='true',i);tabs.push({index:i,selected:await page.getByRole('tab').nth(i).getAttribute('aria-selected')});await page.screenshot({path:'../../../outputs/fidelity-ecosystem-state-'+i+'.png',animations:'disabled'});}
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.getByRole('button',{name:'Começar agora',exact:true}).click();const enter=page.url();
return{parallax,canvas,tabs,enterUrl:enter};}
