import ts from 'typescript';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const baselinePaths=new Set(execFileSync("git",["ls-tree","-r","--full-tree","--name-only","410aa37"],{encoding:"utf8"}).trim().split("\n").map(p=>p.replace(/^application\//,"")));
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,root);
function diagnostics(baseline){
 const host=ts.createCompilerHost(parsed.options);const original=host.readFile;const cache=new Map();
 if(baseline)host.readFile=file=>{
  const rel=path.relative(root,file).replaceAll('\\','/');
  if(rel.startsWith('src/')&&/\.tsx?$/.test(rel)){
   if(!cache.has(rel))cache.set(rel,execFileSync('git',['show','410aa37:application/'+rel],{encoding:'utf8',maxBuffer:2e6}));
   return cache.get(rel);
  }return original(file);
 };
 const program=ts.createProgram(baseline?parsed.fileNames.filter(file=>baselinePaths.has(path.relative(root,file).replaceAll("\\","/"))):parsed.fileNames,parsed.options,host);
 return ts.getPreEmitDiagnostics(program).map(d=>({file:d.file?path.relative(root,d.file.fileName).replaceAll('\\','/'):'',code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,'\n')})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
}
const before=diagnostics(true),after=diagnostics(false);
console.log(JSON.stringify({baseline:'410aa37',baselineErrors:before.length,currentErrors:after.length,unchanged:JSON.stringify(before)===JSON.stringify(after),diagnostics:after},null,2));
if(JSON.stringify(before)!==JSON.stringify(after))process.exitCode=1;
