// V44 adapters own presentation only. Purchase, deployment, combat and tutorial functions are unchanged.
function cardOptionsV44(c){
 const visual=visualProject.cards[visualCardId(c)]||fallbackVisual(c);
 const keywords=Object.fromEntries(cardKeywordEntries(c).map(k=>[k.name,k.definition]));
 const story=visual.intro&&visual.intro!==defaultIntro(c)?visual.intro:undefined;
 return {image:resolveVisualAsset(c,visual,'frontLarge'),keywords,story};
}
function cardModelV44(c){const visual=visualProject.cards[visualCardId(c)]||fallbackVisual(c);return {...c,name:visual.title||c.name,text:gameEffectText(c)}}
function miniCardV44(c){return CardDesignV44.render(cardModelV44(c),{...cardOptionsV44(c),mini:true})}
cardSummaryV39=c=>miniCardV44(c);
shopCardMarkup=(c,stock)=>miniCardV44({...c,cost:effectiveShopCost(c)})+'<span class="v39-stock">庫存 '+stock+' 張</span>';
summaryArtV38=c=>miniCardV44(c);
unitCardMarkup=function(u,side){
 const c={...u,viewSide:side};if(G?.fight&&['combat','between'].includes(G.phase))c.atk=power(side,u);
 return '<div class="unit-card '+(side==='a'?'foe':'')+'" data-view-card="'+esc(JSON.stringify(c))+'" data-unit="'+u.uid+'" aria-label="'+esc(u.name)+'" '+(side==='p'&&G.phase==='deploy'?'draggable="true" tabindex="0"':'')+'>'+miniCardV44(c)+'<div class="unit-ability-tip">'+esc(gameEffectText(c))+'</div></div>';
};
// The original preview owns secrecy and click handling. Remove only its duplicate old caption.
const enemyPreviewBeforeV44=renderEnemyPreviewV27;
renderEnemyPreviewV27=function(){enemyPreviewBeforeV44();document.querySelectorAll('#v27EnemySlots .v28-card-caption').forEach(n=>n.remove())};
const islandDrawBeforeV44=IslandCard.prototype.draw;
IslandCard.prototype.draw=function(){
 if(!this.shadowRoot)return;let c;try{c=JSON.parse(this.dataset.card||'null')}catch{return}if(!c)return;
 const back=this.getAttribute('face')?.startsWith('back'),large=this.id==='largeCard';
 const w=this.clientWidth,h=this.clientHeight;if(!w||!h)return;
 const signature=this.dataset.card+'|'+(visualProject.cards[visualCardId(c)]?.intro||'')+'|'+(visualProject.cards[visualCardId(c)]?.title||'');
 const options=cardOptionsV44(c);
 if(this._v44Signature!==signature||this._v44Asset!==options.image||!this.shadowRoot.querySelector('.v44-scale')){
  const model=cardModelV44(c);
  this.shadowRoot.innerHTML='<style>'+CARD_STYLE_V44+`:host{display:block;position:relative;perspective:1200px}.v44-scale{position:absolute;left:50%;top:50%;width:420px;height:586.666667px;transform-origin:center}.v42-turntable{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform 300ms cubic-bezier(.4,0,.2,1)}.v42-turntable.is-back{transform:rotateY(180deg)}.v42-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}.v42-back{transform:rotateY(180deg)}.is-back .v42-front,.v42-turntable:not(.is-back) .v42-back{pointer-events:none}@media(prefers-reduced-motion:reduce){.v42-turntable{transition:none}}</style><div class="v44-scale"><div class="v42-turntable"><div class="v42-face v42-front">`+CardDesignV44.render(model,options)+'</div><div class="v42-face v42-back">'+CardDesignV44.render(model,{...options,back:true})+'</div></div></div>';
  this._v44Signature=signature;this._v44Asset=options.image;
  this.shadowRoot.querySelectorAll('img').forEach(img=>img.onerror=()=>{img.onerror=null;repairCardImage(c,'frontLarge',img.src);this._v44Signature=null;this.draw()});
 }
 const scale=Math.min(w/420,h/(586+2/3));
 this.shadowRoot.querySelector('.v44-scale').style.transform='translate(-50%,-50%) scale('+scale+')';
 this.shadowRoot.querySelector('.v42-turntable').classList.toggle('is-back',!!back);
 for(const [selector,inert] of [['.v42-front',!!back],['.v42-back',!back]]){const f=this.shadowRoot.querySelector(selector);f.inert=inert;f.setAttribute('aria-hidden',String(inert))}
 if(reduceMotionV20())this.shadowRoot.querySelector('.v42-turntable').style.transition='none';
};
const viewerBeforeV44=drawViewer;
drawViewer=function(){
 viewerBeforeV44();if(!viewedCard||!browserUIV20())return;
 let panel=$('v44Reader');if(!panel){panel=document.createElement('section');panel.id='v44Reader';panel.tabIndex=0;$('cardViewer').querySelector('.viewer-dialog').appendChild(panel)}
 const c=cardModelV44(viewedCard),options=cardOptionsV44(viewedCard);
 panel.innerHTML='<h3>'+esc(c.name)+'</h3><p class="v44-reader-kind">'+CardDesignV44.kind(c)+' · '+CardDesignV44.side(c)+'</p>'+(viewerBack?'<p>'+esc(options.story??CardDesignV44.narratives[c.id]?.[0]??'')+'</p>':'<p>'+esc(gameEffectText(c))+'</p>'+cardKeywordEntries(viewedCard).map(k=>'<p class="v44-keyword"><b>'+esc(k.name)+'</b> '+esc(k.definition)+'</p>').join(''));
};
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('island-card').forEach(c=>c.draw())},{once:true});
