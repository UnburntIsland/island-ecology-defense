// Bounded source and deterministic engine comparison. No browser or full playthrough.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),{createHash}=require('node:crypto'),Module=require('node:module');
const revision=process.argv[2]||'origin/main';
const commit=execFileSync('git',['rev-parse',revision],{encoding:'utf8'}).trim();
const remote=execFileSync('git',['show',commit+':index.html'],{encoding:'utf8',maxBuffer:32*1024*1024});
const current=fs.readFileSync('index.html','utf8');
// Node 22 bundles Acorn; use it without adding a runtime/game dependency.
const parser=new Module('parity-acorn');
parser._compile(process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'],'parity-acorn');
function inventory(html){
 const definitions=new Map(),assignments=new Map();
 for(const match of html.matchAll(/<script(?![^>]*type=)[^>]*>([\s\S]*?)<\/script>/g)){
  const source=match[1];new vm.Script(source);
  const text=n=>source.slice(n.start,n.end).replace(/\r\n/g,'\n');
  for(const n of parser.exports.parse(source,{ecmaVersion:'latest'}).body){
   if(n.type==='FunctionDeclaration'||n.type==='ClassDeclaration')definitions.set(n.id.name,text(n));
   if(n.type==='VariableDeclaration')for(const d of n.declarations)if(d.id.type==='Identifier')definitions.set(d.id.name,text(d));
   if(n.type==='ExpressionStatement'&&n.expression.type==='AssignmentExpression'){
    const key=text(n.expression.left);if(!assignments.has(key))assignments.set(key,[]);assignments.get(key).push(text(n));
   }
  }
 }
 return {definitions,assignments};
}
const old=inventory(remote),now=inventory(current);
// Explicitly reviewed legacy UI differences, never an open-ended name/version prefix exclusion.
const presentationDefinitions=new Set(['showQuestionBank','rulesMarkup','renderShop','renderRoster','renderHand','handCardMarkup','unitCardMarkup','animateUIV20','renderVitalsV24','TUTORIAL_STEPS_V24','setupTableV27','renderEnemyPreviewV27','queueMergeV27','resetMergeV27','syncFullscreenV28','TASK_HINTS_V29','lessonPagesV29','focusTaskV29','revealCoachV30','coachFaceV31','arrangeGuideV31']);
const presentationAssignments=new Set(['render','IslandCard.prototype.draw','unitCardMarkup','drawViewer','renderShop','renderHand','renderRoster','flipViewedCard','showModal','hideModal','toggleDrawer','setUiScale','renderPrologueV22','setDeckV20','TUTORIAL_STEPS_V24[14].hint','TUTORIAL_STEPS_V24[15].hint','shopCardMarkup','handCardMarkup','renderEnemyPreviewV27','setTutorialStepV24','drawDialoguePageV29','positionCoachV30','revealCoachV30','lessonPagesV29']);
let identicalDefinitions=0,identicalAssignments=0;const reviewed=[];
for(const [key,value]of old.definitions){
 if(!now.definitions.has(key)){assert.equal(key,'lessonPagesBeforeV31','Missing remote definition '+key);reviewed.push(key+' (obsolete pagination alias)');continue}
 if(value===now.definitions.get(key)){identicalDefinitions++;continue}
 assert(presentationDefinitions.has(key),'Unexpected definition change: '+key);reviewed.push(key);
}
for(const [key,value]of old.assignments){
 if(JSON.stringify(value)===JSON.stringify(now.assignments.get(key))){identicalAssignments+=value.length;continue}
 assert(presentationAssignments.has(key),'Unexpected assignment change: '+key);
}
// The lesson order, targets and stage transitions must match; only displayed copy can differ.
const lesson=s=>vm.runInNewContext(s+';TUTORIAL_STEPS_V24').map(({text,hint,next,...state})=>state);
assert.equal(JSON.stringify(lesson(old.definitions.get('TUTORIAL_STEPS_V24'))),JSON.stringify(lesson(now.definitions.get('TUTORIAL_STEPS_V24'))));
const stepNow=now.assignments.get('setTutorialStepV24').join('\n').replace("deckV20=[3,11,12,13,15,21,25].includes(tutorialV24.step)?'hand':'shop';",'');
assert.equal(stepNow,old.assignments.get('setTutorialStepV24').join('\n'),'Tutorial transitions changed');
for(const name of ['queueMergeV27','resetMergeV27']){
 const clean=now.definitions.get(name).replace(' pendingMergesV38.add(result.handId);\n','').replace('pendingMergesV38.clear();','');
 assert.equal(clean,old.definitions.get(name),'Merge logic changed beyond UI notification bookkeeping');
}
function between(source,start,end){const i=source.indexOf(start),j=source.indexOf(end,i);assert(i>=0&&j>i);return source.slice(i,j).replace(/\r\n/g,'\n')}
const protectedRegions=[['const PLAYER_UNITS=','const QUIZ_'],['function createBattleRules(){','const BattleRulesV18='],['function createSmartAI(R){','const SmartAIv18='],['function purchase(side,index){','function autoMergeOnPurchase'],['function autoMergeOnPurchase(cardId){','function buyShopCard'],['function playHand(index, desiredSlot=null){','function sellHand']];
for(const [a,b]of protectedRegions)assert.equal(between(current,a,b),between(remote,a,b),'Gameplay region changed: '+a);
function load(source){return vm.runInNewContext(between(source,'const PLAYER_UNITS=','const QUIZ_')+'\n'+between(source,'function createBattleRules(){','const BattleRulesV18=')+'\n({R:createBattleRules(),cards:[...P_CARDS,...A_CARDS]})')}
const previous=load(remote),next=load(current);
function fixture(cards,n){
 const make=(id,i)=>{const c=cards.find(c=>c.id===id),star=[1,2,4][(n+i)%3];return {...c,star,atk:c.atk*star,hp:c.hp*star}};
 const side=prefix=>({hp:20-n%8,level:1+n%3,board:Array.from({length:1+n%6},(_,i)=>make(prefix+(1+(n+i)%10),i)),queue:cards.filter(c=>c.id.startsWith(prefix+'a')).slice(0,n%6),field:cards.find(c=>c.id===prefix+'f'+(1+n%2)),hand:prefix==='a'?[make('a2',0),make('a4',1)]:[]});
 return {p:side('p'),a:side('a'),buffs:n%2?[{kind:'team_hp',value:1}]:[{kind:'position',value:1}],nextId:100};
}
function run(engine,input,seed){const s=engine.create(input,engine.rng(seed)),events=[];for(const e of engine.battle(s))events.push(JSON.parse(JSON.stringify(e)));return JSON.stringify({events,result:s.result,p:s.p,a:s.a,kills:s.kills,homeHeal:s.homeHeal})}
for(let n=0;n<24;n++)for(const seed of [1,7,42,2026])assert.equal(run(next.R,fixture(next.cards,n),seed),run(previous.R,fixture(previous.cards,n),seed),'Battle mismatch: '+n+'/'+seed);
// This round may only replace the separately built presentation block.
const strip=s=>s.replace(/<style id="card-design-v44">[\s\S]*?<\/style>\n/,'').replace(/<script id="card-design-code-v44">[\s\S]*?<\/script>\n/,'');
assert.equal(strip(current),strip(fs.readFileSync('.taste-skill/v46/before/index.html','utf8')),'V46 changed legacy source outside presentation block');
const report={commit,identicalDefinitions,identicalAssignments,reviewedPresentationDefinitions:reviewed,protectedRegions:protectedRegions.map(x=>x[0]),seededBattles:96,tutorialTargetsAndTransitions:'identical',outsidePresentationBlock:'identical to pre-V46',sha256:createHash('sha256').update(current).digest('hex'),limitations:'Source/engine checks, not an exhaustive UI or eight-round playthrough.'};
fs.mkdirSync('.taste-skill/v46',{recursive:true});fs.writeFileSync('.taste-skill/v46/gameplay-parity.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
