# T061 安全與核心範圍審查

日期：2026-11-11。狀態：PASS（本機專題約定範圍）；原始碼人工式逐責任閱讀與已實際執行的自動測試交叉核對。沒有修改功能或憲章。

## 後端權限與學生輸出

| 審查面向 | 實際核對 | 結果 |
| --- | --- | --- |
| 教師專用操作 | preparation-routes 的 teacher middleware；QuestionService.start/close/next 於同步入口重驗；guided-notes-routes 及匯出快照重驗 | PASS |
| Session／組別 | 安全亂數 Token，後端保存 SHA-256 雜湊；validateBinding 強制 activity/group/session；不採 client role/group/room；斷線不刪 Session | PASS |
| HTTP 學生資料 | GET session、activity、claim view 為白名單；submit 只回自身狀態與 studentViewRevision；join-options 僅組別占用；results 只回 closed 題 | PASS |
| Socket／ack／錯誤 | handshake 及 state:request 查驗 Token 與綁定；逐 socket 生成授權 view；錯誤只帶安全代碼／訊息及隨機 requestId | PASS |
| 事件數與版本側通道 | 他組有效提交不改本組投影／studentViewRevision、不產生事件或空通知；重連取得同內容版本不增；observer onAny、HTTP／ack 前後比較已自動驗證 | PASS |
| metadata | Express 停用 ETag 及 x-powered-by，學生 envelope/header 沒有全域 stateRevision／commandSequence，內部計數只供教師或服務使用 | PASS |
| 答案呈現／匯出 | React 文字節點；無 dangerouslySetInnerHTML；答案 cell.value 為 string，`=1+2` 不生成 formula；未閉題不匯出 | PASS |
| 本機範圍 | server.listen 使用 config.host=localhost；Vite host=localhost；HTTP 固定 origin，Socket allowRequest 同 origin；測試獨立連接埠亦僅 localhost | PASS |
| 密碼與日誌 | ADMIN_PASSWORD 僅後端環境，空值拒啟動；前端無 VITE_ 密碼；一般 log 僅服務 URL，不記 Token／密碼／完整答案 | PASS |

證據：foundation、preparation-http、group-session-http、quiz-http、quiz-socket-isolation、activity-lifecycle、export-http、restart-process 及 full-activity／realtime-lifecycle／guided-notes-export 瀏覽器測試。完整總數後端 54、前端 3、瀏覽器 9 均 PASS，見 automated-validation.md。這不是只檢查介面按鈕。

## Git 候選檔與機敏資料

- 掃描當時以 git ls-files --cached --others --exclude-standard 取得 165 個唯一候選檔；未呼叫 git add／commit／push。
- 對文字候選檔檢查私鑰標頭、GitHub Token、OpenAI key、長字面 Bearer Token，命中 0；搭配來源檢視確認實際密碼從環境取得，測試密碼／Token 為執行期亂數。掃描僅記錄檔名及命中類型，不輸出可能的機敏值。
- 唯一 .env 類候選為 backend/.env.example，內容只有 ADMIN_PASSWORD 空值。git check-ignore 實際確認 backend/.env、frontend/.env、node_modules、瀏覽器 profile、test-results 均排除。
- XLSX 候選含測試 fixtures／測試輸出及既有 outputs/classroomquiz-valid-notes/ClassroomQuiz_valid.xlsx。該既有課程範例經讀取檢查，內容為計算機概論題目及 Q1–Q6 標記，未見姓名、帳密、Token 或作答身分；並非把課程範例誤稱成合成測試資料。
- 本次另一份 Downloads 題組檔及轉換成品位於專案外，沒有加入 repository。新測試輸出只有合成題目及答案。沒有將真人學生紀錄或瀏覽器 profile 納入。
- 此處結論針對目前 checkout 的候選檔與已讀取的工作簿，未宣稱做過完整 Git 歷史或所有可能形式的秘密鑑識。

## 範圍檢查

逐讀已註冊 HTTP／Socket 入口與前端功能，並搜尋 googleapis、sqlite、ORM、leaderboard、score、OpenAI、CSV、帳號註冊及 HTML 注入入口。命中的 register 為 Express 路由註冊函式名稱，不是帳號功能。

系統僅有老師登入、準備／匯入、免帳號占組、單題簡答、後端順位、逐題手動控制、角色同步與 XLSX 匯出；無題組業務匯入、CSV、AI 驗答、標準答案比對、審核重排、積分／排行榜、額外公平順位、完整帳號系統、Google API、資料庫或公開部署。先把原工作簿人工整理成連續單題佔位符不等於新增題組功能。

沒有發現需要修改程式的違規項目，沿用已通過的自動驗證，不重跑未受影響測試。2026-11-13 依課程文件更新：OI-002 允許佔位符已有 PDF 第 2 頁依據，OI-001 仍 PENDING；本機安全檢查不代表 .xlsx 中介已獲課程核准。
