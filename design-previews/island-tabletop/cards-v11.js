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
 p7:{name:'台灣藍鵲',type:'鳥類',symbol:'bird',cost:3,atk:2,hp:2,effect:'戰鬥開始：右側相鄰友軍攻擊、生命各 +1。',accent:'#41634b',soft:'#c8d8ab',light:'#f3f5ec'},
 p1:{name:'台灣水韭',type:'植物',symbol:'leaf',cost:2,atk:1,hp:2,effect:'登場部署：我方島嶼生命 +1（不設上限）。',accent:'#41634b',soft:'#c8d8ab',light:'#f3f5ec'},
 p8:{name:'石虎',type:'哺乳類',symbol:'paw',cost:3,atk:3,hp:2,effect:'伏擊：每場戰鬥第一次主動攻擊 +1。',accent:'#41634b',soft:'#c8d8ab',light:'#f3f5ec'}
};
const stat=(type,label,value)=>`<span class="stat" aria-label="${label} ${value}">${icon(type)}<b>${value}</b><small>${label}</small></span>`;
const stories={
 p7:'樹上的小藍鵲肚子餓了！爸媽忙著找食物，有些哥哥姐姐也留下來照顧弟妹、守護鳥巢。這就是藍鵲家族的「合作育雛」。',
 p1:'夢幻湖裡，台灣水韭的葉子帶著孢子落下。小小孢子藏進湖底泥土，等到條件合適，就有機會長出新的水韭。',
 p8:'夜幕降臨，石虎獨自走進林間，尋找小動物當晚餐。牠不只會爬樹，也擅長游泳；白天則常在樹洞或岩縫裡休息。'
};
const storySources={
 p7:{credit:'臺北市立動物園',fact:'部分較早出生的子代會協助照顧弟妹與守護鳥巢，屬於合作育雛。',links:[['臺北市立動物園｜臺灣藍鵲認真育幼','https://www.zoo.gov.taipei/News_Content.aspx?n=BD065B2FA7782989&s=B6C0CE0605F7D6E2'],['臺灣國家公園主題網｜臺灣藍鵲','https://www.taiwan.nps.gov.tw/home/zh-tw/eco-gallery/21493.html']]},
 p1:{credit:'林業試驗所',fact:'夢幻湖水韭的孢子葉脫落後釋出孢子；研究曾以湖底土壤中的孢子培養出幼苗。故事省略中間生殖階段，並非把孢子當成種子。',links:[['林業試驗所｜利用孢子庫進行台灣水韭復育之可行性評估','https://www.tfri.gov.tw/News_Content2.aspx?n=7490&s=6990']]},
 p8:{credit:'臺北市立動物園',fact:'石虎常獨自行動、夜間覓食，以小動物為食，也擅長游泳和爬樹；白天可在樹洞或岩縫休息。',links:[['臺北市立動物園｜石虎動物圖鑑','https://www.zoo.gov.taipei/News_Content.aspx?n=CC7DF0D6519201FD&s=327A85C2DDFE5057&sms=D5A439C2736D52BF']]}
};
function renderSource(id){const s=storySources[id];document.getElementById('story-source').innerHTML=`<p>依公開生態資料改寫的情境小故事，並非單一動物的觀察紀錄。</p><p>${s.fact}</p><ul>${s.links.map(([title,url])=>`<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`).join('')}</ul>`}
let selected='p7',showBack=false;
const vars=c=>`--accent:${c.accent};--soft:${c.soft};--light:${c.light}`;
function front(id){const c=collection[id];return `<article data-ui class="collectible bold-card" style="${vars(c)}" aria-label="${c.name}正面"><div class="illustration"><div class="cost-badge" aria-label="費用 ${c.cost}"><b>${c.cost}</b>${icon('coin')}<small>費用</small></div><img src="assets/${id}.webp" alt="${c.name}完整插畫"></div><div class="name-ribbon"><div><h3>${c.name}</h3><span>${c.type}</span></div><div class="combat-stats">${stat('sword','攻擊',c.atk)}${stat('heart','生命',c.hp)}</div></div><div class="ability"><h4>${c.effect.split("：")[0]}</h4><p>${c.effect.split("：").slice(1).join("：")}</p></div><footer class="card-footer"><span>${icon('star')}1 星</span><span>島嶼生態保衛戰</span>${icon(c.symbol)}</footer></article>`}
const islandMark=`<svg class="island-mark" viewBox="0 0 120 100" role="img" aria-label="淮德島識別標誌"><path d="M20 64a43 43 0 1 1 80 0" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="83" cy="27" r="6" fill="currentColor"/><path d="m19 59 24-29 18 21 11-13 29 21Z" fill="currentColor"/><path d="m43 30 9 26 9-5" fill="none" stroke="var(--accent)" stroke-width="3"/><path d="M14 68c12-9 22 9 34 0s22 9 34 0 16-4 24 0M26 79c10-7 18 7 28 0s18 7 28 0 8-3 12 0M42 90c8-5 13 5 21 0s11 0 15 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
function back(id){const c=collection[id];return `<article data-ui class="collectible back-card text-back" style="${vars(c)}" aria-label="${c.name}背面"><header class="back-top"><strong>淮德島</strong></header><div class="back-heading">${islandMark}<h3>${c.name}</h3><p>${c.type}</p></div><section class="back-reading"><p class="story">${stories[id]}</p></section><footer class="back-footer"><span>島嶼生態保衛戰</span></footer></article>`}
function render(){renderSource(selected);document.getElementById('interactive-card').innerHTML=showBack?back(selected):front(selected);document.getElementById('reverse-card').innerHTML=back(selected);document.getElementById('face-title').textContent=showBack?'背面 · 物種故事':'正面 · 能力與數值';document.getElementById('flip-card').textContent=showBack?'翻回正面 ↻':'翻到背面 ↻';document.querySelectorAll('[data-species]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.species===selected)))}
document.querySelectorAll('[data-species]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.species;render()}));
document.getElementById('flip-card').addEventListener('click',()=>{showBack=!showBack;render();const mount=document.getElementById('interactive-card');mount.classList.remove('changing');void mount.offsetWidth;mount.classList.add('changing')});render();
