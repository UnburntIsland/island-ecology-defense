import {readFile,writeFile,rename} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function sanitizeBoard(data,eventId) {
  if(data?.schemaVersion!==1||data.eventId!==eventId||!Number.isFinite(Date.parse(data.updatedAt))||!Array.isArray(data.players)||data.players.length>100||!Number.isSafeInteger(data.totalPlayers)||data.totalPlayers<data.players.length)throw Error('Invalid leaderboard envelope');
  let previous=Infinity,rank=0;
  const players=data.players.map((r,i)=>{
    if(typeof r.name!=='string'||!r.name.trim()||Array.from(r.name).length>16||/[\u0000-\u001f\u007f-\u009f<>]/.test(r.name)||!Number.isSafeInteger(r.score)||r.score<0||r.score>10000000||r.score>previous||!Number.isInteger(r.round)||r.round<1||r.round>8||!['守護成功','島嶼失守','平手'].includes(r.outcome))throw Error('Invalid leaderboard row');
    if(r.score!==previous)rank=i+1;
    previous=r.score;
    if(r.rank!==rank)throw Error('Invalid tie ranking');
    // Explicit allowlist: receipt, participant ID and all private fields stay out.
    return {rank,name:r.name,score:r.score,outcome:r.outcome,round:r.round};
  });
  return {schemaVersion:1,eventId,updatedAt:new Date(data.updatedAt).toISOString(),totalPlayers:data.totalPlayers,players};
}
export async function syncLeaderboard({endpoint,eventId,output='leaderboard.json',fetchImpl=fetch}) {
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint))throw Error('Set EVENT_ENDPOINT to the deployed Apps Script /exec URL');
  const url=new URL(endpoint);url.searchParams.set('action','leaderboard');
  const response=await fetchImpl(url,{signal:AbortSignal.timeout(60000),redirect:'follow'});
  if(!response.ok)throw Error('Leaderboard service HTTP '+response.status);
  const raw=await response.text();if(raw.length>300000)throw Error('Response too large');
  const board=sanitizeBoard(JSON.parse(raw),eventId);
  await writeFile(output+'.tmp',JSON.stringify(board,null,2)+'\n');
  await rename(output+'.tmp',output);
  console.log('Sanitized leaderboard: '+board.players.length+' visible / '+board.totalPlayers+' participants.');
  return board;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const config=JSON.parse(await readFile('event/config.json','utf8'));
  const endpoint=process.env.EVENT_ENDPOINT||config.endpoint;
  if(!endpoint){
    if(process.env.GITHUB_EVENT_NAME==='schedule')throw Error('Scheduled sync requires EVENT_ENDPOINT');
    console.log('Event service not configured. Building the local-only release.');
  }else await syncLeaderboard({endpoint,eventId:config.eventId});
}
