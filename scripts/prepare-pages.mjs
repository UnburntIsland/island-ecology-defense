import {mkdir,copyFile,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

export function packageGame(bytes,chunkSize=1024*1024){
 const hash=createHash('sha256').update(bytes).digest('hex');
 const chunks=[];
 for(let i=0;i<bytes.length;i+=chunkSize)chunks.push(bytes.subarray(i,i+chunkSize));
 const manifest={hash,bytes:bytes.length,parts:chunks.map((chunk,i)=>({url:`_game/${hash}/part-${String(i).padStart(2,'0')}.txt`,bytes:chunk.length,hash:createHash('sha256').update(chunk).digest('hex')}))};
 return {manifest,chunks};
}

export function loaderHtml(manifest){return `<!doctype html>
<html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>島嶼生態保衛戰</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#102e26;color:#f5f0dd;font-family:system-ui,sans-serif;padding:24px}main{width:min(100%,520px)}small{color:#b9d59c;letter-spacing:.12em}h1{font-size:clamp(26px,6vw,40px);margin:16px 0}p{line-height:1.7;color:#d2ddd1}progress{width:100%;height:14px;accent-color:#cbd58d}button,a{font:inherit;color:inherit}button{background:#e3e5b9;color:#183c2d;border:0;border-radius:6px;padding:12px 20px;cursor:pointer}button[hidden]{display:none}a{display:inline-block;margin-top:22px;text-underline-offset:4px}#status{min-height:3.4em}a:focus-visible,button:focus-visible{outline:3px solid #fff;outline-offset:5px}</style>
<main><small>淮德島 · 島嶼生態保衛戰</small><h1>正在準備你的島嶼</h1><p>首次開啟需要下載完整卡牌與角色插畫，請稍候。</p><progress id="progress" max="${manifest.bytes}" value="0" aria-label="遊戲下載進度"></progress><p id="status" role="status" aria-live="polite">正在連線…</p><button id="retry" hidden>重新連線，繼續下載</button><br><a href="standalone.html" download>下載單檔遊戲，離線遊玩</a><noscript><p>請啟用 JavaScript 後重新開啟，才能遊玩。</p></noscript></main>
<script>
(() => {
const manifest=${JSON.stringify(manifest)};
const buffers=new Array(manifest.parts.length),statusNode=document.getElementById('status'),progressNode=document.getElementById('progress'),retryNode=document.getElementById('retry');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function digest(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('')}
function progress(){const size=buffers.reduce((n,b)=>n+(b?.byteLength||0),0);progressNode.value=size;statusNode.textContent='正在準備插畫與遊戲… '+Math.floor(size/manifest.bytes*100)+'%（'+(size/1048576).toFixed(1)+' / '+(manifest.bytes/1048576).toFixed(1)+' MB）'}
async function part(i){
 for(let attempt=0;attempt<3;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  try{const response=await fetch(manifest.parts[i].url,{signal:controller.signal,cache:attempt?'reload':'default'});if(!response.ok)throw Error('下載未完成');const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length!==manifest.parts[i].bytes||await digest(bytes)!==manifest.parts[i].hash)throw Error('資料不完整');buffers[i]=bytes;progress();return}
  catch(error){if(attempt===2)throw error;await pause(600*(attempt+1))}
  finally{clearTimeout(timer)}
 }
}
async function start(){
 retryNode.hidden=true;progress();let next=0,failed=false;
 async function worker(){while(next<buffers.length&&!failed){const i=next++;if(buffers[i])continue;try{await part(i)}catch(error){failed=true;throw error}}}
 try{
  const results=await Promise.allSettled(Array.from({length:6},worker));if(results.some(r=>r.status==='rejected'))throw Error('連線中斷');
  const bytes=new Uint8Array(manifest.bytes);let offset=0;for(const buffer of buffers){bytes.set(buffer,offset);offset+=buffer.length}
  if(await digest(bytes)!==manifest.hash){buffers.fill(undefined);throw Error('資料需要重新下載')}
  statusNode.textContent='下載完成，正在開啟島嶼…';
  const html=new TextDecoder('utf-8',{fatal:true}).decode(bytes);document.open();document.write(html);document.close();
 }catch(error){statusNode.textContent='連線較慢或暫時中斷。已下載的內容會保留，請按下方按鈕繼續。';retryNode.hidden=false}
}
retryNode.addEventListener('click',start);start();
})();
</script></html>`}

export async function preparePages(output='_site'){
 // A strict publish allowlist. Never deploy private records, QA exports or tools.
 const bytes=await readFile('index.html'),{manifest,chunks}=packageGame(bytes);
 await mkdir(`${output}/_game/${manifest.hash}`,{recursive:true});
 await Promise.all(chunks.map((chunk,i)=>writeFile(`${output}/${manifest.parts[i].url}`,chunk)));
 await writeFile(`${output}/index.html`,loaderHtml(manifest));
 await copyFile('index.html',`${output}/standalone.html`);
 await copyFile('leaderboard.json',`${output}/leaderboard.json`);
 await writeFile(`${output}/.nojekyll`,'');
 console.log(`Packaged ${bytes.length} bytes in ${chunks.length} verified parts; original standalone preserved.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await preparePages();
