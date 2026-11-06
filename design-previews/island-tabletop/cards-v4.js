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
function render(id){const c=collection[id],vars=`--accent:${c.accent};--soft:${c.soft};--light:${c.light}`;
 document.getElementById('strong-card').innerHTML=`<article class="collectible bold-card" style="${vars}" aria-label="${c.name}俐落收藏卡"><div class="bold-top"><div class="cost-badge" aria-label="費用 ${c.cost}"><b>${c.cost}</b>${icon('coin')}</div><div class="series-name"><span>淮德島</span></div></div><div class="illustration"><img src="assets/${id}.webp" alt="${c.name}原始完整插畫"></div><div class="name-ribbon"><div><h3>${c.name}</h3><span>${c.type}</span></div><div class="combat-stats">${stat('sword','攻擊',c.atk)}${stat('heart','生命',c.hp)}</div></div><div class="ability"><h4>能力效果</h4><p>${c.effect}</p></div><footer class="card-footer"><span>${icon('star')}1 星</span><span>島嶼生態保衛戰</span>${icon(c.symbol)}</footer></article>`;
 document.getElementById('gentle-card').innerHTML=`<article class="collectible friendly-card" style="${vars}" aria-label="${c.name}親切生態卡"><div class="friendly-top"><div class="friendly-cost" aria-label="費用 ${c.cost}"><b>${c.cost}</b>${icon('coin')}</div><span>淮德島</span><div class="species-stamp" aria-label="${c.type}">${icon(c.symbol)}</div></div><div class="illustration"><img src="assets/${id}.webp" alt="${c.name}原始完整插畫"></div><div class="name-label"><h3>${c.name}</h3><span>${c.type}</span></div><div class="friendly-panel"><div class="ability"><h4>能力效果</h4><p>${c.effect}</p></div><div class="friendly-stats">${stat('sword','攻擊',c.atk)}${stat('heart','生命',c.hp)}${stat('star','星級',1)}</div></div><footer class="friendly-footer"><span>島嶼生態保衛戰</span></footer></article>`;
 document.querySelectorAll('[data-species]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.species===id));
}
document.querySelectorAll('[data-species]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.species)));render('p7');
