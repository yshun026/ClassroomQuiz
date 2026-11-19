# T058 UNKNOWN欄位與多規則細分（測試層）

記錄日期2026-11-18。使用者真實回報P_EDITABILITY_UNKNOWN、pass0／fail1／skipped0／exit1，已人工確認完整標記及強制保護／文件Editor但排除保護範圍／無未保護例外。沒有提供該次實際測試日期，不補造。此紀錄不含表名、ID、座標或私人內容；T058仍未通過，總58/64不變。

## 可確認與未知

在未改版的舊helper中，P_EDITABILITY_UNKNOWN只會於GET已完成、正式parseSource正常返回後，由一條可解析、涵蓋有效答案且非warning的保護規則觸發；該欄既非true亦非false。它不代表無保護規則，也不代表GET失敗或標記格式失敗，但不能從舊代碼識別缺欄／null／非布林，亦不能指定是哪一題或哪一條規則。

SHEETS_FIELDS已要求protectedRanges.requestingUserCanEdit、warningOnly、range／namedRangeId／tableId／unprotectedRanges及參照解析資料；getSource將此mask實際附在URL。response.json後normalizeSource只structuredClone及補grid預設，未刪除或填入requestingUserCanEdit；再直接傳入parser及diagnostic。沒有靜態證據支持本地正規化把false改成UNKNOWN。

官方定義核對：
- [ProtectedRange](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/sheets#ProtectedRange)：requestingUserCanEdit是此次請求者能否編輯的唯讀boolean；warningOnly為警告型保護；editors另有可見性限制。不可把editors的限制直接推論為requestingUserCanEdit缺失原因。
- [spreadsheets.get](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get)：fields可選回傳欄位與grid資料，有field mask時includeGridData參數被忽略。現在mask已列grid及protected欄位，不需為此改產品includeGridData。

未取得當次回應的安全摘要前，不能證明Google是否省略欄位／回null／回其他型別；更不能把缺失當false、推論已可編輯、修改DENIED判準或宣稱根因已定位。

## 僅測試層的最小變更

修改backend/tests/helpers/protected-diagnostics.js、backend/tests/unit/protected-diagnostics.test.js。產品SheetsAccess／parser／HTTP／coordinator等均未修改，live runner仍只輸出helper固定code，未新增請求。原有P_EDITABILITY_UNKNOWN／ALLOWED等相容代碼保留，新增觀測：

| Code | 觸發 |
| --- | --- |
| P_EDITABILITY_MISSING | 匹配答案規則沒有自身requestingUserCanEdit屬性，Object.hasOwn=false |
| P_EDITABILITY_NULL | 屬性存在且嚴格等於null |
| P_EDITABILITY_NON_BOOLEAN | 屬性存在但不為null／true／false；不輸出原值或子型別內容。自身undefined只可能出現在非JSON替身，亦屬此類 |
| P_EDITABILITY_TRUE | 匹配規則值嚴格為true，非warning時另帶P_EDITABILITY_ALLOWED |
| P_EDITABILITY_FALSE | 匹配規則值嚴格為false；可能與WARNING_ONLY／EXCEPTION_MATCH共存，不能單憑此碼PASS |
| P_MULTIPLE_MATCHING_PROTECTIONS | 正常返回來源中，有超過一條可解析規則範圍匹配有效答案；一條規則涵蓋多題不算多規則 |
| P_EDITABILITY_MIXED | 上述匹配規則出現超過一種欄位狀態，避免誤認來自同一規則 |

每個觀測只輸出固定碼；按狀態去重仍無規則識別資訊。多規則即使都缺欄，也會有MULTIPLE；不同狀態可一起列出，但不能歸因到單一題目或私人位置。正式parser若先拋SHEETS_NOT_EDITABLE，仍短路只回P_DENIED_CONFIRMED／PASS，沒有為補充觀測重解析來源或改政策；因此PASS時未出現MULTIPLE不證明只有一條規則。

若幾何觀測與正式parser矛盾，仍使用P_DIAGNOSTIC_UNAVAILABLE，不宣稱定位。P_READ_FAILED／SOURCE_INVALID／REFERENCE_UNRESOLVED等原義保持。只有parseSource實際拋SHEETS_NOT_EDITABLE才PASS；任何UNKNOWN細分都不能通過。

## 離線驗證

- 相關diagnostic／parser／Access **48/48 PASS**，0fail／skip，protected-field-state-target.txt。
- 完整backend結果見protected-field-state-backend.txt（更新後167項）；既有停用gate子程序RUN=0且清空key／ID，不是執行test:live命令或真Google。
- 新增fake transport JSON→production getSource→normalizeSource測試，逐個驗missing／null／錯誤字串型別／true／false的屬性存在性與值完全保留；固定tokenProvider及注入fetch只回合成Response，沒有真認證／網路。
- 新增多規則同missing及missing＋null＋非布林混合案例；保留全部既有讀失敗／其他parser錯誤／私密sentinel／DENIED唯一通過條件的assertions。正式產品程式未動。
- 固定碼清單及結果只有passed、codes，無ID／座標／email／內容／path／token／raw error／stack；新測試不輸出輸入值。

本輪未重跑前端／E2E／build（無任何應用變更，上輪15／21／build PASS保留歷史，不宣稱本輪重跑）。本輪只跑相關及完整後端離線，沒有test:live、真Sheets API、讀私人JSON或Token、改表／分享／Cloud、commit／push。先前runtime及001／核心／圖保護hash未改。

## 待使用者授權的最小真實只讀驗證

本輪不執行。經使用者確認後，使用專用終端與既有protected-only模式，僅用同一已配置的服務身分讀專用測試副本；不跑acceptance、不讀B、不呼叫batchUpdate、不改保護或範本。沿用getSource的既有有限GET重試，不能稱保證只有一次HTTP。

只回報protected diagnostic各固定碼、PASS／FAIL／skip及exit；不提供環境值、原始response／錯誤、截圖中的ID或私人資料。若MISSING／NULL／NON_BOOLEAN即維持未確定，不把它改成DENIED；若MULTIPLE／MIXED，需再設計去識別摘要或由使用者確認唯一規則，不能據聚合碼指定某一格。原parser DENIED確認且test PASS才是此項通過；其餘等待審查，不擅改產品。
