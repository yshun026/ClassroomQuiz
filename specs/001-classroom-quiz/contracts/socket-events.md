# Socket.IO Event Contract

Socket.IO 4，path `/socket.io`，僅同源 localhost，開發由 Vite proxy 支援 WebSocket 及 polling。
連線 auth={token}；後端查 Session 後綁定 role、activity、group；未驗證前不可訂閱任何活動資料。

| Direction / event | Payload | Behavior |
| --- | --- | --- |
| client -> server: state:request | {activityId?}, acknowledgement | 再驗 Session；回 {ok:true,view} 或 {ok:false,error}；不得代替提交或改變階段 |
| server -> client: state:snapshot | 合約 http.md 中的 role-specific view | 成功連線／重連送目前快照；只向可見業務資料改變者推送更新；教師 stateRevision、學生 studentViewRevision 各自單調不倒退 |
| server -> client: session:invalid | {code:"SESSION_INVALID",message} | 清除舊身分畫面並斷線，學生不得自動接管占用組 |
| transport: connect_error | {message,data:{code}} | Token 不合法、origin 不符或服務不可達時拒絕；不得帶內部資料 |
| transport: disconnect/connect | Socket.IO lifecycle | UI 顯示未同步／同步中；重連立即取新快照，不自動重送答案 |

client 不可指定 teacher/group room；rooms 只由服務端依 Session 分配，或逐 socket 推送。
一個 Session 可有多個 socket 對應同身分頁籤，仍只有一組題提交；不是多個有效組別身分。
老師專用 room 只接教師投影，學生各組 socket 只接其投影。禁止 broadcast 完整 store 或教師物件。

正常連線每個狀態變更／提交接受到相應畫面更新 <=2 秒；斷線及重連期間不適用時間上限。
教師用 activityId/stateRevision，學生用 activityId/Session/studentViewRevision 去除遲到快照；
學生不得收到或推算全域版本。學生可見版本初始 0，只隨自己的業務投影改變遞增；
同版本重複快照可忽略，不能發出隱含提交。新活動／Session 需重設比較基準。
新連線在同一同步入口原子取得完整快照並註冊後續更新，避免訂閱與快照間漏掉變更。
本機單程序內同步建立 view；傳輸不得保留可變 store 參照供稍後序列化。

預設不使用 Socket.IO recovery 略過驗權；不靠傳輸 replay 達成身分或提交去重。
HTTP 業務操作無 socket 替代事件，避免兩套提交入口產生語意差異。

## Recipient and Story Rules

- start／close（含最後題 COMPLETED）只由 US3 的 T039 完成全部已加入者推送；
  accepted-submit 只推教師及提交組同一 Session 的所有頁籤，其他學生不得收到事件、空快照或提示。
- 他組提交不改自己的 studentViewRevision，不能透過 envelope、ack、錯誤、自訂事件 ID 或其他
  metadata 洩漏全域 stateRevision、commandSequence 或他組提交計數。
- 主動 state:request、初次連線及重連可回覆當前快照，但可見資料未變時版本不增加；
  不因他組提交要求學生重抓資料。傳輸層固定心跳不承載業務計數，不因他組提交另發業務通知。
- US4 T046 依賴 T039，僅增加 next／晚加入／重連恢復，不將 US3 必需的即時行為延後。
- 既有 closed 題結果仍依 spec 公開；本限制針對當題尚未結束時的資訊隔離。

## Isolation Validation

在 ANSWERING 驗證 teacher snapshot、學生各組 snapshot、state:request ack、connect_error 及重連，
學生都不含他組答案、rank、winner、submitted 狀態或提交總數。閉題後才在 publishedResults 公開。
加入用組別占用資訊不能變成當題提交狀態側通道；占用只於加入時變更，不隨提交變更。
固定觀察組的 phase、題號及自身提交狀態，讓其他既有組提交；觀察組事件數不得增加，
輪詢 GET /activity 或 state:request 的業務投影及 studentViewRevision 不變（requestId 等隨機
傳輸欄位不作內容相等比較，但不得含全域計數）。教師及提交組必須正常更新，閉題後才向全部公布。
T033 先驗證單題及主動查詢；T043 再驗證重連前後仍無版本／通知側通道。
