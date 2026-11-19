# Quickstart Validation Guide — Feature 002

**目前狀態（2026-11-19確認）**：T001–T064完成，64/64；使用者已核准專案內部最終接受（USER_APPROVED_FINAL_ACCEPTANCE）。T057兩份真表API及T059兩份六題人工流程已由使用者回報接受。T058為DA-T058-01專案內部有限證據接受，不代表助教或全部權限負例PASS；原protected MISSING／UNKNOWN真實FAIL保留，已知DENIED／保護專屬歸因／遠端恰一次NOT VERIFIED，真逾時／pending reconcile NOT RUN。未取得的人工細項仍NOT VERIFIED，不以示範腳本補PASS。最新依據見[Final矩陣](../../tests/records/002-google-sheets-integration/final-acceptance.md)與[審查紀錄](review-record.md)。實際版本依package-lock鎖定；Node >=24 <25。

以下第1–8節是一般操作與管理準備，第9節是開發者測試，live不預設執行。

<details><summary>Plan至US4歷史狀態摘要</summary>

日期：2026-11-18。這是 **Plan 的未來執行／驗證指引**，不是目前程式已支援 Google 的宣稱。須先經 Plan／Tasks 審查及實作，才執行本指引的 002 UI／live 測試；現有 checkout 仍是 Excel 版本。本輪未建立憑證、未安裝套件、未執行以下測試。

**最新實作狀態（2026-11-18，US3後）**：上文是Plan當時狀態，保留為歷史。Setup／Foundation離線、US1、US2及US3 T032–T043已完成；目前支援網址讀取及老師手動單批寫回／讀回核對，Excel正式入口已退役。以下包含完整Feature的未來步驟，US4 reconcile／恢復、Final與live自動測試尚未實作；不要執行尚不存在的reconcile／test:live指令來推定驗收。US3現階段人工寫回步驟及pending停止條件見[us3-manual-write.md](../../tests/records/002-google-sheets-integration/us3-manual-write.md)，離線結果見[us3-fake.md](../../tests/records/002-google-sheets-integration/us3-fake.md)。T003／T004及真實寫入維持未完成。

**US4最新狀態（2026-11-18）**：上列US3階段限制是歷史。本輪T044–T054離線完成，現在提供「核對原寫回操作」及reconcile端點；只有老師明確點選才讀雲端核對，刷新仍只查本機，不自動reconcile／重送。canReconcile代表可核對，不代表可重新寫。舊transport仍執行時BUSY；local settle且遠端UNKNOWN、有未完成原標記時仍保持pending，只讀不寫，不用重啟取消。全目標吻合且local settle或舊請求可安全排除後，才可解除屏障／依原快照安全處理剩餘格。衝突／分享或認證失敗保留搶答結果，Google錯誤不清本機老師Session。完整分支與fake證據見[us4-recovery-fake.md](../../tests/records/002-google-sheets-integration/us4-recovery-fake.md)。

使用者另回報US3真實匯入／搶答／閉題／答案寫回預期格成功，記為[使用者真實讀寫證據](../../tests/records/002-google-sheets-integration/user-real-write.md)，非代理獨立實測、非兩份表／US4異常恢復／完整Final驗收。T003／T004仍未自動勾選，Final與test:live尚未實作，本輪不執行真Google寫入。首次人工寫回仍可參考上列US3操作指引，但其「無reconcile」是當時版本限制，以本段為目前實作狀態。

</details>

## 1. 準備本機與專用測試資料

需要 Windows、Node.js 24 LTS／npm、Java／PlantUML（核圖用）、可隔離身分的瀏覽器設定檔、Google Cloud 專案管理與 API 啟用權限，以及能分享試算表的擁有者。

只在專用合成試算表測試寫入與撤權，不用真實學生個資或唯一課程原表。老師與各學生分別用獨立瀏覽器設定檔；同設定檔頁籤仍是同一組。應用程式的老師／學生不需要 Google 帳號；下面 Cloud／分享準備由管理人員及文件擁有者於系統外完成。

## 2. Google Cloud 專案與 Sheets API

1. 管理人員在 [Google Cloud Console](https://console.cloud.google.com/) 選擇或建立課程專用專案，記錄本機代稱；本系統不建立公開部署。
2. 進入「APIs & Services → Library」，搜尋 Google Sheets API 並啟用。只讀寫已知網址不需另啟 Drive API。
3. 若組織禁止啟用 API、建立服務帳號或 key，請管理者處理並記為環境阻礙；不要自行改 OAuth 或公開文件存取。
4. quota 問題看專案 Google Sheets API 的 quota 頁，避免用學生每次提交呼叫 Google；本系統只在準備與老師手動寫回呼叫。

官方：[建立 Workspace credentials](https://developers.google.com/workspace/guides/create-credentials)、[Sheets scopes](https://developers.google.com/workspace/sheets/api/scopes)。

## 3. Service Account 建立與安全配置（首次安裝由管理人員執行）

1. IAM & Admin → Service Accounts → Create service account，使用專用課程服務身分。
2. 記下服務帳號電子郵件供文件分享，不授予專案 Owner／Editor 來取得 Sheets 權限；Cloud IAM 不等於文件 ACL。
3. 不啟用 domain-wide delegation、不冒用老師／學生。系統只請求 spreadsheets scope。
4. 若本機採 JSON key，在該服務帳號「Keys → Add key → Create new key → JSON」下載後，立即移到 repository 外的受控資料夾，例如 `$env:LOCALAPPDATA\ClassroomQuiz\credentials\service-account.json`。這只是路徑範例，不含真實 key；不可放 ClassroomQuiz／Downloads 的待提交檔案內。
5. 將目錄／檔案 Windows 安全性權限限制給執行後端的本機使用者及必要管理者；不要透過前端上傳、聊天貼 key 或放雲端同步公開目錄。使用完不需要的 key 應在 Console 撤銷／刪除，外洩時先撤銷與輪替，不只改 Git。
6. 後端檢查 key 為 service_account、絕對及canonical路徑在 repository 外、token endpoint為固定Google端點。若需要其他免 key 工作負載身分，須另驗本機環境，不在本版自動改設定。

不要使用 VITE_GOOGLE_*、前端 .env 或硬編碼 JSON。`.gitignore` 的 `.env*` 不會自動保護任意名稱 JSON，所以實際 key 必須在 repo 外；範例 env 只列變數名稱與空值。

官方：[金鑰安全建議](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)。

## 4. 兩份 Google Sheets 與分享權限

由擁有者準備 **兩份不同 spreadsheetId** 的 Google Sheets（不是同一份的兩個 gid），可手動複製範本。若來源仍為 Drive 中 XLSX，先轉成 Google Sheets 格式。每份按 Share，將服務帳號電子郵件加入為 **Editor**；不改成「知道連結即可編輯」。學校可能禁止與此身分分享，需依管理政策處理。

範本 A：六題Q1..Q6，每個答案格僅放對應整格純文字`{{Q1}}`、`{{Q2}}`、`{{Q3}}`、`{{Q4}}`、`{{Q5}}`、`{{Q6}}`，位置任意。範本 B：相同六題改放不同列欄／跨分頁，至少一題位於隱藏GRID、一題位於合併左上主格。一般產品來源可為Q1..QN，不寫死六題；live自動suite最低三題，這與六題展示範本不同。測試座標只屬該範本，不寫入應用程式。

兩份應包含題目、非答案公式、整格字型／底色／框線、行列尺寸，以及非答案格局部文字格式，以驗證不被改寫。**答案標記格不得有局部文字格式**；若先前由局部字元設定樣式，須人工整理成普通純文字標記再對整格設定樣式。系統拒絕時依格址修正，不自動清格式。

以專用錯誤範本另外測 Q1/Q3 缺號、跨表重複、公式顯示標記、混字／空白、局部格式答案格及無標記，預期拒絕整份來源。非 GRID 分頁列為未納入；不要把題目放在該範圍。

### 權限提示的正確解讀

- 已確認原表唯讀或任一答案格有不可編輯保護 → 準備拒絕，先修正分享／protected range 後重試。
- 可讀且其他來源驗證通過，但不能非破壞性確認可寫 → 可以建立，老師端須顯示「寫入權限尚未確認」。這不是已授權證明，也不是可忽略分享步驟。
- 不用臨時寫字／清空格測權限；來源可讀、權限預檢通過都不能保證之後不被撤權。任意寫入仍以 Google 當下權限為準。

## 5. 設定環境變數及啟動

以下是本地指令，從專案根目錄執行；不將機敏值寫進 Git 或測試輸出。

```powershell
Set-Location 'C:\NCU\CSIE\software-engineering\ClassroomQuiz'
node --version
npm --version
npm --prefix backend ci
npm --prefix frontend ci
$env:ADMIN_PASSWORD = Read-Host '設定本機老師管理密碼'
$env:GOOGLE_APPLICATION_CREDENTIALS = (Read-Host '請貼上 repository 外的 Service Account JSON 絕對路徑').Trim().Trim('"', "'")
npm --prefix backend run dev
```

可直接貼上Windows「複製為路徑」的結果，不需要手動刪除引號；處理外層空白、單／雙引號且保留路徑中的空白。這只整理輸入，不檢查檔案內容；本指引不要求顯示JSON。不要印出credential內容。ADMIN_PASSWORD 空白應拒啟動；憑證錯誤應於 Google 功能回安全提示，不能以缺憑證使既有單元測試或無活動健康檢查必然失敗。後端原本不會自動載入 .env，本計畫保持明確環境設定。

另一個終端：

```powershell
Set-Location 'C:\NCU\CSIE\software-engineering\ClassroomQuiz'
npm --prefix frontend run dev
```

開啟 [老師端](http://localhost:5173/?role=teacher)，以管理密碼登入；學生用隔離設定檔開 [學生端](http://localhost:5173/?role=student)。Google Token 只在後端，不傳瀏覽器。Vite 僅代理既有 localhost 後端；不將服務綁到公開 IP。

## 6. 讀取與完整搶答

1. 老師先設定三組，貼範本 A 的標準編輯網址 `https://docs.google.com/spreadsheets/d/<id>/edit#gid=<gid>`。不直接輸入 ID 或格址。
2. 點讀取，確認來源名稱、總題數、excluded 分頁與權限訊息。讀取期間組數／來源互斥；錯誤不得形成可開始的半場活動。尚未設組直接讀應先拒絕，不保存來源草稿。
3. 學生三組加入，Q1 手動開始。WAITING／空白／重複提交均拒絕；正常連線各端更新與老師新提交仍 <=2 秒。
4. 讓至少兩組依受控順序提交，第一筆最快，其他組仍可提交。閉題前學生只見自己的資料，閉題後公布所有答案／順位；不要從裝置時間猜順位。
5. Q1 閉題，下一題只到 Q2 WAITING。Q2 無人也能閉題。Q3 用 `=1+2` 或多行中文作答，其餘Q4～Q6逐題開始／閉題，最後Q6閉題直接COMPLETED。
6. 在 WAITING／ANSWERING／RESULTS／COMPLETED 刷新／重連，仍恢復原組及該身分可見狀態，不自動重送答案。未提交的輸入框文字不保證刷新保存；斷線時提交不可用，恢復後需依實際已提交狀態決定，不自動補送。真實重連要觀察斷線再恢復，不把只有F5當作斷線驗收。

最短Windows期末展示：依第5節開兩個終端啟動；四個獨立瀏覽器設定檔（老師＋三組）照以上六題腳本；在各階段刷新／重連，再依第7節寫回／比對／重複。同設定檔新視窗與多個共用無痕視窗不能當不同學生。若只展示而非完整人工驗收，不宣稱全部未驗細項已PASS。

## 7. 手動寫回原表及再次寫回

1. 老師按「寫回 Google Sheets」，等待本機操作狀態；只寫當次快照中已閉題且有提交的最小順位答案，無人與未閉題保留標記。無符合題目時不發寫入。
2. 操作接受不是成功；須讀回核對後顯示逐題結果。開啟同一原表確認位置、完整文字與字串型別（等號答案不是計算結果），逐表比對非答案公式定義、局部格式、整格樣式、合併與尺寸。
3. 同活動再按寫回，已成功格雖無 `{{Qn}}`，仍須依活動 Evidence／原映射正確略過，不報缺號。稍後其他題閉題後可再加入新快照；正在處理或待核對時不並行寫。
4. 活動期間不要由外部編輯者改題目結構或答案格；系統不是 Google 鎖。若人工改值／公式／移格／新增局部格式，預期停止未送出的更新，不能強制覆寫。為測衝突可用專用表受控改動，記錄後依提示恢復，不在正式活動隨意操作。
5. 寫入逾時／網路中斷：先看「結果待核對」，重新取得狀態，再由老師手動核對原操作；不要連點、換快照或重啟企圖取消。原請求仍可能晚到。若不能安全證明舊寫已結束且部分仍是標記，系統可維持待核對，不能為了成功而重送。
6. 確定授權錯誤則修正分享／保護範圍，活動資料仍留；若結果可能送達，仍按 pending 規則核對。Google 授權錯誤不表示老師本機登入失效。

### FAILED／CONFLICT／PENDING操作分流

| 內部狀態／畫面 | 應做的操作 |
| --- | --- |
| FAILED／寫回未完成 | 先查最新status、running與canReconcile；running=false、canReconcile=false且無其他未解操作，才修權後明確新寫回。同活動答案保留，不把一般失敗歸因為保護格拒絕 |
| CONFLICT／來源衝突 | 檢查安全位置／原因，不強制覆蓋。canReconcile=true代表仍需核對原操作；不可直接另建操作。外部值如何處理先由擁有者確認，不自動還原 |
| PENDING_VERIFICATION／結果待核對 | 原Snapshot／Evidence／operation必須保留；查詢不會重送。只有按「核對原寫回操作」才啟動原操作恢復；它不是純只讀保證，安全條件滿足時可能續寫剩餘格 |
| running=true | 不重啟、不並行寫，等待原操作或保留待核對 |

「重新取得寫回狀態」的GET僅讀本機記憶體，不呼叫Google或reconcile。老師畫面獨立狀態標題可區分FAILED與PENDING，下面一般錯誤訊息不代表精確Google原因。若需確認，在瀏覽器Network查看本機GET `/api/activity/guided-notes?activityId=…` 的latestWriteback，只回報status／running／canReconcile；勿匯出HAR／完整回應／Token。舊UNKNOWN且仍有未完成marker可永久pending；本機settle／200秒不是遠端取消證據。

## 8. 換另一份表與範本重用

目前沒有重設／新活動API或按鈕。確定前次寫入已完成、無running／pending／未解晚到風險後，在原後端PowerShell按Ctrl+C待回提示字元，再執行`npm --prefix backend run dev`（原終端安全環境變數仍有效），建立全新活動（舊 Session 失效），老師重新登入，設定組數並貼範本 B 網址。驗證不同 ID／分頁／格址仍正確且 hidden 分頁題目算入；重做完整流程與原表比對。不能把同一表另一個 gid 當成第二份來源。

同活動重複寫回依本機 Evidence；**新活動／重啟後不能沿用該證據**。已填答案原表要重用，先人工把每個答案格恢復為完整 `{{Q1}}`..`{{QN}}`，或自行從乾淨範本複製新表並再次分享服務身分。再讀取時必須完整標記驗證，不猜答案為標記。

沒有自動還原／複製功能。重啟不取消遠端請求，若前次結果仍不明，先核對完成再人工還原；不要讓舊寫覆蓋剛恢復的標記。

## 9. 開發者：自動測試、live 與人工紀錄

離線命令（不等於兩表真實及人工驗收已完成）：

```powershell
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
$env:E2E_FRONTEND_PORT = '5273'
$env:E2E_BACKEND_PORT = '3100'
npm --prefix frontend run test:e2e
```

不停止使用者原3000／5173活動；假資料使用獨立記憶體／DI Google fake。首次若缺Chromium，可由開發者執行`npm --prefix frontend exec -- playwright install chromium`（會下載browser，本輪不執行）。

已建立的 `test:live` 只匹配 `backend/tests/live/*.test.js`，不混入預設 test。只由使用者在本機明確啟用；操作前確認只指向兩份可寫的專用測試表並準備可還原基準，live suite會寫答案。缺opt-in／完整設定／專用表確認時SKIP／NOT RUN，不能標live PASS；相同ID或repo內key等不安全配置直接失敗且不讀key。實際使用key前仍由後端檢查canonical路徑與內容。

```powershell
# 在獨立測試終端先重做第5節的憑證路徑設定；以下acceptance會真的寫表。
# 下列變數於本機輸入，不提交真實 ID／key／Token。
$env:RUN_GOOGLE_LIVE_TESTS = '1'
$env:GOOGLE_TEST_SHEET_A = Read-Host '專用測試表 A 的 spreadsheetId'
$env:GOOGLE_TEST_SHEET_B = Read-Host '專用測試表 B 的 spreadsheetId'
$env:GOOGLE_LIVE_CONFIRM_DEDICATED = Read-Host '確認兩份專用表、完整標記、無外部編輯且允許寫入，輸入 YES'
$env:GOOGLE_LIVE_MODE = 'acceptance'
try {
    npm --prefix backend run test:live
    Write-Host "Live test exit code: $LASTEXITCODE"
}
finally {
    Remove-Item Env:RUN_GOOGLE_LIVE_TESTS -ErrorAction SilentlyContinue
    Remove-Item Env:GOOGLE_LIVE_CONFIRM_DEDICATED -ErrorAction SilentlyContinue
}
```

live預設acceptance要求每份至少Q1..Q3；B須含hidden上的標記與合併主格，兩表映射不同，並在任何寫前驗兩來源完整。先測Q1最小rank、重複略過，再保留Q2無人與Q3未閉題、最後寫Q3文字；只用合成測試答案。非答案公式／cell格式／merge／結構以API回傳欄位比較，行列像素尺寸等仍需人工視覺核對。任一失敗停止，不繼續下一份表或自動重跑。完整前置、protected／read-denied唯讀模式及活動後撤權人工步驟見[真表驗收](../../tests/records/002-google-sheets-integration/live.md)。

live測試不得自動覆蓋非標記或衝突內容。每次跑前確認無舊未知請求後，才手動恢復標記或複製新範本；兩ID必須不同。唯讀／保護格／撤權測試使用人工切換權限或專用負面配置，不能由應用增加分享管理API。fake transport的timeout／晚到競爭用可控時序測，真實網路錯誤只記實際發生，不把route mock當Google逾時證據。執行完於測試終端Remove-Item Env:RUN_GOOGLE_LIVE_TESTS及Env:GOOGLE_LIVE_CONFIRM_DEDICATED以恢復預設停用；不刪除credential檔案。

測試計畫完整矩陣見 plan.md。每筆結果在 `tests/records/002-google-sheets-integration/` 記日期、版本、命令／步驟、來源代稱 A/B、預期、實際、PASS／FAIL／NOT RUN、經遮蔽證據與人工回報來源。人工不由自動代填；不得記原始 Authorization、credential JSON、Google error config 或真實學生答案。兩份真表實測與人工審閱缺一不得宣稱整合完成；目前T057／T059已接受，但T062–T064尚未完成。

## 10. 常見錯誤排除

| 現象 | 檢查與處置 |
| --- | --- |
| 路徑附引號／憑證不存在／invalid_grant | 使用第5節Trim輸入，在同後端終端設定repo外絕對路徑；檢查JSON類型、key 是否撤銷、系統時間；不要把 key 貼入日誌，不改前端 env |
| API 未啟用 | 在 credential 所屬 Cloud 專案啟用 Sheets API，不只是老師個人的其他專案 |
| 來源無法存取／不存在 | 確認標準網址、已轉 Google Sheets、分享給正確服務帳號；無權與不存在不一定可區分，不宣稱一定刪檔 |
| 已知不可編輯 | 檢查 Share=Editor、答案格／整表保護及 unprotectedRanges；修正後重試，不以測試寫字驗權 |
| 寫入權限尚未確認 | 符合 Q3 的正常提示；再由擁有者查分享，不當作可寫保證，等待實際寫回結果 |
| 缺號／重複／格式 | 全支援分頁（含 hidden）找原標記、公式、局部字元格式；只手動整理，不刪除題目以規避驗收 |
| 改用第二份表讀不到 | 新表也須分享，網址 ID 不同且完整標記；不能只換 gid、未建立新活動就換來源 |
| 寫前衝突 | 檢查原位置／值／合併／結構；停止本次未送更新，不強制覆蓋；已寫答案依 Evidence 判斷，不要求同場全表標記恢復 |
| 429／暫時遠端錯誤 | 減少操作，讀取有限退避；寫入不背景重送。若可能已送達，手動核對原操作 |
| timeout／結果待核對 | 不以200秒本機或180秒伺服器處理界線當取消證據；先查 operation，無法安全恢復時保持 pending |
| 回填過大／無法表示答案 | 保留原搶答結果與原表，回報具體錯誤，不截斷答案／偷偷分批，必要時回設計審查 |
| 埠3000／5173已占用 | 先確認是否既有活動；不要殺程序或另開第二後端，僅在安全終態後由操作者停止舊服務。前端strictPort不會自動換埠 |
| Google 斷網但活動已開始 | 搶答仍應可進行；準備／寫回報錯即可，不改後端順位、閉題或學生隔離 |

## 11. 圖表與交付關卡

三份 `diagrams/002-*.puml` 與 PNG 必須存在；後續改圖用既有 CLI 重產，逐項核對程式責任／模型／時序，不以可渲染取代一致性驗證。001 文件／舊圖／驗收證據保留。

Plan／Tasks及US1–US4人工接受依review-record.md；本指引不能代替最終接受。離線實際數量與21FR／7SC／26場景追溯見[Final矩陣](../../tests/records/002-google-sheets-integration/final-acceptance.md)。T057兩表live、T059完整人工已接受，各歷史局部證據仍保留；T058依DA-T058-01有限接受，T062圖表與T063矩陣已完成，T064最終接受尚未完成。不要將文件更新日期當作實際測試日期。

## 12. T064前的獨立Excel退役維護

2026-11-19清理移除舊Excel執行方法、專用helpers／tests／generator與下載helper；舊export410及驗權、multipart拒絕仍保留。JSZip保留為devDependency，npm ci供開發測試安裝；產品runtime不再載入ExcelJS／OOXML工具。必要靜態XLSX只作001歷史，不是現行可匯入資料。

本輪Playwright1.65.0已由鎖定frontend依賴安裝，Chromium安裝指令exit0，21項E2E實際通過；T061當時未安裝的紀錄是歷史，不是本輪限制。沒有真Google測試重跑。後端沒有build script，執行node --check、模組載入及隨機本機埠health smoke，不虛構backend build PASS。新結果及回復方式見[清理紀錄](../../tests/records/002-google-sheets-integration/excel-retirement.md)。
