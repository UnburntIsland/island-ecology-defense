// Presentation-only fixtures. The separate eight-round test records real play.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='.taste-skill/roundtrip/result-copy';mkdirSync(out,{recursive:true});
const b=await Browser.launch(),checks=[];
try{
 for(const [width,height]of [[1440,900],[844,390]]){
  const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/');
  await p.eval("startGame();hideModal('quizModal')");
  for(const [round,hp,final]of [[7,11,false],[8,8,true],[4,0,true]]){
   const check=await p.eval(({round,hp,final})=>{
    G.round=round;G.phase='between';G.p.hp=hp;G.a.hp=13;G.roundResult={winner:'a',damage:3};
    render();const before=JSON.stringify(G);showRoundResult();
    const text=$('roundModal').querySelector('.small').textContent,button=$('continueRoundBtn').textContent;
    return {round,hp,text,button,pass:before===JSON.stringify(G)&&(final?text.includes('本局已結束')&&button.includes('最終結算'):text.includes('下一個部署階段')&&button.includes('下一回合'))};
   },{round,hp,final});
   await new Promise(r=>setTimeout(r,450));
   await p.screenshot({path:`${out}/${width}-round-${round}.png`,format:'png'});
   checks.push({width,height,...check});await p.eval("hideModal('roundModal')");
  }
  if(p.consoleErrors.length)throw Error(JSON.stringify(p.consoleErrors));
 }
}finally{await b.close();writeFileSync(out+'/report.json',JSON.stringify(checks,null,2))}
console.log(JSON.stringify(checks));if(checks.length!==6||checks.some(c=>!c.pass))process.exitCode=1;
