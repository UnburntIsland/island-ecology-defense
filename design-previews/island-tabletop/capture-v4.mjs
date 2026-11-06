import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const root='design-previews/island-tabletop',out=root+'/renders-v4-final',checks=[],b=await Browser.launch();
mkdirSync(out,{recursive:true});
try{for(const [device,width,height] of [['desktop',1440,1000],['landscape',844,390],['portrait',390,844]]){
 const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/'+root+'/cards-v4.html',{settleMs:200});
 for(const species of ['p7','p1','p8']){
  await p.eval(id=>document.querySelector(`[data-species="${id}"]`).click(),species);
  await p.eval(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
  await p.screenshot({path:`${out}/${device}-${species}.png`,format:'png',fullPage:true});
  checks.push({device,species,...await p.eval(()=>({overflowX:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.naturalWidth).length,selected:document.querySelector('[aria-pressed=true]').dataset.species,images:[...document.images].map(i=>({src:i.getAttribute('src'),fit:getComputedStyle(i).objectFit,width:i.width,height:i.height})),cards:[...document.querySelectorAll('.collectible')].map(e=>({width:e.clientWidth,height:e.clientHeight,overflowX:e.scrollWidth>e.clientWidth,overflowY:e.scrollHeight>e.clientHeight})),errors:[]})),errors:p.consoleErrors});
 }await p.close();
}}finally{await b.close();writeFileSync(out+'/checks.json',JSON.stringify(checks,null,2));}console.log(JSON.stringify(checks,null,2));
