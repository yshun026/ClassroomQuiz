# T060 候選提交安全檢查

日期2026-11-18。結果：**本次候選範圍PASS，未發現真實私鑰／Access Token／管理密碼或未處理秘密命中**。不是任意未來檔案或GitHub最終接受的保證；T057–T059新增證據後、實際提交前必須重掃。代理未打開私人credential檔案、未讀取使用者機敏環境值、不刪key或更改Cloud。

## 可重現方法

`node tests/records/002-google-sheets-integration/scan-candidates.mjs`，不連網。精確數量／分類見security-scan.json；scoped candidate取git ls-files --cached --others --exclude-standard（tracked＋未忽略untracked）。不打開疑似private key／.env候選檔：若有即列REVIEW_REQUIRED_NOT_OPENED，本輪沒有此項。

- 掃全部候選工作樹、與HEAD不同的index blob（其餘index等同掃過的工作樹）、本次frontend/dist bundle；不改index。掃PEM私鑰、常見Google Access／API／OAuth、GitHub Token、JSON private_key及硬編碼password模式，只輸出檔名／行號／分類，不記命中原文。
- XLSX除raw bytes外解壓全部entry掃描；PNG raw及tEXt／zTXt／iTXt含壓縮文字掃描。6張既有測試截圖本輪另開啟檢視：均為合成活動畫面，未見key／Token／登入密碼；舊Excel按鈕截圖保持001歷史，不當002現況。002三份圖也開啟核對，001圖由既有原始puml／metadata及保護hash確認。
- 輸出security-scan.json為遮蔽報告；security-reviewed.json記精確Git blob與人工分析原因，避免用整個tests路徑籠統忽略。改變已審fixture的blob即需再審，不能沿用allowlist。沒有真實秘密的原文或credential路徑存入紀錄。

## 命中處理

初次寬鬆password偵測命中隔離測試的固定測試字串（unit／HTTP fixture／browser隔離server，包含INDEX舊版）；它們以本地createApp／loadConfig建測試身分或負面登入，不讀取或硬編碼實際執行環境管理密碼。逐檔檢查來源及assertions後按精確blob標reviewed-synthetic-test-literal；其他簡單錯誤登入值標synthetic-test-literal，未輸出值。

另有tests/fixtures/guided-notes/corrupt.xlsx故意不是ZIP，generator明確建立損壞範例且guided-notes-import測試預期FILE_UNREADABLE。raw bytes已掃，按精確blob標reviewed-invalid-fixture，不把無法解壓當作默默略過。總23個非秘密命中（22個合成測試literal＋1個損壞fixture），未處理REVIEW_REQUIRED=0。沒有真正憑證命中，也沒有需要刪key或撤銷Cloud設定的操作。

## 程式邊界複核

| 邊界 | 實際檢查／證據 | 結果 |
| --- | --- | --- |
| config.js | key懶載入、絕對及canonical repo外、service_account、固定token_uri／universe、無ADC／delegation；loadConfig不吃VITE key | google-config unit PASS；未讀真人key |
| sheets-access.js | GoogleAuth只取spreadsheets scope Token；固定Sheets host／redirect:error；讀重試有界，寫不auth replay、每attempt一次；error只安全code/message | Access契約PASS |
| auth／角色／來源 | URL僅取合法ID、不fetch任意網址；teacher／activity逐次驗證，writeback/reconcile不接收任意目標／答案 | H-P／H-W／R-H及Socket角色隔離PASS |
| frontend client／bundle | API本機Session世代、operation epoch／revision／discovery；Google401視圖不清老師Session；bundle無backend key路徑變數／private_key／Google Token | frontend15、E2E recovery、bundle掃描PASS |
| env／ignore | .env*／credentials／key忽略且真key必repo外；.env.example只有空變數與說明，無實際值；package未新增前端Google依賴 | 靜態PASS；沒有搜尋ignored私檔 |
| 錯誤／測試／紀錄 | 不輸出Google原始body／headers／stack／key path；live例外丟棄raw assertion details與IDs；live gate預設停用 | U-A遮蔽測試／live gate單元PASS |
| 正式Excel流程 | preparation只JSON URL，UI無file／download，teacher舊export410；legacy helper呼叫僅歷史測試，frontend download不在正式頁面import | 全回歸及靜態rg PASS；保留ExcelJS符合Plan |

本輪僅加test:live script，沒有安裝依賴或改lockfile；現有google-auth-library11.3.4屬Foundation。未宣稱外部漏洞資料庫掃描或實際Google權限審計已完成。

## 提交前狀態

001／原驗收／核心／三圖保護61/61雜湊一致，憲章未修改，git diff --check通過。候選掃描通過不等於Final完成；仍需T003／004／057／058／059／064的實際確認，新增記錄後重新掃描。沒有commit／push／force-add ignored檔案。
