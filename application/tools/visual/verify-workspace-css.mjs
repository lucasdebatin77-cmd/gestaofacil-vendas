import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
const baseline='b67d497';
function operationalRules(text){
 const css=postcss.parse(text);const rules=[];
 css.walkRules(rule=>{
  const context=[];let parent=rule.parent;
  while(parent&&parent.type!=='root'){if(parent.type==='rule'&&parent.selector?.includes('.arena-app'))return;if(parent.type==='atrule')context.unshift('@'+parent.name+' '+parent.params);parent=parent.parent;}
  if(context.some(c=>/@(?:-\w+-)?keyframes (?:ar-|aro-|vr-|gf-source-)/.test(c)))return;
  const ast=selectorParser().astSync(rule.selector);
  for(const selector of [...ast.nodes]){
   let landing=false;selector.walkClasses(c=>{if(c.value==='arena-app'||c.value==='gf-visual-release'||/^(ar-|aro-)/.test(c.value))landing=true;});
   if(landing)selector.remove();
  }
  if(ast.nodes.length)rules.push({context,selector:ast.toString(),declarations:rule.nodes.filter(n=>n.type==='decl').map(d=>({prop:d.prop,value:d.value,important:!!d.important}))});
 });return rules;
}
const before=operationalRules(execFileSync('git',['show',baseline+':application/src/commerce-ui.css'],{encoding:'utf8',maxBuffer:2e6}));
const after=operationalRules(fs.readFileSync('src/commerce-ui.css','utf8'));
const passed=JSON.stringify(before)===JSON.stringify(after);
console.log(JSON.stringify({baseline,operationalRulesBefore:before.length,operationalRulesAfter:after.length,passed},null,2));
if(!passed)process.exitCode=1;
