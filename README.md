# ClassroomQuiz

目前 Phase 1–3 已通過；Phase 4 學生身分已通過自動驗證，人工重開驗證待確認。
搶答、Socket 即時推送及匯出尚未實作。

## Windows 11 本機執行

使用 Node.js 24 LTS，在專案根目錄執行：

```powershell
npm --prefix backend ci
npm --prefix frontend ci
$env:ADMIN_PASSWORD = Read-Host '設定本機老師管理密碼'
npm --prefix backend run dev
```

另一個終端執行 `npm --prefix frontend run dev`，開啟
[老師端](http://localhost:5173/?role=teacher)。不要將真實密碼寫入版本控制。
後端重啟允許清空活動；服務僅供 localhost 使用。
學生可進入 [學生端](http://localhost:5173/?role=student) 選擇未占用組別。
老師與不同學生組別須使用不同瀏覽器設定檔；同一設定檔多頁籤共用同一身分。

## 自動驗證

```powershell
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
npx --prefix frontend playwright install chromium
npm --prefix frontend run test:e2e
```

E2E 自行啟動隔離測試服務，執行前請停止手動啟動的 3000／5173 服務。
合成工作簿在 tests/fixtures/guided-notes/，實際紀錄在 tests/records/。
兩項課程外部規範維持待確認，見 spec.md 的 Open Issues。
