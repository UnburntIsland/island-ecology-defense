// Render every existing question, answer and explanation at small landscape size.
// The question selector is replaced only inside the isolated test page.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='.taste-skill/full-review/questions';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),report={questions:[],errors:[]};const p=await b.newPage({width:667,height:375});
try{
 await p.goto('http://127.0.0.1:8765/');await p.eval(()=>{startGame();window.testQuestionIndex=0;quizForRoundV21=()=>KNOWLEDGE_QUESTIONS[window.testQuestionIndex]});
 const count=await p.eval(()=>KNOWLEDGE_QUESTIONS.length);
 for(let i=0;i<count;i++){
  await p.eval(i=>{window.testQuestionIndex=i;showRoundQuiz()},i);
  const initial=await p.eval(()=>[...$('quizModal').querySelectorAll('#quizQuestion,.quiz-choice')].filter(n=>n.scrollWidth>n.clientWidth+2).map(n=>n.textContent));
  await p.eval(()=>{answerRoundQuiz((activeQuiz.answer+1)%activeQuiz.options.length);$('quizFeedback').querySelector('details').open=true;$('quizContinue').scrollIntoView({block:'nearest',behavior:'instant'})});
  await p.eval(async()=>new Promise(r=>setTimeout(r,50)));
  const result=await p.eval(()=>{const n=$('quizContinue'),r=n.getBoundingClientRect(),bad=[...$('quizFeedback').querySelectorAll('p,b,summary')].filter(n=>n.scrollWidth>n.clientWidth+2);return{continueVisible:r.top>=0&&r.bottom<=innerHeight&&n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),bad:bad.map(n=>n.textContent)}});
  if(initial.length||result.bad.length||!result.continueVisible)report.errors.push({i,initial,result});
  report.questions.push({i,...result});if([0,4,9,14,19,24,29].includes(i))await p.screenshot({path:out+'/'+i+'.png',format:'png'});await p.eval('closeRoundQuiz()');
 }
 report.errors.push(...p.consoleErrors);
}catch(e){report.errors.push(e.stack)}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({questions:report.questions.length,errors:report.errors}));process.exit(report.errors.length?1:0)}
