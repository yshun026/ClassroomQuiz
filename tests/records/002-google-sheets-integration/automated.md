# T056 Final離線自動測試

**最新離線補強：protected診斷** backend165/165、frontend15/15、E2E21/21、build PASS，詳protected-diagnostic.md與對應log。下文157是前次Final基準。真實T058仍待使用者執行，未啟用test:live；既有停用gate單元測試不等於live驗收。

日期2026-11-18；branch codex/google-sheets-integration；Node24.17.0／npm11.13.0。原US4基準153 backend／15 frontend／21E2E；本輪新增live gate／shared runner契約3項、來源重用整合1項，原測試未刪除或skip。新增的live test與預設suite分開。

| 命令／環境 | 預期 | 最終實際 | 輸出 |
| --- | --- | --- | --- |
| npm --prefix backend test | 全unit／integration含歷史Excel helper、原quiz／Session／Socket及002回歸 | **157/157 PASS**，0fail／cancel／skip／todo，5463.9839ms | final-backend.txt |
| npm --prefix frontend test | 全client／Session／snapshot／測試身分 | **15/15 PASS**，0fail／skip，254.2343ms | final-frontend.txt |
| npm --prefix frontend run build | Vite正式build | **PASS**，51 modules，139ms；bundle index-BybQvGu2.js | final-build.txt |
| E2E_FRONTEND_PORT=5273；E2E_BACKEND_PORT=3100；npm --prefix frontend run test:e2e | 全瀏覽器、獨立埠、不停止3000／5173使用者活動 | **21/21 PASS**，1.0m | final-e2e.txt |
| RUN_GOOGLE_LIVE_TESTS=0；npm --prefix backend run test:live | 不讀key、不連Google，明確NOT RUN | **0PASS／1SKIP，NOT RUN**，不是live成功 | final-live-disabled.txt |

後端test命令只匹配tests/unit/*.test.js及tests/integration/*.test.js；live只匹配tests/live/*.test.js。live-gate.test.js在獨立子程序明確停用RUN並清空key／ID，斷言NOT RUN／skip且pass0；子程序停用NODE_TEST_CONTEXT以取得TAP結果，沒有使用skip製造預設suite通過。

共享live演算法另以fake A/B跑契約：兩份完整標記、Q1最小rank、Q2無人／Q3未閉保marker、重複略過、Q3文字、非目標與格式保真。這只證明測試程式可運作，**不代表真Google驗收**。真人必須依live.md自行啟用。

## Final檢查補強

- 新增backend/tests/helpers/google-live.js、tests/live/google-sheets.test.js、unit/live-gate.test.js，package.json只加test:live script；沒有安裝依賴或本輪lockfile變更。原google-auth-library11.3.4屬Foundation。
- 新增integration/source-reuse.test.js：已有答案的原表在新程序／新活動被拒絕、不承接舊Evidence、不自動還原；test明確模擬人工恢復marker後才能重新準備。
- TeacherPage僅補既有FR-020／US4.8的還原／複製與重啟不取消提示；teacher-preparation E2E增加可見提示斷言。沒有改核心搶答或新增restore功能。
- 首次gate子程序輸出為空的測試問題已修正（NODE_TEST_CONTEXT／明確TAP），沒有略過該assertion；修正後完整suite全部通過。未因失敗降低期望。

## 歷史／遷移對照

原001 Excel解析／文字／OOXML保真helper測試繼續執行；正式source JSON URL／groups-first前提已於US1–US2遷移，詳t026-validation.md／us2-regression.md。US3 export-http改驗401／403／teacher410與不改活動，歷史renderer文字／surrogate斷言保留；browser下載前提改正式Sheets寫回／退役與隔離renderer，詳us3-fake.md。US4加恢復與多頁籤／跨ID安全，不減原公平assertions。

本輪全部E2E輸出只寫002子目錄（既有可重產圖／XLSX／同步採樣等），001原始驗收檔案hash保持。001舊73／7／14數字不沿用作本輪結果。

## 21項E2E實際覆蓋

full-activity、single-question（2）、realtime-lifecycle（8，含3種晚到身分與Google outage）、student-identity、teacher-preparation、convergence-regressions、guided-notes-export、google-sheets-writeback（2）、google-sheets-recovery（4）；精確21個test及輸出以final-e2e.txt為準，不以檔案數推算通過數。

前端實際test檔為guided-notes.test.js、realtime.test.js、setup.test.js；Session／api／download過期回覆測試在realtime.test.js，setup.js只是輔助檔。

## 結論

未發現順位、每組唯一、閉題、Next／COMPLETED、Session、角色／資訊隔離、Socket同步或Google等待獨立性的回歸。受保護61/61 hash未變，含核心／001歷史／六份圖。應用已走Google正式流程；舊Excel程式只保留helper／依賴用途。真表與人工結果見live.md／manual.md，仍PENDING，不能由本報告標Feature整合完成。
