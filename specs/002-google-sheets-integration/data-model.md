# Data Model: Google Sheets Guided Notes

**狀態參照（2026-11-18 Final準備）**：下文Phase1未實作為原設計時點；目前實體／transition已於US1–US4實作，離線驗證見[Final矩陣](../../tests/records/002-google-sheets-integration/final-acceptance.md)。本輪不改欄位／安全條件，兩表live／完整人工仍PENDING。

日期：2026-11-18。Phase 1 設計，依 `002-class.puml`；本文件欄位是未實作的技術設計。全部資料在後端程序記憶體，不新增持久庫。

## Existing domain

Activity.phase 仍只有 WAITING／ANSWERING／RESULTS／COMPLETED；Question、Group、Submission、Session 的既有排序、唯一組題、closed 不可逆與角色投影不變。Activity.document 改持有 GuidedNotesSource（沿用 placeholderLocations 介面以減少波及），不再保存 XLSX Buffer／Workbook。

RuntimeStore 的 preparation 設定僅保存 `groupCount: positive safe integer | null` 與 `busy: boolean`。既有變數可保留 preparationDraft 名稱以減少重構，但不得保存 validated document，也不是新的業務階段。setGroups 不建立活動；loadSource 必須先有有效組數，成功後一次建立 Activity。

## Entities and constraints

| Entity | 欄位及型別 | 驗證／生命週期 |
| --- | --- | --- |
| GuidedNotesSource | spreadsheetId: nonempty string；canonicalUrl: string；title: string；supportedSheets: Map<sheetId,SheetBaseline>；excludedSheets: array；placeholderLocations: Map<questionNumber,PlaceholderLocation>；permissionAssessment: UNKNOWN / NO_KNOWN_DENIAL；baselineCellValues: immutable sparse map | 一 Activity 一份；沒有 Google Token／私鑰；NO_KNOWN_DENIAL 只表示查得資訊未顯示拒絕，不是整表可寫保證。若無確切編輯證據，老師顯示「寫入權限尚未確認」；DENIED 只存在於失敗結果，不建 Activity |
| SheetBaseline | sheetId: nonnegative safe integer（0 合法）；title: string；index: nonnegative integer；sheetType: GRID；hidden: boolean；rowCount/columnCount: positive safe integer；merges: normalized GridRange[] | title／index 為顯示資訊，可更名重排；身分用 sheetId，不混用 spreadsheetId 或 Excel worksheetId。grid dimensions／merges 變更則衝突 |
| PlaceholderLocation | questionNumber: positive safe integer；sheetId: nonnegative safe integer；sheetTitle: string；rowIndex/columnIndex: nonnegative safe integer；cellAddress: derived string；originalPlaceholder: exact string；mergeRange: GridRange or null | regex 整格 `{{Qn}}`、Q1..QN 唯一連續；合併格只取左上 master。拒絕 formulaValue 及含 textFormatRuns／chipRuns 的標記格；一般 userEnteredFormat 保留 |
| ClosedWinnerSnapshot | activityId: string；sourceId: string；capturedAt: ISO time（只供記錄）；fills: immutable ordered array of {questionNumber, location copy, answerText} | 同步入口複製閉題最小 rank 答案；答案不可被後續提交或更換來源改寫。時間不參與 rank |
| WritebackOperation | id: random UUID；activityId: string；status: enum；revision: positive integer；kind: INITIAL / RECONCILE；snapshot: ClosedWinnerSnapshot；items: Map<questionNumber,WritebackItem>；running: boolean；unresolvedAttempt: boolean；lastError: safe summary or null；attempts: array | 每場活動最多一個 running 或 pending barrier。status／revision 與搶答版本獨立。歷史 terminal 操作保留供遺失回覆查詢 |
| WritebackItem | questionNumber；location；expectedText: exact string；state: NOT_WRITTEN / VERIFIED / SKIPPED_VERIFIED / CONFLICT / UNKNOWN；safeReason: nullable string | VERIFIED 需讀回 stringValue 精確相等且位置／格式核對；原標記且無權限／格式衝突才能列 NOT_WRITTEN。無依據答案相同不視為先前成功 |
| WriteAttempt | id: UUID；sent: boolean；transportState: NOT_SENT / IN_FLIGHT / SETTLED；remoteOutcome: NOT_SENT / KNOWN_REJECTED / APPLIED / UNKNOWN；targetQuestionNumbers: immutable array；startedAt/endedAt: nullable ISO | 本機 settle 不自動等同遠端終止；UNKNOWN 舊 attempt 有殘留未完成目標時不得盲重送。無私密 request／headers／body 原始錯誤 |
| WritebackEvidence | activityId；spreadsheetId；questionNumber；sheetId／rowIndex／columnIndex；exactText: string；verifiedAt: ISO；operationId: UUID | 一題成功證據供後續位置核對；只由讀回建立，可重驗更新 verifiedAt；不可跨活動沿用，重啟可清空 |

## Permission assessment

優先處理已知非 warning-only 保護範圍的 `requestingUserCanEdit:false`（扣除 sheet protection 的 unprotectedRanges，解析 namedRange／table 參照）；命中任一答案格回 DENIED，準備拒絕。無法取得／解析或僅來源可讀為 UNKNOWN；不是 false，不因此拒絕有效來源。NO_KNOWN_DENIAL 不能在 UI 說「權限已保證」，仍由每次寫回重新判定。文件層不可編輯若有確切 API 證據同樣 DENIED，不使用測試寫值。

## Operation state transitions

| 目前狀態 | 行為／條件 | 結果 |
| --- | --- | --- |
| 無操作或前次 terminal | teacher POST writeback；同步驗權／activity、複製快照、取得所有權 | PRECHECKING，revision=1，running=true；無 fills 直接 NO_CHANGES，不呼叫 Google 寫入 |
| PRECHECKING | 全原位置／結構、所有未替換標記與 Evidence 核對成功 | WRITING；只有仍需寫的格送出一次 batch |
| PRECHECKING | 全為有證據且吻合的已寫格 | SUCCEEDED（items=SKIPPED_VERIFIED），無寫入 |
| PRECHECKING | 已知衝突／權限拒絕／無法表示值 | CONFLICT 或 FAILED；零尚未送出的寫入 |
| PRECHECKING | 讀取／認證失敗且從未送寫 | FAILED；保留活動，可由新明確操作重試 |
| WRITING | 已知 Google 接受 | VERIFYING；讀回原快照，不能只憑 2xx 宣稱成功 |
| WRITING | 確定未送出／明確拒絕 | FAILED（若部分為舊 VERIFIED 仍如實列出）；不回滾 |
| WRITING | timeout／斷網／未知 5xx | PENDING_VERIFICATION；保留原快照與 barrier，running 可等 transport settle 後釋放 |
| VERIFYING | 全部精確吻合且結構一致 | SUCCEEDED，建立 Evidence；無人或未閉題從來不列 fills |
| VERIFYING | 讀取失敗、值仍原標記而送達不明 | PENDING_VERIFICATION；逐題 UNKNOWN／NOT_WRITTEN，不宣稱全部成功 |
| VERIFYING | 格址／格式／值被非預期改變 | CONFLICT；若有遠端不明 attempt，unresolvedAttempt 屏障仍保留 |
| PENDING_VERIFICATION 或 CONFLICT 帶 unresolvedAttempt | teacher POST reconcile 同 operation；無 running | PRECHECKING（kind=RECONCILE），只處理原快照；先讀全部原目標及歷史 Evidence |
| RECONCILE | 全目標已為預期文字並核對映射 | SUCCEEDED；舊可能晚到值皆相同，不會改成新答案，但不能宣稱識別了寫入者 |
| RECONCILE | 有原標記且無法確定舊 attempt 已終止 | PENDING_VERIFICATION，允許讀查，不送第二次寫；沒有遠端取消／定時清鎖捷徑 |
| RECONCILE | 有原標記、全部 preflight 通過且舊 attempt 可安全排除 | 只寫尚未完成目標，仍為原 snapshot；再驗證 |
| 任一 running | 第二個 POST | WRITEBACK_BUSY；不建立另一個 worker |
| 任一 pending barrier | 新 POST writeback | WRITEBACK_PENDING；回原 operationId，須先 reconcile，不擷取新快照 |

terminal = SUCCEEDED / NO_CHANGES / FAILED / CONFLICT 且無 unresolvedAttempt。操作狀態不是 Activity.phase；失敗不改 Question.closed／rank。所有狀態更新短同步完成，I/O 不在 dispatcher 內。

IN_FLIGHT 必須始終 running=true；即使讀回已吻合，也要等本機 transport settle 才可解除 running／建立新操作。settle 不等於遠端取消，unknown 殘留標記仍按上表維持 barrier。

## Structural and value invariants

1. 新活動初次讀取要求完整 Q1..QN；之後按活動原位置及 Evidence／pending 預期替換核對，不能重新要求所有原標記仍存在。
2. 每次 preflight 檢查全部支援 GRID 身分／dimensions／merge、所有原題位置與額外標記。答案恰與別題標記相同，先按既有位置辨識合法答案，不重新計為題目。
3. 非目標原始 userEnteredValue 變更採保守衝突（公式比定義，不比 effectiveValue）；表名／排序可變且不改 ID。這能偵測現存結構差異，不保證看見曾發生又還原的外部編輯。
4. 答案格新 textFormatRuns／chipRuns、formulaValue 或不明確位置變更皆衝突；普通整格格式只讀不改。對每次 batch 的全部目標通過後才可送出，無 forced overwrite。
5. pending 恢復先驗原操作和先前 Evidence。已驗證格後來變更，不能用原標記重現就繞過，仍需人工排除衝突；不因字串恰相同就補造歷史成功證據。
6. 雲端結果、permissionAssessment、operationRevision 與錯誤 details 只給老師；學生 view 及其 revision 完全不增加相關欄位或事件。老師 quiz stateRevision 不因雲端操作遞增。
7. 重啟清空所有本機實體，不取消遠端請求、不還原標記；必須先確定舊寫入結果再人工重用範本。
