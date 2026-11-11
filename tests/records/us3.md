# Phase 5 / US3 單題搶答驗證

日期：2026-11-11。T031–T042 完成；T042 人工驗收依使用者於本對話回報完成，不以自動測試代填。Phase 6 未執行。

## 實際自動結果

- `npm --prefix backend test`：42/42 PASS，包含 HTTP 合約、三組同時提交、同組競爭、提交／閉題受控順序及 Socket 隔離。
- `npm --prefix frontend test`：2/2 PASS；`npm --prefix frontend run build`：PASS。
- 隔離連接埠 3100/5273 的完整 Playwright 回歸：4/4 PASS（16.5 秒）。新增量測及截圖後重跑 `test:e2e -- single-question`：2/2 PASS（10.8 秒）。
- 同機後端狀態變更到瀏覽器畫面：開始 16 ms、提交 13 ms、閉題 23 ms，均小於 2 秒。原始量測見 `us3/timings.json`；畫面見 `us3/teacher-results.png`、`us3/student-results.png`。這是本機自動量測，並非人工測試或廣域網路效能保證。
- 固定觀察組，其他組提交時：零額外業務事件；HTTP 與 state:request 的可見投影及 studentViewRevision 不變；學生資料沒有全域 stateRevision／commandSequence。教師及提交組（含同身分頁籤）才更新，閉題後才公開所有答案及順位。
- 覆蓋空白、重複、未開始／已閉題拒收、錯誤身分及舊題、無人作答、最後題 COMPLETED、禁止重開，答案以文字顯示，HTML 不執行。
- E2E 曾因清理時仍有 Socket polling 請求而失敗；清理改先 unrouteAll 再關閉 context，重跑通過。未停止或重設使用者 3000/5173 活動。

## Diagram First 核對

- component.puml：Teacher/Student Browser 對應兩個 Page；Auth 對應 AuthorizationService；Activity/Quiz 對應 QuestionService、SubmissionService；Sync 對應 SynchronizationService 與 socket-server；Store 為既有記憶體資料。
- class.puml：Activity、Question、Group、Session、Submission 關聯及題內唯一連續順位一致；有效提交才建立不可變 Submission。
- sequence.puml：HTTP 開題／提交／閉題共用同步 dispatcher，後端分配順位；提交僅推教師及提交組，閉題公布給所有已加入者；最後題 COMPLETED。圖中多題 next、完整重連及匯出留待後續 Phase。
- 本次實作沿用三圖，未改變圖示架構、實體關聯或時序，無需修改 .puml 或重新生成 PNG。
- 核對 FR-011–019、021–024、030 的本階段範圍；完整恢復及多題驗證仍依 US4 任務，不能視為已完成。

## T042 人工驗收流程與紀錄

1. 重新啟動已更新的本機前後端（後端重啟會清空活動），老師設定三組，匯入 `tests/fixtures/guided-notes/single-question.xlsx`。不同瀏覽器設定檔加入各組。
2. 老師手動開始，學生自動顯示 ANSWERING；空白無法提交。依序讓兩組提交文字，教師即時看到答案及順位；第一組提交後，第二組仍可作答。
3. 閉題前學生只看到自己的提交狀態，不能看到他組答案、順位或提交狀態；重複提交不得增加紀錄。
4. 老師結束後各端自動顯示 COMPLETED、兩筆答案及順位，第一筆有效提交組成功；不能再提交或重新開始。
5. 另以全新後端活動測試無人作答直接閉題，結果顯示「無人作答」。觀察正常連線的更新是否在 2 秒內。

使用者在收到上述驗收流程後回報「我剛剛測試完T042了」，據此記錄 T042 人工驗收完成；未提供額外截圖或逐項量測，不另行推定。多題檔案的第一題閉題停在 RESULTS 是本階段範圍；下一題操作尚未實作。

OI-001（.xlsx 中介是否符合課程回填要求）、OI-002（助教檔案是否允許預加佔位符）均仍為 PENDING。
