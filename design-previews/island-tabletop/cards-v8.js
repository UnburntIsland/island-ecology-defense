const shapes={
 leaf:'<path d="M19 4C9 2 3 8 5 15c2 7 15 5 14-11Z"/><path d="M4 21 15 9M9 15l-1-5m5 1 4 1"/>',
 sword:'<path d="m15 3 6 0 0 6-11 11-6-6L15 3Z"/><path d="m4 12 8 8M3 21l5-5M17 7l-6 6"/>',
 heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 2 11 8 15 6-4 13-10 8-15Z"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M10 7h4v10h-4z"/>',
 star:'<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>',
 bird:'<path d="M20 5c-5-3-10 1-9 5-5-1-7-4-8-6-2 10 7 17 13 10l4-4 3-1-3-2Z"/><circle cx="16" cy="7" r=".7"/><path d="m7 16-3 5 7-3"/>',
 paw:'<ellipse cx="12" cy="16" rx="6" ry="4"/><circle cx="5" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="16" cy="6" r="2"/><circle cx="20" cy="11" r="2"/>'
};
const icon=n=>`<svg class="icon ${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[n]}</svg>`;
const collection={
 p7:{name:'台灣藍鵲',type:'鳥類',symbol:'bird',cost:3,atk:2,hp:2,effect:'戰鬥開始：右側相鄰友軍攻擊、生命各 +1。',accent:'#38657b',soft:'#c7dce7',light:'#f2f6f6'},
 p1:{name:'台灣水韭',type:'植物',symbol:'leaf',cost:2,atk:1,hp:2,effect:'登場部署：我方島嶼生命 +1（不設上限）。',accent:'#41634b',soft:'#c8d8ab',light:'#f3f5ec'},
 p8:{name:'石虎',type:'哺乳類',symbol:'paw',cost:3,atk:3,hp:2,effect:'伏擊：每場戰鬥第一次主動攻擊 +1。',accent:'#81543d',soft:'#e0c5a1',light:'#fbf3e7'}
};
const stat=(type,label,value)=>`<span class="stat" aria-label="${label} ${value}">${icon(type)}<b>${value}</b><small>${label}</small></span>`;
const stories={
 p7:'我是台灣藍鵲！我和樹蛙一起加入守護隊伍。認識不同生物，是保護家園的第一步。',
 p1:'嗨，我是台灣水韭！請和我一起守護濕地，讓小小的生命也有安心生長的家。',
 p8:'我是石虎！我的遊戲能力是伏擊，生物類群是哺乳類；「守護」則是另一種獨立能力。'
};
const ecologyTip='對戰數值與效果是遊戲化表現，不代表真實捕食關係。';
let selected='p7',showBack=false;
const vars=c=>`--accent:${c.accent};--soft:${c.soft};--light:${c.light}`;
function front(id){const c=collection[id];return `<article class="collectible bold-card" style="${vars(c)}" aria-label="${c.name}正面"><div class="illustration"><div class="cost-badge" aria-label="費用 ${c.cost}"><b>${c.cost}</b>${icon('coin')}</div><img src="assets/${id}.webp" alt="${c.name}完整插畫"></div><div class="name-ribbon"><div><h3>${c.name}</h3><span>${c.type}</span></div><div class="combat-stats">${stat('sword','攻擊',c.atk)}${stat('heart','生命',c.hp)}</div></div><div class="ability"><h4>能力效果</h4><p>${c.effect}</p></div><footer class="card-footer"><span>${icon('star')}1 星</span><span>島嶼生態保衛戰</span>${icon(c.symbol)}</footer></article>`}
const islandMark=`<svg class="island-mark" viewBox="0 0 120 100" role="img" aria-label="淮德島識別標誌"><path d="M20 64a43 43 0 1 1 80 0" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="83" cy="27" r="6" fill="currentColor"/><path d="m19 59 24-29 18 21 11-13 29 21Z" fill="currentColor"/><path d="m43 30 9 26 9-5" fill="none" stroke="var(--accent)" stroke-width="3"/><path d="M14 68c12-9 22 9 34 0s22 9 34 0 16-4 24 0M26 79c10-7 18 7 28 0s18 7 28 0 8-3 12 0M42 90c8-5 13 5 21 0s11 0 15 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
function back(id){const c=collection[id];return `<article class="collectible back-card text-back" style="${vars(c)}" aria-label="${c.name}背面"><header class="back-top"><strong>淮德島</strong></header><div class="back-heading">${islandMark}<h3>${c.name}</h3><p>${c.type}</p></div><section class="back-reading"><p class="story">${stories[id]}</p><aside class="ecology-note"><h4>生態小提醒</h4><p>${ecologyTip}</p></aside></section><footer class="back-footer"><span>島嶼生態保衛戰</span><span>背面介紹</span></footer></article>`}
function render(){document.getElementById('interactive-card').innerHTML=showBack?back(selected):front(selected);document.getElementById('reverse-card').innerHTML=back(selected);document.getElementById('face-title').textContent=showBack?'背面 · 物種故事':'正面 · 能力與數值';document.getElementById('flip-card').textContent=showBack?'翻回正面 ↻':'翻到背面 ↻';document.querySelectorAll('[data-species]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.species===selected)))}
document.querySelectorAll('[data-species]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.species;render()}));
document.getElementById('flip-card').addEventListener('click',()=>{showBack=!showBack;render();const mount=document.getElementById('interactive-card');mount.classList.remove('changing');void mount.offsetWidth;mount.classList.add('changing')});render();
