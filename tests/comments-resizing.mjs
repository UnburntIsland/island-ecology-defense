import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const b=await Browser.launch(),out='.taste-skill/comments/resizing';mkdirSync(out,{recursive:true});const checks=[];
try{const p=await b.newPage({width:1160,height:520});await p.goto('http://127.0.0.1:8765/');
await p.eval(()=>{startGuidedTutorialV24();tutorialV24=null;clearDialogueV29();G.tutorialV24=false;G.p.board=['p1','p2','p3','p4','p5','p6'].map(id=>mkBoardUnit(tutorialCardV24(id)));render()});
for(const [width,height]of [[667,375],[1160,520],[1024,601],[1160,761],[1440,900],[844,390]]){
 await p.setViewport({width,height});
 for(const scale of [1.08,1.18,1.3]){
  await p.eval(scale=>setUiScale(scale),scale);await new Promise(r=>setTimeout(r,250));
  const result=await p.eval(()=>{const before=JSON.stringify(G);layoutV41();const cards=[...document.querySelectorAll('#rosterBoard .unit-card')],arena=$('v27Arena').getBoundingClientRect();let bad=[];for(const n of cards){const r=n.getBoundingClientRect(),h=n.querySelector('h3');if(r.top<arena.top||r.bottom>arena.bottom||r.left<arena.left||r.right>arena.right||h.scrollWidth>h.clientWidth+2)bad.push(h.textContent);if(innerHeight<=840&&innerWidth>innerHeight){const slot=n.closest('.unit-slot'),sr=slot.getBoundingClientRect(),label=getComputedStyle(slot,'::after');if(sr.x+parseFloat(label.left)<r.right-1)bad.push('slot number overlaps card')}}return{pass:before===JSON.stringify(G)&&!bad.length&&document.documentElement.scrollWidth<=innerWidth+1,bad,cardWidth:cards[0].clientWidth}});
  checks.push({width,height,scale,...result});
 }
 await p.screenshot({path:`${out}/${width}-${height}.png`,format:'png'});
}
await p.setViewport({width:667,height:375});await p.eval(()=>{const a=tutorialCardV24('p1');queueMergeV27(a,a,{...a,star:4,handId:999999});decorateV41()});await new Promise(r=>setTimeout(r,300));
checks.push(await p.eval(()=>{const n=$('v27MergeTitle');return{name:'small-screen full merge title',pass:n.scrollWidth<=n.clientWidth+1,text:n.textContent,width:n.clientWidth,scroll:n.scrollWidth}}));
await p.screenshot({path:out+'/merge.png',format:'png'});
if(p.consoleErrors.length)throw Error(JSON.stringify(p.consoleErrors));
}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(checks,null,2));console.log(JSON.stringify(checks));if(checks.some(c=>!c.pass))process.exitCode=1}
