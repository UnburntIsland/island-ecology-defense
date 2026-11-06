// Bounded card integration checks. No AI loop or full playthrough.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const out=process.env.CARDS_OUT||'.taste-skill/v44';mkdirSync(out,{recursive:true});
const report={checks:[],errors:[]};const check=(name,value)=>{report.checks.push({name,...value});if(value.pass===false)throw Error(name+': '+JSON.stringify(value))};
const old=readFileSync('.taste-skill/v44/index-before.html','utf8'),current=readFileSync('index.html','utf8');
check('Existing game source preserved verbatim',{pass:current.replace(/<style id="card-design-v44">[\s\S]*?<\/style>\n/,'').replace(/<script id="card-design-code-v44">[\s\S]*?<\/script>\n/,'')===old});
const b=await Browser.launch();let p;
try{
 p=await b.newPage({width:1440,height:900});await p.goto('http://127.0.0.1:8765/');
 await p.eval(`startGuidedTutorialV24();tutorialV24=null;clearDialogueV29();G.tutorialV24=false;G.p.gold=50;G.p.shop=['p7','p8','pa1','pf1','p4'].map(id=>tutorialCardV24(id));G.p.hand=[];G.p.board=[];render();`);
 check('Inspection is separate from purchase',await p.eval(()=>{const gold=G.p.gold;$('shopGrid').querySelector('.shop-card').click();const pass=$('cardViewer').open&&G.p.gold===gold&&G.p.hand.length===0;closeCardViewer();return {pass}}));
 check('Purchase and deployment buttons',await p.eval(()=>{const gold=G.p.gold;$('shopGrid').querySelector('.v38-buy').click();const bought=G.p.hand.length===1&&G.p.gold===gold-3;setDeckV20('hand');$('hand').querySelector('.v38-hand-face').click();const inspect=G.p.board.length===0&&$('cardViewer').open;closeCardViewer();$('hand').querySelector('.v38-play').click();return {pass:bought&&inspect&&G.p.board.length===1&&G.p.hand.length===0}}));
 const expected=JSON.parse(readFileSync('design-previews/island-tabletop/cards-all-data.json','utf8'));
 check('37 kinds, printed values match live definitions',await p.eval(expected=>{
  const all=[...P_CARDS,...A_CARDS,divineDefinition,...TOKEN_CARD_DEFINITIONS],bad=[];
  for(const c of all){const e=expected.find(x=>x.id===c.id);if(!e||['name','cost','atk','hp','type','faction'].some(k=>(c[k]??null)!==(e[k]??null)))bad.push(c.id)}return {pass:all.length===37&&!bad.length,count:all.length,bad};
 },expected));
 check('All kinds render approved two faces and ecological stories',await p.eval(()=>{
  const bad=[],all=[...P_CARDS,...A_CARDS,divineDefinition,...TOKEN_CARD_DEFINITIONS];
  for(const c of all){showCardViewer(c);const s=$('largeCard').shadowRoot,story=s.querySelector('.ec-story p')?.textContent;if(!s.querySelector('.ec-card')||story!==CardDesignV44.narratives[c.id][0])bad.push({id:c.id,story});closeCardViewer()}return {pass:!bad.length,bad};
 }));
 check('Collection uses the new renderer',await p.eval(async()=>{
  G.p.field=tutorialCardV24('pf1');G.p.queue=[tutorialCardV24('pa1')];render();showCollection();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const nodes=[...$('collectionGrid').querySelectorAll('island-card')];const pass=nodes.length===37&&nodes.every(n=>n.shadowRoot?.querySelector('.ec-card'));hideModal('collectionModal');return {pass,count:nodes.length};
 }));
 await p.screenshot({path:out+'/operations.png',format:'png'});
 check('Live combat stats retain current health',await p.eval(()=>{
  G.p.board=['p7','p8'].map(id=>mkBoardUnit(tutorialCardV24(id)));tutorialV24={step:5,busy:false};prepareTutorialBattleV24();tutorialV24=null;const u=G.fight.p[0];u.curHp=1;u.atk=9;render();const node=document.querySelector('#playerBoard [data-unit="'+u.uid+'"]');const n=node?.querySelector('[data-v28-stat=hp] b')?.textContent;node?.click();const hp=$('largeCard').shadowRoot.querySelector('[data-v28-stat=hp] b').textContent;closeCardViewer();return {pass:n==='1'&&hp==='1',boardHP:n,viewerHP:hp};
 }));
 check('User edited title, story, and illustration propagate',await p.eval(()=>{
  const c=P_CARDS.find(c=>c.id==='p7'),v=visualProject.cards[c.id],prior={...v};showCardViewer(c);v.title='測試名稱';v.intro='測試故事';v.frontAsset='p1';drawViewer();const s=$('largeCard').shadowRoot,pass=s.querySelector('.ec-name h3').textContent==='測試名稱'&&s.querySelector('.ec-story p').textContent==='測試故事'&&s.querySelector('img').src===CARD_ART.p1;visualProject.cards[c.id]=prior;closeCardViewer();return {pass};
 }));
 report.errors.push(...p.consoleErrors);await p.close();
 p=await b.newPage({width:844,height:390});await p.goto('file:///C:/Code/island-ecology-defense/index.html');
 check('Single file offline card and story',await p.eval(async()=>{showCollection();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const node=$('collectionGrid').querySelector('island-card');await Promise.all([...node.shadowRoot.querySelectorAll('img')].map(i=>i.decode()));await document.fonts.ready;return {pass:!!node.shadowRoot.querySelector('.ec-card')&&document.fonts.check('16px Huninn')};}));
 report.errors.push(...p.consoleErrors);
}catch(e){report.errors.push(e.message);process.exitCode=1}finally{await b.close();writeFileSync(out+'/integration.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exit(process.exitCode||0)}
