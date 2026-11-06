// Isolated browser + mocked Google transport. Never submits to a live form.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {createServer} from 'node:http';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='.taste-skill/event/ui';mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],transport:'mock Google endpoint; no live form submissions'};
const endpoint='https://script.google.com/macros/s/TEST_EVENT/exec';
const html=readFileSync('index.html','utf8').replace(/(const EVENT_CONFIG=)([^\n]+);/,(_,prefix,json)=>prefix+JSON.stringify({...JSON.parse(json),endpoint})+';');
const sample={schemaVersion:1,eventId:'island-science-2026',updatedAt:new Date().toISOString(),totalPlayers:4,players:[{rank:1,name:'海風小隊',score:3000,outcome:'守護成功',round:8},{rank:1,name:'最長十六字的守護者暱稱版面驗證用',score:3000,outcome:'守護成功',round:8},{rank:3,name:'山林旅人',score:2500,outcome:'島嶼失守',round:8},{rank:4,name:'小小探險家',score:1900,outcome:'平手',round:8}]};
// Exactly sixteen codepoints in the longest nickname.
sample.players[1].name=Array.from(sample.players[1].name).slice(0,16).join('');
let boardFailure=false;
const server=createServer((req,res)=>{if(req.url.startsWith('/leaderboard.json')){res.writeHead(boardFailure?503:200,{'Content-Type':'application/json'});res.end(JSON.stringify(sample))}else{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html)}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';
const browser=await Browser.launch();
const page=await browser.newPage({width:1440,height:900});
const submissions=new Map();let transportMode='fail',posts=0;
await page.send('Fetch.enable',{patterns:[{urlPattern:'https://script.google.com/*'}]});
browser.on(page.sessionId,'Fetch.requestPaused',async e=>{
 try{
  const u=new URL(e.request.url);let body='{}',mime='application/json';
  if(e.request.method==='POST'){
   posts++;const raw=e.request.postData||(await page.send('Network.getRequestPostData',{requestId:e.networkId})).postData;
   const r=JSON.parse(new URLSearchParams(raw).get('record'));
   if(transportMode==='success')submissions.set(r.runId,r);body='{"ok":true}';
  }else if(u.searchParams.get('action')==='status'){
   const found=submissions.get(u.searchParams.get('runId'));const result=found?{ok:true,found:true,score:found.score}:{ok:false,error:'SERVICE_UNAVAILABLE'};
   body=u.searchParams.get('callback')+'('+JSON.stringify(result)+');';mime='text/javascript';
  }
  await page.send('Fetch.fulfillRequest',{requestId:e.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:mime}],body:Buffer.from(body).toString('base64')});
 }catch(error){report.errors.push(String(error));await page.send('Fetch.failRequest',{requestId:e.requestId,errorReason:'Failed'})}
});
const check=(name,pass,extra={})=>{report.checks.push({name,pass,...extra});if(!pass)throw Error(name)};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function click(selector){await page.eval(s=>document.querySelector(s)?.scrollIntoView({block:'center',behavior:'instant'}),selector);await sleep(60);const p=await page.eval(s=>{const n=document.querySelector(s);if(!n||n.disabled)throw Error('Unavailable '+s);const z=n.getBoundingClientRect(),x=z.x+z.width/2,y=z.y+z.height/2;if(!n.contains(document.elementFromPoint(x,y)))throw Error('Covered '+s);return {x,y}},selector);await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1})}
async function until(fn){for(let i=0;i<80;i++){if(await page.eval(fn))return;await sleep(100)}throw Error('Timed out')}
async function finalFixture(){await page.eval(()=>{startGame();hideModal('quizModal');activeQuiz=null;G.round=8;G.p.hp=8;G.a.hp=13;G.stats.kills=48;G.stats.merges2=9;G.stats.merges4=3;finishGame()})}
try{
 await page.goto(url);
 await until(()=>document.querySelectorAll('#eventTop tbody tr').length===4);
 check('homepage renders public scores and shared-rank long names',true);
 await finalFixture();
 check('original finishGame automatically includes feedback entry',await page.eval(()=>$('resultModal').open&&!!$('eventResult')&&lastResult.score===2500));
 await click('#resultModal button[onclick="openRegister()"]');
 await page.eval(()=>$('eventName').value='測試守護者');
 await click('#eventSave');
 check('consent required before cloud submission',posts===0&&await page.eval(()=>$('eventSaveStatus').textContent.includes('勾選')));
 await click('#eventConsent');await click('#eventSave');
 await until(()=>!$('eventSave').disabled&&$('eventSaveStatus').textContent.includes('尚未'));
 check('opaque POST success never falsely confirms cloud storage',await page.eval(()=>JSON.parse(localStorage.getItem('island_event_island-science-2026_records'))[0].status==='pending'));
 transportMode='success';await click('#eventSave');
 await until(()=>$('eventSaveStatus').textContent.includes('成績已保存到活動表單'));
 check('retry confirms same run and creates one remote record',submissions.size===1&&posts===2);
 check('one local score after repeated save',await page.eval(()=>getScores().filter(x=>x.name==='測試守護者').length===1));
 const before=await page.eval(()=>JSON.stringify({G,lastResult}));
 await page.eval(()=>{IslandEvent.feedback();hideModal('eventFeedbackModal');IslandEvent.board();hideModal('eventBoardModal')});
 check('opening feedback and rankings does not mutate game state',before===await page.eval(()=>JSON.stringify({G,lastResult})));
 await page.eval(()=>{hideModal('eventScoreModal');hideModal('resultModal');backMenu()});
 boardFailure=true;await page.eval(()=>IslandEvent.refresh());
 check('failed refresh retains last successful leaderboard',await page.eval(()=>document.querySelectorAll('#eventTop tbody tr').length===4&&$('eventBoardNote').textContent.includes('保留')));boardFailure=false;

 for(const [width,height] of [[320,568],[390,844],[667,375],[740,390],[741,390],[844,390],[1024,600],[1024,601],[1160,520],[1160,760],[1160,761],[1160,840],[1160,841],[1440,900],[1920,1080]]){
  await page.setViewport({width,height});await page.eval(()=>{document.querySelectorAll('dialog[open]').forEach(x=>hideModal(x.id));backMenu();window.scrollTo(0,0)});
  await page.screenshot({path:`${out}/${width}-${height}-home.png`,format:'png'});
  const home=await page.eval(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,rows:document.querySelectorAll('#eventTop tbody tr').length}));
  check(`home layout ${width}x${height}`,!home.overflow&&home.rows===4,home);
  await finalFixture();
  for(const [surface,open] of [['result',()=>{}],['score',()=>openRegister()],['feedback',()=>IslandEvent.feedback()],['board',()=>IslandEvent.board()],['records',()=>IslandEvent.records()],['share',()=>IslandEvent.share()],['reset',()=>IslandEvent.reset()]]){
   if(surface!=='result')await page.eval(()=>document.querySelectorAll('dialog[open]').forEach(x=>hideModal(x.id)));
   await page.eval(open);await sleep(350);
   const layout=await page.eval(()=>{const dialog=document.querySelector('dialog[open]'),n=dialog?.querySelector('.dialog');if(!n)return {pass:false,reason:'no dialog'};const z=n.getBoundingClientRect();const overflow=n.scrollWidth>n.clientWidth+2;const titles=[...n.querySelectorAll('h2,h3,label,p,td,th')].filter(t=>t.clientWidth&&t.scrollWidth>t.clientWidth+2).map(t=>t.textContent);return{pass:!overflow&&!titles.length&&z.left>=-1&&z.right<=innerWidth+1&&z.top>=-1&&z.bottom<=innerHeight+1,overflow,titles,rect:{x:z.x,y:z.y,w:z.width,h:z.height}}});
   check(`${surface} layout ${width}x${height}`,layout.pass,layout);
   if([390,667,1160,1440].includes(width))await page.screenshot({path:`${out}/${width}-${height}-${surface}.png`,format:'png'});
   // Controls below the fold must scroll into a real clickable position.
   const button=await page.eval(()=>{const d=document.querySelector('dialog[open]');const nodes=[...d.querySelectorAll('button')].filter(x=>!x.disabled);return nodes.at(-1)?.outerHTML});
   if(button){const hit=await page.eval(()=>{const d=document.querySelector('dialog[open]'),n=[...d.querySelectorAll('button')].filter(x=>!x.disabled).at(-1);n.scrollIntoView({block:'center'});const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))});check(`${surface} last action reachable ${width}x${height}`,hit)}
  }
 }
 await page.eval(()=>{document.querySelectorAll('dialog[open]').forEach(x=>hideModal(x.id));localStorage.setItem(NAME_KEY,'上一位');localStorage.setItem(PROFILE_KEY_V23,JSON.stringify({name:'上一位',appearance:'male'}));activeTravelerV23={name:'上一位',appearance:'male'};IslandEvent.reset()});
 const prior=await page.eval(()=>localStorage.getItem('island_event_island-science-2026_participant'));
 await click('#eventResetModal button');
 check('next player clears only identity and preserves saved records',await page.eval(()=>!localStorage.getItem(NAME_KEY)&&!localStorage.getItem(PROFILE_KEY_V23)&&activeTravelerV23===null&&lastResult===null&&JSON.parse(localStorage.getItem('island_event_island-science-2026_records')).length===1));
 check('next player receives a different participant ID',prior!==await page.eval(()=>localStorage.getItem('island_event_island-science-2026_participant')));
 await page.goto(url);await page.eval(()=>IslandEvent.records());
 check('confirmed record survives reload',await page.eval(()=>$('eventRecords').textContent.includes('雲端已確認')));
 await page.eval(()=>{hideModal('eventRecordsModal');startGuidedTutorialV24();openRegister()});
 check('tutorial cannot submit a formal score',await page.eval(()=>!$('eventScoreModal').open));
 report.errors.push(...page.consoleErrors);
}catch(error){report.errors.push(error.stack);await page.screenshot({path:out+'/error.png',format:'png'})}
finally{await browser.close();server.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(x=>!x.pass),errors:report.errors},null,2));process.exitCode=report.errors.length||report.checks.some(x=>!x.pass)?1:0}
