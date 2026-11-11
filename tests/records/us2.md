# Phase 4 / US2 — automated PASS; human acceptance PENDING

2026-11-11，Windows 本機，Node 24.17.0。T024–T029 完成，T030 人工重開驗證尚未執行。

## 實際執行結果

- 實作前：新增後端 7 項測試失敗於尚未建立的占組／學生狀態端點；瀏覽器測試因沒有學生選組介面失敗。
- npm --prefix backend test：33/33 PASS，包含 Phase 1–3 回歸。
- npm --prefix frontend test：1/1 PASS。
- npm --prefix frontend run build：PASS。
- npm --prefix frontend run test:e2e：2/2 PASS（整體 13.6 秒）；學生持久身分流程 5.4 秒，老師準備回歸也通過。
- 首次瀏覽器流程的暫存 profile 清理發生 Windows EBUSY；加入受限路徑檢查及清理重試後重跑通過。

## 覆蓋

兩個不同身分同時占同組，只有一個成功；同 Token 不能再占另一組；同身分重複 claim 恢復原組。
GET /session 與 GET /activity 驗證 Token 及組別綁定；偽造、舊活動、錯綁定與重啟身分拒絕。
四階段晚加入以測試專用記憶體 fixture 驗證，不增加生產環境的 reset 或任意階段設定端點。
學生業務回覆及 studentViewRevision 在他組未公布提交前後保持一致，不暴露 stateRevision。
瀏覽器使用兩個獨立持久設定檔，驗證同設定檔雙頁籤、刷新、關閉再開恢復及清除身分後不接管占用組。
此 E2E 使用隔離後端及測試代理，避免改動老師準備測試的活動；不是人工測試。

## T030 人工驗證

PENDING。請先以老師建立活動，再用兩個不同瀏覽器設定檔／不同瀏覽器進入學生端。

1. 身分 A 加入第 1 組；身分 B 不能占第 1 組，但可加入第 2 組。
2. 身分 A 刷新、同設定檔另開頁籤，仍顯示第 1 組。
3. 關閉並重新開啟身分 A 的持久設定檔，再進學生端仍恢復第 1 組。

普通無痕視窗全部關閉後可能清除身分，不適合作為持久恢復測試。
本階段尚未實作搶答與 Socket 推送；「重新取得目前狀態」僅用於此階段查詢。
使用者回報人工結果後才能完成 T030／Phase 4，進入 Phase 5。
OI-001／OI-002 仍 PENDING。
