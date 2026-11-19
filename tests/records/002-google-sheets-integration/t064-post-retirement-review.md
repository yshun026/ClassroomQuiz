# T064 Excel完整退役後交付前複審

審查日期：2026-11-19。僅本機文件／程式／Git唯讀核對及使用者另授權的outputs衍生產物清理。未重跑應用測試、build、E2E、live或人工驗收；本輪掃描／雜湊／文件一致性檢查有實際執行。分支codex/google-sheets-integration；63/64，T064保持未勾、FINAL_ACCEPTED=false。不是助教接受或Git提交授權。

## 原始T064條件對照

| 原要求 | 依據 | 結論 |
| --- | --- | --- |
| 依T063完成後提交實作／自動／真表／人工／圖表結果 | final-acceptance.md、t063-traceability.json、review-record.md及本報告 | PASS：21FR／7SC／26場景54列均有任務與證據；64任務有映射 |
| 根據真實回覆記錄最終接受或待修正 | 使用者本輪只授權交付前複審，未最終接受 | 待人工確認，T064不得勾選 |
| 不含commit／push／公開部署 | staged0；未執行Git寫入或部署 | PASS |

## 本輪工作樹與安全

詳細檔案清單與差異大小見[t064-post-retirement-worktree.json](t064-post-retirement-worktree.json)。檢查時172個tracked路徑、38項tracked修改、9項tracked刪除、150項untracked，staged0；untracked使用git ls-files逐檔統計，與git status摺疊目錄列數不同。其後新增本審查紀錄會增加untracked，非精確最終提交清單。staged diff空白；unstaged diff與候選清單已讀取檢查；git diff --check及cached --check通過，只有既有LF→CRLF提示。未stage／commit／push／reset／clean。

新掃描[t064-post-retirement-secret-scan.json](t064-post-retirement-secret-scan.json)涵蓋312工作檔、47個不同index blob、3個現有bundle、365個ZIP entries、12個PNG文字metadata，reviewRequired=0。另掃實際長Sheets URL／SA地址，沒有新增待審命中；不輸出命中內容。測試合成值與既有精確allowlist不當成真人秘密。未讀私人憑證、未呼叫Google API。T060原始紀錄保持不變。

.gitignore排除node_modules、dist、測試輸出、env（空白.env.example例外）、credentials、service-account*.json及pem/key。任意名稱JSON仍不能倚賴ignore，真金鑰必須repo外；備份本體在repo外，不納入候選，備份metadata無實際私密路徑。現存測試txt／JSON是驗證證據，不是任意cache；沒有發現必須刪除的憑證／備份。三份001歷史文件含既有本機路徑敘述，並非本輪新增私鑰路徑，依不改001限制保留；公開前仍由持有人決定這些歷史開發路徑及靜態資料是否適合公開。掃描不是完整個資／圖片／任意秘密形式保證，不能將0命中稱絕對安全。

40個受保護001／歷史／憲章檔、32份靜態XLSX均hash不變。package與lockfile根dependency/devDependency逐項一致。沒有安裝套件。

## Excel退役與output清理

[excel-retirement.md](excel-retirement.md)、[excel-retirement-changes.json](excel-retirement-changes.json)保留前次精確9刪／18改／273原基準未變清單，不改寫為本輪結果。產品src與package/lockfile沒有exceljs、fast-xml-parser、multer、舊Workbook renderer/helper引用；JSZip為安全掃描devDependency。舊方法名僅負向測試sentinel／歷史說明。靜態XLSX與001歷史不屬目前正式流程。

舊GET export仍先teacher auth再410 EXCEL_FLOW_RETIRED；原測試有未登入401、學生403、老師410、四階段、零cloud呼叫及不回binary斷言。POST preparation只接受精確JSON spreadsheetUrl，multipart仍拒絕400 INVALID_INPUT；本輪僅讀程式／既有通過紀錄，未重跑端點。Sheets來源／parser／Access／Snapshot／Evidence／coordinator安全政策未更動。

repo沒有output/，實際為outputs/classroomquiz-valid-notes/。使用者另授權刪除不用資料後，僅刪無產品／測試引用的ClassroomQuiz_valid.xlsx.inspect.ndjson；刪前與repo外精確備份比對SHA256，hash／用途記於[t064-post-retirement-output-review.json](t064-post-retirement-output-review.json)。ClassroomQuiz_valid.xlsx仍由001的tests/records/us1.md引用，必要歷史證據保留，不刪整個outputs。不讀／顯示儲存格私人內容。此額外單檔清理不改寫前次9檔退役事實。

## 文件、圖表與既有測試

README／Quickstart已正確63/64與Sheets唯一正式流程，Windows憑證輸入Trim及啟動命令沿用T061核對，無須改回64/64。Plan最新獨立維護條目明示取代原暫留Excelhelper決策；下方歷史時點不冒充現行功能。五份現行交付文件32個相對連結全部存在。

三份002-component／class／sequence.puml及對應PNG共六檔與T062最新hash一致；原始圖startuml／enduml完整，T062已CLI渲染及檢視紀錄保留。本輪無改圖、不重產PNG，也不宣稱本輪重做視覺驗證。圖表以UNKNOWN保守處理、pending不盲重送，不標示尚未取得的真實證據為PASS。

| 已有驗證 | 退役後實際紀錄 | 本輪 |
| --- | --- | --- |
| Backend | excel-retirement-final-backend.txt：138/138、fail0 skip0 | 未重跑 |
| Frontend | excel-retirement-final-frontend.txt：15/15、fail0 skip0 | 未重跑 |
| E2E | excel-retirement-final-e2e.txt：21/21，Playwright可用 | 未重跑 |
| Frontend build | excel-retirement-final-build.txt：PASS | 未重跑 |
| Backend語法／載入／隔離啟動 | 32JS、模組載入與health smoke PASS；無backend build script | 未重跑；backend build為N/A |
| 真API／人工 | T057使用者2026-11-18兩表、T058有限證據與T059使用者確認 | 未重跑 |

清理測試依維護紀錄2026-11-19，精確開始／結束時間若log沒有不得補造。T059實際操作日期未提供，確認日期與測試日期分開；原174/15/21等結果仍是清理前歷史，138不是原174同一套全部重跑。Playwright先前缺裝是歷史，前次維護已安裝並實際21項通過，本輪未安裝。

## 分類、限制與交付判定

| 分類 | 項目 |
| --- | --- |
| PASS | 既有離線／E2E／build與T057／T059各自範圍證據、當次候選掃描、hash、lockfile、連結與追溯核對 |
| ACCEPTED LIMITATION | DA-T058-01為使用者核准的專案內部有限證據決策，非助教接受；無CAS／單活動記憶體與程序重啟清空限制 |
| NOT VERIFIED | 已知DENIED準備拒絕的真實PASS、保護範圍專屬拒絕歸因、遠端恰一次／零重送；未提供精確欄位／日期及其他人工細項、完整個資稽核 |
| NOT RUN | 真實逾時、斷線造成寫入不明及PENDING reconcile；本輪應用測試／live／build均未重跑 |
| FAIL | 原protected真測P_EDITABILITY_MISSING／UNKNOWN；保留原assertion，不改成PASS |
| BLOCKER | 未發現產品／文件／一致性或已辨識機密阻擋；T064最終接受及Git操作授權仍待使用者，不能自行視為完成 |

UNKNOWN不等於DENIED，403／404不能證明保護格專屬原因。T059人工衝突通過但來源歸屬未提供，不宣稱A/B各自測過；重複略過與畫面保真不能證明遠端零寫入。結果未知保留原operation／Snapshot／Evidence屏障，不盲重送、不可有pending時重啟。

## SpecKit Analyze（本輪正式流程）

前置腳本一次成功指向002；extensions.yml不存在，無前／後hook。依spec、plan、tasks、constitution及data-model／contracts／矩陣／實作／測試／圖表唯讀檢查重複、歧義、未充分定義、憲章、覆蓋與跨文件矛盾。

| CRITICAL | HIGH | MEDIUM | LOW |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 |

FR21/21、SC7/7、場景26/26有任務／證據對應；64任務全部映射，63完成、T064待人工接受；未映射任務0、歧義0、重複0、憲章衝突0。前次F1狀態文字LOW已在核准維護中處理，歷史報告不改。覆蓋100%不等於所有分支真實PASS。沒有需要本輪修正或降低安全要求的發現。下表為矩陣原映射摘錄，證據細節／限制以final-acceptance及JSON為準。

| 需求／場景 | 有任務 | 任務映射 |
| --- | --- | --- |
| FR-001 | 是 | T020／023–026／040／042／061 |
| FR-002 | 是 | T002–010／013–014 |
| FR-003 | 是 | T010／015–023 |
| FR-004 | 是 | T018–022 |
| FR-005 | 是 | T015／018–021 |
| FR-006 | 是 | T016–023 |
| FR-007 | 是 | T016／023／033／040／045／050 |
| FR-008 | 是 | T027–031／053–056 |
| FR-009 | 是 | T032／039–043 |
| FR-010 | 是 | T032／035／039／053 |
| FR-011 | 是 | T034／038／044／047 |
| FR-012 | 是 | T034／038–039／044／047 |
| FR-013 | 是 | T011／018–021／034／038–039 |
| FR-014 | 是 | T033／036–039／043–054 |
| FR-015 | 是 | T037–038／044／047–049 |
| FR-016 | 是 | T044–054 |
| FR-017 | 是 | T045–054 |
| FR-018 | 是 | T006–010／024–025／041–052 |
| FR-019 | 是 | T002–010／060 |
| FR-020 | 是 | T020／057／059／061 |
| FR-021 | 是 | T005／014／026／031／043／054–064 |
| SC-001 | 是 | T026／057／059，U-P A/B、E-P、LIVE |
| SC-002 | 是 | T043／057／059，H-W／U-A／LIVE文字及保真 |
| SC-003 | 是 | T034／038／044／047／058–059，R-U／H-W／E-R |
| SC-004 | 是 | T045–054／058–059，R-H／E-R／F-T |
| SC-005 | 是 | T031／053／056／059，Q-T／E-Q三組／<2秒 |
| SC-006 | 是 | T016／060，H-P／H-W／R-H／security.md |
| SC-007 | 是 | T055–064，各分類紀錄及三圖 |
| US1.1 | 是 | P／F；T016–026 |
| US1.2 | 是 | P；T018–026 |
| US1.3 | 是 | P；T018–022 |
| US1.4 | 是 | A／P；T006–023 |
| US1.5 | 是 | P；T015／018–021 |
| US1.6 | 是 | P；T016／022–023 |
| US1.7 | 是 | Q／P；T016／023 |
| US2.1 | 是 | Q；T027–031 |
| US2.2 | 是 | Q；T028／053 |
| US2.3 | 是 | Q；T027／031 |
| US2.4 | 是 | Q／W；T030／053 |
| US2.5 | 是 | Q／F；T028–031／053 |
| US3.1 | 是 | W；T032–043 |
| US3.2 | 是 | W；T032／039 |
| US3.3 | 是 | A／W；T011／032／043 |
| US3.4 | 是 | A／W；T034／038–043 |
| US3.5 | 是 | W；T032／035 |
| US3.6 | 是 | Q／W；T033／040 |
| US4.1 | 是 | W；T037–049 |
| US4.2 | 是 | W；T034／044／047 |
| US4.3 | 是 | W；T034／044 |
| US4.4 | 是 | W；T039／045／049 |
| US4.5 | 是 | W；T044–050 |
| US4.6 | 是 | W／F；T045–053 |
| US4.7 | 是 | A／W／F；T006–010／048–052 |
| US4.8 | 是 | P／F；T020／059／061 |

## 最終人工接受與Git建議

可交使用者正式審閱並決定接受；本輪不勾T064。需使用者決定：接受功能與證據範圍、文件可用性、DA及未驗限制、歷史靜態資料／本機開發路徑公開範圍，以及是否正式結案。不能用Analyze全0代替接受。

核准後才另依授權記錄接受／更新64/64。Git候選包括現行source／測試／package+lockfile、README、002規格／三圖+PNG、原歷史與必要靜態證據、清理與驗收紀錄；排除真憑證、env、node_modules、dist、cache、repo外備份及已刪衍生inspect。不得盲目git add .；另取得Git操作授權後挑明確路徑、檢查staged diff及刪檔、再次secret scan，確認remote和精確範圍後才commit／push。發布私人資料需持有人額外核對，掃描不能取代。沒有要求重跑會改真表的live來作提交檢查。
