// Short presentation checks only: no AI loop, round progression or balance simulation.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.env.BATTLEFIELD_OUT||'.taste-skill/v45';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),report={checks:[],errors:[]};
const assert=(name,result)=>{report.checks.push({name,...result});if(!result.pass)throw Error(name+': '+JSON.stringify(result))};
try{
 for(const [width,height] of [[1440,900],[844,390],[667,375]]){
  const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/');
  await p.eval(`startGuidedTutorialV24();tutorialV24=null;clearDialogueV29();G.tutorialV24=false;G.p.board=['p1','p2','p5','p6','p7','p8'].map(id=>mkBoardUnit(tutorialCardV24(id)));G.a.board=['a1','a2','a3','a4','a5','a6'].map(id=>mkBoardUnit(tutorialCardV24(id)));render();`);
  assert(width+' undiscovered enemies remain secret',await p.eval(()=>({pass:!$('v45Scout').querySelector('[data-v45-scout]')&&$('v45Scout').querySelectorAll('.v45-unknown').length===6})));
  assert(width+' scouting reads recorded snapshot only',await p.eval(()=>{G.enemySeenV27={round:0,board:[{...G.a.board[0]}],field:null};const before=JSON.stringify(G.a);render();const button=$('v45Scout').querySelector('[data-v45-scout]');button.click();const pass=JSON.stringify(G.a)===before&&viewedCard.id===G.enemySeenV27.board[0].id&&$('v45Scout').querySelectorAll('[data-v45-scout]').length===1;closeCardViewer();return {pass}}));
  await p.eval(`tutorialV24={step:5,busy:false};prepareTutorialBattleV24();tutorialV24=null;render();`);
  await p.eval(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,300))});
  assert(width+' full combat surface and unobstructed cards',await p.eval(()=>{const nodes=[...document.querySelectorAll('#combatView .unit-card')];const bad=nodes.filter(n=>{const r=n.getBoundingClientRect(),img=n.querySelector('img'),name=n.querySelector('h3'),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !n.contains(hit)||r.width>=r.height||img.clientHeight<24||getComputedStyle(img).objectFit!=='contain'||name.scrollWidth>name.clientWidth+1});return {pass:nodes.length===12&&!bad.length&&!$('deploymentView').getClientRects().length,bad:bad.map(n=>n.dataset.unit),cards:nodes.length}}));
  await p.screenshot({path:out+'/combat-'+width+'.png',format:'png'});
  if(width===1440){
   assert('single attack animation preserves game state',await p.eval(async()=>{const before=JSON.stringify(G.fight),event={uid:G.fight.p[0].uid,tid:G.fight.a[0].uid,amount:1,counter:1};await animateAttackV18(event,sessionId);return {pass:before===JSON.stringify(G.fight)&&!document.querySelector('.attack-active')}}));
  }
  report.errors.push(...p.consoleErrors);await p.close();
 }
 const p=await b.newPage({width:844,height:390});await p.goto('file:///C:/Code/island-ecology-defense/index.html');
 assert('painted battlefield loads offline',await p.eval(async()=>{startGuidedTutorialV24();const bg=getComputedStyle($('v27Arena')).backgroundImage,src=bg.slice(5,-2),img=new Image();img.src=src;await img.decode();return {pass:src.startsWith('data:image/png')&&img.naturalWidth>1000}}));
 report.errors.push(...p.consoleErrors);await p.close();
}catch(e){report.errors.push(e.message)}finally{await b.close();writeFileSync(out+'/battlefield-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exit(report.errors.length?1:0)}
