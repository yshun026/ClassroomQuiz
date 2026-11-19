## T058 有限驗收證據決策 DA-T058-01（2026-11-18）

決策來源：本對話使用者明確批准的**專案內部驗收決策**，不是課程助教、授課教師或OpenSpec組對此偏差的接受；不虛構額外審查。確認日期2026-11-18。此決策只調整T058專案內部結案所接受的證據範圍，不變更任何產品需求、安全分支或測試assertion；不代表Feature／T059／T064最終接受。

### 修訂後T058完成條件

1. 保存四項使用者實際證據：UNKNOWN警告與有效活動建立；失敗後活動／有效答案／順位／Session保留；原FAILED且running=false/canReconcile=false後，同活動修權並明確再次寫回成功；全新專用副本撤讀權的read-denied live pass1/fail0/skip0/exit0。各項日期2026-11-18，分類分別為前三項USER_REPORTED_MANUAL_PASS、第四項USER_REPORTED_LIVE_PASS。T057兩份真表PASS另列，不替代T058。
2. 已知DENIED準備拒絕的產品分支與原protected assertion不改；真實protected FAIL（P_EDITABILITY_MISSING／UNKNOWN）與缺少真實PASS列NOT VERIFIED。MISSING仍UNKNOWN，不當false。
3. 明確Google寫拒絕／保護專屬歸因列NOT VERIFIED，既有一般存取錯誤不證明是否到達寫入；精確遠端恰一次／無重送的完整真實證據亦NOT VERIFIED。只把失敗後資料保留行為列人工PASS。
4. 真實斷線／逾時／PENDING reconcile列NOT RUN，不補PASS。離線測試與真實證據分列；使用者明確接受上述限制，才可完成T058內部證據整理與審查，不將其表述為所有負面Google分支均實測PASS。

### 證據矩陣

| 需求／場景 | 實際真實證據 | 未驗證限制／離線證據 |
| --- | --- | --- |
| FR-006／US1.1 UNKNOWN | T058-1人工PASS：3組、WAITING、6題、1工作表、權限未確認提示、原標記完整 | 不證明來源可寫；未觀察Google請求數 |
| FR-006／US1.4 已知DENIED拒絕準備 | NOT VERIFIED；原protected實測FAIL保留 | parser及preparation整合的明確false分支離線測試獨立保留，不冒充live PASS |
| FR-018／US4.7失敗保留 | T058-2人工PASS：RESULTS、兩組答案及rank1/2、Session保留 | 是否實際Google寫入拒絕／保護專屬拒絕NOT VERIFIED |
| FR-018／US4.7恢復 | T058-3人工PASS：原FAILED/false/false，同活動修權後一次明確寫回，順位1完整答案成功、其他未完成標記保留、答案rank及Session保留 | 不追認舊失敗的具體Google原因 |
| FR-018讀取不可存取 | T058-4真實live PASS，使用者確認新副本撤權；read-denied pass1/fail0/skip0/exit0 | 只GET A、B僅配置檢查屬程式核對；錯誤碼不能單獨區分撤權／不存在 |
| FR-014–017／SC-004未知屏障／不重送 | 真實斷線／逾時／pending reconcile NOT RUN；遠端恰一次NOT VERIFIED | sheets-access、writeback-recovery unit/integration與E2E fake證據另列；安全要求不豁免 |
| SC-006／SC-007／FR-021 | 如實保存PASS、FAIL、NOT VERIFIED及NOT RUN；本決策可結束T058內部證據審查 | 不宣稱SC整體已PASS；T059及T061–064仍未完成 |

### 安全及追溯不變

FR-006／FR-018、原protected assertion、UNKNOWN屏障、不可盲目重送、原operation快照／Evidence、先全前驗與成功讀回、角色／順位／Session規則均不變。此決策沒有新增使用者功能或操作流程，不觸發架構變更；原跨組需求確認仍依既有RG-001，沒有新增跨組偏差批准紀錄。三份002 PlantUML及PNG保持原樣。依constitution未執行／受阻／失敗如實保留，不宣稱修好了原protected測試或完整Final通過。若未來要求完整live DENIED或保護歸因，需另取證據再審，不能引用本決策假裝已有PASS。

依使用者批准及四項已保存證據，T058修訂後內部完成條件已滿足；T058勾選代表「有限證據下內部驗收決策完成」，不是全案例真實測試成功。進度59/64；T059尚未開始，T061–T064仍未完成。仍須本輪唯讀Analyze檢查，若發現HIGH／CRITICAL則暫停後續，不宣稱可結案。

---

以下為原準備與執行歷史，舊PENDING／58/64僅代表其記錄時點。

# T058 補充受控負向寫入驗收（準備完成，真實執行 PENDING）

確認日期：2026-11-18。使用者批准補充方案；本文件仍待人工執行／審閱，不是 PASS。未提供原 protected 測試實際日期，不代填。T058 保持未勾選，總進度58/64。

## 驗收邊界與證據

| 案例 | 條件／PASS 判準 | 本次證據狀態 |
| --- | --- | --- |
| K：已知 DENIED 拒絕準備 | 正式 parser 在可解析、非 warning、命中答案且不在例外的保護規則上取得明確 false，拋出 SHEETS_NOT_EDITABLE；零寫入 | 原 protected runner 保留；使用者實測 FAIL，P_EDITABILITY_MISSING／P_EDITABILITY_UNKNOWN，pass0／fail1／exit1。尚無此分支真實證據 |
| U：UNKNOWN 可建立且警告 | 完整有效來源、有效組數；無可判斷寫權時一次建立活動，老師顯示尚未確認；準備／提交／閉題均不試寫 | 2026-11-18 USER_REPORTED_MANUAL_PASS：3組／WAITING／6題／1工作表／權限未確認提示／原標記完整；只涵蓋建立與警告，不證明可寫或提交閉題零請求 |
| N：正式寫回明確遭拒 | 老師明確按一次寫回；一次送出、完整拒絕且有可信保護拒絕分類；活動／有效答案／rank／Session保留、無自動重送、讀回與基準一致 | NOT RUN；目前一般產品錯誤碼不足以確認拒絕原因 |
| R：安全恢復 | 明確拒絕且已確認無未知舊請求後，人工修權，再明確觸發新操作；全前驗／讀回核對通過 | NOT RUN；與 N 分開，不在 N 失敗時自動執行 |

Google ProtectedRange 文件定義 requestingUserCanEdit，沒有明文保證 false 一定出現在回應，也沒有缺失等同 DENIED 的規定。ProtoJSON 的預設值省略規則不能單獨證實此 Sheets 欄位本次缺失的原因。程式 fields 已要求該欄位；JSON／structuredClone 不刪除 false；MISSING 維持 UNKNOWN。
參考：https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/sheets#ProtectedRange 與 https://protobuf.dev/programming-guides/json/#presence-and-default-values 。

## 人工步驟（僅準備，本輪不執行）

1. 使用全新、無正式資料的專用副本，保留 T057 的兩份已通過證據不動。不要重用仍有未知請求的表。另存本機基準／畫面，不將 ID、網址、電子郵件或私人內容提交。
2. 使用者在 Google Sheets UI 分享副本給相同後端 SA 為 Editor；在「資料 → 保護工作表和範圍」對實際 Q1 標記答案格設強制限制編輯（非警告），排除 SA，確認沒有未保護例外。記錄是否存在其他重疊保護，避免歸因不明。
3. 本機照 quickstart 啟動後端／前端（私人環境設定仍留本機，不回報值）。老師登入，先設定有效三組，再貼此副本網址。若已知 DENIED 而拒絕建立，記 K 的實際證據，停止此 N 流程，不放寬 parser 來繼續。
4. 若建立成功，確認老師清楚顯示 UNKNOWN／尚未確認、題數正確；記 U。先不按回填；準備與搶答本身不呼叫寫 API。
5. 以獨立學生身分加入，Q1開始、提交合成測試答案、老師閉題。只產生這一題有資格的答案，避免其他可寫答案混入批次。記老師看到的答案／rank／閉題狀態，確認 Session 可用；學生不能看到來源或操作狀態。
6. 在本機瀏覽器開啟 Network 僅觀察本機回填請求的次數與安全狀態。不得匯出 HAR 或分享 headers／body／Token。老師明確按一次正式寫回；不按第二次、不開另一老師頁面觸發。瀏覽器看不到後端 Google 呼叫，單憑本機請求次數不證明 Google 無重送。
7. 等操作到確定狀態。確認活動、有效提交文字、rank、閉題狀態與老師 Session 保留，刷新後仍一致。確認沒有自行啟動新寫回操作。精確遠端送出次數／拒絕分類需下述測試層觀察或獨立可信證據，不能只靠 UI 推定。
8. 使用者在 Google Sheets 只讀比對答案標記仍在、其他內容／公式定義／格式／合併／分頁結構與基準無非預期變更。未檢查部分明列未執行。若需 API 讀回佐證，須另外明確授權僅讀工具；本輪沒有建立或執行該工具。
9. 結果未知／逾時／斷線：記 PENDING，保留原操作與表；不重新送寫、不還原、不重啟來假裝取消。意外成功寫入：記 FAIL，停止，不自動還原或再次執行。一般權限錯誤但無保護歸因：記已拒絕／原因未證，N 不記 PASS。
10. 回報實際日期、案例 K/U/N、固定分類、送出次數、老師操作狀態、結果保留與原表比對結果；不提供 ID、座標、憑證路徑、私鑰、Token、原始 Google 錯誤或未遮蔽截圖。人工修權及恢復 R 必須另行確認安全後才進行。

## 最小測試層診斷設計（提案，尚未實作）

不修改 Sheets Access、parser 或 coordinator；若實作，僅由測試注入現有 fetch seam，在老師 UI 觸發的正式寫入路徑觀察固定 host／方法、批次計數、完整回應與白名單拒絕分類。不得新增公開診斷端點或更改正式模式／權限政策。必須先有單元測試及離線整合測試才啟用。

- N_PROTECTION_DENIED：完整 Google 拒絕，且版本化、經人工核對的保護專屬訊號可可靠辨識；不得以任意403、PERMISSION_DENIED或任意字串包含 protected 就判定。目前沒有取得可驗證的此類官方機器判準，因此此分類尚不能啟用。
- N_REJECTED_UNATTRIBUTED：完整拒絕但無可信保護專屬判準；403/404或一般權限訊號至多屬此類，不能算保護拒絕 PASS。
- N_OTHER_REJECTED：有可靠白名單證據屬認證、配額或其他非保護錯誤；無法可靠分辨則用上一類，不猜測。
- N_OUTCOME_UNKNOWN：逾時、5xx、回應中斷或不完整；維持 PENDING，不重送。
- N_UNEXPECTED_APPLIED：寫入獲接受或觀察到答案實際改變；N案例 FAIL，不自動還原。

診斷只能輸出固定代碼、計數及布林驗證結果；不能輸出 request URL、回應內容、原始例外／stack、headers、ID、座標、郵件、Token或私人文字。回應檢查不得消耗產品要讀的 body；測試須驗 clone／stream failure 仍不改變產品結果。403與404在正式 Access 均映射同碼，產品碼本身不是 Google 原始狀態或保護歸因證據。

若始終沒有可信保護專屬訊號，可取得「真實拒絕、結果保留、表未變」補充證據，但不得冠以已證實保護拒絕。再由人工決定是否接受明列限制的替代證據；不能由代理自動豁免 K 或結案 T058。

## 追溯與停止點

FR-006／US1已知拒絕分支對應 K，UNKNOWN 分支對應 U；FR-018／US4.7對應 N/R；SC-006 的無半場／機敏資料限制持續適用。補充 N 不替代 K，也不替代文件不可讀、修權恢復及 T059 最終人工驗收。需求與產品架構不變，三份002圖無需修改；原 protected assertion 完整保留。

使用者此次批准的是補充驗收與準備，不是宣稱真實結果通過，也不是豁免已知 DENIED 的真實證據。所有未執行項目保持 NOT RUN／PENDING。沒有新增 GOOGLE_LIVE_MODE；不得將 acceptance 當成負向測試指令（它會寫入兩份來源）。

## 本輪離線驗證（2026-11-18）

文件準備後執行既有測試：protected-diagnostics／sheets-access／sheets-source-parser 合計48/48 PASS、fail0／skip0；frontend 15/15 PASS、fail0／skip0；Vite build PASS（51 modules）。git diff --check exit0（只有既有CRLF提示）。未新增／修改測試或產品程式，未重跑完整backend／E2E，不將既有歷史結果列為本輪測試。未執行test:live或真API。tasks實際核對64項、58已勾、T058未勾。

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

### 本輪完整離線回歸結果

2026-11-18：backend174/174 PASS（新增7個測試，fail0 skip0）、frontend15/15 PASS（fail0 skip0）、E2E21/21 PASS（1.1m，獨立3100/5273埠、fake Sheets）、Vite build PASS（51 modules），git diff --check exit0。輸出保存negative-diagnostic-backend.txt／frontend.txt／e2e.txt／build.txt（同目錄檔名前綴皆negative-diagnostic-）。未執行npm test:live；完整backend既有gate子測試僅在RUN=0且credential／來源變數清空下驗證停用行為，未連Google或讀私鑰。無產品／001／圖表修改、無新依賴、無commit／push。T058仍未完成。

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
