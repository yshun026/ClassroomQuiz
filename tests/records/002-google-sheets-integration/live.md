
## 最新T058內部有限證據接受：DA-T058-01（2026-11-18）

使用者明確核准的專案內部驗收決策，不代表課程助教或跨組偏差接受。正式條件與需求逐項證據矩陣見 [t058-negative-write.md](t058-negative-write.md) 頂部DA-T058-01。T058-1／2／3為使用者人工PASS，T058-4為使用者真實live PASS；只按已回報範圍接受。已知DENIED準備拒絕真實證據及保護專屬拒絕歸因NOT VERIFIED；遠端恰一次完整真實證據NOT VERIFIED；真實斷線／逾時／PENDING reconcile NOT RUN。原protected MISSING／UNKNOWN FAIL保留，不改assertion或FR-006／FR-018／UNKNOWN屏障、不盲重送要求。

T058依修訂後有限證據標準完成，59/64；不表示所有live案例PASS或完整Feature接受。T059未開始，T061–T064仍待；原PENDING／58/64敘述保留歷史時點，以上述決策為目前狀態。

---
# T057–T058 真實 Google API：NOT RUN／PENDING

**T058診斷更新**：已依使用者授權新增protected模式固定安全診斷，實作及離線結果見[protected-diagnostic.md](protected-diagnostic.md)。首次真實protected失敗仍未定位；使用者已確認完整marker及Q1 UI保護五項條件。本輪沒有重跑真API，T058仍PENDING。下一次protected輸出會多`protected diagnostic: P_...`；只有P_DENIED_CONFIRMED且test PASS才滿足本項條件，多碼僅為觀測，不是已證實根因。

**最新結果：T057 USER_REPORTED_LIVE_PASS；T058仍PENDING。** 下文NOT RUN表格為先前準備時點，保留歷史；本次使用者提供的實際測試日期為2026-11-18，A/B各6題、各2批、pass1／fail0、exit0及原表比對均已回報，完整記錄見文末。不代表代理獨立重跑或完整人工Final通過。

文件準備日期2026-11-18，非實際測試日期。代理本輪未使用私人JSON／Token、未呼叫真Google。本檔是由使用者自行執行的步驟與空白驗收表，不是PASS紀錄。既有user-real-read.md及user-real-write.md僅是使用者局部成功回報，不代表下列兩表完整測試。

## 前置（T003／T004未勾選）

1. 使用者確認Cloud專案已啟用Sheets API；Service Account專用、沒有網域委派，JSON為service_account且放repo外、檔案ACL限制適當。只回報完成與否，不傳key、Token或實際路徑。
2. 提供兩份**不同ID**的專用Google Sheets A/B，分別分享服務帳號Editor。兩份完整Q1..QN至少3題；B的標記必須包含hidden GRID與合併主格，A/B位置映射不同。兩份包含非答案公式、非答案rich text與整格格式／merge／尺寸。答案格無局部文字格式。不要用唯一正式課程原表。
3. 人工保存基準、停止外部編輯；確認沒有前次pending／可能晚到寫入後，才手動還原標記或複製新範本。此測試不自動恢復／複製／分享。前驗與batch不是Google CAS鎖。

## T057：由使用者明確啟用正向驗收

在測試專用終端、專案根目錄執行（不輸出機敏值）：

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = (Read-Host '請貼上 repository 外的 Service Account JSON 絕對路徑').Trim().Trim('"', "'")
$env:GOOGLE_TEST_SHEET_A = Read-Host '專用 A spreadsheetId'
$env:GOOGLE_TEST_SHEET_B = Read-Host '專用 B spreadsheetId'
$env:RUN_GOOGLE_LIVE_TESTS = '1'
$env:GOOGLE_LIVE_CONFIRM_DEDICATED = Read-Host '已核對兩份專用乾淨範本且允許寫入，輸入 YES'
$env:GOOGLE_LIVE_MODE = 'acceptance'
npm --prefix backend run test:live
```

- 預設test只含unit／integration，不會跑此目錄。沒有RUN=1或完整配置／YES，live回0 PASS、1 SKIP／NOT RUN；這不是Google驗收成功。相同ID、不合法ID或repo內credential路徑拒絕，實際key仍由後端canonical-path／service-account驗證。
- 測試先讀兩份完整來源、驗B hidden／merge與不同映射，再依A→B串行執行。第一個失敗立即停止整個流程，不繼續B或自動重送。
- 每份測試建立三組記憶體活動；無fills零寫；Q1第2組先提交、另一組較晚，驗最小rank答案` =1+2\n中文😀 `逐字及字串型別。第一次寫Q1；再次寫略過。Q2無人閉題、Q3未閉題時都保留marker；之後Q3提交`=1+2\nUnicode Ω 😀\n_x0041_`並閉題，再只寫新答案。每份預期總2個明確batch，Q2及其他未閉題格不變。
- 比較API讀取到的所有非答案值／公式定義／cell格式／局部格式／merge／分頁屬性／結構，目標只允許stringValue變更。公式effective計算結果不比較。API未讀取的行列像素尺寸等，另由人工肉眼比對，不能宣稱測試已涵蓋。
- live透過真SheetsAccess及正式後端domain／coordinator，不跑瀏覽器。HTTP／Socket／UI由離線套件與下列人工驗收各自驗證。
- CLI使用獨立、短生命週期記憶體活動，不是目前瀏覽器服務的operation。若CLI結果不明，不可在另一個UI假裝接管核對該快照；先保留輸出並人工核對原表／舊請求，或改用不同ID的全新專用副本，不能立即還原舊表重跑。程序結束不取消可能晚到的寫入。
- 若FAIL或pending，保留本機輸出／原表狀態，先人工核對舊寫結果；**不要直接再跑**（suite會用新活動，不能沿用舊Evidence）。只記來源A/B、遮蔽結果；不收錄原始Google錯誤／ID／key／真學生資料。

## T058：受控權限切換（全部PENDING）

各案例使用獨立乾淨副本或依安全條件重用；權限只能由使用者在Google UI自行調整，應用不呼叫分享管理API。

| 案例 | 操作與執行 | 預期與驗收條件 | 實際 |
| --- | --- | --- | --- |
| 已知保護格不可編輯 | 先在A建立含答案格的非warning保護並排除服務身分；維持可讀，設定GOOGLE_LIVE_MODE=protected後執行test:live | Sheets提供requestingUserCanEdit=false時parser回SHEETS_NOT_EDITABLE，零寫入；若API未提供足夠資訊，不能虛構DENIED，記觀察與待確認，不標此案例PASS | NOT RUN |
| 文件不可讀 | 使用者撤銷A讀取分享，排除其他繼承權；模式read-denied執行 | 安全SHEETS_ACCESS_UNAVAILABLE、零寫入；不能僅由無權推定檔案刪除或已知寫入權false | NOT RUN |
| UNKNOWN但有效來源 | 恢復專用A可讀／可編輯，依quickstart在瀏覽器準備 | 沒有非破壞性可寫證據時允許一次建活動，老師顯示未確認；讀取不等保證可寫，不寫測試字檢查權限 | NOT RUN |
| 活動建立後拒寫 | 在瀏覽器先載入乾淨A、搶答閉題，再由使用者將分享降為Viewer或限制答案格；按一次手動寫回 | 前驗已知拒絕或Google明確拒絕，活動／答案／rank保留；Google錯誤不清老師Session；無自動重送。修復後依FAILED或pending的原狀態處理 | NOT RUN |
| 修權後恢復 | 人工確認無舊未知請求、修復分享；FAILED可新明確寫回，pending只核對原操作 | 全來源前驗、Evidence及原快照守衛；UNKNOWN且有marker仍可pending，不強制成功 | NOT RUN |
| 真實斷線／逾時 | 僅記實際發生情形，不為湊結果宣稱已測；未知結果不重啟取消 | 原快照／barrier保留、先核對不盲重送；fake時序案例不補作真網路證據 | NOT RUN |

唯讀／protected模式不寫表；仍須本人顯式設定gate，並確認操作對象。模式完成不代表acceptance兩表通過。

## 使用者回填結果

| 項目 | 實際操作日期 | 預期 | 實際／證據 | 狀態 |
| --- | --- | --- | --- | --- |
| T003 Cloud／SA／repo外key／ACL完整確認 | 未提供 | 各項確認、不傳機敏資料 | 僅既有局部讀寫成功回報 | PENDING |
| T004兩份專用來源與分享／範本 | 未提供 | 不同ID、B hidden／merge、格式基準 | 未提供完整確認 | PENDING |
| A讀取／文字／最小rank／略過／保真 | 未執行 | 全部assertions且人工補充尺寸 | — | NOT RUN |
| B不同映射／hidden／merge及同上 | 未執行 | 全部assertions | — | NOT RUN |
| T058權限案例 | 未執行 | 逐項如上 | — | NOT RUN |

測試結束在測試終端清除RUN_GOOGLE_LIVE_TESTS／GOOGLE_LIVE_CONFIRM_DEDICATED環境變數以免誤啟用（不刪key、不修改Cloud）。兩表及權限案例都需實際結果才能勾選T057／T058。

## 使用者實際執行回報：T003／T004確認、T057通過

實際測試日期：**2026-11-18**（使用者明確提供）。證據來源：本對話使用者提供的文字輸出及原表人工觀察，代理未自行呼叫Google或取得未提供的截圖／原始log檔。

- T003：API已啟用、專用Service Account、無網域委派、JSON在repo外、ACL已確認，記USER_CONFIRMED。
- T004：A/B不同ID、兩份均Editor、完整標記、B含hidden與merge、基準已保存，記USER_CONFIRMED；正向runner通過亦支持不同映射及B標記所在hidden／merge條件。沒有記錄真實ID／網址／電子郵件／key路徑。權限切換等負面實測仍屬T058，未宣稱已執行。
- 執行命令：npm --prefix backend run test:live。

使用者提供輸出：
```text
✔ Google Sheets real API acceptance
ℹ A: verified, questions=6, explicit batches=2
ℹ B: verified, questions=6, explicit batches=2
ℹ pass 1
ℹ fail 0
退出碼：0
```

原表觀察：使用者確認A/B的Q1／Q3已正確寫入、Q2保留標記、其他內容與格式無非預期變更。兩個verified訊息依現有runner是在各來源全部exerciseSource assertions完成後才輸出，包含最小rank／精確字串／重複略過／未閉與無人保marker／API回傳欄位保真。僅按本次提供輸出與觀察記T057 USER_REPORTED_LIVE_PASS，不虛構未提供的其他結果欄位。

### 先前失敗歷史保留

使用者先前回報tests1／pass0／fail1／skipped0，錯誤LIVE_ACCEPTANCE_FAILED: setup/permissions/content require local review; no private error details recorded，且當時唯讀觀察A/B Q1／Q3仍原標記。該次實際測試日期未提供，不推定與本次相同；原標記觀察不能證明零送寫。唯讀分析僅確認統一catch無法辨識失敗階段，沒有證實根因。本次成功不回填前次根因、修正方式、取消或未送達證明；未提供的細節仍未知。

### 後續範圍

T003／T004／T057依使用者本次明確確認及真API輸出勾選完成。T058分享／保護／撤權、T059老師三組／兩表四階段完整人工驗收及T064最終接受仍PENDING；正向live PASS不替代這些項目。若後續還需乾淨標記，僅在確認舊請求安全後由使用者另備新專用副本或自行還原，本輪代理不改真表、不重跑測試、不讀key。

## 2026-11-18 T058補充方案已授權，實測仍PENDING

原 protected assertion 保留：只有 parseSource 拋出 SHEETS_NOT_EDITABLE 才 PASS。使用者回報 P_EDITABILITY_MISSING／P_EDITABILITY_UNKNOWN、pass0／fail1／exit1；實際執行日期未提供。fields 已要求欄位且正規化保留 false，缺欄原因尚未證實；不得以 MISSING 推論 DENIED。

最新驗收拆為 K已知拒絕準備、U未知警告放行、N真實回填遭拒保留結果及R修權恢復，完整步驟與可靠拒絕分類限制見 [t058-negative-write.md](t058-negative-write.md)。N僅由老師手動正式回填，不於準備試寫。現有三種 live mode 不變，沒有新負向命令。K真實證據仍缺；N/R NOT RUN；T058未完成。

## 2026-11-18 測試層診斷實作（不是真實驗收）

新增 backend/tests/helpers/write-denial-diagnostics.js 與 unit/write-denial-diagnostics.test.js（7項離線測試）。僅供測試注入既有 SheetsAccess fetch seam，沒有修改產品或live runner，沒有新增模式／診斷端點／憑證讀取／真API呼叫。原 protected assertion 不變。

觀察器只在產品消費 text/json 完成後記固定代碼，不主動讀body、不解析或輸出私人錯誤、不複製回應內容、不重試。writeRequests是測試transport呼叫次數，不是遠端已提交證據。固定事件如下：

| 條件 | 代碼 | 證據限制 |
| --- | --- | --- |
| 寫入完整403／404 | N_REJECTED_UNATTRIBUTED | 不區分保護、分享不足、撤權或不存在；不算保護PASS |
| 完整401 | N_AUTH_REJECTED | 認證拒絕類別，不推測具體帳號／憑證原因 |
| 完整429 | N_QUOTA_REJECTED | 限流／配額拒絕類別 |
| 完整400 | N_REQUEST_REJECTED | 請求拒絕，不排除錯誤內容實際涉及保護；不猜原因 |
| 寫入2xx且body完整 | N_UNEXPECTED_ACCEPTED | 僅Google接受，不證明答案已讀回；負向案例停止，意外接受不得算PASS |
| 寫入transport拋錯、body中斷、5xx或其他未辨識status | N_OUTCOME_UNKNOWN | 不分網路／伺服器具體根因，保持原產品pending政策 |
| GET完整成功 | N_READ_COMPLETED | 不證明可寫 |
| GET完整403／404 | N_READ_ACCESS_UNATTRIBUTED | 不能證明撤權、刪除或寫權拒絕 |
| GET其他失敗／body失敗 | N_READ_FAILED（401另用N_AUTH_REJECTED） | 不輸出原始錯誤 |

產品尚未消費body時不產生完成事件。產品逾時後晚到的transport事件不具有更新operation的權力，不能推翻PENDING；必須同時查看原coordinator狀態／transport settlement，診斷本身不提供安全重送授權。tokenProvider在fetch之前失敗時沒有transport事件，不能將空事件推定零權限或成功。

官方核對：Sheets公開錯誤參考沒有在已查文件中提供可依賴的保護專屬機器判準；一般PERMISSION_DENIED不是保護專屬。因此未實作N_PROTECTION_DENIED，也未宣稱能確定區分文件分享不足與保護拒絕。參考 https://developers.google.com/workspace/sheets/api/troubleshoot-api-errors 與 https://developers.google.com/workspace/sheets/api/reference/rest/v4/ErrorCode 。

目前僅完成可安全確認的診斷基礎。沒有接入老師UI測試啟動器；一般dev服務不會載入此helper，也沒有可直接使用的新負向test:live命令。若要求一次真人操作即可取得可信保護歸因及遠端次數，尚不具完整條件。需另行核准測試專用啟動／注入流程及可驗證的保護專屬證據；不能以合併產品碼、任意403或訊息字串猜測補足。T058保留PENDING／58 of 64。

## 2026-11-18 使用者回報：T058-U UNKNOWN警告與正常建立活動 PASS

實際驗收日期與本次確認日期均為2026-11-18。證據來源為本對話使用者文字回報，代理未自行操作／呼叫API，沒有新增或取得截圖。

- 參與組數3；活動WAITING；題目6；納入工作表1。
- 老師端顯示「寫入權限尚未確認」；使用者確認Google Sheets原始標記完整。
- 判定：僅T058-U「UNKNOWN警告與正常建立活動」記USER_REPORTED_MANUAL_PASS，對應FR-006未知權限分支。
- 不證明來源可寫、Google遠端零寫入請求、提交／閉題後行為、保護拒絕歸因或完整Final通過；未提供的細節不補填。
- 保留現有活動，尚待正式手動負向寫入與恢復。K已知DENIED真實證據仍缺；N拒寫安全行為／讀取撤權／R修權恢復仍待驗。T058整體未完成，總58/64，無任務勾選變更。

## 2026-11-18 T058-2 使用者回報：失敗後資料保留 PASS

使用者回報實際日期2026-11-18：老師手動寫回一次後顯示「寫回未完成」；後續確認訊息「Google Sheets 暫時無法使用，請稍後再試」，Q1顯示未寫入。兩組有效答案與順位1／2均保留，老師Session有效，活動仍第1題RESULTS，原始{{Q1}}未變。使用者另按一次「重新取得寫回狀態」，畫面未變。

僅將「失敗後活動、答案、順位與Session保留」記USER_REPORTED_MANUAL_PASS。一般錯誤不證明Google已收到或拒絕寫入，也不歸因保護範圍；原標記未變不證明舊請求安全結束。尚未提供本機GET的status／running／canReconcile欄位，未自行記錄其實際值。原protected已知DENIED真實證據仍缺，恢復／讀取撤權仍待驗。T058未完成，58/64不變。代理僅更新紀錄及唯讀分析，未執行API／寫回／reconcile／重啟／測試、未讀私鑰、未commit／push，無截圖或其他細節補造。

## 2026-11-18 T058-3 修復權限後安全恢復：USER_REPORTED_MANUAL_PASS

使用者提供實際驗收日期2026-11-18：原operation確認FAILED、running=false、canReconcile=false；保留同一活動，使用者移除專用測試表Q1答案格保護，再由老師明確點一次寫回。老師端顯示成功，原表Q1為順位1完整答案、順位2未覆蓋，其他未完成題目保留標記；兩組答案、順位與老師Session均保留。僅保存必要題號，不記私人來源／座標／帳號。未提供截圖，不補造。

本子情境記USER_REPORTED_MANUAL_PASS，對應FR-018／US4.7恢復證據；補充先前尚未提供的原operation狀態。T058-1／2／3子情境已依使用者回報通過，不推定完整T058或Final通過。先前存取錯誤仍未歸因保護專屬拒絕；原protected MISSING／UNKNOWN失敗歷史與已知DENIED真實證據缺口保留。T058整體PENDING，58/64不變。下一個全新副本read-denied案例NOT RUN；代理未執行真API、讀key、改表、重啟、commit或push。

## 2026-11-18 T058-4 撤銷讀取存取：USER_REPORTED_LIVE_PASS

實際日期2026-11-18。使用者確認已對全新專用測試副本撤銷Service Account讀取存取，執行GOOGLE_LIVE_MODE=read-denied，回報：

```text
✔ Google Sheets real API acceptance
A read-denied safe error observed; this does not prove known write denial
tests 1
pass 1
fail 0
skipped 0
Read-denied test exit code: 0
```

證據分類USER_REPORTED_LIVE_PASS，對應T058讀失敗安全錯誤／FR-018；並非代理獨立執行。現有runner只GET A，B僅配置檢查，該分支不寫A/B；這是程式路徑核對，不捏造遠端請求監控。使用者撤權操作加真實安全錯誤支持此子情境，不由錯誤碼單獨推定撤權／不存在，不證明保護範圍專屬拒絕。原protected P_EDITABILITY_MISSING／UNKNOWN失敗保留。

### 最新T058證據總表（覆蓋先前NOT RUN快照的狀態，不改寫歷史）

| 子情境 | 最新證據／狀態 | 限制 |
| --- | --- | --- |
| T058-1 UNKNOWN警告與活動建立 | USER_REPORTED_MANUAL_PASS | 不證明可寫或遠端零寫入請求 |
| T058-2 失敗後活動／兩組答案順位／Session保留 | USER_REPORTED_MANUAL_PASS | 前置讀失敗與遠端寫拒絕無法由一般錯誤區分；不宣稱保護專屬拒絕 |
| T058-3 FAILED安全結束後同活動修權手動恢復 | USER_REPORTED_MANUAL_PASS | 原FAILED/running=false/canReconcile=false有使用者確認；不將舊錯誤追認為保護拒絕 |
| T058-4 撤讀權安全回報 | USER_REPORTED_LIVE_PASS | live pass1 fail0 skip0 exit0；不證明已知寫拒絕 |
| K：真實已知DENIED拒絕準備 | NOT VERIFIED，原protected實測FAIL | requestingUserCanEdit缺失維持UNKNOWN；不以離線測試冒充真實證據 |
| N：Google明確拒寫且保護專屬歸因／精確遠端無重送 | NOT VERIFIED | 現有老師畫面／合併錯誤碼不足；T058-2只是安全行為PASS |
| 真實結果未知／逾時及原operation核對 | NOT RUN | 任務要求只記實際發生，不要求為湊證據刻意製造；離線回歸證據另列 |

T058整體PENDING，仍58/64。沒有尚未執行卻補記PASS的項目。可選的後續安全補強是：保留原表與程序，對同一撤權新副本由使用者恢復分享，再以另一次明確只讀觀察驗可讀；或在隔離場次驗準備讀失敗無半場活動。這些不是現有read-denied已驗內容，也不能填補K／N專屬證據缺口；不需重跑已通過案例或動T057證據表。

### 正式結案提案，等待人工批准，未執行

可提出有明確限制的驗收偏差／證據接受紀錄：產品FR-006明確false才DENIED、UNKNOWN警告、FR-018結果保留及UNKNOWN不重送均不變；原protected assertion及失敗保留。人工決定是否接受K在本環境無可觀測真實證據、N歸因未證，而以分開標示的離線分支測試與上述真實行為證據滿足T058驗收範圍。若批准，才同步T058驗收文字、final-acceptance矩陣FR-006／FR-018／US4.7（及其餘受影響行）、live/manual及review-record，先依SpecKit Analyze檢查跨文件一致性，再由人工明確接受。這是證據範圍例外，不是把K或N改成PASS，也不豁免產品安全規則。若不接受此例外，T058保持PENDING／BLOCKED於真實證據取得，不能自行勾選。圖表架構不變；若另改產品需求／操作流程，須重新依constitution處理跨組討論與設計審查。T059與Final其他任務仍須獨立完成。

本輪只讀文件／任務並更新必要紀錄，未修改tasks狀態、產品／測試判準／001文件，未執行測試／真API、讀憑證、改表、commit或push。

### T061操作指令修訂（2026-11-19文件更新）

現行操作區的憑證路徑輸入同步Trim外層空白／單雙引號，可直接貼Windows「複製為路徑」結果，含空白路徑不需手動刪引號。不修改歷史測試結果，不讀憑證；T057／T058／T059均未重跑。
