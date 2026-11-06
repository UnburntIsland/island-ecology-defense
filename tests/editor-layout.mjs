// Regression: the right editor panel must not scroll underneath the left panel.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='.taste-skill/roundtrip/editor';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),results=[];
try{
 for(const [width,height]of [[1440,900],[1280,720],[1100,700],[844,390],[667,375]]){
  const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/');await p.eval('openEditor()');
  for(let i=0;i<100;i++){if(await p.eval(()=>!!$('embeddedEditor').contentDocument?.getElementById('editor-layout-v46')))break;await new Promise(r=>setTimeout(r,100))}
  await new Promise(r=>setTimeout(r,2500));
  const checks=[];
  for(const selector of ['#cardName','#exportZIP','#saveJSON','#downloadCrop','button[onclick="applyToGame()"]','button[onclick="exportFullGame()"]']){
   const result=await p.eval(selector=>{
    const f=$('embeddedEditor'),d=f.contentDocument,n=d.querySelector(selector);n.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    const r=n.getBoundingClientRect(),fr=f.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
    return {selector,pass:n.contains(d.elementFromPoint(x,y))&&f.contains(document.elementFromPoint(x+fr.x,y+fr.y)),rect:{x:r.x,y:r.y,width:r.width,height:r.height},hit:d.elementFromPoint(x,y)?.outerHTML.slice(0,180)};
   },selector);checks.push(result);
   if(selector==='#downloadCrop')await p.screenshot({path:`${out}/${width}-crop.png`,format:'png'});
  }
  const overflow=await p.eval(()=>{const d=$('embeddedEditor').contentDocument;return d.documentElement.scrollWidth>d.documentElement.clientWidth+1});
  const entry={width,height,checks,overflow,errors:p.consoleErrors};results.push(entry);console.log(width,JSON.stringify(entry));
 }
}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(results,null,2))}
if(results.length!==5||results.some(r=>r.overflow||r.errors.length||r.checks.some(c=>!c.pass)))process.exitCode=1;
