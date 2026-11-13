# ClassroomQuiz

目前 Phase 1–7 已完成自動驗證及使用者人工確認（T001–T055）。
Phase 8 與 Phase 9 已完成；T001–T065 全部勾選。使用者於 2026-11-14 回報修正後人工覆核及完成版文件審閱通過，T062 完成，整合紀錄見 tests/records/final-acceptance.md。
已支援多題手動搶答、即時同步、身分恢復及 Guided Notes 保真匯出。OI-001 仍待確認，OI-002 已依課程 PDF 確認允許佔位符，課程影片／表單等繳交工作另行處理，不代表課程核准。

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

E2E 預設自行啟動 3000／5173 測試服務；若手動服務正在運作，可在測試終端設定 `$env:E2E_FRONTEND_PORT='5273'`、`$env:E2E_BACKEND_PORT='3100'` 再執行，避免干擾目前活動。
合成工作簿在 tests/fixtures/guided-notes/，實際紀錄在 tests/records/。
兩項課程外部規範維持待確認，見 spec.md 的 Open Issues。

## Demo 與驗收

本次 Demo 與人工測試使用以下兩份原始範本：

- `C:\Users\user\Downloads\ClassroomQuiz_valid.xlsx`
- `C:\Users\user\Downloads\ClassroomQuiz_multi_valid.xlsx`

其他電腦請先準備這兩份檔案，從匯入視窗選擇實際存放位置；這裡的 Downloads 路徑是本機位置。
老師登入 → 設定三組 → 匯入其中一份範本 → 三個隔離學生身分加入。
依檔案實際題數，從 Q1 依序手動開始／結束至最後一題；每次「下一題」只到 WAITING，最後一題閉題直接 COMPLETED。
展示第二份範本前，先重啟後端建立新活動，重新登入與選組。
兩份範本均依連續單題簡答處理，不表示系統支援額外題組匯入功能。
老師可在任意已準備階段匯出，只回填已閉題最快有效答案；無人／未閉題保留佔位符。

完整安裝、同機身分操作、錯誤及 Demo 步驟見 [quickstart](specs/001-classroom-quiz/quickstart.md)。
所有填空格須整格為唯一連續 {{Q1}}、{{Q2}}…，不能混字或使用公式。系統不直接使用 Google API。
匯出檔用於比對及後續手動回填，新的活動仍使用含完整佔位符的原始範本。

後端不會自動載入 .env；ADMIN_PASSWORD 請在啟動終端設定。新終端需重新設定，空值會拒絕啟動。
後端重啟清空活動與 Token；同一設定檔共用身分，無痕全部關閉可能失去 Token，但組別不會自動釋放。
系統沒有重設、踢除或接管功能；需要新活動時重新啟動後端。

最近總驗證：後端 73/73、前端 7/7、瀏覽器 14/14、建置 PASS；自動及人工來源詳
[自動紀錄](tests/records/automated-validation.md)、[人工紀錄](tests/records/manual-validation.md)。
三圖實作對照、安全範圍及 31 FR／7 SC 追溯彙整於
[最終驗收](tests/records/final-acceptance.md)。T062 已依 2026-11-14 使用者人工回報完成，不代表已完成課程繳交。
OI-001（.xlsx 中介流程接受性）仍待確認；課程 PDF 第 2 頁明確允許修改範本／加入佔位符，OI-002 已有文件依據。

## 與 OpenSpec 組的功能核對

本組已實作功能及課程頁碼對照見 [功能清單](specs/001-classroom-quiz/implemented-features.md)。
依使用者回報，另一組尚未動工；目前先提供本組清單供其後續開發核對，不表示已完成雙方成品互測。
兩組應實現相同核心功能；框架與介面細節可不同。影響約定功能／流程的變更仍需討論並記錄。

Phase 9 的 T063–T065 已修正匯出文字、過期回覆及輸入錯誤分類，完整自動回歸通過；新案例人工覆核及 T062 已於 2026-11-14 依使用者回報完成，詳 [修正驗證](tests/records/convergence.md)。
