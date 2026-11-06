import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.env.SURFACES_OUT||'.taste-skill/full-review/surfaces-before';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),report={screens:[],checks:[],errors:[]};
const wait=async p=>p.eval(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,160))});
async function capture(p,name){await wait(p);await p.screenshot({path:out+'/'+name+'.png',format:'png'});const data=await p.eval(()=>{
 const roots=[...document.querySelectorAll('dialog[open]')];const root=roots.at(-1)||document.querySelector('#contextDrawer.open')||document.querySelector('body');const issues=[];
 for(const el of root.querySelectorAll('button,input,select,textarea,summary,h1,h2,h3,p,label')){
  if(!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})||!el.getClientRects().length||el.closest('.hidden,[hidden]'))continue;const closed=el.closest('details:not([open])');if(closed&&!closed.querySelector('summary')?.contains(el))continue;const r=el.getBoundingClientRect(),s=getComputedStyle(el);if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;
  if(el.scrollWidth>el.clientWidth+3&&s.overflowX!=='auto')issues.push({type:'text-overflow',tag:el.tagName,id:el.id,text:el.textContent.trim().slice(0,55)});
  if(el.matches('button,input,select')&&!el.disabled&&r.width&&r.height){const x=r.x+r.width/2,y=r.y+r.height/2;let clipped=x<0||x>innerWidth||y<0||y>innerHeight;for(let n=el.parentElement;n&&n!==root.parentElement;n=n.parentElement){const c=getComputedStyle(n),b=n.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(c.overflowX)&&(x<b.left||x>b.right))clipped=true;if(/auto|scroll|hidden|clip/.test(c.overflowY)&&(y<b.top||y>b.bottom))clipped=true}const hit=document.elementFromPoint(x,y);if(!clipped&&!el.contains(hit)&&!hit?.contains(el))issues.push({type:'covered-control',id:el.id,text:el.textContent.trim().slice(0,45),by:hit?.id||hit?.className});}
 }
 return{issues,open:roots.map(r=>r.id),overflow:document.documentElement.scrollWidth>innerWidth+2};});report.screens.push({name,...data});}
const stage=`startGuidedTutorialV24();tutorialV24=null;clearDialogueV29();G.tutorialV24=false;G.p.gold=20;G.p.board=['p1','p2','p3','p4','p5','p6'].map(id=>mkBoardUnit(tutorialCardV24(id)));G.p.hand=['p7','p8','p9','p10','pa1','pa2','pa3','pa4','pa5','pf1','pf2'].map(id=>({...tutorialCardV24(id),handId:NEXT_ID++}));G.p.shop=['p7','p8','pa1','pf1','p4'].map(id=>tutorialCardV24(id));G.p.field=tutorialCardV24('pf1');G.p.queue=['pa1','pa2','pa3','pa4','pa5'].map(id=>tutorialCardV24(id));render()`;
try{
 for(const [width,height]of [[1440,900],[1191,818],[844,390],[667,375],[390,844]]){
  const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/');await capture(p,width+'-home');
  for(const [name,open,id]of [['sound','openSoundV25()','v25SoundDialog'],['leaderboard-empty','showLeaderboard()','leaderboardModal'],['collection','showCollection()','collectionModal']]){await p.eval(open);await capture(p,width+'-'+name);await p.eval(`hideModal('${id}')`)}
  if(width===390){await p.close();continue}
  await p.eval('beginStory()');await capture(p,width+'-story');
  await p.eval('openPrologueNameV22()');await p.eval('confirmPrologueNameV22()');await capture(p,width+'-name-error');await p.eval(`$('v22PlayerName').value='測試勇者一二三四五六七八九十天地';$('v23Appearance-female').checked=true;confirmPrologueNameV22()`);await capture(p,width+'-name-long');
  await p.eval(`backMenu();${stage}`);await capture(p,width+'-full-roster');await p.eval(`setDeckV20('hand')`);await capture(p,width+'-full-hand');
  await p.eval(`$('rosterBoard').querySelector('.slot-actions').open=true`);await capture(p,width+'-move-sell');await p.eval(`$('rosterBoard').querySelector('.slot-actions').open=false`);
  await p.eval(`toggleDrawer(true);$('contextDrawer').querySelectorAll('details').forEach(n=>n.open=true)`);await capture(p,width+'-details');await p.eval(`$('contextDrawer').scrollTop=99999`);await capture(p,width+'-details-bottom');await p.eval('toggleDrawer(false)');
  for(const [name,open,id]of [['rules','showRules()','rulesModal'],['bank','showQuestionBank()','bankModal'],['display','openDisplayV28()','v28DisplayDialog'],['replace','requestPlayV38(G.p.hand.find(c=>c.id==="pf2"))','v38ReplaceField']]){
   await p.eval(open);await capture(p,width+'-'+name);await p.eval(`(()=>{const d=$('${id}');d.querySelectorAll('*').forEach(n=>{if(n.scrollHeight>n.clientHeight+10&&getComputedStyle(n).overflowY==='auto')n.scrollTop=n.scrollHeight});d.scrollTop=d.scrollHeight})()`);await capture(p,width+'-'+name+'-bottom');await p.eval(`hideModal('${id}')`);
  }
  await p.eval(`startGame();`);await capture(p,width+'-quiz');await p.eval(`answerRoundQuiz((activeQuiz.answer+1)%activeQuiz.options.length)`);await capture(p,width+'-quiz-wrong');await p.eval(`$('quizFeedback').querySelector('details').open=true`);await capture(p,width+'-quiz-explanation');await p.eval('closeRoundQuiz()');
  await p.eval(`G.round=8;G.phase='between';G.roundResult={winner:'p',damage:5};showRoundResult()`);await capture(p,width+'-round');await p.eval(`hideModal('roundModal');finishGame()`);await capture(p,width+'-result');await p.eval('openRegister()');await capture(p,width+'-register');await p.eval(`$('guardianName').value='介面測試勇者';saveScore()`);await capture(p,width+'-leaderboard-saved');
  await p.eval(`document.querySelectorAll('dialog[open]').forEach(n=>n.close());showCollection()`);
  const filters=await p.eval(()=>[...document.querySelectorAll('[data-v31-filter]')].map(n=>({group:n.dataset.v31Filter,value:n.dataset.value})));
  for(const f of filters) {await p.eval(({group,value})=>collectionFilterV31(group,value),f);await capture(p,width+'-filter-'+f.group+'-'+f.value)}
  const cards=await p.eval(()=>[...P_CARDS,...A_CARDS,divineDefinition,...TOKEN_CARD_DEFINITIONS].map(c=>c.id));
  const cardIssues=[];for(const id of cards){await p.eval(id=>showCardViewer([...P_CARDS,...A_CARDS,divineDefinition,...TOKEN_CARD_DEFINITIONS].find(c=>c.id===id)),id);for(const face of ['front','back']){if(face==='back')await p.eval('flipViewedCard()');await wait(p);const issue=await p.eval(()=>{const root=$('largeCard').shadowRoot;return [...root.querySelectorAll('h3,p,.ec-effect,.ec-story')].filter(n=>n.getClientRects().length&&n.scrollHeight>n.clientHeight+3).map(n=>({text:n.textContent.slice(0,70),height:n.clientHeight,scroll:n.scrollHeight}))});if(issue.length)cardIssues.push({id,face,issue});if(['p1','p10','pa4','pf2','divine','token_larva'].includes(id))await capture(p,`${width}-card-${id}-${face}`)}await p.eval('closeCardViewer()')}
  report.checks.push({name:width+' all card faces',count:cards.length*2,issues:cardIssues});
  await p.eval(`hideModal('collectionModal');backMenu();openEditor()`);await wait(p);await capture(p,width+'-editor');await p.eval('closeEditor()');
  report.errors.push(...p.consoleErrors);await p.close();console.log('Finished surfaces',width);
 }
}catch(e){report.errors.push(e.stack);console.error(e.stack)}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));process.exit(report.errors.length?1:0)}
