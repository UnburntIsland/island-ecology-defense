// Comprehensive browser review. Uses an isolated browser profile; never writes player saves.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.env.REVIEW_OUT||'.taste-skill/full-review/before';mkdirSync(out,{recursive:true});
const browser=await Browser.launch(),report={checks:[],screens:[],errors:[]};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const widths=(process.env.REVIEW_WIDTHS||'844,1440,667').split(',').map(Number);
function record(name,data){report.checks.push({name,...data});console.log(name,JSON.stringify(data));}
async function settle(p){await p.eval(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});await delay(100);}
async function click(p,selector){
 await p.eval(s=>{const n=document.querySelector(s);if(!n)throw Error('Missing '+s);n.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})},selector);await settle(p);
 const point=await p.eval(s=>{const n=document.querySelector(s),r=n.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);if(n.disabled)throw Error('Disabled '+s);if(!n.contains(hit))throw Error('Covered '+s+' by '+hit?.outerHTML.slice(0,160));return{x,y}},selector);
 await p.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await p.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await settle(p);
}
async function shot(p,name){
 await settle(p);await p.screenshot({path:out+'/'+name+'.png',format:'png'});
 const data=await p.eval(()=>{
  const visible=n=>!!n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden'&&!n.closest('[hidden],.hidden');
  const problems=[];
  for(const n of document.querySelectorAll('button,h1,h2,h3,label,#v29SpeechText,#v22DialogueText,#quizQuestion,#v39Prompt')){
   if(!visible(n))continue;const r=n.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;
   if(n.scrollWidth>n.clientWidth+3&&getComputedStyle(n).overflowX!=='auto')problems.push({type:'horizontal-content',id:n.id,text:n.textContent.trim().slice(0,70),w:r.width,scroll:n.scrollWidth});
   if(n.id==='v29SpeechText'&&n.scrollHeight>n.clientHeight+3)problems.push({type:'speech-overflow',h:n.clientHeight,scroll:n.scrollHeight});
  }
  const speech=$('v29Scene')?.open?$('v29Speech').getBoundingClientRect():null;
  const overlap=speech?protectedTargetsV46().map(r=>Math.max(0,Math.min(speech.right,r.right)-Math.max(speech.left,r.left))*Math.max(0,Math.min(speech.bottom,r.bottom)-Math.max(speech.top,r.top))):[];
  return{problems,overlap,bodyOverflow:document.documentElement.scrollWidth>innerWidth+2,step:tutorialV24?.step,page:dialoguePageV29};
 });report.screens.push({name,...data});
}
async function tutorial(width){
 const p=await browser.newPage({width,height:Number(process.env.REVIEW_HEIGHT)||(width>1000?900:width===667?375:390)});
 await p.goto('http://127.0.0.1:8765/');await p.eval(()=>{startGuidedTutorialV24();setCombatSpeedV25(4)});
 let previous='',idle=0;const visited=new Set();
 for(let i=0;i<260;i++){
  const s=await p.eval(()=>({step:tutorialV24?.step,busy:tutorialV24?.busy,scene:$('v29Scene').open,page:dialoguePageV29,quiz:!!activeQuiz,viewer:$('cardViewer').open,deck:deckV20,hand:G.p.hand.map(c=>({id:c.id,star:c.star})),shop:G.p.shop.map(c=>c?.id),board:G.p.board.map(c=>c.id),ready:tutorialV24?.step===17?tutorialReadyV24():false}));
  if(s.step==null){record('tutorial completed '+width,{pass:true,visited:[...visited]});break}
  visited.add(s.step);const key=[s.step,s.scene,s.page,s.quiz,s.deck,s.hand.length,s.shop.filter(Boolean).length,s.busy].join('-');
  if(s.busy){await delay(800);i--;continue}
  if(key===previous){if(++idle>3)throw Error('Tutorial stalled '+width+' '+JSON.stringify(s))}else idle=0;
  previous=key;
  if(s.scene||!report.screens.some(x=>x.name===`tutorial-${width}-${s.step}-ready`))await shot(p,`tutorial-${width}-${s.step}-${s.scene?'page'+s.page:'ready'}`);
  if(s.scene){await click(p,'#v29Speech');continue}
  if(s.quiz){await click(p,'#quizChoices button:nth-child(3)');await shot(p,`tutorial-${width}-quiz-reward`);await click(p,'#quizContinue');continue}
  if(s.step===11){await click(p,'#hand .v38-hand-face');continue}
  if(s.step===12){await click(p,'#cardViewer button[onclick="flipViewedCard()"]');continue}
  if(s.step===13){await click(p,'#cardViewer button[onclick="closeCardViewer()"]');continue}
  const wanted={1:['p2','p1'],9:['p1'],14:['pa1'],20:['p1'],24:['pf1'],27:['p6','pa4','p5']}[s.step];
  const buyIndex=wanted?s.shop.findIndex(id=>wanted.includes(id)):s.step===17?s.shop.findIndex(Boolean):-1;
  if(buyIndex>=0){if(s.deck!=='shop'){await click(p,'#v20ShopTab');continue}await click(p,`#shopGrid .v20-shop-entry:has([data-v20-shop-index="${buyIndex}"]) .v38-buy`);continue}
  if([3,15,17,21,25,27].includes(s.step)&&s.hand.length){
   if(s.deck!=='hand'){await click(p,'#v20HandTab');continue}
   const desired=s.step===3?(s.board.length?'p1':'p2'):s.step===15?'pa1':s.step===21?'p1':s.step===25?'pf1':null;
   const idx=desired?s.hand.findIndex(c=>c.id===desired):0;await click(p,`#hand [data-v20-hand-index="${idx}"] .v38-play`);continue;
  }
  if([4,16,17,22,23,28,30].includes(s.step)){await click(p,'#v29TaskAction');continue}
  throw Error('Unhandled '+JSON.stringify(s));
 }
 report.errors.push(...p.consoleErrors);await p.close();
}
try{for(const w of widths)await tutorial(w);const bad=report.screens.filter(s=>s.problems.length||s.bodyOverflow||s.overlap.some(v=>v>1));if(bad.length)throw Error('Layout findings: '+bad.map(s=>s.name).join(', '))}catch(e){report.errors.push(e.stack);console.error(e.stack)}finally{await browser.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));process.exit(report.errors.length?1:0)}
