import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.env.COMMENTS_OUT||'.taste-skill/comments/matrix';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),report={checks:[],errors:[]};
try{
 const p=await b.newPage({width:1160,height:520});await p.goto('http://127.0.0.1:8765/');
 for(const [width,height]of [[1160,520],[667,375],[740,390],[741,390],[844,390],[1024,600],[1024,601],[1160,760],[1160,761],[1160,840],[1160,841],[1191,818],[1440,900],[1920,1080],[768,1024]]){
  await p.setViewport({width,height});
  for(const step of [1,4,11,23,29]){
   await p.eval(step=>{startGuidedTutorialV24();G.p.board=['p2','p1','p6'].map(id=>mkBoardUnit(tutorialCardV24(id)));G.p.hand=[{...tutorialCardV24('p1'),star:2,handId:NEXT_ID++}];if(step===29){tutorialV24.step=28;prepareTutorialBattleV24()}dialogueStepV29=null;setTutorialStepV24(step);},step);
   await new Promise(r=>setTimeout(r,350));
   const check=await p.eval(()=>{
    const r=$('v29Speech').getBoundingClientRect(),txt=$('v29SpeechText'),portrait=$('v29Portrait').getBoundingClientRect();
    const overlap=protectedTargetsV46().map(t=>Math.max(0,Math.min(r.right,t.right)-Math.max(r.left,t.left))*Math.max(0,Math.min(r.bottom,t.bottom)-Math.max(r.top,t.top)));
    const textOverflow=txt.scrollHeight>txt.clientHeight+2;
    const cards=[...document.querySelectorAll('#rosterBoard .unit-card,#combatView .unit-card')].filter(n=>n.getClientRects().length);
    const cardIssues=cards.filter(n=>{const z=n.getBoundingClientRect(),h=n.querySelector('h3');return z.width>=z.height||z.bottom>$('v27Arena').getBoundingClientRect().bottom+1||(h&&h.scrollWidth>h.clientWidth+2)}).length;
    const pane=$('v27Cards').getBoundingClientRect();
    const shopIssues=[...document.querySelectorAll('#v27Cards .ec-mini')].filter(n=>n.getClientRects().length).filter(n=>{const z=n.getBoundingClientRect(),button=n.closest('.v20-shop-entry,.hand-card')?.querySelector('.v38-buy,.v38-play')?.getBoundingClientRect();return z.top<pane.top-1||z.bottom>pane.bottom+1||(button&&z.bottom>button.top+1)||(innerWidth>innerHeight&&innerHeight>600&&innerHeight<=840&&Math.abs(z.width/z.height-.716)>.025)}).length;
    return {step:tutorialV24.step,speech:{x:r.x,y:r.y,w:r.width,h:r.height},textOverflow,cardIssues,shopIssues,overlap,portraitWidth:portrait.width,pass:!textOverflow&&!cardIssues&&!shopIssues&&overlap.every(x=>x<1)&&r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1};
   });report.checks.push({width,height,...check});console.log(width,height,step,check.pass,check.textOverflow,check.cardIssues,check.overlap);
   await p.screenshot({path:`${out}/${width}-${height}-${step}.png`,format:'png'});
  }
 }
 report.errors.push(...p.consoleErrors);
}catch(e){report.errors.push(e.stack)}finally{await b.close();writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));process.exit(report.errors.length||report.checks.some(x=>!x.pass)?1:0)}
