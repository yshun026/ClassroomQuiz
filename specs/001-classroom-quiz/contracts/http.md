# HTTP Contract

Base: 同源 `/api`；JSON UTF-8，答案文字不得作 HTML／公式執行。此為介面設計，未實作。
所有受保護請求 `Authorization: Bearer <server-issued-token>`；token 不是使用者自訂組號。
activityId/questionNumber 必須與目前活動／題目相符；不接受 client rank、timestamp、role 或 group 作權威來源。

## Routes

| Method / path | Role and request | Success response / semantics |
| --- | --- | --- |
| POST /teacher/login | 未登入；{password} | 200 {token,role:"teacher"}；密碼只與後端環境設定比對 |
| PUT /preparation/groups | teacher；{groupCount} | 200 準備狀態；僅正整數且尚未建立 Activity；一旦 commit 409 |
| POST /preparation/guided-notes | teacher；multipart field file (.xlsx) | 201 建立完整 Activity 或 200 已驗證檔案待組數；不回傳原檔或解題資訊 |
| GET /activity/join-options | 無需 Token | 200 {activityId,phase,currentQuestionNumber,availableGroupNumbers,occupiedGroupNumbers}；尚無活動 404；只含占用而非作答狀態 |
| POST /activity/groups/claim | 無學生 Token；{activityId,groupNumber} | 201 {token,role:"student",groupNumber,view}；若帶有效學生 Token，拒絕改占其他組並可恢復原綁定；占組與 Session commit 原子完成 |
| GET /session | teacher/student Token | 200 {role,activityId,groupNumber?}；查驗有效性；無效 401，不回傳 Token |
| GET /activity | teacher/student Token | 200 依角色 view；無活動老師可得 preparation，不暴露檔案或密碼 |
| POST /activity/questions/start | teacher；{activityId,questionNumber} | 200 {activityId,stateRevision,phase,currentQuestionNumber}；僅 WAITING |
| POST /activity/questions/close | teacher；相同識別欄位 | 200 相同狀態 envelope；僅 ANSWERING，最後題直接 COMPLETED |
| POST /activity/questions/next | teacher；相同識別欄位指向即將離開的題 | 200 下一題 WAITING；僅非最後題 RESULTS |
| POST /activity/submissions | student；{activityId,questionNumber,answerText} | 201 {activityId,studentViewRevision,questionNumber,ownSubmission:{submitted:true,answerText}}；不含全域版本、順位或他組資料 |
| GET /activity/questions/:number/results | teacher/student Token | 200 已結束題結果；未結束學生 409 QUESTION_NOT_CLOSED，不能洩漏狀態；老師即時資料從教師 view 取得 |
| GET /activity/guided-notes/export | teacher；query activityId | 200 XLSX attachment；原檔內容類型 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet；任意已準備階段均可 |

只要組數及已驗證文件都齊備，最後完成的準備操作才同步 commit Activity；非同步解析檔案時禁止
其他準備寫入，回 PREPARATION_BUSY，避免兩份同時匯入覆蓋。失敗釋放鎖，可重試；無半場活動。
老師 GET /activity 在未準備時可得 {prepared:false,groupCount?,documentValidated:false/true}，
學生未準備得 ACTIVITY_NOT_READY；準備狀態不是第五個活動階段。

## Views

共同業務 envelope：{activityId,phase,currentQuestionNumber,questionCount,publishedResults}。
未準備時用上述 preparation envelope，不傳不完整 Activity。

- teacher view 加 stateRevision（全域）、groups（組號、占用、當題 submitted）、currentSubmissions（groupNumber,answerText,receiveRank）。
- student view 加 studentViewRevision（該 Session 的可見資料版本）、ownGroupNumber、ownSubmission（submitted,answerText?）。
  未結束當題不得出現 currentSubmissions、receiveRank、winnerGroup、submittedCount 或他組 submitted 欄位。
- publishedResults 僅含 closed 題，每題 {questionNumber,submissions:[{groupNumber,answerText,receiveRank}],
  winnerGroupNumber:null/number,noAnswers:boolean}。其他已結束題可見，不因當題開放而隱藏。
- 任何錯誤 details 也不能洩漏當題他組答案／順位／提交狀態；重複提交只回代碼，原答案另由 own view 查詢。
- 同題結果端點與狀態查詢不修改 Activity、sequence 或 revision。

studentViewRevision 初始為 0，只在該 Session 可見業務投影改變時加一，不能由全域
stateRevision、他組提交數、輪詢／重連次數推算。單一同步入口先更新投影版本，再回覆或推送，
確保 HTTP 與 Socket.IO 使用相同版本。重複讀取、失敗、同內容重連快照不遞增。
學生所有 HTTP 回覆（含 claim 的 view、Session、錯誤及結果查詢）不得包含全域 stateRevision
或內部 commandSequence；不以 ETag／自訂 header 暴露全域計數。requestId 使用隨機值。
他組提交且本組狀態、階段及題號不變時，學生業務投影及 studentViewRevision 必須保持不變。
已結束結果中的公開 receiveRank 依原規格提供，不屬提前洩漏。

## Route Ownership by Story

US1 的 T021 建立唯一 `backend/src/api/activity-routes.js` 並註冊教師 GET /activity，
提供準備狀態或完整教師投影，學生分支在 US2 前拒絕。US2 的 T027/T028 在同一路由內
新增受 Session 綁定驗證的學生白名單投影，不另建同 method/path handler 或覆蓋教師分支。

## Errors

JSON envelope：{error:{code,message,requestId,details?}}；正式 UI 顯示繁體中文原因，不傳 stack。

| Status | Codes |
| --- | --- |
| 400 | INVALID_INPUT、INVALID_GROUP_COUNT、ANSWER_BLANK |
| 401 | INVALID_PASSWORD、SESSION_INVALID |
| 403 | TEACHER_REQUIRED、STUDENT_REQUIRED、GROUP_BINDING_INVALID |
| 404 | ACTIVITY_NOT_READY、QUESTION_NOT_FOUND |
| 409 | GROUP_OCCUPIED、SESSION_ALREADY_BOUND、DUPLICATE_SUBMISSION、PHASE_CONFLICT、STALE_QUESTION、STALE_ACTIVITY、QUESTION_NOT_CLOSED、PREPARATION_LOCKED、PREPARATION_BUSY |
| 422 | FILE_UNREADABLE、FILE_TYPE_INVALID、PLACEHOLDER_MISSING、PLACEHOLDER_DUPLICATE、PLACEHOLDER_INVALID、QUESTION_GAP、WORKBOOK_UNSUPPORTED |
| 500 | EXPORT_FAILED、INTERNAL_ERROR |

依序先驗權、再驗識別與狀態，避免以錯誤回應提供未授權資訊。任一拒絕不新增順位或覆寫資料。
保留 requestId 供測試／錯誤查找；不要記錄密碼、token 或全部答案。
