/* Shared V44 card presentation. No game state or randomness. */
/* Embedded Huninn font license:
[Kosugi Maru]
Copyright (c) 2010 MOTOYA CO.,LTD.      

[Varela Round]
Copyright (c) 2011-2016 The Varela Round Project Authors (https://github.com/alefalefalef/Varela-Round-Hebrew/), with Reserved Font Names 'Varela' and 'Varela Round'.      

[jf open huninn]
Copyright (c) 2020-2024 The jf open huninn font is redistributed by justfont Co., LTD., with Reserved Font Names 'open huninn' and 'huninn'. under SIL Open Font License. The Hanzi part of this project was derived from Kosugi Maru under Apache-2.0 (https://www.apache.org/licenses/LICENSE-2.0).


This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

*/
const CardDesignV44=(()=>{
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

const islandMark=`<svg class="island-mark" viewBox="0 0 120 100" role="img" aria-label="淮德島識別標誌"><path d="M20 64a43 43 0 1 1 80 0" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="83" cy="27" r="6" fill="currentColor"/><path d="m19 59 24-29 18 21 11-13 29 21Z" fill="currentColor"/><path d="m43 30 9 26 9-5" fill="none" stroke="var(--accent)" stroke-width="3"/><path d="M14 68c12-9 22 9 34 0s22 9 34 0 16-4 24 0M26 79c10-7 18 7 28 0s18 7 28 0 8-3 12 0M42 90c8-5 13 5 21 0s11 0 15 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;


// Original short narratives based on the linked public sources; not quotations.
// Source links are shown outside the collectible card, as requested.
const sources = {
 water:['林業試驗所｜台灣水韭孢子庫復育研究','https://www.tfri.gov.tw/News_Content2.aspx?n=7490&s=6990'],
 lily:['新北市政府｜台灣百合','https://www.ntpc.gov.tw/ch/home.jsp?dataserno=131a86d08f490d2edadbd1959b227d3e&id=e8ca970cde5c00e1'],
 cypress:['台灣山林悠遊網｜阿里山巨木群棧道','https://recreation.forest.gov.tw/Trail/RT?tr_id=094'],
 frog:['生物多樣性研究所｜諸羅樹蛙如何繁殖','https://www.tbri.gov.tw/view.php?id=16&theme=qa'],
 pangolin:['玉山國家公園｜穿山甲','https://www.ysnp.gov.tw/Child/StaticPage/AK004'],
 serow:['玉山國家公園｜臺灣野山羊','https://www.ysnp.gov.tw/Child/StaticPage/AK002'],
 magpie:['臺北市立動物園｜臺灣藍鵲認真育幼','https://www.zoo.gov.taipei/News_Content.aspx?n=BD065B2FA7782989&s=B6C0CE0605F7D6E2'],
 cat:['臺北市立動物園｜石虎','https://www.zoo.gov.taipei/News_Content.aspx?n=CC7DF0D6519201FD&s=327A85C2DDFE5057&sms=D5A439C2736D52BF'],
 hawk:['台灣猛禽研究會｜鳳頭蒼鷹巢位觀察問答','https://raptor.org.tw/research/content/159'],
 bear:['玉山國家公園｜臺灣黑熊生態研究','https://www.ysnp.gov.tw/StaticPage/Science'],
 ant:['國家紅火蟻防治中心｜生物學資訊','https://fireant.aphia.gov.tw/RedFireAnt/FrontEnd/Knowledge/Biology'],
 antMonitor:['國家紅火蟻防治中心｜偵察與監測','https://fireant.aphia.gov.tw/RedFireAnt/FrontEnd/Knowledge/Monitor'],
 transport:['國家紅火蟻防治中心｜入侵與擴散','https://fireant.aphia.gov.tw/RedFireAnt/FrontEnd/Knowledge/Intrusion'],
 snail:['國立海洋生物博物館｜水田與溝渠生態環境','https://www.nmmba.gov.tw/cp.aspx?n=175f59d3f37f17b5&s=8B45B0B9745282AD'],
 spotfrog:['臺北市立動物園｜猛禽加入卻斑行動','https://www.zoo.gov.taipei/News_Content.aspx?n=BD065B2FA7782989&s=C7D32E9747EC3492'],
 mikania:['桃園市政府農業局｜小花蔓澤蘭簡介','https://agriculture.tycg.gov.tw/News_Content.aspx?n=10622&s=1239615'],
 removal:['林業保育署嘉義分署｜社區清除小花蔓澤蘭','https://chiayi.forest.gov.tw/news/0079212'],
 acacia:['臺中市政府農業局｜銀合歡辨識及防除','https://www.agriculture.taichung.gov.tw/12889/13054/13102/841175/2380915/2414299'],
 iguana:['林業保育署｜綠鬣蜥移除防治專區','https://www.forest.gov.tw/0009777'],
 turtle:['臺北市生物多樣性資料庫｜常見外來種','https://biodiv.gov.taipei/page/about/index.aspx?kind=47&lang=US'],
 pleco:['臺北市立動物園｜水面下的「鼠」患','https://www.gov.taipei/News_Content.aspx?n=F0DDAF49B89E9413&s=3C69E79CA8B31636&sms=72544237BBE4C5F6'],
 ibis:['臺北市生物多樣性資料庫｜埃及聖䴉','https://biodiv.gov.taipei/page/additional/show.aspx?kw=%E5%9F%83%E5%8F%8A%E8%81%96%E4%B4%89&num=51'],
 giantSnail:['農業知識入口網｜非洲大蝸牛等軟體動物','https://kmweb.moa.gov.tw/subject/subject.php?id=22146'],
 monitor:['林業保育署嘉義分署｜外來入侵種通報','https://chiayi.forest.gov.tw/0000474'],
 management:['林業保育署｜外來種管理工作現況','https://www.forest.gov.tw/DataResource/asmanagement'],
 restoration:['林業保育署臺東分署｜卑南溪口植被復育','https://taitung.forest.gov.tw/sitemap/news/0075539'],
 corridor:['臺灣國家公園主題網｜陽明山國家公園動物廊道','https://www.taiwan.nps.gov.tw/home/zh-tw/topic/18609'],
 foodweb:['國家教育研究院愛學網｜生物與環境間的交互作用','https://stv.naer.edu.tw/watch/300563'],
 disturbance:['林業保育署花蓮分署｜外來入侵種防治','https://hualien.forest.gov.tw/0000087']
};
// Each entry: story, source keys. The three special units are explicitly fiction.
const narratives = {
 p1:['夢幻湖裡，台灣水韭的葉子帶著孢子落下。小小孢子藏進湖底泥土，等到條件合適，就有機會長出新的水韭。',['water']],
 p2:['海風吹過山坡，台灣百合開出白色的喇叭花，飄來淡淡香氣。這是台灣特有的植物，從海邊到山區，都有機會遇見它。',['lily']],
 p3:['霧氣繞過山林，高大的紅檜靜靜站著。走近樹幹，還能找到苔蘚和蕨類！一棵大樹，也能讓許多小植物找到住處。',['cypress']],
 p4:['落葉底下藏著一團白色泡泡，裡面是諸羅樹蛙的卵！蛙爸爸和蛙媽媽用後腳攪出泡沫，把小生命安放在這個泡泡窩裡。',['frog']],
 p5:['穿山甲用前腳挖開蟻窩，再伸出黏黏的長舌頭，把螞蟻帶進嘴裡。遇到危險時，牠會縮成一顆球，讓鱗片保護自己。',['pangolin']],
 p6:['山坡上的岩石高低不平，台灣野山羊卻能穩穩走過。牠的蹄子適合攀走岩壁，一路尋找嫩葉和青草，在山林裡自在生活。',['serow']],
 p7:['樹上的小藍鵲肚子餓了！爸媽忙著找食物，有些哥哥姐姐也留下來照顧弟妹、守護鳥巢。這就是藍鵲家族的「合作育雛」。',['magpie']],
 p8:['夜幕降臨，石虎獨自走進林間，尋找小動物當晚餐。牠不只會爬樹，也擅長游泳；白天則常在樹洞或岩縫裡休息。',['cat']],
 p9:['樹上的鳥巢裡，小蒼鷹正等著開飯。鳳頭蒼鷹爸媽會捕捉鳥類或鼠類等獵物，把食物帶回巢中，餵養還在長大的孩子。',['hawk']],
 p10:['森林裡，台灣黑熊媽媽帶著小熊尋找食物。牠們會吃果實，也吃其他食物；跟在媽媽身邊的小熊，慢慢學會在山林裡生活。',['bear']],
 a1:['草地上隆起一座小土丘，裡面可能住著紅火蟻。牠們會用泥土築巢，也築出通往外面的覓食蟻道，尋找周圍的食物。',['ant','antMonitor']],
 a2:['水邊出現一團粉紅色的卵，那可能是福壽螺留下的。牠們原本被引進養殖，後來進入野外；長大後啃食植物，也會吃掉農作物。',['snail']],
 a3:['一盆植物搬了家，黏在上面的泡沫卵塊也可能跟著旅行。斑腿樹蛙的卵泡會附著在植物上，讓牠們隨著移植擴散到新地方。',['spotfrog']],
 a4:['小花蔓澤蘭攀著樹幹往上長，一層又一層蓋住樹冠。下面的葉子照不到足夠陽光，漸漸變得虛弱，森林也因此受到影響。',['mikania']],
 a5:['銀合歡的種子落進土裡，等待長成新苗。即使大樹被移除，地裡的小苗還可能冒出來；復育人員得持續照顧，讓原生樹木長回來。',['acacia']],
 a6:['綠鬣蜥在樹叢間尋找葉片、花朵和果實。牠原本來自中南美洲，因寵物飼養來到台灣，逸出或被棄養後，逐漸在野外繁殖。',['iguana']],
 a7:['陽光照在池邊，紅耳龜爬上岸曬太陽。牠頭側的紅斑很醒目！原本被當成寵物的牠，若被放到野外，可能影響當地水生生物。',['turtle']],
 a8:['水族箱裡的琵琶鼠不只吃藻類，也會吃飼料。牠其實是多種魚的通稱！被棄養進河裡後，這些適應力強的魚可能擠壓原生魚的空間。',['pleco']],
 a9:['河口、魚塭或沼澤邊，曾能見到埃及聖䴉尋找食物的身影。這種以動物為食的鳥，在台灣屬於外來種，濕地是牠活動的環境。',['ibis']],
 a10:['夜裡的草叢潮濕又陰暗，非洲大蝸牛慢慢爬出藏身處，尋找嫩葉。白天牠常躲在落葉或雜草間，等到夜晚再出來活動。',['giantSnail']],
 pa1:['一群大人走進林邊，辨認後清除纏住樹木的小花蔓澤蘭。大家一起動手，讓被覆蓋的枝葉重新接近陽光，減輕入侵植物的影響。',['removal']],
 pa2:['河邊種下了在地原生樹木，慢慢長成綠色的庇護所。調查相機拍到野生動物來訪；修復牠們的住處，是讓生命回來的重要一步。',['restoration']],
 pa3:['散步時發現不熟悉的生物，可以把線索告訴大人，協助通報。讓專業人員及早確認，就有機會在外來種大量擴散前採取行動。',['monitor']],
 pa4:['調查員先確認是哪一種生物、出現在哪裡，再決定怎麼處理。防治不是看見陌生動物就移除，而是先認識牠，再選擇合適的方法。',['management']],
 pa5:['外來種已經擴散時，保育團隊得一起調查、安排防治，還要追蹤後續變化。守護整片棲地，需要合作，也需要持續觀察。',['management']],
 aa1:['一批帶土的植物準備出發，土裡卻可能藏著紅火蟻。牠們能搭上人類搬運土壤或植栽的旅程，悄悄到達原本沒有牠們的地方。',['transport']],
 aa2:['水族箱裡的魚被倒進河川，看似獲得自由，卻可能讓原生生物失去空間。照顧寵物也包括不任意放生，別讓牠成為河裡的新入侵者。',['pleco']],
 aa3:['外來生物到了新地方，如果環境合適、又少了天敵和競爭者，數量就可能快速增加。牠們越來越多，原生生物能用的資源也可能減少。',['monitor']],
 aa4:['林邊出現缺口，陽光照進原本遮蔭的地方。喜歡光亮環境的小花蔓澤蘭，可能趁機攀上樹木；環境的改變，也會改變誰容易長大。',['disturbance']],
 aa5:['水邊一團團粉紅色的卵，是福壽螺留下的。這種外來螺類繁殖力強，進入水田後，長大的螺會啃食植物，讓農作物受到影響。',['snail']],
 pf1:['馬路把動物的住處分開了。連接棲地的綠帶和合適的動物通道，能幫助牠們往來；相機記下經過的身影，讓人知道通道有沒有被使用。',['corridor']],
 pf2:['植物用陽光製造養分，動物再從食物獲得能量。誰吃誰的關係彼此連接，就像一張食物網；一片棲地裡，許多生命都和彼此有關。',['foodweb']],
 af1:['林地邊緣變得開闊，陽光和水分充足的地方，可能讓小花蔓澤蘭快速生長。當原本的環境被改變，入侵植物就可能找到擴張的機會。',['disturbance']],
 af2:['同樣來到陌生地方，有些生物留下來，有些卻無法生存。氣候和資源是否合適，加上天敵與競爭者的影響，都會改變牠們的發展。',['monitor']],
 divine:['在淮德島的遊戲故事裡，自然之母送來一份餽贈。守護者在佈署時施放，讓這份力量在戰鬥開始時，幫忙迎向敵方的挑戰。',[]],
 token_larva:['在淮德島的遊戲裡，卡牌效果能召喚出幼體，成為暫時的夥伴。輪到牠行動時，牠不會攻擊，而是提升攻擊和生命，慢慢累積力量。',[]],
 token_vine:['遊戲中的蔓藤，是卡牌效果召喚來的暫時單位。輪到它行動時，它會先提升攻擊和生命。這株蔓藤是遊戲設定，用來呈現生長的力量。',[]]
};

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

})();