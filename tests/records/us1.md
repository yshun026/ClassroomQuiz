# Phase 3 / US1 — automated PASS; human acceptance PASS

2026-11-11，Node 24.17.0，Windows 本機。T013–T023 已完成。

## 實際執行結果

- fixture generator：PASS，四份正向及十一份負向合成工作簿。
- 實作前：18 項 US1 測試因未實作介面／端點失敗；測試檔路徑設定錯誤不算行為失敗證據。
- npm --prefix backend test：26/26 PASS，包含五項基礎測試。
- npm --prefix frontend test：1/1 PASS。
- npm --prefix frontend run build：PASS。
- npm --prefix frontend run test:e2e：1/1 PASS（整體 9 秒）；涵蓋錯誤密碼、登入、設組、壞檔拒絕、成功匯入與刷新恢復。
- Playwright 初次執行缺少 tests/package.json 的 ES module 宣告，修正後重跑通過。

## 保真檢查

ExcelJS 會注入列印預設值；載入後依來源還原原本不存在的 firstPageNumber/useFirstPageNumber/copies，
再比較 OOXML，不以忽略列印設定差異代替保留。
XML 比較只將無值、無格式、僅有預設屬性的空列視為語意相同；其他格式、非預設屬性與值仍嚴格比較。
封裝部件名稱及關係納入核對，二進位部件須相同；未知部件遺失或列高改變有拒絕回歸測試。
這是保守相容性檢查，不宣稱所有 Google Sheets 檔都受支援。OI-001／OI-002 維持 PENDING。

## T023 人工操作

PASS。使用者於本對話回報「通過 T023 人工測試」，依此記錄人工驗收通過。
人工結果由使用者提供，非 AI 自動測試冒充；未另行推定未提供的操作時間、姓名或截圖。
本項驗收範圍為本機前後端 http://localhost:5173/?role=teacher 的準備流程：
錯誤密碼拒絕、正確登入、設三組、corrupt.xlsx 拒絕、valid-a.xlsx 成功顯示 Q1 WAITING／三題、刷新仍恢復。
合成檔案在 tests/fixtures/guided-notes/。目前沒有開題按鈕，開題屬 US3。
人工測試使用的相容範例另存於 outputs/classroomquiz-valid-notes/ClassroomQuiz_valid.xlsx，
該檔先前已實際通過後端六題匯入驗證；不據此推定兩項助教外部規範已核准。
Phase 3 的自動與人工驗證均通過，可依既有任務順序進入 Phase 4。
