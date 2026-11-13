# Phase 7 / US5 Guided Notes 保真匯出

日期：2026-11-11。T049–T054 完成自動驗證；T055 人工 Excel 檢視已由使用者於本對話回報「通過T055」，據此勾選完成。Phase 8 接續執行。

## 實作與設計對照

- T049／T050：先建立 HTTP 及 Workbook 測試；在尚未實作時確認路由回 404、快照方法不存在而失敗。修正測試中既有 submission 方法名稱後，再實作並重跑。
- T051：exportClosedWinnerSnapshot 走共用同步 dispatcher，逐次驗教師與 activityId；複製原檔 Buffer、已閉題最低 receiveRank 的答案字串及對應位置，不把可變 Submission Map 帶進非同步處理。原始文件的 getter 回傳防禦性 Buffer 副本，防止修改來源。
- T052：快照後才建立新 ExcelJS Workbook，僅動態設定應填位置的字串值。未閉題／無人作答保留標記；以 `=` 起始的答案仍是 String。匯出前後以 OOXML 比較確認部件、關係、公式、樣式、合併、尺寸、圖片及其他非答案內容不變，不以「檔案可開啟」代替保真。
- 匯出允許格的值變更會導致 sharedStrings 索引重新配置，因此保真檢查在匯出模式解析各非答案格的 shared-string 實際內容及富文字格式後比較，僅豁免填入格的值和型別；樣式仍比較。初始匯入檢查仍沿用嚴格模式；未知部件或無關內容改動仍拒絕，不降低 FR-027。
- T053：GET /activity/guided-notes/export 驗證教師 Token 及活動識別；回傳 XLSX attachment。轉換及回覆失敗不改活動／原始檔，錯誤使用 EXPORT_FAILED，不洩漏答案、Token 或 stack。沿用固定 origin 中介層。
- T054：老師在所有已準備階段可下載；不觸發 start／close／next，不依賴 Socket 連線是否完成。學生無匯出按鈕且後端拒絕學生權限；前端顯示匯出錯誤及處理失效 Token。

三圖核對：Component 的 Guided Notes Import / Export 對應 GuidedNotesService 與 guided-notes-routes；Class 的 GuidedNotesDocument／PlaceholderLocation、closed Submission 最小順位關聯不變；Sequence 的同步快照 → 非同步 Workbook 副本回填 → XLSX 回傳，活動保持不變，與程式一致。沒有改變圖示架構或時序，不需修改 .puml／PNG；本次未冒稱重產圖片。

## 實際自動驗證

```powershell
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
$env:E2E_FRONTEND_PORT='5273'
$env:E2E_BACKEND_PORT='3100'
npm --prefix frontend run test:e2e
```

- 後端 53/53 PASS（新增匯出 9 項）；前端 3/3 PASS；production build PASS。
- 匯出專項瀏覽器 1/1 PASS（12.2 秒）；完整瀏覽器回歸 8/8 PASS（31.9 秒）。使用隔離服務，未重設使用者活動。
- 四階段反覆下載均不改 teacher view、revision、答案或原始 Buffer。學生／未登入／舊活動／無活動拒絕；模擬轉換失敗及回覆失敗後資料仍一致。
- 四種原始 fixture（valid-a、valid-b、fidelity、merged）均以動態位置回填最低順位答案；跨工作表、合併 master、無人／未完成、公式樣式文字及原始 Buffer 不變均通過。
- 受控 export-before-close 保留未結束標記，即使 render 前已閉題也不寫入；close-before-export 正確寫入，沒有混用快照。
- 保真檢查拒絕非填入位置的題目文字變更；原有未知 OOXML 部件、格式損失檢查回歸仍通過。可證明範圍為已驗證 fixtures，尚未以人工檢視宣稱任意課程檔受支援。

## 自動驗證留存檔案（合成測試資料）

- 原始保真工作簿：`tests/fixtures/guided-notes/fidelity.xlsx`。
- `us5/waiting.xlsx`、`us5/answering.xlsx`：三個標記保留，即使搶答中已有答案也不提前寫入。
- `us5/results.xlsx`、`us5/completed.xlsx`：Q1 為文字 `=1+2`，Q2／Q3 無人作答仍保留標記；其餘文字、公式、格式、合併、尺寸、圖片保留。
- `us5/multi-sheet.xlsx`：以 valid-b 為原檔，Q1 動態填入 Notes!J20，另一表的 Q2／Q3 保留，格址只用於本證據描述，應用程式沒有寫死。
- `us5/workbook-features.json`：逐表記錄代表性文字、公式、字型、框線、行列尺寸、merge、圖片數與答案格，供審查。OOXML 全部非答案內容比對由自動測試執行。

## T055 人工驗收流程與完成紀錄

1. 本次實際使用原始 ClassroomQuiz_valid.xlsx 與 ClassroomQuiz_multi_valid.xlsx（均位於使用者 Downloads）；在 Excel 將各自原檔與該次匯出結果比較。
2. 核對題目、非答案內容及原檔已有的格式／公式／合併／行列尺寸／圖片等特徵；未存在的特徵不列為人工已驗證。
3. 在 WAITING／ANSWERING／RESULTS／COMPLETED 匯出，確認只有已結束題的最快有效答案回填，無人或未閉題保留佔位符，下載不改活動／順位。
4. 第二份範本須在後端重啟後另建活動匯入，依檔案的實際題數操作至最後一題，不能預設第三題即結束。
5. 上方 fidelity／valid-b 與 waiting／answering／results／completed 範例是自動測試留存資料；`=1+2`、特定公式格址與圖片覆蓋由自動測試證明，除非使用者另有回報，不代填成本次人工步驟。

使用者已回報 T055 通過，Phase 7 完成；本紀錄不另行推定人工逐項量測、截圖或檢查者姓名。FR-026–028／SC-005 自動及對應人工驗收完成。當時 OI-001／OI-002 皆為 PENDING；2026-11-13 已由課程 PDF 第 2 頁確認 OI-002 允許佔位符，OI-001 仍未確認，不能以本機測試推定 .xlsx 中介已獲准。

## 2026-11-13 人工測試輸入更正

使用者補充實際人工測試使用 `C:\Users\user\Downloads\ClassroomQuiz_valid.xlsx` 與 `C:\Users\user\Downloads\ClassroomQuiz_multi_valid.xlsx`。上述 fidelity／valid-b 及匯出範例為自動證據與原建議清單，不代表使用者實際使用這些 fixtures。人工保真通過依使用者回報及實際來源檔已有特徵記錄，不額外推定圖片／公式等人工覆蓋；自動測試的特徵覆蓋維持原紀錄。

## Phase 9 匯出文字修正（2026-11-13）

T063 補上 OOXML 字串編碼及匯出後逐格實際答案比對，修正 escape-like 字串、換行及控制字元失真；非答案保真檢查保持嚴格，無法可靠表示的未配對 surrogate 明確匯出失敗。專項 25/25 及完整回歸通過，詳 convergence.md。新產生的 convergence/escape-answer.xlsx 供人工檢查；先前 T055 回報不視為新字串案例已人工通過。
