# US3 T032–T043 離線實作及驗證

日期：2026-11-18；Feature=specs/002-google-sheets-integration；branch=codex/google-sheets-integration。使用本專案 speckit-implement，範圍僅US3。前置腳本回傳002、需求清單16/16；US2已由使用者本次確認接受。T003／T004人工前置保持未完成。

## 任務及可核對證據

| Task | 結果 | 實作／測試 |
| --- | --- | --- |
| T032 | PASS | writeback-snapshot.test.js：最小rank、未閉／無人排除、原始文字及位置不可變、close／snapshot雙序、標記答案；HTTP測無fills零I/O |
| T033 | PASS | writeback-http.test.js：202／200、Notes與operation查詢、驗權／舊活動／任意目標、busy／pending、讀回才成功、操作失敗以GET200保存 |
| T034 | PASS | source-consistency.test.js：stable ID／維度／merge／全部題映射／非答案／公式定義／runs、rename／reorder、Evidence／pending先還原邏輯標記再解析 |
| T035 | PASS | ClosedWinnerSnapshot／WritebackOperation；與quiz revision分開、immutable snapshot |
| T036 | PASS | Item／WriteAttempt、單次傳輸／未知結果／本機settle獨立；讀回期間settle也更新attempt |
| T037 | PASS | WritebackEvidence及activity-scoped operations／evidence Map；只讀回吻合建立，不加資料庫 |
| T038 | PASS | SourceConsistency核對全部原題／非目標／保護／局部格式；無依據相同答案衝突，全批先驗 |
| T039 | PASS | Coordinator同步捕捉快照及ownership，外部I/O；安全拒絕surrogate／>2MiB；單批、讀回、未知屏障；無reconcile／盲重送 |
| T040 | PASS | app組裝、teacher POST／GET；worker解耦HTTP、舊export先驗權後410；歷史renderer測試保留 |
| T041 | PASS | frontend client：Session／activity／epoch／discovery／同ID revision；跨ID晚到拒絕、lost POST唯讀發現、不自動POST重試 |
| T042 | PASS | TeacherPage四階段按鈕／逐題／忙碌／失敗／pending／刷新；只每秒本機GET，與quiz按鈕獨立；新增E2E及遷移退役HTTP |
| T043 | PASS（fake限定） | 以下完整離線套件通過；兩份合成來源逐格比對，真正Google與人工仍NOT RUN，US4尚未實作 |

## 命令、預期與實際

所有 Google 邊界均為 in-memory fake 或注入 transport；瀏覽器使用真 Express／Socket.IO／React。fixture ID為合成來源，不識別任何真表。

| 命令 | 預期 | 實際 |
| --- | --- | --- |
| `npm --prefix backend test` | 所有單元／Access契約／HTTP／Socket／原回歸PASS，無skip | **136/136 PASS**，0 fail/cancel/skip/todo，7226.7801ms；us3-backend.log |
| `npm --prefix frontend test` | Client與Session／snapshot回歸PASS | **13/13 PASS**，0 fail/skip；us3-frontend.log |
| `npm --prefix frontend run test:e2e` | 全套瀏覽器與原公平／身分／同步assertions通過 | **17/17 PASS**，42.4s；us3-e2e.log |
| `npm --prefix frontend run build` | 正式建置成功 | **PASS**，Vite8.3.8、51 modules、223ms；us3-build.log |
| 保護hash前後比對 | 001／原驗收／三圖／核心不變 | **PASS**，us3-protected.json全部相同 |
| `git diff --check` | 無空白錯誤 | **PASS**；既有LF／CRLF提示非錯誤 |

先建立測試取得RED（snapshot／consistency缺模組及新route未實作），再通過新測試，最後整套回歸。補強案例最初揭露fixture的Submission不可變／缺config，已改成正常提交答案及安全測試config，沒有改產品immutable限制。未使用skip／only／移除安全assertion。

## 寫回與安全邊界

- teacher POST只接受activityId，由活動source及動態mapping取目標。最小receiveRank的閉題有效答案同步複製後，preflight／Google I/O全部在dispatcher外；回存時短同步檢查原ownership。不改quiz phase／rank／published data／student revision，不新增學生Socket事件。
- 完整來源身分、支援GRID集合、維度、merge、全部原題位置／原始值、非答案userEnteredValue、公式定義、局部格式及已知權限先驗。Evidence或本次已送attempt解釋已替換答案，再掃邏輯標記，不把marker-like答案當新題。
- Access單次batchUpdate只有精確單格start、userEnteredValue.stringValue，mask=userEnteredValue；不寫格式／公式定義／merge／結構，沒有任意URL fetch或前端目標。整批build檢查可表示文字及2MiB上限。synthetic A/B包含hidden／merge／非答案rich text／formula，全raw除目標stringValue外深相等。
- Google 2xx後仍verify全部目標及來源，精確string相同才Evidence／VERIFIED。讀回失敗、結果未知或仍有原標記保留原snapshot／pending barrier；沒有reconcile實作也拒新寫。IN_FLIGHT始終running，settle不等於遠端終止，未知加殘留標記仍不重送。已吻合且transport後來settle才解除running；安全條件與Plan一致。
- E2E實際hold worker時可下一題／提交／閉題；舊snapshot不吸收後閉題。老師刷新只查本機最新操作、pending不能按新寫，學生無來源／進度。Access讀重試沿用Foundation，寫入無auth replay／自動重送。
- 原export HTTP測試改為teacher410／student403／unauth401，不復活XLSX。原字串／surrogate／工作簿不變檢查保留在renderer helper；兩個browser舊download案例遷移為退役驗權及新Sheets literal寫回。原完整activity isolated renderer仍保留fidelity。
- A-04：Google前置讀取＋batch不是CAS；活動期間外部編輯須停止。沒有承諾任意並行編輯下絕對保護。無持久化，重啟清本機紀錄不取消遠端寫入。

## 本輪新增／修改檔案

新增程式：backend/src/models/writeback-operation.js、writeback-evidence.js；backend/src/services/source-consistency.js、writeback-coordinator.js。

修改程式：backend/src/app.js、api/guided-notes-routes.js、store/runtime-store.js；services/sheets-access.js僅匯出既有batch builder供全批前驗。frontend/src/services/guided-notes.js、pages/TeacherPage.jsx。

新增測試：backend/tests/unit/writeback-snapshot.test.js、source-consistency.test.js；backend/tests/integration/writeback-http.test.js；tests/e2e/google-sheets-writeback.spec.js。

修改測試：backend/tests/integration/export-http.test.js、frontend/tests/guided-notes.test.js、tests/e2e/guided-notes-export.spec.js、convergence-regressions.spec.js。

文件／紀錄：specs/002-google-sheets-integration/tasks.md、review-record.md、quickstart.md；本目錄us3-fake.md、us3-manual-write.md、us3-protected.json、us3-backend.log／frontend.log／e2e.log／build.log。原E2E寫002內當次可重產結果（us2-single-question／lifecycle／full-activity／student-identity等）；不改001原始驗收。無依賴安裝或lockfile改動屬於本輪；package中的google-auth-library是先前Foundation工作。

## Diagram First 一致性（US3範圍）

Component：teacher→auth→coordinator→Access，store保存snapshot／evidence；quiz／role-sync獨立。Class：新增snapshot／operation／evidence與來源position關聯一致；model狀態不當Activity phase。Sequence：新writeback／同步快照→全前驗→單批→讀回／pending屏障與圖一致，雲端等待不進rank／close命令。三圖已核准且PNG存在，本輪未改puml，無需重產。圖中的reconcile分支明確留US4；這是US3部分一致性驗證，**不是T062全Feature最終驗證**。

## 未執行及停止點

真實Google寫入／兩份真表自動整合／人工US3驗收：**NOT RUN**。使用者真實Test-A讀取回報仍僅局部讀取依據；T003／T004未完成，不聲稱UNKNOWN可寫。人工寫回步驟見us3-manual-write.md。

US4 T044–T054與Final T055–T064未開始／未勾選；未提供reconcile endpoint或UI，不能稱完整可交付。未改001、核心fairness／auth／Socket／學生頁，未建立或讀取私人憑證、未commit／push。extensions.yml不存在，無before／after hook。具備進US4離線實作條件，等待使用者確認。
