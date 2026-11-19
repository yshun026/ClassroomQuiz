# Feature 002 執行與審查紀錄

## T058 UNKNOWN欄位細分（仍待真實只讀授權）

使用者回報protected的P_EDITABILITY_UNKNOWN／pass0／fail1／skipped0／exit1並確認強制保護等UI條件，授權必要測試層安全診斷與相關離線驗證。本輪未記其私人表名／座標，實際測試日期未提供，未補造。已核對官方ProtectedRange與get定義及本地fields→JSON→clone→parser路徑；欄位確有要求且未在正規化中刪除／轉型，但沒有當次回應摘要可證明具體缺欄／null／非布林子類或Google省略原因。

僅修改tests/helpers/protected-diagnostics.js及unit/protected-diagnostics.test.js，新增固定欄位狀態及MULTIPLE／MIXED去識別觀測，不改產品parser／權限政策。沒有原文例外／response／ID／座標／內容／帳號／path／Token輸出；UNKNOWN不轉false，正式parser拋SHEETS_NOT_EDITABLE才PASS。多碼可能來自不同規則，不能直接指定某個答案格。

相關48項離線PASS及完整backend輸出見protected-field-state-target.txt／backend.txt；詳細方法、碼義、安全與待授權只讀方案見protected-field-state.md。T058仍未勾選、58/64不變；本輪不跑test:live／真Google、不讀私人憑證、不改表／設定、不commit／push，等待人工確認下一步。

## T058 protected最小診斷授權與離線結果

使用者確認新T058副本Q1–Q6完整、Q1保護正確、非warning限制編輯、SA文件Editor但未列Q1允許者、無Q1例外，授權只改測試層最小非機敏診斷。先前protected真實pass0／fail1／exit1／LIVE_ACCEPTANCE_FAILED保持失敗回報，未提供實際日期，不編造根因或修正後真實通過。

新增tests/helpers/protected-diagnostics.js、unit/protected-diagnostics.test.js，修改tests/live/google-sheets.test.js，正式parser／Access／coordinator／HTTP／Socket／核心／圖未改。只有原parseSource拋SHEETS_NOT_EDITABLE才PASS；缺失／null／非布林皆未知，觀測無法確定則P_DIAGNOSTIC_UNAVAILABLE，不放寬原assertion。固定結果僅passed與白名單codes，無ID／座標／內容／email／key path／Token／原始錯誤或response；多規則保留多個可靠觀測而不假稱根因。

實測：backend165/165、frontend15/15、全E2E21/21（3100／5273隔離埠）、build成功，0失敗／skip。既有backend停用gate子程序RUN=0不讀key或連Google；本輪未執行test:live命令或任何真Google、未建立／讀私人憑證、改表／權限、commit／push。詳細碼義／命令／預期／實際／安全及fixture修正見tests/records/002-google-sheets-integration/protected-diagnostic.md與protected-diagnostic-*.txt。

T058保持未勾選，總58/64不變，等待使用者下一次真實protected輸出；T057的user-reported PASS與T003／T004確認不變。沒有使用離線PASS替代真實驗收，001歷史未修改。

## 最新：使用者確認T003／T004及T057真API通過

使用者明確提供實際測試日期2026-11-18，確認API已啟用／專用SA／無網域委派／repo外JSON／ACL；A/B不同ID、兩份Editor、完整標記、B hidden與merge、基準已保存。test:live輸出A、B各verified questions=6／explicit batches=2、pass1／fail0、退出碼0，人工原表觀察Q1／Q3正確寫入、Q2保marker、其他內容／格式無非預期變更。詳tests/records/002-google-sheets-integration/live.md文末，記USER_CONFIRMED_ENVIRONMENT與USER_REPORTED_LIVE_PASS，非代理獨立執行。

T003／T004／T057已依本回報勾選，累計58/64；仍未勾選T058／T059／T061／T062／T063／T064。後三項離線產物已備妥，但按既有人工相依順序待複核；沒有推定權限切換、完整UI／三組人工或最終接受通過。之前55/64及NOT RUN均為原時點紀錄。

先前live失敗及四格仍marker的觀察保留於live.md，失敗日期／根因／修正方式未提供，不從本次成功反推。沒有虛構截圖、原始log或另外一次測試。這次只更新002狀態與證據，不改程式／圖／001，不讀私人key、不呼叫Google、不commit／push。

## 2026-11-18 Tasks 最終人工核准與分階段 Implement 授權

使用者本輪明確接受 Tasks 最終版本，依最新 Analyze 零 finding 與64項任務基準，授權進入 Implement，**本輪限 Setup／Foundation（T001–T014）**。據此記 Tasks APPROVED_BY_USER，確認日期2026-11-18；不推定額外審查者或日期。原文後續待審狀態保留為歷史，以本節及本輪實作紀錄為準。

check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks 確認 Feature 為 specs/002-google-sheets-integration，實際Git分支 codex/google-sheets-integration。requirements.md 16項已勾選、0未勾選；未修改清單。extensions.yml不存在，無before_implement hook。既有未提交002產物保留。

T003／T004仍需使用者提供真實Cloud／Service Account／分享及兩份來源，不因fake通過而完成；本輪不建立真實憑證。US1–US4／Final不在授權範圍，真實Google API驗收NOT RUN。不commit／push，不改001歷史或搶答規則。

日期：2026-11-18。最新狀態：使用者已正式接受 Plan 六份文件並授權 Tasks；RG-001／RG-002 確認保留。Tasks 文件已產生，仍待 Tasks 人工審查及後續 Analyze；Implement 未執行。下列舊 PENDING／暫停狀態保留為歷史，以文末最新紀錄為準。真實 Google API 驗收 NOT RUN。

**最新補充（2026-11-18）**：使用者已接受 Analyze 問題報告並明確授權五項最小修訂，修訂與唯讀 Analyze 複查已完成，無未解決 finding；仍待 Tasks 最終人工審查，未獲 Implement 授權。上段「後續 Analyze」保留為原時點狀態，最新依據見文末。

## 需求來源與治理狀態

- CR-002-001：使用者於本對話轉述助教最新公告，要求改用 Google Sheets API 直接讀取與寫回原表；本輪十五項原則與階段限制為草案輸入。沒有公告原文網址／附件、發布日期或助教直接回覆，不宣稱已獨立查核公告。
- 使用者本輪明確要求先建立新規格與三圖，保留跨組 PENDING。本次據此交付待審草案；未將指示寫成「已完成跨組討論」，也未修改 constitution。
- constitution I：「任何影響使用者功能與操作流程的變更，都必須先與另一組討論並記錄結論，再依確認結果修訂規格及後續產物，不得先行實作。」本次前置跨組結論尚缺，不能標示完整治理通過。此為使用者授權的待審草案，不是可實作基準。
- constitution II／III 要求人工規格及三圖審查後才可進規劃。RG-001、RG-002 仍 PENDING；未自行推定核准。

## 實際 SpecKit 工作流程

1. 已讀本專案 `.agents/skills/speckit-specify/SKILL.md`（安裝設定 SpecKit 1.2.1、Codex skills／PowerShell、順序編號）。
2. 開始前 `git status --porcelain` 無輸出，原分支 main，工作目錄乾淨。
3. 依使用者要求執行 `git switch -c codex/google-sheets-integration`，成功建立並切換；本次沒有 commit、push 或合併。
4. 檢查 `.specify/extensions.yml` 不存在；before_specify 無可執行 hook。分支由使用者明確要求建立，非聲稱 hook 自動建立。
5. 顯式設定 `SPECIFY_FEATURE_DIRECTORY=specs/002-google-sheets-integration`，確認目標尚不存在；short name 為 google-sheets-integration，只建立一個 Feature。
6. 透過既有 `common.ps1` 的 `Resolve-TemplateContent -TemplateName 'spec-template'` 解析 active template，先寫入新 spec 作為起點，再填寫最終規格。未硬改共用模板。
7. 依 skill 使用 `Save-FeatureJson` 將 `.specify/feature.json` 指向新目錄。該檔本來即為 machine-local ignored state，不強制加入 Git。
8. 執行唯讀 `check-prerequisites.ps1 -PathsOnly -Json`，實際 FEATURE_DIR 與 FEATURE_SPEC 均指向 002。其 JSON 的 BRANCH 欄位是 Feature context 名稱，不是 Git 分支；實際 Git 分支另由 Git 查驗。
9. 讀取 constitution 1.0.0，完成 spec、16 項需求品質檢查表與三圖；套件、HTTP 合約與衝突保護實作方法留待 Plan。
10. 完成後再檢查 `.specify/extensions.yml` 仍不存在；after_specify 無可執行 hook。未執行完整 workflow，避免自動進入後續階段。

## PlantUML CLI 實際執行

本節尺寸、雜湊與下方一致性表為初次草案紀錄；本次人工審查後已移除來源草稿分支，最新產物及核對結果見文末。

沿用專案外既有工具，沒有下載或安裝 API 套件／建立 Google 憑證。

- Java Runtime：Java 19.0.2（以本次 `java -version` 檢查為準）。
- PlantUML：1.2026.9，commit 18d0aae。
- Graphviz：2.44.1；PlantUML 工具自檢顯示安裝可用。

實際使用 PowerShell 指令：

```powershell
$jarPath = Join-Path $env:TEMP 'classroomquiz-plantuml/plantuml.jar'
java -jar $jarPath -charset UTF-8 -failfast2 -tpng './diagrams/002-*.puml'
```

退出碼 0。使用新檔名萬用字元是為保留 001 三份舊圖與舊 PNG 原樣，不重寫歷史產物。三份新圖均生成同目錄 PNG，修訂 Sequence 後再次生成。

| 圖 | PNG 尺寸 | 檔案大小 | 結果 |
| --- | --- | --- | --- |
| 002-component | 1918 × 1218 | 99568 bytes | CLI PASS，已開啟檢視 |
| 002-class | 2087 × 835 | 89259 bytes | CLI PASS，已開啟檢視 |
| 002-sequence | 2121 × 2994 | 162445 bytes | CLI PASS，最終版已開啟檢視 |

PNG SHA-256：

```text
002-component.png DFD39417F761D5857A29DF261761C30417198B4A59C7CEA994F62AA095C81F9C
002-class.png     46CC67BEA3F32EFD1661D001DC8E46BC81DEE3FE5B8EF67B2F64118BCBEECE1F
002-sequence.png  47F7D02A0F12F8A0CE66E90FA5EF1EAAF7B7B35236370BD1F2E43136331F8546
```

圖片英文標示對應繁中規格，未見錯誤頁或裁切。三圖是邏輯設計責任，不是宣稱已實作或已完成 Google API 保護機制。

## 規格與三圖靜態一致性

| 規格責任 | Component | Class | Sequence | 結果 |
| --- | --- | --- | --- | --- |
| US1／FR-002–007：老師驗權、服務身分、全支援分頁、完整準備 | Auth、Notes、Access、Store | Source、Location、GuidedNotesService | 準備鎖、全部讀取驗證、未設組草稿／完整 commit／失敗 | PASS（靜態） |
| US2／FR-008：搶答、隔離、同步不變 | Activity、Quiz、Sync | 原 Activity／Question／Submission／Group／Session | 開始、唯一順位、閉題與下一題驗權、提交組推送及閉題公布 | PASS（靜態；細節沿用 001） |
| US3／FR-009–014：手動原表寫回、一致快照與文字保留 | Writeback、Access | Source、Location、ClosedWinnerSnapshot | 取快照、核對目標、只寫值與讀回 | PASS（靜態） |
| US4／FR-015–018：互斥、衝突、待核對與重複處理 | Writeback Coordination | Operation、Evidence | busy、原快照恢復、逐題核對、失敗／不明、保留屏障 | PASS（靜態） |
| FR-019–020：憑證與重啟邊界 | repo 外憑證、runtime 註記 | Access、runtime 證據註記 | 不回滾、重啟保留遠端值 | PASS（靜態） |
| A-04／RG-005：不誤稱遠端鎖 | Google 註記 | Access 註記 | preflight 與 write 間風險註記 | PASS（靜態；Plan 可行性未驗） |

人工品質檢查 PENDING；AI 靜態表與 PNG 存在不等於程式碼／圖表一致性已驗證。後續實作仍須重做 constitution III 的實作核對。

## 驗證界線與下一階段

- Checklist：16/16 草案品質項目符合；零未決需求標記，不等於零外部待辦。
- 未執行應用自動／人工測試或真實 Google API 讀寫，不沿用 001 的 73／7／14 數字當本 Feature 成果。
- 人工須接受首版 A-04 受控編輯前提、衝突停止、逾時先核對、標記需人工還原等語意；任意外部同時編輯下不能承諾絕對零覆寫。
- RG-001 跨組與 RG-002 人工規格／圖表審查完成後，才可將本草案作為 `$speckit-plan` 輸入。RG-003 原公告佐證待補，RG-004 實際授權及 RG-005 保護可行性列後續工作，不虛構已驗證。
- 目前未進 Plan，未新增 plan.md／tasks.md／實作；應用程式仍是原 Excel 流程。未動 001 文件、舊圖、README、constitution、應用程式、依賴與原測試紀錄。

## 2026-11-18 人工審查後最小修訂

**人工來源**：使用者本輪明確表示已檢查 spec.md 與三份 PlantUML，整體架構可保留，要求移除來源有效但未設組的 preparation draft、釐清已回填答案的後續核對、保留人工重用規則。本紀錄不推定使用者已確認修訂版，也不代表跨組核准或授權進 Plan。

| 審查意見 | 修訂與靜態核對結果 |
| --- | --- |
| 不增加 preparation draft 狀態 | US1.6、FR-006 明定先具有效組數才讀來源，來源完整驗證後一次建立 Q1 WAITING；未設組即拒絕，不暫存已驗證來源。Sequence 刪除該草稿分支並增組數前置拒絕；Component／Class 同步註明一次 commit、無新草稿狀態 |
| 答案已取代原標記，不應誤報缺漏 | US4.1／5、Edge Cases、FR-011 明定後續結構及重複寫回核對結合匯入映射、本活動 WritebackEvidence 與待核對原操作。三圖同步標示紀錄可解釋的預期答案取代標記是合法狀態，不再要求全表保留完整原標記 |
| 保留安全衝突規則 | 只有具本活動依據、原位置及型別吻合的預期替換可接受；無依據改值、公式、位置／結構變更仍衝突。不以相同答案字串冒認成功，不盲目重送 |
| 不新增自動還原 | US4.8／FR-020 保留人工還原完整標記或自行複製範本；FR-020 記錄後續 quickstart.md 必須清楚區分同活動重複寫回與新活動範本重用，本輪不建立該文件 |
| 同步檢查四份文件 | spec 及三圖的準備門檻、來源映射、紀錄核對、待核對恢復與重啟／重用邊界一致；沒有更動原搶答規則或新增活動階段 |

**本次 CLI**：沿用上列 PlantUML 1.2026.9，以相同 `-charset UTF-8 -failfast2 -tpng './diagrams/002-*.puml'` 指令重產三圖，退出碼 0；最終三份 PNG 均已開啟檢視，無錯誤頁或裁切。

| 圖 | 最新尺寸 | 大小 | SHA-256 |
| --- | --- | --- | --- |
| 002-component.png | 1957 × 1234 | 104942 bytes | `6C6B0E3001D8B686D6F24308353E15F71E0D15EFA59CC9E98EE70AFE042AA1B1` |
| 002-class.png | 2382 × 885 | 102404 bytes | `65D7CEA979AF3B5DE97FAEA72D8357584548B255C021952BB03BE150BF77E933` |
| 002-sequence.png | 2121 × 3117 | 169781 bytes | `4D12F1BA8FE0490642FA471105AC8BC4558DB9CB63B1791810625965D61BC5C2` |

**審查狀態**：RG-002 更新為 REVIEWED_WITH_CHANGES（已收到人工意見，修訂版待確認）。RG-001 跨組討論仍 PENDING，未記為完成。公告原始佐證待補，真實授權與檢查至寫入保護可行性尚未驗證，既有受控編輯風險界線不變。

**變更範圍**：只修訂 002 的 spec、三份 .puml 及其 PNG、此紀錄與需求品質清單的同步註記。001、應用程式、測試、依賴、憲章、舊圖均未修改；未建立 quickstart.md、plan.md 或 tasks.md，未進任何後續階段。未執行應用測試或真實 API 讀寫；靜態核對與 CLI 成功不冒稱實作驗收。


## 2026-11-18 使用者正式確認與 Plan 前置關卡

確認來源：本對話使用者本輪明確聲明，非 AI 推定或 001 舊核准延伸。

- **RG-002 APPROVED_BY_USER**：使用者已審閱並接受修訂後 spec.md、002-component.puml、002-class.puml、002-sequence.puml，以及規格明載的 Google Sheets 寫回安全邊界。
- **RG-001 CONFIRMED_BY_USER**：使用者回報已與 OpenSpec 組確認本次 Google Sheets 直接讀寫需求，雙方同意依助教公告修改 Excel 匯入／匯出流程。
- 上述 **2026-11-18 是本次確認日期**，不是實際跨組討論日期；實際討論日期、參與者姓名及額外會議細節未提供，均不補造。不是聲稱 AI 參加討論或助教直接回覆。
- 原先 PENDING／REVIEWED_WITH_CHANGES 保留為歷史，以上為最新有效狀態。使用者授權僅進 Plan，Plan 新文件仍需人工審查。
- 已讀實際 speckit-plan skill 與 constitution 1.0.0，分支 codex/google-sheets-integration、Feature 指向 specs/002-google-sheets-integration；16 項品質清單符合，三份 .puml／PNG 齊備。既有未提交 002 產物保留，不因本輪而 commit。
- 無 .specify/extensions.yml，無 before_plan hook。RG-003 原公告附件未提供，但使用者轉述及雙方需求確認有明確來源；不冒稱公告原文已查核。RG-004 真實授權 NOT RUN、RG-005 技術保護待研究，皆在 Plan 處理及後續實測界線內，不冒稱已驗收。

## 2026-11-18 Clarify 互動紀錄（進行中）

依使用者新指示暫停 Plan，改用實際 speckit-clarify skill。唯讀 PathsOnly 前置檢查已指向 002，無 extensions.yml／before_clarify hook。上輪中斷前已建立的 plan.md 只是未填寫模板，保留不刪除，本輪不填寫；不得稱 Plan 已完成。RG-001／RG-002 的先前正式確認不抹除，新釐清內容須待最終人工確認。

- Q1：答案佔位符儲存格含局部文字格式如何處理？建議 A；使用者回覆「recommended」，正式採 A。讀取時拒絕整份來源並指出該格，要求人工整理後重試，不自動刪除格式。一般整格字型／底色／框線及非答案格局部格式仍保留；寫前才新增該格式則為衝突。
- 已逐次同步 spec 的 Clarifications、US1.5、Edge Cases、FR-005／013 與三圖相關註記，未改主架構、搶答規則或活動階段。官方依據：https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells ，新 userEnteredValue 會擦除 textFormatRuns，故不可聲稱僅改值便必然保留局部字元格式。
- 三圖 CLI 已以既有工具及 -charset UTF-8 -failfast2 -tpng 重產，退出碼 0。尚未執行應用／真實 Google API 測試。
- 品質清單重評 16/16 → 16/16；無新增通過、退步或仍未勾選項，依 Clarify 規則不改任何清單文字／標記（既有紀錄屬原時點品質結果）。US1 仍 7 項，本次擴充既有場景。完整 Clarify coverage 與最終結論待互動結束後記錄。

- Q2：準備時已確認唯讀或答案格無寫入權，是否允許開始？使用者回覆「recommended」，採 A：拒絕建立活動，提示修正分享／保護範圍後重試，不寫測試值。活動開始後才撤權則保留搶答結果，寫回時報錯。
- Q2 已同步 Clarifications、US1.4、Edge Cases、FR-006／018 及三圖；CLI 重產成功，退出碼 0。清單重評仍 16/16 → 16/16，無標記狀態變更，未修改其他清單內容。本階段仍為 Clarify，未繼續 Plan。


## 2026-11-18 Clarify 完成紀錄

- **Q3 已確認**：使用者回覆「recommended」，採 A。可讀且題目有效、無已知寫入拒絕，但無法非破壞性確認可編輯時，允許建立並明示「寫入權限尚未確認」；老師仍應先分享編輯權，讀取成功不當可寫保證。
- 共提出並接受 **3 題／3 答**，未用滿五題；其餘重點在現行規格已有可測試規則，不再重問已確認決策。每題均立即整合，Clarifications 恰三筆且無重複。
- 更新區段：Status、Clarifications、US1、Edge Cases、FR-005／006／013／018、GuidedNotesSource、A-02、RG-002 及圖表階段註記。既有手動閉題快照、原表動態位置、WritebackEvidence／原操作核對、衝突停止、人工還原範本、搶答隔離均保留。
- 已覆核助教另一份來源：同樣使用當場網址並事先分享給服務身分，支援分頁全部掃描、完整標記才建立，不寫死 ID／格址；新活動不猜已寫答案為標記。同活動重複寫回以證據與原映射核對，不以消失標記判缺號。
- 三份 .puml 同步 Q1–Q3，未新增主要組件或活動階段；CLI 重產退出碼 0，最終 PNG 均已解碼開啟檢視。內容與本次三項決策、既有安全邊界一致，未見錯誤頁或裁切。

| 最新 PNG | 尺寸 | 大小 | SHA-256 |
| --- | --- | --- | --- |
| 002-component.png | 1977 × 1421 | 123589 bytes | `8DEB290FD9665B40AC5AB6560F2138CE3188400D16DFD4DE9596B598B52C2261` |
| 002-class.png | 2541 × 936 | 114857 bytes | `B52A424138D9891BCB1A5566E171941312561127F77F983CB3B3C9B8829CF686` |
| 002-sequence.png | 2121 × 3326 | 185238 bytes | `82F56F26D5B71EF15072FC6C11B2EE4490CAFA7553BCDFCA027155E63F3CA95E` |

### Clarify coverage

| 分類 | 結果 | 依據／剩餘事項 |
| --- | --- | --- |
| Functional Scope & Behavior | Resolved | Q1 定義答案格格式支援邊界；原目標、角色與非目標清楚 |
| Domain & Data Model | Resolved | Q3 補來源寫入權限確認狀態；題號唯一、映射與操作生命週期清楚 |
| Interaction & UX Flow | Resolved | Q2 已知拒絕／Q3 未知提示分開，錯誤、忙碌、無資料皆有規則；沿用既有繁中介面 |
| Non-Functional Quality Attributes | Clear | 保留本機、2 秒同步、機敏資料保護、不可盲重送及重啟界線；不增加服務可用率保證 |
| Integration & External Dependencies | Resolved | Q1 API 字元格式限制、Q2／Q3 非破壞性權限檢查及助教另表授權責任明確 |
| Edge Cases & Failure Handling | Resolved | 局部格式拒絕、未知權限提示；其餘改值、移格、逾時、證據核對與撤權已有規則 |
| Constraints & Tradeoffs | Clear | 手動寫回、受控外部編輯、無自動還原與雲端等待不參與搶答裁定 |
| Terminology & Consistency | Clear | 已知無權限／尚未確認／讀回核對成功分開；操作狀態不當作活動階段 |
| Completion Signals | Clear | FR 對應驗收、兩份來源真實測試、人工／自動分開，不能以 mock 或舊 PASS 冒充 |
| Misc / Placeholders | Clear | 規格無未決需求標記；未填 plan.md 是中斷的歷史模板，不屬已完成規劃 |

具體 SDK、非破壞性可編輯資訊取得方法、配額／請求時限、傳輸重試控制與精確保護可行性屬 Plan 技術工作，不以本次需求答案代替。RG-004 真實授權環境仍 NOT RUN；RG-003 原公告原始佐證仍未提供，引用維持使用者轉述，不虛構補齊。

**Checklist 最終重評**：16/16 → 16/16。Newly passing：無；Regressions：無；Still unchecked：無。按 Clarify 規則無狀態變更即不修改清單任何文字或標記，清單已完成重評、證據記於此。

**Hooks**：完成時確認 .specify/extensions.yml 仍不存在，after_clarify 無可執行 hook。

**下一步**：沒有需繼續互動的關鍵需求歧義，Clarify 完成；本次整合版規格及三圖仍待使用者最終人工確認，確認後可執行 $speckit-plan。本輪不繼續 Plan／Tasks／Implement；未修改 001、程式、憲章、測試與依賴，不建憑證，不 commit／push。未執行應用或真實 API 驗收。

## 2026-11-18 Clarify 整合版正式人工確認與本次 Plan 前置檢查

使用者本輪明確表示「確認接受 Clarify 後的整合版規格與圖表」，並授權通過必要關卡後執行 speckit-plan。據此記 RG-002 APPROVED_BY_USER，涵蓋三項 Clarify 決策與現有安全邊界；確認日期 2026-11-18。RG-001 沿用前輪使用者正式回報與 OpenSpec 組達成直接讀寫需求一致的真實確認，未新增或推定實際討論日期、參與者姓名或會議細節。

規格／清單／三圖已讀，原 16 項品質檢查符合；Feature 指向 002，Git 分支 codex/google-sheets-integration。既有未提交 002 產物保留。無 extensions.yml／before_plan hook。RG-003 公告原附件未提供，維持轉述來源；RG-004 真實環境尚未測試，不宣稱通過。RG-001／RG-002 無缺漏的必要前置確認，可正式進本次 Plan。

## 2026-11-18 Plan 完成紀錄（待人工審查）

- 依本專案 speckit-plan 工作流程執行 setup-plan.ps1，Feature 路徑確認為 specs/002-google-sheets-integration；完成 research、技術設計及規劃後 Constitution Check。使用研究代理檢查官方 Google API／認證文件，未以代理意見代替人工核准或真實 API 驗收。
- 完成 plan.md、research.md、data-model.md、contracts/http.md、contracts/google-sheets.md、quickstart.md。涵蓋既有模組整合、後端認證、動態定位、權限三態、局部文字格式拒絕、精確寫值、證據與原操作核對、逾時阻擋盲重送、測試及兩份真實來源操作步驟。
- RG-005 的 API 安全邊界已完成設計研究：Google Sheets 無跨讀取／寫入請求的原子條件鎖定；維持既有受控外部編輯前提，不宣稱消除競態。遠端結果未知且原標記仍在時，不能因本機逾時或讀回而推定舊請求終止；保留待核對及禁止新寫入，可能需要持續人工處理。未降低 Specify／Clarify 要求。
- 三份 PlantUML 僅同步本次人工接受的階段註記，架構不變；使用既有 PlantUML CLI、UTF-8、failfast2 重新產生 PNG，退出碼 0，三張均已開啟檢視，無錯誤頁或裁切。下表取代先前時點的圖檔雜湊作為本次產物紀錄，歷史紀錄保留。

| 本次 PNG | 尺寸 | 大小 | SHA-256 |
| --- | --- | --- | --- |
| 002-component.png | 1977 × 1421 | 123666 bytes | `310493ED5357314B017FECF2DFD43B4778BEF0A859016F775DB3138019A4D774` |
| 002-class.png | 2541 × 936 | 115022 bytes | `A59AAB48F4F8E10E5C1A4679A480EFB2A587A881FF716081582A4C0D679AD062` |
| 002-sequence.png | 2121 × 3326 | 185347 bytes | `E61E704FF1C278D188796207AA83C31825A49B10BBA1181A113BE9A8ECA85D78` |

- 文件檢查：六份規劃產物存在、相對 Markdown 連結有效、未留模板／NEEDS CLARIFICATION 標記、無行尾空白；Clarify 三筆答案及需求清單 16/16 保留。check-prerequisites.ps1 -Json -RequireSpec 成功，辨識 research.md、data-model.md、contracts/、quickstart.md。
- 未修改 001 歷史文件／圖表、應用程式、測試、constitution、模板或依賴；未建立 tasks.md，未執行 Tasks／Implement、安裝套件、建立憑證、commit 或 push。應用測試、E2E 與真實 Google API 驗收皆 NOT RUN；舊 001 通過紀錄不能視為 002 通過。
- 完成時 extensions.yml 不存在，無 after_plan hook。Plan 前後憲章檢查符合，Diagram First 順序保留；規劃文件已具備進入 Tasks 的設計資料，但本次 Plan 文件仍待人工審查。RG-004 的真實環境驗收及實作測試留待後續執行，不虛構完成。

**停止點**：本輪僅完成 Plan，等待使用者人工審查；不得由本紀錄推定 Plan 已獲人工核准。

## 2026-11-18 Plan 人工審查通過與 Tasks 授權

確認來源為本對話使用者本輪明確表示「已對本次 Plan 階段的六份文件進行人工審查，確認目前技術設計可以接受，允許進入 Tasks 階段」。據此將 Plan 審查記為 APPROVED_BY_USER，涵蓋 plan.md、research.md、data-model.md、contracts/http.md、contracts/google-sheets.md、quickstart.md；確認日期為 2026-11-18，不推定其他審閱日期、參與者或討論細節。

先前 Plan PENDING 為原時點紀錄，由本次使用者確認解除；六份基準文件保留原內容，最新治理狀態以本紀錄為準。RG-001／RG-002 既有確認依據仍有效。RG-003 原公告附件仍未提供；RG-004 真實 Google API／分享權限驗證仍 NOT RUN；RG-005 只完成設計研究，不是實作或真表驗收通過。這些狀態不因人工接受技術設計而改寫成實測成功。

本輪僅授權 Tasks 文件產生，完成後等待 Tasks 人工審查及後續 Analyze，不自動執行 Implement。沿用 codex/google-sheets-integration 與明確的 002 Feature 路徑；setup-tasks.ps1 -Json 已成功辨識全部必要輸入與 tasks-template。執行前 extensions.yml 不存在，無 before_tasks hook。

## 2026-11-18 Tasks 產生完成（人工審查 PENDING）

- 使用本地 .agents/skills/speckit-tasks/SKILL.md 與 setup-tasks.ps1 回傳模板，讀取 spec／plan／research／data-model／兩份合約／quickstart／constitution／三份 002 PlantUML；依四個 P1 故事建立 tasks.md。沒有啟動 Implement 或執行任何待辦任務。
- 共 **64 項**：Setup 5、Foundation 9、US1 12、US2 5、US3 12、US4 11、Final 10；14 項 [P] 為不同檔案的測試工作，仍須各自前置完成。任務寫明新增／修改的實際檔案、資料約束、故事驗證條件、合約／FR／SC 對應、依賴圖與每故事平行範例。
- T003／T004 明列使用者 Cloud／Service Account／兩份真表分享的人工前置；T057／T058 真實 API、T059 人工操作、T064 人工最終審查與 fake／自動化分開。所有環境及測試仍未執行，無真實 key／ID 進文件；有環境阻礙時須記 BLOCKED，不冒稱通過。
- Access T010／T011／T014 為回填 T039 的硬性前置；US3 即具安全屏障，US4 補原操作核對與晚到恢復，不存在先容許盲重送再補保護的交付方式。未知結果可持續 pending、無 CAS、受控外部編輯與不自動還原等已接受限制保持，未新增資料庫／Drive／鎖服務等無關功能。
- 格式驗證：T001–T064 連續唯一、64/64 checklist 格式及檔案路徑有效、故事標記統計 12／5／12／11、[P] 14、已勾選 0。check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks 成功，Feature 為 002 且 AVAILABLE_DOCS 含 tasks.md。這是文件結構檢查，並非執行後續 Analyze 或證明實作測試通過。
- Constitution／Diagram First：以既有已核准三圖分配責任，未改圖所以本輪不需重產 PNG；T062 安排實作後逐項一致性及變圖時 CLI 重產。RG-001／RG-002／Plan 人工基準齊備，Tasks 新產物尚未人工接受。RG-004 live NOT RUN／RG-005 實作驗證 NOT RUN 維持。
- 後置確認 .specify/extensions.yml 仍不存在，無 after_tasks hook。保護路徑 git diff 檢查無應用程式／001／歷史測試／憲章／圖表變更，git diff --check 無錯誤。本輪僅新增 tasks.md、更新本 review-record.md；未安裝套件、建立憑證、執行測試或任務、commit／push。

**停止點**：Tasks 文件產生完成；等待使用者 Tasks 人工審查與後續 Analyze。沒有將使用者的 Plan 核准延伸為 Tasks 核准或實作授權。

## 2026-11-18 Analyze 意見之授權修訂與唯讀複查

使用者本輪明確接受前次 Analyze 報告並授權直接修訂 I1／C1／A1／A2／I2，不需先交另一份修訂草稿。此為問題修正授權，不等於接受修訂後 Tasks 或授權 Implement。確認日期是本次對話日期，不編造其他會議日期或人名；原 RG-001／RG-002 及 Plan 核准依據保留，RG-004 真實 API NOT RUN，RG-005 仍僅設計研究。

| Finding | 修訂結果 | 受影響產物 |
| --- | --- | --- |
| I1 HIGH | 明確分新 writeback／顯式 reconcile；pending 時新操作回原 ID 而不啟動 worker；未完成標記加舊遠端未知維持只讀核對；僅原 attempt 可安全排除才可再寫，全部原目標吻合可核對內容同步但仍等本機 transport settle。預期文字恰為原標記不當未完成 | diagrams/002-sequence.puml／PNG |
| C1 HIGH | 補 T013 的 helpers/quiz.js 有效 Sheets 模型／fake，T016 的 foundation.test.js 新準備契約且原安全 assertions 保留，T027 的 group-session-http.test.js 先組數再載入；T026／T031 明列執行驗證，不恢復舊 Excel／validated-source draft | tasks.md；本輪沒有改測試程式 |
| A1 MEDIUM | 定義 currentOperationId／viewEpoch／discoveryGeneration 的純記憶體接收規則；revision 只比同 ID，舊 GET／Notes／POST／錯誤不可接管新操作；補跨 operation 及回覆遺失後晚到測試 | contracts/http.md、T041／T046／T051 |
| A2 MEDIUM | 讀取總預算100,000ms含Token／HTTP／body／等待，每attempt至多30,000ms、最多3次，jitter整數0–250ms；Retry-After delta／日期／無效與超預算明確處理，monotonic deadline與可注入clock／RNG測試；絕不套用於寫入重送 | research.md R3、T006 |
| I2 LOW | 新增最新階段狀態參照與修訂設計入口，原 Plan／Specify 的歷史待審文字不刪不改寫 | spec.md、plan.md、本紀錄 |

**任務變更**：新增0項，總數仍64。補充 T006／T013／T016／T026／T027／T031／T041／T046／T051，T062 的時點註記同步。7階段數量及14項[P]不變；64項皆未勾選。未新增無關功能、資料庫、持久化排序或Google權限管理。

**PlantUML 證據**：使用既有 TEMP/classroomquiz-plantuml/plantuml.jar，執行 `java -jar <existing-jar> -charset UTF-8 -failfast2 -tpng <absolute-002-sequence.puml>`，退出碼0。PNG已檢視並核對分支；最終尺寸2298×3748、220716 bytes、SHA-256 `F7DC0EDF06EEA75E60B0C2B9EBDEE67E6A806DA12957AF9A515E4C4A4122489E`。Component／Class及其PNG未修改，001所有圖保留。

### 重跑 speckit-analyze（唯讀部分完成後記錄）

- 依本地 skill 執行一次 check-prerequisites.ps1 -Json -RequireSpec -RequireTasks -IncludeTasks，FEATURE_DIR 正確為002，必要文件齊備。按需求／場景、模型與HTTP／Access合約、任務依賴／平行、三圖、constitution重新核對；修訂與本節紀錄屬使用者另行授權的文件編輯，不是 Analyze 自動修檔。
- 統計：21 FR＋7 SC共28項皆有任務對應（100%，表示規劃關聯而非測試通過），26驗收場景有驗證路徑；任務64、唯一順序編號64、已完成0、未對應任務0。未解決 CRITICAL 0／HIGH 0／MEDIUM 0／LOW 0；歧義與不必要重複 finding 0。原5項在文件層已處理，不宣稱程式實作已驗證。
- Sheets Access前置仍先於回填；純domain同步fixture可用有效合成Source直接建立Activity，走正式準備服務的fixture必須先組數再完整載入。跨操作防舊回覆／讀取預算均有具體測試工作。人工Cloud／分享與兩份真表的T003／T004／T057–T059保留，沒有改成fake驗收。
- Spec／Plan／Tasks與三圖在邏輯責任及安全分支一致，符合Diagram First設計與後續驗證安排；constitution無新增衝突。文件相對連結、任務格式／路徑／編號及未勾選狀態檢查通過，git diff --check無錯誤；保護路徑diff無001／應用或測試碼／憲章變更。未執行應用／自動化／真實Google測試，未安裝套件、建立憑證、Implement、commit或push。
- Analyze前後extensions.yml不存在，無before_analyze／after_analyze hook。本輪僅修改 spec.md、plan.md、research.md、contracts/http.md、tasks.md、review-record.md、002-sequence.puml及其PNG；data-model／quickstart／其他002圖保持。

**結論與停止點**：未發現仍須修正的技術文件阻擋問題；Tasks最終人工審查仍PENDING，不得視為可直接執行Implement。等待使用者人工審查，真實授權／實作相容性待後續實測。

## 2026-11-18 Setup／Foundation Implement 執行完成

**最新治理狀態**：使用者已於本輪正式接受Tasks最終版並授權僅實作T001–T014，依據見本文件開頭的人工確認節；上述Tasks PENDING為歷史，不能再當目前未核准。US1–US4／Final仍未授權開始，本輪在Foundation完成後停止。

- Feature與分支已確認為002／codex/google-sheets-integration，16/16需求清單未改。T001建立baseline與69檔protected SHA256，原後端實跑73/73通過；T002安裝精確google-auth-library11.3.4並更新backend lockfile，Node24.17.0符合其>=22 engines。僅後端增加此一直接依賴（19個傳遞套件），未安裝前端SDK／googleapis／Drive；當次npm audit 0 vulnerabilities不等於完整安全保證。
- T003／T004 **BLOCKED／人工待辦**：沒有使用者Cloud／key／A/B已分享環境確認，不建立或使用真實Google憑證、不輸出真實ID；真實Token交換／Google讀寫／人工Google驗收 **NOT RUN**。
- T005建立002獨立證據規則；T006／T007先建立unit、實作前因缺模組RED（2個檔案失敗）如實記錄，完成後才勾選。T008／T009新增延遲外置credential驗證／安全Google錯誤分類，既有foundation安全測試7/7通過。
- T010／T011實作SheetsAccess：GoogleAuth僅取Token、固定官方host與scope／field mask、redirect:error、全GRID sparse wire資料／保護參照；讀取100秒總預算／30秒attempt／最多3次與明確jitter及Retry-After；寫入精確單格文字／一次batch／無auth replay或自動重送。未知／拒絕／未送分開，2MiB與不可表示字串在送前拒絕。
- T012提供不同ID／位置／hidden／merge／非GRID與錯誤／保護合成資料、可延遲／先apply後遺失回覆／讀回失敗的fake。T013僅加入app可注入Access及測試runtime，純同步quizFixture改有效合成Source，不改ActivityService準備／Question／Submission／Sync規則，不開始US1的URL準備流程。
- 本機寫入逾時而底層仍未settle時，回UNKNOWN＋IN_FLIGHT，內部whenTransportSettled Promise供後續worker追蹤；實際settle才轉SETTLED，晚到結果不自動改成功。這是research R8既定責任的實作細化，沒有新增業務狀態或改Spec／Plan。後續coordinator仍須維持remote UNKNOWN屏障，不能將settlement當遠端取消。
- T014完成：兩新增unit檔 **29 tests／29 pass／0 fail**；完整 `npm --prefix backend test` **102 tests／102 pass／0 fail／0 skip／0 cancelled**，6252.1927ms、退出碼0，含原73項回歸。所有新Google測試是fake auth／transport；既有HTTP-Socket本機測試不冒充真Google或人工驗收。沒有跑E2E／前端build或Final任務。
- 圖表對照：Foundation僅落實Component／Class的Access與認證邊界，Sequence的無盲重送／I/O外置責任。完整prepare／preflight／snapshot／reconcile尚未實作；本輪未改圖，故不重產PNG。完整實作一致性留T062，不宣稱整體002完成。
- 靜態驗證：69個protected hash全部相同，001文件／舊驗收、前端、原圖及搶答／權限／同步核心不變；git diff --check通過，鎖定版與lock一致，ignore涵蓋env／credentials／key。54候選檔秘密簽名掃描未見真私鑰／Token，前端未引用google-auth-library（非完整秘密稽核）。未commit／push。
- 已勾選 **12項**：T001、T002、T005、T006–T014。T003／T004及T015–T064保持未勾選。詳細執行命令／預期／實際／分層狀態見 tests/records/002-google-sheets-integration/foundation.md、baseline.md、environment.md、live-prerequisites.md；原001紀錄完全保留。
- 完成時extensions.yml不存在，沒有after_implement hook。本輪應用程式新增或修改只在Foundation責任：config／errors／app DI／SheetsAccess／兩個unit檔／fake與runtime、quiz helper／合成fixture，以及backend package／lock／env example／gitignore。沒有URL匯入介面、正式API契約替換、回填coordinator、結果恢復UI或live test runner。

**停止點**：Foundation具備US1離線開發前置，等待使用者下一階段確認；人工Cloud／Service Account／兩份表仍待辦，不能據本輪fake測試宣稱真Google可用。

## 2026-11-18 US1 Implement 授權與前置確認

使用者本輪授權只執行T015–T026；T003／T004仍人工待辦，US2／US3／US4／Final不在本輪範圍。prerequisite確認002、Git分支codex/google-sheets-integration，需求清單16/16，無extensions.yml／before_implement hook。新階段保護hash另存us1-protected.json，不改寫上輪Foundation基準。僅遷移必要測試的準備fixture，原身分／Session／公平assertions不更動，不勾選US2任務。真實Google驗收NOT RUN。

## 2026-11-18 US1 執行結果：T015–T025完成，T026未完成

本輪已完成老師網址匯入、動態來源模型／位置／基準、非破壞性權限檢查、有效組數後原子建立與老師專用來源摘要。正式準備route只接JSON URL、不接multipart；不fetch使用者網址，僅由已驗證ID呼叫既有SheetsAccess。TeacherPage改網址與來源／excluded／未知權限提示，沒有Google登入或Excel選檔／下載按鈕。未建立寫回功能，原Excel helper供歷史測試保留，舊export路由的完整退役仍留US3。

- T015–T025各自範圍驗證通過後已勾選；T026保持未勾選，沒有因局部通過而聲稱US1全部完成。當前總計23項勾選；T003／T004與T027–T064不變。
- 最終US1 parser／HTTP／既有foundation安全測試26/26 PASS（1447.8754ms），前端9/9 PASS（210.2608ms），frontend build PASS（51 modules，152ms），teacher-preparation E2E fake 1/1 PASS（6.3s）。E2E包含局部格式錯誤位置、重試synthetic-B、gid不限制hidden分頁、UNKNOWN／excluded提示、刷新恢復與手動開始。
- 完整 `npm --prefix backend test` 實際117項：109 PASS、8 FAIL、0 SKIP（6985.9329ms）；**不得視為完整回歸通過**。7項group-session測試仍以舊ActivityService.import建立來源，1項restart仍multipart上傳XLSX。原準備前提已退役，未恢復舊流程或放寬assertions。
- 嘗試修改group-session-http.test.js／restart-process.test.js／helpers/process-server.js準備fixture的命令被自動核准審查拒絕，回覆理由僅「blocked by policy」，無更具體原因。命令未執行，這三個檔案diff為空；沒有換工具重試相同變更。相關遷移原在US2 T027／T028，本輪停止擴大工作，等待使用者確認後續範圍。
- 原搶答／權限／Socket／同步裁定程式、001規格與原驗收紀錄及全部三圖不變：US1保護manifest共59檔hash全同。尚不能因核心原始碼未變而宣稱所有回歸均通過；8項缺口如實保留。
- Source模型提供immutable map、動態格址與合併主格；metadata與partial-text／chip限制、已知拒絕／UNKNOWN分流遵循原設計。ActivityService不再有import／validated-source draft，I/O外置，commit前再驗老師身分／ownership／組數，失敗保留組數並釋鎖。原Activity建構子已接受placeholderLocations，無須改其搶答行為。
- 程式新增 guided-notes-source.js、sheets-source-parser.test.js、前端guided-notes.js／guided-notes.test.js；修改placeholder-location.js、GuidedNotesService／ActivityService／store／app組裝、preparation與Notes routes／安全error位置、TeacherPage／api、preparation HTTP／foundation測試與E2E teacher-preparation／test backend DI。詳細命令／分層結果與失敗原因見tests/records/002-google-sheets-integration/us1-fake.md。
- 未改Spec／Plan需求或三圖，無需本輪PNG重產；本階段責任與圖中的prepare時序一致，不代表US2–US4整體實作一致性已完成。未安裝套件、建立／使用真Google憑證、真表讀寫、commit或push；T003／T004及真實Google／人工驗收維持NOT RUN。完成時extensions.yml仍不存在，無after_implement hook。

**停止點**：目前可離線展示US1網址匯入，但T026完整驗證仍未完成。需先確認8項舊測試準備fixture遷移的授權範圍並排除失敗，才能將US1標為完整完成；本輪不進入US2。

## 2026-11-18 T026續行授權與完成紀錄

使用者本輪明確授權在US1 T026範圍內排除剩餘8項舊Excel fixture／準備流程失敗，保留原assertions，不開始US2以後。本輪變更並未再次遭policy拒絕，先前拒絕與失敗紀錄保留歷史，不改稱其當時已成功。Feature／分支確認002／codex/google-sheets-integration。

- 重現：兩檔8項全失敗（7項c.activity.import不存在，1項multipart得400而非201），與前次原因一致。
- 只修改group-session-http.test.js的prepared()為先組數後loadSource並fake DI、restart-process.test.js改JSON URL準備、helpers/process-server.js注入fake；沒有恢復Excel正式流程、刪除或略過測試。原Session／角色／資訊隔離／競爭claim／重啟assertions以hash比對保持，64個應用／圖／001文件hash也不變。
- 遷移後原8項8/8通過；完整backend117/117通過（0 fail／skip，13740.4344ms），frontend9/9通過（457.1775ms），US1相關teacher-preparation E2E fake 1/1通過（16.8s），build成功（51 modules，325ms）。完整指令與預期／實際／輸出見tests/records/002-google-sheets-integration/t026-validation.md及t026-*.txt，不冒稱全E2E套件或真Google驗收完成。
- T026僅在全部上述驗證通過後勾選；目前Setup／Foundation12項＋US1 12項，共24項已勾選。T003／T004人工待辦、T027–T064未開始／未勾選。沒有修改搶答核心或001歷史驗收紀錄，不安裝套件、不建立／讀取私人Google憑證、不commit／push。真Google與人工Google驗收NOT RUN。
- 原三圖不變，本次是測試準備fixture遷移，無需PNG重產。extensions.yml不存在，無before_implement／after_implement hook；git diff --check無空白錯誤，只有LF／CRLF提示。

**最新停止點**：US1含T026離線回歸已完成，具備進US2的前置條件；等待使用者人工確認。本輪授權不是US2開發授權，未以本次測試遷移直接勾選T027／T028。

## 2026-11-18 US2授權及使用者真實讀取回報

使用者本輪授權僅T027–T031，不含US3／US4／Final。Feature確認002、分支codex/google-sheets-integration，checklist requirements16/16，extensions.yml不存在。開始前保存應用與001／舊驗收／圖表hash於us2-protected.json，測試輸出只能寫002。

使用者回報已在本機手動測試真實來源ClassroomQuiz-Test-A：老師顯示6題、成功到第4題WAITING、已載入1個工作表、寫入權限UNKNOWN。記為USER_REPORTED_REAL_READ：屬使用者提供的真實讀取畫面證據描述，本輪未另附圖片檔案可供AI獨立檢視，未推定Spreadsheet ID／實際測試時間／憑證設定。確認日期是本次回報日期2026-11-18，不編造其他測試日期。

此回報不代表寫入權已確認、兩份真表驗收、完整Google API自動測試或T003／T004全部完成；保留UNKNOWN與相關人工／live待辦，AI不讀取私人Google憑證。

## 2026-11-18 US2 T027–T031完成紀錄

本輪使用者授權僅US2。T027–T031皆在實際驗證通過後勾選，目前總29項完成；T003／T004人工待辦及T032–T064維持未完成，沒有開始US3／US4／Final。

- 主要HTTP／lifecycle／Socket整合與E2E fixture改用preparedQuizFixture，先組數、後真來源解析、僅Access為fake。原HTTP／lifecycle／Socket assertions經程式比對保留，只改await準備語法；另加submit-close雙序整合與3種雲端故障案例。group-session／restart延用T026已遷移前提，重新完整驗證。
- T030在已載入活動後注入立即斷線、pending read、pending write；不等Google即可同步開始、提交／拒重複、閉題／拒晚到、下一題WAITING及末題COMPLETED；故障不改已公布結果、student revision或額外呼叫Google。pending write只測Access邊界，不是提前實作US3 worker；真worker並行仍留T053／T054。
- 全E2E 15項保留身分、防占用、資訊隔離、2秒同步、四階段恢復、晚到回覆、遺失提交回覆不重送、原文字與XLSX保真。舊正式Excel按鈕／上傳前提依002改URL與UI無按鈕，舊保真檢查改在歷史download helper／isolated renderer邊界，不恢復UI、不新增Google寫回。所有證據路徑改到002，001原檔hash未變。
- 實際測試：backend **121/121 PASS**（0 fail／skip，7647.5895ms）；frontend **9/9 PASS**（380.8442ms）；全E2E **15/15 PASS**（59.0s，無skip／only）；build **PASS**（Vite8.3.8、51 modules、402ms）。本輪13筆本機同步採樣13–69ms、全部<2000ms；不代表任意環境延遲保證。
- 詳細task／命令／預期／實際／相容性對照與輸出見tests/records/002-google-sheets-integration/us2-regression.md及us2-*.txt、us2-single-question／us2-lifecycle等子目錄。新數量不是沿用001的73／7／14。
- 使用者真實讀取回報另存user-real-read.md：ClassroomQuiz-Test-A六題、第4題WAITING、一工作表、UNKNOWN，狀態USER_REPORTED_REAL_READ。RG-004現在已有這項使用者回報的局部真實讀取依據，但**完整live自動驗收、可寫權限、兩份真表與寫回仍未完成**；不能把本輪fake套件PASS冒充Google成功。本輪沒有另附圖可讓AI獨立檢視，不編造ID／憑證／實際操作日期。
- 應用、原搶答核心、前端、三圖、001歷史共93檔本輪前後hash一致。只改測試／helpers／合成fixture與002文件，未修改憲章或已核准需求；沒有回歸錯誤需要改app。三圖未變，不需重產PNG，後續完整實作一致性仍由T062驗證。
- 無套件安裝、私人憑證讀取、真Google呼叫、commit或push；extensions.yml仍不存在，無after_implement hook；git diff --check通過（既有LF／CRLF提示不是空白錯誤）。

**停止點**：未發現本輪搶答回歸問題，已具備進入US3離線實作的前置條件；等待使用者人工確認，不自動進入US3。UNKNOWN仍不是寫入權保證，真表寫回驗收須另行具備安全環境。

## 2026-11-18 US2人工接受與US3授權

使用者本輪明確接受US2回歸結果並授權T032–T043，記US2 ACCEPTED_BY_USER（確認日期2026-11-18），不編造其他日期或審查者。僅US3、不含US4／Final。Feature／分支為002／codex/google-sheets-integration、需求清單16/16、無extensions.yml／before_implement hook。

T003／T004沿用部分使用者真實讀取回報、完整人工項未完成；本輪不建立或讀取私人Google憑證、不實際寫真表。未知寫入結果必須即保留屏障，US4恢復尚未提供不能成為先盲重送的理由。開始前保護hash另存us3-protected.json。

## 2026-11-18 US3 T032–T043離線完成紀錄

依本輪使用者授權及專案speckit-implement執行，T032–T043均在實際驗證後勾選，共41/64完成。T003／T004仍人工待辦；US4 T044–T054與Final T055–T064未執行／未勾選。此為AI離線實作結果，**尚待使用者US3人工確認**，不得將本輪US2接受解讀為US3已人工通過。

- 新增不可變ClosedWinnerSnapshot、Operation／Item／Attempt、Evidence、SourceConsistency、Coordinator，組裝teacher writeback POST／operation GET與Notes最新操作。快照取閉題最小receiveRank、原活動動態位置；全來源／全部原題及非答案／格式／權限前驗，再Access精確單批，讀回吻合才建立Evidence。Google I/O不進同步裁定，不變更quiz／student revision，不新增學生進度事件。
- 未送／明確拒絕為FAILED；未知／讀回失敗保留原快照與屏障，IN_FLIGHT仍running，沒有盲重送。處理了transport於讀回期間settle的內部狀態同步。US4 reconcile endpoint／UI及完整恢復留待後續，US3基本安全未省略。A-04仍要求活動期間外部不編輯，前驗與寫入不是Google CAS鎖。
- 老師頁四階段手動寫回、逐題／pending／刷新；獨立於quiz busy，每秒只查本機GET、terminal停止。前端Session／activity／epoch／discovery／同ID revision守衛，跨operation不比revision；遺失POST先唯讀找最新操作，不自動POST重送。
- 舊export正式端點先驗權後teacher410；原helper字串／surrogate／workbook fidelity保留，舊HTTP／browser下載前提改退役驗權及新寫回，不恢復Excel流程或降低fairness／安全assertions。
- 最終實測：backend **136/136 PASS**（0 fail／skip，7226.7801ms）、frontend **13/13 PASS**（0 fail／skip，216.2054ms）、全E2E **17/17 PASS**（42.4s）、build **PASS**（51 modules、223ms）。包含兩份合成來源全raw非答案／公式／格式／merge不變，以及真worker等待時仍可下一題／提交／閉題、舊快照排除後閉題、刷新不重送。完整任務／檔案／命令／預期／實際／限制見tests/records/002-google-sheets-integration/us3-fake.md及us3-*.log。
- 61個受保護檔案前後hash相同，含001歷史／原驗收、三圖與PNG、搶答／Session／Socket核心及學生頁；US3責任／模型／時序已對照三圖並記錄，puml不變無需PNG重產。這不是T062最終全Feature驗證。未改已核准需求／圖，未安裝套件、建立或讀取私人憑證、呼叫真Google、commit／push。extensions.yml不存在，無before／after hook；git diff --check通過。
- 真實Google寫入／兩份真表驗收／本輪人工US3驗收仍 **NOT RUN**；先前Test-A使用者局部讀取回報保持原分類，不推定UNKNOWN可寫。現階段人工步驟見us3-manual-write.md，quickstart加最新階段限制，保留Plan歷史。

**停止點**：US3離線驗證完成，未發現既有搶答回歸；具備進US4離線實作前置條件，但等待使用者人工確認與下一輪授權，不自動進US4。完整Google整合尚不可宣稱交付。

## 2026-11-18 US3使用者真實讀寫回報、人工接受及US4授權

使用者本次明確回報在本機以真實Google Sheets完成匯入、搶答、閉題及成功答案寫回原表，確認答案位於預期儲存格。記為USER_REPORTED_REAL_READ_WRITE_SUCCESS，並記US3 ACCEPTED_BY_USER。確認日期為本次對話2026-11-18，未提供實際操作日期／試算表代稱或ID／截圖，不推定或補造。詳細證據邊界見tests/records/002-google-sheets-integration/user-real-write.md。

此回報不是完整Final或兩份真表自動驗收通過；先前US3實作當時NOT RUN保留為歷史，本次僅新增使用者局部真實證據。T003／T004不自動勾選。

本輪僅授權US4 T044–T054，使用專案speckit-implement；Feature及分支確認002／codex/google-sheets-integration，清單16/16，無extensions.yml hooks。受保護檔案hash另存us4-protected.json。不得讀私人憑證／實際Google寫入，不開始Final、不commit／push。

## 2026-11-18 US4 T044–T054離線完成紀錄（待人工接受）

本輪11項在實際驗證後勾選，總52/64完成；僅US4，Final T055–T064未開始，T003／T004保持原人工未完成狀態。使用者US3接受及真實讀寫回報保留上節，**不得推定本輪US4已人工通過**。

- 新增recovery單元／HTTP／E2E，先取得缺reconcile的RED，再實作GREEN。後端同ID reconcile保留原snapshot／attempts／Evidence，完整核對全部原位置／基準，排除明確未送／拒絕的假成功解釋；已驗證答案改值或恢復marker均衝突。所有未送更新在任一衝突時停止，沒有forced overwrite／回滾／自動還原。
- UNKNOWN有殘留marker只讀pending，local settle不當遠端取消；IN_FLIGHT保持running／BUSY。全部舊目標已核對同一不可變文字且local settle，或舊請求可安全排除，才可解除屏障；符合安全條件才在手動reconcile寫剩餘marker。新writeback遇pending回原ID，不摻後閉題。known未送／明確拒絕可安全FAILED，修復後新的明確操作，不背景重試。
- 新增teacher reconcile API與老師按鈕／逐題原因／權限修正提示；刷新只查本機。前端同ID revision及跨ID epoch／discovery守衛，POST回覆遺失先讀Notes，reconcile不自動POST重送，Google401不清Session。E2E已等待晚到A成功或錯誤與舊Notes實際完成再確認B未被覆寫、按鈕／登入未受影響。
- 最終完整backend **153/153 PASS**（0 fail／skip，4930.898ms）、frontend **15/15 PASS**（0 fail／skip，407.4407ms）、全E2E **21/21 PASS**（1.5m）、build **PASS**（51 modules、503ms）。真coordinator在preflight／write／reconcile等待時仍三組公平提交、close競爭及Socket<2秒斷言通過；學生沒有雲端欄位／額外事件或版本改變，舊活動回覆不取得新ownership。
- 詳細逐task、檔案、遠端值／本機狀態／寫入次數／barrier矩陣、命令及限制見tests/records/002-google-sheets-integration/us4-recovery-fake.md與us4-*.txt。部分可見值為fake故障注入，不宣稱Google原子batch部分套用或真網路逾時測過。
- Component／Class／Sequence中互斥、原操作快照、Evidence、讀回／UNKNOWN屏障與本輪實作對應；三圖及PNG未改，無需重產。61/61受保護hash不變，含001／原驗收／三圖／核心Session／搶答／Socket／學生頁。這是US4範圍一致性核對，不代替Final T062。
- 未改001、核心搶答規則、已核准Spec／Plan要求；沒有skip／only／刪測試或降低assertions。未安裝依賴、讀取／建立私人key、呼叫真Google寫入、commit或push。git diff --check通過；extensions.yml仍不存在，無after_implement hook。quickstart追加最新階段說明，不改寫Plan／US3原時點紀錄。

**停止點**：未發現既有功能回歸，已具備進Final階段的程式與離線驗證前置條件；等待US4人工確認及後續授權。完整Final仍需人工環境／兩份真表live與人工驗收、最終文件及圖表與安全檢查，不能以US3局部使用者成功回報或US4 fake通過宣稱全部交付。

## 2026-11-18 US4人工接受及Final授權

使用者本次明確接受US4完成回報，記US4 ACCEPTED_BY_USER（本次確認日期2026-11-18），授權執行T055–T064可離線項目與人工驗收準備。不推定完整Final已接受。私人憑證、真Google寫入、分享切換及最終人工確認須由使用者執行；代理本輪不得使用私人JSON或修改真表，不commit／push。

Feature／分支確認002／codex/google-sheets-integration，requirements16/16且未改清單，extensions.yml不存在。先前user-real-read.md／user-real-write.md維持使用者局部真實證據分類，不擴大為兩表完整驗收。T003／T004未取得逐項完整新證據，保持未勾選。歷史「Final未開始」是前輪狀態，以本節及下方本輪結果為準。

## 2026-11-18 Final離線完成／人工驗收準備（最終接受PENDING）

本輪只執行可離線驗證與人工準備，沒有使用真人JSON或修改真Google Sheets、分享權或Cloud設定，沒有刪key、commit或push。依既有相依順序及本輪「先完成離線／準備」授權，先備妥文件，不假裝真人前置完成。

| Task | 本輪結果／勾選 |
| --- | --- |
| T055 | **完成[X]**：live test／共用驗收helper、package test:live、gate與fake演算法契約。預設test不跑live；需RUN=1、外置key、不同A/B、YES才可由使用者啟用；本輪停用gate 0pass／1NOT RUN skip |
| T056 | **完成[X]**：完整離線backend157／frontend15／E2E21／build通過，獨立3100／5273埠，不停止使用者活動 |
| T057 | **NOT RUN[ ]**：兩份真表實測；live.md具體步驟／驗收條件，需T003／T004真人完整確認 |
| T058 | **NOT RUN[ ]**：分享／protected／撤權人工操作及真API；已備readonly modes與人工案例，不代做 |
| T059 | **PENDING[ ]**：老師三組、兩表、四階段恢復、肉眼比對；manual.md空白表，無代填PASS |
| T060 | **完成[X]（本輪候選）**：worktree／不同index／bundle／XLSX／PNG掃描及邊界複核，0未處理秘密命中；新增真人證據及實際提交前須複查 |
| T061 | **離線文件已更新，未勾[ ]**：README與quickstart吻合實作／真實版本、safe live／重用；依T059／T060仍待真人結果後最後複核結案 |
| T062 | **離線一致性PASS，未勾[ ]**：責任／模型／時序及PNG實際檢視，無需修圖；待T061相依結案後複核，不跳關 |
| T063 | **矩陣已備妥，未勾[ ]**：21FR／7SC／26場景逐一對應、實作／測試／pending證據；依T056–T062尚有真人項，保持整合未完成 |
| T064 | **PENDING[ ]**：提交本輪報告與矩陣供人工驗收，沒有使用者最終接受，不自行核准 |

目前55/64完成，未勾選T003／T004／T057／T058／T059／T061／T062／T063／T064。T061–T063的離線產物完成不等於其相依關卡已接受；保持等待真人證據，非缺少應用實作。

### 實際測試與修正

- backend **157/157 PASS**（0fail／skip，5463.9839ms）、frontend **15/15 PASS**（0fail／skip，254.2343ms）、全E2E **21/21 PASS**（1.0m）、build **PASS**（51modules，139ms）。live僅RUN=0停用gate，**0PASS／1NOT RUN skip**，未讀key／交換Token／連Google。log見final-*.txt，automated.md逐套件說明，不使用001舊數字。
- T055新增tests/live/google-sheets.test.js、helpers/google-live.js、unit/live-gate.test.js；先驗兩份完整標記／不同映射及B hidden／merge，再串行最小rank／字串／重複／保真；一失敗即停止。真人key與寫入僅由使用者自行啟用。支援protected／read-denied唯讀模式，不自動分享或還原。CLI獨立記憶體活動，失敗後不能以重啟或其他UI假裝取消／接管舊未知請求。
- Final追溯補強US4.8：新增source-reuse整合，證明新活動不能沿用已填來源或舊Evidence、無自動還原，人工恢復marker才可讀；TeacherPage與teacher-preparation E2E只補既有還原／複製及重啟不取消提示。不改搶答／身分／Session／Socket規則。沒有新增不相關功能、skip／only或縮減舊assertion。
- 首次live gate子程序輸出受NODE_TEST_CONTEXT影響的test缺陷已以獨立TAP環境修正並全數重跑；不是略過測試。backend僅多4項離線案例，沒有把live skip算作PASS。

### 文件／圖／安全與待辦

- 根README改為002正式Google URL→API→手動原表寫回，001歷史完成連結保留；quickstart提供實際Cloud／SA／分享／環境／啟動／三類測試／錯誤／pending與重用。Spec、Plan、research、data-model及contracts僅加最新階段參照，保留原時點、無需求變更。T003／T004證據檔追加user-real-write局部成功分類，仍未勾選。
- final-acceptance.md已逐列對應21FR／7SC／26場景，標示離線PASS與真人PENDING；SC-007／FR-021未完整驗收。既有使用者真實成功不擴大為兩表／權限／恢復全驗，沒有虛構日期／截圖。
- 三圖邏輯責任與程式一致，PNG本輪開啟檢視；DRAFT／Specify blueprint標籤保留設計時點，不代表Final接受。puml未修改，不重產PNG。61/61受保護檔hash相同，含001歷史／原驗收、搶答／Session／Socket核心及圖；憲章無diff。
- security.md／scan-candidates.mjs／security-scan.json／security-reviewed.json記錄候選工作樹、不同index blob、bundle及fixture／PNG文字掃描。23個非秘密命中是精確blob審閱的合成測試字串與故意損壞fixture，**未處理REVIEW_REQUIRED=0**；不記原文、不打開疑似私檔。6張既有測試截圖已檢視，未見key／Token／管理密碼。這是目前候選檢查，真人新增證據後與實際提交前需再掃，未宣稱外部漏洞審計。
- package.json本輪只加test:live，沒有套件安裝或本輪lockfile變更；Foundation的auth11.3.4既有變更不混記為本輪。git diff --check通過（LF／CRLF提示不屬錯誤），extensions.yml仍不存在，無after_implement hook。

**停止點**：可交付使用者進行最終真人驗收與設定確認；完整Final／可接受GitHub提交版仍PENDING。請依live.md／manual.md自行執行並回報，後續更新證據、依相依順序複核T061–T063、安全重掃及T064明確最終接受後，再評估提交。代理本輪停止，不commit／push。

## 2026-11-18 T058補充受控負向寫入方案授權

依本對話使用者明確批准更新驗收設計與追溯：區分已知DENIED拒絕準備、UNKNOWN警告放行、老師手動正式回填遭拒後保留結果。此為確認日期，不代填原protected實測日期。使用者回報原模式P_EDITABILITY_MISSING／P_EDITABILITY_UNKNOWN、pass0／fail1／exit1；既有protected assertion保留且未通過。API未提供該欄位，不能推定為false；確切省略原因未證實。

新增tests/records/002-google-sheets-integration/t058-negative-write.md並同步live.md、manual.md、final-acceptance.md與T058追溯。已知DENIED真實證據仍缺；補充負向寫入／安全恢復均NOT RUN。使用者未授權豁免K或宣稱全部驗收完成。分類器僅設計提案，沒有新增live mode或修改產品。一般403/404、UNKNOWN、內容未變均不能單獨充當保護拒絕PASS。

本次不改需求與應用架構／三份PlantUML，不涉及新增產品功能或跨組功能變更，不虛構新跨組討論。T058未勾選、總58/64，等待人工審閱與實際執行；不使用憑證、不呼叫真API、不commit／push。

## 本輪離線驗證（2026-11-18）

文件準備後執行既有測試：protected-diagnostics／sheets-access／sheets-source-parser 合計48/48 PASS、fail0／skip0；frontend 15/15 PASS、fail0／skip0；Vite build PASS（51 modules）。git diff --check exit0（只有既有CRLF提示）。未新增／修改測試或產品程式，未重跑完整backend／E2E，不將既有歷史結果列為本輪測試。未執行test:live或真API。tasks實際核對64項、58已勾、T058未勾。

## 2026-11-18 測試層診斷實作（不是真實驗收）

新增 backend/tests/helpers/write-denial-diagnostics.js 與 unit/write-denial-diagnostics.test.js（7項離線測試）。僅供測試注入既有 SheetsAccess fetch seam，沒有修改產品或live runner，沒有新增模式／診斷端點／憑證讀取／真API呼叫。原 protected assertion 不變。

觀察器只在產品消費 text/json 完成後記固定代碼，不主動讀body、不解析或輸出私人錯誤、不複製回應內容、不重試。writeRequests是測試transport呼叫次數，不是遠端已提交證據。固定事件如下：

| 條件 | 代碼 | 證據限制 |
| --- | --- | --- |
| 寫入完整403／404 | N_REJECTED_UNATTRIBUTED | 不區分保護、分享不足、撤權或不存在；不算保護PASS |
| 完整401 | N_AUTH_REJECTED | 認證拒絕類別，不推測具體帳號／憑證原因 |
| 完整429 | N_QUOTA_REJECTED | 限流／配額拒絕類別 |
| 完整400 | N_REQUEST_REJECTED | 請求拒絕，不排除錯誤內容實際涉及保護；不猜原因 |
| 寫入2xx且body完整 | N_UNEXPECTED_ACCEPTED | 僅Google接受，不證明答案已讀回；負向案例停止，意外接受不得算PASS |
| 寫入transport拋錯、body中斷、5xx或其他未辨識status | N_OUTCOME_UNKNOWN | 不分網路／伺服器具體根因，保持原產品pending政策 |
| GET完整成功 | N_READ_COMPLETED | 不證明可寫 |
| GET完整403／404 | N_READ_ACCESS_UNATTRIBUTED | 不能證明撤權、刪除或寫權拒絕 |
| GET其他失敗／body失敗 | N_READ_FAILED（401另用N_AUTH_REJECTED） | 不輸出原始錯誤 |

產品尚未消費body時不產生完成事件。產品逾時後晚到的transport事件不具有更新operation的權力，不能推翻PENDING；必須同時查看原coordinator狀態／transport settlement，診斷本身不提供安全重送授權。tokenProvider在fetch之前失敗時沒有transport事件，不能將空事件推定零權限或成功。

官方核對：Sheets公開錯誤參考沒有在已查文件中提供可依賴的保護專屬機器判準；一般PERMISSION_DENIED不是保護專屬。因此未實作N_PROTECTION_DENIED，也未宣稱能確定區分文件分享不足與保護拒絕。參考 https://developers.google.com/workspace/sheets/api/troubleshoot-api-errors 與 https://developers.google.com/workspace/sheets/api/reference/rest/v4/ErrorCode 。

目前僅完成可安全確認的診斷基礎。沒有接入老師UI測試啟動器；一般dev服務不會載入此helper，也沒有可直接使用的新負向test:live命令。若要求一次真人操作即可取得可信保護歸因及遠端次數，尚不具完整條件。需另行核准測試專用啟動／注入流程及可驗證的保護專屬證據；不能以合併產品碼、任意403或訊息字串猜測補足。T058保留PENDING／58 of 64。

### 本輪完整離線回歸結果

2026-11-18：backend174/174 PASS（新增7個測試，fail0 skip0）、frontend15/15 PASS（fail0 skip0）、E2E21/21 PASS（1.1m，獨立3100/5273埠、fake Sheets）、Vite build PASS（51 modules），git diff --check exit0。輸出保存negative-diagnostic-backend.txt／frontend.txt／e2e.txt／build.txt（同目錄檔名前綴皆negative-diagnostic-）。未執行npm test:live；完整backend既有gate子測試僅在RUN=0且credential／來源變數清空下驗證停用行為，未連Google或讀私鑰。無產品／001／圖表修改、無新依賴、無commit／push。T058仍未完成。

## 2026-11-18 使用者回報：T058-U UNKNOWN警告與正常建立活動 PASS

實際驗收日期與本次確認日期均為2026-11-18。證據來源為本對話使用者文字回報，代理未自行操作／呼叫API，沒有新增或取得截圖。

- 參與組數3；活動WAITING；題目6；納入工作表1。
- 老師端顯示「寫入權限尚未確認」；使用者確認Google Sheets原始標記完整。
- 判定：僅T058-U「UNKNOWN警告與正常建立活動」記USER_REPORTED_MANUAL_PASS，對應FR-006未知權限分支。
- 不證明來源可寫、Google遠端零寫入請求、提交／閉題後行為、保護拒絕歸因或完整Final通過；未提供的細節不補填。
- 保留現有活動，尚待正式手動負向寫入與恢復。K已知DENIED真實證據仍缺；N拒寫安全行為／讀取撤權／R修權恢復仍待驗。T058整體未完成，總58/64，無任務勾選變更。

## 2026-11-18 T058-2 使用者回報：失敗後資料保留 PASS

使用者回報實際日期2026-11-18：老師手動寫回一次後顯示「寫回未完成」；後續確認訊息「Google Sheets 暫時無法使用，請稍後再試」，Q1顯示未寫入。兩組有效答案與順位1／2均保留，老師Session有效，活動仍第1題RESULTS，原始{{Q1}}未變。使用者另按一次「重新取得寫回狀態」，畫面未變。

僅將「失敗後活動、答案、順位與Session保留」記USER_REPORTED_MANUAL_PASS。一般錯誤不證明Google已收到或拒絕寫入，也不歸因保護範圍；原標記未變不證明舊請求安全結束。尚未提供本機GET的status／running／canReconcile欄位，未自行記錄其實際值。原protected已知DENIED真實證據仍缺，恢復／讀取撤權仍待驗。T058未完成，58/64不變。代理僅更新紀錄及唯讀分析，未執行API／寫回／reconcile／重啟／測試、未讀私鑰、未commit／push，無截圖或其他細節補造。

## 2026-11-18 T058-3 修復權限後安全恢復：USER_REPORTED_MANUAL_PASS

使用者提供實際驗收日期2026-11-18：原operation確認FAILED、running=false、canReconcile=false；保留同一活動，使用者移除專用測試表Q1答案格保護，再由老師明確點一次寫回。老師端顯示成功，原表Q1為順位1完整答案、順位2未覆蓋，其他未完成題目保留標記；兩組答案、順位與老師Session均保留。僅保存必要題號，不記私人來源／座標／帳號。未提供截圖，不補造。

本子情境記USER_REPORTED_MANUAL_PASS，對應FR-018／US4.7恢復證據；補充先前尚未提供的原operation狀態。T058-1／2／3子情境已依使用者回報通過，不推定完整T058或Final通過。先前存取錯誤仍未歸因保護專屬拒絕；原protected MISSING／UNKNOWN失敗歷史與已知DENIED真實證據缺口保留。T058整體PENDING，58/64不變。下一個全新副本read-denied案例NOT RUN；代理未執行真API、讀key、改表、重啟、commit或push。

## 2026-11-18 T058-4 撤銷讀取存取：USER_REPORTED_LIVE_PASS

實際日期2026-11-18。使用者確認已對全新專用測試副本撤銷Service Account讀取存取，執行GOOGLE_LIVE_MODE=read-denied，回報：

```text
✔ Google Sheets real API acceptance
A read-denied safe error observed; this does not prove known write denial
tests 1
pass 1
fail 0
skipped 0
Read-denied test exit code: 0
```

證據分類USER_REPORTED_LIVE_PASS，對應T058讀失敗安全錯誤／FR-018；並非代理獨立執行。現有runner只GET A，B僅配置檢查，該分支不寫A/B；這是程式路徑核對，不捏造遠端請求監控。使用者撤權操作加真實安全錯誤支持此子情境，不由錯誤碼單獨推定撤權／不存在，不證明保護範圍專屬拒絕。原protected P_EDITABILITY_MISSING／UNKNOWN失敗保留。

### 最新T058證據總表（覆蓋先前NOT RUN快照的狀態，不改寫歷史）

| 子情境 | 最新證據／狀態 | 限制 |
| --- | --- | --- |
| T058-1 UNKNOWN警告與活動建立 | USER_REPORTED_MANUAL_PASS | 不證明可寫或遠端零寫入請求 |
| T058-2 失敗後活動／兩組答案順位／Session保留 | USER_REPORTED_MANUAL_PASS | 前置讀失敗與遠端寫拒絕無法由一般錯誤區分；不宣稱保護專屬拒絕 |
| T058-3 FAILED安全結束後同活動修權手動恢復 | USER_REPORTED_MANUAL_PASS | 原FAILED/running=false/canReconcile=false有使用者確認；不將舊錯誤追認為保護拒絕 |
| T058-4 撤讀權安全回報 | USER_REPORTED_LIVE_PASS | live pass1 fail0 skip0 exit0；不證明已知寫拒絕 |
| K：真實已知DENIED拒絕準備 | NOT VERIFIED，原protected實測FAIL | requestingUserCanEdit缺失維持UNKNOWN；不以離線測試冒充真實證據 |
| N：Google明確拒寫且保護專屬歸因／精確遠端無重送 | NOT VERIFIED | 現有老師畫面／合併錯誤碼不足；T058-2只是安全行為PASS |
| 真實結果未知／逾時及原operation核對 | NOT RUN | 任務要求只記實際發生，不要求為湊證據刻意製造；離線回歸證據另列 |

T058整體PENDING，仍58/64。沒有尚未執行卻補記PASS的項目。可選的後續安全補強是：保留原表與程序，對同一撤權新副本由使用者恢復分享，再以另一次明確只讀觀察驗可讀；或在隔離場次驗準備讀失敗無半場活動。這些不是現有read-denied已驗內容，也不能填補K／N專屬證據缺口；不需重跑已通過案例或動T057證據表。

### 正式結案提案，等待人工批准，未執行

可提出有明確限制的驗收偏差／證據接受紀錄：產品FR-006明確false才DENIED、UNKNOWN警告、FR-018結果保留及UNKNOWN不重送均不變；原protected assertion及失敗保留。人工決定是否接受K在本環境無可觀測真實證據、N歸因未證，而以分開標示的離線分支測試與上述真實行為證據滿足T058驗收範圍。若批准，才同步T058驗收文字、final-acceptance矩陣FR-006／FR-018／US4.7（及其餘受影響行）、live/manual及review-record，先依SpecKit Analyze檢查跨文件一致性，再由人工明確接受。這是證據範圍例外，不是把K或N改成PASS，也不豁免產品安全規則。若不接受此例外，T058保持PENDING／BLOCKED於真實證據取得，不能自行勾選。圖表架構不變；若另改產品需求／操作流程，須重新依constitution處理跨組討論與設計審查。T059與Final其他任務仍須獨立完成。

本輪只讀文件／任務並更新必要紀錄，未修改tasks狀態、產品／測試判準／001文件，未執行測試／真API、讀憑證、改表、commit或push。

## DA-T058-01正式文件修訂與有限證據內部接受（2026-11-18）

使用者於本輪明確批准採有限驗收證據／偏差接受；不是課程助教或跨組已核准此偏差。依四項已保存的實際PASS、原FAIL及NOT VERIFIED／NOT RUN限制，更新spec／plan驗收參照、T058任務說明與live／manual／final矩陣。完整版本化條件見../../tests/records/002-google-sheets-integration/t058-negative-write.md頂部。原任務文字要求已知不可編輯拒絕準備及活動後拒寫；本次只接受其真實可觀察安全行為與明列的未驗證例外，不變更產品或原assertion。

修訂後條件已達成，T058勾選，59/64；不是所有負面Google分支PASS，完整Final仍未接受。T059不在本輪執行範圍。接續執行唯讀speckit-analyze；若有HIGH／CRITICAL須先報告，不得藉勾選宣稱無阻擋。沒有憑證／API／程式／測試／001／圖表修改、沒有commit或push。

## T059-A WAITING子階段：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19。實際測試日期未另提供，不將確認日期推定為操作日期。證據為本對話使用者文字回報，未提供或補造截圖。

- T058舊活動已安全結束；T059-A／B為不同ID的乾淨專用副本。
- T059-A匯入成功並設定三組；三組使用獨立瀏覽器身分加入。
- 老師及三組學生四個視窗皆Q1 WAITING；各自F5後身分與活動狀態保留。
- 四個視窗分別完成Offline → Online真實斷線及重連。
- 使用者確認T059-A原始標記完整。

僅將上述A表WAITING子階段記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的WAITING身分與狀態恢復部分，以及來源準備的局部人工證據。不推定未回報的題數／工作表數／同步毫秒數、晚加入、禁止提交、其他三階段、寫回保真或B表完整驗收。B表人工結果仍NOT RUN，T059後續子階段未完成。原表格較廣條件仍須逐項補證，本段為已完成範圍的最新依據，不將整列其他子條件自動PASS。

T059整體PENDING，59/64不變。原先T059未開始為歷史狀態，現在已開始但未完成。本輪僅更新必要紀錄，未修改產品／測試／001／任務勾選，未執行測試或真API、未讀憑證、未commit／push。

## T059-A ANSWERING子階段：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報，未提供或補造截圖。

使用者確認以下七項均通過：

1. 老師與三組學生共四個視窗全部進入ANSWERING。
2. 第2組提交順位1、第1組順位2、第3組順位3。
3. 重複提交無法覆蓋既有答案。
4. 學生端看不到其他組未公布資訊。
5. 四個視窗F5後，身分、提交狀態及活動狀態正確。
6. 四個視窗確實斷線並重新連線成功。
7. 老師端保持ANSWERING，沒有提前閉題。

僅將T059-A ANSWERING上述範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的順位、提交保護、公布前資訊隔離及ANSWERING身分／狀態恢復部分。保留既有T059-A WAITING證據；不補造答案文字、同步延遲數值、操作方式或其他未回報細節。未回報的空白提交拒絕、RESULTS／COMPLETED、寫回及保真等仍待各自驗收；不將A表結果套用至B表，B表人工驗收仍NOT RUN。

T059整體PENDING，59/64不變。本輪只更新必要驗收紀錄，未修改產品／測試／001／任務勾選，未執行Google API或測試、未讀憑證、未commit／push。

## T059-A RESULTS子階段：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報，未提供或補造截圖。

使用者回報：

- 老師關閉Q1後，老師與三組學生共四個視窗均進入RESULTS。
- 第2組仍為順位1；三組原始答案與順位保持不變。
- 學生無法在閉題後新增或修改Q1答案。
- 學生看不到老師專用Google Sheets寫回控制。
- 四個視窗F5後，RESULTS、身分及答案保持正確。
- 四個視窗均實際斷線並成功重新連線。
- 使用者觀察Google Sheets Q1仍為{{Q1}}，沒有提前寫回。

上述T059-A RESULTS範圍記USER_REPORTED_MANUAL_PASS，對應FR-008／SC-005閉題與RESULTS恢復、FR-007老師專用控制的UI隔離，以及FR-009手動寫回的人工觀察部分。標記未變不單獨證明遠端寫入請求數為零；看不到控制不替代後端驗權測試。保留WAITING及ANSWERING既有證據，不補造答案內容、同步延遲、額外測試或截圖。

T059整體PENDING，59/64不變。COMPLETED、後續手動寫回／重複／衝突／保真與其他未回報項目仍待獨立驗收；A結果不延伸至B，B人工驗收仍NOT RUN。本輪僅更新必要驗收紀錄，未修改產品／測試／001／任務狀態，未呼叫真實Google API、未讀憑證、未commit／push。

## T059-A 後續題目與COMPLETED：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據來源為本對話使用者文字回報；未提供或補造截圖。

使用者回報：

- Q1 RESULTS正常進入Q2 WAITING。
- Q2搶答順位及閉題結果正確。
- Q3至Q6均正常進行及閉題，活動正式進入COMPLETED。
- 老師與三組學生共四個獨立瀏覽器視窗，F5後完成狀態及身分均保留。
- 四個視窗實際斷線並成功重連。
- 使用者觀察Google Sheets原始標記沒有被提前寫回。

上述T059-A範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的下一題WAITING、後續題目／末題完成及COMPLETED身分／狀態恢復，與FR-009無提前回填的人工觀察。標記未變不單獨證明遠端寫入請求數為零。不補造各題答案、順位細節、無人題／特殊文字案例、同步延遲或其他未回報結果。保留WAITING、ANSWERING、RESULTS既有人工證據。

T059整體仍PENDING，59/64不變。A表手動寫回／重複／衝突／保真與其餘未回報項目仍待獨立驗收；不將A表結果套用至B表，B表人工驗收仍NOT RUN。本輪僅更新必要驗收紀錄，未修改產品／測試／001／任務勾選，未呼叫真實Google API、未讀憑證、未commit／push。

## T059-A 第一次寫回與來源保真：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際操作日期未另提供，不推定為確認日期。證據為本對話使用者文字回報，未提供或補造截圖。

使用者回報：

- 老師端顯示SUCCESS（保留使用者用語，不推定為原始API狀態欄位值）。
- 所有有有效提交的題目均正確寫入順位1的完整答案。
- 無有效提交的題目保留原始標記。
- 非答案儲存格與公式定義不變。
- 底色、框線、字型、合併範圍及結構不變。
- 老師端答案、順位與Session仍完整保留。

僅將T059-A第一次寫回與上述來源保真範圍記USER_REPORTED_MANUAL_PASS，支持FR-009／010／013／014、SC-002的相應人工觀察。未補造各題答案文字、實際提交題號、未提供的API回應／讀回log、特殊文字案例、逐格截圖或遠端請求監控。此回報不證明零遠端重送／精確請求次數，亦不代表後續重複寫回／外部衝突已驗收。

保留WAITING、ANSWERING、RESULTS、COMPLETED既有證據，不將A結果套用至B表。T059整體PENDING，59/64不變；其餘人工項目仍待各自證據。本輪僅更新必要紀錄，未修改產品／測試／001／任務勾選，未執行真實API、未讀私人憑證、未commit／push。

## T059-A 重複寫回：USER_REPORTED_MANUAL_PASS

本次確認／紀錄日期2026-11-19；實際測試日期未另提供，不推定為確認日期。依本對話使用者回報：第二次操作成功／顯示無需更新，已寫答案辨識為略過，沒有新的待更新題目；Google Sheets答案與非答案內容、公式、格式及合併結構均未改變；老師端答案、順位及Session保留。僅上述範圍記USER_REPORTED_MANUAL_PASS，支持FR-011／015及US4.1的同活動重複辨識，不擴大宣稱遠端零重送或實際請求數。未提供最新operation的status/running/canReconcile，尚未據此確認可重啟換場。

保留A四階段、第一次寫回與保真證據，不套用至B。T059整體PENDING，59/64不變；外部衝突及其他未回報項目仍待驗。B-1僅準備，未執行。代理僅更新紀錄及唯讀核對單活動／操作狀態，未重啟、改表、執行API、讀私鑰、修改產品／001／任務勾選、commit或push。

## T059-B WAITING：USER_REPORTED_MANUAL_PASS（摘要回報，明細未齊）

本次使用者確認／紀錄日期：2026-11-19；實際測試日期：待補。使用者明確要求將B-1通過的摘要記USER_REPORTED_MANUAL_PASS；此分類只代表使用者摘要結論，不代表下列未確認事項均已PASS。未提供截圖，不補造。

| 欄位 | 使用者提供的實際狀態 |
| --- | --- |
| A最後操作status／running／canReconcile | 三項皆待補；不得推定安全終態 |
| 確認安全後後端重啟 | 待補；不得推定已重啟或確認無pending |
| B不同spreadsheetId | 待確認 |
| B Q1～Q6乾淨原始標記 | 待確認 |
| B與A不同儲存格映射 | 待確認 |
| B hidden工作表 | 待確認 |
| B merge合併儲存格 | 待確認 |
| Service Account Editor權限 | 待確認 |
| B題數／納入工作表數／權限提示 | 三項皆待補 |
| 三組分別1／2／3 | 使用者摘要回報B-1通過；個別結果待確認 |
| 四視窗WAITING、無法作答 | 使用者摘要回報B-1通過；個別結果待確認 |
| 四視窗F5 | 使用者摘要回報B-1通過；個別結果待確認 |
| 四視窗實際斷線重連 | 使用者摘要回報B-1通過；個別結果待確認 |
| B原標記完整 | 使用者摘要回報B-1通過；獨立確認結果待補 |

保留A表既有證據，不以A結果填入B欄位。B-1摘要PASS不解除安全換場資訊缺口，亦不表示B題數固定為6或其他前提已確認；完整矩陣仍待補證。T059整體PENDING，59/64不變，其他B階段未驗收。本輪僅更新必要紀錄，未修改產品／測試／001／任務勾選，未操作真實API／試算表／服務、未讀憑證、未commit／push。

## T059-B ANSWERING：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報；未提供或補造截圖。

使用者確認以下七項均通過：

1. 老師及三組學生共四個視窗都進入Q1 ANSWERING。
2. 第3組提交順位1、第1組順位2、第2組順位3。
3. 重複提交不能覆蓋既有答案。
4. 學生端資訊隔離正確。
5. 四個視窗F5後身分及活動狀態保留。
6. 四個視窗確實斷線並成功重連。
7. 老師端保持ANSWERING，沒有提前閉題。

僅上述T059-B ANSWERING範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的順位、重複提交保護、學生資訊隔離及ANSWERING身分／狀態恢復部分。不補造答案文字、刷新後提交狀態細節、同步延遲、空白提交測試或其他未回報結果。保留T059-A全部既有證據。B-1摘要PASS及其實際日期、安全換場／來源條件等待補欄位仍待補，本階段回報不追認或填補這些缺口。

T059整體PENDING，59/64不變；B其餘未回報階段與完整Final仍未驗收。本輪僅更新必要人工紀錄，未修改產品／測試／001／任務勾選，未自行執行Google API、未讀憑證、未commit／push。

## T059-B RESULTS：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報；未提供或補造截圖。

使用者確認以下七項通過：

1. 老師關閉Q1後，老師及三組學生四個視窗都進入RESULTS。
2. 第3組保持順位1、第1組順位2、第2組順位3，三組答案不變。
3. 閉題後學生不能新增或修改答案。
4. 學生看不到老師專用寫回控制。
5. 四個視窗F5後，RESULTS、身分、答案及順位保留。
6. 四個視窗確實斷線並成功重連。
7. 使用者觀察B表原始標記以及hidden／merge結構沒有變動。

僅上述T059-B RESULTS範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005閉題與RESULTS恢復、FR-007老師控制的UI隔離及原標記／結構未變的人工觀察。看不到控制不替代後端驗權測試，標記未變不單獨證明遠端零寫入。本次hidden／merge未變觀察不追認B-1尚未確認的來源映射、標記所在hidden／merge條件或其他待補欄位。未補造實際答案、同步延遲或其他測試細節。

保留A表全部已完成證據，以及B表WAITING摘要及ANSWERING紀錄；B-1詳細欄位維持待補。T059整體PENDING，59/64不變，其餘未回報階段及完整Final仍未驗收。本輪僅更新必要紀錄，未修改產品／測試／001／任務勾選，未執行真實Google API、未讀私人憑證、未commit／push。

## T059-B 後續題目與COMPLETED：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據來源為本對話使用者文字回報，未提供或補造截圖。

使用者回報：

- Q1 RESULTS正常進入Q2 WAITING，Q1答案及順位保留。
- Q2第1組為順位1，閉題結果正確。
- Q3至Q6都正常完成並保留搶答結果。
- 老師與三組學生共四個視窗正式進入COMPLETED。
- 四個視窗F5後，身分、答案及COMPLETED狀態保留。
- 四個視窗確實斷線並成功重連。
- 使用者觀察T059-B原始標記、hidden／merge、公式及格式均未提前變更。

僅上述T059-B範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的下一題WAITING、後續搶答／閉題及COMPLETED恢復，並保存原標記／結構／公式／格式未提前變更的人工觀察。未變觀察不證明遠端請求數為零，亦不追認B-1不同ID、不同映射、hidden／merge標記所在位置、Editor等尚待補欄位。未補造Q3至Q6各題答案／順位、同步延遲、特殊文字或未執行案例。

保留T059-A全部既有證據及B表WAITING摘要、ANSWERING、RESULTS紀錄。B-1詳細欄位繼續待補。T059整體PENDING，59/64不變；B手動寫回／重複／保真、外部衝突及其他未回報項目仍待各自驗收。本輪僅更新必要人工紀錄，未修改產品／測試／001／任務勾選，未自行操作真實Google API、未讀憑證、未commit／push。

## T059-B 首次真實寫回與來源保真：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報；未提供或補造截圖。

使用者確認以下八項全部通過：

1. 老師端顯示SUCCESS，操作已結束（保留使用者用語，不推定未提供的原始operation欄位值）。
2. Q1正確寫入第3組順位1的完整答案。
3. Q2正確寫入第1組順位1的完整答案。
4. Q3至Q6正確寫入各題順位1的完整答案；無有效提交者保留原始標記。
5. 不同工作表及儲存格映射正確，沒有寫入錯位。
6. 隱藏工作表仍隱藏，合併儲存格主格及合併結構正確。
7. 公式、非答案內容、字型、底色、框線全部不變。
8. 老師端活動、答案、順位及Session完整保留。

僅上述T059-B首次真實寫回與來源保真範圍記USER_REPORTED_MANUAL_PASS，支持FR-004／005／009至014及SC-002的相應人工觀察。未補造答案文字、Q3至Q6各題勝出組別或實際無人題號、API回應／讀回log、遠端請求數或截圖。寫入位置及hidden／merge的本次觀察不追認或補填B-1安全換場、不同ID、來源前置等待補詳細欄位。未宣稱遠端零重送或B重複寫回／衝突已通過。

保留T059-A全部既有證據及B表WAITING摘要、ANSWERING、RESULTS、COMPLETED紀錄；B-1未齊欄位仍待補。T059整體PENDING，59/64不變，其餘人工項目仍待各自證據。本輪僅更新必要人工紀錄，未修改產品／測試／001／任務勾選，未自行執行Google API、未讀私人憑證、未commit／push。

## T059-B 重複寫回：USER_REPORTED_MANUAL_PASS；T059證據審查

本次確認／紀錄日期2026-11-19；實際測試日期未另提供，不自行推定。使用者回報七項通過：首次操作已SUCCESS且無running／pending；第二次成功或無需更新；已寫答案全部略過；無新增待寫目標；B答案與非答案內容不變；公式、hidden／merge、字型、底色、框線不變；老師活動、答案、順位及Session保留。上述記USER_REPORTED_MANUAL_PASS，不補造原始operation欄位、截圖、遠端傳輸次數或零寫入證據。保留A全部與B四階段、首次寫回／保真證據。

### 原始T059要求／證據／狀態

依tasks.md T059、quickstart第6–8節、原manual表格審查，不新增產品要求或把26場景都擴成必須重跑真實人工測試。

| 要求 | 已有證據 | 狀態／缺口 |
| --- | --- | --- |
| 老師＋三組、兩份真表完整活動 | A/B各ANSWERING、RESULTS、COMPLETED回報，A WAITING詳細、B WAITING摘要 | 行為已人工PASS；B來源／換場詳細仍待補 |
| 四階段刷新／實際斷線重連 | A四階段與B ANSWERING／RESULTS／COMPLETED詳細PASS，B WAITING摘要PASS | 不重測已確認部分，B WAITING個別明細待確認 |
| 順位／重複提交／閉題／資訊隔離 | A Q1組2/1/3、B Q1組3/1/2；閉後拒答、下一題及末題完成回報 | 已報範圍人工PASS；空白提交／2秒等原manual細項尚無明確人工回報 |
| 手動回填閉題最快完整答案 | A/B首次寫回及多階段無提前改marker | 已報範圍人工PASS；未把UI訊息等同額外原始API監控 |
| 同活動重複寫回、已寫值不誤報缺題 | A重複PASS、本次B重複PASS | USER_REPORTED_MANUAL_PASS，不證明遠端零寫入 |
| 人工衝突提示並保留外部值 | 只有離線US4／E2E衝突測試，沒有本次人工衝突回報 | NOT RUN，原T059明列，不能用fake或T058授權失敗替代 |
| 肉眼來源保真 | A/B公式、非答案、字型／底色／框線／merge／結構及hidden回報 | 已報範圍人工PASS；非答案rich text、行列尺寸與等號／Unicode／換行的人工觀察未明確回報 |
| 無人題／特殊文字及未閉題不動 | T057真API驗無人Q2、未閉Q3、等號／Unicode／換行；T059回報無有效提交者保marker | 可引用T057真API證據；本次是否實際有無人題／特殊文字及UI人工觀察仍待確認，不能虛構題號 |
| 舊寫安全結束後換場至新乾淨來源 | B-1 A最後status/running/canReconcile、重啟及ID／乾淨來源等皆待補 | 必要紀錄缺口；B後續成功不追認A換場時已安全 |
| 日期／實際步驟與結果留存 | 各次對話文字、確認日2026-11-19 | 實際操作日期待補，可按階段或期間提供，不需截圖／秘密 |
| 異常恢復／pending | T058真實失敗保留與FAILED安全修權恢復已PASS；真逾時pending未觸發 | T059不新增必須製造真逾時；維持NOT RUN，原DA-T058-01限制保留 |
| 其餘manual細項 | 多頁籤／晚加入、2秒／雲端不可用等有離線證據 | 不冒充本次人工PASS；請先補既已做過的觀察，未做記NOT RUN，不自行新增別的權限失敗套件 |

### 最少補齊方向（本輪僅建議，不執行）

先補記實際日期、B新副本不同ID／不同映射／hidden標記／merge主格／Editor、題數／納入分頁／權限提示與四視窗WAITING明細，及A最後狀態與實際安全重啟換場。只記實際已知資料；若A操作已因重啟丟失且無當時記錄，明列NOT VERIFIED，不能用現在B狀態回填。

人工衝突是明列必要案例：保留目前B活動，僅在本機查明最新operation為SUCCEEDED、running=false、canReconcile=false且無其他操作後，使用者在專用B已寫Q1手動改成明顯合成外部文字，再明確按一次寫回；預期顯示CONFLICT及位置／原因，外部值不被覆蓋、其他格及活動答案／rank／Session保留。不自動還原／強制覆寫。以上僅準備，需人工安全確認後自行執行。原manual含A/B逐表對照，A衝突亦未回報；不能以B衝突推定A已測。A原活動若已清除，後續需另備乾淨A補充場次最少一題寫回後驗衝突，或另行明確審查接受證據範圍，不能自行免除。

原manual其他未明確回報項目先請使用者確認是否已做；未做項目維持NOT RUN並依原範圍安排最小補驗或人工審查，不能因本次兩表主要流程通過自動抹除。T058不要求在T059再跑一套權限／真逾時；不新增未規劃的自動還原、持久化或壓力測試。

結論：目前不建議正式結案，至少必要安全換場／B-1資料與人工衝突證據仍缺；其他原manual細項需確認適用證據範圍。T059未勾選，59/64不變。本輪只更新驗收紀錄及唯讀審查，未修改產品／測試／001、未操作真API／讀憑證、未commit／push。

## T059最終人工確認與結案評估（確認日期2026-11-19）

證據來源為本對話使用者親自操作後的最終文字確認，記USER_REPORTED_MANUAL_PASS；實際操作日期未明確提供，維持待補，不以文件日期代替。不新增截圖、ID／座標／答案私人內容或API監控。

使用者明確確認：A/B為不同spreadsheetId專用表；老師與三組獨立身分完成兩份六題活動；四階段正確，各階段四視窗刷新後身分／題目／答案／順位保留且真實斷線重連成功；三組提交順位、重複保護、資訊隔離、閉後拒改與下一題均正確；兩表首次寫回均為各題順位1完整有效答案，無有效提交者保marker；兩表重複寫回略過、內容不變；兩表非答案內容／公式／字型／底色／框線／合併／分頁結構正確；B不同格址映射、hidden與merge主格正確。B-1現有使用者確認PASS，不再僅依早先摘要判斷其整階段未確認；但原始題數欄位、分頁數、權限提示、Editor及換場細節未回報者不回填。最新「兩份六題」另存為本次證據，不冒稱早先B-1題數當時已記錄。

使用者另確認已親自補做外部修改衝突：系統正確提示衝突，外部值未覆蓋，老師活動／答案／順位／Session保留。此情境USER_REPORTED_MANUAL_PASS；未提供來源A或B、修改格、畫面細節或是否兩表各測，不推測。原T059任務要求有人工衝突驗收，沒有明訂所有衝突種類或兩表各自重複驗一次；本次足以支持這項任務層要求。原逐表人工表的A/B衝突歸屬仍NOT VERIFIED，不得逐表填PASS；不另增加雙表衝突重跑作為新硬性條件。

### T059完成條件最終對照

| 原始要求 | 最終證據 | 判定 |
| --- | --- | --- |
| 兩份不同真表＋老師三組完整活動 | 本次明確兩表不同ID、六題、獨立身分；既有逐階段回報 | USER_REPORTED_MANUAL_PASS |
| 四階段刷新及真斷線重連 | 本次逐階段四視窗狀態／答案／順位恢復確認 | USER_REPORTED_MANUAL_PASS |
| 提交順位／隔離／閉題／下一題 | 本次與既有A/B階段回報 | USER_REPORTED_MANUAL_PASS |
| 手動回填最快完整答案、無人保marker | 本次與A/B首次寫回回報 | USER_REPORTED_MANUAL_PASS，不補題號或零請求結論 |
| 同活動重複辨識略過 | 本次與A/B第二次寫回回報 | USER_REPORTED_MANUAL_PASS，不證明遠端零重送 |
| 衝突提示、不覆外部值、資料保留 | 本次親自操作確認 | 任務層USER_REPORTED_MANUAL_PASS；A/B逐表歸屬NOT VERIFIED |
| 肉眼來源保真／B動態mapping hidden merge | 本次與既有首次寫回回報 | 已確認範圍USER_REPORTED_MANUAL_PASS |
| 先確認舊請求無晚到風險才換新來源／重測 | 早先A結束後第二次成功，但B-1明列最後operation／安全重啟情形待補；本次未確認此安全前提 | NOT VERIFIED，仍為原T059完成條件缺口 |
| 真實日期與紀錄 | 確認日已記，各階段操作日期未明確提供 | 日期待補，不自行推定 |

### 原人工表其他細項的證據邊界

| 原人工表細項 | 可引用的既有證據 | 本次人工狀態 |
| --- | --- | --- |
| WAITING無法作答、晚加入 | B-1PASS總結／離線phase與late-join測試；A早先未單獨回報禁止提交 | 未明確逐項確認部分NOT VERIFIED，不由總結補PASS |
| 空白提交拒絕／正常連線2秒內同步 | 原離線單元／整合／E2E有證據 | 本次兩表人工NOT VERIFIED，不改產品判準 |
| 同身分多頁籤／失效Session重新確認／不重送 | 原離線身份／late-reply測試 | 未明確人工確認者NOT VERIFIED |
| 實際無人題／等號／Unicode／換行逐字型別 | T057真API有專用斷言；本次無有效提交者保標記為一般確認 | 本次人工具體案例NOT VERIFIED，不借T057冒充T059人工 |
| 非答案rich text、行列尺寸 | T057 API保真及既有離線；像素尺寸不由API證明 | 本次未明確人工觀察者NOT VERIFIED |
| 雲端不可用仍可搶答 | 原sheets-quiz-independence／E2E離線，T058失敗保資料 | 本次真雲端故障下搶答NOT VERIFIED |
| 真逾時／結果不明／pending reconcile | DA-T058-01有限證據與既有離線異常測試 | NOT RUN；不新增刻意觸發要求 |
| 新場次安全重用／舊Session失效 | T059換場行為摘要但當時安全確認未提供，離線restart/reuse另列 | 真實安全前提仍NOT VERIFIED；不能以離線取代 |

上述細項保留原狀態供T063整體追溯審查，不能將T059主要流程PASS等同所有FR／SC與manual所有列PASS；不新增原任務沒有的測試套件。DA-T058-01與原protected FAIL完整保留，不擴大其偏差接受範圍至T059換場。

### 本輪結論與最少補充

T059暫不勾選，59/64不變。主要操作與人工衝突已有足夠使用者證據；安全換場仍缺明確確認。請只補實際事實：切換A到B之前，是否已確認A最後操作結束、無running／pending且沒有未解的晚到請求風險，再換來源？不要求重建舊UUID或捏造精確欄位；若無法回憶／無當時證據，明列NOT VERIFIED並另行審查，不用現在結果反推。另可補操作日期／期間及已實際做過的manual細項；未做維持NOT VERIFIED。T060既有狀態與安全證據不重做／不改；T061仍受T059依賴阻擋，T062待T061、T063待T056–T062、T064待T063與最終人工接受。未開始T061。

接續唯讀speckit-analyze；本段只記錄結案評估，不聲稱分析尚未執行就通過。本輪未修改產品／測試／001、未操作真API或讀私鑰、未commit／push。

## T059安全換場確認：E1證據已補齊（2026-11-19確認）

使用者明確確認當時實際操作：切換T059-A至B之前，已確認A最後一次Google Sheets寫回完全結束、沒有進行中running、沒有PENDING_VERIFICATION、沒有尚未排除的結果不明或晚到寫入風險，確認安全後才換場。此為對當時事實的USER_REPORTED_MANUAL_PASS，不是依B後續成功反推。

原HIGH E1所指安全換場證據缺口已補齊。僅記確認日期2026-11-19；實際操作日期待補，不補造operationId、精確status／running／canReconcile欄位值、時間戳、重啟方式或截圖。原先缺證與HIGH評估保留為歷史，最新狀態以上述確認為準。

結合既有兩份不同ID專用真表、老師三組六題、四階段刷新與實際重連、順位／重複提交／隔離／閉題／下一題、兩表首次及重複寫回／保真、B mapping／hidden／merge主格、人工外部衝突保留外部值與活動資料，原T059任務層必要行為均已有使用者實際確認。衝突的A/B歸屬／修改格未提供，不能填成兩表獨立衝突PASS；遠端零重送未驗證。

未提供的分頁數／權限提示／Editor明細、精確operation欄位、操作日期及其他原人工表細項仍按既有NOT VERIFIED保存；此確認不追認空白提交、精確2秒、晚加入／多頁籤、特殊文字／rich text／行列尺寸或真雲端故障下搶答等未回報人工案例。T057與離線證據只按各自分類引用。DA-T058-01、原protected FAIL、NOT VERIFIED與真逾時／pending NOT RUN不變。任務層完成不等於所有manual細項或全部FR／SC真實人工測試PASS，整體追溯仍由T063複核。

本輪先同步證據，再執行唯讀speckit-analyze；只有確認無CRITICAL／HIGH且任務條件足夠後，才於分析外更新T059勾選。T060維持既有完成與證據，不重做；T061未開始。未修改產品／測試／001，未操作真API／讀私鑰、未commit／push。

## T059正式完成與Analyze結果（2026-11-19確認）

在證據同步後依專案speckit-analyze正式流程完成唯讀分析：前置腳本一次回傳specs/002-google-sheets-integration，分支codex/google-sheets-integration；extensions.yml不存在，無前／後hook。21FR、7SC、26場景與64任務有對應，需求任務覆蓋100%（不是全部測試PASS），未映射任務0，歧義／需求重複0，憲章衝突0。CRITICAL0／HIGH0／MEDIUM0／LOW0。原E1已由使用者對當時安全換場的明確確認解除，非產品程式修正或從B成功推論。圖表責任與UNKNOWN／pending屏障不變，未修圖或重產PNG。

分析完成後，在skill之外依本輪明確授權更新tasks.md的T059為完成，60/64。依據為原任務的兩份不同真表＋老師三組完整流程、四階段刷新／真重連、手動回填／重複／衝突與肉眼保真，以及安全換場的USER_REPORTED_MANUAL_PASS。人工衝突來源歸屬未提供，不聲稱A/B各測。只按原任務範圍完成，不替其他未明確人工細項補PASS。所有歷史成功／失敗／待補保留，DA-T058-01及protected FAIL不改。T060既有勾選與安全證據保持原樣。

T061現已具備T059＋T060依賴條件，但本輪未開始或修改README／quickstart；T062待T061、T063待T056–T062、T064待T063與最終人工審查。未宣稱Feature全部完成、助教接受或可直接commit。實際測試日期／精確分頁數／權限提示／operation欄位仍不推測，原未確認人工細項NOT VERIFIED、真逾時與pending reconcile NOT RUN、精確遠端零重送NOT VERIFIED。

本輪只改必要驗收／審查紀錄及T059任務勾選／狀態參照，未改產品／測試／001，未重跑人工或真API、未讀私鑰、未commit／push。

## T061完成（2026-11-19文件複核）

使用者授權的README／Quickstart最終複核及憑證引號修訂完成，詳細差異、假路徑8/8、PowerShell區塊7/7、相對連結27/27及靜態命令／lockfile核對見../../tests/records/002-google-sheets-integration/t061-documentation.md。唯讀speckit-analyze CRITICAL0/HIGH0/MEDIUM0/LOW0，21FR／7SC／26場景／64任務對應一致；之後在skill外勾T061，61/64。原protected FAIL、DA-T058-01與未驗證限制不改。T060證據不重做，T062–T064未開始，未宣稱完整Final接受。

本輪沒有安裝套件／啟動服務／真API／讀憑證／新應用回歸／001修改／commit或push。Playwright當前未安裝，CLI help無法執行；文件命令已按package與lockfile靜態核對，不冒稱可執行安裝測試通過。

## T062最終圖表一致性完成（2026-11-19）

Component／Class保留原PUML／PNG，Sequence最小修正NO_CHANGES零I/O、FAILED不再共用讀回、全略過與UNKNOWN屏障分支，補恢復／本機GET與DA-T058-01限制。既有PlantUML1.2026.9 CLI三圖checkonly及sequence render exit0，三PNG實際檢視；前後SHA256／尺寸見t062-before/after-hashes.json，完整實作／需求對照見../../tests/records/002-google-sheets-integration/diagram-consistency.md。圖是設計分支，不將protected FAIL轉PASS或一般403/404當保護拒絕。

唯讀speckit-analyze CRITICAL0/HIGH0/MEDIUM0/LOW0，21FR／7SC／26場景／64任務追溯一致；分析後於skill外勾T062，62/64。T063可進入但尚未開始、T064未完成。未修改產品／測試／001／憑證，無真API或人工重跑、commit或push。

## T063需求／驗收追溯完成（2026-11-19）

final-acceptance.md新增目前版本的完整21FR／7SC／26場景矩陣，保留原始矩陣及逐次證據於歷史區；t063-traceability.json列54項追溯及64任務原描述／映射。OFFLINE52、E2E48、使用者人工35、使用者live26、偏差接受5、NOT VERIFIED31、NOT RUN8、FAIL5，均為可重疊「追溯列數」，不是測試案例數或通過率。實際既有log：backend174/174、frontend15/15、E2E21/21；T057及T058-4使用者live、T059使用者人工另列，本輪未重跑。

原protected FAIL／DA-T058-01、真逾時／pending NOT RUN、遠端恰一次／保護歸因NOT VERIFIED、人工細項／操作日期／精確欄位及衝突A/B歸屬缺口均保留。55個歷史／核心等保護檔hash相同（001／歷史／憲章子集40項），20個具體實作／測試路徑存在。無無關新增功能。

唯讀speckit-analyze CRITICAL0/HIGH0/MEDIUM0/LOW0，21FR／7SC／26場景／64任務追溯覆蓋100%非全案例PASS。分析後於skill外勾T063，63/64；T064仍未開始／未接受，完整Final接受保留false。只改本輪追溯／任務／審查文件，無產品／測試／001／真API／私鑰操作，無commit／push。

## T064交付前審查（2026-11-19；尚未最終接受）

依使用者授權只讀審查，新增../../tests/records/002-google-sheets-integration/t064-pre-delivery-review.md及t064-readonly-scan.json。63/64，T064保持未勾；使用者尚未授權最終人工接受。候選掃描原始24命中經逐項審閱為測試literal／合成身分／故意壞fixture，未處理0；非忽略候選、index、32份XLSX/365entries、12PNG文字metadata及3現有bundle，未讀私人檔；資料／像素等完整性限制詳報告。無新應用／live測試，Playwright未安裝限制保留。

唯讀SpecKit Analyze CRITICAL0/HIGH0/MEDIUM0/LOW1；F1為README／quickstart目前進度仍61/64、tasks63/64，建議最終接受時同步，未擅自修改。21FR／7SC／26場景／64任務完整、55歷史／核心保護hash相同、T062六圖hash吻合。Excel清理A/B/C清單獨立列示：僅legacy-download-fixture未見引用可列單檔刪除候選；其餘仍有測試／runtime import或001歷史用途，需明確核准再清理；本輪不刪、不uninstall、不改001。DA-T058-01／原protected FAIL／NOT VERIFIED／NOT RUN保留。

五項最終人工接受表等待使用者決定，不代填、不commit／push，Git staged空；本輪未git add/reset/clean、無API／讀key／安裝／重啟。

## T064前獨立維護：方案B完整Excel退役（2026-11-19）

依使用者明確授權，先保存300檔repo外精確備份／SHA256與Git狀態，確認無本機後端listener後分階段清理。刪9個純Excel程式／測試／generator，移除GuidedNotesService舊方法與imports、multer錯誤耦合，遷移HTTP退役／Session晚到／完整E2E至Sheets，保留401/403/410、multipart拒絕、公平與寫回安全斷言。ExcelJS／fast-xml-parser／multer與專屬uuid override由npm移除，JSZip3.10.2移dev。

最終backend138/138、frontend15/15、build PASS、實際Playwright E2E21/21、backend32份語法／模組載入／隔離health smoke PASS。首次新單題fixture缺號及frontend缺件失敗均暫停後修測試資料／依lockfile npm ci，未改parser或弱化assertion；原失敗logs保留。32檔語法與smoke不是不存在的backend build。

12個Google／quiz／UI檔、parser原區段與fromGrid逐字相同；40份001歷史／驗收與T062六圖hash一致。E2E兩份舊US2 timing先另存本輪新輸出後由備份還原，不覆寫舊結果。README／quickstart／plan追加維護狀態與測試引用，final矩陣／JSON增加現行對應，原64任務內容與所有真API／人工／DA歷史不變。

Secret scan另存excel-retirement-secret-scan.json，沿用規則但不覆寫T060報告；最後結果見該檔。正式唯讀speckit-analyze CRITICAL0/HIGH0/MEDIUM0/LOW0、28個文件相對連結有效，README／quickstart原F1狀態文字已同步63/64；完整檔案清單／回復方式／結果見../../tests/records/002-google-sheets-integration/excel-retirement.md。T064未核准、63/64；可重新人工審查，無Google API／私人key讀取／001更改／Git add/reset/clean／commit／push。


## T064 Excel退役後交付前複審（2026-11-19）

使用者僅授權重新審查，未最終接受。詳[退役後審查報告](../../tests/records/002-google-sheets-integration/t064-post-retirement-review.md)、同目錄worktree／secret-scan／output-review JSON。本輪正式speckit-analyze唯讀完成，21FR／7SC／26場景／64任務一致，CRITICAL0／HIGH0／MEDIUM0／LOW0；63/64、T064未勾。既有138/15/21與build為上一輪實際紀錄，本輪未重跑；原protected FAIL、DA-T058-01、NOT VERIFIED／NOT RUN完整保留。001／歷史40檔、靜態XLSX32檔及T062六圖hash核對不變。

本輪新候選秘密掃描未處理0；未讀私人憑證、無真API／套件安裝／Git寫入。README／Quickstart已正確63/64，不需狀態修訂。依另行授權僅刪outputs/classroomquiz-valid-notes/ClassroomQuiz_valid.xlsx.inspect.ndjson衍生檢視產物，刪前hash與repo外備份一致；保留001引用的原XLSX。沒有output/目錄，未刪outputs整目錄。不改前次9刪18改的歷史維護事實。使用者仍須核准最終接受與公開資料範圍，沒有代替核准commit／push。


## T064 USER_APPROVED_FINAL_ACCEPTANCE（2026-11-19）

使用者明確審閱退役後審查並核准專案內部最終接受：Google Sheets交付、T057／058／059證據界線、方案B退役與清理後回歸、文件／三圖／追溯及已揭露DA-T058-01／protected FAIL／NOT VERIFIED／NOT RUN。此為本次實際確認日期，非補造測試日期。依原T064真實回覆條件記錄接受並勾選，64/64；不宣稱助教或第三方接受。

正式結案報告與Analyze見[本輪紀錄](../../tests/records/002-google-sheets-integration/t064-final-acceptance.md)。歷史63/64／FINAL_ACCEPTED=false及所有失敗／未驗紀錄保留；只有T064接受狀態更新，未把其他測試改PASS。README／Quickstart現行頁首與機器矩陣同步。未修改產品／測試／001，無API、讀憑證、刪檔、Git寫入或公開動作。Git候選範圍／stage／commit／push／repository公開仍需獨立核准。


## 最終提交前空白修正與三圖CLI複核（2026-11-19）

使用者另行授權指定非功能空白修正及有條件commit／push。只移除三份002 PUML、requirements.md、spec.md的檔尾空白行，以及us4-red.txt八行斷言輸出的空白分隔行；其為歷史runner輸出，不是測試fixture或預期答案。原fail8／pass2及全部錯誤文字不變，原編碼／換行保留，未整檔格式化。逐檔前後SHA256見t062-after-hashes.json的finalWhitespaceReview.whitespaceChanges；原sha256欄位保留歷史，新欄位為本次三圖最新值。

既有PlantUML CLI對三圖checkonly及tpng皆exit0。三張新PNG解壓後IDAT像素與尺寸逐一等於修正前；嵌入source metadata可能改變，故同步PNG及新hash，不虛構圖的語義變更。原001、產品／測試程式與DA-T058-01不變。僅涉及空白與紀錄，不重跑backend／frontend／E2E／build，既有138／15／21及build結果為先前實測；無真API／憑證讀取。所有修訂均在原195候選路徑內。

### Index最終檢查及Analyze結果（2026-11-19）

指定空白修正後，git diff --cached --check exit0；完整name-status精確195路徑（A148／M38／D9），5個安裝log排除、10個已審二進位證據納入。曾嘗試對全部195路徑重新git add，因已暫存刪除已不在Index而pathspec失敗；未reset／restore，核對原195暫存集合完整後，改只暫存本輪改動的既有核准路徑，最終完整集合無變。

直接掃311個Index現存檔案及186個變更blob、壓縮XML／PNG metadata，未解秘密0；4個額外高熵候選逐一確認為套件路徑鍵與Feature selector，不是秘密。原合成密碼例外依實際Index blob與已審hash核對，非忽略任意密碼；三份歷史本機路徑由使用者核准ACCEPTED_PUBLIC_DISCLOSURE。十個歷史二進位與前輪已審內容一致；新三PNG像素相同。秘密掃描不是任意個資全面保證，無私鑰或真API讀取。

依正式speckit-analyze流程（前置一次指向002、無extension hooks）唯讀核對21FR／7SC／26場景／64任務與憲章、plan／contracts、最新追溯／圖表；CRITICAL0／HIGH0／MEDIUM0／LOW0，未映射0、歧義／重複／憲章矛盾0。64/64與USER_APPROVED_FINAL_ACCEPTANCE不變；DA-T058-01、原protected FAIL、NOT VERIFIED／NOT RUN保留。產品／測試語義無改，本輪只重跑受影響的三圖CLI／像素／Index與文件一致性檢查，不冒稱重新跑138／15／21或build。

本紀錄為commit前通過檢查的記錄，不預先宣稱commit或push成功；最終Git hash與遠端結果另依實際執行回報。使用者已另行有條件授權指定單一commit及同名分支一般push，不含公開repository／PR／main合併。
