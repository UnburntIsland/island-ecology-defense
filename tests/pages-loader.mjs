// Real browser: complete standalone hydration, failed/corrupt chunks and resume.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {createServer} from 'node:http';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {packageGame,loaderHtml} from '../scripts/prepare-pages.mjs';
const out='.taste-skill/night/pages-loader';mkdirSync(out,{recursive:true});
const original=readFileSync('index.html'),{manifest,chunks}=packageGame(original);
assert.deepEqual(Buffer.concat(chunks),original);
// Explicitly exercise UTF-8 characters split between files.
const unicode=Buffer.from('淮德島🌴生態保衛戰');assert.equal(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(packageGame(unicode,5).chunks)),unicode.toString());
let failing=false;const requests=new Map();
const server=createServer((req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname.slice(1);
 if(!path){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(loaderHtml(manifest));return}
 const i=manifest.parts.findIndex(p=>p.url===path);
 if(i>=0){requests.set(i,(requests.get(i)||0)+1);res.setHeader('Content-Type','text/plain');if(failing&&i===0){if(requests.get(i)%2)res.end(Buffer.alloc(chunks[i].length));else{res.statusCode=503;res.end('Unavailable')}return}res.end(chunks[i]);return}
 if(path==='leaderboard.json'){res.setHeader('Content-Type','application/json');res.end(readFileSync('leaderboard.json'));return}
 res.statusCode=404;res.end();
});await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`;
const browser=await Browser.launch(),report={checks:[],errors:[]};
async function until(p,fn){for(let i=0;i<120;i++){if(await p.eval(fn))return;await new Promise(r=>setTimeout(r,250))}throw Error('Condition timeout')}
try{
 for(const [width,height] of [[1440,900],[667,375],[390,844]]){
  failing=true;requests.clear();const p=await browser.newPage({width,height});await p.goto(url);await until(p,()=>document.getElementById('retry')?.hidden===false);
  assert.equal(await p.eval(()=>typeof startGame),'undefined');
  assert.equal(await p.eval(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.screenshot({path:`${out}/retry-${width}.png`});const retained=[...requests.entries()].filter(([i])=>i!==0);
  failing=false;const pt=await p.eval(()=>{const r=document.getElementById('retry').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
  for(const type of ['mousePressed','mouseReleased'])await p.send('Input.dispatchMouseEvent',{type,...pt,button:'left',clickCount:1});
  await until(p,()=>typeof startGame==='function'&&!!document.getElementById('eventHome'));
  for(const [i,count] of retained)assert.equal(requests.get(i),count,'Resume must keep verified chunks');
  await p.screenshot({path:`${out}/ready-${width}.png`});
  assert.equal(await p.eval(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.eval(()=>startGame());await until(p,()=>G.phase==='deploy');
  assert.equal(await p.eval(()=>G.round),1);
  report.checks.push({width,height,hydrated:true,corruptAndUnavailableRejected:true,resumeRetainedVerifiedChunks:true,startGame:true});
  report.errors.push(...p.consoleErrors.filter(x=>!String(x).includes('503')&&!String(x).includes('404')));await p.close();
 }
}catch(error){report.errors.push(error.stack)}finally{await browser.close();server.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exitCode=report.errors.length?1:0}
