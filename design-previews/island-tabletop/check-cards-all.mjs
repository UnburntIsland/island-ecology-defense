// Bounded visual/content audit of previews only. No battle/playthrough simulation.
import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root='design-previews/island-tabletop/',out=root+'renders-all';mkdirSync(out,{recursive:true});
const data=JSON.parse(readFileSync(root+'cards-all-data.json','utf8'));
const b=await Browser.launch(),checks=[],interactions=[];
try{
 for(const [device,width,height] of [['desktop',1440,1000],['landscape',844,390],['short-landscape',667,375],['portrait',390,844]]){
  const p=await b.newPage({width,height});await p.goto('http://127.0.0.1:8765/'+root+'cards-all.html',{settleMs:200});
  await p.eval(async()=>{await document.fonts.ready});
  for(const c of data){for(const v of c.variants.length?c.variants:[c]){
   await p.eval(({id,star})=>{const select=document.getElementById('card-select');select.value=id;select.dispatchEvent(new Event('change'));if(star)document.querySelector(`[data-star="${star}"]`).click()},{id:c.id,star:v.star});
   const result=await p.eval(async()=>{
    await Promise.all([...document.querySelectorAll('.collectible img')].map(i=>i.decode()));
    const cards=[...document.querySelectorAll('.collectible')];
    const failures=[];
    for(const card of cards){const cr=card.getBoundingClientRect();if(card.scrollHeight>card.clientHeight+1)failures.push('card-overflow');
     for(const e of card.querySelectorAll('h3,h4,p,.stat,.card-footer,.back-footer')){const r=e.getBoundingClientRect();if(e.scrollWidth>e.clientWidth+1)failures.push('text-overflow:'+e.className);if(r.bottom>cr.bottom+1||r.right>cr.right+1||r.left<cr.left-1)failures.push('bounds:'+e.className)}
    }
    const front=document.querySelector('.bold-card'),back=document.querySelector('#reverse-card .back-card'),art=front.querySelector('img');
    const title=front.querySelector('h3').getBoundingClientRect(),stats=front.querySelector('.combat-stats')?.getBoundingClientRect();if(stats&&title.right>stats.left+1)failures.push('name-stats-overlap');
    if(document.documentElement.scrollWidth>innerWidth)failures.push('page-overflow');
    if(getComputedStyle(front.querySelector('.name-ribbon')).backgroundColor!==getComputedStyle(back.querySelector('.back-heading')).backgroundColor)failures.push('color-mismatch');
    if(back.querySelector('img,.ecology-note'))failures.push('unwanted-back-content');
    const ability=front.querySelector('.ability'),a=ability.getBoundingClientRect(),text=ability.querySelector('p').getBoundingClientRect();if(text.bottom>a.bottom-5)failures.push('ability-height');
    return {failures,name:front.querySelector('h3').textContent,originalEffect:front.dataset.effectOriginal,stats:[...front.querySelectorAll('.stat b')].map(e=>+e.textContent),cost:front.querySelector('.cost-badge').getAttribute('aria-label'),story:back.querySelector('.story').textContent,art:{width:art.naturalWidth,height:art.naturalHeight,fit:getComputedStyle(art).objectFit},font:document.fonts.check('16px Huninn'),sourceCount:document.querySelectorAll('#story-source a').length};
   });
   if(result.name!==c.name||result.originalEffect!==v.text)result.failures.push('data-mismatch');
   if(c.type==='unit'&&JSON.stringify(result.stats)!==JSON.stringify([v.atk,v.hp]))result.failures.push('stats-mismatch');
   if(!c.id.startsWith('token_')&&c.id!=='divine'&&result.cost!==`費用 ${c.cost}`)result.failures.push('cost-mismatch');
   checks.push({device,id:c.id,star:v.star||0,...result});
   if(['p7','aa5','divine','p10','token_larva'].includes(c.id)&&(v.star===4||!c.variants.length||c.id==='p7'&&v.star===1)){
    await p.eval(()=>document.getElementById('card-detail').scrollIntoView());await p.screenshot({path:`${out}/${device}-${c.id}-${v.star||0}.png`,fullPage:false});
   }
  }}
  interactions.push({device,...await p.eval(()=>{
   const select=document.getElementById('card-select');select.value='p7';select.dispatchEvent(new Event('change'));
   const flip=document.getElementById('flip-card');flip.click();const back=!!document.querySelector('#interactive-card .back-card');flip.click();const front=!!document.querySelector('#interactive-card .bold-card');
   const search=document.getElementById('search');search.value='臺灣藍鵲';search.dispatchEvent(new Event('input'));const found=select.options.length===1&&select.value==='p7';
   search.value='找不到的卡';search.dispatchEvent(new Event('input'));const empty=document.getElementById('card-detail').hidden&&select.disabled&&!document.getElementById('loading-status').hidden;
   search.value='';search.dispatchEvent(new Event('input'));const restored=select.options.length===37&&!document.getElementById('card-detail').hidden;
   const category=document.getElementById('category');const counts={};for(const value of ['native','invader','action','field','special']){category.value=value;category.dispatchEvent(new Event('change'));counts[value]=select.options.length;}
   category.value='all';category.dispatchEvent(new Event('change'));select.value='p1';select.dispatchEvent(new Event('change'));document.getElementById('next').click();const next=select.value==='p2';document.getElementById('previous').click();const previous=select.value==='p1';
   document.querySelector('.catalog-item[data-id="p7"]').click();const catalog=select.value==='p7';
   return {back,front,found,empty,restored,counts,next,previous,catalog};
  }),errors:p.consoleErrors});
  if(device==='desktop'){await p.eval(()=>{window.scrollTo(0,0)});await p.screenshot({path:out+'/desktop-page.png',fullPage:true});}
  await p.close();
 }
 // Same renderer, all first-star faces; contact sheets for visual inspection.
 const p=await b.newPage({width:1150,height:1000});await p.goto('http://127.0.0.1:8765/'+root+'cards-all.html',{settleMs:200});
 for(const [name,ids] of [['native',data.filter(c=>/^p\d/.test(c.id)).map(c=>c.id)],['invader',data.filter(c=>/^a\d/.test(c.id)).map(c=>c.id)],['actions',data.filter(c=>c.type==='action').map(c=>c.id)],['fields-special',data.filter(c=>c.type==='field'||c.id==='divine'||c.id.startsWith('token_')).map(c=>c.id)]]){
  for(const face of ['front','back']){await p.eval(async({ids,face})=>{const mod=await import('./cards-all.js');document.body.innerHTML=`<main style="display:grid;grid-template-columns:repeat(3,350px);gap:25px;padding:25px">${ids.map(id=>mod[face](id,1)).join('')}</main>`;await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))},{ids,face});await p.screenshot({path:`${out}/sheet-${name}-${face}.png`,fullPage:true});}
 }
 await p.close();
}finally{await b.close()}
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const report={checkedAt:new Date().toISOString(),cases:checks.length,failures:checks.filter(c=>c.failures.length),interactions,formalHashes:{index:hash('index.html'),readme:hash('README.md')},checks};
writeFileSync(out+'/checks.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({cases:report.cases,failures:report.failures.map(({device,id,star,failures})=>({device,id,star,failures})),interactions,formalHashes:report.formalHashes},null,2));process.exit(report.failures.length?1:0);
