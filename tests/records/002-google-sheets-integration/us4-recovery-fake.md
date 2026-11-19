# US4 T044–T054 恢復與回歸紀錄

日期：2026-11-18；Feature=specs/002-google-sheets-integration；branch=codex/google-sheets-integration。本輪使用專案speckit-implement，只執行US4。前置腳本與需求清單16/16通過、checklists未修改、extensions.yml不存在（before／after均無hook）。既有未提交工作保留，沒有commit／push或安裝依賴。

## 真實證據分界

使用者本次確認US3人工接受，回報真實Google Sheets匯入／搶答／閉題／成功答案寫回預期儲存格，記USER_REPORTED_REAL_READ_WRITE_SUCCESS，見user-real-write.md。確認日不是未提供的實際測試日期；無新增截圖或其他未提供細節。

下列US4結果全部為fake／本機自動驗證。代理未讀取私人Service Account key、未呼叫真Google寫入。US4真實異常／恢復、兩份真表live自動測試、完整Final／本輪人工審查仍未完成。T003／T004保持未勾選。

## 任務結果

| Task | 狀態 | 實際證據 |
| --- | --- | --- |
| T044 | PASS | 新增unit/writeback-recovery.test.js，Evidence／pending、部分／他值／marker文字、讀取／認證／撤權、安全初始重試、不可表示／超大、APPLIED／UNKNOWN完整分支 |
| T045 | PASS | 新增integration/writeback-recovery-http.test.js，reconcile驗權／舊活動／任意欄位／eligible／busy、兩老師Session、POST回覆中斷不取消worker、未知transport／讀回恢復 |
| T046 | PASS | 新增google-sheets-recovery.spec.js共4項，兩老師頁面、busy／pending ID、刷新／手動核對、外部衝突、Google401、本機Session、晚到A成功或錯誤及舊Notes不覆B |
| T047 | PASS | SourceConsistency延續全部原題與非目標核對；加Evidence題號一致性與排除明確未送／拒絕attempt的答案解釋；pending先按原位置辨識再解析 |
| T048 | PASS | Coordinator.reconcile同步取得原operation及immutable快照，不摻後來閉題；全活動running互斥，先讀原來源及全部目標／歷史Evidence |
| T049 | PASS | settled＋確定未送／明確拒絕／APPLIED，或UNKNOWN舊目標全吻合，才可排除舊請求；UNKNOWN殘留marker只讀pending。IN_FLIGHT不能解除running，沒有定時清鎖／自動重送 |
| T050 | PASS | teacher POST writebacks/:id/reconcile，202同ID／revision遞增；無operation404、非pending409、busy／pending回原ID，GET純本機查詢 |
| T051 | PASS | client顯式reconcile、保留原ID、epoch／discovery世代／同ID revision；遺失回覆只Notes發現，Google錯誤視圖不清Session。frontend15項皆通過 |
| T052 | PASS | TeacherPage原操作手動核對、canReconcile不是重送保證、逐題原因／修權提示；pending或未解衝突不能新寫，無forced overwrite／restore |
| T053 | PASS | 真coordinator＋fake Access在preflight／write／reconcile gate等待，三組HTTP提交及close競爭、Socket<2秒斷言、學生無額外事件／雲端欄位／版本變化；舊來源回覆不取得新活動ownership |
| T054 | PASS（離線） | 下列完整US1–US4回歸及分支核對；無skip／only、沒有移除或降低原assertions；不把fake標成Google驗收 |

本輪11項通過後才勾選，總52/64完成；T003／T004及Final T055–T064仍未勾選。

## 遠端值／狀態／次數／屏障矩陣

表中寫入次數為該案例整個操作序列的fake Access write呼叫，並非真Google請求。Access契約既有測試另證明一attempt一次HTTP傳輸、固定host、無auth replay／盲重試。合成部分可見值用於容錯注入，**不表示Google原子batch部分套用**；可表示外部變更或故障邊界的可見內容。

| 案例／測試 | 可見遠端值 | 本機結果 | 寫入次數 | 屏障 |
| --- | --- | --- | --- | --- |
| 新操作無Evidence但同答案 | 非原marker且無依據 | CONFLICT | 0 | 未送，terminal；不可覆寫 |
| 第一次成功後重複 | 全部吻合Evidence | SUCCEEDED／SKIPPED_VERIFIED | 累計1，重複0 | 無新寫入 |
| 已驗證格遭改值或恢復marker | 與Evidence不同 | CONFLICT | 累計1，新增0 | 停止未送更新 |
| UNKNOWN部分結果 | Q1預期／Q2marker | PENDING，VERIFIED／NOT_WRITTEN | 1 | 保留；重複reconcile仍1 |
| 上例後可見所有原目標預期字串 | Q1/Q2預期，包含恰為別題marker的答案 | 同ID SUCCEEDED | 仍1 | local已settle才解除；後閉Q3不加入 |
| UNKNOWN含他值 | Q1預期／Q2external | CONFLICT＋unresolved | 1 | 保留；僅修Q2為marker再核對仍pending、不重送 |
| prior Evidence／位置／維度／merge／公式／chip變動 | 與基準或證據不符 | CONFLICT | 無新增write | 全批停止，未知屏障保留 |
| pending期間讀取／auth／保護格失敗 | 無法完整核對／已知拒絕 | PENDING | 仍1 | 不把已可能送寫變成安全FAILED |
| 初始讀取或取Token失敗／明確拒絕 | 原marker | FAILED | 初始讀取失敗0；其他fake呼叫1、NOT_SENT不代表HTTP送達；修復後新操作另+1 | 可修復後新明確操作，不能自動重送 |
| 已settle且APPLIED可排除舊請求，剩餘marker | Q1吻合／Q2marker | 明確reconcile僅寫Q2→讀回SUCCEEDED | 總2，目標集合[1,2]後[2] | 全preflight通過才送；合成容錯分支 |
| Google回覆遺失但已apply、讀回成功 | 全預期字串 | SUCCEEDED＋Evidence | 1 | settled且內容已核對，非由2xx推成功 |
| apply後讀回失敗／老師POST回覆中斷 | 全預期，但初次無法驗 | PENDING→手動reconcile SUCCEEDED | 仍1 | worker不隨HTTP中斷取消 |
| IN_FLIGHT且全吻合 | 全預期字串 | pending＋running | 1 | reconcile／新寫BUSY；settle才可解除 |
| IN_FLIGHT殘留marker，之後僅本機settle | 原marker | pending、canReconcile | 仍1 | local settle不是Google終止，手動核對只讀 |
| 答案文字就是原marker | marker同值且有已送紀錄／Evidence | VERIFIED；再寫略過 | 累計1 | 不按regex誤認缺題或未寫 |
| surrogate／>2MiB | 原值不變 | FAILED | 0 | 不截斷／拆批，不改Submission |
| 第二老師重複POST／reconcile | 原operation進行中 | 409 BUSY＋原ID | 一個worker | GET不增加Google呼叫 |
| 原活動被替代後舊讀回到達 | 新活動維持原狀 | 舊operation不得回存／送寫 | 0 | 原ownership不接管新活動 |

## 完整測試

| 命令 | 預期 | 實際／證據 |
| --- | --- | --- |
| `npm --prefix backend test` | 原回歸＋US4＋Access契約全PASS | **153/153 PASS**，0 fail／cancel／skip／todo，4930.898ms；us4-backend.txt |
| `npm --prefix frontend test` | Session／snapshot／Guided Notes與reconcile守衛 | **15/15 PASS**，0 fail／skip，407.4407ms；us4-frontend.txt |
| `npm --prefix frontend run test:e2e` | 全套瀏覽器US1–US4與原驗收assertions | **21/21 PASS**，1.5m；us4-e2e.txt |
| `npm --prefix frontend run build` | Vite正式建置成功 | **PASS**，51 modules，503ms；us4-build.txt |
| protected hash／diff | 001／原驗收／核心／三圖不變、無空白錯誤 | **61/61相同**，us4-protected.json；git diff --check PASS（LF／CRLF提示不屬錯誤） |

TDD：先新增backend recovery測試，缺reconcile method／route的RED見us4-red.txt；先新增client reconcile測試的RED見us4-frontend-red.txt，再實作至GREEN。E2E初期2項與後續4項target皆通過（us4-e2e-target.txt），最後全21項通過。晚到回覆案例明確等待舊HTTP response完成及browser渲染後再斷言B；不以尚未送達的回覆冒充防護通過。

T053 Socket測試對每次本機狀態傳播／有效提交設<2000ms斷言；三個等待階段均通過，沒有記錄未量測的精確延遲數字，也不承諾任意環境效能。core Question／Submission／auth／sync／socket／StudentPage未改。沒有skip／only／刪除失敗測試或縮減原assertions。

## 本輪檔案

- 新增測試：backend/tests/unit/writeback-recovery.test.js、backend/tests/integration/writeback-recovery-http.test.js、tests/e2e/google-sheets-recovery.spec.js。
- 修改程式：backend/src/services/source-consistency.js、writeback-coordinator.js；backend/src/api/guided-notes-routes.js；frontend/src/services/guided-notes.js、frontend/src/pages/TeacherPage.jsx。
- 修改測試：backend/tests/integration/sheets-quiz-independence.test.js、frontend/tests/guided-notes.test.js。
- 文件：specs/002-google-sheets-integration/tasks.md、review-record.md、quickstart.md；本目錄user-real-write.md、us4-recovery-fake.md、us4-protected.json、us4-red.txt／frontend-red.txt／backend.txt／frontend.txt／build.txt／e2e-target.txt／e2e.txt。全E2E當次可重產證據僅寫002既有子目錄，001原始紀錄不動。
- 無本輪依賴或lockfile變更；working tree既有package變更屬Foundation。無commit／push。

## Diagram First核對及限制

Component：teacher auth→WritebackCoordinator→SheetsAccess→原來源；operation／Evidence獨立RuntimeStore，quiz／role sync不等Google。Class：使用同ClosedWinnerSnapshot、Operation／Attempt／Evidence，不另造新活動phase或持久庫。Sequence：新writeback vs原reconcile、busy／pending互斥、全來源核對、UNKNOWN殘留marker無第二寫、全部核對且local settle才解除屏障，與既有002三圖一致。圖為邏輯責任，函式名不是API實作簽名。

puml與PNG全部不變，故未重產PNG；保存hash及本節US4範圍一致性證據。此不是Final T062全Feature最終驗證。Google無跨preflight／write CAS，依A-04仍要求活動期間外部不編輯；手動核對不是forced overwrite或一定可重送。永久無法排除舊寫入時保持pending，重啟不是取消。

## 停止點

US4離線完成，待本輪人工接受。可進入Final的實作／驗證規劃，但本輪**未開始T055–T064**。完整Final通過仍需T003／T004實際前置、兩份真表live及人工驗收、最終三圖／文件與安全檢查等；US3使用者真實成功回報不能替代全部項目。
