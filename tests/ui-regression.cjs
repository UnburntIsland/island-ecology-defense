// No browser dependencies. Compare deterministic battles against the pre-UI revision.
// Run: node tests/ui-regression.cjs [baseline git revision]
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const path = require('node:path');
const root = path.join(__dirname, '..');
const current = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const baseline = execFileSync('git', ['show', `${process.argv[2] || '5fa62d0'}:index.html`], {cwd:root,maxBuffer:32*1024*1024,encoding:'utf8'});
function between(source, start, end){const i=source.indexOf(start);assert.ok(i>=0,start);const j=source.indexOf(end,i);assert.ok(j>i,end);return source.slice(i,j).replace(/\r\n/g,'\n')}
function load(source){
 const data=between(source,'const PLAYER_UNITS=', 'const QUIZ_');
 const rules=between(source,'function createBattleRules(){','const BattleRulesV18=');
 return vm.runInNewContext(data+'\n'+rules+'\n({R:createBattleRules(),cards:[...P_CARDS,...A_CARDS]})');
}
for(const [start,end] of [
 ['function createBattleRules(){','const BattleRulesV18='],
 ['function createSmartAI(R){','const SmartAIv18='],
 ['function purchase(side,index){','function autoMergeOnPurchase'],
 ['function autoMergeOnPurchase(cardId){','function buyShopCard'],
 ['function playHand(index, desiredSlot=null){','function sellHand'],
 ['const PLAYER_UNITS=','const QUIZ_']
]) assert.equal(between(current,start,end),between(baseline,start,end),`Gameplay changed: ${start}`);
for(const match of current.matchAll(/<script(?![^>]*type=)[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
const assets=s=>[...s.matchAll(/data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=]+/g)].map(m=>m[0]);
assert.deepEqual(assets(current),assets(baseline),'Embedded artwork must remain unchanged');
const old=load(baseline),next=load(current);
function fixture(cards,n){
 const make=(id,i)=>{const c=cards.find(c=>c.id===id);const star=[1,2,4][(n+i)%3];return {...c,star,atk:c.atk*star,hp:c.hp*star}};
 const side=(prefix)=>({hp:20-(n%8),level:1+n%3,board:Array.from({length:1+n%6},(_,i)=>make(prefix+(1+(n+i)%10),i)),queue:cards.filter(c=>c.id.startsWith(prefix+'a')).slice(0,n%6),field:cards.find(c=>c.id===prefix+'f'+(1+n%2)),hand:prefix==='a'?[make('a2',0),make('a4',1)]:[]});
 return {p:side('p'),a:side('a'),buffs:n%2?[{kind:'team_hp',value:1}]:[{kind:'position',value:1}],nextId:100};
}
function run(engine,input,seed){const s=engine.create(input,engine.rng(seed)),events=[];for(const event of engine.battle(s))events.push(JSON.parse(JSON.stringify(event)));return JSON.stringify({events,result:s.result,p:s.p,a:s.a,kills:s.kills,homeHeal:s.homeHeal})}
for(let n=0;n<24;n++)for(const seed of [1,7,42,2026])assert.equal(run(next.R,fixture(next.cards,n),seed),run(old.R,fixture(old.cards,n),seed),`Battle fixture ${n}, seed ${seed}`);
// Replacement is a UI confirmation only: canceling or a stale phase must not play a card.
const nodes=new Map(),played=[],dialogs=[];
const get=id=>{if(!nodes.has(id))nodes.set(id,{});return nodes.get(id)};
const card={id:'pf1',name:'Corridor',type:'field'},previous={id:'pf2',name:'Food web'};
const ui={G:{phase:'deploy',p:{hand:[card],field:previous}},tutorialV24:null,$:get,showModal:id=>dialogs.push(id),hideModal:()=>{},playHand:i=>played.push(i)};
vm.createContext(ui);
vm.runInContext(between(current,'function confirmSaleV38(', 'function renderOperationHintsV38('),ui);
ui.requestPlayV38(card);assert.equal(played.length,0);assert.equal(dialogs.length,1);
ui.G.phase='combat';get('v38ReplaceConfirm').onclick();assert.equal(played.length,0);
ui.G.phase='deploy';ui.requestPlayV38(card);get('v38ReplaceConfirm').onclick();assert.deepEqual(played,[0]);
ui.G.p.hand=[];ui.requestPlayV38(card);assert.deepEqual(played,[0]);
let sold=0,onBlur;
const button={dataset:{},textContent:'Sell',isConnected:true,getAttribute:()=>null,setAttribute(){},removeAttribute(){},addEventListener:(type,fn)=>{if(type==='blur')onBlur=fn}};
ui.confirmSaleV38(button,()=>sold++);assert.equal(sold,0);onBlur();ui.confirmSaleV38(button,()=>sold++);assert.equal(sold,0);ui.confirmSaleV38(button,()=>sold++);assert.equal(sold,1);
console.log('PASS: syntax, unchanged gameplay/AI/economy/artwork, 96 seeded battle comparisons, sale and field-replacement safeguards.');
