# US2 regression — T027–T031

日期2026-11-18，Feature002／codex/google-sheets-integration，Git HEAD仍66bb41a961094651ad8a84620b453ef3956a4cfa（本輪未commit）。使用者僅授權US2，不含US3／US4／Final。prerequisite正確、需求清單16/16，無extensions hook。

## 任務與驗收

| Task | 實作／驗證 | 狀態 |
| --- | --- | --- |
| T027 | async preparedQuizFixture走真正ActivityService先組數後Sheets來源解析（Access為fake）；quiz HTTP／lifecycle原assertions保留。追加submit-before-close／close-before-submit雙順序整合測試；三組並發、唯一連續順位、空白／重複／閉題後拒絕、下一題WAITING、末題COMPLETED與不可重開 | PASS |
| T028 | Socket隔離改Sheets準備fixture，原通知數／headers／版本側通道／ACK斷言保留；四階段late join／重連、多頁籤、Session恢復及程序重啟驗證；group-session與restart在T026遷移的前提再次完整執行，無需重複修改其assertions | PASS |
| T029 | 全E2E準備與fixture相容性遷移；獨立身分、晚到回覆、四階段刷新／重連、遺失提交回覆不重送、2秒同步。測試輸出改002，不覆寫001。保留舊XLSX保真檢查在歷史helper／下載合約邊界，正式UI仍無Excel按鈕 | PASS |
| T030 | 新增3個Access故障整合案例：立即不可用／永不返回的讀／永不返回的寫；讀寫請求在同步dispatcher外獨立hold，三組三題照常完成，沒有多呼叫Google、沒有rank／phase／student revision變動。新E2E fake cloud outage也完成三題 | PASS |
| T031 | 全backend、frontend、E2E及build實跑，原歷史與應用hash驗證；未使用舊測試數量冒充本輪結果 | PASS |

T030的pending write只是Access替身的未完成Promise，不是實作／驗收US3 writeback coordinator；真worker並行分支仍留T053／T054。沒有實作寫回／核對UI或其他後續故事。

## 命令／預期／實際

| 命令 | 預期 | 實際 |
| --- | --- | --- |
| node --test backend/tests/integration/quiz-http.test.js backend/tests/integration/activity-lifecycle.test.js backend/tests/integration/quiz-socket-isolation.test.js（初次fixture遷移後） | 保留原8案例 | 8／8 PASS，1703.0072ms |
| node --test backend/tests/integration/sheets-quiz-independence.test.js backend/tests/integration/quiz-http.test.js | 故障3情境與5個HTTP案例 | 8／8 PASS，1536.0158ms |
| npm --prefix backend test | 全部unit＋integration | **121 tests／121 pass／0 fail／0 skip／0 cancelled**，7647.5895ms，退出碼0 |
| npm --prefix frontend test | 全前端單元 | **9／9 PASS**，0 fail／skip，380.8442ms，退出碼0 |
| E2E_FRONTEND_PORT=5273／E2E_BACKEND_PORT=3100；npm --prefix frontend run test:e2e | 全部E2E、單worker | **15／15 PASS**（59.0s），無skip／only、無放寬2秒assertions，退出碼0 |
| npm --prefix frontend run build | 可建置 | **PASS**，Vite8.3.8、51 modules、402ms，退出碼0 |
| git diff --check／us2-protected.json比對 | 不改應用／001／歷史／圖 | PASS，93檔hash一致；只有LF／CRLF提示 |

原始執行輸出：us2-backend.txt、us2-frontend.txt、us2-e2e.txt、us2-build.txt。backend從117增至121（新增1個裁定順序＋3個雲端故障案例），E2E從14增至15（新增1個雲端故障案例），沒有以刪測試取得PASS。

## 同步採樣與隔離

- 單題start／submit／close：43／65／35ms。
- 三題階段及提交：44／13／64／43／40／54／49／58／31／69ms，13筆合併採樣最高69ms，全部<2000ms。
- 採樣在us2-single-question/timings.json、us2-lifecycle/timings.json，畫面證據同各自002子目錄；這是本輪本機樣本，不宣稱任意環境延遲保證。
- Socket原assertions確認未閉題觀察組沒有額外snapshot／通知／revision／全域計數，僅提交身分及老師收到相應資料。API斷線、獨立pending讀／寫都不加入順位／close同步裁定；故障回覆晚到後本機quiz與student view仍相同。

## 相容性遷移對照（未降低原驗證責任）

| 原測試前提 | 本輪必要調整 | 保留驗證 |
| --- | --- | --- |
| 同步純domain fixture | HTTP／Socket／主要E2E改await preparedQuizFixture，走真準備服務、fake Access | 原assertions文字保留，僅await語法；另加閉題競爭整合案例 |
| 身分E2E先Excel import再組數 | 先組數、後loadSource，fake DI | 原持久profile／防占用／不可取得老師身分／恢復assertions全部保留 |
| 老師全活動選XLSX | URL fake invalid gap後重試有效來源 | 缺號拒絕／不得半場活動、原三組／晚加入／公平／隔離／final／reset都保留；錯誤訊息因附格址改驗原原因子字串 |
| 舊正式Excel按鈕／下載 | 新UI驗無Excel按鈕；歷史download.js從測試端直接呼叫，仍產生真瀏覽器download；全活動重複XLSX保真改isolated exportFixture renderer | suggested filename、逐格完整文字／String型別／非答案原文／來源不變／四階段不變／學生403／失敗保留state全部保留。錯誤提示改驗下載helper拒絕訊息，不要求已退役UI新增按鈕；不觸及US3 API退役或新寫回 |
| 證據寫tests/records/us3、us4、us5、final、convergence | 全改tests/records/002-google-sheets-integration/us2-* | 原001圖／XLSX／timing檔案hash保持，不刪原紀錄 |

歷史XLSX合約測試不是Google寫回驗收，也不是恢復Excel正式流程；US3開始後還須依新合約處理路由退役與回填測試。本輪沒有變更任何backend/src或frontend/src檔案。

## 真實Google回報與範圍

另見user-real-read.md：使用者提供ClassroomQuiz-Test-A共6題／第4題WAITING／1工作表／UNKNOWN的真實讀取畫面結果。這是USER_REPORTED_REAL_READ，沒有冒稱AI另行看過原圖或執行Google測試；寫入權未確認，兩份真表／完整Google自動測試／寫回驗收仍待辦。T003／T004不自動勾選，不讀取私人憑證。

本輪只改測試／helpers／合成wire fixture與002紀錄／tasks。應用／搶答核心、三圖及001歷史不變，無需重產PNG。無安裝套件、真Google存取、commit或push。T027–T031完成後停止，US3尚未開始，等待人工確認。
