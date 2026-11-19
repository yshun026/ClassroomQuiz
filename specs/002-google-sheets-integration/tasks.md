# Tasks: 002 Google Sheets Guided Notes 直接整合

**正式結案（2026-11-19）**：使用者明確核准 USER_APPROVED_FINAL_ACCEPTANCE，T001–T064完成，64/64；僅專案內部最終接受，不含助教／第三方接受、Git提交或公開部署。DA-T058-01、原protected FAIL及NOT VERIFIED／NOT RUN不變；下列各階段進度為歷史。詳review-record.md與final-acceptance.md最新結案紀錄。

**T063最新完成狀態（2026-11-19）**：21FR／7SC／26場景與64任務證據追溯、限制清單、保護檔核對與唯讀Analyze完成，63/64；T064未開始／未接受。權威矩陣見tests/records/002-google-sheets-integration/final-acceptance.md目前版本，機器可核對資料見t063-traceability.json。覆蓋100%非所有案例PASS，DA-T058-01／原FAIL／NOT VERIFIED／NOT RUN均保留。

**T062最新完成狀態（2026-11-19）**：三圖與最終實作／證據限制核對完成；只修sequence提前終止及讀回分支，CLI重產PNG並檢視、hash／尺寸及唯讀Analyze完成。62/64；T063／T064未開始／未完成。詳tests/records/002-google-sheets-integration/diagram-consistency.md最新章節；原61/64及舊圖hash為歷史。

**T061最新完成狀態（2026-11-19）**：README／quickstart與live現行憑證輸入修訂、8組假路徑／PowerShell語法／相對連結／命令來源核對及唯讀Analyze完成，61/64；詳tests/records/002-google-sheets-integration/t061-documentation.md。T062–T064未開始／未完成；下文60/64等為歷史時點。

**最新完成狀態（2026-11-19確認）**：T059原任務條件已依使用者兩表完整人工驗收、外部衝突及A→B安全換場事實確認達成；唯讀speckit-analyze無CRITICAL／HIGH阻擋後正式勾選，60/64。T060保持既有完成；T061–T064仍未完成，本輪未開始T061。詳細證據／E1解除／NOT VERIFIED限制見manual.md、final-acceptance.md及review-record.md最新章節。下文59/64及T059 PENDING均為歷史時點，不代表未明確人工細項自動PASS。

**目前進度（DA-T058-01）**：T058依使用者核准的有限證據標準完成，59/64；T059未開始、T061–T064未完成。下文58/64／T058 PENDING為歷史。原T058要求與失敗紀錄保留於review-record及驗收文件；不得將勾選解讀為全部真API負面案例通過。

**最新實際證據**：使用者提供2026-11-18 T003／T004完整環境確認與T057兩份真API正向通過（A/B各6題、各2批、pass1／fail0／exit0，Q1／Q3正確、Q2保marker、其他內容／格式無非預期變更）。三項已依回報勾選，累計58/64；未勾選T058／T059／T061／T062／T063／T064。既有55/64／NOT RUN敘述為歷史，最新證據見tests/records/002-google-sheets-integration/live.md及review-record.md。


**Input**：本目錄已接受的 [spec.md](spec.md)、[plan.md](plan.md)、[research.md](research.md)、[data-model.md](data-model.md)、[HTTP 合約](contracts/http.md)、[Sheets 合約](contracts/google-sheets.md)、[quickstart.md](quickstart.md)，以及根目錄 diagrams/002-component.puml、002-class.puml、002-sequence.puml 與 PNG。

**Governance**：2026-11-18 使用者接受 Plan 六份文件，依據見 [review-record.md](review-record.md)。本文件是 Tasks 待審產物；所有任務尚未執行，不代表人工／真實 API 驗收完成。Tasks 人工審查及後續 Analyze 完成、問題處理後才另行授權 Implement。本輪不執行下列任務、不安裝套件、不建憑證、不 commit／push。


**目前執行狀態（2026-11-18）**：使用者已核准Tasks最終版，本輪僅授權Setup／Foundation。T001／T002／T005／T006–T014驗證完成；T003／T004人工待辦，US1–US4／Final未開始。上文Tasks待審／本輪不執行為原產生階段快照，最新依據見review-record.md及tests/records/002-google-sheets-integration/foundation.md。

**US1本輪狀態（2026-11-18）**：T015–T025已通過各自範圍驗證；T026因完整backend regression尚有8項舊準備fixture失敗而未完成。T003／T004人工待辦，US2以後未開始。詳tests/records/002-google-sheets-integration/us1-fake.md及review-record.md；不以fake結果宣稱真Google通過。

**T026最新狀態（2026-11-18）**：本輪依使用者明確授權完成舊準備fixture遷移，原8項與完整backend117項皆通過，前端9項／US1 E2E1項／建置通過；T026已完成，US1 T015–T026全部勾選。先前T026未完成為歷史時點；詳tests/records/002-google-sheets-integration/t026-validation.md。T003／T004及US2以後保持未完成。

**US2最新狀態（2026-11-18）**：T027–T031已完成，backend121／frontend9／全E2E15通過、build成功；無應用程式或核心規則修改。真實讀取回報另記user-real-read.md，非寫入權或完整live驗收。T003／T004仍人工待辦，T032–T064未開始。詳tests/records/002-google-sheets-integration/us2-regression.md及review-record.md；先前階段狀態保留為歷史。

**US3最新狀態（2026-11-18）**：使用者接受US2並授權僅T032–T043；本階段12項離線驗證完成後勾選。backend136／frontend13／全E2E17通過、build成功；總41項已完成。T003／T004人工待辦、US4 T044–T054與Final T055–T064未開始。真實寫回及人工驗收NOT RUN；未提供US4 reconcile，未知結果維持屏障不重送。詳tests/records/002-google-sheets-integration/us3-fake.md、us3-manual-write.md及review-record.md。先前階段狀態保留為歷史，不是本次完整Feature交付聲明。

**US4最新狀態（2026-11-18）**：使用者接受US3並回報真實Sheets讀寫成功（USER_REPORTED_REAL_READ_WRITE_SUCCESS，見user-real-write.md），本輪僅授權T044–T054。11項離線驗證通過後勾選，累計52/64；backend153／frontend15／全E2E21及build通過。T003／T004不自動勾選，Final T055–T064未開始。本輪真實US4／兩份真表自動／完整Final驗收仍未完成；等待US4人工接受。詳tests/records/002-google-sheets-integration/us4-recovery-fake.md與review-record.md，前述US3 NOT RUN等保留原時點事實。

**Final最新狀態（2026-11-18）**：使用者接受US4，授權本輪Final離線驗證及人工準備。T055／T056／T060本輪驗證完成後勾選，累計55/64。T057–T059真表／權限／人工仍NOT RUN／PENDING；T061 README／quickstart已更新、T062三圖離線核對及PNG檢視PASS、T063 21FR／7SC／26場景矩陣已建立，但依既有T059→T061→T062→T063順序，三項保留未勾選，待真人證據後最終複核結案。T064未取得最終接受。T003／T004也不自動勾選。實際backend157／frontend15／全E2E21及build通過；live停用gate為0pass／1NOT RUN skip，不是真實成功。見tests/records/002-google-sheets-integration/final-acceptance.md與review-record.md；未commit／push。

**Format**：`- [ ] Tnnn [P?] [USn?] 說明及實際檔案路徑`。[P] 僅表示在所列前置條件完成後，不同檔案的工作可以平行；不代表可跨越階段關卡。路徑均相對專案根目錄，新增／修改已逐項標示；人工工作記錄路徑不代表要把憑證或真實 ID 放入該檔。

**Tests**：依 spec／使用者明確要求安排。各故事先建立會揭露缺口的測試，再實作並通過；stub、fake、真實 API、人工各自保存結果。不能刪除失敗案例或修改排序規則換取綠燈。現有 Excel 專用 helper／測試保留歷史用途，正式 UI／路由契約測試另行遷移。

## Phase 1: Setup — 既有專案準備（T001–T005）

目的：確認基準及環境，不重新建立專案。人工環境可與離線開發並行，但不得在未準備好時宣稱 live 通過。

- [X] T001 核對本 feature／分支與已接受三圖，建立新增 tests/records/002-google-sheets-integration/baseline.md，列出 001 受保護文件／歷史圖表、既有測試保留或遷移對照及當次版本；不得改寫舊 PASS，不因已有未提交 002 文件而刪除它們。
- [X] T002 在後續實作階段修改 backend/package.json、backend/package-lock.json，僅新增 google-auth-library，依 research R2 核對 Node >=24 <25 engines 並鎖定精確版；不新增 googleapis／Drive／前端 Google SDK，於新增 tests/records/002-google-sheets-integration/environment.md 記相容性與安裝實況，不記機敏值。（依 T001）
- [X] T003 [人工前置] 由使用者依 specs/002-google-sheets-integration/quickstart.md 設定 Cloud 專案、啟用 Sheets API、建立 Service Account、依校方政策將 key 放 repository 外並限制 ACL；只在新增 tests/records/002-google-sheets-integration/environment.md 記完成／BLOCKED／NOT RUN，不記 key、Token、密碼或實際 credential 路徑。代理不得代建憑證；不需給 Cloud Owner／Editor 或網域委派。（依 T001；與 T002 同檔須串行記錄）
- [X] T004 [人工前置] 由使用者提供不同 spreadsheetId 的專用 A/B 表，各自分享給服務帳號 Editor；配置不同位置、跨表／hidden GRID、merge master、非答案公式／rich text 與整格格式，另備錯誤／保護案例。新增 tests/records/002-google-sheets-integration/live-prerequisites.md 只記 A/B 代稱及權限確認，不提交真實網址／ID；無環境時保持 BLOCKED，不阻塞 fake 開發。（live 前依 T003）
- [X] T005 建立新增 tests/records/002-google-sheets-integration/README.md，定義 unit／adapter fake／HTTP-Socket integration fake／E2E fake／live／manual／diagram 的證據欄位：日期、版本、命令或步驟、預期、實際、PASS／FAIL／NOT RUN／BLOCKED、遮蔽證據；明列舊 001 紀錄唯讀且不能替代 002。（依 T001）

## Phase 2: Foundational — Sheets Access 阻擋性基礎（T006–T014）

目的：可注入且不洩密的後端 Google 邊界。以下完成才開始 US1–US4 實作；不以 fake 成功代替此介面契約驗證。無須等待 T003／T004 即可執行 fake 測試。

- [X] T006 [P] 新增 backend/tests/unit/sheets-access.test.js，先測 scope／固定 host／redirect:error、fields 完整性、30 秒讀取最多 3 次與 1／2 秒 jitter／Retry-After 預算、200 秒本機寫逾時、400／401／403／404／429 完整拒絕及 5xx／斷流未知；斷言每 write attempt 僅一次傳輸、取 Token 失敗零寫且沒有 auth replay。使用注入 transport／clock，不呼叫 Google。（依 T002、T005） 補充 A2：依 research R3 測 monotonic 總預算100,000ms（含取Token／body／等待）、每次 min(30,000ms,剩餘)、最多3次、jitter整數0–250ms；Retry-After delta／HTTP-date／無效／過去／超預算、deadline晚到忽略與寫入不套用讀重試，使用可注入時鐘／RNG精確斷言。
- [X] T007 [P] 新增 backend/tests/unit/google-config.test.js，測 repo 外路徑、service_account 型別、可信 token_uri、憑證缺失安全錯誤、前端不可取得秘密；無憑證仍可健康檢查與測其他 quiz 功能。（依 T002、T005）
- [X] T008 修改 backend/src/config.js、backend/.env.example 及必要的根目錄 .gitignore：只接受後端 GOOGLE_APPLICATION_CREDENTIALS 路徑、校驗 repository 外與 service_account／token_uri；保留 ADMIN_PASSWORD／localhost，範例空值且不引入自動讀前端 env。認證失敗於 Sheets 功能報安全錯誤，不強制無憑證單元測試全失敗。（依 T007）
- [X] T009 修改 backend/src/api/errors.js，加入 contracts/http.md 全部 Sheets／操作／410 錯誤及繁中訊息、正確 HTTP mapping；既有 error envelope／亂數 requestId 保留，清除 Google 原始 body／config／headers／stack／Token，不把 Google 401 當老師 Session 失效。（依 T006、T007）
- [X] T010 新增 backend/src/services/sheets-access.js 的 Service Account Token／getSource／verify 邊界：GoogleAuth 僅取 Token，scope 僅 spreadsheets；native fetch 固定官方 URL、禁止 redirect、不 fetch 老師網址；依 Sheets 合約讀全部必要 metadata／sparse cells／保護參照，必要欄位缺漏報協定錯誤，權限不可見為 UNKNOWN。（依 T006、T008、T009）
- [X] T011 在 backend/src/services/sheets-access.js 實作 writeValues：全動態單格 updateCells、stringValue、fields=userEnteredValue；無 fills 零寫、一次 batch、body >2 MiB 全拒絕、不分批／清格／寫格式；回 APPLIED／KNOWN_REJECTED／UNKNOWN，attempt 一次 fetch 無背景重試，abort／settle 不冒稱遠端取消。（依 T010；此為 Access 能力，不是回填 worker）
- [X] T012 新增 tests/fixtures/google-sheets/sources.js 與 backend/tests/helpers/fake-sheets-access.js：提供 A/B 合成稀疏資料、sheetId=0、hidden／merge／非 GRID、錯標記／runs／保護資訊，並可控制讀取、apply 後遺失回覆、延遲寫、讀回失敗及呼叫次數；fixture 不含真實 ID／key，fake 不作 live 證據。（依 T011；fixture 介面遵循 Access 合約）
- [X] T013 修改 backend/src/app.js 注入 sheetsAccess 並保留現有 createApp 測試組裝，修改 backend/tests/helpers/runtime.js 讓離線測試明確注入 fake、不意外存取真 Google；不新增公共 endpoint 配置、不改 auth／dispatcher／Socket 排序責任。（依 T011、T012） 補充 C1：修改 backend/tests/helpers/quiz.js，將舊 worksheetId／worksheetName 最小物件換成有效的合成 GuidedNotesSource／sheetId／rowIndex／columnIndex 基準，明確注入 fake；保留同步純 domain quizFixture 及原三組／Session assertions，不以保留 ActivityService Excel import 草稿滿足測試；走準備服務的 fixture 必須先 setGroups 再 loadSource。
- [X] T014 執行 T006／T007 的單元與 Access 契約測試，確認無隱藏重送／機敏洩漏；將實際命令、結果與未完成環境記入新增 tests/records/002-google-sheets-integration/foundation.md。未全通過不得開始依賴 Access 的回填實作。（依 T008–T013）

## Phase 3: US1 — 老師以不同網址準備活動（P1；T015–T026；MVP）

目標：有效組數及全部來源驗證後一次建立活動。獨立驗證：不開始搶答，用合成 A/B 網址驗不同題數／位置與錯誤來源；真表驗證另在 T057。保留學生免 Google 登入。

### Tests first

- [X] T015 [P] [US1] 新增 backend/tests/unit/sheets-source-parser.test.js，測 HTTPS／精確 host／合法 ID／禁短網址與發佈連結／gid 不限範圍、GRID hidden／非 GRID、sparse offsets／空格、Q0／Q01／q1／缺號／重複／混字／公式／多標記、merge master、safe integer、textFormatRuns／chipRuns 拒絕及精確位置提示。（依 T014）
- [X] T016 [P] [US1] 修改 backend/tests/integration/preparation-http.test.js，將正式準備改為 JSON URL 契約；覆蓋 groups PUT、Notes GET、未知欄位／multipart 拒絕、驗權先於 Google、無效組數零讀、busy／同時改組數、失敗釋放／保留組數、DENIED／UNKNOWN、完整來源一次 commit／建立後不可換。測學生無來源欄位。（依 T014） 補充 C1：同步修改 backend/tests/unit/foundation.test.js 的舊 multipart FILE_UNREADABLE 契約，改驗新版 JSON 輸入／退役 multipart 的安全拒絕與狀態不變，保留亂數requestId、遮蔽錯誤、Origin、密碼／角色／Session及同步dispatcher assertions，不恢復舊正式匯入。
- [X] T017 [P] [US1] 新增 frontend/tests/guided-notes.test.js 的來源 API／錯誤／過期回覆測試，並修改 tests/e2e/teacher-preparation.spec.js 及 tests/e2e/start-backend.mjs 使用明確 fake DI，測網址取代選檔、未知權限警告、位置錯誤及重試；fake 僅測 UI，不註記真表通過。（依 T014）

### Models → services → routes → UI

- [X] T018 [US1] 新增 backend/src/models/guided-notes-source.js，逐字落實 data-model 的 Source 欄位：`spreadsheetId: nonempty string；canonicalUrl: string；title: string；supportedSheets: Map<sheetId,SheetBaseline>；excludedSheets: array；placeholderLocations: Map<questionNumber,PlaceholderLocation>；permissionAssessment: UNKNOWN / NO_KNOWN_DENIAL；baselineCellValues: immutable sparse map`；`一 Activity 一份；沒有 Google Token／私鑰`，`DENIED 只存在於失敗結果，不建 Activity`。SheetBaseline：`sheetId: nonnegative safe integer（0 合法）；title: string；index: nonnegative integer；sheetType: GRID；hidden: boolean；rowCount/columnCount: positive safe integer；merges: normalized GridRange[]`；`grid dimensions／merges 變更則衝突`，title／index 僅顯示。（依 T015）
- [X] T019 [US1] 新增 backend/src/models/placeholder-location.js，逐字落實 `questionNumber: positive safe integer；sheetId: nonnegative safe integer；sheetTitle: string；rowIndex/columnIndex: nonnegative safe integer；cellAddress: derived string；originalPlaceholder: exact string；mergeRange: GridRange or null`；`regex 整格 {{Qn}}、Q1..QN 唯一連續；合併格只取左上 master。拒絕 formulaValue 及含 textFormatRuns／chipRuns 的標記格；一般 userEnteredFormat 保留`。（依 T018）
- [X] T020 [US1] 修改 backend/src/services/guided-notes-service.js，新增 Sheets source 解析入口，保留既有標記辨識規則及歷史 Excel helper 測試所需入口；依 HTTP 合約安全解析／canonicalize URL，只用 userEnteredValue.stringValue、計入 startRow/startColumn／holes、掃全部支援 GRID 含 hidden、列 excluded，不固定題數／表名／ID／座標；產生不可變稀疏基準及 T018／T019 模型。（依 T019）
- [X] T021 [US1] 在 backend/src/services/guided-notes-service.js 實作非破壞性權限評估：強制 protectedRange requestingUserCanEdit:false 命中答案格為 DENIED，扣除 unprotectedRanges、解析 namedRange／table 引用；不可解析或資訊不足為 UNKNOWN，warningOnly 不當拒絕、無保護不證明可編輯，不查 editors 猜權限、不寫測試值；權限與 runs 負面來源零 commit。（依 T020）
- [X] T022 [US1] 修改 backend/src/store/runtime-store.js、backend/src/services/activity-service.js、backend/src/models/activity.js，準備僅 `groupCount: positive safe integer | null`、`busy: boolean`；有效組數先驗與 ownership 互斥、I/O 在 dispatcher 外，全部成功後短同步一次建 source／questions／Q1 WAITING，finally 安全釋放。不保存 validated document 草稿；保留有效組數、禁止活動後改來源／組數，原 quiz view 不混 Notes 狀態。（依 T016、T021）
- [X] T023 [US1] 修改 backend/src/api/preparation-routes.js、backend/src/api/guided-notes-routes.js，接 PUT groups／POST JSON spreadsheetUrl／GET NotesView；逐次驗老師與 activity，拒絕未知欄位與任意 ID／座標，201 僅完全成功；NotesView 含 excluded 與 UNKNOWN 警告，與 quiz revision 分離。（依 T022）
- [X] T024 [US1] 修改 frontend/src/services/api.js、新增 frontend/src/services/guided-notes.js，加入 JSON 匯入與老師 Notes 查詢，沿用 session 世代保護、拒收舊活動回覆；Google 錯誤不清本機老師身分，無憑證／Google SDK 進前端。（依 T023）
- [X] T025 [US1] 修改 frontend/src/pages/TeacherPage.jsx，以網址／來源名稱／題數／excluded／權限警告取代正式選檔流程，未設有效組數不讀、busy 禁變更、錯誤可重試、建立後鎖定；不更動學生 UI／四階段流程，不要求 Google 登入。（依 T024）
- [X] T026 [US1] 執行 T015–T017 與來源負面矩陣、檢查兩個 fake 來源無 ID／位置沿用、確認沒有半場活動；新增 tests/records/002-google-sheets-integration/us1-fake.md，記 unit／integration／E2E 分別結果。US1 可獨立展示準備，不能宣稱整個 feature 完成。（依 T025） 本次執行亦包含 backend/tests/unit/foundation.test.js；不得以舊 multipart 預期失敗為理由略過原安全驗證。

## Phase 4: US2 — 保留既有公平搶答（P1；T027–T031）

目標：來源替換不變更搶答。獨立驗證：以已準備 fake source 跑老師＋至少三組；Google Access 永不完成／失效時，已載入題目仍能完整搶答。

- [X] T027 [P] [US2] 修改 backend/tests/integration/quiz-http.test.js、backend/tests/integration/activity-lifecycle.test.js，準備 fixture 改 Sheets fake 並保留原 assertions；驗三組並發、空白／重複、submit-close 雙順序、下一題 WAITING、末題 COMPLETED、閉題不可重開與最小 receiveRank。（依 T026） 補充 C1：修改 backend/tests/integration/group-session-http.test.js，移除 readFile／XLSX與先import再setGroups前提，注入 fake Sheets、先設定組數再依新版來源流程完整建立；保留競爭claim、身分恢復、跨組綁定拒絕、四階段晚加入、own-only投影、stale／forged／missing Session assertions。
- [X] T028 [P] [US2] 修改 backend/tests/integration/quiz-socket-isolation.test.js、backend/tests/integration/restart-process.test.js，驗其他組收到零額外事件／版本側通道、每身分投影、四階段 late join／重連、多頁籤及重啟清空；記錄 Google 延遲不改 quiz stateRevision／studentViewRevision。（依 T026）
- [X] T029 [P] [US2] 修改 tests/e2e/lifecycle-fixture.js、tests/e2e/full-activity.spec.js、tests/e2e/student-identity.spec.js、tests/e2e/single-question.spec.js、tests/e2e/realtime-lifecycle.spec.js、tests/e2e/convergence-regressions.spec.js，將正式檔案準備步驟改 URL fake，保留原身分／phase／同步／隔離判準，測正常本機 <=2 秒與不自動重送。（依 T026）
- [X] T030 [US2] 新增 backend/tests/integration/sheets-quiz-independence.test.js，注入延遲／失敗的 Sheets read／write 介面，驗 command-dispatcher 同步裁定不 await 雲端、開始／提交／閉題不呼叫 Google；若失敗僅修 backend/src/services/activity-service.js 與 backend/src/app.js 的新整合邊界，不改 question-service.js／submission-service.js 的既有規則。（依 T027、T028；US3 完成後補跑真 worker 並行分支於 T054）
- [X] T031 [US2] 執行 T027–T030、backend/tests/unit/submission-order.test.js、frontend/tests/realtime.test.js 及 T029 E2E，於新增 tests/records/002-google-sheets-integration/us2-regression.md 記實際耗時／證據與保留／遷移差異；不沿用舊 73／7／14 數字當新 PASS。（依 T030、T029） 同時執行 backend/tests/integration/group-session-http.test.js、backend/tests/unit/foundation.test.js，確認 T013 的 backend/tests/helpers/quiz.js 所有既有使用者無回歸。

## Phase 5: US3 — 手動回填閉題成功答案（P1；T032–T043）

目標：不可變 closed-winner snapshot、精確寫值、讀回後報成功。獨立驗證：同一 source 中混合四種題目狀態，僅 closed 且有提交的最小 rank 答案被寫；無符合項目零寫。安全核心於本階段即 fail closed，待核對不能先放行；US4 再完成恢復分支。

### Tests first

- [X] T032 [P] [US3] 新增 backend/tests/unit/writeback-snapshot.test.js，驗閉題最小 rank、未閉題／無人排除、複製 location／answer 不可變、close-before-snapshot／snapshot-before-close 雙序、無 fills NO_CHANGES；包含原始空白／換行／Unicode／等號／答案恰為標記。（依 T031）
- [X] T033 [P] [US3] 新增 backend/tests/integration/writeback-http.test.js，先依契約測 POST 202／NO_CHANGES 200、Notes GET／operation GET、驗權／舊活動／任意目標拒絕、busy／無 fills 零寫、2xx 後讀回方成功、未核對維持 pending，操作錯誤存在 GET 200 視圖而非誤導 generic 500。（依 T031）
- [X] T034 [P] [US3] 新增 backend/tests/unit/source-consistency.test.js，測原 sheetId／dimensions／merge／位置與非目標原值、更名重排可接受、公式比較定義、runs 新增衝突；Evidence／pending 替換先於掃標記、答案恰為其他題標記不重計、無依據同答案仍衝突、全批先驗再寫。（依 T031）

### Models → coordinator → routes → UI

- [X] T035 [US3] 新增 backend/src/models/writeback-operation.js，實作 ClosedWinnerSnapshot：`activityId: string；sourceId: string；capturedAt: ISO time（只供記錄）；fills: immutable ordered array of {questionNumber, location copy, answerText}`，`時間不參與 rank`。Operation：`id: random UUID；activityId: string；status: enum；revision: positive integer；kind: INITIAL / RECONCILE；snapshot: ClosedWinnerSnapshot；items: Map<questionNumber,WritebackItem>；running: boolean；unresolvedAttempt: boolean；lastError: safe summary or null；attempts: array`；status 嚴格為 `PRECHECKING / WRITING / VERIFYING / PENDING_VERIFICATION / SUCCEEDED / NO_CHANGES / FAILED / CONFLICT`，與 quiz 版本分開，terminal 歷史保留。（依 T032、T033）
- [X] T036 [US3] 在 backend/src/models/writeback-operation.js 實作 Item／Attempt，逐字落實 Item `questionNumber；location；expectedText: exact string；state: NOT_WRITTEN / VERIFIED / SKIPPED_VERIFIED / CONFLICT / UNKNOWN；safeReason: nullable string`，`VERIFIED 需讀回 stringValue 精確相等且位置／格式核對`；Attempt `id: UUID；sent: boolean；transportState: NOT_SENT / IN_FLIGHT / SETTLED；remoteOutcome: NOT_SENT / KNOWN_REJECTED / APPLIED / UNKNOWN；targetQuestionNumbers: immutable array；startedAt/endedAt: nullable ISO`；`本機 settle 不自動等同遠端終止`，不存私密 request／headers／原始錯誤。（依 T035）
- [X] T037 [US3] 新增 backend/src/models/writeback-evidence.js，逐字落實 `activityId；spreadsheetId；questionNumber；sheetId／rowIndex／columnIndex；exactText: string；verifiedAt: ISO；operationId: UUID`，`只由讀回建立，可重驗更新 verifiedAt；不可跨活動沿用，重啟可清空`；修改 backend/src/store/runtime-store.js 保存 activity-scoped operations／evidence／ownership，不加持久庫。（依 T036）
- [X] T038 [US3] 新增 backend/src/services/source-consistency.js，實作 T034 的完整來源基準／全部原題／已寫位置驗證；使用本活動 Evidence／原 pending 預期替換後再查額外標記，核對精確值型別與位置／runs／權限，任一衝突停止全批未送更新，不自動移格或重綁；非目標值採保守衝突、不比較公式重算結果。（依 T034、T037）
- [X] T039 [US3] 新增 backend/src/services/writeback-coordinator.js，短同步驗權／activity／ownership 與擷取 closed winners；外部 I/O 執行完整 preflight／Access 單次 batch／全目標 verify，短同步驗 ownership 後回存。無 fills NO_CHANGES、不可表示 surrogate／>2MiB 明確拒絕、不改 Submission；2xx 不等成功、部分不報全成功。所有未知先保留原 snapshot／barrier，無 reconcile 實作前亦不能重送。（依 T038、T011；必須先有 Access）
- [X] T040 [US3] 修改 backend/src/app.js、backend/src/api/guided-notes-routes.js 組裝 coordinator 與 POST writeback／GET operation，202 與 worker 解耦、老師 HTTP 中斷不取消 worker；所有視圖只給老師。正式 export 對 teacher 回 410 EXCEL_FLOW_RETIRED，未登入／學生先驗權；保留舊 Excel helper／依賴供歷史測試。（依 T039、T033）
- [X] T041 [US3] 修改 frontend/src/services/guided-notes.js、frontend/tests/guided-notes.test.js，加入操作建立／查詢，以 activityId／operationId／operationRevision 去除過期回覆，獨立於 acceptSnapshot；POST 回覆遺失先 Notes GET 找 operation，不自動 POST 重送，操作期間每秒僅查本機 GET，terminal 停止。（依 T040） 補充 A1：依 contracts/http.md 的 currentOperationId／viewEpoch／discoveryGeneration 實作記憶體 ownership；不同 operation 不比較revision。於 frontend/tests/guided-notes.test.js 增加 A高revision晚於B成功／Notes發現、舊Notes倒序、POST遺失後晚到及Session／activity改變的測試；只有有效發現或POST能選目前ID，舊GET／錯誤不得切換操作或重啟輪詢。
- [X] T042 [US3] 修改 frontend/src/pages/TeacherPage.jsx，四個已準備階段提供手動寫回、無可填提示、逐題／成功／忙碌／失敗／待核對狀態及刷新恢復；不在 close／submit／重連觸發寫入、不增學生事件。修改 backend/tests/integration/export-http.test.js、新增 tests/e2e/google-sheets-writeback.spec.js 及調整 tests/e2e/guided-notes-export.spec.js，驗正式 XLSX 入口退役與手動寫回流程。（依 T041）
- [X] T043 [US3] 執行 T032–T034、T041–T042 測試與 Access 契約，逐格比對 fake 前後非答案公式／格式／合併及文字型別，於新增 tests/records/002-google-sheets-integration/us3-fake.md 記成功／未處理／pending。缺 US4 恢復或真表驗證時不得稱完整可交付。（依 T042）

## Phase 6: US4 — 重複、衝突與結果待核對恢復（P1；T044–T054）

目標：已有答案非缺標記、只核對原操作、不盲重送。獨立驗證：已寫活動配受控 fake 外部修改／遺失回覆／晚到請求，斷言每次 transport 次數與遠端／本機逐題結果，不要求永久不明一定恢復。

- [X] T044 [P] [US4] 新增 backend/tests/unit/writeback-recovery.test.js，覆蓋 data-model 全 transition：首次無依據同答案衝突、有 Evidence 精確匹配略過、已寫格改值／還原標記仍衝突、pending 全目標含既有證據核對、部分吻合／標記／他值、文字答案等於標記、不可表示／超大、撤權與讀失敗。（依 T043）
- [X] T045 [P] [US4] 新增 backend/tests/integration/writeback-recovery-http.test.js，測 reconcile 契約及多老師頁籤、POST 斷線、2xx 後讀失敗、apply 後遺失回覆、舊 transport 未 settle 即使讀到答案仍 running、settle 但 remote UNKNOWN 且殘留標記只讀不重送、未知全部目標吻合後可解除屏障、舊快照不覆新結果。（依 T043）
- [X] T046 [P] [US4] 新增 tests/e2e/google-sheets-recovery.spec.js，測老師收到 busy／pending 操作 ID、刷新先查、手動核對、逐題衝突位置／原因、Google 401 不登出、無 forced overwrite 按鈕，雙頁籤無並行寫；明示 fake transport 注入，不以 browser mock 代表 Google 驗收。（依 T043） 補充 A1：受控延遲A的狀態／Notes回覆，B已成目前操作後再釋放A，驗UI仍顯示B；同時驗不會重送POST或因A的舊錯誤改變B按鈕狀態。
- [X] T047 [US4] 修改 backend/src/services/source-consistency.js，完成原操作 pending／Evidence 優先判定及 T044 負面分支；原標記／預期答案／其他值分類必須結合位置與歷史，無紀錄不可猜成功，來源結構／非目標值／格式任一衝突全停，仍不承諾 CAS。（依 T044、T038）
- [X] T048 [US4] 修改 backend/src/services/writeback-coordinator.js，實作同 operation 手動 reconcile：只處理 immutable 原 snapshot，先讀全部目標，不摻後來閉題；KNOWN_REJECTED／未送可安全失敗，可能送達保留 pending／unresolvedAttempt；每 activity 最多一 running 或 pending barrier，IN_FLIGHT 始終 running。（依 T045、T047）
- [X] T049 [US4] 在 backend/src/services/writeback-coordinator.js 完成 late-request 屏障與 T044／T045 全 transition；本機 settle 不是取消，原標記且舊 remote UNKNOWN 保持 pending 只讀；僅舊 attempt 已安全排除或所有舊目標已核對同一不可變答案且本機 settle 才釋放。只有可安全重送且全 preflight 通過才寫剩餘標記，不用180秒／200秒定時清鎖、回滾或背景 retry。（依 T048）
- [X] T050 [US4] 修改 backend/src/api/guided-notes-routes.js，加入 POST /activity/guided-notes/writebacks/:operationId/reconcile，逐次驗權／activity／operation，僅 pending 或 conflict 帶 unresolvedAttempt 可核對；busy／pending／not-pending 合約完整，新 writeback 在 pending 時回原 ID，不建立新快照。（依 T049）
- [X] T051 [US4] 修改 frontend/src/services/guided-notes.js、frontend/tests/guided-notes.test.js，支援明確手動 reconcile、canReconcile 非重送保證、401 Google 與 Session 錯誤分流、同 operation revision 防舊覆新；查詢不觸發 reconcile／Google write。（依 T050） 沿用 contracts/http.md A1 的跨operation ownership；reconcile開始前遞增viewEpoch仍綁原ID，不以較大revision跨ID接管。
- [X] T052 [US4] 修改 frontend/src/pages/TeacherPage.jsx，加入逐題衝突／待核對原因、原操作手動核對及授權修正提示；無法安全恢復時明示保持待核對、不可重啟當取消，禁止新寫回／強制覆蓋／自動還原；不將部分核對顯示全部成功。（依 T051）
- [X] T053 [US4] 修改 backend/tests/integration/sheets-quiz-independence.test.js，接真 coordinator＋fake transport，驗寫回／核對／讀取長等待與三組 submit-close 競爭仍公平、<=2 秒本機同步且學生無雲端欄位／通知／版本改變；驗來源／operation 舊回覆不取得新 ownership。（依 T052、T030）
- [X] T054 [US4] 執行 T044–T046、T053 與 US1–US3 回歸，新增 tests/records/002-google-sheets-integration/us4-recovery-fake.md，逐分支列遠端值／本機狀態／transport 次數／barrier 是否解除；假 API 的 timeout／晚到測試清楚標 fake，不聲稱真網路已驗。（依 T053）

## Phase 7: Polish & Cross-Cutting — 真表、人工與交付（T055–T064）

目的：全部故事離線整合後才接真表。不得以測試環境未備為由勾選 live／manual，或以 fake 完成取代本階段；受阻可保留程式進度，但整合驗收不得完成。

- [X] T055 建立新增 backend/tests/live/google-sheets.test.js、修改 backend/package.json 新增 test:live（僅選 live 目錄），使預設 unit／integration 永不呼叫真 Google；只有 RUN_GOOGLE_LIVE_TESTS=1、repo 外 credential 與不同 GOOGLE_TEST_SHEET_A／B 齊備才能執行。缺設定明確 SKIP／NOT RUN、不可標 live PASS；開跑驗專用來源完整標記，不覆蓋衝突、不自動還原。（依 T054；T003／T004 不阻擋寫測試程式）
- [X] T056 執行 backend／frontend 預設測試、frontend build 與 E2E fake（沿用 quickstart 命令及隔離3100／5273端口，不停止使用者活動），保留 Excel helper 歷史測試與全部 quiz 回歸；新增 tests/records/002-google-sheets-integration/automated.md，逐 suite 記實際數量／結果及測試遷移對照，不修改 tests/records 的 001 紀錄。（依 T055）
- [X] T057 [真實 API；需人工前置] 在 T003／T004 就緒後，用 test:live 對 A/B 各驗讀取、不同動態位置／hidden／merge、最小 rank 寫回、=1+2／Unicode／換行文字型別、無人／未閉題保標記、重複回填不誤判缺號、非答案公式定義／rich text／整格格式／結構不變；新增 tests/records/002-google-sheets-integration/live.md 記實際 Google 請求測試及遮蔽前後比對，不記憑證／ID／真學生資料。（依 T056、T003、T004；每次先由人工確認範本可用）
- [X] T058 [真實API＋人工權限；有限證據內部接受DA-T058-01] 依使用者2026-11-18核准的修訂標準，保存UNKNOWN警告建活動、失敗保留活動／答案／順位／Session、FAILED已結束後同活動修權明確寫回成功、撤讀權read-denied真實PASS四項證據及其原始日期／分類。已知DENIED準備拒絕與保護專屬寫拒絕NOT VERIFIED，遠端恰一次完整真實證據NOT VERIFIED；原protected MISSING／UNKNOWN FAIL及assertion不改。真實斷線／逾時／pending reconcile NOT RUN，離線證據另列。正式條件／限制／追溯見tests/records/002-google-sheets-integration/t058-negative-write.md頂部DA-T058-01及review-record.md；本勾選僅表示專案內部有限證據審查完成，不是助教接受或全部live分支PASS。（依T057；FR-006／018與全部安全要求不變）
- [X] T059 [人工驗收] 使用者依 specs/002-google-sheets-integration/quickstart.md，以老師＋三組完成兩份真表完整流程、四階段刷新／重連、手動回填／重複／衝突提示並肉眼比對原表；確認舊請求無晚到風險後才手動還原標記或複製新範本重測。新增 tests/records/002-google-sheets-integration/manual.md 記使用者實際回報、日期／步驟／預期／實際／PASS 或未執行；AI 不代填人工通過。（依 T058）
- [X] T060 檢查 backend/src/config.js、backend/src/services/sheets-access.js、frontend/src/services/guided-notes.js 及全部候選提交產物的秘密／錯誤洩漏、前端 bundle／env 邊界、未知目標與角色隔離；新增 tests/records/002-google-sheets-integration/security.md 記遮蔽掃描方法及結果，不收錄命中的秘密原文。若發現真憑證，停止發布並由持有人撤銷，不僅改 Git。（依 T056，最終再納入 T057–T059 證據）
- [X] T061 更新 README.md 與 specs/002-google-sheets-integration/quickstart.md，使環境變數／實際安裝版／啟動／test:live／兩表分享／錯誤／同活動證據與新活動範本重用規則吻合實作；明示 A-04 無遠端鎖、未知永久 pending、安全重用前先核對舊請求、不自動還原；不改 001 文件。（依 T059、T060；未實測項仍明示）
- [X] T062 逐責任／實體／時序對照實作與 diagrams/002-component.puml、diagrams/002-class.puml、diagrams/002-sequence.puml 及 PNG，新增 tests/records/002-google-sheets-integration/diagram-consistency.md；必要修圖僅限已確認需求且用既有 PlantUML CLI 重產PNG／檢視／記錄命令結果與雜湊。若涉及需求變更先停止回人工／跨組審查，不改001圖，不用可渲染代替一致性。（依 T061；原 Tasks 產生時未改圖，後續 Analyze 修訂已更新 sequence 並重產 PNG，見 review-record.md）
- [X] T063 於新增 tests/records/002-google-sheets-integration/final-acceptance.md 整理 FR-001–021／SC-001–007 到任務／測試／實際證據的矩陣及尚未通過項，核對001／憲章無意外差異，確認沒有無關新功能；未完成 live／manual 或重大失敗不得標整合完成，必要修正後重跑受影響測試。（依 T056–T062）
- [X] T064 [人工最終審查] 向使用者提交 specs/002-google-sheets-integration/review-record.md 的實作／自動／真表／人工／圖表結果與 tests/records/002-google-sheets-integration/final-acceptance.md，據真實回覆記錄最終接受或待修正；無使用者回覆不得自行核准，不含 commit／push／公開部署。（依 T063）

## Dependencies & Execution Order

### 階段與硬性關卡

```text
T001 → T002 + T005 → T006/T007 → T008/T009 → T010 → T011 → T012 → T013 → T014
                                                                                  ↓
                 US1 T015–T026 → US2 T027–T031 → US3 T032–T043 → US4 T044–T054
                                                                                  ↓
                                                  T055 → T056 → T057 → T058 → T059
T001 → 人工 T003 → 人工 T004 ──────────────────────────────────────────↑
T056 → T060（證據完成後複查）; T059 + T060 → T061 → T062 → T063 → 人工 T064
```

箭頭為完成依賴，不表示同階段所有檔案可同時改。Phase 2 所有任務（T006–T014）及 T002／T005 阻擋故事；人工 T003／T004 僅阻擋真表驗收。任何寫回功能 T039 都依 T011／T014 Sheets Access，不可先用臨時未驗 transport 實作上線。US2 驗既有活動，是 US3／US4 不得破壞的基準；T053 再驗實際 worker 與搶答並行。

C1 補充工作沿用既有任務編號，新增任務數為0：T013 遷移 helpers/quiz.js、T016 遷移 foundation.test.js、T027 遷移 group-session-http.test.js，T026／T031 明確驗證；不改測試程式碼於本文件修訂階段。A1 補於 T041／T046／T051，A2 補於 T006。

US3 含完整初始安全屏障，不能因 US4 未完成而開啟重送。US4 依 US3 的 snapshot／evidence／Access，是明確必要依賴，不能假稱四故事完全無依賴。各故事獨立測試是指完成前置後有自己的可判定增量，不要求重新造假資料繞過前置。

### Parallel opportunities / 每故事範例

- Foundation：T006 與 T007 在共同 setup 完成後可平行，不同測試檔；其實作 T008／T009 仍遵依賴。
- US1：T015 parser unit、T016 HTTP contract、T017 frontend／E2E 三組測試檔可平行；T018–T025 因同服務／TeacherPage 及模型依賴串行。
- US2：T027 HTTP／lifecycle、T028 Socket／restart、T029 E2E 分屬不同檔案可平行；共同 runtime fixture 已在 T013 完成，不平行改同檔。
- US3：T032 snapshot、T033 route、T034 consistency 測試可平行；coordinator／route／TeacherPage 依序整合，不與 US4 同時修改。
- US4：T044 unit、T045 recovery HTTP、T046 recovery E2E 可平行；T047–T053 安全狀態與 UI 串行。
- 真表與人工會修改同一專用試算表，T057／T058／T059 必須串行，且每次由使用者確認範本狀態。不得將 [P] 解讀為允許平行遠端回填。

## Implementation Strategy

1. Tasks 人工審查 → 後續 Analyze（一致性問題先解決）→ 另行 Implement；本文件產生不是執行授權。
2. Setup＋Foundation 後先交 US1 準備 MVP：兩份 fake URL 正確載入，不能把無回填的 MVP 稱整體交付完成。
3. US2 對替換準備流程建立搶答回歸基準，再依序 US3 初始寫回與 US4 安全恢復。每故事 checkpoint 跑對應測試，失敗先修，不以新增 scope 迴避。
4. 所有離線層通過後，人工 T003／T004 就緒才跑兩份真表與人工操作；受阻明示而非換 fake。最後圖表／文件／秘密／FR-SC證據檢查與人工接受。
5. 保留 ExcelJS／workbook-fidelity／workbook-text 等歷史 helper 及舊驗證用途；正式 UI／HTTP 移除檔案路徑。若舊 unit 直接依賴原服務入口，保留最小歷史入口，避免無關清理；任何正式流程仍走 XLSX 都不算通過。

## Coverage / 完整性核對

| 規格範圍 | 實作與驗證任務 |
| --- | --- |
| FR-001／020：替換 Excel、原表／範本重用 | T020、T023–T026、T040、T042、T057、T059、T061 |
| FR-002／019：後端服務身分、安全 | T002–T010、T013–T014、T024、T060 |
| FR-003–006：網址／全表／動態標記／來源權限 | T004、T010、T015–T026、T057–T058 |
| FR-007：老師與原活動驗權 | T016、T023、T033、T040、T045、T050、T060 |
| FR-008：公平／同步／隔離 | T027–T031、T053–T054、T056、T059 |
| FR-009–010：手動／同一閉題快照 | T032、T035、T039–T043、T053、T057 |
| FR-011–013：前置驗證／衝突／格式保真 | T011、T018–T021、T034、T038–T039、T044、T047、T057–T058 |
| FR-014–017：核對／重複／待核對／互斥 | T035–T054、T057、T059 |
| FR-018：錯誤提示、授權／網路 | T006–T010、T016–T017、T024–T025、T041–T052、T058 |
| FR-021：自動／人工／真表／三圖證據 | T005、T014、T026、T031、T043、T054–T064 |
| SC-001–004 | T026、T043、T054、T057–T059、T063 |
| SC-005–007 | T031、T053–T064 |

**資料模型約束**：T018／T019／T022／T035–T037 逐字列欄位型別、nullable、enum、索引與生命週期；狀態全轉移在 T044／T045／T048／T049，invariants 在 T034／T038／T047／T053，不留給實作自行決定。Activity 原四階段、Question.closed、Group／Submission／Session 的既有規則由 US2 固守。

**API 合約覆蓋**：groups PUT／source POST／Notes GET → T016／T023；writeback POST／operation GET → T033／T040；reconcile POST → T045／T050；舊 export 410 → T040／T042；所有驗權與錯誤 envelope → T009／T016／T033／T045／T060。Access getSource／verify／writeValues → T006／T010／T011／T014。

**已接受風險、無擴充捷徑**：A-04 下無 Google 跨請求 CAS；舊結果永久未知可永遠 pending，不能新增定時解鎖／強制寫入／自動還原／資料庫／Drive scope。環境政策或真表文字保真若阻礙既定需求，記 BLOCKED 並回報審查，不自行降低需求。未發現必須新增未確認需求才能完成的任務；真實相容性與校方政策仍待 T003／T004／T057／T058 驗證。

**任務數**：64；Setup 5、Foundation 9、US1 12、US2 5、US3 12、US4 11、Final 10；四故事全 P1。共 14 項 [P] 測試工作，原Tasks草案時所有勾選未完成；目前以各項勾選及本文執行狀態參照為準。真表／人工項不得由fake結果代填。

### T058補充驗收追溯（2026-11-18；仍未勾選）

使用者批准僅補充驗收準備。K已知DENIED：保留protected原assertion，MISSING／UNKNOWN的真實失敗不轉PASS；U未知：警告並允許有效來源建立，零準備試寫；N正式拒寫：全新專用副本、老師手動一次回填，可靠拒絕分類、結果保留、無重送、內容未變；R修權恢復另驗。完整步驟見tests/records/002-google-sheets-integration/t058-negative-write.md。FR-006對應K/U，FR-018／US4.7對應N/R，SC-006保留。N不取代K的真實證據缺口；逾時未知PENDING、意外成功FAIL，不還原重送。無新增任務，維持64項／完成58項。


### 寫回狀態查詢介面調整紀錄（2026-11-19）

本次為結案後的介面調整，沿用 T041／T042／T046／T052／T061 的相關範圍，不新增任務編號或改動原64項任務與歷史驗收結果。程式提交：`0ea9046`；分支：`codex/writeback-status-retry`。

- [X] 移除老師端常駐「重新取得寫回狀態」按鈕，保留操作進行期間每秒自動查詢。
- [X] NotesView 或操作狀態查詢失敗時顯示提示與「重新查詢」；手動查詢期間顯示「查詢中…」並停用按鈕，成功後隱藏重試入口，失敗則保留。首次載入來源查詢失敗也能重試。
- [X] 查詢失敗或手動查詢期間禁止新寫回；保留原操作手動核對、Session 失效處理及過期回覆防護。重新查詢只讀本機狀態，不觸發 Google 寫入或 reconcile。
- [X] 更新 `tests/e2e/google-sheets-recovery.spec.js` 與 `tests/e2e/google-sheets-writeback.spec.js`，驗證正常畫面無查詢按鈕、失敗後重試與查詢中提示、重新取得其他老師頁籤的新操作後忽略舊操作的成功／錯誤回覆，以及查詢不新增寫入。
- [X] 驗證結果：前端單元測試15項通過；上述兩份瀏覽器測試共7項通過；前端建置成功。此為離線／fake Sheets 驗證，不新增真實 Google API 或人工驗收結論。
- [X] 同步 `README.md`、`quickstart.md` 與 `contracts/http.md` 的查詢入口、失敗恢復及跨老師頁籤操作發現說明；歷史測試紀錄保留原按鈕名稱。
