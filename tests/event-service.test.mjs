import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {sanitizeBoard,syncLeaderboard} from '../scripts/sync-leaderboard.mjs';

const source=readFileSync(new URL('../event/apps-script/Code.gs',import.meta.url),'utf8');
test('setup resumes a form without destination, is idempotent, and preserves unrelated errors',()=>{
 const props=new Map([['FORM_ID','existing-form']]),titles=[];let destination=null,created=0,linked=0,unrelated=false;
 const form={getId:()=> 'existing-form',setDescription(){},setCollectEmail(){},setLimitOneResponsePerUser(){},supportsAdvancedResponderPermissions:()=>false,getItems:()=>titles.map(x=>({getTitle:()=>x})),addTextItem:()=>({setTitle(x){titles.push(x);return this},setRequired(){return this}}),getDestinationId(){if(unrelated)throw Error('Permission denied');if(!destination)throw Error('這個表單目前沒有回覆目標。');return destination},setDestination(type,id){linked++;destination=id},getEditUrl:()=> 'https://example.test/form'};
 const sheet={getId:()=> 'existing-sheet'};
 const context=vm.createContext({console:{log(){}},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},FormApp:{openById:()=>form,create(){throw Error('Must not recreate form')},DestinationType:{SPREADSHEET:'sheet'}},SpreadsheetApp:{create(){created++;return sheet},openById:()=>sheet}});
 vm.runInContext(source,context);context.setupEvent();context.setupEvent();
 assert.equal(created,1);assert.equal(linked,1);assert.equal(titles.length,15);
 destination=null;context.setupEvent();assert.equal(created,1);assert.equal(linked,2);
 unrelated=true;assert.throws(()=>context.setupEvent(),/Permission denied/);assert.equal(linked,2);
});
const fixture=(overrides={})=>({runId:'11111111-1111-4111-8111-111111111111',receipt:'22222222-2222-4222-8222-222222222222',participantId:'33333333-3333-4333-8333-333333333333',eventId:'island-science-2026',name:'海風小隊',score:2500,outcome:'島嶼失守',round:8,hp:8,aiHp:13,kills:48,merges2:9,merges4:3,gameVersion:'V47-event-1',source:'kiosk-a',...overrides});
function service(){
 const store=[],cache=new Map(),props=new Map([['FORM_ID','test-form']]);let locked=false;
 const item=key=>({getTitle:()=>key,asTextItem:()=>({createResponse:value=>({getItem:()=>item(key),getResponse:()=>value})})});
 const form={getResponses:()=>store,getItems:()=>context.FIELDS.map(item),createResponse:()=>{const responses=[];const res={withItemResponse:r=>{responses.push(r);return res},submit:()=>{store.push({getItemResponses:()=>responses,getTimestamp:()=>new Date('2026-11-07T01:00:00Z'),getId:()=>String(store.length)});return res}};return res}};
 const context=vm.createContext({console,FormApp:{openById:()=>form},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},CacheService:{getScriptCache:()=>({get:k=>cache.get(k)||null,put:(k,v)=>cache.set(k,v),remove:k=>cache.delete(k)})},LockService:{getScriptLock:()=>({tryLock:()=>{locked=true;return true},hasLock:()=>locked,releaseLock:()=>locked=false})},ContentService:{MimeType:{JSON:'json',JAVASCRIPT:'js'},createTextOutput:text=>({text,setMimeType(){return this}})}});
 vm.runInContext(source,context);
 const parse=out=>JSON.parse(out.text);
 return {context,store,cache,props,post:r=>parse(context.doPost({parameter:{record:JSON.stringify(r)}})),get:p=>parse(context.doGet({parameter:p}))};
}
test('unchanged original score formula: 8-round defeat, victory, tie, negative HP',()=>{
 const s=service();assert.equal(s.post(fixture()).ok,true);
 for(const [hp,aiHp,outcome] of [[20,0,'守護成功'],[10,10,'平手'],[-4,8,'島嶼失守']]){
  const score=(hp>aiHp?500:0)+Math.max(0,hp)*20+48*30+9*50+3*150;
  assert.doesNotThrow(()=>s.context.validate_(fixture({hp,aiHp,outcome,score})));
 }
 assert.throws(()=>s.context.validate_(fixture({score:99999})),/SCORE_MISMATCH/);
});
test('POST creates one Form response, repeated identical run is idempotent',()=>{
 const s=service();assert.equal(s.post(fixture()).ok,true);assert.equal(s.post(fixture()).ok,true);assert.equal(s.store.length,1);
 assert.equal(s.post(fixture({name:'別人'})).error,'RUN_CONFLICT');assert.equal(s.store.length,1);
});
test('receipt confirms storage without exposing nickname or private details',()=>{
 const s=service(),r=fixture();s.post(r);
 const out=s.get({action:'status',eventId:r.eventId,runId:r.runId,receipt:r.receipt});assert.deepEqual(out,{ok:true,found:true,score:2500});
 assert.equal(s.get({action:'status',eventId:r.eventId,runId:r.runId,receipt:r.participantId}).found,false);
 const jsonp=s.context.doGet({parameter:{action:'status',eventId:r.eventId,runId:r.runId,receipt:r.receipt,callback:'islandAck_abc'}}).text;
 assert.match(jsonp,/^islandAck_abc\(/);assert.ok(!jsonp.includes(r.name));
 const injection=s.context.doGet({parameter:{action:'status',eventId:r.eventId,runId:r.runId,receipt:r.receipt,callback:'alert(1)//'}}).text;
 assert.doesNotThrow(()=>JSON.parse(injection));
});
test('reject wrong event, invalid numbers, malformed nicknames and version',()=>{
 for(const bad of [{eventId:'other'},{hp:1.5},{round:9},{kills:-1},{name:'=IMPORTXML(1)'},{name:'<script>'},{name:'太'.repeat(17)},{name:'\u0000'},{gameVersion:'V37'},{source:'tutorial'}]){
  const s=service();assert.equal(s.post(fixture(bad)).ok,false);assert.equal(s.store.length,0);
 }
});
test('best per participant; shared nickname stays separate; ties use competition ranks',()=>{
 const s=service();const rows=[fixture(),fixture({runId:'other',score:2400}),fixture({participantId:'44444444-4444-4444-8444-444444444444',runId:'55555555-5555-4555-8555-555555555555'}),fixture({participantId:'66666666-6666-4666-8666-666666666666',runId:'77777777-7777-4777-8777-777777777777',score:2470,kills:47})].map(r=>({...r,receivedAt:'2026-11-07T01:00:00Z'}));
 const out=JSON.parse(JSON.stringify(s.context.publicBoard_(rows)));
 assert.equal(out.totalPlayers,3);assert.deepEqual(out.players.map(x=>x.rank),[1,1,3]);
 assert.equal(out.players[0].name,out.players[1].name);assert.ok(!JSON.stringify(out).includes('receipt'));
 s.props.set('HIDDEN_RUN_IDS',JSON.stringify([rows[0].runId]));assert.equal(s.context.publicBoard_(rows).totalPlayers,2);
});
test('burst limiter does not block the retry of a completed run',()=>{
 const s=service();s.post(fixture());assert.equal(s.post(fixture()).ok,true);
 assert.equal(s.post(fixture({runId:'55555555-5555-4555-8555-555555555555'})).error,'PLEASE_WAIT');
});
test('sync strips all unexpected/private fields and rejects unsorted or misranked data',()=>{
 const data={schemaVersion:1,eventId:'event',updatedAt:'2026-11-07T00:00:00Z',totalPlayers:1,secret:'do-not-publish',players:[{rank:1,name:'小島',score:2500,outcome:'島嶼失守',round:8,receipt:'secret',participantId:'private'}]};
 const result=sanitizeBoard(data,'event');assert.ok(!JSON.stringify(result).includes('secret'));assert.ok(!JSON.stringify(result).includes('participantId'));
 assert.throws(()=>sanitizeBoard({...data,eventId:'wrong'},'event'));
 assert.throws(()=>sanitizeBoard({...data,players:[{...data.players[0],rank:2}]},'event'));
 assert.throws(()=>sanitizeBoard({...data,players:[{...data.players[0],score:'2500'}]},'event'));
});
test('failed synchronization never overwrites a last good snapshot',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'island-event-'));const output=join(dir,'leaderboard.json');writeFileSync(output,'last-good');
 try{
  await assert.rejects(syncLeaderboard({endpoint:'https://script.google.com/macros/s/test/exec',eventId:'event',output,fetchImpl:async()=>({ok:false,status:503})}));
  assert.equal(readFileSync(output,'utf8'),'last-good');
  await assert.rejects(syncLeaderboard({endpoint:'https://script.google.com/macros/s/test/exec',eventId:'event',output,fetchImpl:async()=>({ok:true,text:async()=>'<html>sign in</html>'})}));
  assert.equal(readFileSync(output,'utf8'),'last-good');
 }finally{rmSync(dir,{recursive:true,force:true})}
});
