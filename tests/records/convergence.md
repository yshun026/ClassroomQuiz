# Phase 9：Convergence 修正驗證

日期：2026-11-13。範圍：T063–T065；未新增產品功能、未修改 Constitution／FR／SC，未執行 Git commit／push。修正後人工覆核及 T062 最後文件審閱已依 2026-11-14 使用者回報完成。

## T063：匯出答案字串

- 先測：新測試與原匯出測試合跑 23 項，15 PASS／8 FAIL，重現 `_x0041_`、換行、控制字元失真，以及缺少匯出答案精確檢查。屬實際功能失敗，不是缺依賴。
- 修正：workbook-text.js 使用 OOXML ST_Xstring 編碼，先保護所有原始底線，再編碼 CR 及 XML 不可直接保存的字元；普通文字、Unicode、LF、等號字串保持語意。沒有更動 ExcelJS 套件內部或增加業務字數上限。
- 新增匯出後讀回驗證，逐一比對應填格的工作表、String 型別及答案完整字串；allowedCells 仍只豁免答案值的預期變更，非答案內容／格式及封裝部件檢查不放寬。
- 額外測到相鄰 escape-like 字串 `_x005F_x0041_`，第一版只保護模式前綴仍無法保真，新增驗證已擋下而非靜默輸出；改成先編碼所有底線後通過。
- 無法可靠表示的未配對 UTF-16 surrogate 明確回 EXPORT_FAILED；保留已接受答案、原始 Buffer 與活動狀態，不回傳錯誤成功檔案。
- 匯出單元／HTTP 專項 25/25 PASS，涵蓋一般底線、巢狀／大小寫 escape-like 字串、CR／LF／CRLF、U+0000／U+0001／DEL、Unicode、空白與 tab、等號文字、無關格內容、原檔與活動不變，以及真正匯出失敗。

## T064：過期回覆與身分世代

- 先測：前端 6 項中 3 PASS／3 FAIL，證明舊 preparation 可覆蓋 ANSWERING、舊 401 可刪除新 Token、Token A→B→A 的舊成功回覆沒有被拒絕。新瀏覽器四項先跑 1 PASS／3 FAIL；新活動重設本來可用，但同活動換身分及過期 preparation 失敗。
- session.js 在本機為 Token／storage 變更維護世代；API 在送出及處理結果時核對原始世代，過期成功／錯誤回覆皆丟棄。世代不傳送後端，不是全域活動版本或提交計數。
- TeacherPage／StudentPage 將 HTTP 連續查詢綁同一 Session context，明確以新身分重設 view 基準；同活動版本不倒退，舊 preparation 不覆蓋已啟動活動。storage 變更清除舊畫面、舊輸入與忙碌基準，重新取得新身分授權狀態。
- Socket 回呼及下載也檢查世代；過期連線、下載錯誤不能影響替代 Session。失效身分由目前有效世代的 UI handler 清除，避免舊請求誤刪新 Token。
- 初次修正前端 6/6、瀏覽器新專項 4/4 PASS；後續加上舊下載／網路失敗保護測試，前端 7/7 PASS。既有至少老師加三組的同步／資訊隔離回歸另見總驗證。

## T065：輸入解析錯誤

- 先測：foundation 7 項中 5 PASS／2 FAIL，重現 malformed JSON 回 500，以及 Multer 不合法檔案欄位回 500。
- 對已識別的 JSON SyntaxError／entity.parse.failed 映射 400 INVALID_INPUT；MulterError 映射 422 FILE_UNREADABLE。未知伺服器錯誤維持 500 INTERNAL_ERROR，不採信任意 error.status 直接輸出。
- 不回傳解析器原始 body、stack、密碼或 Token；每次 requestId 使用亂數。驗證合法 JSON 的錯誤答案型別仍為 400，失敗不增加提交、不改順位或活動。
- foundation 專項 7/7 PASS。

## 完整回歸

本輪所有自動回歸已執行；人工覆核已於 2026-11-14 依使用者明確回報記錄通過。

- 後端完整：73/73 PASS（包含新增單題 fixture 匯入回歸）。
- 前端完整：7/7 PASS。
- production build：PASS（51 modules）。
- 瀏覽器第一輪：13 PASS／1 FAIL（54.5 秒）。新匯出案例尚未開始 UI 操作即被 single-question.xlsx 的保真檢查擋下；原 fixture 刪除 Q2／Q3 後保留 dimension A1:F7，序列化後縮為 A1:B3，造成來源與往返不同。
- 修正 fixture／generator 為直接建立 A1、B3 的單題檔，另加匯入回歸；沒有放寬工作簿保真檢查。完整瀏覽器重跑 14/14 PASS（45.6 秒），包括原有五故事、至少老師加三組的同步／側通道，以及新增 4 項延遲回覆／身分測試與特殊答案下載。
- 測試只用隔離 3100／5273 及獨立記憶體，沒有停止或重設使用者 3000／5173 活動。舊 us3／us4／us5／final 留存檔於回歸前備份、之後還原，不覆蓋先前人工驗收依據。

## Diagram First 核對

Component：修改仍在 Guided Notes、Browser／Session 與既有錯誤中介層內，沒有新增系統組件。Class：後端 Activity／Question／Group／Submission／Session／Document 關聯不變；新世代僅是前端請求有效性，不是後端 Session 新業務欄位。Sequence：HTTP 命令、排序、閉題、next 及匯出快照不變；本次補強文字保真、授權快照不倒退及錯誤分支，仍符合既有時序。

因此本次沒有修改 .puml／PNG，也不冒稱重新生成；延續 T056 的三圖一致性對照。若後續審查發現結構差異，仍須依 Constitution III 修改原圖並 CLI 重產。

## 修正後人工覆核（PASS，使用者回報）

1. 用 Excel 開啟 tests/records/convergence/escape-answer.xlsx，點 Notes!B3，在資料編輯列確認四行內容仍是 `_x0041_`、`_x005F_x0041_`、`=1+2`、`ordinary_under_score`，不被轉成 A／計算結果；來源列高未改，必要時展開編輯列查看完整內容。檔案由新的瀏覽器下載測試產生，不是人工已驗收的證明。
2. 用原本兩份 Demo 範本再做短程操作，確認老師開始／結束、學生刷新／重連及恢復原組正常，資訊仍依角色隔離。受控延遲回覆／換身分競爭由新增自動測試證明，不要求人手猜測網路時序。
3. 檢閱本次修正紀錄及完成版文件後再完成 T062；舊 T055／T059 的通過回報不擴張成這批新案例已人工測試。外部 OI-001 仍 PENDING，OI-002 已由課程 PDF 第 2 頁確認。

## 人工完成紀錄

2026-11-14：使用者針對 convergence.md 的修正後人工覆核（含匯出文字、刷新／重連恢復及完成版文件審閱）回報「完成人工復核了 沒問題」。據此記錄 PASS 並完成 T062；未提供新的逐項截圖、量測或檢查者姓名，不另行推定。此回報不代表助教已核准 OI-001，也不代表另一組已完成成品互測。
