// V46 presentation adapters. Do not mutate G, card definitions, RNG or tutorial gates.
const usabilityV46={scoutOpen:false};
function labelButtonV46(node,text){
 if(!node)return;
 let label=node.querySelector('.v46-button-text');
 if(!label){label=document.createElement('span');label.className='v46-button-text';node.insertBefore(label,node.querySelector('b'))}
 if(label.textContent!==text)label.textContent=text;
 node.dataset.v41IconOnly='false';
}
function syncUsabilityV46(){
 if(!uiV41.ready)return;
 if(!document.querySelector('[aria-describedby~="v27Hover"]'))$('v27Hover')?.classList.add('hidden');
 const merge=$('v27Merge');if(merge&&$('v41Browse')&&merge.parentElement!==$('v41Browse'))$('v41Browse').append(merge);
 if(merge)$('v27MergeCaption').textContent='已回手牌，請重新部署';
 labelButtonV46($('v27LastMerge'),'升星紀錄');
 labelButtonV46($('v29Replay'),'重聽');
 for(const node of document.querySelectorAll('#rosterBoard .slot-actions summary')){
  if(node.textContent!=='調整')node.textContent='調整';
 }
 const task=$('v29TaskAction'),taskLabel=task?.getAttribute('aria-label')||task?.textContent||'';
 $('gameScreen').dataset.v47Task=typeof tutorialV24!=='undefined'&&tutorialV24&&!$('v29Scene')?.open&&!task?.hidden?(/刷新/.test(taskLabel)?'refresh':/升級/.test(taskLabel)?'upgrade':''):'';
 for(const badge of document.querySelectorAll('.v38-pending-badge'))badge.textContent='待部署';
 if(G){
  labelButtonV46($('refreshButton'),'刷新');labelButtonV46($('upgradeButton'),'升級');
  labelButtonV46($('lockButton'),G.p.shopLocked?'解鎖':'鎖定');labelButtonV46($('v39DetailButton'),'戰局');
  for(const node of document.querySelectorAll('.v38-buy'))labelButtonV46(node,'購買');
  for(const node of document.querySelectorAll('#hand [data-v20-hand-index]')){
   const c=G.p.hand[Number(node.dataset.v20HandIndex)];if(c){
    const button=node.querySelector('.v38-play'),full=c.type==='unit'&&G.p.board.length>=SLOTS;
    labelButtonV46(button,full?'隊伍已滿':c.type==='unit'?'部署':c.type==='field'?'啟用':'施放');
    button?.classList.toggle('v46-team-full',full);
   }
  }
  const detail=$('v39DetailButton');if(detail&&detail.parentElement!==$('v27Controls'))$('v27Controls').insertBefore(detail,$('v27PhaseControls'));
  const scout=$('v45Scout');if(scout){
   let toggle=$('v46ScoutToggle');if(!toggle){toggle=document.createElement('button');toggle.id='v46ScoutToggle';toggle.type='button';toggle.setAttribute('aria-controls','v45ScoutCards');scout.querySelector('.v45-scout-head').append(toggle);toggle.onclick=()=>{usabilityV46.scoutOpen=!usabilityV46.scoutOpen;syncUsabilityV46();scheduleLayoutV41()}}
   scout.dataset.v46Open=String(usabilityV46.scoutOpen);toggle.setAttribute('aria-expanded',String(usabilityV46.scoutOpen));toggle.textContent=usabilityV46.scoutOpen?'收起紀錄':'查看紀錄';
  }
  const prompt=$('v39Prompt');if(prompt){
   let summary=$('v46Tactics');if(!summary){summary=document.createElement('span');summary.id='v46Tactics';prompt.append(summary)}
   const text=G.phase==='deploy'?[$('firstAttackLabel')?.textContent.trim(),G.p.queue.length?'待發動 '+G.p.queue.length+' 張行動':''].filter(Boolean).join(' · '):innerHeight<=840&&innerWidth>innerHeight?$('combatCaption')?.textContent.trim():'';
   if(summary.textContent!==text)summary.textContent=text||'';
  }
  $('v27QueueHost')?.classList.toggle('v46-empty-queue',!G.p.queue.length);
 }
 const flip=document.querySelector('#cardViewer button[onclick="flipViewedCard()"]');labelButtonV46(flip,viewerBack?'看正面':'看故事');
 if(flip)flip.setAttribute('aria-label',viewerBack?'看正面':'看故事');
}
const decorateBeforeV46=decorateV41;
decorateV41=function(){decorateBeforeV46();syncUsabilityV46()};
const battlefieldBeforeV46=syncBattlefieldV45;
syncBattlefieldV45=function(){battlefieldBeforeV46();syncUsabilityV46()};
const viewerBeforeV46=drawViewer;
drawViewer=function(){viewerBeforeV46();syncUsabilityV46()};
const layoutBeforeV46=layoutV41;
layoutV41=function(){
 layoutBeforeV46();
 for(const id of ['rosterBoard','aiBoard','playerBoard']){
  const board=$(id),slot=board?.querySelector('.unit-slot');if(!slot?.getClientRects().length)continue;
  const rowHeight=parseFloat(getComputedStyle(board).gridTemplateRows.split(' ')[0]);
  const h=(rowHeight||slot.clientHeight)-parseFloat(getComputedStyle(slot).paddingTop)-8;
  // Empty slots have their own card width; use the grid track to avoid shrinking on every render.
  const track=parseFloat(getComputedStyle(board).gridTemplateColumns.split(' ')[0]);
  const available=id==='rosterBoard'?(track||slot.clientWidth)-48:(track||slot.clientWidth);
  const width=Math.floor(Math.min(available,Math.max(54,h*.716)));
  board.style.setProperty('--v43-unit-w',width+'px');
 }
 const pane=$('v27Cards'),strip=$(deckV20==='hand'?'hand':'shopGrid');
 if(pane&&strip?.clientHeight){
  const compact=innerHeight<=840&&innerWidth>innerHeight;
  pane.style.setProperty('--v41-card-w',Math.floor(Math.max(100,Math.min(compact&&innerHeight<=600?148:200,(strip.clientHeight-72)*.716)))+'px');
  pane.dataset.v45Overflow=String(strip.scrollWidth>strip.clientWidth+3);
 }
};
// Protect the whole target card and its action, while preserving the original lesson state machine.
function protectedTargetsV46(){
 const m=coachModelV30,face=m?.primary?coachFaceV31(m.primary):null;
 return [face?.closest('.v20-shop-entry,.hand-card,.unit-slot')||face,m?.destination,$('cardViewer')?.open?$('largeCard'):null,$('cardViewer')?.open?$('v44Reader'):null].filter(n=>n?.isConnected&&n.getClientRects().length).map(n=>n.getBoundingClientRect());
}
const guideBeforeV46=arrangeGuideV31;
arrangeGuideV31=function(){
 guideBeforeV46();const scene=$('v29Scene');if(!scene?.open)return;
 const compact=innerHeight<=840&&innerWidth>innerHeight,pad=8,top=Math.max(compact?48:94,($('v26StatusDock')?.getBoundingClientRect().bottom||0)+8),targets=protectedTargetsV46();
 if(compact&&$('cardViewer')?.open){
  const r=$('cardViewer').querySelector('.viewer-dialog').getBoundingClientRect();
  for(const [key,value]of Object.entries({x:r.left+8,y:r.top+56,w:r.width-16,h:innerHeight>600?144:112}))scene.style.setProperty('--v42-speech-'+key,value+'px');
  return;
 }
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.right+8)-Math.max(a.x,b.left-8))*Math.max(0,Math.min(a.y+a.h,b.bottom+8)-Math.max(a.y,b.top-8));
 const sizes=compact?[[Math.min(420,innerWidth*.50),214],[Math.min(360,innerWidth*.48),214],[Math.min(300,innerWidth*.45),214]]:[[560,220],[440,220]],candidates=[];
 sizes.forEach(([w,h],index)=>{
  const xs=[innerWidth-w-pad,pad,...targets.flatMap(r=>[r.left-w-10,r.right+10])],ys=[top,innerHeight-h-pad,...targets.flatMap(r=>[r.top-h-10,r.bottom+10])];
  for(const x of xs)for(const y of ys){const p={x:Math.max(pad,Math.min(innerWidth-w-pad,x)),y:Math.max(top,Math.min(innerHeight-h-pad,y)),w,h};p.score=targets.reduce((sum,r)=>sum+overlap(p,r),0)*100+index*100+p.y*.001;candidates.push(p)}
 });
 const chosen=candidates.sort((a,b)=>a.score-b.score)[0];for(const [key,value] of Object.entries({x:chosen.x,y:chosen.y,w:chosen.w,h:chosen.h}))scene.style.setProperty('--v42-speech-'+key,value+'px');
};
const coachBeforeV46=positionCoachV30;
positionCoachV30=function(){
 coachBeforeV46();const arrow=$('v30Arrow'),m=coachModelV30;
 if(m&&$('v29Scene').open&&$('v29Task').contains(m.primary)){$('v30Cues').hidden=true;return}
 if(!m||!arrow||arrow.hidden||$('v30Cues').hidden)return;
 const face=coachFaceV31(m.primary);if(!face)return;const r=face.getBoundingClientRect(),targets=protectedTargetsV46();
 if($('v29Scene').open)targets.push($('v29Speech').getBoundingClientRect());
 // Horizontal and vertical arrows have different flex geometry. Measure after
 // changing direction; measuring the previous direction can clip the label.
 for(const width of [180,140,110])for(const side of ['left','right','above','below']){
  arrow.style.maxWidth=width+'px';arrow.dataset.side=side;
  const a=arrow.getBoundingClientRect(),w=a.width,h=a.height;
  const p=side==='left'?{x:r.left-w-8,y:r.top+(r.height-h)/2}:side==='right'?{x:r.right+8,y:r.top+(r.height-h)/2}:side==='above'?{x:r.left+(r.width-w)/2,y:(targets[0]?.top??r.top)-h-8}:{x:r.left+(r.width-w)/2,y:(targets[0]?.bottom??r.bottom)+8};
  if(p.x>=4&&p.x+w<=innerWidth-4&&p.y>=44&&p.y+h<=innerHeight-4&&!targets.some(t=>p.x<t.right&&p.x+w>t.left&&p.y<t.bottom&&p.y+h>t.top)){
   positionOverlayV41(arrow,p.x,p.y);return;
  }
 }
 // Preserve the original coach placement when no non-overlapping option fits.
 coachBeforeV46();
};
const modalBeforeV46=showModal;
showModal=function(id){
 if(id==='roundModal'){
  const note=$('roundModal').querySelector('.small');
  if(note)note.textContent=$('continueRoundBtn').textContent.includes('最終結算')?'本局已結束，接下來查看最終結算。':'戰鬥中的陣亡單位會於下一輪恢復；本回合結算後再進入下一個部署階段。';
 }
 return modalBeforeV46(id);
};
function styleEditorV46(){
 const doc=$('embeddedEditor')?.contentDocument;
 if(!doc?.body||doc.getElementById('editor-layout-v46'))return;
 const style=doc.createElement('style');style.id='editor-layout-v46';style.textContent=EDITOR_STYLE_V46;doc.head.append(style);
 const toolbar=doc.body.firstElementChild;
 const resize=new ResizeObserver(()=>doc.documentElement.style.setProperty('--editor-toolbar-height',toolbar.offsetHeight+'px'));
 resize.observe(toolbar);
}
document.addEventListener('DOMContentLoaded',()=>{
 $('embeddedEditor')?.addEventListener('load',styleEditorV46);
 document.title='島嶼生態保衛戰｜V46';
 // Keep the profile action away from a long character name below the portrait.
 const rename=$('v22Rename'),next=$('v22Next');if(rename&&next)next.before(rename);
 const footer=document.querySelector('#menuScreen .v20-menu-footer');
 if(footer){const walker=document.createTreeWalker(footer,NodeFilter.SHOW_TEXT);while(walker.nextNode())walker.currentNode.textContent=walker.currentNode.textContent.replace('戰場 V45','介面 V46')}
 for(const [selector,text] of [['.v20-hero-actions .primary','劇情與五階段教學'],['.v20-hero-actions .secondary','略過教學，開始八回合挑戰']]){
  const button=document.querySelector('#menuScreen '+selector);if(button){const wrap=document.createElement('div'),note=document.createElement('span');button.before(wrap);wrap.append(button);note.className='v46-entry-note';note.textContent=text;wrap.append(note)}
 }
 syncUsabilityV46();scheduleLayoutV41();
},{once:true});
