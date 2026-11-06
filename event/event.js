/* Optional event integration. Reads completed results; never writes combat state,
 * changes randomness, or replaces scoreGame()/finishGame(). Embedded by build.mjs. */
(() => {
  'use strict';
  const config = EVENT_CONFIG;
  const prefix = 'island_event_' + config.eventId + '_';
  const el = id => document.getElementById(id);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(prefix+key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(prefix+key,JSON.stringify(value)); return true; } catch { return false; } };
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,'0')).join('');
  const configured = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.endpoint);
  const station = new URLSearchParams(location.search).get('station');
  const source = ['a','b'].includes(station) ? 'kiosk-'+station : matchMedia('(pointer:coarse)').matches ? 'mobile' : 'personal';
  let participant = read('participant',null);
  if (!participant || typeof participant.id !== 'string') participant = {id:uuid(),name:''};
  write('participant',participant);
  let records = read('records',[]);
  if (!Array.isArray(records)) records = [];
  records = records.filter(x=>x && x.record && x.record.eventId===config.eventId && typeof x.record.name==='string' && Number.isSafeInteger(x.record.score) && ['local','pending','sent'].includes(x.status));
  let current = null, resultRef = null, busy = false, refreshing = false;
  let board = null, boardMessage = '正在讀取活動排行榜…';

  function persist() {
    // Never evict unsent runs. Limit only completed/local historical entries.
    const pending = records.filter(x=>x.status==='pending');
    const history = records.filter(x=>x.status!=='pending').slice(-200);
    return write('records',[...history,...pending]);
  }
  function status(text, error=false) {
    for (const id of ['eventSaveStatus','eventPendingStatus']) {
      if (el(id)) { el(id).textContent=text; el(id).dataset.error=String(error); }
    }
  }
  function escape(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function dialog(id,title,body) {
    const node = document.createElement('dialog');node.id=id;node.className='modal hidden';node.setAttribute('aria-labelledby',id+'Title');
    node.innerHTML=`<div class="dialog event-dialog"><h2 id="${id}Title">${title}</h2>${body}</div>`;
    document.body.append(node);
    node.addEventListener('cancel',e=>{e.preventDefault();hideModal(id)});
    return node;
  }
  function snapshot() {
    if (!lastResult || !G?.finished || G.tutorialV24) return null;
    if (resultRef === lastResult && current) return current;
    resultRef=lastResult;
    current={runId:uuid(),receipt:uuid(),participantId:participant.id,eventId:config.eventId,name:'',gameVersion:config.gameVersion,source};
    for (const key of ['score','outcome','round','hp','aiHp','kills','merges2','merges4']) current[key]=lastResult[key];
    return current;
  }
  function localTable(rows) {
    return '<table class="event-table"><thead><tr><th>名次</th><th>守護者</th><th>分數</th></tr></thead><tbody>'+rows.map(r=>`<tr><td>${r.rank}</td><td>${escape(r.name)}${r.outcome?`<small>${escape(r.outcome)} · 第 ${r.round} 回合</small>`:''}</td><td>${Number(r.score).toLocaleString('zh-TW')}</td></tr>`).join('')+'</tbody></table>';
  }
  function drawBoard() {
    const rows=board?.players||[];
    el('eventTop').innerHTML=rows.length?localTable(rows.slice(0,5)):'<p class="event-note">還沒有公開成績。完成正式對戰後，留下你的守護紀錄。</p>';
    el('eventBoardRows').innerHTML=rows.length?localTable(rows):'<p class="event-note">尚無公開成績。</p>';
    const freshness=board?.updatedAt?'更新：'+new Date(board.updatedAt).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})+'（台灣時間）':'';
    el('eventBoardNote').textContent=[boardMessage,freshness].filter(Boolean).join(' · ');
    el('eventBoardDetail').textContent=el('eventBoardNote').textContent;
    el('eventBoardTotal').textContent=`每位玩家取最高分，同分並列。${board ? '共 '+board.totalPlayers+' 位；顯示前 100 名。' : ''}`;
    el('eventPendingCount').textContent=records.filter(x=>x.status==='pending').length?'待送出紀錄（'+records.filter(x=>x.status==='pending').length+'）':'本機紀錄';
  }
  function validBoard(data) {
    return data?.schemaVersion===1 && data.eventId===config.eventId && Array.isArray(data.players) && data.players.length<=100 && Number.isSafeInteger(data.totalPlayers) && data.totalPlayers>=data.players.length && (data.updatedAt===null ? !data.players.length : Number.isFinite(Date.parse(data.updatedAt))) && data.players.every(r=>typeof r.name==='string' && Array.from(r.name).length<=16 && Number.isSafeInteger(r.score) && r.score>=0 && Number.isSafeInteger(r.rank) && r.rank>0 && ['守護成功','島嶼失守','平手'].includes(r.outcome) && Number.isInteger(r.round) && r.round>=1 && r.round<=8);
  }
  async function refresh() {
    if (refreshing) return;
    refreshing=true;
    try {
      if (location.protocol==='file:') throw Error('offline');
      const u=new URL(config.leaderboardUrl,location.href);u.searchParams.set('t',Date.now());
      const response=await fetch(u,{cache:'no-store',signal:AbortSignal.timeout(10000)});
      if (!response.ok) throw Error('HTTP');
      const data=await response.json();if (!validBoard(data)) throw Error('invalid');
      board=data;write('board',data);
      const old=data.updatedAt && Date.now()-Date.parse(data.updatedAt)>15*60*1000;
      boardMessage=data.updatedAt?(old?'排行榜尚未更新；顯示上次同步。':'成績送出後，排名通常數分鐘後更新。'):'活動排行榜尚未啟用。';
    } catch { boardMessage=board?.updatedAt?'暫時無法更新，保留上次排行榜。':'目前無法讀取活動排行榜；仍可遊玩與保存本機紀錄。'; }
    finally { refreshing=false;drawBoard(); }
  }
  function ack(record) {
    return new Promise((resolve,reject)=>{
      const key='islandAck_'+uuid().replaceAll('-','');
      const script=document.createElement('script');let done=false;
      const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);script.remove();window[key]=()=>{};setTimeout(()=>delete window[key],60000);error?reject(error):resolve(value)};
      const timer=setTimeout(()=>finish(Error('TIMEOUT')),10000);
      window[key]=data=>finish(null,data);
      script.onerror=()=>finish(Error('NETWORK'));
      const url=new URL(config.endpoint);
      for(const [k,v] of Object.entries({action:'status',eventId:config.eventId,runId:record.runId,receipt:record.receipt,callback:key}))url.searchParams.set(k,v);
      script.src=url.href;script.referrerPolicy='no-referrer';document.head.append(script);
    });
  }
  async function send(entry) {
    if (!configured || busy || entry.status==='sent') return;
    busy=true;setButtons();status('正在送出並確認保存結果…');
    try {
      // Opaque transport is NOT an acknowledgement. Only the read-only receipt
      // lookup below may mark a run sent. Its high-entropy key is never published.
      fetch(config.endpoint,{method:'POST',mode:'no-cors',credentials:'omit',body:new URLSearchParams({record:JSON.stringify(entry.record)}),signal:AbortSignal.timeout(30000)}).catch(()=>{});
      let confirmed=false;
      for(let i=0;i<4;i++){
        await new Promise(r=>setTimeout(r,1500));
        let answer;try{answer=await ack(entry.record)}catch{continue}
        if(answer?.ok && answer.found && answer.score===entry.record.score){confirmed=true;break}
        if(answer?.error)throw Error(answer.error);
      }
      if(!confirmed)throw Error('UNCONFIRMED');
      entry.status='sent';entry.savedAt=new Date().toISOString();
      const retained=persist();
      status('成績已保存到活動表單！排行榜會在後續同步時更新。'+(retained?'':'此瀏覽器無法記住送出狀態；重試也不會重複計分。'));
    } catch(error) {
      entry.status='pending';persist();
      const errors={INVALID_NAME:'暱稱格式未通過檢查。',WRONG_EVENT:'活動設定不一致，請找工作人員。',SCORE_MISMATCH:'成績驗證失敗，請找工作人員。',RUN_CONFLICT:'這局紀錄已存在不同內容，請找工作人員。',PLEASE_WAIT:'請稍候幾秒再試。'};
      status((errors[error.message]||'尚未確認雲端保存成功。')+' 紀錄已保留在這台裝置，可稍後重試。',true);
    } finally {busy=false;setButtons();drawBoard();drawRecords();}
  }
  function setButtons() {
    for(const button of document.querySelectorAll('[data-event-send]'))button.disabled=busy||!configured;
    const entry=current && records.find(x=>x.record.runId===current.runId);
    if(el('eventSave')){el('eventSave').disabled=busy||entry?.status==='sent';el('eventSave').textContent=entry?.status==='sent'?'已保存':busy?'正在確認…':entry?.status==='pending'?'重試送出':configured?'保存成績並參加排行':'保存本機成績';}
  }
  function openScore() {
    const run=snapshot();if(!run){toast('完成正式對戰後才能登錄成績');return}
    const entry=records.find(x=>x.record.runId===run.runId);
    el('eventResultScore').textContent=run.score.toLocaleString('zh-TW')+' 分 · '+run.outcome;
    el('eventName').value=entry?.record.name||G?.playerNameV22||participant.name||'';
    el('eventName').readOnly=!!entry;
    el('eventConsent').checked=!!entry?.consent;el('eventConsent').disabled=!!entry;
    el('eventSaveInfo').textContent=configured?'使用暱稱即可，請勿填寫真名或聯絡資訊。送出後會公開暱稱、分數、結果與回合；匿名回饋另外填寫。':'活動連線尚未啟用。現在可保存本機成績；啟用後由你選擇送出。請使用暱稱。';
    status(entry?.status==='sent'?'成績已保存到活動表單，等待排行榜同步。':entry?.status==='pending'?'這局待確認，可安全重試，不會重複計分。':'');
    setButtons();showModal('eventScoreModal');
  }
  function save() {
    if(busy||!current)return;
    let entry=records.find(x=>x.record.runId===current.runId);
    if(!entry){
      const name=el('eventName').value.trim();
      if(!name||Array.from(name).length>16||/^[=+@-]/.test(name)||/[\u0000-\u001f\u007f-\u009f<>]/.test(name)){status('請填寫 1～16 字暱稱，不使用 < > 或以 = + - @ 開頭。',true);el('eventName').focus();return}
      if(configured&&!el('eventConsent').checked){status('請先勾選同意公開暱稱與成績，或返回結算。',true);return}
      entry={record:{...current,name},status:configured?'pending':'local',consent:el('eventConsent').checked,createdAt:new Date().toISOString()};records.push(entry);
      if(!persist()){records.pop();status('此瀏覽器無法保存紀錄。請允許網站儲存空間，再試一次。',true);return}
      participant.name=name;write('participant',participant);el('eventName').readOnly=true;el('eventConsent').disabled=true;
      // Keep the original on-device leaderboard available, without duplicate saves.
      try {const local=getScores();if(!local.some(x=>x.runId===entry.record.runId)){local.push({runId:entry.record.runId,name,score:current.score,outcome:current.outcome,date:new Date().toLocaleDateString('zh-TW'),round:current.round});localStorage.setItem(SCORE_KEY,JSON.stringify(local.slice(-200)));}}catch{}
    }
    if(entry.status==='sent')return;
    if(configured && entry.consent){entry.status='pending';persist();void send(entry)}
    else{status('已保存本機成績。尚未送到活動排行榜。');setButtons();drawBoard();drawRecords();}
  }
  function drawRecords() {
    const list=el('eventRecords');list.replaceChildren();
    for(const entry of [...records].reverse().slice(0,200)){
      const li=document.createElement('li'),name=document.createElement('strong'),note=document.createElement('p');
      name.textContent=entry.record.name+' · '+entry.record.score.toLocaleString('zh-TW')+' 分';
      note.className='event-note';note.textContent={sent:'雲端已確認',pending:'等待確認，可重試',local:'僅在本機'}[entry.status]||'本機紀錄';li.append(name,note);
      if(entry.status!=='sent'){
        const button=document.createElement('button');button.className='btn';button.dataset.eventSend='';button.textContent=entry.consent?'重試送出':'同意公開並送出';button.disabled=busy||!configured;
        button.addEventListener('click',()=>{entry.consent=true;entry.status='pending';if(!persist()){status('無法保存待送出紀錄，請允許儲存空間。',true);return}void send(entry)});li.append(button);
      }
      list.append(li);
    }
    if(!records.length)list.innerHTML='<li class="event-note">還沒有本機成績。完成正式對戰後可登錄。</li>';
  }
  function clearIdentity() {
    participant={id:uuid(),name:''};write('participant',participant);current=null;resultRef=null;
    try{localStorage.removeItem(NAME_KEY);localStorage.removeItem(PROFILE_KEY_V23)}catch{}
    activeTravelerV23=null;prologueV22=null;
  }
  function nextPlayer() {
    clearIdentity();lastResult=null;
    for(const id of ['eventResetModal','eventScoreModal','eventFeedbackModal','eventBoardModal','eventRecordsModal','eventShareModal','leaderboardModal'])hideModal(id);
    backMenu();toast('已準備好，歡迎下一位守護者！');
  }
  function init() {
    if(['a','b'].includes(station))clearIdentity();
    const cached=read('board',null);if(validBoard(cached))board=cached;
    dialog('eventBoardModal',config.eventTitle,'<p id="eventBoardTotal" class="event-note"></p><p id="eventBoardDetail" class="event-note" role="status"></p><div id="eventBoardRows"></div><div class="event-actions"><button class="btn" onclick="IslandEvent.refresh()">更新排行榜</button><button class="btn" onclick="IslandEvent.localBoard()">舊版本機名冊</button><button class="btn primary" onclick="hideModal(\'eventBoardModal\')">返回</button></div>');
    dialog('eventRecordsModal','這台裝置的遊戲紀錄','<p class="event-note">待送出的紀錄會留在這台裝置。按「同意公開並送出」會將該筆暱稱與成績公開到活動排行，不會送出匿名回饋。</p><p id="eventPendingStatus" class="event-status" role="status"></p><ul id="eventRecords" class="event-pending"></ul><div class="event-actions"><button class="btn primary" onclick="hideModal(\'eventRecordsModal\')">返回</button></div>');
    dialog('eventScoreModal','留下這次的守護紀錄','<div id="eventResultScore"></div><p id="eventSaveInfo" class="event-note"></p><form id="eventScoreForm"><label for="eventName">公開暱稱（1～16 字）</label><input id="eventName" type="text" maxlength="32" autocomplete="off" required><label class="event-consent"><input id="eventConsent" type="checkbox"><span>同意將暱稱與成績公開於活動排行榜。</span></label><p id="eventSaveStatus" class="event-status" role="status"></p><div class="event-actions"><button type="submit" id="eventSave" class="btn primary">保存成績</button><button type="button" class="btn" onclick="hideModal(\'eventScoreModal\')">返回結算</button><button type="button" class="btn" onclick="IslandEvent.feedback()">填寫匿名回饋</button></div></form>');
    dialog('eventFeedbackModal','分享你的遊玩感想',`<div class="event-qr"><div role="img" aria-label="匿名回饋表單 QR code">${EVENT_QR.feedbackUrl}</div><div><p>匿名填寫，約 2～3 分鐘。</p><p class="event-note">完成後，請把 Google 表單的送出成功畫面給現場工作人員看，再依現場規則參加抽獎。</p><a class="btn primary" href="${escape(config.feedbackUrl)}" target="_blank" rel="noopener noreferrer">開啟回饋表單 ↗</a></div></div><p class="event-note">共用電腦：可以用手機掃碼填寫，讓下一位先玩。開啟表單不代表已完成填答，成績登錄與回饋互相獨立。</p><div class="event-actions"><button class="btn" onclick="hideModal('eventFeedbackModal')">返回遊戲</button><button class="btn" onclick="IslandEvent.reset()">換下一位玩家</button></div>`);
    dialog('eventShareModal','用自己的裝置守護淮德島',`<div class="event-qr"><div role="img" aria-label="正式遊戲 QR code">${EVENT_QR.playUrl}</div><div><p>掃描後用手機橫向遊玩。</p><a href="${escape(config.playUrl)}" target="_blank" rel="noopener noreferrer">${escape(config.playUrl)}</a><p class="event-note">此 QR code 指向 GitHub 正式網站；網站更新發布後才會顯示最新功能。</p></div></div><button class="btn primary" onclick="hideModal('eventShareModal')">返回</button>`);
    dialog('eventResetModal','交棒給下一位守護者','<p>清除這位玩家的姓名與角色設定，回到首頁。已保存與待送出的成績、卡牌編輯及音效設定都會保留。</p><div class="event-actions"><button class="btn primary" onclick="IslandEvent.nextPlayer()">確認，換下一位</button><button class="btn" onclick="hideModal(\'eventResetModal\')">先不要</button></div>');
    const section=document.createElement('section');section.id='eventHome';section.setAttribute('aria-label','活動排行榜');
    section.innerHTML=`<div><div class="event-heading"><h2>${escape(config.eventTitle)}</h2><button class="btn" onclick="IslandEvent.board()">完整排行榜</button></div><p id="eventBoardNote" class="event-note" role="status"></p><div id="eventTop"></div></div><div><h2>一起守護這座島</h2><p class="event-note">完成正式對戰，留下暱稱與成績。填寫匿名回饋後，把送出成功畫面給工作人員看，參加現場抽獎。</p><div class="event-actions"><button class="btn" onclick="IslandEvent.share()">掃碼，用手機玩</button><button class="btn" id="eventPendingCount" onclick="IslandEvent.records()">本機紀錄</button><button class="btn" onclick="IslandEvent.reset()">換下一位玩家</button></div></div>`;
    const footer=document.querySelector('#menuScreen .v20-menu-footer');footer.before(section);
    const navButton=document.createElement('button');navButton.className='btn';navButton.textContent='活動排行榜';navButton.addEventListener('click',()=>showLeaderboard());
    document.querySelector('#menuScreen .v20-menu-nav').append(navButton);
    const result=document.createElement('section');result.id='eventResult';result.className='event-feedback';
    result.innerHTML='<h3>這趟守護，留下你的感想</h3><p class="event-note">匿名回饋約 2～3 分鐘。填完出示送出成功畫面，即可洽工作人員參加抽獎。</p><div class="event-actions"><button class="btn primary" onclick="IslandEvent.feedback()">填回饋／掃碼填寫</button><button class="btn" onclick="IslandEvent.reset()">換下一位玩家</button></div>';
    el('resultModal').querySelector('.dialog').append(result);
    el('eventScoreForm').addEventListener('submit',e=>{e.preventDefault();save()});
    drawBoard();drawRecords();void refresh();
    setInterval(()=>{if(!document.hidden&&!el('menuScreen').classList.contains('hidden'))void refresh()},60000);
    window.addEventListener('online',()=>void refresh());
  }
  const originalBoard=showLeaderboard;
  const originalShow=showModal;
  showModal=function(id){if(id==='resultModal')snapshot();return originalShow(id)};
  openRegister=openScore;
  saveScore=save;
  showLeaderboard=()=>{showModal('eventBoardModal');void refresh()};
  window.IslandEvent={refresh,board:showLeaderboard,localBoard:originalBoard,records:()=>{drawRecords();showModal('eventRecordsModal')},feedback:()=>showModal('eventFeedbackModal'),share:()=>showModal('eventShareModal'),reset:()=>showModal('eventResetModal'),nextPlayer};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
