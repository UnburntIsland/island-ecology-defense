const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const palettes={native:['#41634b','#19392d'],invader:['#884547','#4d2729'],action:['#805c30','#49351f'],field:['#396579','#203d4c'],divine:['#78642f','#443a24']};
const classes={plant:'植物',mammal:'哺乳類',bird:'鳥類',amphibian:'兩棲類',reptile:'爬蟲類',insect:'昆蟲',mollusk:'軟體動物',fish:'魚類'};
const key=c=>c.id==='divine'?'divine':c.type==='unit'?(c.faction||'invader'):c.type;
const kind=c=>c.id==='divine'?'特殊餽贈':c.id?.startsWith('token_')?'衍生單位':c.type==='unit'?classes[c.bioClass]||'物種':c.type==='field'?'場地卡':'行動卡';
const side=c=>c.id==='divine'?'遊戲設定':c.faction==='native'?'原生陣營':'外來陣營';
function parts(c,keywords={}){
 const text=c.text||'無額外效果',s=c.star||1;
 if(c.abilityLockedV24)return ['教學階段',text];
 if(/^(守護|生長)/.test(text))return [text,text.split('，').map(k=>keywords[k]).filter(Boolean).join('')];
 if(/^(格檔|潛伏|凱旋)：/.test(text))return [text,(keywords[text.split('：')[0]]||'').replaceAll('X',s)];
 const colon=text.indexOf('：');if(colon!==-1){const k=text.slice(0,colon),t={'閃亮登場':'打出時','突襲':'戰鬥開始','亡語':'陣亡時','光環':'存活時','屹立':'負傷時'}[k];return [k+(t?' · '+t:''),text.slice(colon+1)]}
 const prefix=['每回合戰鬥開始時，','戰鬥開始時，','本輪戰鬥，','戰鬥中，','打出的當回合，'].find(t=>text.startsWith(t));return prefix?[prefix.slice(0,-1),text.slice(prefix.length)]:['能力效果',text];
}
function render(c,{back=false,mini=false,image='',keywords={},story}={}){
 const [accent,ink]=palettes[key(c)]||palettes.action;
 const head=`<article class="ec-card${back?' ec-back':''}${mini?' ec-mini':''}" data-card-id="${escape(c.id)}" style="--accent:${accent};--ink:${ink}" aria-label="${escape(c.name)}${back?'背面':'正面'}">`;
 const footer=`<footer class="ec-footer"><span>${!back&&c.type==='unit'?icon('star')+(c.star??(c.id.startsWith('token_')?0:1))+' 星':''}</span><span class="ec-brand">島嶼生態保衛戰</span><span>${side(c)}</span></footer>`;
 if(back)return head+`<header class="ec-back-top">淮德島</header><div class="ec-back-heading">${islandMark}<h3>${escape(c.name)}</h3><p>${kind(c)}</p></div><section class="ec-story"><p>${escape(story??narratives[c.id]?.[0]??'這是島嶼生態保衛戰的遊戲角色。')}</p></section>${footer}</article>`;
 const cost=c.id==='divine'||c.id.startsWith('token_')?`<span class="ec-cost special">${c.id==='divine'?'餽贈':'衍生'}</span>`:`<span class="ec-cost" aria-label="費用 ${c.cost}"><b>${c.cost??0}</b>${icon('coin')}<small>費用</small></span>`;
 const stat=(n,k,label,v)=>`<span class="ec-stat${v>=10?' double':''}" aria-label="${label} ${v}" data-v28-stat="${k}">${icon(n)}<b>${v}</b><small>${label}</small></span>`;
 const stats=c.type==='unit'?`<div class="ec-stats">${stat('sword','atk','攻擊',c.atk??0)}${stat('heart','hp','生命',c.curHp??c.hp??0)}</div>`:'';
 const [heading,body]=parts(c,keywords);
 return head+`<div class="ec-art">${cost}<img src="${escape(image)}" alt="${escape(c.name)}完整插畫" draggable="false"></div><div class="ec-ribbon"><div class="ec-name"><h3>${escape(c.name)}</h3><p>${kind(c)} · ${side(c)}</p></div>${stats}</div>${mini?'':`<section class="ec-ability"><h4>${escape(heading)}</h4><p>${escape(body)}</p></section>`}${footer}</article>`;
}
return {render,parts,kind,side,narratives,sources,palettes};
