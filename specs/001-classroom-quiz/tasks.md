---
description: "ClassroomQuiz dependency-ordered implementation tasks"
---

# Tasks: ClassroomQuiz 核心課堂搶答

**Input**: Design documents from `specs/001-classroom-quiz/` and `diagrams/`.
**Prerequisites**: plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md、Constitution 1.0.0。
**Tests**: spec SC-007 與 Constitution VI 明定自動及人工測試，故納入必要測試任務。
**Organization**: 五個故事皆 P1，按規格順序排列。此命令只產生本文件，不實作或執行下列任務。
**Status**: T001–T023 已完成，Phase 1–3 驗證通過；T023 人工結果由使用者確認，見 tests/records/us1.md；T024–T029 已完成，T030 人工重開待確認，T031–T062 未開始，兩項外部課程議題仍為 PENDING。

## Format: `[ID] [P?] [Story] Description`

- 每項以未勾選 checkbox、連續 T 編號、可選 [P]、故事標籤與確切檔案路徑表示。
- [P] 僅適用於文末指定的同一批次，必須先完成前置條件；不代表可跳過依賴。
- 故事階段全部標示 [US1]..[US5]；共同基礎與收尾不加故事標籤。

## Path Conventions

所有任務路徑相對專案根目錄。未來原始碼採 `backend/src/`、`frontend/src/`，
測試採 `backend/tests/`、`frontend/tests/`、`tests/e2e/`、`tests/fixtures/guided-notes/`；
執行證據存 `tests/records/`。以下提及的程式檔與 fixtures 均尚未建立。

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 確認治理基準並準備 Windows 11 本機工具、套件與測試環境。

- [X] T001 在 specs/001-classroom-quiz/review-record.md 記錄 Constitution、spec、plan、contracts 與三種圖的實際人工審查及跨組核對結果；列出 OI-001（.xlsx 回填要求）、OI-002（可否預加佔位符）的助教回覆或 PENDING，不冒充核准；未具備實作基準確認不得開始 T002。
- [X] T002 在 backend/package.json、backend/package-lock.json、frontend/package.json、frontend/package-lock.json 建立 Node 24 LTS JavaScript ES modules 專案及鎖定相容 React/Vite、Express 5、Socket.IO 4 同版 client、ExcelJS 4、Supertest、Playwright；提供 plan/quickstart 指定 dev/test/build/test:e2e scripts 並記錄實際版本於 tests/records/environment.md。
- [X] T003 [P] 在 .gitignore 與 backend/.env.example 設定排除真實 .env、Token、node_modules、暫存上傳檔及本機瀏覽器 profile；example 僅列無真實值的 ADMIN_PASSWORD，不得設定預設密碼。
- [X] T004 [P] 在 frontend/vite.config.js 與 frontend/index.html 設定 React 入口、localhost:5173 loopback 及 /api、/socket.io 到 localhost:3000 的代理（含 WebSocket），不綁公開介面。
- [X] T005 [P] 在 backend/tests/helpers/runtime.js、tests/e2e/playwright.config.js、frontend/tests/setup.js 與 tests/records/README.md 建立可隔離 store、持久瀏覽器 profile 與測試執行／證據慣例，紀錄預期、實際、PASS/FAIL/NOT RUN，禁止把不同頁籤當不同身分。

**Checkpoint**: T001 確認後才建置；T002 後可並行 T003–T005。環境不包含資料庫或 Google API。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 建立所有故事共用的記憶體、同步命令入口、基礎 Session 與錯誤處理。
**CRITICAL**: 本階段完成前不可開始故事實作。特定業務模型保留在最早需要的故事。

- [X] T006 [P] 在 backend/src/store/runtime-store.js 實作「activity: nullable; preparationDraft; sessionsByTokenHash: Map; commandSequence: integer」及「程序生命週期保存，重啟可清空；非資料庫；draft 非新增活動階段」，禁止引入 SQLite 或其他持久庫。
- [X] T007 [P] 在 backend/src/models/session.js 與 backend/src/services/authorization-service.js 建立 Session「id; tokenHash; role: teacher/student; activityId/groupNumber: nullable」，Token 採安全亂數且 store 僅存雜湊；保留「老師不綁學生組；學生綁一活動一組；Socket 斷開不刪除 Session」，提供每次請求查驗介面，不用 socket.id 當身分。
- [X] T008 [P] 在 backend/src/api/errors.js 實作 contracts/http.md 全部錯誤 code 與 status、繁中 message、requestId、安全 details；不回 stack／密碼／Token／他組未公布資料，錯誤日誌不包含完整答案。
- [X] T009 在 backend/src/services/command-dispatcher.js 建立同步命令入口，以封包解析後進入入口的順序配置 commandSequence；「原子檢查與寫入同步完成，不能 await；接收入口 commandSequence 與提交序列分開，非法提交不占 rank」，後續 start/close/next/claim/submit 共用，不比較客戶端時間。
- [X] T010 在 backend/src/app.js、backend/src/server.js 與 backend/src/config.js 組裝 Express JSON／multipart 入口、loopback:3000、固定 origin 檢查、路由與錯誤層；ADMIN_PASSWORD 缺少須拒絕啟動，只由環境讀取，禁止 VITE_ 暴露。
- [X] T011 在 frontend/src/main.jsx、frontend/src/services/api.js 與 frontend/src/services/session.js 建立老師／學生入口及 HTTP client，持久保存伺服器 opaque Token、附 Bearer、查 Session、清除失效身分；既有學生 Token 不得以新組號覆寫綁定，不放任何密碼於前端設定。
- [X] T012 在 backend/tests/unit/foundation.test.js 驗證 T006–T010 的同步順序、拒絕不更動 store、Session 角色、缺密碼拒啟動、重啟 Token 失效；實際執行並保存結果於 tests/records/foundation.md。

**Checkpoint**: T006–T008 可並行；T009 依賴三者，T010 依賴 T009，T011 後 T012 完成基礎核對。

---

## Phase 3: User Story 1 - 老師登入及準備活動 (Priority: P1) MVP

**Goal**: 老師後端驗證、設定組數、完整驗證 Guided Notes 後形成 Q1 WAITING。
**Independent Test**: 不用學生提交，即可驗證登入、正反組數、正反檔案、準備原子性及不能開始無效活動。

### Tests for User Story 1

先建立測試並確認會因未實作行為失敗，再實作；不得將缺少依賴的環境錯誤當成有效行為失敗。

- [X] T013 [US1] 在 tests/fixtures/guided-notes/generate-fixtures.js 與 tests/fixtures/guided-notes/README.md 建立兩份不同格址／工作表的 Q1..Q3 valid 檔、合併 master 格、字型框線公式尺寸圖片等保真檔，及缺號、跨表重複、Q0/Q01/q1、括號壞、前後空白、混字、公式、空檔、損壞／非 XLSX fixtures，記錄每份預期結果。
- [X] T014 [P] [US1] 在 backend/tests/integration/preparation-http.test.js 為 POST /teacher/login、PUT /preparation/groups、POST /preparation/guided-notes、GET /session、教師 GET /activity 寫合約測試（教師路由由 T021 建立，不等待 US2），含 200/201/400/401/403/409/422、準備先後順序、PREPARATION_BUSY、匯入失敗可重試及 commit 後鎖定。
- [X] T015 [P] [US1] 在 backend/tests/unit/guided-notes-import.test.js 驗證全部 T013 格式、位置映射、題數、merged master 不重複計算及 XLSX OOXML round-trip 相容性；不能只比較 ExcelJS 已解析欄位而漏掉未知部件遺失。

### Implementation for User Story 1

- [X] T016 [US1] 在 backend/src/models/activity.js、backend/src/models/question.js、backend/src/models/group.js 建立「id: opaque string; groupCount: positive integer; phase: enum; currentQuestionNumber: integer; stateRevision: integer; questions/groups: Map」、「number: positive integer; started/closed: boolean; nextSubmissionSequence: integer initially 0; submissionsByGroup: Map」、「number: integer 1..groupCount; studentSessionId: nullable string」；保留「一場活動；題號 1..N；1..* Question、1..* Group、1 GuidedNotesDocument」、closed 不可逆及四種階段；stateRevision 僅內部及教師可見，學生不得取得。
- [X] T017 [US1] 在 backend/src/models/guided-notes-document.js 與 backend/src/models/placeholder-location.js 建立「originalBuffer: immutable Buffer; parsedWorkbook; placeholderLocations: Map」、「questionNumber; worksheetId; worksheetName; cellAddress」，遵守「活動一對一；原檔 bytes 永不被匯出修改；每次匯出另載新 Workbook」與「每題正好一格；由實際解析取得，非寫死；merged cell 僅 master 可作位置」。
- [X] T018 [US1] 在 backend/src/services/guided-notes-service.js 實作 document Workbook 匯入，整格 /^\{\{Q([1-9][0-9]*)\}\}$/、Q1..QN 唯一連續、跨表掃描及動態映射；任何不合法佔位符／讀檔錯誤均拒絕整份並回位置原因，不增加題組匯入。
- [X] T019 [US1] 在 backend/src/services/workbook-fidelity.js 實作 research R4 的原檔／round-trip OOXML 部件、關係、值、公式、格式、merge、尺寸與圖片保留檢查，無法證明保真則 WORKBOOK_UNSUPPORTED；實際助教檔不相容需回報 blocker，不得靜默移除內容或降低 FR-027。
- [X] T020 [US1] 在 backend/src/services/activity-service.js 實作正整數設組與準備草稿，非同步匯入鎖及失敗釋放，兩項驗證齊備時於同步入口一次建立 Q1 WAITING，commit 後不允許改組數或替換文件，stateRevision 僅有效寫入增加。
- [X] T021 [US1] 在 backend/src/services/authorization-service.js 與 backend/src/api/preparation-routes.js、backend/src/api/session-routes.js、backend/src/api/activity-routes.js 實作 T014 端點、環境密碼登入及教師 Session；本任務建立唯一 GET /activity handler，明確提供準備狀態／完整教師投影，逐次驗權，學生分支暫拒絕；教師基礎投影在此完成，不依賴 US2 T027。
- [X] T022 [US1] 在 frontend/src/pages/TeacherPage.jsx 實作登入、組數、上傳、準備狀態與失敗原因，僅顯示題號／題數，不讓無效檔建立可開始畫面；Token 失效返回登入。
- [X] T023 [US1] 在 tests/records/us1.md 保存 T014–T015 實際執行及人工準備流程結果，確認 FR-001–003、007–010、030–031 與 AC-01/03 無遺漏；檔案不相容或未人工測試不可勾選為完成。

**Checkpoint**: US1 可獨立展示「老師登入與準備」MVP，但不是完整搶答交付。T019 失敗不可略過。

---

## Phase 4: User Story 2 - 學生選組及恢復身分 (Priority: P1)

**Goal**: 免註冊原子占組，持久瀏覽器身分恢復；任一階段允許加入空組。
**Independent Test**: 準備活動後以不同 profile 競爭一組、同 profile 重開與雙頁籤驗證，不需要搶答。

### Tests for User Story 2

- [X] T024 [P] [US2] 在 backend/tests/integration/group-session-http.test.js 為 GET /activity/join-options、POST /activity/groups/claim、學生 GET /session、GET /activity 寫合約測試；含同組併發只一成功、同 Token 不占第二組、錯綁定拒絕、四階段晚加入及無活動／重啟失效。
- [X] T025 [P] [US2] 在 tests/e2e/student-identity.spec.js 寫同機隔離持久 profile、同身分雙頁籤、刷新與關閉重開恢復、身分遺失不接管的驗收測試；階段可由測試 fixture 設定，不依賴未完成 US4。

### Implementation for User Story 2

- [X] T026 [US2] 在 backend/src/services/authorization-service.js 擴充原子 claimGroup/resumeIdentity，以後端派生綁定強制「屬一 Activity；0..1 學生 Session；每題最多一筆 Submission」，已有身分不更換組、斷線不釋放，允許 WAITING/ANSWERING/RESULTS/COMPLETED 加入未用組別。
- [X] T027 [US2] 在 backend/src/services/synchronization-service.js 建立 studentView/resumeView，整合 T021 已完成的教師投影而不改其端點；學生 Session 新增 studentViewRevision「integer initially 0」及 lastStudentProjection「nullable immutable object」，初始投影版本為 0，只隨自己的可見業務資料改變遞增，不暴露 stateRevision／全域計數；closed 題結果另公開，組別占用不含作答狀態。
- [X] T028 [US2] 在 backend/src/api/group-routes.js 實作 join-options/claim，並在 T021 既有 backend/src/api/activity-routes.js 的唯一 GET /activity handler 擴充 T027 學生安全投影分支；不另建重複路由、不覆蓋教師分支，依賴 T021/T026/T027；未知活動及 Token 依合約回錯誤。
- [X] T029 [US2] 在 frontend/src/pages/StudentPage.jsx 與 frontend/src/services/session.js 整合可選組別、已占用原因、恢復自己的綁定、重啟失效及晚加入畫面，不增加換組／踢除／帳號管理。
- [ ] T030 [US2] 在 tests/records/us2.md 保存 T024–T025 實際執行與人工重開結果，核對 FR-004–006、025、029 與 AC-02/09，未驗證平台條件須如實標記。

**Checkpoint**: 身分故事可獨立測試；即時 socket 與提交留給 US3/US4，不改動身分規則。

---

## Phase 5: User Story 3 - 完成單題公平搶答 (Priority: P1)

**Goal**: 手動開題、後端唯一順位、每組一筆、教師閉題、公布答案且結束前資訊隔離。
**Independent Test**: 使用單題 fixture 及三組 Session 驗證完整題目；單題結束直接 COMPLETED 顯示結果。

### Tests for User Story 3

- [ ] T031 [P] [US3] 在 backend/tests/integration/quiz-http.test.js 為 start/close/submissions/results 端點寫合約測試，含所有教師操作未授權、空白、重複、WAITING/RESULTS/COMPLETED 拒收、舊活動／題號、無人作答、禁止重開及查未閉題資料不洩漏。
- [ ] T032 [P] [US3] 在 backend/tests/unit/submission-order.test.js 寫至少三組及同組雙請求競爭，受控 submit-before-close/close-before-submit，非法提交不占順位、第一筆後仍可提交、更改裝置時間不影響結果；禁止以人手點擊猜順位。
- [ ] T033 [P] [US3] 在 backend/tests/integration/quiz-socket-isolation.test.js 寫單題 start/submit/close 到畫面所需推送的合約測試及 HTTP/ack/錯誤隔離測試：固定觀察組的題號、階段及自身狀態，讓其他已加入組提交，觀察組不得收到任何額外業務事件或空通知，重查 HTTP/state:request 的可見資料及 studentViewRevision 不變、所有回覆/header 無全域 stateRevision／commandSequence；教師及提交組更新、同組頁籤同步，閉題才公開結果。初次連線與明確 state:request 回覆須可用；完整斷線重連側通道測試由 T043 擴充。

### Implementation for User Story 3

- [ ] T034 [US3] 在 backend/src/models/submission.js 建立「activityId; questionNumber; groupNumber; answerText: string; submissionSequence: integer; receiveRank: integer」及「僅已接受提交；唯一 (activity,question,group)；receiveRank = submissionSequence，題內 1..K」，不保存未接受提交為有效答案。
- [ ] T035 [US3] 在 backend/src/services/question-service.js 與 backend/src/services/activity-service.js 實作當題 start/close：WAITING 才開、ANSWERING 才閉、無人亦可閉、非最後題 RESULTS／最後題 COMPLETED，closed 永不可逆；狀態變更走 T009，不能 await 檢查與寫入。
- [ ] T036 [US3] 在 backend/src/services/submission-service.js 實作同步驗 Token/活動/題號/組別/ANSWERING/nonblank/唯一鍵後才遞增 nextSubmissionSequence，生成不可變 Submission；與 close 共用 T009，拒絕不覆寫答案、不增加順位，不進行正確性判斷。
- [ ] T037 [US3] 在 backend/src/services/synchronization-service.js 擴充教師完整提交與 closed 結果、學生 ownSubmission／closed publishedResults；內部 stateRevision 只給老師，學生沿用 T027 的 studentViewRevision，更新投影時排除版本及 metadata 後比較；他組提交不得改本組投影／版本，唯提交組及教師產生更新，不以空事件或通知暴露他組活動；無人顯示 noAnswers。
- [ ] T038 [US3] 在 backend/src/api/question-routes.js 與 backend/src/api/submission-routes.js 實作 T031 端點及逐次權限／當題識別檢查；POST 提交回覆僅自己的成功狀態，GET results 不提供未閉題答案。
- [ ] T039 [US3] 在 backend/src/realtime/socket-server.js 實作 Token handshake、每次 state:request 再驗權、初始快照與教師／學生分流，並於本 US3 完成 start、accepted-submit、close 的即時推送：開始／閉題公布給全部已加入者，提交只給教師與提交組全部頁籤，其他學生零事件；初始快照及訂閱原子整合，單題最後題 COMPLETED 亦公布；依賴 T035–T038 並串接 app/server，不能延至 T046。禁止 client 選 room、業務命令只走 HTTP。
- [ ] T040 [US3] 在 frontend/src/services/realtime.js 實作 Socket.IO client、單題全量快照與斷線提示；教師按 activityId/stateRevision、學生按 activityId/Session/studentViewRevision 去除倒退快照，不讀取或推算全域版本；同版本可忽略，不同 Session 重設基準，不自動重送答案，完整重連恢復在 US4 擴充。
- [ ] T041 [US3] 在 frontend/src/pages/TeacherPage.jsx 與 frontend/src/pages/StudentPage.jsx 整合手動開始／結束、文字答案、自己的已提交、教師即時紀錄及已公布結果；回覆遺失先查後端，閉題無人顯示「無人作答」，所有答案以文字呈現。
- [ ] T042 [US3] 在 tests/records/us3.md 保存 T031–T033 實際結果及單題人工流程，確認 US3 不依賴 US4 即可開始、提交、教師即時查看、閉題與公布（含最後題 COMPLETED）；正常連線單題更新須符合 2 秒，側通道測試需有其他學生零事件／版本不變的證據，核對 FR-011–019、021–024、030；任何失敗修正重跑。

**Checkpoint**: US1–US3 形成完整單題即時搶答增量（開始、有效提交、教師即時紀錄、閉題公布均須完成且 <=2 秒）；不能因此省略 US4、US5 或課程完整交付。

---

## Phase 6: User Story 4 - 逐題推進及同步恢復 (Priority: P1)

**Goal**: Q1..QN 手動推進、2 秒同步及重連恢復，最後題保留全部已結束結果。
**Independent Test**: 以預填答案的三題 fixture 驗證各階段合法／非法操作，無需重做 US3 排序測試。

### Tests for User Story 4

- [ ] T043 [P] [US4] 在 backend/tests/integration/activity-lifecycle.test.js 擴充 US3 已有 start/submit/close 推送測試，驗證 next、歷題結果、重連 state:request/state:snapshot/session:invalid、四階段晚加入及重啟；加入重連後他組提交仍不改自己的 studentViewRevision／查詢投影且不產生額外事件，並驗證錯誤/header 無全域計數；禁止跳題、自動開題、重開及舊題提交。
- [ ] T044 [P] [US4] 在 tests/e2e/realtime-lifecycle.spec.js 寫老師加至少三組、每次變更及有效提交確認到 UI <=2 秒、四階段刷新／斷線重連／快照不倒退／已提交不重送測試；以同機量測起點與畫面變更記錄，斷線重連期間不套 2 秒上限。

### Implementation for User Story 4

- [ ] T045 [US4] 在 backend/src/services/question-service.js、backend/src/services/activity-service.js 與 backend/src/api/question-routes.js 實作非最後題 RESULTS 的 next，題號僅加一至 WAITING；拒絕其他情況、保留已結束題結果，只有有效寫操作 stateRevision +=1，失敗／讀取不增加。
- [ ] T046 [US4] 在 backend/src/services/synchronization-service.js 與 backend/src/realtime/socket-server.js 依賴 T039 已完成的單題推送，僅擴充 next 到下一題 WAITING、晚加入與斷線重連的重新驗權／完整快照恢復，不重新建立 start/submit/close 推送；依角色版本原子訂閱，恢復本身不遞增 studentViewRevision，也不向其他學生發通知，不靠 replay。
- [ ] T047 [US4] 在 frontend/src/services/realtime.js、frontend/src/pages/TeacherPage.jsx 與 frontend/src/pages/StudentPage.jsx 依賴 T040/T041 已完成的單題及 COMPLETED UI，只擴充下一題 WAITING、歷題結果、晚加入、重新同步／失效 Token 清除；學生用 Session 可見版本恢復，next 更新 <=2 秒，不新增單題階段功能。
- [ ] T048 [US4] 在 tests/records/us4.md 保存 T043–T044 的每次時間量測及人工多題結果，核對 FR-020–025、029 與 SC-004；確保提交與結束的既有單題測試仍通過。

**Checkpoint**: 已有完整逐題搶答，匯出仍須 US5；多題結果不可重新排名或加入積分。

---

## Phase 7: User Story 5 - 保真匯出 Guided Notes (Priority: P1)

**Goal**: 任意已準備階段匯出，只填已閉題最小順位答案，其他工作簿內容／格式及活動不變。
**Independent Test**: 使用 WAITING/ANSWERING/RESULTS/COMPLETED 的記憶體 fixture 及原始工作簿，
不需人工逐題操作即可比對匯出與活動資料。

### Tests for User Story 5

- [ ] T049 [P] [US5] 在 backend/tests/integration/export-http.test.js 為 GET /activity/guided-notes/export 寫教師權限、無活動、四階段下載 MIME/attachment、任意次數不改狀態、轉換失敗與回覆失敗合約測試。
- [ ] T050 [P] [US5] 在 backend/tests/unit/guided-notes-export.test.js 使用 T013 不同格址／多表保真檔驗證只填 closed 題最小 rank、無人／未閉題留標記、=起始答案為字串、重複匯出原 Buffer 不變；受控 export-before-close/close-before-export 驗證不可混用快照。

### Implementation for User Story 5

- [ ] T051 [US5] 在 backend/src/services/guided-notes-service.js 建立 ExportSnapshot：於同步入口複製原 Buffer 參照、位置映射副本及 closed 題 winner 文字副本，依 data-model.md「async ExcelJS 操作不能讀取仍在變動的 Submission Map」，匯出／失敗均不改 revision。
- [ ] T052 [US5] 在 backend/src/services/guided-notes-service.js 實作快照後於入口外另載原 Buffer 至新 Workbook，以動態 Worksheet/Cell 映射只設應填格 cell.value 為 string，不建立 formula 型別；保留其他值、公式、樣式、工作表及未完成佔位符，失敗不動原始文件。
- [ ] T053 [US5] 在 backend/src/api/guided-notes-routes.js 實作 T049 匯出端點與教師逐次驗權、activityId 檢查、下載 header、轉換錯誤及安全原因；不增加 CSV 或 Google API。
- [ ] T054 [US5] 在 frontend/src/pages/TeacherPage.jsx 與 frontend/src/services/download.js 加入任意已準備階段下載、授權錯誤／匯出失敗提示，下載不能觸發 close/next/start，不在學生介面提供匯出權限。
- [ ] T055 [US5] 在 tests/records/us5.md 保存 T049–T050 實際結果、逐表內容／公式／格式與圖片等特徵比對及人工 Excel 檢視；核對 FR-026–028、SC-005，實際課程檔若無法保真應列 blocker，不得用「盡量」宣稱通過。

**Checkpoint**: 五故事功能全部具備；文件與圖表一致性、自動及人工總驗證仍須收尾。

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 驗證完整交付、三圖一致、所有需求及人工審查，不新增產品功能。

- [ ] T056 [P] 在 tests/records/diagram-consistency.md 逐項對照 diagrams/component.puml 的模組、diagrams/class.puml 的實體與關聯、diagrams/sequence.puml 的開始／接收／排序／閉題／下一題／匯出；發現差異依已確認需求修正實作或三份原圖，改 .puml 後必須 CLI 重產同目錄 component.png、class.png、sequence.png 並重新驗證，不能僅查 PNG 存在。
- [ ] T057 [P] 在 tests/e2e/full-activity.spec.js 補足五故事端到端三題旅程與所有拒絕分支，包含晚加入與當題結束競爭、歷題結果、重複匯出、答案顯示為文字及後端重啟，對照 spec.md AC-01–10、SC-001–007 不留遺漏。
- [ ] T058 在 tests/records/automated-validation.md 執行 quickstart.md 的 backend test、frontend test/build/test:e2e，彙整 T01–T14 的實際結果與環境，失敗修正後重跑受影響測試並保留原因，禁止將 NOT RUN 記為 PASS。
- [ ] T059 在 tests/records/manual-validation.md 由人工依 quickstart.md 完成同機老師及三個隔離持久身分的三題流程、競爭／錯誤、刷新重開、多階段下載及 Excel 視覺比對，保存檢查者、預期／實際與證據；AI 模擬不能冒充人工測試。
- [ ] T060 在 README.md 與 specs/001-classroom-quiz/quickstart.md 更新實際可執行的 Windows 11 安裝／啟動／測試／Demo、環境密碼及同機身分操作說明，保留 OI-001/OI-002 未核准狀態（除非有真實回覆），不增加公開部署步驟。
- [ ] T061 在 tests/records/security-scope-review.md 檢查逐次教師權限、全部學生輸出投影及 metadata／事件數側通道、loopback、Git 待提交密碼／Token／原始敏感課程檔，並確認無題組匯入、CSV、AI 驗答、計分排行或帳號功能；必要修正後重驗，不能只查 UI。
- [ ] T062 在 specs/001-classroom-quiz/review-record.md 與 tests/records/final-acceptance.md 整合六項憲章、FR-001–031、SC-001–007、三圖、規格／程式碼／Demo 一致性與測試證據，取得文件人工審查及跨組結果；外部議題若未解保持 PENDING，未完成強制驗證不得宣稱完整交付。

---

## Dependencies & Execution Order

### Phase Dependencies

T001 治理基準確認 -> T002 -> {T003,T004,T005} -> Foundational -> US1 -> US2 -> US3 -> US4 -> US5 -> Polish。
使用者本次只授權生成 tasks.md，這些箭頭不構成立即實作授權。

### User Story Dependencies

| Story | 執行前置 | 獨立驗證方式 |
| --- | --- | --- |
| US1 | Phase 1–2 | 老師準備，不需要學生／排序／匯出 |
| US2 | US1 提供活動與登入 | 預設活動及隔離 profile，不需要 US3/US4 |
| US3 | US1、US2 | 單題 fixture，含最後題直接完成；不需多題推進 |
| US4 | US3 | 三題預填 fixture，專驗階段及重連／同步時限 |
| US5 | US1 的原檔／映射及 US3 的 closed/Submission 模型；預設順序在 US4 後 | 直接建立各階段 fixture，不必依賴人工逐題活動 |

這些故事有明確共用模型與整合依賴，不能假稱全部無前置可並行實作。
US5 的測試可在 US3 後獨立建立，但若改共用 GuidedNotesService 或 TeacherPage，仍須序列化合併。

### Within Each User Story

測試先建立並確認可執行、對缺少行為失敗，再 models -> services -> endpoints -> UI -> 執行及證據。
所有故事實作任務依序執行，只有明確 [P] 批次可並行。以下為額外依賴：

- T013 完成後才開始 T014/T015；T018 依賴 T017；T020 依賴 T016/T018/T019；T021 建立教師 GET /activity 與其投影後，T022–T023 才可完成 US1 驗收，不依賴 T027/T028。
- T024/T025 在 US1 完成後並行；T026–T030 依序；T028 必須擴充 T021 路由而非重建，不與其他任務同時修改 authorization/session。
- T031/T032/T033 在 US2 完成後並行；T034–T042 依序，T035/T036 必須共用 T009；T037 -> T038 -> T039 單題變更推送 -> T040/T041 UI -> T042 完整單題驗收，不等待 US4。
- T043/T044 在 US3 完成後並行；T045–T048 依序；T046 依賴 T039，僅擴充多題／重連／恢復，避免共用 activity/realtime/UI 修改衝突。
- T049/T050 在 US4 完成後並行；T051–T055 依序，快照先於非同步 Workbook 轉換。
- T056/T057 於五故事完成後並行；T058 等兩者完成；T059–T062 依序，最終驗收依賴全部實際證據。

### Parallel Opportunities

共有 19 項 [P] 任務，分為互不寫相同檔案的批次：T003/T004/T005、T006/T007/T008、
T014/T015、T024/T025、T031/T032/T033、T043/T044、T049/T050、T056/T057。
並行不表示跨過檔案／服務依賴；任務對共用檔案的修改預設序列進行。

## Parallel Example: User Story 1

T013 fixture 準備完成後，同時建立 T014 `backend/tests/integration/preparation-http.test.js`
與 T015 `backend/tests/unit/guided-notes-import.test.js`；兩者都完成後才開始模型與實作。

## Parallel Example: User Story 2

US1 完成後，T024 後端占組合約測試與 T025 瀏覽器身分測試可並行；不要並行改 T026/T029 的共用身分服務。

## Parallel Example: User Story 3

US2 完成後，T031 HTTP 合約、T032 受控排序及 T033 socket 資料隔離在三個獨立測試檔並行建立。

## Parallel Example: User Story 4

US3 完成後，T043 多題生命週期合約與 T044 同機 UI 時限／重連測試可並行建立。

## Parallel Example: User Story 5

US4 完成後，T049 匯出 HTTP 合約與 T050 Workbook／快照測試可並行建立；T051/T052 修改同服務須依序。

## Implementation Strategy

### MVP First (User Story 1 Only)

完成治理基準、Setup、Foundational 與 US1，獨立驗證老師登入與準備作為最小可展示增量。
此 MVP 不等於課程專題完成；不得以此取消其餘四項 P1 核心故事。

### Incremental Delivery

US1 準備 -> US2 身分 -> US3 單題搶答 -> US4 完整逐題同步 -> US5 回填匯出 -> 整體驗證。
每階段保存測試證據並停止核對；僅本機 Demo，不公開部署。未來 Implement 命令需明確授權才執行。

### Parallel Team Strategy

只在列出的獨立檔案批次並行；共用 services、UI、contracts 或圖表由單一工作流依序整合。
本次任務生成沒有啟動平行實作或子代理。

## Requirements and Validation Traceability

| 規格／計畫範圍 | 任務 |
| --- | --- |
| FR-001–003、007–010；T01/T04/T05 | T013–T023 |
| FR-004–006；T02/T03 | T024–T030 |
| FR-011–019、021、023–024；T06/T07/T08/T10/T11 | T031–T042 |
| FR-020–025、029；T03/T09 | T033、T037–T042（單題同步／隔離）、T043–T048（多題／恢復） |
| FR-026–028；T12 | T049–T055 |
| FR-030–031 | T003/T004/T008/T010/T011、各故事錯誤測試及 T061 |
| Diagram First／T13 | T001、模型及共用入口任務、T056、T062 |
| SC-001–007／T14 | 各故事驗證、T057–T062 |
| 人工審查／跨組一致／外部 OI-001/OI-002 | T001、T060、T062；未知維持 PENDING |

## Notes

目前 T001–T029 已完成，T030 待人工驗證，T031–T062 未執行；[P] 為未來執行建議。需求範圍未增加，後續依 Phase 順序執行。
套件精確版本由 T002 核對並鎖定，不假設未實測相容性。格式保留是強制義務，不是「檔案能開就算通過」。
未解外部規範及人工審查不能透過勾選任務自動消失，須保存真實證據。
