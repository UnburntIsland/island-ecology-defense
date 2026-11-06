import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='design-previews/island-tabletop/renders-v7-final',b=await Browser.launch(),checks=[];mkdirSync(out,{recursive:true});
try{for(const [device,width,height] of [['desktop',1440,1000],['landscape',844,390],['short',667,375],['portrait',390,844]]){
const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/design-previews/island-tabletop/cards-v7.html',{settleMs:200});
for(const id of ['p7','p1','p8']){await p.eval(id=>document.querySelector(`[data-species=${id}]`).click(),id);await p.eval(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
checks.push({device,id,...await p.eval(()=>({fontLoaded:document.fonts.check('16px Huninn'),font:getComputedStyle(document.body).fontFamily,backImages:document.querySelectorAll('#reverse-card img').length,logo:document.querySelector('#reverse-card .island-mark').outerHTML,titleSize:getComputedStyle(document.querySelector('.series-name')).fontSize,overflowX:document.documentElement.scrollWidth>innerWidth,cards:[...document.querySelectorAll('.collectible')].map(c=>({height:c.getBoundingClientRect().height,overflow:c.scrollHeight>c.clientHeight})),story:document.querySelector('.story').textContent})),errors:p.consoleErrors});
if(id==='p7'||device==='desktop')await p.screenshot({path:`${out}/${device}-${id}.png`,format:'png',fullPage:true});}
await p.eval(()=>document.getElementById('flip-card').click());checks.push({device,flip:await p.eval(()=>!!document.querySelector('#interactive-card .back-card'))});await p.eval(()=>document.getElementById('flip-card').click());checks.push({device,flipBack:await p.eval(()=>!!document.querySelector('#interactive-card .bold-card'))});await p.close();}
}finally{await b.close();writeFileSync(out+'/checks.json',JSON.stringify(checks,null,2))}console.log(JSON.stringify(checks));
