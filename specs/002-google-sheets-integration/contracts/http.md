# HTTP Contract — Feature 002

**狀態參照（2026-11-18 Final準備）**：下文未實作為Plan歷史時點；目前routes已於US1–US4實作及離線測試，合約不變。[Final矩陣](../../../tests/records/002-google-sheets-integration/final-acceptance.md)區分fake／使用者局部真實成功／未執行完整live與manual，最終接受PENDING。

日期：2026-11-18。未實作合約；base `/api`、JSON UTF-8、既有 Bearer opaque Session、固定 localhost origin 不變。以下只描述本次變更；既有 login／group／start／submit／close／next／results／Socket 合約沿用 001。

## Routes

| Method / path | Request / role | Response |
| --- | --- | --- |
| PUT /preparation/groups | teacher；`{groupCount}`，正整數，尚未建立活動 | 200 準備 view；只設組數，不建立 Activity；busy／locked 409 |
| POST /preparation/guided-notes | teacher；`{spreadsheetUrl}`，拒絕 file／ID／cell／其他未知欄位 | 201 準備成功後教師 activity view；僅有效組數、完整解析且無已知寫入拒絕才一次建立；失敗不保存來源草稿 |
| GET /activity | teacher/student；既有角色驗權 | quiz 投影沿用；teacher 可有準備組數，不在 quiz snapshot 混入可獨立變更的寫回狀態；student 無來源／操作欄位 |
| GET /activity/guided-notes?activityId=... | teacher，活動識別必須相符 | 200 NotesView：來源摘要、權限提示、最新寫回摘要；此為老師專用資料，不走 quiz revision 比較 |
| POST /activity/guided-notes/writeback | teacher；`{activityId}`，不接受來源／題號／答案／格址 | 202 建立 operation，回 WritebackView；無 fills 回 200 NO_CHANGES，無遠端寫入。處理中的第二次要求 409 BUSY；pending 時 409 PENDING 並指原 operation |
| GET /activity/guided-notes/writebacks/:operationId?activityId=... | teacher；原活動與 operation 均須有效 | 200 WritebackView；純查詢，無遠端寫入、不自動 reconcile |
| POST /activity/guided-notes/writebacks/:operationId/reconcile | teacher；`{activityId}`，僅原 pending 或仍有 unresolvedAttempt 的 conflict | 202 原 operation（保留原快照，revision 遞增）；若執行中 409 BUSY；不建立新快照，不承諾一定可重送 |
| GET /activity/guided-notes/export | 未登入／student 先依既有驗權拒絕；teacher | 410 EXCEL_FLOW_RETIRED，說明改用手動原表寫回；不下載 XLSX |

POST 202 代表操作已接受，不代表雲端已寫入。後端 worker 與 HTTP 連線斷開解耦；client timeout 先查老師 NotesView 找 operation，不重送 POST。手動重新取得狀態或老師頁刷新可恢復最新操作摘要；不自動送 reconcile。UI 可在操作進行期間每 1 秒只查本機 GET，terminal 後停止，不輪詢 Google。不新增對學生 Socket 的通知。

## Request validation and source URLs

- 驗權在任何 Google 呼叫之前；後續 worker 回存狀態前校驗原 activityId／operationId／所有權，延遲舊回覆不接管新活動。
- URL 必須 https、hostname 精確 docs.google.com、無帳密／自訂 port；pathname `/spreadsheets/d/<id>/...`，ID 只允許字母數字底線及連字號；拒絕 `/d/e/` 發佈、短網址、非 Google 與 path traversal。只解析不 fetch 網址，無 redirect 跟隨。
- query／fragment 可含 gid，僅顯示用途，不縮小全 GRID 掃描；canonicalUrl 由已驗 ID 生成，不保存任意 query／fragment 或分享 Token。
- 同活動建立後鎖定來源。新的不同試算表需另一場活動（目前重啟建立），且每份來源事先分享服務身分及完整標記。

## Views

NotesView：

```json
{
  "activityId": "opaque-activity-id",
  "source": {
    "title": "Guided Notes",
    "url": "https://docs.google.com/spreadsheets/d/example-id/edit",
    "supportedSheetCount": 2,
    "excludedSheets": [],
    "writePermission": "UNKNOWN",
    "permissionMessage": "寫入權限尚未確認"
  },
  "latestWriteback": null
}
```

範例 ID 皆示意，不是固定來源。writePermission 可 UNKNOWN／NO_KNOWN_DENIAL；後者訊息須解釋為未查得拒絕、非未來可寫保證。已知 DENIED 讀取回錯誤，不形成此 Activity。

WritebackView：

```json
{
  "activityId": "opaque-activity-id",
  "operationId": "random-uuid",
  "operationRevision": 1,
  "status": "PRECHECKING",
  "running": true,
  "canReconcile": false,
  "items": [{"questionNumber": 1, "state": "UNKNOWN"}],
  "message": "正在核對原試算表"
}
```

完整 operation enum、items 與 transition 見 `../data-model.md`。items 可帶老師可見表名／cellAddress、reason，不回傳 Google 原始 request／憑證；成功答案已有教師 publishedResults，不需複製到錯誤 details。status 包含 NO_CHANGES、PRECHECKING、WRITING、VERIFYING、PENDING_VERIFICATION、SUCCEEDED、FAILED、CONFLICT。所有操作視圖只以同 activityId／operationId／operationRevision 去除舊回覆；不要送入既有 acceptSnapshot 的 stateRevision 分支。

canReconcile=true 表示可以手動啟動核對，不保證可以安全重送。有舊寫 attempt 未 settle 則 running=true；若永久遠端不明，核對後仍可保持 PENDING。所有 terminal 與 pending 都顯示逐題狀態，不把部分 VERIFIED 當 SUCCEEDED。

### 目前操作與跨操作晚到回覆（A1）

- operationRevision **只在同一 operationId 內比較**，不可比較不同 UUID 的 revision 或時間戳推定先後。前端記憶體維護 currentOperationId、viewEpoch 及 discoveryGeneration，均不持久化，不改後端 quiz revision。
- Session／activity 改變，以及每次手動 writeback／reconcile 開始前，先遞增 viewEpoch、停止舊輪詢並使舊請求失效。新 writeback 清除 currentOperationId，reconcile 則綁定原 ID。每個 POST／GET 都捕捉 Session 世代、activityId、viewEpoch；任何一項不符，回覆與錯誤均不得變更目前畫面或重新啟動輪詢。
- POST 成功只在上述上下文仍有效時採用回傳 ID。POST 尚待回覆時，不用 Notes 查詢切換目前操作；回覆遺失／不明時，先再遞增 viewEpoch 使遲到 POST 失效，再查 NotesView 恢復操作，不重送 POST。BUSY／PENDING 回覆亦先進入此唯讀恢復流程，不自動 reconcile。
- 首次載入／刷新／上述恢復時，以 NotesView 作操作發現。每次發現請求遞增 discoveryGeneration，只接受同 epoch 且最新 generation 的結果，才設定其 latestWriteback ID（可為 null）。operation GET 只能更新 currentOperationId 相同且 revision 不較舊的資料，不能自己選擇另一個操作。其他老師頁籤的新操作由明確的 Notes 重新查詢發現，不以舊操作 polling 切換。
- 必測：操作 A 的高 revision 回覆，在 B 的 POST 成功或有效 Notes 發現 B 後抵達，仍須忽略；較舊 Notes 回覆不能把 B 換回 A；同 ID revision 倒序、POST 遺失後晚到、Session／activity 改變也須忽略。不新增資料庫、伺服器全域操作排序或遠端請求取消保證。

## Error envelope and mapping

沿用 `{error:{code,message,requestId,details?}}`，requestId 為亂數，不含全域計數、Google 回應原文、stack、Token、私鑰或答案。

| HTTP | Codes / semantics |
| --- | --- |
| 400 | INVALID_INPUT、INVALID_GROUP_COUNT、SHEETS_URL_INVALID |
| 401 / 403 | SESSION_INVALID／TEACHER_REQUIRED，僅本機身分；Google 401 不清除老師 Token |
| 404 | ACTIVITY_NOT_READY、WRITEBACK_NOT_FOUND |
| 409 | PREPARATION_BUSY／LOCKED、STALE_ACTIVITY、WRITEBACK_BUSY、WRITEBACK_PENDING、WRITEBACK_NOT_PENDING；pending 可安全帶 operationId |
| 410 | EXCEL_FLOW_RETIRED |
| 422 | PLACEHOLDER_MISSING／DUPLICATE／INVALID、QUESTION_GAP、ANSWER_CELL_FORMAT_UNSUPPORTED、SHEETS_NOT_EDITABLE、SOURCE_UNSUPPORTED、ANSWER_NOT_REPRESENTABLE、WRITEBACK_TOO_LARGE |
| 502 / 503 / 504 | SHEETS_UNAVAILABLE、GOOGLE_AUTH_UNAVAILABLE、SHEETS_RATE_LIMITED、SHEETS_TIMEOUT；上游無權／不存在無法區別時用 SHEETS_ACCESS_UNAVAILABLE，不誤稱檔案刪除 |

建立 operation 後的寫回錯誤保存為該 operation FAILED／PENDING／CONFLICT，以 GET 200 的狀態呈現，不回 generic 500 讓 client 以為無寫入。準備期錯誤才用上列 HTTP envelope。Google 5xx／timeout／網路錯誤若可能已送寫，必須 pending，不能只依 HTTP 類別標為確定失敗。

## Security and synchronization

逐次驗 teacher，不信任 role／group／client rank；來源與位置只能從 Activity 取得。NotesView 與 WritebackView 不送到學生、Socket ack 或學生 headers；更新操作不增加 quiz stateRevision，也不改 studentViewRevision。學生已閉題結果仍照舊公開。錯誤顯示繁中並提供分享／標記修正方向，不導向 Google 使用者登入。
