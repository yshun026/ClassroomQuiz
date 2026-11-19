# Setup / Foundation execution — Feature 002

日期2026-11-18，Git HEAD 66bb41a961094651ad8a84620b453ef3956a4cfa（未commit的本輪變更）。執行範圍T001–T014，未執行US1–US4／Final。

## 實際執行與結果

| Tasks | 命令／方式 | 預期 | 實際／狀態 |
| --- | --- | --- | --- |
| T001 | prerequisite／branch／checklist／hash manifest；npm --prefix backend test | 正確002／既有核心不退步 | PASS；基準73 tests／73 pass／0 fail／0 skip，9251.2984ms |
| T002 | npm view google-auth-library version engines --json；npm --prefix backend install --save-exact google-auth-library@11.3.4；npm ls及ESM匯入 | Node24相容、精確lock | PASS；Node24.17.0／npm11.13.0；11.3.4 engines>=22，安裝19傳遞套件，當次audit0漏洞；非安全保證 |
| T003 | 人工Cloud／憑證／ACL | 使用者確認環境 | BLOCKED／未提供；沒有建立或讀取真key |
| T004 | 人工A/B專用表與分享 | 兩不同ID且已授權 | BLOCKED／未提供；live NOT RUN |
| T005 | README及記錄欄位檢查 | 分開fake／live／manual／diagram | PASS；檔案存在、分類及必要欄位齊備 |
| T006/T007 | node --test backend/tests/unit/google-config.test.js backend/tests/unit/sheets-access.test.js（實作前） | 測試揭露缺模組 | RED如預期：2個檔案因ERR_MODULE_NOT_FOUND失敗，非最終通過，無真Google呼叫 |
| T008/T009 | node --check backend/src/config.js；node --check backend/src/api/errors.js；node --test backend/tests/unit/foundation.test.js | 語法／既有安全契約通過 | PASS；7 tests／7 pass，1654.1251ms |
| T006–T011 | 新增兩檔unit，fake authFactory／transport／clock／RNG | 認證、固定host／scope、讀預算、單次寫、錯誤安全 | 首輪24／24 PASS；補充attempt去重／IN_FLIGHT與實際settlement後25／25 PASS |
| T012/T013 | 新增fixture／可控fake與DI，兩檔unit；原foundation／submission-order測試 | 合成資料與純domainfixture不引入Google I/O／規則變更 | 中間檢查35／35 PASS；完成fake／DI／HTTP安全分支後，兩新檔共29／29 PASS，1521.8683ms |
| T014 | npm --prefix backend test（最終） | 全後端unit＋integration不退步 | PASS：102 tests／102 pass／0 fail／0 skip／0 cancelled，6252.1927ms，退出碼0；其中新Foundation29項、原基準73項 |
| T014 | git diff --check；69個protected SHA256逐檔比較；ignore／lock／秘密簽名與前端依賴檢查 | 歷史與核心完整、無真秘密 | PASS；69檔無差異，掃描54個候選檔無真私鑰／Token簽名，前端無google-auth-library；範例env不含key，lock精確11.3.4。簽名掃描不等於完整秘密稽核 |

所有自動測試均離線fake／本機HTTP-Socket。未執行E2E／真GoogleToken交換／真表讀寫／人工Google驗收，皆NOT RUN。未安裝瀏覽器、未變更前端、未做US1來源URL介面／解析／權限判定或US3／US4回填coordinator。

## 實作邊界與重要語義

- config延遲讀取repo外canonical credential path，拒絕repo內／連結回repo、非service_account、不可信token_uri／universe及subject；不自動用使用者ADC。實際key簽章與ACL仍待人工環境驗證，測試只用記憶體無效簽章字串。
- GoogleAuth只取spreadsheets scope Token；Sheets使用Node原生fetch，固定官方host與field mask、redirect:error，全GRID sparse資料與保護參照保留，不在Foundation解析Qn或判定可寫。
- getSource／verify：總100000ms含取Token／body／backoff，attempt上限30000ms，最多3次；jitter整數0–250、Retry-After下限與deadline控制。定時器／RNG／clock可注入，晚到Token不得再發Sheets請求。
- writeValues：一次精確單格stringValue batch、fields=userEnteredValue；超2MiB／無法表示／重複或不合法座標送出前拒絕；無自動auth replay／網路重送。相同attemptId同payload共用同一Promise，不同payload拒絕，明確新attempt才可另行呼叫；是否安全新attempt屬後續coordinator。
- 200秒本機逾時不代表底層傳輸settled。若底層忽略abort仍待回覆，回UNKNOWN＋IN_FLIGHT；內部不可序列化的whenTransportSettled Promise供未來coordinator等待，實際settle才變SETTLED，晚到2xx也不偷偷把既有UNKNOWN改成功。這是實現既定R8責任，不新增業務狀態／遠端取消承諾。
- app僅掛接可注入SheetsAccess且延遲認證；既有正式Excel準備／匯出暫未替換，因US1／US3未授權開始。quizFixture純domain來源用有效合成Source，不走生產解析，不恢復草稿。
- 新Sheets錯誤僅白名單安全details，未知上游錯誤不附cause／headers／body；健康檢查與HTTP回應不暴露credential path。

## Diagram First 對照（本階段）

Component的Access對應sheets-access.js，外部credential與Google邊界只在後端；Class的SheetsAccess提供read／write／verify、原Activity／Question／Submission責任不變；Sequence的無盲重送／I/O不入quiz裁定由Access傳輸契約及DI測試驗證。尚未實作的prepare／snapshot／preflight／reconcile流程不宣稱完成。

本輪沒有改三圖，因此不需重產PNG；既有002 component／class／sequence圖與PNG保留，US完成後仍須T062完整一致性核對。本階段增量未偏離設計，無Spec／Plan降級或新增功能。

## 下一步

T001/T002/T005/T006–T014共12項完成；T003/T004人工未完成、不勾選。Foundation具備US1離線開發前置；需使用者下一輪確認才開始US1。真表驗收仍必須等人工Cloud與A/B就緒，不以此檔當live PASS。
