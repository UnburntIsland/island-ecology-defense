import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='.taste-skill/night/full-roster';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),report={checks:[],errors:[]};
try{for(const [width,height] of [[667,375],[740,390],[844,390],[1024,600],[1024,601],[1160,520],[1160,840],[1160,841],[1440,900],[1920,1080]]){
 const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/');
 await p.eval(()=>{startGame();if(activeQuiz){answerRoundQuiz(activeQuiz.answer);closeRoundQuiz()}G.p.board=Array.from({length:6},(_,i)=>({...tutorialCardV24('p'+(i+1)),slot:i}));G.p.hand=[{...tutorialCardV24('p7'),handId:99}];setDeckV20('hand');render()});await new Promise(r=>setTimeout(r,500));
 const state=await p.eval(()=>{const button=document.querySelector('.v38-play'),label=button.querySelector('.v46-button-text'),r=label.getBoundingClientRect(),q=button.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(label);return {disabled:button.disabled,text:label.textContent,lines:range.getClientRects().length,inside:r.left>=q.left&&r.right<=q.right&&r.top>=q.top&&r.bottom<=q.bottom}});
 assert.deepEqual(state,{disabled:true,text:'隊伍已滿',lines:1,inside:true});
 await p.screenshot({path:`${out}/${width}-${height}.png`});
 await p.eval(()=>{G.p.board.pop();render()});await new Promise(r=>setTimeout(r,200));
 assert.equal(await p.eval(()=>{const n=document.querySelector('.v38-play');return !n.disabled&&!n.classList.contains('v46-team-full')&&n.querySelector('.v46-button-text').textContent==='部署'}),true);
 report.checks.push({width,height,...state,freedSlotRestoresDeployment:true});report.errors.push(...p.consoleErrors);await p.close();
}}catch(error){report.errors.push(error.stack)}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exitCode=report.errors.length?1:0}
