# Setup baseline — T001

日期：2026-11-18。分支 codex/google-sheets-integration；Feature specs/002-google-sheets-integration。
Git HEAD: 66bb41a961094651ad8a84620b453ef3956a4cfa。
既有未提交002文件及六份圖檔保留。check-prerequisites成功，需求清單16/16；三圖與PNG均存在。

protected-files.json 記錄001規格、既有驗收紀錄、已追蹤圖／前端、搶答／權限／同步核心的SHA256，結束時逐檔比較；不含秘密。新增002紀錄不覆寫舊紀錄。

## 測試保留／遷移

- Excel import/export unit、workbook helper及fixture維持歷史路徑，本輪不改正式準備流程。
- Foundation：新增 google-config／sheets-access unit，既有foundation安全assertions保持；HTTP來源契約遷移在US1 T016。
- helpers/quiz.js 的純domain來源fixture於T013換成合成Sheets模型且保持同步；不建立新業務草稿。
- group-session-http／quiz-http／Socket／lifecycle／E2E的正式來源遷移留US1／US2；本輪僅回歸原行為，不實作這些故事。
- 新增Google fake測試不代表真實Google驗收。T003/T004未完成，live NOT RUN。

檢查：全部保護檔案可讀、hash manifest已建立；無程式變更前先執行既有backend test取得實際基準。

執行結果：npm --prefix backend test，73 tests／73 pass／0 fail／0 skip，9251.2984ms，退出碼0。這是本輪實際基準，不是Google整合驗收。
