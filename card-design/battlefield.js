// V45 presentation only. Read the same scouting snapshot as the original details panel.
function syncBattlefieldV45(){
 if(!G||!$('deploymentView'))return;
 let scout=$('v45Scout');
 if(!scout){scout=document.createElement('section');scout.id='v45Scout';scout.setAttribute('aria-label','敵方偵察紀錄');$('deploymentView').prepend(scout)}
 const known=tutorialV24?{board:G.a.board,field:G.a.field}:G.enemySeenV27;
 const label=tutorialV24?'教學固定陣容':known?'上回合開戰紀錄':'尚未偵察 · 開戰後揭曉';
 const signature=JSON.stringify([label,known]);
 if(scout.dataset.signature!==signature){
  scout.dataset.signature=signature;
  scout.innerHTML='<div class="v45-scout-head"><strong>敵方編隊</strong><span>'+esc(label)+'</span></div><div id="v45ScoutCards">'+Array.from({length:6},(_,i)=>{const c=known?.board[i];return c?'<button type="button" data-v45-scout="'+i+'" aria-label="查看'+esc(c.name)+'的偵察紀錄">'+miniCardV44(c)+'</button>':'<div class="v45-unknown"><span aria-hidden="true">'+(known?'＋':'？')+'</span><small>'+(known?'空位':'未偵察')+'</small></div>'}).join('')+'</div>';
  scout.querySelectorAll('button').forEach(n=>n.onclick=()=>showCardViewer(known.board[Number(n.dataset.v45Scout)]));
 }
 scheduleLayoutV41();
}
const renderBeforeV45=render;
render=function(){renderBeforeV45();syncBattlefieldV45()};
const layoutBeforeV45=layoutV41;
layoutV41=function(){
 layoutBeforeV45();
 const scout=$('v45ScoutCards');if(scout?.clientHeight)scout.style.setProperty('--v45-scout-w',Math.floor(scout.clientHeight*.716)+'px');
 const pane=$('v27Cards'),strip=$(deckV20==='hand'?'hand':'shopGrid');
 if(pane&&strip?.clientHeight){
  const compact=innerHeight<=600&&innerWidth>innerHeight;
  const w=Math.max(compact?100:108,Math.min(compact?148:170,(strip.clientHeight-12)*.62));
  pane.style.setProperty('--v41-card-w',Math.floor(w)+'px');
  pane.dataset.v45Overflow=String(strip.scrollWidth>strip.clientWidth+3);
 }
 for(const id of ['rosterBoard','aiBoard','playerBoard']){
  const board=$(id),slot=board?.querySelector('.unit-slot');if(!slot?.getClientRects().length)continue;
  const h=slot.clientHeight-parseFloat(getComputedStyle(slot).paddingTop);
  const compactCombat=id!=='rosterBoard'&&innerHeight<=600&&innerWidth>innerHeight;
  board.style.setProperty('--v43-unit-w',Math.floor(Math.max(compactCombat?66:54,h*(compactCombat?.84:.716)))+'px');
 }
};
document.addEventListener('DOMContentLoaded',()=>{
 document.title='島嶼生態保衛戰｜V45 島嶼戰場';
 const footer=document.querySelector('#menuScreen .v20-menu-footer');
 if(footer){const walker=document.createTreeWalker(footer,NodeFilter.SHOW_TEXT);while(walker.nextNode())walker.currentNode.textContent=walker.currentNode.textContent.replace('介面 V43','戰場 V45')}
 syncBattlefieldV45();
},{once:true});
