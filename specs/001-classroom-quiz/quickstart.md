# Quickstart Validation Guide

本文件對應目前已實作的本機系統。Phase 1–7 與 T059 整體人工測試已由使用者確認；
最新自動結果：後端 73/73、前端 7/7、瀏覽器 14/14 通過，建置成功。
測試紀錄見 tests/records/automated-validation.md，最終文件審查與跨組結果見 tests/records/final-acceptance.md。

## Prerequisites

Windows 11、VS Code、Node.js 24 LTS 與 npm；可隔離並持久保存身分的瀏覽器設定檔。
Java／PlantUML CLI 供圖表驗證；Excel 或可檢查 XLSX 格式的本機檢視工具供人工比對。
規格、圖表及計畫先經人工審查；跨組核對及外部 OI-001／002 狀態需如實記錄。

## 安裝與啟動

在專案根目錄的 PowerShell 執行；使用 Node.js 24 LTS。前後端各有 lockfile，使用 npm ci 安裝鎖定依賴。

```powershell
node --version
npm --version
npm --prefix backend ci
npm --prefix frontend ci
$env:ADMIN_PASSWORD = Read-Host 'Local teacher password'
npm --prefix backend run dev
```

另一終端執行 `npm --prefix frontend run dev`，瀏覽固定 `http://localhost:5173`。
後端固定 `http://localhost:3000`，兩者僅 loopback；Vite 代理 API/socket 到後端，不混用 localhost 與 IP。
管理密碼只供當前後端環境讀取；勿貼入 repo、日誌或測試紀錄。
backend/.env.example 只有空白變數範例；後端不會自動載入 .env，請依上述指令在同一終端設定環境變數。
ADMIN_PASSWORD 未設定或只有空白時拒絕啟動。換終端或重啟電腦後需重新設定，不得硬編碼或使用 VITE_ 暴露。

老師入口為 http://localhost:5173/?role=teacher，學生入口為 http://localhost:5173/?role=student。
每組及老師須使用不同持久瀏覽器設定檔；同設定檔頁籤共用 Token。所有無痕視窗關閉後身分可能清除，
但後端仍保留組別占用，不會自動釋放、換組或接管。老師／學生切換入口不會替學生建立新的老師權限。
新活動請停止並重新啟動後端；這會清空目前活動，沒有應用程式內重設／多活動功能。

## 自動驗證

```powershell
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
npx --prefix frontend playwright install chromium
npm --prefix frontend run test:e2e
```

如果 3000/5173 已有手動服務，先在測試終端設定以下變數再執行 test:e2e，測試會啟動獨立服務，不重設手動活動：

```powershell
$env:E2E_FRONTEND_PORT = '5273'
$env:E2E_BACKEND_PORT = '3100'
npm --prefix frontend run test:e2e
```

backend test 涵蓋 domain、HTTP、Socket、XLSX 及獨立子程序實際重啟；frontend test 涵蓋快照版本；
test:e2e 啟動／連接本機兩服務及隔離瀏覽器設定檔，依 plan.md T01–T14 保存結果。
測試環境須確保 Node 可管理兩程序，失敗時保存原因，不把未執行項目記為 PASS。

## Manual End-to-End

1. 同機開老師及三個持久隔離學生身分；同設定檔多頁籤不能當成不同組。
2. 用錯密碼測拒絕，再用環境密碼登入；設三組，先匯入錯檔確認原因及禁止開始，再匯入下方 Demo 檔案清單中的 ClassroomQuiz_valid.xlsx。
3. 三組加入，另身分搶占已用組須失敗；刷新／關閉再重開同 profile 恢復原組。
4. Q1 手動開始；未開始、空白及重送拒絕；三組提交後老師見順序，學生僅見自己的狀態。
5. 量測每次變更到畫面 <=2 秒；檢查學生 HTTP／Socket 實際資料無他組答案、順位或提交狀態。
   固定一組題號、階段及自己的狀態，讓另一個已加入組提交：觀察組不應收到額外事件／空通知，
   GET /activity 及 state:request 的 studentViewRevision 與可見資料不變；任何回覆/header 不含
   全域 stateRevision 或操作計數。教師及提交組仍須正常更新；重連後重做此檢查。
6. 老師結束 Q1，公布固定結果；再提交失敗。按下一題只到 Q2 WAITING，未開始不能提交。
7. Q2 無人作答也結束，顯示「無人作答」；晚加入空組可成功，是否能提交仍依當下階段。
8. Q3 及後續各題依序手動開始／提交／結束；僅最後一題結束才進 COMPLETED，保留各題結果；已結束題不能重開。題數以目前匯入檔案為準，不預設只有三題。
9. 在 WAITING、ANSWERING、RESULTS、COMPLETED 分別匯出；只填已閉題最小 rank 答案，無人或未閉題不填。
10. 重啟後端，另建活動匯入 ClassroomQuiz_multi_valid.xlsx，依該檔案原本填空位置確認動態回填；逐表比對原檔已有的文字、公式、
    字型、框線、merge、行列尺寸及其他特徵。若測試以 = 起始答案，匯出仍須為文字。
11. 同步匯出／結束受控競爭驗證一致快照；確認匯出不改活動狀態或原始 Buffer。
12. 重啟後允許清空，舊 Token 失效；不能誤顯示仍有活動或接管舊組。

更多欄位及錯誤見 [data-model.md](data-model.md)、[HTTP](contracts/http.md)、
[Socket.IO](contracts/socket-events.md)；順位競爭以受控自動測試證明，不能只靠人手點擊猜測順序。

## Diagram Consistency Validation

核對三種圖的節點、資料關聯、四階段、單筆、結束／提交及角色資料投影與實作。
修改 .puml 後使用實際 PlantUML jar 路徑重產：

```powershell
java -jar plantuml.jar './diagrams/*.puml'
```

確認每份 PNG 存在且能開啟；圖渲染成功不等於程式碼一致性通過。
本次實作未修改三圖；逐項實作核對結果見 tests/records/diagram-consistency.md，不能把圖片存在當作一致性證明。

## Evidence Record

每筆記錄包含日期、環境／版本、步驟或命令、fixture、預期、實際、PASS／FAIL／NOT RUN、
輸出或截圖及人工檢查者。機敏資料先遮蔽。全部紀錄保存於 tests/records/。T059 的實際使用者回報另見 manual-validation.md。
OI-001 仍待確認；OI-002 已依課程 PDF 第 2 頁允許修改範本／加入佔位符確認，不能把此許可推論為 .xlsx 中介也已獲准。

## Demo 檔案與匯出流程

本次實際 Demo／人工測試使用：

| 檔案 | 本機位置 | 操作 |
| --- | --- | --- |
| ClassroomQuiz_valid.xlsx | `C:\Users\user\Downloads\ClassroomQuiz_valid.xlsx` | 第一場活動匯入，展示搶答及匯出 |
| ClassroomQuiz_multi_valid.xlsx | `C:\Users\user\Downloads\ClassroomQuiz_multi_valid.xlsx` | 重啟後端另建活動匯入，確認另一份範本依原位置回填 |

換電腦時先準備上述兩份原始範本，從匯入視窗選擇實際位置。不要把前一場已填答案的匯出檔當作新範本。
兩份檔案均以連續單題簡答處理，沒有新增題組業務或匯入功能。
`tests/fixtures/guided-notes/` 中的 fidelity.xlsx、valid-b.xlsx 等仍供自動測試，其三題及格式特徵不代表本次人工 Demo 的檔案內容。
每個填空格必須整格為唯一 {{Q1}}、{{Q2}}…，從 Q1 連續且跨表不重複；不接受混字、公式或額外空白。
來源可由 Google Sheets 手動下載 .xlsx，系統不直接連 Google API。

老師設三組並匯入 → 三組加入 → Q1 開始／提交／結束 → 下一題 Q2 WAITING → 手動開始／無人作答也可結束
→ 下一題 Q3 及後續題 → 每題手動開始／提交／結束 → 最後一題閉題進 COMPLETED 保留所有結果。
題數取決於該檔案的有效佔位符，不固定為三題；題目依序進行，不能重開或跳題。

老師在四階段都能點「匯出 Guided Notes」，下載 ClassroomQuiz-guided-notes.xlsx；只填已閉題最小順位答案，
其餘佔位符保留。匯出檔供比對及後續手動回填流程，不應把已填答案的檔案當作新的匯入範本。
原始 Workbook 的非答案值、公式、格式等須保留；遇到 WORKBOOK_UNSUPPORTED 表示尚無法證明該檔保真，
應保留原檔、回報相容性問題，不可宣稱成功或靜默刪除內容。系統不驗答案對錯、不計分。

關閉終端服務可用 Ctrl+C。後端重啟後清空是預期行為，舊 Token 會失效，老師重新登入、學生依新活動選組。
本機正常連線更新 <=2 秒；斷線期間禁止提交，重連從後端取全量快照且不自動重送答案。

OI-001（.xlsx 中介是否符合課程 Google Sheets 回填要求）仍待確認；OI-002 已由課程 PDF 第 2 頁明確允許加入佔位符而確認。Demo 成功不等於 .xlsx 中介已獲課程核准。不包含公開部署。

跨組協作目前先提供 implemented-features.md 的本組功能清單；另一組尚未動工，不要求此刻有兩組完成版互測。後續依課程核心功能核對，影響約定功能／流程的變更仍須討論。
