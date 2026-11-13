# Implementation Plan: ClassroomQuiz 核心課堂搶答

**Branch**: `main` | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-classroom-quiz/spec.md`

**Status**: 技術設計草案完成，待人工審查及跨組核對；未授權進入 Tasks 或 Implement。
setup-plan 回傳的 BRANCH 為功能識別 `001-classroom-quiz`，實際 Git 分支仍為 `main`，未切換分支。

## Summary

依 Constitution 1.0.0、spec.md 的四項澄清與根目錄 diagrams 三圖，建立 Windows 11 同機課堂搶答。
採 React / Vite JavaScript 前端及單程序 Node.js / Express / Socket.IO 後端；ExcelJS 處理工作簿，
資料全存記憶體。後端統一裁定活動狀態、Session、接收順位與可見資料。
本文件與支援文件只描述未來實作；不建立原始碼、測試程式、套件設定或 tasks.md。

## Technical Context

**Language/Version**: JavaScript ES modules；Node.js 24 LTS 作實作基準，安裝時確認套件 engines 並鎖定精確版本。

**Primary Dependencies**: React 19 系列、Vite（與 Node 24 相容的穩定版）、Express 5、Socket.IO 4、
同版本 socket.io-client、ExcelJS 4；精確版本與 lockfile 在 Implement 建立，不在本階段安裝套件。

**Storage**: 單後端程序內 Map／物件；保留原始 XLSX Buffer、解析映射及活動快照；不用資料庫。

**Testing**: Node 內建測試執行器、Supertest 驗證 HTTP、Socket.IO client 驗證隔離及重連、
Playwright 隔離持久瀏覽器設定檔驗證 UI；ExcelJS 加 XLSX 套件內容／格式及人工檢視往返比對。

**Target Platform**: Windows 11、VS Code + OpenAI Codex、同一台電腦的不同瀏覽器身分；
固定 localhost origin，後端及 Vite 僅綁定 loopback，不公開部署。

**Project Type**: 本機 web application，老師及學生兩個介面，共用一套後端邏輯服務。

**Performance Goals**: 正常連線且至少三組學生與老師同機使用時，後端提交／階段確認至畫面更新每次不超過 2 秒。

**Constraints**: 單題簡答；順序 Q1..QN；整格唯一佔位符；每組每題一筆；後端接收排序；
不得提前洩漏他組答案／順位／狀態；格式保真不得因選庫而放寬；不使用 Google API 或雲端服務。

**Scale/Scope**: 一次後端執行一場活動，組數為合法正整數，題數由工作簿決定；
至少三組作為規格最低併發驗收，非新增三組上限。輸入資源上限屬實作前容量驗證，不擅加業務限制。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

本次依使用者明確要求產出可審查技術草案；這不代表既有審查關卡被豁免。
尚無人工確認規格／圖表及跨組核對的證據，因此不得宣稱全部治理關卡已通過，
也不得以此草案自行進入 Tasks／Implement。未解外部規範維持 OI-001、OI-002。

| 原則 | 設計前核對 | 設計後核對及證據 |
| --- | --- | --- |
| I 核心需求 | 無新增產品功能 | 技術責任均對應 FR；跨組核對待人工記錄 |
| II 規格驅動 | 規格及澄清存在；人工審查紀錄未提供 | 僅 Plan 產物；人工審查及流程基準確認 PENDING |
| III PlantUML | 三種 .puml 與 PNG 均存在且已讀取 | Diagram Traceability 對照一致；無需變更圖表；實作後重驗 |
| IV 公平正確 | 規格要求明確 | 同步臨界區、唯一提交、角色投影、原範本快照回填 |
| V 簡潔安全 | 本機與執行期資料保存 | 單程序記憶體、不加帳號或資料庫、環境密碼、loopback |
| VI 驗證文件 | 自動及人工驗證要求保留 | Test Strategy 14 類全涵蓋；本次應用測試 NOT RUN |

技術設計未發現必須違反 Constitution 的理由；人工治理確認及外部課程驗收仍 PENDING。

## Project Structure

### Documentation (this feature)

```text
specs/001-classroom-quiz/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/http.md
  contracts/socket-events.md
  checklists/requirements.md
diagrams/
  component.puml / component.png
  class.puml / class.png
  sequence.puml / sequence.png
```

tasks.md 屬後續命令，不在本次建立。

### Source Code (repository root)

以下皆為未來路徑規劃，本次不建立這些目錄或檔案。

```text
frontend/
  src/pages/TeacherPage.jsx
  src/pages/StudentPage.jsx
  src/components/
  src/services/session.js
  src/services/realtime.js
  tests/
backend/
  src/models/
  src/store/runtime-store.js
  src/services/authorization-service.js
  src/services/activity-service.js
  src/services/question-service.js
  src/services/submission-service.js
  src/services/synchronization-service.js
  src/services/guided-notes-service.js
  src/api/
  src/realtime/
  tests/unit/
  tests/integration/
tests/
  e2e/
  fixtures/guided-notes/
  records/
```

**Structure Decision**: 前後端分目錄但單一後端責任來源；QuestionService 是 Activity Management
的內部協作模組，不新增獨立服務或流程。圖中 Runtime Store 實作為記憶體，非資料庫。

## Complexity Tracking

沒有技術例外申請。人工審查缺少紀錄不是可用複雜度理由豁免的事項。

## Architecture Decisions

### 模組責任

| 規劃模組 | 圖表對應 | 責任 |
| --- | --- | --- |
| Teacher UI | Teacher Browser | 登入、準備、當題控制、所有提交、已結束結果、下載 |
| Student UI | Student Browser | 占組、恢復、當題輸入、自己的狀態、已公布結果 |
| Authentication / Session | Role / Session Validation；AuthorizationService | 環境密碼登入、隨機 opaque Token、後端角色及組別綁定 |
| Activity State | Activity Management；ActivityService | 原子準備、四階段、目前題、合法狀態切換 |
| Question Management | Activity Management 內部；Question | Q1..QN、開始／結束不可逆、下一題，不獨立暴露任意題修改 |
| Submission / Ranking | Submission Management；SubmissionService | 單筆限制、單調 sequence、答案接受與拒絕 |
| Realtime Sync | State Synchronization；SynchronizationService | 角色投影、全量快照、重連、2 秒 UI 更新 |
| Guided Notes | Guided Notes Import / Export；GuidedNotesService | XLSX 驗證、動態位置映射、只填已結束成功答案 |
| Runtime Store | Runtime Activity Store | 共享活動、Session、immutable 原檔及所有已接受提交 |

### 一致接收與狀態切換

所有開始、結束、下一題、占組及提交均進入同一程序的同步命令入口。
以完成封包解析並進入該入口的順序定義後端接收順序，不以裝置時間、socket.id 或非同步驗證完成時間排序。
入口先分配內部 commandSequence，再同步檢查 token、activityId、questionNumber、角色、階段與重複鍵。
檢查及寫入之間不得 await 或進行 I/O；失敗不變更活動、不消耗 receiveRank。
有效提交將題內 nextSubmissionSequence 加一，存為 submissionSequence，對外 receiveRank 與之相等。
同組同題第二筆不得增加該數字。提交與結束使用同一入口，因此不存在先檢查後 await 導致的越界接受。

非最後題 ANSWERING -> RESULTS；RESULTS 的 next 僅遞增題號至 WAITING；最後題結束 -> COMPLETED
並同時公布。第一筆成功提交不結束題目。所有題目 closed 後不可重開。
晚加入沿用相同占組與提交檢查，四階段均可占未用組別，但僅 ANSWERING 可作答。

### 身分與安全

ADMIN_PASSWORD 僅從後端環境讀取，缺少時拒絕啟動，禁止預設管理密碼及 VITE_ 前綴暴露。
老師登入後由後端發放老師 Token；學生占組成功後發放學生 Token，以密碼學安全亂數產生。
伺服器 Map 保存 Token 雜湊到 Session；前端 localStorage 保存 opaque Token 以跨刷新／重開恢復，
不用 socket.id 當身分。老師與學生使用隔離瀏覽器設定檔；同設定檔多頁籤共用身分。
每次 HTTP 及 socket 請求均重新查驗角色與綁定；client role/groupId/room 不可信。
重啟清空 store 與 tokens；斷線不釋放組別，無逾時接管、踢除或額外帳號功能。
React 以文字呈現答案，不使用 HTML 注入；token／密碼／完整答案不寫入一般錯誤紀錄。
固定同源 localhost；開發期 Vite 代理 /api 與 /socket.io，禁止任意 origin 連入。

### 同步與可見性

業務命令走 HTTP，Socket.IO 負責角色快照推送；兩者共用同一服務及記憶體。
每次成功變更增加內部 stateRevision；此全域值只可出現在教師回覆，學生任何回覆均不得包含。
學生使用各 Session 的 studentViewRevision（初始為 0），只在該 Session 的可見業務資料改變時加一；
比較投影時排除版本及傳輸 metadata，不以全域版本、提交總數或請求次數派生此值。
先產生不可變 teacherView/studentView，再只向可見資料改變的接收者推送。
有效提交僅更新教師及提交組所有頁籤；其他學生不增加版本、不收到事件、空事件或其他通知。
開始／結束公布向所有已加入者更新，下一題同樣更新；主動查詢及重連回傳相同可見資料時版本不變。
學生視圖由白名單組裝，不序列化 Activity 或 Submission 原物件後讓前端隱藏。
當題 closed 前不帶任何他組答案、順位、提交狀態或總提交數，也不帶自己的順位。
已結束題目可公開；可選組號及占用狀態僅為加入資訊，不包含作答狀態。
不使用對所有人 io.emit 的教師 payload，不讓學生自行選 teacher room。
連線建立／恢復先驗 Token，立即從後端產生當前全量快照；不依賴事件重播完整性。
教師以 activityId/stateRevision、學生以 activityId/Session/studentViewRevision 去除倒退快照；
不同活動／Session／重啟時重設比較基準並清除無效身分，不跨 Session 比較學生版本。
HTTP 回覆、Socket ack、錯誤、ETag 或其他 metadata 均不得夾帶全域版本／提交序號；
一般 requestId 採不揭露全域操作計數的隨機識別。已結束題目的公開結果保留原規格行為。
HTTP 回覆遺失時先查自己的後端狀態，不自動重送答案；重送亦由唯一鍵拒絕。

### Excel 保真

依 research.md 使用 ExcelJS document 模式。原始 Buffer 不可變，解析後暫存 Workbook
及 questionNumber -> worksheetId/name + address 映射，整份驗證成功才一次 commit 活動。
規則為整格 /^\{\{Q([1-9][0-9]*)\}\}$/、題號唯一、Q1..QN 連續；不是字串的公式結果不可當佔位符。
合併格只掃描 master 一次，維持 merge；重複標記跨表仍拒絕。疑似損壞標記報出位置。

匯出命令在同步入口截取 closed 題的最小順位文字及位置映射，再於入口外非同步載入原 Buffer
到新的 Workbook，只將應填格設為字串值（答案以 = 起始也不得成為 formula），不修改原 store。
並行結束不影響已取得的快照；無提交／未結束保留佔位符。
「盡量保持」不得降低 FR-027 的內容／格式義務。ExcelJS 不能被假定為任意 OOXML 無損工具；
實作先以測試工作簿證明受支援特徵的 round-trip，不能靜默丟棄內容後匯出成功。
若實際課程檔有不能保留的特徵，視為相容性阻礙，保留原檔、回報原因並與使用者／另一組處理；
不得自行縮小驗收範圍或改用固定座標。具體支援界線與驗證見 research.md。

## Data Model

詳見 [data-model.md](data-model.md)。模型對應 class.puml：Activity 包含 Questions、Groups、
GuidedNotesDocument；每題一個 PlaceholderLocation；Submission 同時關聯一題與一組；
學生 Session 最多綁一組且每組最多一個 Session。補充 revision／sequence 是技術欄位，不改變模型語意。

## API / Socket.IO Events

詳見 [HTTP 合約](contracts/http.md) 與 [Socket.IO 合約](contracts/socket-events.md)。
所有命令帶 activityId／questionNumber 避免延遲請求落入新題；後端派生 group 與 role。
檔案經 HTTP multipart 上傳／XLSX 下載；Socket 僅同步，不新增第二套可繞過順序的提交入口。
US1 T021 即建立 activity-routes.js 的唯一教師 GET /activity 與教師基礎投影；
US2 T027/T028 擴充同一路由的學生安全分支，不重建端點或讓 US1 等待 US2。
US3 T037–T042 完成單題 start/submit/close/結果公布及正常連線 2 秒推送的獨立驗收；
US4 T045–T048 依賴此基礎，只擴充下一題、晚加入與斷線重連／狀態恢復。

## Error Handling

統一錯誤包含 code、可理解的 message、requestId，以及可選的安全 details（題號、表名、格址）。
未授權 401、角色不符 403、不合法輸入 400／422、狀態或占用衝突 409、檔案讀寫 422／500。
拒絕不得改變有效資料；重複提交不覆蓋原答案；失效 Session 不自動換組。
匯入錯誤保留準備設定但不建立 Activity；修正檔案後可重試。準備 commit 後禁止更改組數或重匯。
匯出串流／轉換失敗回報且不影響活動；連線斷開顯示待重新同步，禁止宣稱提交成功。

## Test Strategy

此為未執行的未來測試計畫，全部應用測試目前 NOT RUN。

| ID | 驗證內容／方法 | 對應需求 |
| --- | --- | --- |
| T01 | 有效／無效／缺少環境密碼、偽造老師請求、每個專用操作驗權 | FR-001–002、031 |
| T02 | 不同 Token 同時占同組只一個成功；同 Token 不得再占第二組 | FR-003–006 |
| T03 | 持久設定檔重開、同身分雙頁籤、重連及重啟失效；四階段晚加入 | FR-004–006、025、029 |
| T04 | 有效 .xlsx、損壞、非檔案格式、無佔位符、匯入原子性及重試 | FR-007–010 |
| T05 | 缺號、跨表重複、Q0/Q01/q1、破括號、文字混合、前後空白、公式、合併格 | FR-009–010 |
| T06 | 至少三組同時提交；後端受控接收序與 rank 一致；失敗不占序號 | FR-014–016、018 |
| T07 | 空白、換行、重送、同身分雙頁籤競爭，唯一鍵與答案不變 | FR-013、016 |
| T08 | submit-before-close 及 close-before-submit；WAITING／RESULTS／COMPLETED 拒收及舊題拒收 | FR-011–021、025 |
| T09 | 老師與三組正常連線，每次階段及新提交至 UI <=2 秒，刷新／重連校正 | FR-022–025、SC-004 |
| T10 | 檢查完整 HTTP、socket、ack、重連 payload、結果端點及錯誤；固定觀察組狀態，讓他組提交，驗證觀察組版本與業務回覆不變、無額外事件／空通知、metadata 無全域計數；教師及提交組正常更新 | FR-024 |
| T11 | 無人作答仍能結束，含最後題 COMPLETED、「無人作答」、不回填 | FR-017、019、021、026 |
| T12 | 不同格址、多表、字型、框線、合併、列寬高、公式與格式等 round-trip，匯出快照競爭、=字串 | FR-026–028 |
| T13 | 逐一對照三圖的責任、關聯、不變條件、時序與最後題分支；改圖重產 PNG | Constitution III |
| T14 | 人工以老師及三個隔離持久身分操作三題完整流程、多次匯出及錯誤恢復 | SC-001–007 |

fixture 規劃：同內容分別將 Q1..Q3 放於不同格址／工作表的兩份 valid 檔、保真特徵檔、
各類 invalid 檔及無提交／部分完成／全部完成快照；不在本階段建立測試資料檔。
每份結果保存指令、環境、fixture、預期、實際、PASS／FAIL／NOT RUN 及失敗證據，
人工比對實際 Excel 顯示；不以測試描述代替執行結果。

## Diagram Traceability

| 來源圖 | 主要實作模組 | 核對結果與後續證據 |
| --- | --- | --- |
| component.puml | TeacherPage、StudentPage、AuthorizationService、ActivityService（含 QuestionService）、SubmissionService、SynchronizationService、GuidedNotesService、RuntimeStore | 全部邏輯節點及依賴保留；圖中的 database 外形不代表持久資料庫 |
| class.puml | models 內 Activity、Question、Group、Submission、Session、GuidedNotesDocument、PlaceholderLocation；五項 Service 及 RuntimeStore | 1..*／0..1 關聯、唯一組題、closed 不可逆均對應 data-model.md |
| sequence.puml | HTTP handlers -> Authorization -> 同步命令入口 -> RuntimeStore -> 角色 Sync；GuidedNotes 匯出快照 | 開始、接受／拒絕、結束競爭、最後題 COMPLETED、手動下一題及獨立匯出均一致 |

已讀取三份原始圖；本次 C1 修復同步細化三圖的版本可見性與單組事件接收範圍，
並以 CLI 重產同目錄 PNG，不改變已確認的業務流程。
時序圖的已綁定身分為該示例之前置條件，不表示禁止後續加入；四階段晚加入沿用同一 Auth 與 Store。
實作後 T13 必須保存逐項對照，不能僅以圖可渲染作為程式碼一致性證明。

## External Rules and Review Status

- OI-001：.xlsx 中介是否符合 Google Sheets 回填要求，仍待助教確認。
- OI-002：助教測試檔是否允許預先加佔位符，仍待助教確認。
- 兩項不是待研究的套件選擇，不能由技術研究代替課程核准；維持 spec.md 原文狀態。
- 人工規格／圖表／本計畫審查與跨組功能一致性核對待紀錄；使用者授權本次技術草案不等於外部核准。

## 2026-11-13 課程依據更新

以上保留原設計階段的歷史狀態。最新證據：期末專題說明.pdf 第 2 頁明確允許修改範本及加入佔位符，OI-002 為 CONFIRMED_BY_COURSE_DOCUMENT；OI-001（.xlsx 中介接受性）仍 PENDING。跨組依 implemented-features.md 先提供本組已實作功能供另一組後續開發核對，使用者回報對方尚未動工，不要求現在有成品可互測；功能／流程變更討論規則不變。
