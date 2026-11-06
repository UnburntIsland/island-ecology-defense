import {Browser} from 'file:///C:/Users/apple/.codex/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const root='deliverables/淮德島卡牌圖片';for(const p of ['01_基本卡正面','02_卡背','03_升星正面'])mkdirSync(root+'/'+p,{recursive:true});
const cards=JSON.parse(readFileSync('design-previews/island-tabletop/cards-all-data.json','utf8'));
const b=await Browser.launch();const p=await b.newPage({width:420,height:587,dsf:3});
const manifest=[],checks=[];
try{
 await p.goto('http://127.0.0.1:8765/card-design/print.html');
 for(const c of cards){
  for(const star of c.variants.length?[1,2,4]:[1]){
   const stem=`${c.id}_${c.name}${c.variants.length?'_'+star+'星':''}`,file=(star===1?'01_基本卡正面':'03_升星正面')+'/'+stem+'.png';
   const result=await p.eval(async({id,star})=>await renderPrintCard(id,star),{id:c.id,star});checks.push({id:c.id,star,face:'front',result});
   await p.screenshot({path:root+'/'+file,format:'png',clip:{x:0,y:0,width:420,height:586+2/3}});
   manifest.push({id:c.id,name:c.name,star,front:file,back:'02_卡背/'+c.id+'_'+c.name+'_背面.png',base:star===1});
  }
  const result=await p.eval(async id=>await renderPrintCard(id,1,true),c.id);checks.push({id:c.id,face:'back',result});
  await p.screenshot({path:root+'/02_卡背/'+c.id+'_'+c.name+'_背面.png',format:'png',clip:{x:0,y:0,width:420,height:586+2/3}});
  console.log('Exported '+c.id);
 }
}finally{await b.close()}
writeFileSync(root+'/卡牌清單.json',JSON.stringify(manifest,null,2));writeFileSync('.taste-skill/v44/print-checks.json',JSON.stringify(checks,null,2));
const bad=checks.filter(c=>c.result.some(x=>x.sw>x.w+1||x.sh>x.h+1));console.log(JSON.stringify({cards:cards.length,fronts:manifest.length,images:checks.length,overflow:bad}));process.exit(bad.length?1:0);
