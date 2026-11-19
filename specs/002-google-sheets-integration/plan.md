# Implementation Plan: Google Sheets Guided Notes 直接整合

**獨立維護更新（2026-11-19）**：使用者於T064最終接受前另行核准方案B，已移除舊Excel執行路徑及專用測試／依賴。原Plan暫保留歷史helper的決策保留為設計時點，現由本維護更新取代；不是改寫T001–T063原驗收。Sheets parser／Access／Coordinator／Snapshot／Evidence／UI及原安全政策逐一核對不變，JSZip僅開發安全掃描使用。詳../../tests/records/002-google-sheets-integration/excel-retirement.md。63/64、T064未接受。

## T058驗收證據範圍修訂 DA-T058-01（2026-11-18）

使用者已核准專案內部有限驗收證據決策，見 [有限證據與矩陣](../../tests/records/002-google-sheets-integration/t058-negative-write.md)。FR-006／FR-018及所有US／SC產品判準不改；只修訂T058內部結案證據，並非助教已接受。已知DENIED準備拒絕及保護專屬寫拒絕NOT VERIFIED；遠端恰一次真實證據NOT VERIFIED；原protected FAIL保留，真實逾時／斷線／pending reconcile NOT RUN。四項已提供真實行為證據依各自範圍PASS，不以離線測試充當真API；完整Final／SC整體仍待T059與後續關卡。此為最新驗收範圍，原階段狀態文字為歷史。


**目前狀態參照（Final準備，2026-11-18）**：原Plan狀態保留歷史，技術設計未改。US1–US4已實作並獲使用者接受，Final離線結果與尚未執行的兩表live／manual見[Final矩陣](../../tests/records/002-google-sheets-integration/final-acceptance.md)及review-record.md；不能將下文歷史未實作文字或本輪離線PASS當成完整Final接受。

**Branch**: `codex/google-sheets-integration` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: `specs/002-google-sheets-integration/spec.md`，使用者已正式接受 Specify + Clarify 整合版及三圖。RG-001 跨組及 RG-002 人工確認依據見 review-record.md；確認日不等於未提供的討論日。

**Status**: Plan Phase 0／1 設計完成，等待人工審查。未產生 tasks.md，未實作、安裝新套件、建立憑證或執行應用／live API 測試。現有應用仍為 001 Excel 版本；本文件描述後續要實作的設計。

**目前狀態參照（2026-11-18）**：上述 Status 及下文「本輪／待審／未產生 Tasks」為原 Plan 階段快照，保留歷史事實；Plan 後續已獲使用者人工接受，Tasks 已產生並依 Analyze 意見修訂，仍待 Tasks 最終人工審查。最新依據見 [review-record.md](review-record.md)。本次僅細化既有設計：讀取預算依 research R3、前端操作 ownership 依 contracts/http.md A1、時序安全守衛依最新 002-sequence.puml；應用／live 驗收仍 NOT RUN。

## Summary

延續 React／Vite、Express／Socket.IO 與記憶體活動。由後端 Service Account 直接讀取老師貼入的原 Google Sheets，動態取得所有支援 GRID 分頁的整格標記與座標；有效組數及來源完整驗證後才一次建立 Q1 WAITING，不存已驗證文件草稿。老師手動寫回只用同一閉題快照的最快有效完整文字。

三圖為主要藍圖：Component 的 Notes／Writeback／Sheets Access 分別落在解析、回填協調與受控外部介面；Class 的 Source／Location／Snapshot／Operation／Evidence 用記憶體實體實作；Sequence 的權限三態、前置核對、單活動互斥、結果待核對與讀回全部保留。網路呼叫不進入 submit／close 同步裁定。

## Technical Context

**Language/Version**: 現有 JavaScript ES modules，Node.js >=24 <25。

**Primary Dependencies**: 保留目前鎖定 React 19.3.1、Vite 8.3.8、Express 5.3.0、Socket.IO 4.8.4；規劃後端新增官方 google-auth-library（實作時依 Node 24 驗 engines 並鎖定精確版本）；Sheets transport 用 Node 24 native fetch，不新增 googleapis／前端 Google SDK。現有套件相容不在本輪重驗。

**Storage**: 現有 RuntimeStore／Map，新增來源基準、operation、Evidence；重啟可清空。無資料庫、遠端 metadata 或自動範本還原。

**Testing**: Node test、Supertest、Socket.IO client、Playwright 沿用；新增 opt-in live Google suite 與人工真表驗收，所有狀態本輪 NOT RUN。

**Target Platform**: Windows 本機 localhost:3000／5173，同機隔離瀏覽器。Google I/O 需外網，已準備搶答不依賴外網。

**Project Type**: 既有前後端 web application，單活動／單後端程序。

**Performance Goals**: 原有正常連線每次搶答狀態／有效提交至對應 UI <=2 秒不變；雲端處理另顯進度，不拿 Google latency 擴張或取代原標準。

**Constraints**: 老師／學生不登入 Google；只服務身分；憑證 repo 外；只改答案值；拒絕答案格 textFormatRuns；已知無寫入權拒絕、未知可讀則警告放行；受控外部編輯前提 A-04；無背景寫重試、forced overwrite 或遠端鎖保證。

**Scale/Scope**: 課堂本機、至少老師加三組、兩份不同 live 來源驗收；題數依完整標記、不固定三題。寫回 batch 設計上限 2 MiB（超出整次明確拒絕，不改搶答答案接受規則）；大型讀取超時／資源不足明確失敗，不部分建活動。

技術問題 R1–R9 均在 research.md 有決策。授權政策與實際檔案相容性尚需後續實測，不當成未決需求或已通過成果。

## Constitution Check

*Gate evaluated before research and again after Phase 1 design.*

| 原則 | 前置結果 | 設計後結果／證據 |
| --- | --- | --- |
| I 核心需求與跨組 | PASS：使用者明確回報雙方同意直接讀寫；未推定實際會議細節 | PASS：只改 Guided Notes；不加題組／分數／OAuth／部署／還原 |
| II 規格驅動與人工審查 | PASS：Specify／Clarify 整合版本輪獲確認，才進本 Plan | 設計 PASS；本 Plan 新文件人工審查 PENDING，不能自稱可直接進 Tasks |
| III Diagram First | PASS：三份原始圖與既有 PNG 在 Plan 前已齊備 | PASS（設計）：下表逐項對應；只更新本輪審查狀態註記並 CLI 重產 002 PNG；實作一致性 NOT RUN |
| IV 公平與正確性 | PASS：原提交／閉題與角色投影保持 | PASS（設計）：snapshot 短同步、I/O 外置、精確單格值、Evidence 檢查；實作／真表驗證 NOT RUN |
| V 簡潔安全 | PASS：localhost／memory／backend credential | PASS（設計）：單一 auth 依賴、no Drive、scope 限定、repo 外 key、無密碼／Token 日誌 |
| VI 驗證文件 | PASS：規格要求真實證據 | PASS（計畫）：單元／整合／E2E／回歸／live／人工與圖一致性均規劃；未執行不標 PASS |

未提出或豁免任何憲章違反。Google 不提供跨 preflight／write 的 CAS，依已接受 A-04 明列風險；若實際環境必須支援任意外部同時編輯，須回規格審查，不降低安全檢查。

## Project Structure

### Documentation (this feature)

```text
specs/002-google-sheets-integration/
├── spec.md
├── review-record.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/http.md
├── contracts/google-sheets.md
└── quickstart.md
```

tasks.md 由未來 Tasks 階段產生，本輪不存在。001 與其測試證據完全保留。

### Source Code (repository root)

以下為後續修改規劃，尚未建立／修改程式：

```text
backend/src/
  app.js, config.js
  api/preparation-routes.js, guided-notes-routes.js, errors.js
  models/guided-notes-source.js, placeholder-location.js
  models/writeback-operation.js, writeback-evidence.js
  services/activity-service.js, guided-notes-service.js
  services/sheets-access.js, writeback-coordinator.js
  services/source-consistency.js
  store/runtime-store.js
frontend/src/
  pages/TeacherPage.jsx
  services/api.js, guided-notes.js
backend/tests/{unit,integration,live}/
frontend/tests/
tests/{e2e,fixtures/google-sheets,records/002-google-sheets-integration}/
```

**Structure Decision**: 沿用現有服務分層與 DI，GoogleAuth／fetch 僅封裝於 SheetsAccess。不另建專案、全域排程器或持久庫。source-consistency 為 Notes 內部 helper，不是新業務組件。

## Integration with existing code

| 現有模組 | 規劃變更 |
| --- | --- |
| app.js | 可注入 sheetsAccess，組裝 Notes、WritebackCoordinator，測試可提供 fake；不把 fake 當 live |
| config.js／.env.example | 後端 GOOGLE_APPLICATION_CREDENTIALS 路徑驗證、來源固定 host；不自動讀前端 env、不在 .env.example 放 key；ADMIN_PASSWORD 與 localhost 保留 |
| ActivityService | setGroups 只存有效組數；loadSource 先驗組數取得 busy，再於 I/O 外讀取／驗證，成功一次 commit；不保存 validated document 草稿 |
| GuidedNotesService | 將 ExcelJS 走訪改為 Google sparse grid，保留 regex、唯一連續與 merge master；回傳 Source，維持 placeholderLocations 使用介面 |
| Activity／Question | Activity.document 改來源物件即可建立 questions；closed／rank 模型不改 |
| GuidedNotes routes | multipart 改 JSON URL；新增寫回操作／查詢／reconcile，舊 export teacher 路徑退役 410，逐次驗權 |
| TeacherPage | 檔案選擇改網址；顯示來源／excluded／權限警告、手動寫回及逐題狀態；刷新查回 operation。寫回訊息獨立於 quiz view，避免相同 quiz revision 吃掉狀態 |
| api.js／session.js | 保留請求世代與過期回覆保護；operation 另以 activityId／id／revision 比較，不讓舊操作覆蓋新畫面 |
| StudentPage／SubmissionService／QuestionService／Sync／socket-server | 業務行為不改；學生任何 HTTP／Socket／ack 不增加雲端資料或側通道 |
| ExcelJS／workbook-fidelity／workbook-text／download.js | 正式 runtime 不再走此路徑；先解除正式 UI／路由，舊 helper 與依賴暫保留支援歷史測試，避免本次擴大清理；不要把 OOXML 編碼用在 Google 字串 |

## Main algorithms and consistency

1. **Prepare**：短同步驗權／未建立活動／有效組數／busy；網路外讀完整來源，驗 GRID、位置、標記、runs 及可見權限。DENIED 不 commit，UNKNOWN 可以 commit 加警告；成功後短同步再驗活動與鎖 ownership 一次建立，finally 解 busy。
2. **Snapshot**：POST 在短同步命令驗 teacher／activity，取得寫回 running ownership，複製閉題最小 rank 答案、來源與位置；沒有 fills 直接 NO_CHANGES。
3. **Preflight**：網路外全來源核對結構／原映射／值，用 Evidence 與 pending expected values 接受已寫格；全批先驗、衝突全停。讀不到時不猜成功。
4. **Write**：只在仍為原標記、可表示、無格式／權限拒絕的待填格，產生單格 stringValue updateCells；全部合為一次 batch。無 read-modify-write Google lock，不寫整表／格式。
5. **Verify and recover**：全原目標讀回，精確值／型別／位置吻合才 Evidence；未知則留原 snapshot。reconcile 手動，先讀所有目標，不以重新擷取 closed winners 取代 pending。舊 attempt 未能安全排除時保留屏障，不能因讀到標記或等180秒就重送。詳 research R8。
6. **State updates**：operation status／revision 與 quiz version 分離；不改 phase／answers／rank。老師只查本機狀態，學生完全不接雲端變更事件。短同步回存不 await，不阻塞搶答。

## Diagram traceability

| 圖 | 實作責任映射 | 設計核對 |
| --- | --- | --- |
| 002-component | Auth→既有 Authorization；Activity／Quiz／Sync 原責任；Notes→GuidedNotesService；Writeback→Coordinator；Access→sheets-access；Store→Map | Service Account 邊界、no Excel 正式流程、手動寫回、未知權限警告與僅老師狀態一致 |
| 002-class | Source／Location／Snapshot／Operation／Evidence 對應 data-model；WritebackCoordinator 依賴證據與原操作 | 穩定 sheetId、活動唯一來源、每題一格、沒有新 Activity phase，一致 |
| 002-sequence | prepare lock→全部驗證→一次 commit；closed snapshot→preflight→單次值寫→讀回→pending/reconcile | 同步／I/O 分離、全批先驗、已寫值可取代標記、已知拒絕 vs UNKNOWN、無盲重送一致 |

Plan 的 202 operation HTTP、專用老師查詢與 transport attempt 狀態是圖內責任細化，不新增核心使用流程。圖中「解除 running ownership」不等於清除 pending barrier；圖中「核對後更新」不代表無條件重送。原三份 001 圖不修改。

## Verification strategy

| 層級 | 必須驗證 | 需求／判準 |
| --- | --- | --- |
| Unit | URL allowlist／gid、sparse offsets／sheetId=0、跨表唯一連續／疑似錯誤、公式／merge／runs、權限三態與 unprotectedRanges | FR-003–006；無半場活動，拒絕詳列位置 |
| Unit | source baseline／Evidence 優先、答案恰為標記、原位置改值／插列／刪表、同快照閉題競爭、文字精確性 | FR-010–016；不存在 false missing marker，無覆蓋已偵測衝突 |
| Adapter contract | 固定 host／scope、單格 body／fields、寫 attempt 傳輸次數=1、取 token 失敗零寫、無重試與 private error 洩漏 | FR-007／013／019 |
| Integration | prepare busy／invalid groups／DENIED／UNKNOWN、teacher auth、所有 operation transitions／多頁籤、lost reply／late attempt／部分讀回／撤權 | FR-006–018；舊請求不解除安全屏障 |
| Socket regression | 至少三組並發／重複／submit-close 雙順序、零觀察組通知與版本側通道、四階段晚加入／重連、重啟 | FR-008；原邏輯不退步 |
| E2E fake | 網址替代選檔、錯誤重試、老師權限警告／手動操作、刷新恢復、未知結果先查不重送、原完整搶答 | 只證明 UI／服務整合，不冒稱 Google 成功 |
| Live Google | 兩份不同 ID／分頁／格址，包含 hidden／merge／公式／整格格式／非答案 rich text；寫回最小順位、重複無 false conflict、唯讀／保護格／撤權 | SC-001–004／006，真實 API 與前後內容型別／格式比對 |
| Manual | 老師加三組完整活動，兩份真表逐表查看、=文字、無人保標記、再寫與新場次人工還原；錯誤／授權處理 | 自動不代填人工；記日期、方式、預期、實際、PASS/FAIL/NOT RUN |
| Final | 三圖逐責任／實體／時序對照、保護檔案 diff、候選檔秘密掃描、前端 build | constitution III／VI；證據保存 tests/records/002-google-sheets-integration/ |

fixtures 使用合成資料，live IDs／key path 由當次環境提供不提交。全部本輪 NOT RUN。原 Excel 專用測試作歷史路徑回歸保留，正式準備／export 舊合約測試要遷移，不藉刪掉舊驗證掩蓋流程改變。故不能保證原測試總數保持73／7／14；每項保留／遷移要可追溯。

## Risks and phase exit

- API 無跨讀寫 CAS，A-04 是使用前提，不能偵測所有未留痕外部結構操作；不新增寫保護來假裝鎖。實際有不同協同需求就回規格。
- Google 字串、保護範圍與學校分享政策必須真表測試。UNKNOWN 不當 DENIED，但不能向老師保證之後一定可寫。
- 結果永久不明可維持 pending；安全優先於一定恢復。重啟不代表遠端取消，原表重用前須核對舊結果；無自動還原。
- 大型來源讀取或 payload 可能超過本機／API 能力，明確拒絕，不靜默截斷。SDK 精確版號與所有測試需實作時記錄。
- Plan 文件與圖設計自洽、無未決需求選項；RG-004 live NOT RUN 與實作驗證不是已完成。Plan 人工審查尚待，通過後可產生 Tasks；本次停止，不執行 Tasks。

## Complexity Tracking

無憲章違反需豁免。必要新增複雜度限 SheetsAccess 與 WritebackCoordinator／Evidence／Operation：原 XLSX 本機副本沒有遠端未知結果，直接寫原表需要此責任才能防止盲重送。未採持久庫、通用 adapter framework、Drive 或分散式鎖。
