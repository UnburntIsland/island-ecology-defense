// Bounded UI fixtures and keyboard checks; the real playthrough is full-game-ui.mjs.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='.taste-skill/full-review/edges';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),report={checks:[],screens:[],errors:[]};
const settle=p=>p.eval(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,180))});
const check=(name,result)=>{report.checks.push({name,...result});if(!result.pass)throw Error(name+': '+JSON.stringify(result))};
async function shot(p,name){await settle(p);await p.screenshot({path:out+'/'+name+'.png',format:'png'});report.screens.push(name)}
async function click(p,s){await p.eval(s=>document.querySelector(s).scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'}),s);await settle(p);const point=await p.eval(s=>{const n=document.querySelector(s),r=n.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;if(n.disabled||!n.contains(document.elementFromPoint(x,y)))throw Error('Blocked '+s);return{x,y}},s);for(const type of ['mousePressed','mouseReleased'])await p.send('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});}
async function key(p,key,code=key){await p.send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:{Enter:13,Escape:27,Tab:9}[key],...(key==='Enter'?{text:'\r'}:{})});await p.send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:{Enter:13,Escape:27,Tab:9}[key]});await settle(p)}
const stage=`startGuidedTutorialV24();tutorialV24=null;clearDialogueV29();G.tutorialV24=false;G.p.gold=30;G.p.board=['p1','p2','p3','p4','p5','p6'].map(id=>mkBoardUnit(tutorialCardV24(id)));G.p.hand=['p7','p8','pa1','pf1'].map(id=>({...tutorialCardV24(id),handId:NEXT_ID++}));render()`;
try{
 const home=await b.newPage({width:1191,height:818});await home.goto('http://127.0.0.1:8765/');check('1191 homepage has no sideways overflow',await home.eval(()=>({pass:document.documentElement.scrollWidth===innerWidth})));await shot(home,'1191-home');await home.close();
 for(const [width,height]of [[667,375],[844,390],[1440,900]]){
  const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/');
  await p.eval(`startPrologueV22();openPrologueNameV22();$('v22PlayerName').value='';confirmPrologueNameV22()`);
  check(width+' empty name stays open',await p.eval(()=>({pass:$('v22NameDialog').open&&$('v22PlayerName').getAttribute('aria-invalid')==='true'})));await shot(p,width+'-name-error');
  await p.eval(`$('v22PlayerName').value='一二三四五六七八九十一二三四五六';$('v23Appearance-male').checked=false;$('v23Appearance-female').checked=false;confirmPrologueNameV22()`);await shot(p,width+'-appearance-error');
  await p.eval(`$('v23Appearance-female').checked=true;confirmPrologueNameV22()`);
  for(let i=0;i<9;i++){await shot(p,width+'-prologue-'+i);if(i<8)await click(p,'#v22Next')}
  check(width+' prologue all nine lines',await p.eval(()=>({pass:prologueV22?.index===8&&prologueV22.name.length===16})));await click(p,'#v22Next');
  check(width+' prologue enters tutorial',await p.eval(()=>({pass:!!tutorialV24})));await p.eval(stage);
  for(const scale of [1.18,1.3,1.5]){await p.eval(s=>setUiScale(s),scale);await shot(p,width+'-scale-'+scale);check(width+' scale '+scale,await p.eval(()=>{const names=[...document.querySelectorAll('#rosterBoard .ec-name h3')];return{pass:document.documentElement.scrollWidth<=innerWidth&&names.every(n=>n.scrollWidth<=n.clientWidth+2),names:names.map(n=>({text:n.textContent,w:n.clientWidth,scroll:n.scrollWidth}))}}))}
  await p.eval("setUiScale(1.18);setDeckV20('shop')");await settle(p);
  await p.eval(()=>document.querySelector('#shopGrid .shop-card').focus());await key(p,'Enter');check(width+' keyboard inspect',await p.eval(()=>({pass:$('cardViewer').open})));await key(p,'Escape');check(width+' Escape closes viewer',await p.eval(()=>({pass:!$('cardViewer').open})));
  await p.eval('openDisplayV28()');for(let i=0;i<5;i++){await key(p,'Tab');check(width+' modal focus '+i,await p.eval(()=>({pass:document.activeElement===document.body||$('v28DisplayDialog').contains(document.activeElement),target:document.activeElement.id||document.activeElement.tagName})))}await key(p,'Escape');
  await p.eval('openSoundV25()');await click(p,'#v25Mute');check(width+' mute',await p.eval(()=>({pass:GameAudioV25.status().muted})));await click(p,'#v25Mute');await p.eval(`setSoundVolumeV25('music',0);setSoundVolumeV25('effects',100)`);check(width+' volumes',await p.eval(()=>({pass:GameAudioV25.status().music===0&&GameAudioV25.status().effects===1})));await key(p,'Escape');
  for(const step of [9,11,12,13,15,21,29]){
   await p.eval(step=>{startGuidedTutorialV24();G.p.hand=[{...tutorialCardV24('p1'),handId:NEXT_ID++,star:2}];G.p.board=[mkBoardUnit(tutorialCardV24('p2'))];if([12,13].includes(step)){setTutorialStepV24(11);clearDialogueV29();showCardViewer(G.p.hand[0]);if(step===13)flipViewedCard()}else setTutorialStepV24(step)},step);
   const total=await p.eval(()=>lessonPagesV29(tutorialV24.step).length);
   for(let page=0;page<total;page++){
    await p.eval(page=>{dialoguePageV29=page;drawDialoguePageV29()},page);await shot(p,`${width}-tutorial-${step}-${page}`);
    check(`${width} tutorial ${step}/${page} text and targets`,await p.eval(()=>{const s=$('v29Speech').getBoundingClientRect(),text=$('v29SpeechText'),overlap=protectedTargetsV46().map(r=>Math.max(0,Math.min(s.right,r.right)-Math.max(s.left,r.left))*Math.max(0,Math.min(s.bottom,r.bottom)-Math.max(s.top,r.top)));return{pass:text.scrollHeight<=text.clientHeight+2&&overlap.every(x=>x<1),text:[text.clientHeight,text.scrollHeight],overlap}}));
   }
   await p.eval(`clearDialogueV29();if($('cardViewer').open)closeCardViewer()`);
  }
  await p.eval(stage);await p.eval(`G.round=8;G.phase='between';G.roundResult={winner:'p',damage:1};showRoundResult()`);await click(p,'#continueRoundBtn');check(width+' round eight to result',await p.eval(()=>({pass:G.finished&&lastResult.round===8&&$('resultModal').open})));await shot(p,width+'-round-eight-result');
  report.errors.push(...p.consoleErrors);await p.close();console.log('Edges',width);
 }
}catch(e){report.errors.push(e.stack);console.error(e.stack)}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));process.exit(report.errors.length?1:0)}
