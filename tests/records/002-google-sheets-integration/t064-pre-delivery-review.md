# T064交付前唯讀審查與Excel清理評估

審查日期2026-11-19。狀態：**63/64，T064未勾選；FINAL_ACCEPTED=false**。本次只是交付前審查，不是使用者最終接受、助教接受、Git提交授權或Excel清理授權。

## 1. 原T064條件對照

| 原任務要求 | 證據與審查 | 判定 |
| --- | --- | --- |
| 提交review-record及最終矩陣供人工審查 | final-acceptance.md目前版本54列與t063-traceability.json；本報告 | 已備妥 |
| 實作／自動／真表／人工／圖表結果 | T057 live、DA-T058-01、T059 manual、T060 security、T061 documentation、T062 diagram、T063 trace均有實際紀錄 | 依各自範圍接受，不擴大 |
| 根據使用者回覆記最終接受或待修正 | 本輪使用者明示尚未最終接受 | 待人工決定，不勾T064 |
| 不包含commit／push／公開部署 | 本輪全無上述操作 | 符合 |

T001–T063均勾選、T064空白；21FR／7SC／26場景與64任務有追溯，54列類型／限制保留。需求覆蓋100%不表示全分支實際PASS；沒有把NOT VERIFIED／NOT RUN／FAIL轉PASS。55份001歷史／憲章／核心等保護檔hash無差異；六份002圖與T062後hash一致，沒有無關功能混入。

## 2. Git範圍與候選安全

掃描開始快照：tracked172路徑，修改tracked36，staged0；untracked126個（其後新增本次必要審查產物，數量會增加）。git status顯示的新後端Sheets／operation模組、前端client、002三圖、specs/002、fake/live／診斷測試及002紀錄均符合此Feature歷史工作。沒有git add／reset／clean／刪檔。已讀staged與unstaged diff內容於記憶體做檢查／差異盤點，不把原始可能敏感行貼到報告；staged diff空，unstaged diff涵蓋36檔。單看diff --stat不含全部untracked，因此另外檢查非忽略候選檔。

詳t064-readonly-scan.json：298個工作樹候選檔、36個不同index blob、365個XLSX entries、12個PNG文字metadata chunk、現有dist3檔掃描；未讀私人檔名／外部link target。忽略清單內亦只列檔名，未發現repo內private-looking key／env檔名，未開啟任何真實憑證。合成.gitignore測試7/7涵蓋.env、credentials、service-account JSON、pem/key、dist與test-results；.env.example刻意保留空值範例。任意名稱JSON不自動受保護，絕不能依賴.gitignore代替repo外金鑰政策。

原始命中24項已逐項審閱：9個隔離測試config/login literal、2個合成字串、11個符合既有精確blob審閱的非秘密、1個合成SA身分fixture、1個故意損壞XLSX fixture。原allowlist在本輪不吻合者重新看呼叫上下文，沒有因在tests目錄就整體豁免，審閱理由與當前hash保存新報告。**未處理REVIEW_REQUIRED=0；未確認到真實私鑰、Token、管理密碼、真實SA身分或具體長Sheets URL。**不輸出原值。

安全限制：這不是對任意未來檔案、Git遠端歷史、PNG畫面像素個資或所有可能密碼格式的完整證明。現有dist只掃當前3檔，不是新build；32份XLSX的XML未見明確姓名／學號／成績欄位指標，不代表已證明全部內容非個資；fixture generator與歷史來源另核對。舊001文件中開發者本機路徑／示範檔名保留原歷史，不改寫；這類資訊是公開範圍選擇，不是私鑰。具體本機位置與所有使用者資料若要另做隱私刪改，須人工界定且不違反001保留限制。

## 3. 文件、圖與測試完整性

README／Quickstart安裝／啟動／Sheets／SA／Editor／repo外Trim輸入、四身分、六題Demo、錯誤分流皆已T061靜態核對；本輪26個相對連結無缺檔。三PUML／PNG存在，T062最終hash全部吻合，沒有再渲染／重跑T062。原T061的8組假路徑與PowerShell語法結果保留，不當成真人金鑰驗證。

| 類型 | 最後已保存結果 | 執行時間界線 |
| --- | --- | --- |
| backend完整離線 | 174/174，fail0 skip0；negative-diagnostic-backend.txt | 既有紀錄日期2026-11-18；log無絕對執行時分，最後實際時間未確認，本輪未跑 |
| frontend | 15/15，fail0 skip0；negative-diagnostic-frontend.txt | 同上，不以檔案mtime作執行時間 |
| E2E fake | 21/21，1.1m；negative-diagnostic-e2e.txt | 既有紀錄日期2026-11-18，精確實際時分未確認，本輪未跑 |
| Vite build | 51modules PASS；negative-diagnostic-build.txt | 既有紀錄日期2026-11-18，精確時分未確認，本輪未build |
| 真API T057 | 使用者回報A/B各6題、2批，pass1/fail0/exit0 | 使用者明確實際日期2026-11-18 |
| T058人工／read-denied | 已保存三項manual及read-denied live PASS | 使用者提供實際日期2026-11-18；原protected失敗日期未提供 |
| T059人工 | 兩表四階段、刷新真重連、順位／隔離、首次／重複寫回／保真／衝突／安全換場 | 確認日2026-11-19；實際操作日期／時分未明確提供 |
| T061／T062／T063 | 文件靜態／CLI圖渲染與視覺／追溯複核 | 複核日期2026-11-19，不冒充應用或live測試時間 |

目前frontend/node_modules/@playwright/test不存在，Playwright尚未安裝限制保留；不能宣稱在這個環境剛重跑過E2E。依README先npm ci及明確下載Chromium後才可再跑，過程不在本輪執行。現有frontend/dist是既有輸出，不保證與未來修改一致。

## 4. 已知限制與交付注意事項

- DA-T058-01是專案內部有限證據接受，不是助教接受；原protected P_EDITABILITY_MISSING／UNKNOWN FAIL保留。
- 已知DENIED準備拒絕真實PASS、保護專屬歸因、真實遠端恰一次／零重送仍NOT VERIFIED。MISSING≠false，一般403/404不證明保護拒絕。
- 真實寫入逾時／lost reply／PENDING reconcile NOT RUN。真本機斷線重連不是Google寫入結果未知測試。UNKNOWN原marker屏障不能盲重送，可能永久pending。
- 原人工未明確空白／精確2秒／晚加入／多頁籤／rich text／像素尺寸等NOT VERIFIED；T057或離線有相應證據時按原類型引用。
- 衝突人工PASS未提供來源歸屬、格址或A/B各自測試證據；不擴大。
- A-04：前驗＋寫無Google CAS，外部協作不得改目標／結構。restart清本機不是遠端取消，安全重用先核對；不自動還原。
- 本機單活動／記憶體，舊Session重啟失效，無重設／接管／公開部署承諾。

## 5. Excel清理唯讀盤點（獨立待核准工作）

搜尋Excel／XLSX／XLS／Workbook／Spreadsheet／SheetJS／ExcelJS／匯入匯出並追引用。Google spreadsheetId／GRID／SheetsAccess是目前功能，不是舊Excel。未見SheetJS/xlsx套件；ExcelJS4.4.0仍實際存在。未發現.xls檔；32份.xlsx含fixtures、001／002歷史輸出及示範產物。不得以字詞一律刪除。

### A. 建議刪除候選（本輪不刪）

| 路徑 | 原用途／目前引用 | 風險及同步 |
| --- | --- | --- |
| tests/e2e/legacy-download-fixture.js | 封裝瀏覽器呼叫舊downloadGuidedNotes；全repo搜尋只見自身宣告，未見import／caller，正式teacher無下載按鈕 | 低風險；核准後可單獨刪並重跑前端／E2E；不因此刪download.js或ExcelJS；不需修改001 |

沒有把仍被引用的Excel檔列成可直接刪除；其餘屬B或C。cleanup仍需人工批准，掃描未刪任何檔。

### B. 建議保留

| 路徑／群組 | 原因 |
| --- | --- |
| specs/001-classroom-quiz/、diagrams/001-*、tests/records的001驗收（us5/、final/、convergence/等） | 001歷史設計／結果，不因002取代正式流程而刪改；含舊XLSX實際產物 |
| outputs/classroomquiz-valid-notes/ClassroomQuiz_valid.xlsx | 被tests/records/us1.md歷史驗收引用，屬001相容示範證據，不能當無依賴樣本直接刪 |
| backend/src/models/placeholder-location.js | fromGrid現行Sheets直接使用；舊constructor與Sheets功能混合，不能整檔刪除 |
| backend/tests/integration/export-http.test.js、tests/e2e/guided-notes-export.spec.js | 現在有teacher410／學生403／未登入401、四phase與不改活動斷言，屬正式退役契約／安全回歸，不是只看檔名的舊匯出 |
| tests/fixtures/google-sheets/、SheetsSource／SheetsAccess／source-consistency及writeback模組 | 現行Google整合與離線fixture，Spreadsheet／Sheet字眼不代表Excel |
| tests/records/002-google-sheets-integration/us2-legacy-export/、us2-full-activity/、us2-legacy-convergence/ | 已執行的歷史相容性結果，E2E也會產生；先保留既有證據，不能為精簡刪掉PASS依據 |
| README／Quickstart退役說明、002規格／Plan／三圖與T058歷史 | 保留需求變更／實作決策與限制，沒有現行XLSX正式操作教學 |

### C. 需要進一步確認／整組遷移才可移除

| 路徑／套件 | 實際用途及引用 | 移除風險／同步要求 |
| --- | --- | --- |
| backend/src/services/guided-notes-service.js 的validateAndImport／renderExport／exportClosedWinnerSnapshot／restorePrintDefaults | 現行Sheets parse/loadSource與歷史Excel方法同檔；ExcelJS／JSZip／XMLParser仍top-level import；單元測試及E2E直呼舊方法 | 不可整檔刪。獨立清理需只移歷史方法與import、重整測試，保留正式Sheets及快照安全 |
| backend/src/models/guided-notes-document.js | 上述validateAndImport回傳，Excel原buffer／workbook模型 | 隨舊方法與測試遷移後才可能刪，不能單獨移除 |
| backend/src/services/workbook-fidelity.js、workbook-text.js | 舊renderer及guided-notes-export unit驗OOXML／字串保真使用 | 現有單元／E2E依賴，需核准移除相容性實作與改寫測試，不能降低現行公平／Session斷言 |
| backend/tests/unit/guided-notes-import.test.js、guided-notes-export.test.js、backend/tests/helpers/export.js | 實際讀舊fixture及渲染／保真，仍在npm test glob內 | 刪除會改變測試數與覆蓋；應以明確淘汰範圍審查，不假裝測試數下降是回歸PASS |
| tests/fixtures/guided-notes/*.xlsx、generate-fixtures.js | 16個合成正／負例及generator，舊unit、export helper、部分E2E依賴；corrupt故意不是ZIP | 待所有引用遷移後評估可刪；先保留歷史結果，不刪001文件 |
| frontend/src/services/download.js、frontend/tests/realtime.test.js | TeacherPage不再呼叫，但realtime測Session過期回覆保護仍import舊下載helper | 須將必要的Session安全assertion遷移至現行API後才移除；不能直接刪測試 |
| tests/e2e/full-activity.spec.js、convergence-regressions.spec.js、lifecycle-fixture.js | 現行Sheets完整流程混有legacy renderer fixture及ExcelJS讀回 | 不可整檔刪；只拆已淘汰Excel段落，保留正常quiz／安全E2E |
| backend/package.json／package-lock.json的exceljs、jszip、fast-xml-parser | ExcelJS於正式載入模組仍import；JSZip／XMLParser用於OOXML與fixture，安全scanner亦曾依賴JSZip | 移套件前清引用並調整scanner；必須同步lockfile與回歸，不是本輪可直接npm uninstall |
| multer及backend/src/api/errors.js | multipart正式準備已退役，但error handler仍import／instanceof MulterError | 要獨立評估相容錯誤與測試；不能只刪套件造成啟動失敗 |
| backend/package.json exceljs→uuid override | 舊ExcelJS轉移依賴修正 | ExcelJS整組淘汰後再看override是否可刪，不刪其他仍使用的依賴 |
| outputs/classroomquiz-valid-notes/ClassroomQuiz_valid.xlsx.inspect.ndjson | 示範檔附帶的檢視／除錯產物，未見產品引用，但毗鄰001歷史相容範例 | 可人工確認是否屬必要歷史證據後另行排除／清理；不先刪或假裝無隱私風險 |

資料隱私盤點：32份XLSX讀ZIP/XML掃描未見姓名／學號／成績等明確欄位指標；fixture generator與測試答案來源為合成場景。此不保證識別所有真實姓名、成績、作者metadata或圖片內容，示範檔／歷史輸出的來源仍應由持有人確認可公開；不輸出儲存格原文。沒有查看使用者Downloads或repo外文件。既有機密掃描也涵蓋壓縮entries與PNG文字metadata。不能因0指標便宣稱完整個資稽核PASS。

建議獨立cleanup工作：先核准A的單檔範圍；若要移除整個Excel依賴，再另建有明確範圍／圖與測試影響的規劃，拆混合服務及Session／E2Eassertion，最後更新package與lockfile並完整離線回歸。不得修改001歷史，也不將清理需求偷偷加入原T064硬性條件。使用者若希望GitHub首次提交即已清乾淨，可選擇暫緩提交，待清理獨立驗證後再審。

## 6. SpecKit Analyze與分級

正式check-prerequisites一次成功指向002，21FR／7SC／26場景／64任務追溯完整；63項勾選、T064空白。分析期間唯讀，無extensions.yml前／後hook。沒有新增需求歧義／重複、未映射任務或憲章衝突。CRITICAL0／HIGH0／MEDIUM0／LOW1。

| ID | 類別／分級 | 位置 | 發現／建議 |
| --- | --- | --- | --- |
| F1 | 狀態文字漂移／LOW | README.md:3；specs/002-google-sheets-integration/quickstart.md:3 | 現行頁首仍61/64及T062未完成，tasks／矩陣已63/64。核心操作與限制一致；最終接受後另行授權同步交付狀態文字，不重寫歷史。本輪依範圍只記審查，不自行改文件 |

沒有要求為清警告修改產品或重跑真API。trace覆蓋100%不代表全部live／manual PASS。原protected FAIL與未驗證風險列在第4節。LOW不阻擋使用者審閱既有功能交付，但對外提交前應處理狀態文字；Excel清理不是已批准操作。

## 7. 最終人工接受表（僅待使用者勾選）

| 需人工決定 | 已有依據 | 使用者決定 |
| --- | --- | --- |
| 接受Google Sheets整合功能及現有驗收範圍 | T057兩表、T059兩表三組與衝突、離線／E2E、圖表／矩陣 | 待確認 |
| 接受README／Quickstart操作交付，並允許最終狀態文字同步 | T061、F1 LOW；未重新安裝／啟動驗證 | 待確認 |
| 接受DA-T058-01及全部NOT VERIFIED／NOT RUN限制 | 原protected FAIL、UNKNOWN／pending、無CAS、精確遠端請求未驗 | 待確認 |
| 認可候選公開範圍／安全審閱，以及Excel清理時機 | 本次0未處理秘密、資料來源／像素／未來變更限制；A/B/C清理清單 | 待確認，不是git add／push授權 |
| 正式接受Feature002結案 | T001–T063與本報告；尚無最終回覆 | 待確認，T064保持未勾 |

已由程式／檢查支持而不需再代填人工測試：任務與追溯數量、受保護hash、圖檔存在與T062hash、相對連結、候選掃描範圍與結果。這些不代替使用者對功能／風險／公開範圍的決定。

## 8. 建議與GitHub安全提交順序（本輪不執行）

可提交給使用者做最終人工接受；不宣稱T064完成。建議先決定Excel清理是在首次提交前獨立完成，或保留必要相容程式／歷史證據並後續清理。若接受現有範圍，依真實回覆再勾T064並同步當前狀態文字；如要求清理，先另行授權／驗證後再審，不能讓本輪報告代替清理。

之後必須另得Git操作授權：唯讀確認分支／status與候選差異→挑明確路徑而非盲目git add .→排除key/env/私資料／未批准清理→重新掃最終候選及staged diff（不只看檔名）→若有清理或功能變更則安裝核准依賴並跑相應離線／E2E／build→使用者批准精確提交內容後才commit→檢查remote與上傳範圍並另得push授權。沒有授權自動add／commit／push；不得clean/reset刪資料。不要重跑會改真表的acceptance來當提交檢查。

交付清單：README、後端／前端source及package/lockfile／空白env範例、002 specs/plan/data-model/contracts/quickstart/tasks/review/checklist、三PUML／PNG、合成fixture與自動測試、各分類驗收／偏差／安全／圖表／追溯紀錄；001歷史保留。node_modules／dist／test-results與真人key不提交；必要歷史xlsx依本報告保留，不混同正式匯入功能。

本輪僅新增本報告與t064-readonly-scan.json及必要review-record審查註記；不更動產品／測試／001／既有T060／DA決策、無API／讀私鑰／安裝／重啟／人工重跑、無Git變更命令，T064未勾，63/64。審查後新增的報告亦需納入最後候選複核；本次計數只是掃描當時快照。
