import {icon,islandMark} from './cards-all-shapes.js';
import {narratives,sources} from './cards-all-stories.js';

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const classes={plant:'植物',mammal:'哺乳類',bird:'鳥類',amphibian:'兩棲類',reptile:'爬蟲類',insect:'昆蟲',mollusk:'軟體動物',fish:'魚類'};
const palettes={
 native:{accent:'#41634b',ink:'#19392d',label:'森林綠 · 原生物種'},
 invader:{accent:'#884547',ink:'#4d2729',label:'磚紅 · 外來物種'},
 action:{accent:'#805c30',ink:'#49351f',label:'赭黃 · 行動卡'},
 field:{accent:'#396579',ink:'#203d4c',label:'湖藍 · 場地卡'},
 divine:{accent:'#78642f',ink:'#443a24',label:'古金 · 自然之母的餽贈'}
};
let palette=new URLSearchParams(location.search).get('palette')==='types'?'types':'green';
const paletteKey=c=>c.id==='divine'?'divine':c.type==='unit'?c.faction:c.type;
const colors=c=>palettes[palette==='types'?paletteKey(c):'native'];
const vars=c=>{const p=colors(c);return `--accent:${p.accent};--card-green:${p.accent};--card-ink:${p.ink};--soft:#c8d8ab;--light:#f3f5ec`};
const special=c=>c.id==='divine'||c.id.startsWith('token_');
const category=c=>special(c)?'special':c.type==='unit'?c.faction:c.type;
const kind=c=>c.id==='divine'?'特殊餽贈':c.id.startsWith('token_')?'衍生單位':c.type==='unit'?(classes[c.bioClass]||'物種'):c.type==='field'?'場地卡':'行動卡';
const side=c=>c.id==='divine'?'遊戲設定':c.faction==='native'?'原生陣營':'外來陣營';
const stat=(type,label,value)=>`<span class="stat${value>=10?' two-digit':''}" aria-label="${label} ${value}">${icon(type)}<b>${value}</b><small>${label}</small></span>`;
let cards=[],keywords={},filtered=[],selected='p7',star=1,showBack=false;
const cardNow=()=>cards.find(c=>c.id===selected);
const variant=c=>({...c,...c.variants.find(v=>v.star===star)});

function effectParts(c){
 const text=c.text,s=c.star||1;
 if(/^(守護|生長)/.test(text))return [text,text.split('，').map(k=>keywords[k]).filter(Boolean).join('')];
 if(/^(格檔|潛伏|凱旋)：/.test(text))return [text,keywords[text.split('：')[0]].replace('X',s)];
 const colon=text.indexOf('：');
 if(colon!==-1){const key=text.slice(0,colon);const timing={'閃亮登場':'打出時','突襲':'戰鬥開始','亡語':'陣亡時','光環':'存活時','屹立':'負傷時'}[key];return [key+(timing?' · '+timing:''),text.slice(colon+1)];}
 const prefix=['每回合戰鬥開始時，','戰鬥開始時，','本輪戰鬥，','戰鬥中，','打出的當回合，'].find(t=>text.startsWith(t));
 if(prefix)return [prefix.slice(0,-1),text.slice(prefix.length)];
 return ['能力效果',text];
}
export function front(id,level=star){
 const base=cards.find(c=>c.id===id),c={...base,...base.variants.find(v=>v.star===level)},[heading,body]=effectParts(c);
 const cost=special(c)?`<div class="cost-badge special-badge">${c.id==='divine'?'餽贈':'衍生'}</div>`:`<div class="cost-badge" aria-label="費用 ${c.cost}"><b>${c.cost}</b>${icon('coin')}<small>費用</small></div>`;
 const stats=c.type==='unit'?`<div class="combat-stats">${stat('sword','攻擊',c.atk)}${stat('heart','生命',c.hp)}</div>`:'';
 const levelLabel=c.variants.length?`${icon('star')}${c.star} 星`:kind(c);
 return `<article data-ui data-card-id="${id}" data-effect-original="${esc(c.text)}" class="collectible bold-card" style="${vars(c)}" aria-label="${esc(c.name)}正面"><div class="illustration">${cost}<img src="assets/${id}.webp" alt="${esc(c.name)}完整插畫"></div><div class="name-ribbon"><div><h3>${esc(c.name)}</h3><span>${kind(c)}${palette==='types'&&!special(c)?' · '+side(c):''}</span></div>${stats}</div><div class="ability"><h4>${esc(heading)}</h4><p>${esc(body)}</p></div><footer class="card-footer"><span>${levelLabel}</span><span>島嶼生態保衛戰</span><span>${side(c)}</span></footer></article>`;
}
export function back(id){
 const c=cards.find(c=>c.id===id);
 return `<article data-ui data-card-id="${id}" class="collectible back-card text-back" style="${vars(c)}" aria-label="${esc(c.name)}背面"><header class="back-top"><strong>淮德島</strong></header><div class="back-heading">${islandMark}<h3>${esc(c.name)}</h3><p>${kind(c)}</p></div><section class="back-reading"><p class="story">${esc(narratives[id][0])}</p></section><footer class="back-footer"><span>島嶼生態保衛戰</span><span>${side(c)}</span></footer></article>`;
}
function renderSource(c){
 const refs=narratives[c.id][1];
 $('story-source').innerHTML=refs.length?`<p>依公開資料改寫的生態情境，並非單一個體的觀察紀錄。</p><ul>${refs.map(k=>`<li><a href="${esc(sources[k][1])}" target="_blank" rel="noopener noreferrer">${esc(sources[k][0])}</a></li>`).join('')}</ul>`:'<p>這張卡是淮德島的原創遊戲設定，背面介紹其在遊戲中的角色。</p>';
 const v=variant(c),used=Object.keys(keywords).filter(k=>v.text.includes(k));
 $('rule-help').innerHTML=used.length?`<dl>${used.map(k=>`<div><dt>${esc(k)}</dt><dd>${esc(keywords[k].replace('X',v.star||1))}</dd></div>`).join('')}</dl>`:'';
}
function render(){
 const c=cardNow();if(!c)return;
 $('interactive-card').innerHTML=showBack?back(c.id):front(c.id);
 $('reverse-card').innerHTML=back(c.id);
 const backTitle=special(c)?'背面 · 島嶼故事':c.type==='unit'?'背面 · 物種故事':'背面 · 生態故事';
 $('face-title').textContent=showBack?backTitle:'正面 · 能力與數值';$('back-title').textContent=backTitle;
 $('flip-card').textContent=showBack?'翻回正面 ↻':'翻到背面 ↻';
 $('card-select').value=c.id;
 document.querySelector('.star-picker').hidden=!c.variants.length;
 document.querySelectorAll('[data-star]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.star===star)));
 document.querySelectorAll('.catalog-item').forEach(b=>b.setAttribute('aria-current',String(b.dataset.id===c.id)));
 const index=filtered.findIndex(x=>x.id===c.id);$('previous').disabled=index<=0;$('next').disabled=index===filtered.length-1;
 renderSource(c);
 document.querySelector('.direction-note').textContent=palette==='types'?colors(c).label+' · 正反面同色':'森林綠卡框 · 共用島嶼標誌';
 history.replaceState(null,'',`#${c.id}${c.variants.length&&star!==1?'-'+star:''}`);
}
function choose(id){selected=id;showBack=false;render();}
function filter(){
 const group=$('category').value,query=$('search').value.trim().replaceAll('臺','台');
 filtered=cards.filter(c=>(group==='all'||category(c)===group)&&`${c.name}${kind(c)}`.replaceAll('臺','台').includes(query));
 $('result-count').textContent=`${filtered.length} / ${cards.length} 種卡牌`;
 $('card-select').innerHTML=filtered.map(c=>`<option value="${c.id}">${esc(c.name)} · ${kind(c)}</option>`).join('');
 $('catalog-grid').innerHTML=filtered.map(c=>`<button class="catalog-item" style="${vars(c)}" data-id="${c.id}" aria-label="查看${esc(c.name)}"><img src="assets/${c.id}.webp" alt="" loading="lazy"><span>${esc(c.name)}</span><small>${kind(c)} · ${side(c)}</small></button>`).join('');
 const empty=!filtered.length;$('card-detail').hidden=empty;$('sources').hidden=empty;$('rule-help').hidden=empty;$('card-select').disabled=empty;$('loading-status').hidden=!empty;
 $('loading-status').textContent=empty?'沒有符合的卡牌，請換個名稱或分類。':'';
 document.querySelector('.star-picker').hidden=empty;
 if(empty){$('previous').disabled=true;$('next').disabled=true;return;}
 if(!filtered.some(c=>c.id===selected))selected=filtered[0].id;
 render();
}
async function load(){
 const get=async file=>{const r=await fetch(file);if(!r.ok)throw new Error(file);return r.json()};
 [cards,keywords]=await Promise.all([get('cards-all-data.json'),get('cards-all-keywords.json')]);
 if(cards.some(c=>!narratives[c.id]))throw new Error('missing story');
 const hash=location.hash.slice(1),match=hash.match(/^(.*?)(?:-(1|2|4))?$/);
 if(cards.some(c=>c.id===match?.[1])){selected=match[1];star=Number(match[2]||1);}
 $('palette').value=palette;
 $('palette-legend').hidden=palette!=='types';
 $('palette').addEventListener('change',()=>{palette=$('palette').value;const url=new URL(location.href);if(palette==='types')url.searchParams.set('palette','types');else url.searchParams.delete('palette');history.replaceState(null,'',url);$('palette-legend').hidden=palette!=='types';filter()});
 $('category').addEventListener('change',filter);$('search').addEventListener('input',filter);
 $('card-select').addEventListener('change',e=>choose(e.target.value));
 for(const [id,step] of [['previous',-1],['next',1]])$(id).addEventListener('click',()=>{const next=filtered[filtered.findIndex(c=>c.id===selected)+step];if(next)choose(next.id)});
 document.querySelectorAll('[data-star]').forEach(b=>b.addEventListener('click',()=>{star=+b.dataset.star;render()}));
 $('flip-card').addEventListener('click',()=>{showBack=!showBack;render()});
 $('catalog-grid').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){choose(b.dataset.id);$('card-detail').scrollIntoView({block:'start'});$('flip-card').focus({preventScroll:true})}});
 filter();document.body.dataset.ready='true';
}
load().catch(error=>{console.error(error);$('loading-status').textContent='卡牌載入失敗，請確認預覽伺服器開啟後重新整理。'});
