import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const baseline='410aa37';
const root=process.cwd();
const readBase=file=>execFileSync('git',['show',`${baseline}:application/${file}`],{encoding:'utf8',maxBuffer:2e6}).replace(/\r\n/g,'\n');
const readNow=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n');
const checks=[];
for(const file of ['backend/index.ts','backend/commerce.ts','backend/v02.ts','package.json','vite.config.ts','tsconfig.json','appdeploy.auth-login.json','public/gestaofacil-symbol.svg','public/manifest.webmanifest','tests/tests.json']){
  const equal=readBase(file)===readNow(file); checks.push({file,check:'contents unchanged',pass:equal});
}
function extract(text,file){
 const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const events=[],contracts=[],operations=[];
 function visit(node){
  if(ts.isJsxAttribute(node)&&/^on[A-Z]/.test(node.name.getText(source)))events.push(node.getText(source));
  if(ts.isTypeAliasDeclaration(node)||ts.isInterfaceDeclaration(node))contracts.push(node.getText(source));
  if(ts.isCallExpression(node)&&/^(api\.|auth\.|invitesClient\.|useState$|useEffect$|useMemo$|useRef$)/.test(node.expression.getText(source)))operations.push(node.getText(source));
  ts.forEachChild(node,visit);
 }visit(source);return {events,contracts,operations};
}
for(const file of ['src/GestaoFacil.tsx','src/ArenaExperience.tsx','src/PremiumDashboard.tsx','src/V02.tsx','src/ArenaSignatureExtras.tsx']){
 const before=extract(readBase(file),file),after=extract(readNow(file),file);
 for(const key of ['events','contracts','operations'])checks.push({file,check:key,count:before[key].length,pass:JSON.stringify(before[key])===JSON.stringify(after[key])});
}
console.log(JSON.stringify({baseline,checks,passed:checks.every(c=>c.pass)},null,2));
if(checks.some(c=>!c.pass))process.exitCode=1;
