import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='.taste-skill/comments/controls';mkdirSync(out,{recursive:true});const b=await Browser.launch(),report={checks:[],errors:[]};
const wait=()=>new Promise(r=>setTimeout(r,220));
async function click(p,s){const q=await p.eval(s=>{const n=document.querySelector(s),r=n.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(n.disabled||!n.contains(document.elementFromPoint(x,y)))throw Error('covered '+s);return{x,y}},s);for(const type of ['mousePressed','mouseReleased'])await p.send('Input.dispatchMouseEvent',{type,...q,button:'left',clickCount:1});await wait()}
try{for(const [width,height]of [[1440,900],[1160,520],[1024,601],[844,390],[667,375]]){
 const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/');
 await p.eval(()=>{startGuidedTutorialV24();tutorialV24=null;clearDialogueV29();G.tutorialV24=false;G.p.board=['p2','p1','p6','p7','p8','p9'].map(id=>mkBoardUnit(tutorialCardV24(id)));render()});await wait();
 for(const index of [1,6]){await click(p,`#rosterBoard .unit-slot:nth-child(${index}) summary`);const result=await p.eval(index=>{const box=document.querySelector(`#rosterBoard .unit-slot:nth-child(${index})`),card=box.querySelector('.unit-card').getBoundingClientRect(),buttons=[...box.querySelectorAll('button')].filter(n=>!n.disabled),issues=buttons.filter(n=>{const r=n.getBoundingClientRect();return r.top<0||r.bottom>innerHeight||r.left<0||r.right>innerWidth||!n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))});return{pass:issues.length===0,cardWidth:card.width,issues:issues.map(n=>n.outerHTML)}},index);report.checks.push({width,index,...result});await p.screenshot({path:`${out}/${width}-menu-${index}.png`,format:'png'});await click(p,`#rosterBoard .unit-slot:nth-child(${index}) summary`)}
 await click(p,'#rosterBoard .unit-slot:first-child summary');await click(p,'#rosterBoard .unit-slot:first-child button[onclick="moveUnit(0,1)"]');report.checks.push({width,action:'move',pass:await p.eval(()=>G.p.board[1].id==='p2')});
 await p.eval(()=>{const a=tutorialCardV24('p1');queueMergeV27(a,a,{...a,star:2,handId:999999});dismissMergeV27();decorateV41()});await wait();
 const label=await p.eval(()=>$('v27LastMerge').textContent);await click(p,'#v27LastMerge');report.checks.push({width,action:'merge-history',label,pass:label==='升星紀錄'&&await p.eval(()=>!$('v27Merge').classList.contains('hidden'))});await p.eval('dismissMergeV27()');
 await p.eval(()=>{startGuidedTutorialV24();dialogueStepV29=null;setTutorialStepV24(23);$('v29Scene').close();render()});await wait();
 report.checks.push({width,action:'one-refresh',pass:await p.eval(()=>getComputedStyle($('refreshButton')).display==='none'&&$('v29TaskAction').getClientRects().length>0)});
 report.errors.push(...p.consoleErrors);await p.close();
}}catch(e){report.errors.push(e.stack)}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exit(report.errors.length||report.checks.some(x=>!x.pass)?1:0)}
