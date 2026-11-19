# US1 offline implementation record — T015–T026

日期2026-11-18。Feature 002／分支codex/google-sheets-integration。當前Git HEAD仍為66bb41a961094651ad8a84620b453ef3956a4cfa，變更未commit。使用者僅授權US1，T003／T004仍人工待辦。

## 任務與判定

| Task | 結果 | 證據 |
| --- | --- | --- |
| T015 | PASS／勾選 | parser unit 14個案例通過；URL allowlist、A/B位置、hidden／merge、非法／公式／缺號／重複／runs／chips、權限與參照 |
| T016 | PASS／勾選 | preparation HTTP 5個案例與既有foundation 7個案例通過，未知欄位／multipart安全拒絕，原Session／Origin／安全assertions保留 |
| T017 | PASS／勾選 | 新frontend source client 2個unit及teacher-preparation E2E 1個通過；fake DI不接Google |
| T018 | PASS／勾選 | 新GuidedNotesSource／SheetBaseline型別約束與immutable map；parser A/B及不可修改斷言通過 |
| T019 | PASS／勾選 | 既有placeholder-location.js加fromGrid，歷史Excel constructor保留；零sheetId／動態格址／merge master驗證 |
| T020 | PASS／勾選 | GuidedNotesService新增loadSource／parseSource，保留歷史Excel helper，正式route不走Excel |
| T021 | PASS／勾選 | 已知false保護拒絕；warningOnly／可編輯／缺參照／不可見資訊為允許但UNKNOWN；sheet例外、namedRange／table測試通過，零測試寫入 |
| T022 | PASS／勾選 | store僅組數／busy，loadSource鎖ownership、I/O外置、成功一次Activity；失敗釋鎖／保留組數；既有Activity建構子已可用來源映射，無需改搶答模型 |
| T023 | PASS／勾選 | JSON URL準備與老師Notes GET，驗權在Google前及commit前；來源不進quiz／student投影 |
| T024 | PASS／勾選 | source client世代／activity與重複查詢保護；API保留安全error details，原Session世代assertions通過 |
| T025 | PASS／勾選 | TeacherPage先組數再URL、busy鎖欄位、來源／excluded／UNKNOWN提示；刷新恢復，移除正式Excel選檔與下載按鈕，未加寫回功能 |
| T026 | PARTIAL／未勾選 | US1範圍unit／HTTP／E2E與build通過，但完整backend regression 8項舊準備fixture失敗，不能宣稱完整驗證結束 |

## 實際測試

| 命令／方式 | 預期 | 實際 |
| --- | --- | --- |
| 初次TDD執行parser／preparation | 舊版介面應揭露缺口 | RED：舊準備不呼叫fake，mutex測試無法結束；僅終止本輪確認過的兩個node測試程序，沒有停止使用者服務。實作後重新執行 |
| node --test backend/tests/unit/sheets-source-parser.test.js backend/tests/integration/preparation-http.test.js | US1來源與HTTP | 最終19／19 PASS；中間1項assert validator返回字串的測試撰寫問題已修正為boolean，沒有降低assertion |
| node --test backend/tests/unit/sheets-source-parser.test.js backend/tests/integration/preparation-http.test.js backend/tests/unit/foundation.test.js | US1及原安全契約 | 最終26／26 PASS、0 fail／skip，1447.8754ms |
| npm --prefix frontend test | source client及既有前端單元 | 9／9 PASS、0 fail，210.2608ms |
| npm --prefix frontend run build | 正式建置 | PASS，Vite8.3.8、51 modules，152ms |
| E2E_FRONTEND_PORT=5273／E2E_BACKEND_PORT=3100；npm --prefix frontend run test:e2e -- teacher-preparation.spec.js | 假API老師網址準備、錯誤重試、位置提示、UNKNOWN、excluded、刷新／連線、開始搶答 | 最終1／1 PASS（6.3s；案例1.9s），另首輪同案例亦PASS；使用獨立測試server，未安裝套件或瀏覽器 |
| npm --prefix backend test | 全部後端unit／integration | 117 tests，109 pass／8 fail／0 skip，6985.9329ms，退出碼1；不可記為PASS |
| git diff --check；us1-protected.json比對 | 001歷史與核心保護 | PASS；59保護檔hash不變；LF／CRLF提示不屬空白錯誤，三圖未改 |

## 未解決的完整回歸缺口

- group-session-http.test.js 的prepared()仍先Excel import再setGroups；7個案例因c.activity.import已移除而失敗。
- restart-process.test.js仍multipart上傳XLSX；1個案例實得400而舊預期201。其process-server helper也需fake DI。
- 以上只屬準備fixture遷移，原Session／角色／重啟assertions未改；任務原列US2 T027／T028。本輪不恢復Excel正式流程，也不改成略過失敗測試。
- 曾嘗試以單一命令遷移這三個檔案的準備前提，但自動核准審查拒絕，回傳僅「blocked by policy」，未提供更具體原因。該命令未執行，三檔diff仍為空；未改用其他工具重試同一修改。
- 遵守僅US1範圍停止擴大修改，T026保留未完成，等待使用者對後續範圍確認。這不是Google真實API失敗，也不能據此保證全部搶答回歸已通過。

## 設計／安全界線

老師輸入只解析ID，SheetsAccess固定官方host；gid不縮小掃描；支援GRID包含hidden，合併格只算主格。原位置／純文字原值稀疏基準保存，格式拒絕與權限三態遵循既有決策；未知不冒稱可寫。錯誤只帶安全位置，沒有key／Token／真表ID。

新模型與Notes／Activity／Access責任、原子準備時序對三份002圖一致；未修改puml，故無需本輪PNG重產。protected core的QuestionService／SubmissionService／Authorization／Sync／dispatcher／Socket程式不變。正式準備已不接受XLSX；原Excel helper與舊export路由僅待US3退役，TeacherPage不提供Excel正式按鈕，本輪未實作寫回。

真實Google Token／API、T003／T004、兩份真表與人工驗收全部NOT RUN／人工待辦。US2–US4／Final未開始、未勾選；沒有commit／push。

## 2026-11-18 T026後續結果

使用者另行明確授權後，三個舊準備fixture已最小遷移，原assertions保持；8項及完整backend117項均通過，frontend9／US1 E2E1／build也通過，T026已勾選。上文109／8及policy拒絕保留為當時紀錄，不代表目前狀態。完整證據見t026-validation.md及t026-*.txt。真Google驗收仍NOT RUN，US2尚未開始。
