const icons={
 leaf:'<path d="M19 4C9 2 3 8 5 15c2 7 15 5 14-11Z"/><path d="M4 21 15 9M9 15l-1-5m5 1 4 1"/>',
 sword:'<path d="m15 3 6 0 0 6-11 11-6-6L15 3Z"/><path d="m4 12 8 8M3 21l5-5M17 7l-6 6"/>',
 heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 2 11 8 15 6-4 13-10 8-15Z"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M10 7h4v10h-4z"/>',
 star:'<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 flip:'<path d="M4 8a9 9 0 0 1 15-2l2 2M21 3v5h-5M20 16A9 9 0 0 1 5 18l-2-2M3 21v-5h5"/>',
 arrow:'<path d="m9 5 7 7-7 7"/>',
 back:'<path d="m15 5-7 7 7 7"/>',
 play:'<path d="m7 4 13 8-13 8Z"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 cart:'<path d="M2 3h3l3 12h11l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
 up:'<path d="M12 21V4m-7 7 7-7 7 7M4 2h16"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
 book:'<path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-2-1-6-2-10 1Z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 6v1"/>',
 bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
 shield:'<path d="m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6Z"/>',
 paw:'<ellipse cx="12" cy="16" rx="6" ry="4"/><circle cx="5" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="16" cy="6" r="2"/><circle cx="20" cy="11" r="2"/>'
};
const icon=(name)=>`<svg class="icon icon-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.leaf}</svg>`;
const cards={
 p1:{name:'台灣水韭',cost:2,atk:1,hp:2,type:'植物',tag:'登場治癒',effect:'登場部署：我方島嶼生命 +1（不設上限）。',bio:'台灣水韭是生長於水域的蕨類植物。這張卡牌以「登場治癒」呈現棲地與島嶼生命的連結。'},
 p2:{name:'台灣百合',cost:2,atk:1,hp:3,type:'植物',tag:'動植物共生',effect:'戰鬥中：若有其他原生動物類單位存活，攻擊 +1。'},
 p3:{name:'台灣紅檜',cost:3,atk:1,hp:4,type:'植物',tag:'庇蔭',effect:'戰鬥開始：其他我方單位生命 +1。'},
 p4:{name:'諸羅樹蛙',cost:2,atk:2,hp:1,type:'兩棲類',tag:'植物相伴',effect:'戰鬥開始：若場上有植物，自身生命 +1。'},
 p5:{name:'穿山甲',cost:3,atk:1,hp:4,type:'哺乳類',tag:'守護',effect:'守護：敵人必須優先攻擊它。'},
 p6:{name:'台灣野山羊',cost:3,atk:2,hp:3,type:'哺乳類',tag:'堅韌',effect:'堅韌：每場戰鬥首次受傷減少 1 點。'},
 p7:{name:'台灣藍鵲',cost:3,atk:2,hp:2,type:'鳥類',tag:'並肩作戰',effect:'戰鬥開始：右側相鄰友軍攻擊、生命各 +1。'},
 p8:{name:'石虎',cost:3,atk:3,hp:2,type:'哺乳類',tag:'伏擊',effect:'伏擊：每場戰鬥第一次主動攻擊 +1。'},
 a1:{name:'紅火蟻',cost:2,atk:2,hp:1,type:'昆蟲類',tag:'突襲',effect:'戰鬥開始：對最左側原生單位造成 1 傷害。'},
 a2:{name:'福壽螺',cost:2,atk:1,hp:2,type:'軟體動物',tag:'繁殖',effect:'戰鬥中陣亡：召喚暫時的 1/1 幼體。'},
 a3:{name:'斑腿樹蛙',cost:2,atk:1,hp:2,type:'兩棲類',tag:'群聚',effect:'戰鬥中：有其他外來種存活時攻擊 +1。'},
 a4:{name:'小花蔓澤蘭',cost:2,atk:1,hp:2,type:'植物',tag:'蔓延',effect:'戰鬥中陣亡：召喚暫時的 1/1 蔓藤。'},
 a5:{name:'銀合歡',cost:3,atk:2,hp:3,type:'植物',tag:'競爭',effect:'戰鬥中：原生植物攻擊 -1，最低 0。'},
 a6:{name:'綠鬣蜥',cost:3,atk:3,hp:2,type:'爬蟲類',tag:'伏擊',effect:'伏擊：每場戰鬥第一次主動攻擊 +1。'},
 pa1:{name:'人工移除',cost:2,type:'特殊行動',tag:'移除',effect:'戰鬥開始：對敵方最左側單位造成 2 傷。'},
 pa2:{name:'棲地修復',cost:2,type:'特殊行動',tag:'修復',effect:'本輪戰鬥開始：全體友軍生命 +1。'}
};
const btn=(sym,label,extra='')=>`<button ${extra}>${icon(sym)}${label?`<span>${label}</span>`:''}</button>`;
function card(id,{size='field',back=false,status='',interactive=true}={}){
 const c=cards[id],enemy=id[0]==='a',unit=c.atk!==undefined;
 const content=back?`<div class="card-name">${c.name}</div><div class="reverse-symbol">${icon('leaf')}</div><div class="reverse-copy"><small>物種與能力</small><h3>${c.tag}</h3><p>${c.effect}</p><p>${c.bio||'這裡會承接遊戲原有的完整卡背介紹。此版僅展示閱讀區的排版與字級。'}</p></div><div class="card-bottom"><span>生態觀察筆記</span>${icon('book')}</div>`:`<div class="card-name">${c.name}</div><div class="card-art"><img src="assets/${id}.webp" alt="${c.name}完整插畫"></div>${size==='reader'?`<div class="card-ability"><span>${icon(unit?'leaf':'bolt')}${c.tag}</span><p>${c.effect}</p></div>`:''}${status?`<div class="card-status">${icon('lock')}${status}</div>`:''}<div class="card-stats">${unit?`<span>${icon('sword')}<b>${c.atk}</b></span><span>${icon('heart')}<b>${c.hp}</b></span>`:`<span class="action-type">特殊行動</span>`}</div><div class="card-bottom"><span>${icon('coin')}<b>${c.cost}</b></span>${unit?`<span class="card-star" aria-label="一星">${icon('star')}<b>1</b></span>`:''}<span aria-label="${c.type}">${icon(unit?(c.type==='植物'?'leaf':'paw'):'bolt')}${size==='reader'?c.type:''}</span></div>`;
 return `<${interactive?'button':'article'} class="species-card ${size} ${enemy?'invader':''} ${back?'back-face':''}" ${interactive?`data-card="${id}" aria-label="查看${c.name}"`:''}><div class="card-inset">${content}</div></${interactive?'button':'article'}>`;
}
function terrain(){return '<img class="terrain" src="assets/island-arena-v2.png" alt="" aria-hidden="true">'}
function header(title,right=''){return `<header class="topbar"><div class="brand">${icon('leaf')}<h1>${title}</h1></div>${right}<span class="preview-label">設計預覽</span></header>`}
function showcase(){return `${header('同一張卡，從戰場到掌心')}<main class="card-showcase"><section class="field-spec"><div class="section-caption"><span>場上卡牌</span><p>典藏卡框 · 完整插畫 · 清楚數值</p></div><div class="mini-plinth">${card('p1',{size:'sample'})}</div><div class="state-example">${icon('lock')}特殊能力暫停<span>狀態獨立顯示，不壓住插畫</span></div><p class="spec-note">卡面只查看<br>購買／部署另有獨立按鈕</p></section><section class="reader-spec"><div class="section-caption"><span>查看卡牌 · 正面</span><p>加厚框體與植物紋飾，展開能力說明</p></div>${card('p1',{size:'reader',interactive:false})}</section><section class="reverse-spec"><div class="section-caption"><span>查看卡牌 · 背面</span><p>同一張卡的另一面</p></div>${card('p1',{size:'reader',back:true,interactive:false})}<span class="spec-note">卡背文字為排版示意；實作沿用原介紹</span></section></main><footer class="sheet-footer">${icon('info')}場上與查看器共用卡框、名稱欄、插畫及數值位置；查看器多出完整效果閱讀區。</footer>`}
function story(){return `<div class="story-page">${header('命運的召喚',`<span class="chapter">淮德島 · 序章</span><div class="header-actions">${btn('back','返回首頁','data-demo')}${btn('play','直接對戰','data-demo')}</div>`)}<div class="story-stage"><figure class="sylia"><img src="assets/sylia.webp" alt="自然之母希莉亞完整立繪"><figcaption><small>淮德島的守護神</small><strong>自然之母 · 希莉亞</strong></figcaption></figure><section class="conversation"><div class="speech"><header><div><small>自然之母</small><h1>希莉亞</h1></div><span id="story-progress">1 / 9</span></header><p id="story-line">你好，尊敬的勇者大人，歡迎來到我的家園。</p><footer>${btn('back','上一句','id="prev-story" disabled')}${btn('arrow','下一句','id="next-story" class="primary"')}</footer></div><div class="story-below"><span>點按下一句繼續 · 鍵盤 ← → 翻頁</span>${btn('book','回看對話','data-demo')}</div><div class="length-switch" role="group" aria-label="比較台詞長度"><button data-line="short" aria-pressed="true">短句示意</button><button data-line="long" aria-pressed="false">長句示意</button></div></section></div></div>`}
function battlefield(){const enemy=['a1','a2','a3','a4','a5','a6'],ally=['p1','p2','p5','p7','p8',null],hand=['p3','p4','p6','pa1','pa2'];return `<div class="battle-page">${header('島嶼生態保衛戰',`<div class="round"><b>第 3 / 8 回合</b><span>部署階段</span></div>${btn('menu','','data-demo aria-label="開啟選單"')}`)}<main class="tabletop">${terrain()}<div class="vital native"><span>島嶼生命</span><strong>20<small> / 20</small></strong><i></i></div><div class="vital enemy"><span>外來入侵壓力</span><strong>20<small> / 20</small></strong><i></i></div><div class="roster enemy-row"><div class="side-label"><span>外來種</span><b>6 / 6</b></div>${enemy.map((id,i)=>`<div class="lane"><span class="slot-number">${i+1}</span>${card(id)}</div>`).join('')}</div><div class="middle-caption"><span>淮德島</span><span>敵我各六格 · 依序行動</span></div><div class="roster ally-row"><div class="side-label"><span>我方編隊</span><b>5 / 6</b></div>${ally.map((id,i)=>`<div class="lane"><span class="slot-number">${i+1}</span>${id?card(id):'<button class="empty-slot" data-demo><span>＋</span>空位</button>'}</div>`).join('')}</div><div class="field-status">${icon('leaf')}場地尚未啟用</div>${btn('info','戰局詳情','class="battle-detail" data-demo')}</main><footer class="hand-dock"><section class="resources"><span>可用金幣</span><strong>${icon('coin')}4</strong><small>點卡面查看</small><button class="deck-back" data-demo aria-label="查看牌庫">${icon('leaf')}</button></section><section class="hand-section"><div class="hand-top"><div role="group" aria-label="切換卡牌區"><button data-deck="shop">${icon('cart')}招募 <b>5</b></button><button data-deck="hand" aria-pressed="true">${icon('book')}手牌 <b>5</b></button></div><div class="shop-tools" hidden>${btn('flip','1','data-demo aria-label="刷新商店，費用一金幣"')}${btn('up','2','data-demo aria-label="升級商店，費用二金幣"')}${btn('lock','','data-demo aria-label="鎖定商店"')}</div><span class="rail-instruction">可左右滑看</span><div class="rail-arrows">${btn('back','','data-scroll="-1" aria-label="上一張卡"')}${btn('arrow','','data-scroll="1" aria-label="下一張卡"')}</div></div><div class="hand-rail">${hand.map(id=>`<div class="hand-entry">${card(id,{size:'hand'})}${btn(id.startsWith('pa')?'bolt':'up',id.startsWith('pa')?'施放':'部署','class="card-action" data-demo')}</div>`).join('')}</div></section><section class="battle-actions"><span>準備好了嗎？</span>${btn('play','開始戰鬥','class="battle-go" data-demo')}<small>操作位置示意</small></section></footer></div>`}
const scene=new URLSearchParams(location.search).get('scene')||'battle';document.body.dataset.scene=scene;document.getElementById('app').innerHTML=scene==='cards'?showcase():scene==='story'?story():battlefield();
const viewer=document.getElementById('viewer');let viewed='p1',flipped=false;
function renderViewer(){document.getElementById('viewcard').innerHTML=card(viewed,{size:'reader',back:flipped,interactive:false});document.getElementById('flip').innerHTML=icon('flip');document.getElementById('flip').setAttribute('aria-label',flipped?'翻到正面':'翻到背面');document.getElementById('close').innerHTML=icon('close')}
function notify(){const n=document.getElementById('notice');n.textContent='設計預覽：此操作尚未連接遊戲';n.classList.add('visible');clearTimeout(window.noticeTimer);window.noticeTimer=setTimeout(()=>n.classList.remove('visible'),2200)}
document.addEventListener('click',e=>{const c=e.target.closest('[data-card]');if(c){viewed=c.dataset.card;flipped=false;renderViewer();viewer.showModal()}if(e.target.closest('[data-demo]'))notify()});document.getElementById('close').onclick=()=>viewer.close();document.getElementById('flip').onclick=()=>{flipped=!flipped;renderViewer()};viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
if(scene==='story'){
 const lines=['你好，尊敬的勇者大人，歡迎來到我的家園。','我是淮德島的守護神，自然之靈希莉亞。使用召喚儀式帶你來到此地，是因為我們遇到了大危機。','最近一段時間，島上來了一群不速之客。他們肆意破壞自然環境，還殺害了許多島上的生靈。儘管我的子民們奮力抵抗，依舊無法阻止這座島嶼邁向死亡的步伐。'];let line=0;
 function showLine(i){line=i;document.getElementById('story-line').textContent=lines[i];document.getElementById('story-progress').textContent=(i===0?'1':i===1?'3':'4')+' / 9';document.getElementById('prev-story').disabled=i===0;document.getElementById('next-story').disabled=i===2;document.querySelectorAll('[data-line]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.line===(i===2?'long':'short')))}
 document.getElementById('next-story').onclick=()=>showLine(Math.min(line+1,2));document.getElementById('prev-story').onclick=()=>showLine(Math.max(line-1,0));document.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>showLine(b.dataset.line==='long'?2:0));document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')showLine(Math.min(line+1,2));if(e.key==='ArrowLeft')showLine(Math.max(line-1,0))});
}
if(scene==='battle')document.querySelectorAll('[data-deck]').forEach(b=>b.onclick=()=>{const shop=b.dataset.deck==='shop';document.querySelectorAll('[data-deck]').forEach(x=>x.setAttribute('aria-pressed',x===b));document.querySelector('.shop-tools').hidden=!shop;const ids=shop?['p1','p2','pa1','p4','p7']:['p3','p4','p6','pa1','pa2'];document.querySelector('.hand-rail').innerHTML=ids.map(id=>`<div class="hand-entry">${card(id,{size:'hand'})}${btn(shop?'cart':id.startsWith('pa')?'bolt':'up',shop?String(cards[id].cost):id.startsWith('pa')?'施放':'部署','class="card-action" data-demo')}</div>`).join('')});

if(scene==='battle'){
 document.getElementById('app').insertAdjacentHTML('beforeend','<aside class="rotate-notice"><h1>把島嶼橫過來</h1><p>手機戰場以橫向呈現，請旋轉裝置。</p><p>也可以回到設計預覽入口，選擇「手機橫向」查看完整構圖。</p><a href="index.html" target="_top">回到預覽入口</a></aside>');
 document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>document.querySelector('.hand-rail').scrollBy({left:Number(b.dataset.scroll)*132,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
 const portraitMode=matchMedia('(orientation:portrait) and (max-width:1000px)');
 function syncHeading(){for(const [selector,active] of [['.brand',!portraitMode.matches],['.rotate-notice',portraitMode.matches]]){const parent=document.querySelector(selector),old=parent.querySelector('h1,b'),next=document.createElement(active?'h1':'b');next.textContent=old.textContent;old.replaceWith(next)}}
 syncHeading();portraitMode.addEventListener('change',syncHeading);
}
