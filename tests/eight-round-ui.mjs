// One real game through the UI, at the built-in 4x speed. No game-state writes.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.env.GAME_OUT||'.taste-skill/roundtrip/game-1';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),r={rounds:[],actions:[],errors:[]};
const p=await b.newPage({width:844,height:390});
async function click(s){await p.eval(s=>document.querySelector(s)?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'}),s);await new Promise(r=>setTimeout(r,90));const pt=await p.eval(s=>{const n=document.querySelector(s);if(!n||n.disabled)throw Error('Unavailable '+s);const z=n.getBoundingClientRect(),x=z.x+z.width/2,y=z.y+z.height/2;if(!n.contains(document.elementFromPoint(x,y)))throw Error('Covered '+s);return{x,y}},s);await p.send('Input.dispatchMouseEvent',{type:'mousePressed',...pt,button:'left',clickCount:1});await p.send('Input.dispatchMouseEvent',{type:'mouseReleased',...pt,button:'left',clickCount:1});}
try{
 await p.goto(process.env.GAME_URL||'http://127.0.0.1:8765/');await p.eval(()=>{startGame();setCombatSpeedV25(4)});
 const refreshes={};for(let loop=0;loop<600;loop++){
  const s=await p.eval(()=>({phase:G.phase,finished:G.finished,round:G.round,hp:G.p.hp,ai:G.a.hp,quiz:activeQuiz?{answer:activeQuiz.answer,locked:quizAnswerLocked}:null,deck:deckV20,hand:G.p.hand.map(c=>({id:c.id,type:c.type,star:c.star})),board:G.p.board.map(c=>({id:c.id,star:c.star})),shop:G.p.shop.map(c=>c?{id:c.id,type:c.type,cost:c.cost}:null),gold:G.p.gold,free:G.p.freeBuys,upgrade:upgradeCost(G.p),level:G.p.level,field:!!G.p.field}));
  if(s.finished){r.result=await p.eval(()=>lastResult);await p.screenshot({path:out+'/final.png',format:'png'});break}
  if(s.quiz){if(!s.quiz.locked){await click('#quizChoices button:nth-child('+(s.quiz.answer+1)+')');await p.screenshot({path:out+'/quiz-'+s.round+'.png',format:'png'})}else await click('#quizContinue');continue}
  if(s.phase==='combat'){await new Promise(r=>setTimeout(r,900));loop--;continue}
  if(s.phase==='between'){r.rounds.push(s);console.log('Round',s.round,'HP',s.hp,s.ai);await p.screenshot({path:out+'/round-'+s.round+'.png',format:'png'});await click(await p.eval(()=>$('roundModal').open)?'#roundModal .btn':'#battleButton');continue}
  const playable=s.hand.findIndex(c=>c.type!=='unit'||s.board.length<6);
  if(playable>=0){if(s.deck!=='hand')await click('#v20HandTab');else{await click(`#hand [data-v20-hand-index="${playable}"] .v38-play`);if(await p.eval(()=>$('v38ReplaceField')?.open))await click('#v38ReplaceConfirm')}continue}
  if(s.upgrade===0||(s.level===1&&s.round>=3&&s.gold>=6)){await click('#v20ShopTab');await click('#upgradeButton');r.actions.push([s.round,'upgrade']);continue}
  const offers=s.shop.map((c,i)=>({c,i})).filter(({c})=>c&&(s.free||c.cost<=s.gold)&&(c.type==='unit'?(s.board.length<6||s.board.some(u=>u.id===c.id&&u.star<4)):c.type==='field'?!s.field:true));
  offers.sort((a,z)=>{const score=c=>c.type==='unit'?100+(s.board.some(u=>u.id===c.id)?(s.board.length<4?-20:40):0)+({'p1':12,'p2':22,'p4':24,'p5':20,'p3':36,'p6':22,'p7':35,'p8':30,'p9':30,'p10':30}[c.id]||0):c.type==='field'?70:c.id==='pa2'?45:10;return score(z.c)-score(a.c)});
  if((s.board.length<5||s.gold>=5)&&s.gold>=3&&!offers.some(x=>x.c.type==='unit')&&(refreshes[s.round]||0)<3){if(s.deck!=='shop')await click('#v20ShopTab');await click('#refreshButton');refreshes[s.round]=(refreshes[s.round]||0)+1;r.actions.push([s.round,'refresh']);continue}
  if(offers.length){const i=offers[0].i;if(s.deck!=='shop')await click('#v20ShopTab');else {await click(`#shopGrid .v20-shop-entry:has([data-v20-shop-index="${i}"]) .v38-buy`);r.actions.push([s.round,'buy',offers[0].c.id]);}continue}
  await p.screenshot({path:out+'/prepare-'+s.round+'.png',format:'png'});await click('#battleButton');
 }
 if(!r.result)throw Error('Run did not terminate');r.completedEightRounds=r.rounds.length===8&&r.result.round===8;r.errors.push(...p.consoleErrors);
}catch(e){r.errors.push(e.stack);console.error(e.stack);await p.screenshot({path:out+'/error.png',format:'png'})}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(r,null,2));console.log(JSON.stringify({rounds:r.rounds.length,result:r.result,errors:r.errors}));process.exit(r.errors.length?1:r.completedEightRounds?0:2)}
