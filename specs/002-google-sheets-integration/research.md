# Research: Google Sheets Guided Notes 直接整合

**狀態參照（2026-11-18 Final準備）**：研究當時未安裝／實測等描述保留為歷史，Decision不變；目前google-auth-library鎖定11.3.4，US1–US4已獲使用者接受，離線實作／API契約已驗證。使用者局部真實成功與完整live／manual缺口分列[Final矩陣](../../tests/records/002-google-sheets-integration/final-acceptance.md)，不擴大為兩表驗收通過。

日期：2026-11-18。Phase 0 技術研究；只查文件與現有程式，未安裝套件、建憑證或實測 Google。輸入為已確認 spec 及 `diagrams/002-*.puml`。所有選擇以下列 Decision 為準，環境驗收另標 NOT RUN。

## R1 — 保留本機架構與同步裁定

- **Decision**：保留 Node.js 24、JavaScript ES modules、React／Vite、Express／Socket.IO、單程序記憶體。Google 網路 I/O 位於同步 CommandDispatcher 之外；只在同步短命令中驗權、鎖定／複製快照及提交結果。既有 QuestionService／SubmissionService 的排序不加入 await。
- **Rationale**：目前 ActivityService 已將非同步解析放在同步入口外；此分層可延續。寫回進度使用獨立 operationRevision 及老師專用 HTTP 查詢，不加入搶答 stateRevision／studentViewRevision。
- **Alternatives considered**：資料庫、分散式鎖、Socket 業務寫回入口皆不需要；不增加第五個活動階段。

## R2 — 後端服務身分與最小存取

- **Decision**：採 `google-auth-library` 的 GoogleAuth／Service Account JWT 取得短效存取 Token，scope 僅 `https://www.googleapis.com/auth/spreadsheets`。JSON key 路徑由後端 `GOOGLE_APPLICATION_CREDENTIALS` 指定，必須在 repository 外；不使用使用者 ADC 登入、不委派網域使用者、不使用 API key 代替寫入認證。
- **Rationale**：每份來源先分享給服務帳號電子郵件；Cloud IAM 角色不自動取得文件權。老師／學生僅沿用本系統身分。Sheets scope 不能限定單一分頁，文件 ACL、保護範圍與本機老師驗權共同約束。
- **Alternatives considered**：老師 OAuth、Drive 搜尋、網域委派、前端 Google SDK 均超出已確認流程。若學校禁止 key 或分享，先回報環境阻礙；不自行降權或改登入方式。
- **Sources**：[Google credentials](https://developers.google.com/workspace/guides/create-credentials)、[scopes](https://developers.google.com/workspace/sheets/api/scopes)、[官方 Node auth library](https://github.com/googleapis/google-auth-library-nodejs)、[key 管理](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)。
- **Dependency boundary**：只規劃後端新增此一直接依賴，實作時核對 Node 24 engines、精確版本並鎖入 backend lockfile；本輪不安裝、不聲稱版本相容已測。Token 不寫磁碟、前端或一般錯誤物件。

## R3 — 可控單次傳輸，避免隱藏重送

- **Decision**：GoogleAuth 只負責取得 Token；實際 Sheets HTTP 使用 Node 24 原生 fetch，固定 `https://sheets.googleapis.com/v4/`，redirect:error。不呼叫 authClient.request／通用 SDK 的自動業務重試。寫入每次 attempt 只呼叫一次 fetch，不自動 refresh-and-replay；401 後下一次明確操作才取新 Token 及重新核對。
- **Rationale**：Token endpoint 重試不會改 Sheets；業務寫入是否重送則必須由 WritebackCoordinator 知道。外部網路等待不佔用 dispatcher。測試 transport injection 可控制真正呼叫次數。
- **Alternatives considered**：googleapis 是有效 SDK，但本案只需 get／batchUpdate，通用 SDK 重試及認證 replay 增加稽核面；手工簽 JWT 則重複官方認證責任。
- **Sources**：[Node 24 fetch](https://nodejs.org/docs/latest-v24.x/api/globals.html#fetch)、[Auth Library](https://github.com/googleapis/google-auth-library-nodejs)、[OAuth request replay 說明](https://googleapis.dev/nodejs/google-auth-library/latest/classes/OAuth2Client.html)。
- **Timeout policy（A2 修訂）**：每次 getSource／verify 的單一邏輯讀取總預算為 **100,000 ms**，從開始取 Token 起算，包含認證等待、HTTP、讀取／解析 body、退避及 Retry-After；採 monotonic deadline，不因重試重設。每 attempt 上限 min(30,000 ms, 剩餘預算)，最多 **3 次（含首次）**，只對 429、5xx、網路錯誤或讀取 timeout 重試；其他 4xx／來源解析錯誤不重試。deadline 到即結束本次讀取並回安全錯誤，不能採用晚到回覆或再啟動 Sheets 請求；無法取消的 Token promise 亦只忽略其晚到結果。
- **Read backoff**：第 1／2 次重試的 base 為 1,000／2,000 ms；jitter 為可注入 RNG 產生的均勻整數 **0–250 ms（含端點）**。有效 Retry-After 支援非負整數 delta-seconds 或 HTTP-date；日期以收到回應時的 wall clock 換算非負等待時長，再以 monotonic clock 等待，過去日期為 0，缺漏／無效值不提供額外下限。delay = max(base + jitter, Retry-After 時長)。若 delay >= 剩餘總預算，不縮短伺服器指定等待、不再重試，立即回最後安全的錯誤分類；否則等待後再按剩餘預算開始 attempt。時鐘／RNG／transport 可注入，測 3 次上限、jitter 0／250、長／無效／日期 Retry-After、總預算截止及晚到忽略。
- **Write isolation**：上述重試／100 秒預算只適用 GET 讀取，不適用 writeValues 或重新送出業務 body。寫入等待上限仍為 **200 秒**的本機資源界線，不是遠端取消保證；結果不明依 R8 保留原操作與屏障。前端 POST 立即得到 operation，後端可繼續；查詢狀態不觸發寫入。

## R4 — 全工作表讀取、稀疏資料與原標記

- **Decision**：一次 spreadsheets.get，不設 ranges 以保留全部分頁覆蓋；用 fields 指定 spreadsheetId／title、sheets.properties（sheetId/title/index/sheetType/hidden/gridProperties）、merges、protectedRanges、namedRanges 與 grid data 的 startRow/startColumn/rowData.values。儲存格至少讀 userEnteredValue、userEnteredFormat、textFormatRuns、chipRuns；另讀必要保護範圍參照解析資料。隱藏 GRID 也處理，其他 sheetType 列為 excluded。
- **Rationale**：顯示值／計算值可能把公式偽裝成標記；只接受 userEnteredValue.stringValue 完整符合既有 regex。startRow/startColumn 與空列／空格偏移必須計入；不能以陣列非空項次推算列欄。所有資料讀取成功且組數有效，才 commit；不保留已驗證來源草稿。
- **Alternatives considered**：values.get 的預設格式化值無法同時驗證公式、merge 與局部格式；固定分頁／固定區域違反動態辨識。大表可由實作採等價全覆蓋讀取，但不能靜默截斷支援分頁。
- **Sources**：[get](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get)、[GridData／Sheet](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/sheets)。
- **Parser**：保留 `/^\{\{Q([1-9][0-9]*)\}\}$/`、safe integer、全支援表唯一 Q1..QN、疑似錯誤標記拒絕。merge 主格只算一次。不能預設固定題數、列數、表名。非支援分頁顯示名稱／類型，不當成空白 GRID。

## R5 — 已知不可編輯與未知權限

- **Decision**：用 Sheets 已回傳的 ProtectedRange.requestingUserCanEdit、warningOnly、range 與 unprotectedRanges 判斷具體答案格；解析 namedRangeId／tableId 時若無足夠資訊，不猜 false，記 UNKNOWN。強制保護且明確不可編輯的答案格 → DENIED，準備拒絕。一般讀取成功而沒有確切文件級可編輯證據 → UNKNOWN，允許來源並警告；沒有 protection 不代表擁有編輯權。
- **Rationale**：Clarify Q2／Q3 不要求增加 Drive API 只為證明文件可編輯；不能靠 editors 清單缺少服務帳號就判定（可能群組／繼承且欄位不可見）。warningOnly 不是強制拒絕，sheet protection 的 unprotectedRanges 必須扣除。已知拒絕優先於未知。
- **Alternatives considered**：測試寫值被禁止。Drive files.capabilities.canEdit 可做文件級參考，但需增加 API／scope；首版不需要，未知就明示。實際收到權限拒絕時不能當成本機 Token 失效。
- **Source**：[ProtectedRange](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/sheets#ProtectedRange)。
- **Validation**：用 fake 明確覆蓋 DENIED／UNKNOWN／可編輯 protection；真表另驗唯讀、不可編輯答案格及撤權，未知提示不可當失敗。無測試寫入的保護預檢不保證後續權限不變。

## R6 — 寫回範圍與格式

- **Decision**：每個待寫答案建一個單格 updateCells：start={sheetId,rowIndex,columnIndex}，rows 只有該格 userEnteredValue.stringValue，fields=`userEnteredValue`。一次 spreadsheets.batchUpdate 提交所有本輪待寫格，不 clear、不 append、不寫整列、merge、格式或工作表結構。
- **Rationale**：sheetId 在表名更動／重排後仍可定位；字串 `=1+2` 不當 formulaValue。使用精確 start 避免指定過大 range 清除未填資料。Google 批次原子性不代表前置讀取與寫入是同一交易。
- **Alternatives considered**：Values API RAW 也能寫文字，但 GridCoordinate 更直接避免 A1 表名 escaping；不採 USER_ENTERED 或以下載再上傳達成保真。
- **Sources**：[UpdateCellsRequest](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request#UpdateCellsRequest)、[batchUpdate](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate)。
- **Clarify Q1**：答案格只要含 textFormatRuns 就拒絕（含整段以 run 表示的格式，避免轉換猜測），chipRuns 亦不能當一般純文字標記。非答案格 runs 不寫不動；目標 userEnteredFormat 留原值。Google 新值會清除舊 runs，此限制已由使用者確認，不能在實作靜默移除。寫前新增 runs 則衝突。[CellData](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells)
- **Representability**：拒絕未配對 UTF-16 surrogate 或無法精確儲存的答案，不修改已接受 Submission，也不自定新的搶答字數限制；遠端拒絕／讀回差異明確回報，不宣稱任意控制字元已保真。

## R7 — 結構基準與證據，不重新以完整標記當門檻

- **Decision**：來源保存穩定 sheetId、GRID 類型、grid row/column counts、merge 範圍、原題號→位置及來源 userEnteredValue 稀疏基準。每次 preflight 讀回完整支援 GRID 的值／結構，按位置先將本活動 Evidence／原 pending 預期答案視為合法替換；再檢查未被替換的原標記與額外疑似標記。非目標 userEnteredValue 相較基準的變動採保守衝突；非答案的字型／底色人工改動不由系統覆寫。
- **Rationale**：若只驗目標字串，插列／複製標記可誤定位；若無條件重新 regex 掃描則已寫答案會被誤判缺題。先按活動映射識別合法替換，答案恰為 `{{Q2}}` 也不重新當新題。更名／重排只更新顯示資訊，sheetId 與其他核對一致即可。
- **Alternatives considered**：developerMetadata／命名區域可追蹤移格，但會改原表且本版不自動重新綁題；不引入。整表鎖定或任意協作者同時改結構不在已確認邊界。
- **Inference**：以上是本專案選擇的保守變更偵測，Google API 不提供該指紋驗證或跨兩請求 CAS 保證。即使回前基準相同也無法辨識未留痕的插刪復原；依 A-04 不承諾任意外部並行下絕對安全。

## R8 — 寫回操作狀態與結果不明

- **Decision**：每場活動一個 executing/pending barrier；新操作在同步短命令中複製所有 closed winners、建 operationId／revision。全部 preflight 通過才送單一 batch；之後全目標讀回精確字串／型別。Evidence 只由讀回吻合建立。明確未送出／400 授權等已知拒絕可 FAILED；傳送後網路、5xx、timeout 一律 PENDING_VERIFICATION。
- **Recovery**：手動再次處理同一 operation，讀回其所有目標並結合歷史 Evidence；吻合答案 → VERIFIED，原標記 → NOT_WRITTEN，其他值／格式／位置 → CONFLICT。任一衝突停止未送出的全部更新。無衝突且無舊 attempt 執行／未確定終止時，才可再次送出仍為原標記的格。部分讀回不可稱整批成功。
- **Late request safety**：HTTP 用戶斷線不取消 worker；只有本機舊 attempt 已 settle 且可確認遠端終止，或所有舊 attempt 的寫入目標均已驗證為同一不可變答案，才能解除新快照 barrier。若永遠無法證明舊請求終止且還有原標記，保持 PENDING（只讀核對），不以讀到原標記就重送；回報尚無法安全恢復。此分支是安全失敗，不承諾一定自動恢復。
- **Local ownership**：上述解除屏障的兩種情況均須本機舊 transport 已 settle；IN_FLIGHT 永遠保持 running，不能僅因讀到答案就並行送下一個操作。settle 後若遠端仍 UNKNOWN，僅在舊寫所有目標皆為同一不可變答案並驗證完畢時，才可用內容已同步解除 barrier；無法證明的殘留標記仍保持 pending。
- **Rationale**：官方 180 秒是伺服器處理時限，不是從本機 sentAt 起的端到端取消證明。不能把 sleep 180 秒當鎖定／取消保證。後端重啟會丟失 barrier，因此重用原表前須等待已送請求結果確定並人工檢查，不因重啟代表遠端取消。
- **Alternatives considered**：背景重試、逾時就清鎖、整表 rollback、重新取得較新閉題快照替代原 pending 均拒絕。
- **Sources**：[limits](https://developers.google.com/workspace/sheets/api/limits)、[batch 原子與協作者限制](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate)。

## R9 — 配額、測試與相容性關卡

- **Decision**：批次操作、全活動互斥；不隨學生提交呼叫 Google。讀取可有限退避，寫入不自動重試。Google 建議請求 payload 約 2 MB 以內；送出前若本活動 batch 超過 2 MiB，整次明確拒絕為 WRITEBACK_TOO_LARGE，不偷偷分批造成部分寫入。此是寫回相容性界線，不限制搶答接受答案；需調整則回設計審查。
- **Rationale**：單機課堂範圍不需水平擴充；採保守錯誤可驗收，不能用抽樣／截斷換取成功。大型來源記憶體／讀取超時會明確失敗，不部分建立活動。
- **Testing decision**：單元與 fake integration 覆蓋錯誤及時序；E2E 驗老師／三組；live Google suite 與人工驗收另用兩份事先授權真表，標明 NOT RUN 直到執行。實作前有 transport contract tests 證明無隱藏寫重送；文字精確性與整格／非答案格式需真表測試。
- **Source**：[Google limits](https://developers.google.com/workspace/sheets/api/limits)。

## Research conclusion

技術選擇已定，無需求澄清待答；非破壞性權限資訊不足遵循 Q3，答案格 runs 依 Q1 拒絕。R7／R8 在 A-04 受控編輯前提下可設計成偵測衝突即停止，不將 API 限制誤報為獨占交易。RG-005 設計可行性已以文件分析評估，實作／真表驗證仍 NOT RUN。若實際範本必須支援局部格式、任意並行編輯或無法表示字串，應回報並審查，不降低規格。
