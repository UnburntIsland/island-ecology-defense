// Bounded visual inspection: staged UI states, no battle loop and no saved user profile.
// Requires the installed design-taste-frontend skill (TASTE_SKILL_ROOT can override it).
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
const skill=process.env.TASTE_SKILL_ROOT||join(process.env.USERPROFILE,'.codex/skills/design-taste-frontend');
const {Browser}=await import(pathToFileURL(join(skill,'scripts/lib/cdp.mjs')));
const source=readFileSync('index.html','utf8');
for(const m of source.matchAll(/<script(?![^>]*type=)[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
const out=process.env.UI_OUT||'.taste-skill/after';mkdirSync(out,{recursive:true});
const browser=await Browser.launch();const report={scope:'Staged layouts and short operations; no full playthrough or balance tests.',results:[],errors:[]};
const settle=async p=>p.eval(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getClientRects().length).map(i=>i.decode().catch(()=>{})));await new Promise(r=>setTimeout(r,450))});
const base=`startGuidedTutorialV24();tutorialV24=null;clearDialogueV29();G.tutorialV24=false;G.p.gold=12;G.p.shop=['p2','p1','pa1','pa3','p4'].map(id=>tutorialCardV24(id));G.p.hand=['p7','p8','pa1','pf1','p5','p6','pa2'].map(id=>({...tutorialCardV24(id),handId:NEXT_ID++}));G.p.board=['p2','p1'].map(id=>mkBoardUnit(tutorialCardV24(id)));G.a.board=['a1','a2','a3','a4','a5','a6'].map(id=>mkBoardUnit(tutorialCardV24(id)));deckV20='shop';render();`;
async function capture(p,name){await settle(p);await p.screenshot({path:join(out,name+'.png'),format:'png'});}
async function geometry(p,label){const data=await p.eval(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
 const cards=[...document.querySelectorAll('#v27Cards .v20-shop-entry,#v27Cards .hand-card')].filter(e=>e.getClientRects().length).map(e=>({box:rect(e),image:rect(e.querySelector('img')),button:rect(e.querySelector('.v38-buy,.v38-play'))}));
 const slots=[...document.querySelectorAll('#v27Arena .unit-slot')].filter(e=>e.getClientRects().length).map(e=>({box:rect(e),card:e.querySelector('.unit-card')?rect(e.querySelector('.unit-card')):null,image:e.querySelector('img')?rect(e.querySelector('img')):null}));
 const controls=[...document.querySelectorAll('#v27Controls button,#v27Controls select,#v27Cards .v20-deck-nav button')].filter(e=>e.getClientRects().length).map(e=>({id:e.id,box:rect(e)}));
 return {viewport:[innerWidth,innerHeight],table:rect(document.getElementById('v27Table')),cards,slots,controls,tabs:[document.getElementById('v20ShopTab').textContent,document.getElementById('v20HandTab').textContent],overflow:document.documentElement.scrollWidth>innerWidth,errors:[]};
 });
 for(const c of data.cards){if(c.box.w>=c.box.h)data.errors.push('Non-portrait card');if(c.image.h<30)data.errors.push('Card art under 30px');if(c.button.bottom>c.box.bottom+1)data.errors.push('Action exceeds card');}
 // A slot may also contain a separate adjustment control; measure the playable card itself.
 for(const c of data.slots){const shape=c.card||c.box;if(shape.w>shape.h+1)data.errors.push('Non-portrait card');if(c.image&&c.image.h<24)data.errors.push('Unit art under 24px');}
 if(data.table.bottom>data.viewport[1])data.errors.push('Table exceeds viewport');
 for(const c of data.controls)if(c.box.bottom>data.viewport[1]+1||c.box.right>data.viewport[0]+1)data.errors.push('Control outside viewport: '+c.id);
 if(!data.tabs[0].includes('招募')||!data.tabs[1].includes('手牌'))data.errors.push('Tab label lost');
 if(data.overflow)data.errors.push('Page horizontal overflow');
 report.results.push({label,...data});
}
try{
 const sizes=process.env.UI_SIZES==='quick'?[['desktop',1440,900],['landscape',844,390]]:[['desktop',1440,900],['laptop',1191,818],['landscape',844,390],['short',667,375]];
 for(const [name,width,height] of sizes){
  const p=await browser.newPage({width,height});await p.goto('http://127.0.0.1:8765/',{settleMs:50});
  await p.eval(base);await capture(p,name+'-prepare');await geometry(p,name+' prepare');
  if(name==='desktop'||name==='landscape'){
   await p.eval(`setDeckV20('hand');`);await capture(p,name+'-hand');await geometry(p,name+' hand');
   // Inspection and flip must not change the economy/roster or remount the two faces.
   const before=await p.eval(`JSON.stringify(G.p)`);
   await p.eval(`showCardViewer(G.p.hand[0]);`);await capture(p,name+'-viewer');
   const flip=await p.eval(`(()=>{const front=$('largeCard').shadowRoot.querySelector('.v42-front');for(let i=0;i<7;i++)flipViewedCard();return {sameFace:front===$('largeCard').shadowRoot.querySelector('.v42-front'),back:viewerBack,frontInert:front.inert,unchanged:JSON.stringify(G.p)===${JSON.stringify(before)}}})()`);
   report.results.push({label:name+' flip',...flip});await capture(p,name+'-viewer-back');await p.eval(`closeCardViewer();`);
   await p.eval(`G.p.board=['p1','p2','p5','p6','p7','p8'].map(id=>mkBoardUnit(tutorialCardV24(id)));tutorialV24={step:5,busy:false};prepareTutorialBattleV24();tutorialV24=null;render();`);await capture(p,name+'-combat');await geometry(p,name+' combat');
   // Render one representative of each of the five chapters without playing their battles.
   for(const step of [1,5,11,25,29]){
    await p.eval(`startGuidedTutorialV24();G.p.hand=['p1','pf1'].map(id=>({...tutorialCardV24(id),handId:NEXT_ID++}));G.p.hand[0].star=2;G.p.board=['p2','p1'].map(id=>mkBoardUnit(tutorialCardV24(id)));${step===5?'prepareTutorialBattleV24();':''}setTutorialStepV24(${step});`);
    await capture(p,`${name}-tutorial-${step}`);
    const check=await p.eval(()=>{
     const table=document.getElementById('v27Table').getBoundingClientRect();const speech=document.getElementById('v29Speech').getBoundingClientRect();
     const overlap=r=>Math.max(0,Math.min(speech.right,r.right)-Math.max(speech.left,r.left))*Math.max(0,Math.min(speech.bottom,r.bottom)-Math.max(speech.top,r.top));
     const face=coachModelV30?.primary?coachFaceV31(coachModelV30.primary):null;
     const target=face?.getBoundingClientRect(),destination=coachModelV30?.destination?.getBoundingClientRect();
     const frame=document.getElementById('v30PrimaryFrame').getBoundingClientRect();
     document.getElementById('v29Scene').close();const after=document.getElementById('v27Table').getBoundingClientRect();
     return {stage:TUTORIAL_STEPS_V24[tutorialV24.step].stage,overlap:target?overlap(target):0,destinationOverlap:destination?overlap(destination):0,tableStable:Math.abs(table.height-after.height)<1&&Math.abs(table.top-after.top)<1,frameError:target?Math.max(Math.abs(frame.left-target.left),Math.abs(frame.top-target.top)):null,target:face?.className};
    });report.results.push({label:`${name} tutorial ${step}`,...check});
   }
  }
  report.errors.push(...p.consoleErrors);await p.close();console.log('Inspected '+name);
 }
}finally{await browser.close();writeFileSync(join(out,'layout-report.json'),JSON.stringify(report,null,2));}
const failed=report.errors.length+report.results.filter(r=>r.errors?.length||r.overlap>0||r.destinationOverlap>0||r.tableStable===false||r.sameFace===false||r.unchanged===false).length;
console.log(JSON.stringify({failed,runtimeErrors:report.errors,checks:report.results.map(r=>({label:r.label,errors:r.errors,overlap:r.overlap,destinationOverlap:r.destinationOverlap,tableStable:r.tableStable,frameError:r.frameError,sameFace:r.sameFace,unchanged:r.unchanged}))},null,2));
process.exitCode=failed?1:0;
