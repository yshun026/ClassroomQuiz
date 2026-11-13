# Phase 6 / US4 逐題推進及同步恢復

日期：2026-11-11。T043–T048 已完成；自動驗證 PASS，T048 人工驗收由使用者於本對話確認完成。Phase 7–8 未執行。

## 範圍與任務結果

- T043：`backend/tests/integration/activity-lifecycle.test.js` 驗證三題依序推進、歷題保留、未開始不可交、不可跳題／重開、舊題拒絕、最後題不能 next；四階段晚加入與重新連線、state:request、失效 Session 及新後端 store 拒絕舊 Token。
- T044：`tests/e2e/realtime-lifecycle.spec.js` 使用老師與三個隔離學生身分，驗證三題旅程、正常連線每次開始／閉題／下一題及有效提交至 UI 的量測、四階段刷新、老師和學生四階段斷線恢復，以及提交回覆遺失不重送。測試 helper 在隔離後端關閉 transport 並阻斷該身分後續網路請求；不透過應用程式新增 reset 或測試端點。
- T045：QuestionService.next 在既有同步 dispatcher 中驗老師、活動及目前題；僅非最後題 RESULTS 能遞增一題至 WAITING。有效操作 stateRevision 加一，失敗及讀取不增加；答案與歷題結果不改動。
- T046：沿用並驗證 T039 的每次 handshake 驗權、同步訂閱加全量快照、逐 socket 角色投影及已有的晚加入支援。next 呼叫既有 sync.changed；重連由既有 connection 路徑恢復，未增設第二套推送或 replay。
- T047：老師 RESULTS 提供下一題按鈕；保留既有歷題結果。Socket.IO 開啟自動重連，收到授權快照後才標記同步完成；前端 HTTP 與 Socket 快照共用角色版本比較，避免倒退。切題清除尚未提交輸入，失效 Token 清除畫面；斷線時禁止提交，不自動重送答案。

## 實際執行證據

```powershell
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
$env:E2E_FRONTEND_PORT='5273'
$env:E2E_BACKEND_PORT='3100'
npm --prefix frontend run test:e2e
```

- 後端 44/44 PASS；前端 3/3 PASS；Vite production build PASS。
- 完整瀏覽器回歸 7/7 PASS（29.8 秒），包含既有老師準備、學生持久身分及單題測試。調整量測流程後，重跑本階段三項測試：3/3 PASS（44.4 秒，含服務啟動），正常連線量測 14–35 ms。
- `us4/timings.json` 保存老師與三學生均在線的三題流程每次開始、閉題、下一題，及有效提交至教師畫面的毫秒量測；所有項目斷言 <2000 ms。斷線／重連的測試另行執行，不套用 2 秒限制。
- `us4/completed.png` 保存 COMPLETED 畫面：Q1、Q3 答案、Q2 無人作答及三題歷史均可查看，已以圖像檢視確認。
- 他組提交的重連側通道測試：觀察組重連前後的 HTTP／ack 業務投影與 studentViewRevision 不變；他組提交後 onAny 業務事件數為零增量；學生 body／header 無 stateRevision／commandSequence。有效提交及閉題仍沿用 US3 排序與資訊隔離回歸測試。
- 未停止或重設使用者手動服務；測試使用 3100/5273 及獨立記憶體 fixtures。

## 先失敗再實作與修正

- 新後端測試先在 Phase 5 程式執行，2 項 FAIL：next 回 404（預期合法路由拒絕 409），流程無法前進 COMPLETED。實作 next 後轉為 PASS。
- 初版 E2E 有測試本身問題：老師忙碌狀態造成 status locator 不唯一；初始化 script 在每次刷新重新寫入失效 Token；長輪詢既有請求尚未完成，單純阻斷新請求無法立即斷線。分別限定活動 status、僅初次注入 Token、在隔離 fixture 關閉 transport 後重跑通過。這些環境／測試問題不充當功能缺失的證據。
- Phase 5 測試原本斷言 next 不存在，現依已確認 Phase 6 合約改為合法下一題或拒絕最後題；保留其餘單題驗證。

## Diagram First 及規格對照

已讀取並核對三圖：Component 的 Activity Management／State Synchronization 對應 QuestionService、SynchronizationService、socket-server 及兩端 UI；Class 的 Activity、Question、Session 與既有資料關聯保持一致；QuestionService 為 plan 明定的 Activity Management 內部協作模組。Sequence 的 RESULTS → next → WAITING、手動開始、重連取權威快照及不重送答案均一致。

沒有改變已確認架構、實體或時序，故未修改 .puml，也未冒稱重新產生 PNG。涵蓋 FR-020–025、029 及 SC-004 的本階段自動範圍；FR-021 的匯出由 US5 實作，完整交付尚未完成。Constitution 六項強制原則不變；人工驗收已依使用者回報完成。OI-001、OI-002 維持 PENDING。

## T048 人工驗收清單與完成紀錄

1. 啟動更新後的前後端；老師設定三組並匯入 `tests/fixtures/guided-notes/valid-a.xlsx`。老師與三組使用不同瀏覽器設定檔。
2. Q1 手動開始、提交、閉題後停在 RESULTS；各端同步且看得到結果。老師按下一題只到 Q2 WAITING，學生此時不能作答；Q1 結果仍保留。
3. Q2 手動開始後無人提交也能閉題，顯示「無人作答」。再下一題至 Q3 WAITING，手動開始、提交、結束後為 COMPLETED，三題結果都保留，不再顯示下一題。
4. 在 WAITING／ANSWERING／RESULTS／COMPLETED 刷新，確認組別、題號、階段及已接受提交恢復。用瀏覽器開發工具 Network 的 Offline 模擬斷線，再恢復 Online，應自動同步；斷線期間他端改變階段，恢復後須顯示最新狀態，不能多出提交。
5. 閉題前學生仍只能看到自身答案／狀態；正常連線老師及學生各端更新應在 2 秒內。尚未匯出是本階段預期，請勿將匯出列為已通過。

使用者於本對話回報「完成驗收T048」，據此記錄人工驗收完成並勾選 T048。未提供額外截圖或逐項量測，不另行推定；既有自動量測仍獨立記錄。本次僅更新驗收狀態，未開始 Phase 7。
