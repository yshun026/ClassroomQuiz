# T056：三圖與實作一致性

日期：2026-11-11。實際讀取三份 .puml、HTTP／Socket 路由、模型及服務，並對照以下測試；這不是只檢查 PNG 是否存在。

## Component Diagram

| 圖中責任／連線 | 實作及證據 | 結果 |
| --- | --- | --- |
| Teacher Browser／Student Browser | TeacherPage、StudentPage；HTTP 業務命令及 Socket 快照 | PASS |
| Role / Session Validation | AuthorizationService；teacher 路由逐次驗權，Socket handshake／state:request 重驗，student 綁定 | PASS |
| Activity Management | ActivityService 原子準備，QuestionService.start/close/next；屬 plan 已明定內部協作模組 | PASS |
| Submission Management | SubmissionService.submit，同步 dispatcher 驗階段／唯一組題後才分配順位 | PASS |
| Guided Notes Import / Export | GuidedNotesService.validateAndImport／exportClosedWinnerSnapshot／renderExport；workbook-fidelity 檢查保真 | PASS |
| State Synchronization | SynchronizationService 與 socket-server；教師全域版本，學生自己的可見版本；他組提交不通知學生 | PASS |
| Runtime Store | Map 保存活動、原檔、位置、Session、組及提交，程序重啟允許清空；圖中 database 符號表示邏輯儲存，沒有資料庫依賴 | PASS |

## Class Diagram

| 圖中實體／關聯 | 實作 | 結果 |
| --- | --- | --- |
| Activity → Question、Group、ActivityPhase | Activity.questions/groups Maps、四階段及 currentQuestionNumber；id 對應圖中 activityId | PASS |
| Question → Submission；Group → Submission | submissionsByGroup Map；Submission 含 activityId/questionNumber/groupNumber，組題唯一，連續順位 | PASS |
| Group ↔ Session 0..1 | studentSessionId 對應 Session.id；老師不綁學生組；多頁籤可共用 Token，斷線不釋放 | PASS |
| Session identity、role、可見版本 | id/role/studentViewRevision/lastStudentProjection；快照複製，沒有全域版本洩漏 | PASS |
| Activity → GuidedNotesDocument → PlaceholderLocation；Question → Location | document、原始 Buffer 防禦副本、placeholderLocations、Question.location；位置不可變 | PASS |
| 邏輯服務操作 | 圖中 ActivityService.startCurrent/closeCurrent/nextQuestion 的責任依 plan 分配給內部 QuestionService；Authorization 的 resumeIdentity 對應 validate+validateBinding+resumeView；為邏輯責任名稱，沒有新增流程 | PASS |

## Sequence Diagram

| 時序／不變條件 | 程式與驗證 | 結果 |
| --- | --- | --- |
| 開始：驗教師 → WAITING 到 ANSWERING → 各角色快照 | QuestionService.start；quiz-http／quiz-socket／realtime-lifecycle | PASS |
| 提交：驗綁定 → 原子檢查與順位 → 只推教師及提交組頁籤 | SubmissionService.submit；submission-order、quiz-socket-isolation | PASS |
| 非法／重複／舊題拒絕，不增加 rank | HTTP 合約及單元競爭測試 | PASS |
| 閉題與提交同一順序；非最後 RESULTS、最後 COMPLETED | 同步 dispatcher；受控 submit-before-close／close-before-submit | PASS |
| 閉題才公開所有答案／順位，無人作答也可結束 | publishedResults 閉題過濾；HTTP、Socket、瀏覽器驗證 | PASS |
| 查看／重連取權威資料，不新增提交 | Socket handshake 全量快照；重連及回覆遺失驗證 | PASS |
| RESULTS 下一題至 WAITING，仍須老師開始 | QuestionService.next；activity-lifecycle、realtime-lifecycle | PASS |
| 匯出：驗教師 → 同步快照 → 新 Workbook 回填最低 rank → XLSX；活動不變 | guided-notes-export、export-http，四階段下載及匯出／閉題快照競爭 | PASS |

三圖的核心責任、關聯與時序未發現需要改動的差異，故沒有修改 .puml，沒有重新產生 PNG，也未把既有圖片當作本次程式驗證。若後續變更圖表，仍須使用 PlantUML CLI 重產同目錄 PNG 並重新核對。完整自動結果見 automated-validation.md；人工總驗證另列 manual-validation.md。

## 2026-11-13 課程註記同步

僅修改 component.puml 的外部規範註記：OI-001 仍待確認，OI-002 依課程 PDF 第 2 頁允許佔位符。使用既有 PlantUML jar 執行 `java -jar <TEMP>/classroomquiz-plantuml/plantuml.jar -tpng -failfast2 ./diagrams/component.puml`，退出碼 0，實際重產 component.png 並檢視圖片。Class／Sequence 未修改。組件、關聯、事件可見性及業務時序均未變，沿用既有實作核對及測試結果，不宣稱重新執行應用測試。

## Phase 9 修正後核對（2026-11-13）

T063 的 workbook-text 編碼／答案讀回檢查仍為 Guided Notes 組件內部；T064 的 Session 世代是瀏覽器本機回覆有效性檢查，不傳送後端、不新增全域版本；T065 沿用既有 Error Handling。三圖組件、後端類別關聯與開始／提交／閉題／next／快照匯出流程均不變。核對後不需修改 .puml／PNG，本次未重新產圖。驗證及必要人工覆核見 convergence.md。
