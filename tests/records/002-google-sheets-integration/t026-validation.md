# T026 completion — US1 full offline regression

日期：2026-11-18。Feature specs/002-google-sheets-integration，分支codex/google-sheets-integration。使用者本輪明確授權為T026遷移剩餘8項舊Excel準備fixture；不是US2開發授權。既有失敗／policy拒絕紀錄保留，本輪命令正常執行，沒有再次遭拒或繞過保護。

## 原因與最小修改

- 先執行 node --test backend/tests/integration/group-session-http.test.js backend/tests/integration/restart-process.test.js：8 tests／0 pass／8 fail，1504.4656ms，退出碼1。
- group-session-http.test.js 7項都在共用prepared()呼叫已移除的c.activity.import時失敗；僅將helper改成注入createFakeSheetsAccess、先setGroups(3)、後loadSource標準Sheets URL，移除讀XLSX的依賴。
- restart-process.test.js 的1項先前multipart上傳得到400而非201；改成既有json helper POST spreadsheetUrl，前面的PUT groups仍先執行、201期待保留。子程序helpers/process-server.js注入同一fake，無任何真Google呼叫。
- group-session所有test內容（含四階段迴圈）、restart準備後的原assertions以t026-protected.json比對，SHA256完全一致；沒有刪除案例、skip、only或降低斷言。競爭claim、Session恢復／不可跨組占用、own-only投影、stale／forged拒絕及實際程序重啟後舊token失效均保留。

## 實際結果

| 命令／範圍 | 預期 | 實際 |
| --- | --- | --- |
| 上述兩個失敗測試檔重跑 | 8項原測試保留且全通過 | 8／8 PASS，0 fail／skip，3313.2835ms，退出碼0 |
| npm --prefix backend test | 全部unit＋integration通過 | 117 tests／117 pass／0 fail／0 skip／0 cancelled，13740.4344ms，退出碼0 |
| npm --prefix frontend test | 前端單元通過 | 9 tests／9 pass／0 fail／0 skip，457.1775ms，退出碼0 |
| npm --prefix frontend run build | 可建置 | PASS，Vite8.3.8、51 modules、325ms，退出碼0 |
| E2E_FRONTEND_PORT=5273／E2E_BACKEND_PORT=3100；npm --prefix frontend run test:e2e -- teacher-preparation.spec.js | US1相關瀏覽器流程 | 1／1 PASS（16.8s；案例1.7s），退出碼0；fake API，非全E2E套件 |
| t026-protected.json／git diff --check | assertions／應用與歷史無非預期變更 | 64檔應用／圖／001歷史hash及原assertion blocks一致；無空白錯誤，僅既有LF／CRLF提示 |

完整本輪輸出：t026-backend.txt、t026-frontend.txt、t026-build.txt、t026-e2e.txt。執行方式是離線fake及本機程序／HTTP／Socket；沒有讀取或建立私人Google憑證，真實Google API與人工Google驗收NOT RUN。

## 結論

T026已達US1離線驗收條件，實際勾選完成。T003／T004仍人工待辦，T027–T064皆未勾選。原8個失敗現在8個全通過，測試總數未減少。只修改三個測試／helper與002紀錄／任務狀態，應用程式未改；沒有恢復Excel正式匯入、安裝套件、commit或push。

US1已具備進入US2的離線前置條件，但仍等待使用者下一階段確認。本輪沒有執行US2／US3／US4／Final任務，未跑不相關的舊Excel匯出E2E或改寫001歷史產物。
