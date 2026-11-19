# T058 protected 最小安全診斷（離線完成，真實重測未執行）

**最新細分**：使用者已實測舊碼P_EDITABILITY_UNKNOWN而未通過；現僅在測試層增加missing／null／非布林／true／false及多規則狀態碼，見protected-field-state.md。原寬碼與SHEETS_NOT_EDITABLE唯一通過條件不變，沒有當次API回應可證實具體子類，T058仍未完成。

記錄日期2026-11-18。使用者授權僅測試層安全診斷，不改業務／安全政策。使用者確認新副本Q1–Q6完整、Q1保護正確、限制編輯非warning、文件Editor但服務帳號不在Q1允許名單、無Q1未保護例外。先前protected測試pass0／fail1／exit1／LIVE_ACCEPTANCE_FAILED保留為真實失敗回報；實際失敗日期未提供，沒有推定根因。

T058仍未勾選；本輪沒有執行test:live命令、真Google API、讀key／Token或改試算表，無commit／push。T003／T004／T057已確認結果不變，累計58/64。

## 最小變更

- 新增backend/tests/helpers/protected-diagnostics.js：單一注入getSource，呼叫未修改的正式parseSource；結果只含passed布林與固定codes陣列。
- 修改backend/tests/live/google-sheets.test.js：protected分支呼叫helper、將每個固定code用t.diagnostic輸出，再驗passed===true。只有原parseSource拋出SHEETS_NOT_EDITABLE才設passed=true；getSource拋相同代碼也只能是P_READ_FAILED。原通過條件不變。
- 新增backend/tests/unit/protected-diagnostics.test.js：8項離線測試（含多個迴圈分支），不執行真實live。
- 診斷對parser正常返回的來源使用原validated mapping及範圍幾何進行觀測，不參與產品權限裁定；若觀測與parser不一致，回P_DIAGNOSTIC_UNAVAILABLE，不能自己判PASS。沒有修改backend/src或frontend/src、HTTP／Socket／coordinator／憲章／001／圖。

## 固定代碼及精確含義

| Code | 觸發條件 | 下一步（由使用者確認後操作） |
| --- | --- | --- |
| P_READ_FAILED | 唯一getSource拋錯，包括auth／GET／正規化；不輸出原錯誤 | 核對新副本分享與本機設定，不從此碼猜測確切原因 |
| P_SOURCE_INVALID | parseSource拋既有來源驗證白名單錯誤：URL／SOURCE_UNSUPPORTED／標記missing-invalid-duplicate-gap／答案局部格式 | 核對完整marker及來源格式；不直接輸出私密位置／內容 |
| P_NO_PROTECTION | 正式parser正常返回、所有支援GRID沒有保護規則 | 人工確認保護設定確實保存於本次副本 |
| P_EDITABILITY_UNKNOWN | 可解析且涵蓋答案的非warning規則，其requestingUserCanEdit不是true也不是false（含缺失／null／字串／數字） | 保持UNKNOWN，不改成false；待安全診斷確認後決定下一步 |
| P_NO_ANSWER_MATCH | 所有規則參照均能解析，但沒有任何規則範圍涵蓋validated答案主格 | 核對保護範圍與實際標記／合併主格 |
| P_DENIED_CONFIRMED | 正式parseSource實際拋SHEETS_NOT_EDITABLE | 本項已知保護拒絕條件成立；仍需真人輸出確認 |
| P_WARNING_ONLY | 已解析、涵蓋答案的規則warningOnly===true | 人工確認是否誤設警告；不由程式改權限 |
| P_REFERENCE_UNRESOLVED | 規則range／named／table無法解析，或明確false且涵蓋答案的整表保護有無法解析的例外 | 保留不確定，不猜無匹配／拒絕；再審最小處理方案 |
| P_EXCEPTION_MATCH | 已解析、明確false、非warning規則涵蓋的全部答案均落在適用unprotectedRanges | 人工核對例外；不直接刪除例外或改表 |
| P_EDITABILITY_ALLOWED | 已解析、涵蓋答案的非warning規則requestingUserCanEdit===true | 核對請求身分相關的允許編輯設定，不推定哪個身分／群組造成 |
| P_DIAGNOSTIC_UNAVAILABLE | 非白名單parser例外、診斷結構異常或幾何觀測與正式parser結果不一致 | 停止推斷，保留通用失敗，不降低assertion |

多條規則可輸出多個觀測代碼，非單一根因排序；不回傳每條規則ID、sheetId、座標、來源標題或內容。只要正式parser確認一個拒絕，結果只回P_DENIED_CONFIRMED，不讓其他unknown／warning掩蓋拒絕。此測試仍檢查所有動態答案，不只Q1。

## 遮蔽與安全

不傳遞Google response、error.message／stack／cause／details、credential path、email、ID、答案、座標到結果或logger。runner僅印`protected diagnostic: P_...`，原外層LIVE_ACCEPTANCE_FAILED安全訊息仍保留。測試使用含敏感sentinel的fake錯誤／來源，驗結果僅passed及code且無sentinel／私密欄位。沒有讀取真憑證。

range解釋是測試層幾何鏡像，不是修改權限策略：以原parser驗證後的穩定sheet／位置解析。缺值／null永不轉false；可疑或衝突觀測使用通用碼。未新增Google請求或debug原文輸出。protected原本唯一GET（內含既有有限讀重試）不變，沒有寫入路徑。

## 真正執行的離線驗證

| 命令／範圍 | 預期 | 實際 |
| --- | --- | --- |
| node --test backend/tests/unit/protected-diagnostics.test.js | 固定碼、PASS條件、隱私、多規則／參照／合併位置 | 8/8 PASS |
| npm --prefix backend test | 全部原回歸＋8診斷tests | **165/165 PASS**，0fail／skip／cancel／todo，5904.0864ms；protected-diagnostic-backend.txt |
| npm --prefix frontend test | Session／snapshot／client不回歸 | **15/15 PASS**，425.9383ms；protected-diagnostic-frontend.txt |
| npm --prefix frontend run build | bundle成功 | **PASS**，51modules、691ms；protected-diagnostic-build.txt |
| E2E_FRONTEND_PORT=5273／E2E_BACKEND_PORT=3100；npm --prefix frontend run test:e2e | 隔離埠完整fake E2E | **21/21 PASS**，1.1m；protected-diagnostic-e2e.txt |

先新增測試取得缺helper的RED再實作。初期例外fixture只排除Q1、卻仍禁止同sheet另一答案，正式parser正確拒絕；已修正fixture覆蓋該規則所有匹配答案，不改parser或降低期望。最終另驗真正缺欄位與getSource假冒相同拒絕code不會誤PASS。

既有backend suite內live-gate.test.js會在子程序以RUN=0清空key／ID，驗證live入口停用；這是既有離線gate測試，不執行npm test:live命令，不會認證或呼叫Google。這點與本輪沒有啟用真實protected清楚區分。

61個原保護檔與本輪runtime源碼hash證據見protected-diagnostic-protected.json／protected-diagnostic-runtime.json；三圖不變無需PNG重產。更新候選安全掃描不代表真人測試完成。下一次由使用者自行設定GOOGLE_LIVE_MODE=protected執行並回報新代碼後，才能判斷本項真實結果。
