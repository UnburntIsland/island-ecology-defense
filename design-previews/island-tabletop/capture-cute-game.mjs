import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='design-previews/island-tabletop/renders-cute-game',b=await Browser.launch(),checks=[];mkdirSync(out,{recursive:true});
try{for(const [device,width,height] of [['desktop',1440,900],['landscape',844,390],['short',667,375]])for(const scene of ['story','battle']){
const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/design-previews/island-tabletop/screen.html?scene='+scene,{settleMs:200});await p.eval(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
await p.screenshot({path:`${out}/${device}-${scene}.png`,format:'png'});
checks.push({device,scene,...await p.eval(()=>({fontLoaded:document.fonts.check('16px Huninn'),font:getComputedStyle(document.body).fontFamily,overflowX:document.documentElement.scrollWidth>innerWidth,overflowY:document.documentElement.scrollHeight>innerHeight,clippedActions:[...document.querySelectorAll('.hand-entry .card-action')].filter(e=>e.getBoundingClientRect().bottom>document.querySelector('.hand-rail').getBoundingClientRect().bottom+1).length})),errors:p.consoleErrors});
if(scene==='battle'){await p.eval(()=>document.querySelector('[data-card=p1]').click());await p.screenshot({path:`${out}/${device}-viewer.png`,format:'png'});}else{await p.eval(()=>document.querySelector('[data-line=long]').click());await p.screenshot({path:`${out}/${device}-story-long.png`,format:'png'});}
await p.close();}
const p=await b.newPage({width:1191,height:818});await p.goto('http://127.0.0.1:8765/design-previews/island-tabletop/index.html');await p.eval(()=>document.fonts.ready);checks.push({scene:'gallery',...await p.eval(()=>({overflowX:document.documentElement.scrollWidth>innerWidth}))});await p.screenshot({path:out+'/gallery.png',format:'png'});await p.close();
}finally{await b.close();writeFileSync(out+'/checks.json',JSON.stringify(checks,null,2))}console.log(JSON.stringify(checks));
