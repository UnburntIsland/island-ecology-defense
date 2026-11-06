/* Paste into a standalone Apps Script project. Run setupEvent once, then deploy
 * as a web app (execute as owner; access Anyone). No credential belongs in HTML.
 * Google Form responses are the authoritative store; its linked Sheet is for staff.
 */
var EVENT_DEFAULT = 'island-science-2026';
var FIELDS = ['runId','receipt','eventId','participantId','name','score','outcome','round','hp','aiHp','kills','merges2','merges4','gameVersion','source'];

function setupEvent() {
  var props = PropertiesService.getScriptProperties();
  var form = props.getProperty('FORM_ID') ? FormApp.openById(props.getProperty('FORM_ID')) : FormApp.create('淮德島｜遊戲成績（與匿名回饋分開）');
  props.setProperty('FORM_ID', form.getId()); // Re-running setup resumes, never duplicates the form.
  if (!props.getProperty('EVENT_ID')) props.setProperty('EVENT_ID', EVENT_DEFAULT);
  form.setDescription('由遊戲成績服務寫入。不要分享本表單填寫網址。公開排行只含暱稱、成績、結果及回合。');
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  if (form.supportsAdvancedResponderPermissions()) form.setPublished(true);
  var titles = form.getItems().map(function (i) { return i.getTitle(); });
  FIELDS.forEach(function (key) { if (titles.indexOf(key) < 0) form.addTextItem().setTitle(key).setRequired(true); });
  var destinationId = '';
  try {
    destinationId = form.getDestinationId();
  } catch (err) {
    // Forms throws for a new form instead of returning an empty ID.
    // Do not hide permission, quota or unrelated service errors.
    if (!/no response destination|沒有回覆目標/i.test(String(err.message || err))) throw err;
  }
  if (!destinationId) {
    var sheet = props.getProperty('SHEET_ID') ? SpreadsheetApp.openById(props.getProperty('SHEET_ID')) : SpreadsheetApp.create('淮德島｜成績原始紀錄（私人）');
    props.setProperty('SHEET_ID', sheet.getId());
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  }
  console.log('成績表單管理：' + form.getEditUrl());
  console.log('私人試算表：https://docs.google.com/spreadsheets/d/' + form.getDestinationId() + '/edit');
  console.log('EVENT_ID=' + props.getProperty('EVENT_ID'));
}

function eventId_() { return PropertiesService.getScriptProperties().getProperty('EVENT_ID') || EVENT_DEFAULT; }
function form_() {
  var id = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  if (!id) throw Error('NOT_CONFIGURED');
  return FormApp.openById(id);
}
function json_(data, callback) {
  var raw = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  if (callback && /^islandAck_[a-zA-Z0-9_]{1,80}$/.test(callback)) return ContentService.createTextOutput(callback + '(' + raw + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(raw).setMimeType(ContentService.MimeType.JSON);
}
function token_(v) { return typeof v === 'string' && /^[a-zA-Z0-9-]{20,80}$/.test(v); }
function integer_(v, lo, hi) { return Number.isSafeInteger(v) && v >= lo && v <= hi; }
function validate_(r) {
  if (!r || !token_(r.runId) || !token_(r.receipt) || !token_(r.participantId)) throw Error('INVALID_ID');
  if (r.eventId !== eventId_()) throw Error('WRONG_EVENT');
  if (typeof r.name !== 'string' || r.name !== r.name.trim() || Array.from(r.name).length < 1 || Array.from(r.name).length > 16 || /^[=+@-]/.test(r.name) || /[\u0000-\u001f\u007f-\u009f<>]/.test(r.name)) throw Error('INVALID_NAME');
  if (!integer_(r.round,1,8) || !integer_(r.hp,-10000,10000) || !integer_(r.aiHp,-10000,10000) || !['kills','merges2','merges4'].every(function (k) { return integer_(r[k],0,10000); })) throw Error('INVALID_METRICS');
  var outcome = r.hp > r.aiHp ? '守護成功' : r.hp < r.aiHp ? '島嶼失守' : '平手';
  // Identical to the existing scoreGame(): no new balance or bonus rules.
  var score = (r.hp > r.aiHp ? 500 : 0) + Math.max(0,r.hp)*20 + r.kills*30 + r.merges2*50 + r.merges4*150;
  if (r.score !== score || r.outcome !== outcome) throw Error('SCORE_MISMATCH');
  if (typeof r.gameVersion !== 'string' || !/^V47-event-[a-zA-Z0-9.-]{1,24}$/.test(r.gameVersion) || !['mobile','personal','kiosk-a','kiosk-b'].includes(r.source)) throw Error('INVALID_VERSION');
  return r;
}
function records_() {
  return form_().getResponses().map(function (response) {
    var r = {};
    response.getItemResponses().forEach(function (item) { r[item.getItem().getTitle()] = item.getResponse(); });
    ['score','round','hp','aiHp','kills','merges2','merges4'].forEach(function (key) { r[key] = Number(r[key]); });
    r.receivedAt = response.getTimestamp().toISOString();
    r.responseId = response.getId();
    return r;
  });
}
function statusKey_(r) { return 'ack:' + r.runId + ':' + r.receipt; }

function doPost(e) {
  var r, lock = LockService.getScriptLock();
  try {
    if (!e || !e.parameter || typeof e.parameter.record !== 'string' || e.parameter.record.length > 8192) throw Error('INVALID_REQUEST');
    r = JSON.parse(e.parameter.record);
    validate_(r);
    if (!lock.tryLock(10000)) throw Error('BUSY');
    var rows = records_();
    var previous = rows.find(function (row) { return row.runId === r.runId; });
    if (previous) {
      if (FIELDS.some(function (key) { return String(previous[key]) !== String(r[key]); })) throw Error('RUN_CONFLICT');
      return json_({ok:true});
    }
    var cache = CacheService.getScriptCache();
    if (cache.get('rate:' + r.participantId)) throw Error('PLEASE_WAIT');
    var form = form_(), response = form.createResponse();
    var items = form.getItems();
    FIELDS.forEach(function (key) {
      var item = items.find(function (i) { return i.getTitle() === key; });
      if (!item) throw Error('SCHEMA_MISMATCH');
      response.withItemResponse(item.asTextItem().createResponse(String(r[key])));
    });
    response.submit(); // Also populates linked Sheet; does not fire form-submit triggers.
    cache.put('rate:' + r.participantId,'1',10);
    cache.remove(statusKey_(r));
    return json_({ok:true});
  } catch (err) {
    var code = String(err.message || err);
    if (!/^[A-Z_]+$/.test(code)) code = 'SERVER_ERROR';
    if (r && token_(r.runId) && token_(r.receipt)) CacheService.getScriptCache().put(statusKey_(r),code,120);
    return json_({ok:false,error:code});
  } finally { if (lock.hasLock()) lock.releaseLock(); }
}

function publicBoard_(rows) {
  var best = {};
  // Staff can hide a response by setting HIDDEN_RUN_IDS to a JSON array of run IDs.
  var hidden = JSON.parse(PropertiesService.getScriptProperties().getProperty('HIDDEN_RUN_IDS') || '[]');
  rows.forEach(function (r) {
    try { validate_(r); } catch (_) { return; }
    if (hidden.indexOf(r.runId) >= 0) return;
    var previous = best[r.participantId];
    if (!previous || r.score > previous.score || (r.score === previous.score && r.receivedAt < previous.receivedAt)) best[r.participantId] = r;
  });
  var sorted = Object.keys(best).map(function (key) { return best[key]; }).sort(function (a,b) { return b.score-a.score || a.receivedAt.localeCompare(b.receivedAt) || a.runId.localeCompare(b.runId); });
  var rank = 0, last = null;
  return {schemaVersion:1,eventId:eventId_(),updatedAt:new Date().toISOString(),totalPlayers:sorted.length,players:sorted.slice(0,100).map(function (r,i) {
    if (r.score !== last) rank = i+1;
    last = r.score;
    return {rank:rank,name:r.name,score:r.score,outcome:r.outcome,round:r.round};
  })};
}
function doGet(e) {
  var p = e && e.parameter || {};
  try {
    if (p.action === 'status') {
      if (!token_(p.runId) || !token_(p.receipt) || p.eventId !== eventId_()) throw Error('INVALID_ID');
      // This read-only JSONP response contains no nickname, token or private metrics.
      var found = records_().find(function (r) { return r.runId === p.runId && r.receipt === p.receipt && r.eventId === p.eventId; });
      if (found) return json_({ok:true,found:true,score:found.score},p.callback);
      var error = CacheService.getScriptCache().get(statusKey_(p));
      return json_({ok:!error,found:false,error:error || undefined},p.callback);
    }
    if (p.action === 'leaderboard') return json_(publicBoard_(records_()));
    return json_({ok:true,service:'island-event',eventId:eventId_()});
  } catch (err) { return json_({ok:false,error:'SERVICE_UNAVAILABLE'},p.callback); }
}
