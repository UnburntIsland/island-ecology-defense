// Short visual and pointer checks only. No battle loop or full tutorial playthrough.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='.taste-skill/v46/final';mkdirSync(out,{recursive:true});
const browser=await Browser.launch(),report={checks:[],errors:[]};
const check=(name,result)=>{report.checks.push({name,...result});if(!result.pass)throw Error(name+': '+JSON.stringify(result))};
const settle=p=>p.eval(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,350))});
async function click(p,selector){
 const point=await p.eval(s=>{const e=document.querySelector(s);if(!e)throw Error(s);const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(!e.contains(document.elementFromPoint(x,y)))throw Error('Obstructed control '+s);return{x,y}},selector);
 await p.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await p.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await settle(p);
}
const stage=`startGuidedTutorialV24();tutorialV24=null;clearDialogueV29();G.tutorialV24=false;G.p.gold=50;G.p.shop=['p7','p8','pa1','pf1','p4'].map(id=>tutorialCardV24(id));G.p.hand=[];G.p.board=['p2','p1'].map(id=>mkBoardUnit(tutorialCardV24(id)));G.a.board=['a1','a2','a3','a4','a5','a6'].map(id=>mkBoardUnit(tutorialCardV24(id)));deckV20='shop';render();`;
try{
 for(const [width,height]of [[1440,900],[1191,818],[844,390],[667,375]]){
  const p=await browser.newPage({width,height});await p.goto('http://127.0.0.1:8765/');await p.eval(stage);await settle(p);
  check(width+' readable cards and independent touch controls',await p.eval(()=>{
   const units=[...document.querySelectorAll('#rosterBoard .unit-card')],names=units.map(e=>e.querySelector('h3')),images=units.map(e=>e.querySelector('img'));
   const controls=[...document.querySelectorAll('#rosterBoard .slot-actions summary,#v39DetailButton,#v41Browse button,.v38-buy')].filter(e=>e.getClientRects().length);
   const data={cards:units.map(e=>({w:e.clientWidth,h:e.clientHeight})),art:images.map(e=>e.clientHeight),buttons:controls.map(e=>({label:e.getAttribute('aria-label'),h:e.getBoundingClientRect().height}))};
   return{pass:units.every(e=>e.clientWidth<e.clientHeight)&&names.every(e=>e.scrollWidth<=e.clientWidth+1)&&images.every(e=>e.clientHeight>30)&&controls.every(e=>e.getBoundingClientRect().height>=44),...data};
  }));
  check(width+' presentation leaves game state unchanged',await p.eval(()=>{const before=JSON.stringify(G);syncUsabilityV46();layoutV41();return{pass:before===JSON.stringify(G)}}));
  await p.screenshot({path:out+'/prepare-'+width+'.png',format:'png'});
  if(width===1440){
   await click(p,'#v46ScoutToggle');check('Unknown scouting stays secret',await p.eval(()=>({pass:$('v45ScoutCards').querySelectorAll('.v45-unknown').length===6&&!$('v45ScoutCards').querySelector('[data-v45-scout]')})));
   check('Scouting panel covers underlying roster controls',await p.eval(()=>({pass:[...document.querySelectorAll('#rosterBoard .slot-actions summary')].every(n=>{const r=n.getBoundingClientRect();return $('v45ScoutCards').contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))})})));
   await p.screenshot({path:out+'/scouting.png',format:'png'});await click(p,'#v46ScoutToggle');
  }
  if(width===1440||width===844){
   await click(p,'.shop-card');check(width+' card-face click is inspection only',await p.eval(()=>({pass:$('cardViewer').open&&G.p.gold===50&&!G.p.hand.length})));
   await click(p,'#cardViewer button[onclick="flipViewedCard()"]');check(width+' flip labels follow the visible face',await p.eval(()=>({pass:viewerBack&&document.querySelector('#cardViewer .v46-button-text').textContent==='看正面'})));
   await p.screenshot({path:out+'/viewer-back-'+width+'.png',format:'png'});await click(p,'#cardViewer button[onclick="closeCardViewer()"]');
   await click(p,'.v38-buy');await click(p,'#v20HandTab');await click(p,'.v38-play');
   check(width+' pointer purchase and deployment',await p.eval(()=>({pass:G.p.gold===47&&!G.p.hand.length&&G.p.board.length===3})));
   await p.eval(`setDeckV20('shop');G.p.shop=[tutorialCardV24('pa1')];render()`);await settle(p);await click(p,'.v38-buy');await click(p,'#v20HandTab');await click(p,'.v38-play');
   check(width+' pointer spell and pending summary',await p.eval(()=>({pass:G.p.queue.length===1&&!G.p.hand.length&&$('v46Tactics').textContent.includes('待發動 1 張')})));
   await p.eval(`setDeckV20('shop');G.p.shop=[tutorialCardV24('pf1')];render()`);await settle(p);await click(p,'.v38-buy');await click(p,'#v20HandTab');await click(p,'.v38-play');
   check(width+' pointer field activation',await p.eval(()=>({pass:G.p.field?.id==='pf1'&&!G.p.hand.length})));
   await click(p,'#v39DetailButton');await p.screenshot({path:out+'/details-'+width+'.png',format:'png'});await click(p,'#contextDrawer .drawer-head button');
  }
  await p.eval(stage);await p.eval(`G.p.board=['p1','p2','p5','p6','p7','p8'].map(id=>mkBoardUnit(tutorialCardV24(id)));tutorialV24={step:5,busy:false};prepareTutorialBattleV24();tutorialV24=null;render();`);await settle(p);
  check(width+' twelve full battle cards and accessible footer',await p.eval(()=>{
   const cards=[...document.querySelectorAll('#combatView .unit-card')];const bad=cards.filter(e=>{const r=e.getBoundingClientRect(),h=e.querySelector('h3');return r.width>=r.height||r.bottom>innerHeight||h.scrollWidth>h.clientWidth+1||!e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))});
   const detail=$('v39DetailButton').getBoundingClientRect();return{pass:cards.length===12&&!bad.length&&detail.bottom<=innerHeight,count:cards.length,card:cards[0]?.getBoundingClientRect().toJSON(),nameFont:getComputedStyle(cards[0].querySelector('h3')).fontSize,bad:bad.length};
  }));
  await p.screenshot({path:out+'/combat-'+width+'.png',format:'png'});
  if(width===1440||width===844||width===667){
   for(const step of [1,5,11,25,29]){
    await p.eval(`startGuidedTutorialV24();G.p.hand=['p1','pf1'].map(id=>({...tutorialCardV24(id),handId:NEXT_ID++}));G.p.hand[0].star=2;G.p.board=['p2','p1'].map(id=>mkBoardUnit(tutorialCardV24(id)));${step===5?'prepareTutorialBattleV24();':''}setTutorialStepV24(${step});`);await settle(p);
    check(width+' tutorial '+step+' whole target unobstructed',await p.eval(()=>{const s=$('v29Speech').getBoundingClientRect();const overlap=protectedTargetsV46().map(r=>Math.max(0,Math.min(s.right,r.right)-Math.max(s.left,r.left))*Math.max(0,Math.min(s.bottom,r.bottom)-Math.max(s.top,r.top)));return{pass:overlap.every(x=>x===0),overlap}}));
    await p.screenshot({path:out+'/tutorial-'+width+'-'+step+'.png',format:'png'});
   }
  }
  report.errors.push(...p.consoleErrors);await p.close();
 }
 const offline=await browser.newPage({width:844,height:390});await offline.goto('file:///C:/Code/island-ecology-defense/index.html');await offline.eval(stage);await settle(offline);
 check('Offline font, cards, island background',await offline.eval(async()=>{const bg=getComputedStyle($('v27Arena')).backgroundImage,src=bg.slice(5,-2),im=new Image();im.src=src;await im.decode();return{pass:document.fonts.check('16px Huninn')&&im.naturalWidth>1000&&!!document.querySelector('.ec-card')}}));
 report.errors.push(...offline.consoleErrors);await offline.close();
}catch(error){report.errors.push(error.message)}finally{await browser.close();writeFileSync(out+'/checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exit(report.errors.length?1:0)}
