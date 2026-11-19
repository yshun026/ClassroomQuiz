# T061 README／Quickstart最終複核

文件更新及檢查日期：2026-11-19；不是T057–T059操作日期。

原缺口：README／Quickstart仍58/64、T058／T059未完成；歷史三題例未與六題展示區分；缺FAILED／CONFLICT／PENDING操作分流、一般展示與開發測試區隔；README和live現行指令Read-Host未處理複製路徑引號。舊Excel敘述只保留於明確標示的歷史或退役說明，現行主流程為Sheets API。

修改README、quickstart、live現行操作命令。建立六題最短展示、獨立四身分、只在安全終態換場與清記憶體說明、UNKNOWN及原操作恢復限制；原protected FAIL／DA-T058-01／NOT VERIFIED／NOT RUN不改。Cloud／SA／Editor／scope與repo外canonical路徑檢查核對config、SheetsAccess及官方文件，不建立或讀真實key。官方參考已存在quickstart：Workspace create-credentials、Sheets scopes、IAM key best practices。

## 檢查結果

- Windows實際Node24.17.0、npm11.13.0；package engines >=24 <25。backend dev/start/test/test:live、frontend dev/build/test/test:e2e逐一對package.json；依賴精確版與lockfile一致。backend localhost3000、origin5173、Vite localhost5173 strictPort及代理、role query URLs核對實作。
- 假路徑字串8/8 PASS：無引號、單引號、雙引號、外層空白、含空白與連續內部空白；只做Trim字串，不讀取或顯示真實憑證路徑／JSON。採用使用者指定`.Trim().Trim('"', "'")`，README／quickstart／live一致。
- PowerShell AST語法：README2、quickstart4、live1個區塊全部PASS，只解析不執行命令。相對連結27/27有效；啟動目標、npm scripts、lockfile CLI bin定義核對PASS。npm exec --分隔參數已明確化。
- 靜態檢查初次錯把尚未安裝的Playwright CLI檔案存在作前提、另有Python預設cp950解碼失敗；已改用UTF-8與package-lock CLI定義後重跑成功，不修改產品或安裝依賴。當前Playwright未安裝，CLI help嘗試未成功，未執行下載／build／E2E。文件要求先npm ci；不將靜態檢查當作新應用回歸PASS。
- live預設非一般測試，acceptance明確opt-in且會寫兩表；模式與gate符合liveConfiguration，live輸入命令及cleanup核對。未執行test:live、未重跑T057–T059。使用者若按說明啟動／驗收會使用既有憑證，代理本輪未讀取憑證。
- git diff --check PASS（既有其他檔案CRLF提示非文件錯誤）。T060安全檢查既有證據未重做或修改，不宣稱本輪重新掃全Git候選。

## T061原條件對照

| 條件 | 結果 |
| --- | --- |
| Windows環境／實際安裝版本／啟動與測試命令吻合 | 靜態核對PASS；未新安裝／執行應用 |
| Cloud／SA／兩表Editor／安全env | 文件與產品檢查一致；假路徑8例PASS |
| Sheets動態標記、手動最快快照、格式保真 | 文件與正式UI／服務一致，六題僅示例、不固定題數 |
| 同活動Evidence、新活動完整marker、安全重用 | 已說明，不自動還原／複製，無reset按鈕 |
| A-04無CAS、UNKNOWN永久pending及不盲重送 | 已保留並細分FAILED／CONFLICT／PENDING；reconcile不是純只讀保證 |
| 保留已驗／FAIL／NOT VERIFIED／NOT RUN及001 | 已保留，不擴大人工結果 |

## SpecKit Analyze

正式prerequisite一次確認Feature為specs/002-google-sheets-integration；無extensions.yml前／後hook。分析期間唯讀。21FR／7SC／26場景／64任務有追溯，覆蓋100%（非全部測試通過）；未映射任務0、歧義0、需求重複0、憲章衝突0。CRITICAL0／HIGH0／MEDIUM0／LOW0。操作說明維持產品安全契約與三圖設計邊界，未進行T062逐圖最終複核；未改圖或重產PNG。

分析後於skill外依授權勾選T061，61/64。T062依賴具備，但未開始；T063／064仍未完成。只改文件，無產品／測試／001／真API／私鑰操作，無commit／push。
