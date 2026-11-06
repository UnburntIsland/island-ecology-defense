# 活動排行榜與匿名回饋（V47）

更新：成績服務已部署並填入 `config.json`，已完成真實跨來源送分、原局別重送與排行榜讀取測試。測試局由 `HIDDEN_RUN_IDS` 排除，原資料仍留在私人表單供追查。以下建立步驟供未來重建使用。

Google 服務與 GitHub Pages 已完成連線。`config.json` 目前包含正式 endpoint；若未來清空此欄位，仍可遊玩、保存本機成績及開啟匿名回饋。測試程式會明確替換為隔離端點，避免誤送正式資料。

## 1. 建立成績專用 Google Form／Sheet

這不是既有的匿名回饋表單；不要將匿名回饋資料接到公開排行。

1. 用活動負責人的 Google 帳號開啟 <https://script.google.com/home/start>，建立專案，命名「淮德島活動排行榜」。
2. 將本資料夾的 `apps-script/Code.gs` 全文貼入 `Code.gs`。
3. 專案設定中勾選顯示 `appsscript.json`，將 `apps-script/appsscript.json` 貼入該檔案。
4. 執行 `setupEvent`，依 Google 畫面授權存取表單與試算表。函式會建立一份成績專用表單及私人回應試算表；重跑不會重建既有表單。執行紀錄會印出管理網址。
5. 部署 → 新增部署 → 網頁應用程式。執行身分選「我」，存取權選「所有人」（包含未登入者）。若學校帳號限制外部存取，需要由允許公開網頁應用程式的活動帳號部署。
6. 複製以 `https://script.google.com/macros/s/…/exec` 結尾的網址，不使用 `/dev`。
7. 用未登入／無痕視窗開啟此網址：應看見 `{"ok":true,"service":"island-event",…}`。加上 `?action=leaderboard` 應看見 JSON，而不是登入頁。

成績欄位包含局別 ID、確認碼、活動 ID、參與者 ID、暱稱、原分數、結果、回合、雙方生命、擊敗數、升星數、版本與裝置來源。時間由 Google Form 伺服器記錄。不要發布原始回應 Sheet，也不要分享成績表單填寫網址。公開 JSON 僅包含名次、暱稱、分數、結果與回合。

若修改 Apps Script 程式：部署 → 管理部署 → 編輯 → 選「新版本」後部署，保留相同 `/exec` 網址。只按儲存不會更新既有正式部署。

## 2. 接上本機遊戲

將 `/exec` 網址填入 `event/config.json` 的 `endpoint`，在專案根目錄執行：

```powershell
node card-design/build.mjs
node scripts/sync-leaderboard.mjs
```

重新整理 <http://127.0.0.1:8765/>。首頁讀取 `leaderboard.json`；玩家送分直接到設定好的 Apps Script。

前端用 URL encoded POST 送出，再以唯讀 JSONP 查詢該局的隨機確認碼。跨來源 POST 的 opaque 回應不算成功；只有查到已存入表單的相同分數才會顯示「成績已保存」。失敗時保留同一局 ID，重試不會產生第二筆。請勿以 `fetch(..., {mode:'no-cors'})` 已 resolve 作為成功判斷。

## 3. GitHub Pages 自動同步

2026-11-07 已提交並推送 f64e62f，儲存庫管理員已將 Pages 切換為 GitHub Actions；首次自訂部署成功。下列步驟保留供重建參考。

1. 將本輪來源、建置後 `index.html`、初始 `leaderboard.json`、`event/`、`scripts/`、`tests/event-service.test.mjs` 及 `.github/workflows/pages.yml` 一起提交。先檢查所有既有未提交內容，不要使用 `git add .` 將 `.taste-skill/`、測試資料、交付檔或私人檔案一併加入。
2. Repository → Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。
3. 可在 Settings → Secrets and variables → Actions → **Variables** 新增 `EVENT_ENDPOINT`，填 `/exec` 網址。它是公開服務網址，不是密鑰；此變數會同時供遊戲建置與排行榜同步使用。不設變數時則使用 `event/config.json`。
4. 將分支合併／推送至 `main`。第一次也可至 Actions 手動執行 **Publish game and refresh leaderboard**。
5. 確認工作流程成功，開啟 <https://unburntisland.github.io/island-ecology-defense/>。

工作流程每五分鐘排程、推送或手動觸發時執行：後端合約測試 → 建置單檔 → 讀取整理好的排行榜 → 僅打包 `index.html`、`leaderboard.json`、`.nojekyll` → 部署 Pages。它不抓 Google Form HTML、不發布原始 Sheet、不需要將 Google 或 GitHub 存取憑證放進前端，也不需要把每次更新提交成 Git commit。

Google 回應失敗／資料格式錯誤時，工作流程失敗並保留上一份已部署網站。不要設定 `continue-on-error` 後又發布空榜。未設定 endpoint 的排程會失敗提醒設定；初次手動／推送則可發布僅本機模式。

GitHub 排程可能延遲；不是即時排行。畫面顯示台灣時間的最後更新時間，超過 15 分鐘會提示尚未更新。首頁每分鐘重新讀取，讀取失敗保留上次成功資料。

## 4. 現場兩台電腦及 QR code

- A 電腦：<https://unburntisland.github.io/island-ecology-defense/?station=a>
- B 電腦：<https://unburntisland.github.io/island-ecology-defense/?station=b>
- 手機：首頁「掃碼，用手機玩」指向不含 station 的正式網址。
- 共用電腦每次換人請按「換下一位玩家」，確認後會清掉前一位姓名、角色與當局結算，保留歷史／待送成績、編輯器資料及音效設定。開啟帶 station 的頁面也會重新分配參與者。
- 同一參與者重玩只取最高分，同分並列；同名不合併。換裝置／清除網站資料／按換人會視為不同參與者，這不是跨裝置登入系統。
- 首頁「本機紀錄」可以補送失敗資料。補送的是該筆原暱稱，不會換成下一位玩家。只有玩家明確保存的成績會留存，不會自動上傳未同意公開的資料。

QR 圖檔存於 `event/assets/`，建置後完整內嵌，沒有外部 QR 服務。更換 `playUrl` 或 `feedbackUrl` 後需在自己的 Python 環境安裝 `qrcode` 並執行 `python event/generate-qr.py`；建置會檢查 QR 的網址是否與設定一致。

## 5. 匿名回饋與抽獎

保留使用者提供的匿名問卷，**沒有加入姓名、參與者 ID 或成績，也沒有改寫問卷內容**。結算畫面顯示回饋邀請；玩家按鈕開新分頁，或用手機掃碼。網頁不能跨來源檢查 Google Form 是否送出，因此不會把「開啟表單」標成完成。

活動負責人請在問卷設定確認：

- 不收集電子郵件、不限制登入、不限制為單次回應（否則共用電腦／小朋友可能無法填）。
- 不向填答者公開回應摘要。
- 送出確認訊息可改為：「謝謝你的回饋！請將這個送出成功畫面出示給現場工作人員，依現場規則參加抽獎。」

工作人員查看成功畫面後發抽獎券或做已領註記。遊戲沒有提供電子兌獎憑證或自動核銷。請勿只憑玩家回到遊戲畫面就發獎。

## 6. 評分、管理與限制

沿用原 `scoreGame()`：`(勝利 ? 500 : 0) + max(島嶼生命,0)*20 + 擊敗數*30 + 二星合成數*50 + 四星合成數*150`。後端重算核對；正式對戰提前失守也可登錄，教學不能送分。新增程式沒有改動戰鬥、購買、合成、AI、題目、教學或原數值。

這是公開靜態遊戲，玩家仍可偽造一致的客戶端數據；伺服器檢核與局別去重不能保證競賽等級防作弊。現場抽獎應以完成回饋與工作人員核對為準。Apps Script 有執行時間／配額限制；本設計每次查詢讀取整份活動回應，適用小型現場活動，並非高流量服務。

不適當暱稱／測試局可由管理員在 Apps Script 專案設定 → 指令碼屬性新增 `HIDDEN_RUN_IDS`，內容為 JSON 陣列，例如 `["完整局別-ID"]`；下一次同步會排除。暫不提供公開管理介面。原始表單與試算表含私人確認碼，只給活動管理員存取。若要刪除個資需在表單回應及連結試算表各自清除（兩者不是同一個資料庫）。

新增活動需同步修改 `config.json` 與 Apps Script 的 `EVENT_ID` 指令碼屬性，建立新的成績表單較易管理。資料保留期限由活動負責人設定，活動結束後關閉公開部署與 GitHub 排程。

## 7. 驗證

```powershell
node --test tests/event-service.test.mjs
node tests/event-ui.mjs
node tests/gameplay-parity.cjs
```

`event-ui.mjs` 使用本機隔離瀏覽器及模擬 Google 端點；後端測試以 FormApp 替身驗證合約。這兩者**不能取代 Google 授權、真實跨來源網路與 GitHub Pages 部署的實測**。

正式啟用前，用活動負責人同意的測試暱稱完成一局：確認 Google Form 有一筆、Sheet 有一筆、重試無新增、Actions 後首頁有該成績；再按換人測另一暱稱。最後隱藏測試局。問卷驗證請由工作人員親自送一次，避免程式灌入假回饋。

參考：[Apps Script Content Service／JSONP](https://developers.google.com/apps-script/guides/content)、[FormResponse.submit](https://developers.google.com/apps-script/reference/forms/form-response)、[GitHub Pages 自訂工作流程](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
