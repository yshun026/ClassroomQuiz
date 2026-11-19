# 獨立維護：完整退役舊Excel功能（T064前）

執行／紀錄日期2026-11-19。依使用者另行核准方案B執行，非重編Feature002原64任務；T001–T063原實際驗收保持歷史效力，63/64、T064 PENDING。沒有真Google測試或人工流程重跑。

## 階段1：可恢復基準

分支codex/google-sheets-integration；開始時staged0，tracked及untracked完整列於repo外備份manifest。300個非忽略候選檔（含所有未提交002成果、兩端package／lockfile、既有紀錄）逐檔copy及SHA256核對一致；staged／unstaged binary diff亦保存。實際備份位於使用者TEMP的ClassroomQuiz-excel-retirement獨立目錄，目錄位置只於本輪回報提供，不納入Git。metadata見excel-retirement-backup.json；未備份node_modules／dist／.git資料庫或私鑰，未讀repo外憑證。沒有git reset／clean／add／commit／push。

修改前Get-NetTCPConnection及IPv4／IPv6本機連線檢查3000／3100無後端listener，沒有可見本機執行中worker；結合既有已結束驗收與無pending回報，不重啟或取消任何服務。這不被擴大為Google全域取消證明。本輪唯一啟動的後端smoke以隨機本機埠、隨機合成管理密碼及無credential配置，只查health。

回復方式：停止本輪自己啟動的隔離測試程序；按外部manifest只恢復本次改／刪檔原始位元組及lockfile（含原untracked檔案），核對hash，再依原lockfile npm ci。新維護輸出先另存，不以Git HEAD還原尚未提交成果，不用reset --hard／clean／整個workspace刪除。備份不是Git交付檔。

## 階段2：後端退役

移除GuidedNotesService舊validateAndImport／renderExport／exportClosedWinnerSnapshot及restorePrintDefaults和Excel imports；刪GuidedNotesDocument、workbook-fidelity／text、export helper與兩份舊Excel unit檔。placeholder-location只刪舊constructor，fromGrid逐字未變。errors只清multer與純Excel錯誤碼，保留AppError／JSON安全envelope／EXCEL_FLOW_RETIRED及共用標記錯誤。

### 斷言遷移而非放寬

| 原範圍 | 現行證據 |
| --- | --- |
| 動態跨表／merge主格／完整連續marker、非法／缺號／公式／格式拒絕 | sheets-source-parser.test.js原案例保留，新增前空白／破括號、跨所有分頁移除Q2/Q3的單題case |
| 最快閉題有效答案、快照雙序、深不可變、無人未閉排除 | writeback-snapshot.test.js未改，writeback-http／recovery既有斷言未減 |
| escape-looking字串、CRLF、控制字元／Unicode／空白、非目標完整保真 | writeback-http.test.js新增Sheets精確userEnteredValue及原source深比；E2E convergence／full-activity當前Sheets實作 |
| 無法表示surrogate／容量過大不寫 | writeback-recovery.test.js原零寫斷言保留，不修改產品政策 |
| 舊HTTP 401／403／teacher410、四phase、不發cloud、不出binary／私人轉換錯誤、不改活動 | export-http.test.js改Sheets fixture，明確使用會拋錯的legacy sentinel證明路由永不呼叫；GUIDE前端退役E2E保留 |
| 舊multipart不得恢復正式匯入 | foundation.test.js／preparation-http.test.js原400 INVALID_INPUT與零讀／狀態不變斷言保留 |
| OOXML zip part／ST_Xstring編碼細節 | 隨不再支援的Excel功能退役，不冒稱仍測此檔案格式；靜態歷史資料及原PASS不刪改 |

首次階段2測試因新單題case只清第一sheet、他sheet仍Q3而QUESTION_GAP失敗，立即停止後續清理，修為遍歷全部sheet後137/137通過；失敗log與修正後log分存。parser正確拒絕，沒有改parser。完整文字新增遷移case後最終138/138，fail0 skip0。174→138的數量差為淘汰Excel專用cases及新Sheets案例的淨差，不宣稱原同一套174都被執行或直接把刪案例當安全PASS。

## 階段3：前端

刪download.js，realtime.test.js把舊下載的晚到錯誤／網路失敗驗證遷移到現行api('/activity')，保留STALE_RESPONSE與replacement Session不被清除／ABA等斷言，不更動正式UI或client。首次測試失敗為既有frontend/node_modules不完整（socket.io-client缺檔），暫停後依鎖定版本npm ci修復，前端15/15與build通過。首次失敗log保留。

## 階段4：E2E／fixtures／套件

full-activity.spec.js移除ExcelJS／renderer／輸出檔片段，保留錯密碼、claim、三組、late join、closed-before-submit、資訊隔離、HTML純文字、無人題、COMPLETED及重啟Session失效；改加Sheets原始結構深比、完整winner值、重複略過及fake僅一寫驗證。lifecycle-fixture移除僅舊multipart route.continue分支，Socket／斷線／lost reply邏輯不變。convergence及retired-endpoint E2E不改。

刪無引用legacy-download-fixture與Excel fixture generator。16份必要靜態XLSX及README保留為001歷史輸入；README不再教執行已刪generator。001規格／圖／驗收產物及既有002歷史XLSX保留。E2E自行寫出的兩份US2 timings曾更新，已先另存excel-retirement-lifecycle-timings.json／single-question-timings.json，再從精確備份恢復原兩檔，byte-for-byte相同，沒有覆寫原測試結果。

套件以npm正常維護：uninstall exceljs fast-xml-parser multer；移除ExcelJS uuid override；install --save-dev --save-exact jszip@3.10.2；最後npm install --package-lock-only --ignore-scripts同步。package／lockfile已無三個已退役套件，npm ls無uuid分支（此查詢exit1表示無此依賴，不是回歸失敗）。JSZip僅devDependency供scan-candidates.mjs解壓靜態歷史ZIP資料，產品無JSZip import。前端套件版本與lockfile未改。Playwright1.65.0已隨frontend npm ci安裝；既有方式playwright install chromium exit0，未聲稱本輪一定重新下載browser，實際21項E2E已執行證明可用。

## 階段5：完整結果

| 驗證 | 實際結果／檔案 |
| --- | --- |
| npm --prefix backend test | 138/138、fail0 skip0，excel-retirement-final-backend.txt |
| npm --prefix frontend test | 15/15、fail0 skip0，excel-retirement-final-frontend.txt |
| npm --prefix frontend run build | PASS，51modules，342ms，excel-retirement-final-build.txt |
| npm --prefix frontend run test:e2e | 21/21、1.1m，隔離3100/5273、fake Sheets，excel-retirement-final-e2e.txt |
| backend JS syntax | 32檔node --check PASS；無backend build script，不虛構build |
| module-load／isolated startup | health200／ok後關閉自己的隨機埠server，excel-retirement-smoke.txt；無Google呼叫 |
| Secret scan | 最後掃描312工作樹檔、46個不同index blob、3bundle、365archive entries、12PNG文字metadata；23項已審非秘密，未處理REVIEW_REQUIRED0，excel-retirement-secret-scan.json |

秘密掃描沿用原scan-candidates.mjs規則／JSZip，只在記憶體替換輸出檔名，不覆寫T060 security-scan.json或security-reviewed。掃描不打開疑似私鑰檔；原T064的個資／像素／任意秘密格式／未來候選範圍限制仍適用，不因掃描0就宣稱絕對安全。寫入本報告後會再做候選掃描。

12個Google／quiz／UI檔與備份完全一致；Sheets parseSheetsUrl＋parseSource的原始區段逐字一致，fromGrid逐字一致。40份001／既有驗收歷史檔hash一致。T062六圖hash一致，不需修圖／重產PNG；只是移除圖中本來就不屬正式流程的舊Excel輔助程式。原DA-T058-01、protected FAIL、NOT VERIFIED／NOT RUN不改。

## 精確檔案清單

刪除9檔：

- backend/src/models/guided-notes-document.js
- backend/src/services/workbook-fidelity.js
- backend/src/services/workbook-text.js
- backend/tests/helpers/export.js
- backend/tests/unit/guided-notes-import.test.js
- backend/tests/unit/guided-notes-export.test.js
- frontend/src/services/download.js
- tests/e2e/legacy-download-fixture.js
- tests/fixtures/guided-notes/generate-fixtures.js

修改（相對本輪備份）：README.md；backend/package.json／package-lock.json；backend/src/api/errors.js；backend/src/models/placeholder-location.js；backend/src/services/guided-notes-service.js；backend/tests/integration/export-http.test.js／writeback-http.test.js；backend/tests/unit/sheets-source-parser.test.js；frontend/tests/realtime.test.js；tests/e2e/full-activity.spec.js／lifecycle-fixture.js；tests/fixtures/guided-notes/README.md；specs/002-google-sheets-integration/plan.md／quickstart.md／review-record.md；tests/records/002-google-sheets-integration/final-acceptance.md／t063-traceability.json。精確基準差異另存excel-retirement-changes.json。

新增僅維護紀錄／備份metadata／分階段與最終logs／新E2E timings／Secret scan報告。實際backup不在repo，metadata不含本機備份路徑或憑證。靜態Excel原資料／歷史generator結果之引用可留在001與歷史說明，不能用來恢復現行流程。退休方法名稱只在否定測試sentinel或歷史文件出現，不是仍可執行的Excel路徑。

## 文件與追溯

README／quickstart現行狀態63/64、Sheets唯一正式流程與依賴／Playwright狀態已同步；原T061時未安裝、原174/15/21及T057–T059真API／人工歷史均保留。Plan追加獨立維護決策，不改原64任務描述／完成事實；final矩陣以目前138/15/21為離線／E2E引用並保留全部舊結果，JSON增加maintenanceUpdate及失效路徑替代關係。

T064仍未勾、63/64；本維護不新增功能、不降低Sheets寫回／驗權／排序規則、不替使用者最終接受。回復備份可用，無未解產品回歸；真API／人工新驗收NOT RUN，沒有假資料冒充真Google。尚需維護後SpecKit Analyze及最後文件檢查，通過才交回T064接受審查。

## 最終一致性檢查

正式speckit-analyze前置腳本一次成功回傳002 Feature；extensions.yml不存在，無前／後hook。分析期間唯讀；21FR／7SC／26場景／64任務追溯一致，未映射任務0、歧義0、需求重複0、憲章衝突0；CRITICAL0／HIGH0／MEDIUM0／LOW0。T064前審查的F1 README／Quickstart進度文字漂移已隨核准維護同步為63/64，未改寫當時LOW報告。28個現行文件相對連結檢查通過，git diff --check通過。原64任務檔與備份完全一致，T064仍未勾；沒有以清理重新計算歷史驗收。

可以重新提交T064最終接受審查；本維護不是T064最終接受本身。真API／人工維護後重驗未執行，不冒充已PASS。備份300檔SHA256已核對，保留於repo外，所有刪檔可恢復。

完整保留清單亦見excel-retirement-changes.json的retainedUnchangedBaseline與retainedStaticXlsx：273個基準檔未變，其中32份靜態XLSX保留。刪9／改18／保留273合計原300檔；新增維護紀錄另列。
