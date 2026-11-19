# ClassroomQuiz

目前進度：T001–T064完成，64/64；使用者已核准專案內部最終接受（USER_APPROVED_FINAL_ACCEPTANCE，2026-11-19）。T057兩份真表API測試、T059兩份六題完整人工流程已依使用者回報接受；T058依DA-T058-01專案內部有限證據決策完成，並非所有權限負面案例PASS。原protected真實FAIL（MISSING／UNKNOWN）、保護專屬拒絕與遠端恰一次NOT VERIFIED、真逾時／pending reconcile NOT RUN均保留。詳[驗收矩陣](tests/records/002-google-sheets-integration/final-acceptance.md)，此為專案內部結案，不代表助教／第三方已接受，也不授權Git提交或公開。

目前正式操作為 **Google Sheets 網址 → 後端 Sheets API 讀取 → 搶答 → 老師手動寫回原表**。老師與學生不需在系統登入 Google。保留 React／Vite、Express／Socket.IO、本機單活動與記憶體架構。

Feature 002 的US1–US4已由使用者接受。一般使用步驟如下；Google管理設定與錯誤排除見[Quickstart](specs/002-google-sheets-integration/quickstart.md)，開發者測試另列於文末。

## 本機啟動（Windows／Node.js 24）

需要Windows、Node.js >=24 <25及隨附npm；先安裝Node，再於PowerShell以`node --version`、`npm --version`確認。只有圖表複核需要Java／PlantUML，一般操作不需要。

先由管理人員依[完整 quickstart](specs/002-google-sheets-integration/quickstart.md)啟用 Google Sheets API、建立專用 Service Account；將每份專用 Sheets 分享給該身分 Editor。私鑰放 repository 外並限制檔案 ACL，不授予 Cloud Owner／Editor 或網域委派來代替文件分享。

在專案根目錄：
```powershell
npm --prefix backend ci
npm --prefix frontend ci
$env:ADMIN_PASSWORD = Read-Host '設定本機老師管理密碼'
$env:GOOGLE_APPLICATION_CREDENTIALS = (Read-Host '請貼上 repository 外的 Service Account JSON 絕對路徑').Trim().Trim('"', "'")
npm --prefix backend run dev
```

可直接貼上Windows「複製為路徑」的結果，不需要手動刪除引號；含空白路徑可直接使用。這只整理輸入字串，不驗證或讀取私鑰；路徑仍須為repo外絕對路徑，後端於Google操作時驗證。

另一個終端執行 `npm --prefix frontend run dev`，開啟[老師端](http://localhost:5173/?role=teacher)；學生用不同瀏覽器設定檔開啟[學生端](http://localhost:5173/?role=student)。同設定檔頁籤共用身分，無重設／踢除／接管功能。後端不會自動載入 .env，環境變數只設後端；不得用 VITE_ 變數放憑證、Token 或管理密碼。

目前鎖定 google-auth-library 11.3.4、Express 5.3.0、Socket.IO 4.8.4、React 19.3.1、Vite 8.3.8；Node >=24 <25。後端啟動不會因缺 Google key 阻止健康檢查，但 Google 操作會回安全認證錯誤。

## 操作與安全界線

1. 老師先設定有效組數，再貼不同 Google Sheets 的標準編輯網址。
2. 全部支援 GRID（含 hidden）掃描整格純文字 `{{Q1}}`至`{{Q6}}`（六題展示範本）；一般來源可為Q1至QN唯一連續題號，題數不寫死；合併只取主格，拒絕公式、混字、缺號／重號及答案格局部文字格式。不同活動可用不同來源；不寫死 ID、表名或座標。
3. 已知答案格不能編輯會拒絕準備；僅可讀而無法確認寫權時，顯示「寫入權限尚未確認」，不等於保證可寫。
4. 手動開始／閉題／下一題；第一筆有效答案取得最小順位，每組每題一筆，閉題後拒答。學生閉題前只看自己資訊，下一題僅到 WAITING，最後題閉題為 COMPLETED。
5. 老師手動「寫回 Google Sheets」只取當次不可變閉題快照的最快有效答案。未閉題／無人不寫；完整前驗、精確單批只改字串值，讀回吻合才成功。提交、閉題及重連不自動寫回。
6. 同活動再寫依 Evidence 略過已核對答案，外部改值／公式／結構／格式衝突停止未送更新。沒有強制覆寫、自動還原或自動複製。
7. 結果不明保留原操作，老師可「核對原寫回操作」；舊請求未知且殘留原標記時只讀、可能永久 pending。local settle／200秒等待不是 Google 取消證明，不用重啟企圖取消。
8. 活動期間協作者不要編輯答案格與結構（A-04）；前驗＋寫入沒有遠端 CAS 鎖。Google 等待不加入本機搶答裁定。
9. 重啟清活動與 Session，不撤銷雲端答案或可能晚到請求。確認舊寫結果安全後，重用須手動還原完整標記或複製乾淨範本並重新分享，再建立新活動。

正式 UI 不再上傳／下載 Excel；舊 export teacher 端點回410（未登入／學生先驗權）。舊ExcelJS匯入／匯出、OOXML helpers及下載helper已在T064前的獨立維護工作退役；必要靜態XLSX與001歷史驗收保留，不能當現行輸入。JSZip僅為開發安全掃描的ZIP工具，不是產品Excel功能。

## Windows最短展示流程（一般使用者）

先備乾淨六題專用副本，保留原範本與格式基準。老師及三組用四個獨立瀏覽器設定檔，不能以同設定檔新視窗或多個共用無痕視窗代替隔離。

1. 老師登入，填3按「設定組數」，貼網址按「讀取 Guided Notes」，核對六題、工作表數與權限警告；三組各加入1／2／3。
2. Q1按「開始搶答」，依序讓第2／1／3組提交，老師應見順位1／2／3；學生公布前只見自己。按「結束搶答」公布，再按「下一題」只到WAITING。
3. Q2開始後無人作答即閉題；Q3用等號開頭、中文／Unicode及換行的合成答案，其他組可交不同答案。其餘題逐題開始／閉題，Q6閉題進COMPLETED；不需要額外結束活動按鈕。
4. 在四個階段分別刷新或實際斷線重連，驗原身分／階段與已接受答案恢復。只用已提交答案驗保留；未提交的輸入框文字不保證刷新保存。斷線時不能提交，恢復後不自動補送。
5. 老師明確按「寫回 Google Sheets」，等「已讀回核對完成」再肉眼比對最快完整答案、Q2標記及非答案／公式／格式／合併。再按一次應略過已同步格，不代表已證明Google零請求。
6. 換第二份不同ID／映射的乾淨表前，先確認無running、pending或未解舊寫風險，於原後端終端Ctrl+C後再執行`npm --prefix backend run dev`。沒有不重啟建立新活動的UI；重登入／選組後重做。不要動T057已驗收的證據表。

這是可重現的展示腳本，不表示過去每一細項都已真實人工驗證。已驗與NOT VERIFIED以驗收紀錄為準。

## 寫回狀態與恢復

| 老師端／內部狀態 | 安全處理 |
| --- | --- |
| 寫回未完成／FAILED | 可能在讀取前驗、認證或寫入遭拒階段失敗，不歸因特定Google原因。先重新整理頁面確認最新狀態；若查詢失敗則按「重新查詢」。確認running=false、canReconcile=false及無其他未解操作後，修權再明確發起新寫回；保留同一活動 |
| 來源衝突／CONFLICT | 停止尚未送更新，不強制覆蓋外部值。先查是否帶未解操作；canReconcile=true時只處理原操作，不能直接新寫。不要把已成功答案擅自還原成marker |
| 結果待核對／PENDING_VERIFICATION | 保留後端程序、原operation／Snapshot／Evidence，不重送、不重啟。canReconcile=true才可手動「核對原寫回操作」；這會讀Google，安全條件成立時也可能續寫，不是純本機查詢，也不保證能恢復 |
| 正在處理／running=true | 等原操作，不並行點寫回，不重啟企圖取消 |

「重新查詢」（僅在狀態查詢失敗時顯示）及自動狀態輪詢只讀本機記憶體，不呼叫Google或reconcile；必要時在瀏覽器Network的本機GET只看status／running／canReconcile，不分享完整回應／Token。Google錯誤不等於老師Session失效。一般錯誤無法區分不存在與無權，UNKNOWN不當DENIED；頁面標記未變不證明舊寫已取消。權限、標記、埠占用等錯誤處置見[Quickstart第10節](specs/002-google-sheets-integration/quickstart.md#10-常見錯誤排除)。

## 開發者：離線測試

```powershell
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
$env:E2E_FRONTEND_PORT = '5273'
$env:E2E_BACKEND_PORT = '3100'
npm --prefix frontend run test:e2e
```

測試使用 fake Sheets Access／合成資料。E2E 使用獨立3100／5273服務，不停止使用者3000／5173活動；若該測試埠已占用，先確認使用者安排，不殺掉既有服務。首次環境若缺Chromium，可由管理人員執行 `npm --prefix frontend exec -- playwright install chromium`。

## 開發者：真實 API 與人工驗收

`npm --prefix backend run test:live` 預設 **NOT RUN**。明確啟用acceptance模式後會真的寫兩份專用來源；protected／read-denied模式僅讀（詳live.md），必須由使用者依[實測步驟](tests/records/002-google-sheets-integration/live.md)自行設定外置key、不同A/B、完整標記及明確專用表確認。不可用唯一正式課程原表；不自動還原，也不要在 pending 後直接重跑。

測試分為離線fake、真Google API、人工三類，不能互相替代。[自動測試](tests/records/002-google-sheets-integration/automated.md)、[真表紀錄](tests/records/002-google-sheets-integration/live.md)、[人工驗收表](tests/records/002-google-sheets-integration/manual.md)、[安全檢查](tests/records/002-google-sheets-integration/security.md)、[三圖對照](tests/records/002-google-sheets-integration/diagram-consistency.md)均保存實際結果及未執行項目。不要提交真實ID／key／Token／學生答案。

## 規格與歷史

[002規格](specs/002-google-sheets-integration/spec.md)、[審查與授權紀錄](specs/002-google-sheets-integration/review-record.md)、[任務](specs/002-google-sheets-integration/tasks.md)、[憲章](.specify/memory/constitution.md)、[三份PlantUML](diagrams/)。

001 的2026-11-14完成與人工接受仍有效於當時Excel版本；原規格、圖與[驗收紀錄](tests/records/final-acceptance.md)不改寫，舊73／7／14數字不代表002結果。Google流程需求變更與OpenSpec組確認依使用者回報記錄於002審查紀錄，不宣稱雙方成品已互測或課程繳交已完成。

## 舊Excel完整退役維護

正式及可執行測試路徑已移除ExcelJS／OOXML轉換，原退役export API的401／403／410與multipart拒絕仍受回歸保護。JSZip3.10.2僅devDependency供歷史壓縮檔安全掃描；fast-xml-parser／multer與ExcelJS專屬override已移除。歷史fixtures與XLSX驗收產物保留，不能恢復舊上傳／下載流程。

本輪維護實際驗證：backend138/138、frontend15/15、E2E21/21、Vite build、後端語法與隔離健康檢查通過；Playwright及Chromium已可執行。這是新的離線／fake回歸，不重跑或擴大T057–T059真實結果，原174/15/21歷史紀錄不改寫。詳[獨立清理紀錄](tests/records/002-google-sheets-integration/excel-retirement.md)。T064仍待人工接受。
