// Actual browser downloads/file uploads, isolated profiles. No production data changes.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const out=resolve('.taste-skill/roundtrip/export');mkdirSync(out,{recursive:true});
const report={checks:[],downloads:[],errors:[]},browsers=[];
const check=(name,result)=>{report.checks.push({name,...result});console.log(name,result.pass);if(!result.pass)throw Error(name+': '+JSON.stringify(result))};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label){for(let n=0;n<150;n++){const r=await fn();if(r)return r;await pause(100)}throw Error('Timeout '+label)}
async function fresh(url,width=1440,height=900){const b=await Browser.launch();browsers.push(b);const p=await b.newPage({width,height});await p.goto(url);return {b,p}}
const frame=(p,expr)=>p.eval(expr=>document.getElementById('embeddedEditor').contentWindow.eval(expr),expr);
async function editor(p){await p.eval('openEditor()');await until(()=>frame(p,`typeof state!=='undefined'&&Object.keys(state.cards).length===37`).catch(()=>false),'editor initialization');await pause(300)}
async function click(p,selector,inFrame=false){
 const point=await p.eval(({selector,inFrame})=>{const f=document.getElementById('embeddedEditor'),d=inFrame?f.contentDocument:document,n=d.querySelector(selector);if(!n)throw Error('Missing '+selector);n.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});const r=n.getBoundingClientRect(),fr=inFrame?f.getBoundingClientRect():{x:0,y:0},x=r.x+r.width/2,y=r.y+r.height/2;if(n.disabled||!n.contains(d.elementFromPoint(x,y)))throw Error('Covered '+selector);return {x:x+fr.x,y:y+fr.y}}, {selector,inFrame});
 for(const type of ['mousePressed','mouseReleased'])await p.send('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});await pause(200);
}
async function download(b,p,folder,selector,inFrame=false){const dir=resolve(out,folder);mkdirSync(dir,{recursive:true});let done=null,filename=null;const off1=b.on('', 'Browser.downloadWillBegin',x=>filename=x.suggestedFilename),off2=b.on('','Browser.downloadProgress',x=>{if(x.state==='completed')done=x});await b.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:dir,eventsEnabled:true});await click(p,selector,inFrame);await until(()=>done&&filename&&existsSync(resolve(dir,filename)),'download '+folder);off1();off2();const file=resolve(dir,filename);report.downloads.push({folder,file,bytes:readFileSync(file).length,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});return file}
async function upload(p,selector,file){const r=await p.send('Runtime.evaluate',{expression:`document.getElementById('embeddedEditor').contentDocument.querySelector(${JSON.stringify(selector)})`,returnByValue:false});await p.send('DOM.setFileInputFiles',{files:[file],objectId:r.result.objectId});await pause(500)}
async function rules(p){return p.eval(()=>JSON.stringify({cards:[...P_CARDS,...A_CARDS,divineDefinition,...TOKEN_CARD_DEFINITIONS],income:INCOME,divine:DIVINE,rounds:ROUNDS,slots:SLOTS,buffs:QUIZ_BUFFS,questions:KNOWLEDGE_QUESTIONS}))}
async function view(p,title,intro,asset){return p.eval(async({title,intro,asset})=>{showCardViewer(P_CARDS[0]);await document.fonts.ready;const root=$('largeCard').shadowRoot,front=root.querySelector('.ec-name h3').textContent,image=root.querySelector('img').src;flipViewedCard();const story=$('largeCard').shadowRoot.querySelector('.ec-story p').textContent;const images=[...document.images].filter(i=>i.getClientRects().length);await Promise.all(images.map(i=>i.decode().catch(()=>{})));return {pass:front===title&&story===intro&&image===asset,front,story,imageLength:image.length,font:document.fonts.check('16px Huninn')}} ,{title,intro,asset})}
try{
 const {b,p}=await fresh('http://127.0.0.1:8765/');const expectedRules=await rules(p);
 const baseline=await download(b,p,'baseline','[onclick="exportGameHTML()"]');
 const first=await fresh('file:///'+baseline.replaceAll('\\','/'),844,390);check('Baseline exported HTML preserves rules',{pass:await rules(first.p)===expectedRules});
 check('Baseline exported HTML remains V46',await first.p.eval(()=>({pass:typeof syncUsabilityV46==='function'&&document.title.includes('V46'),title:document.title})));
 await editor(p);check('Editor loads all cards',await frame(p,'({pass:Object.keys(state.cards).length===37,count:Object.keys(state.cards).length})'));
 const title='往返測試水韭',intro='這是匯入匯出驗證用文字。只改外觀，不改變費用、攻擊、生命與規則。';
 await frame(p,`$('cardList').value='p1';$('cardList').dispatchEvent(new Event('change',{bubbles:true}));$('cardName').value=${JSON.stringify(title)};$('cardName').dispatchEvent(new Event('input',{bubbles:true}));$('intro').value=${JSON.stringify(intro)};$('intro').dispatchEvent(new Event('input',{bubbles:true}));`);
 const asset=await p.eval(()=>CARD_ART.p8);const match=asset.match(/^data:([^;]+);base64,(.+)$/);const picture=resolve(out,'uploaded-test-image.webp');writeFileSync(picture,Buffer.from(match[2],'base64'));await upload(p,'#uploadImage',picture);
 await until(()=>frame(p,'state.cards.p1.frontAsset.startsWith("asset_")'),'image upload');
 await click(p,'button[onclick="applyToGame()"]',true);await until(()=>p.eval(title=>visualProject.cards.p1.title===title,title),'apply visual');
 check('Apply does not change gameplay data',{pass:await rules(p)===expectedRules});await p.eval('closeEditor()');check('Applied title story image appear',await view(p,title,intro,asset));await p.screenshot({path:resolve(out,'applied.png'),format:'png'});await p.eval('closeCardViewer()');
 await editor(p);const project=await frame(p,'JSON.stringify(state)');
 const crop=await download(b,p,'crop-png','#downloadCrop',true);check('Cropped image export is PNG',{pass:readFileSync(crop).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))});
 const zip=await download(b,p,'project-zip','#exportZIP',true);const json=await download(b,p,'project-json','#saveJSON',true);const custom=await download(b,p,'custom-game','button[onclick="exportFullGame()"]',true);
 const shared=await fresh('file:///'+custom.replaceAll('\\','/'),844,390);check('Custom exported HTML preserves rules',{pass:await rules(shared.p)===expectedRules});check('Custom exported HTML carries visual assets',await view(shared.p,title,intro,asset));await shared.p.screenshot({path:resolve(out,'shared.png'),format:'png'});await shared.p.eval('closeCardViewer()');
 await shared.p.send('Network.enable');await shared.p.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await shared.p.goto('file:///'+custom.replaceAll('\\','/'));check('Offline reload carries visual assets',await view(shared.p,title,intro,asset));await shared.p.eval('closeCardViewer()');
 await p.goto('http://127.0.0.1:8765/');check('Browser persistence after apply',await view(p,title,intro,asset));await p.eval('closeCardViewer()');
 const imported=await fresh('http://127.0.0.1:8765/');await editor(imported.p);await upload(imported.p,'#importZIP',zip);await until(()=>frame(imported.p,`state.cards.p1.title===${JSON.stringify(title)}`),'ZIP import');check('ZIP restores complete project',{pass:await frame(imported.p,'JSON.stringify(state)')===project});
 await click(imported.p,'button[onclick="applyToGame()"]',true);await until(()=>imported.p.eval(title=>visualProject.cards.p1.title===title,title),'apply ZIP');await imported.p.eval('closeEditor()');check('ZIP restores image/title/story',await view(imported.p,title,intro,asset));check('ZIP leaves rules unchanged',{pass:await rules(imported.p)===expectedRules});await imported.p.eval('closeCardViewer()');
 await editor(imported.p);await frame(imported.p,`$('cardName').value='暫時修改';$('cardName').dispatchEvent(new Event('input',{bubbles:true}))`);await upload(imported.p,'#importJSON',json);check('JSON restores settings with existing image library',{pass:await frame(imported.p,'JSON.stringify(state)')===project});
 const reexport=await download(imported.b,imported.p,'reexport','button[onclick="exportFullGame()"]',true);const last=await fresh('file:///'+reexport.replaceAll('\\','/'));check('ZIP import and HTML re-export survive fresh profile',await view(last.p,title,intro,asset));check('Re-export rules unchanged',{pass:await rules(last.p)===expectedRules});
 const currentProject=await frame(imported.p,'JSON.stringify(state)');
 for(const [name,selector,content]of [['invalid.json','#importJSON','{'],['incomplete.json','#importJSON','{"version":3}'],['broken.zip','#importZIP','BROKEN ZIP']]){const bad=resolve(out,name);writeFileSync(bad,content);await upload(imported.p,selector,bad);check(name+' rejected without changing current project',{pass:await frame(imported.p,'JSON.stringify(state)')===currentProject})}
 report.projectBytes=project.length;report.errors.push(...[p,first.p,shared.p,imported.p,last.p].flatMap(x=>x.consoleErrors));
}catch(e){report.errors.push(e.stack);console.error(e.stack)}finally{for(const b of browsers)await b.close();writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,errors:report.errors}));process.exit(report.errors.length?1:0)}
