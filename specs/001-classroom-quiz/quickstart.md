# Quickstart Validation Guide

本文件是未來 Implement 完成後的驗證操作指南，不代表現在已有應用程式。
下列 package scripts、設定及測試檔皆為計畫契約，本階段未建立、未安裝、未執行。

## Prerequisites

Windows 11、VS Code、Node.js 24 LTS 與 npm；可隔離並持久保存身分的瀏覽器設定檔。
Java／PlantUML CLI 供圖表驗證；Excel 或可檢查 XLSX 格式的本機檢視工具供人工比對。
規格、圖表及計畫先經人工審查；跨組核對及外部 OI-001／002 狀態需如實記錄。

## Planned Setup and Commands

在 repo root 執行；目前沒有 package.json，現階段不得將以下步驟回報為通過。
實作提供 frontend/backend 各自 lockfile，以及下列 scripts。

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
未來可建立只有變數名稱及無真實值的設定說明；不需在本階段建立 .env。

## Automated Validation (planned)

```powershell
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run test:e2e
```

backend test 涵蓋 domain、HTTP、Socket 與 XLSX fixtures；frontend test 涵蓋狀態 UI；
test:e2e 啟動／連接本機兩服務及隔離瀏覽器設定檔，依 plan.md T01–T14 保存結果。
測試環境須確保 Node 可管理兩程序，失敗時保存原因，不把未執行項目記為 PASS。

## Manual End-to-End

1. 同機開老師及三個持久隔離學生身分；同設定檔多頁籤不能當成不同組。
2. 用錯密碼測拒絕，再用環境密碼登入；設三組，先匯入錯檔確認原因及禁止開始，再匯入 valid 三題檔。
3. 三組加入，另身分搶占已用組須失敗；刷新／關閉再重開同 profile 恢復原組。
4. Q1 手動開始；未開始、空白及重送拒絕；三組提交後老師見順序，學生僅見自己的狀態。
5. 量測每次變更到畫面 <=2 秒；檢查學生 HTTP／Socket 實際資料無他組答案、順位或提交狀態。
   固定一組題號、階段及自己的狀態，讓另一個已加入組提交：觀察組不應收到額外事件／空通知，
   GET /activity 及 state:request 的 studentViewRevision 與可見資料不變；任何回覆/header 不含
   全域 stateRevision 或操作計數。教師及提交組仍須正常更新；重連後重做此檢查。
6. 老師結束 Q1，公布固定結果；再提交失敗。按下一題只到 Q2 WAITING，未開始不能提交。
7. Q2 無人作答也結束，顯示「無人作答」；晚加入空組可成功，是否能提交仍依當下階段。
8. Q3 開始後提交、結束即進 COMPLETED，保留各題結果；已結束題不能重開。
9. 在 WAITING、ANSWERING、RESULTS、COMPLETED 分別匯出；只填已閉題最小 rank 答案，無人或未閉題不填。
10. 用第二份不同位置／多表的相同題號檔另一次後端執行驗證動態映射；逐表比對文字、公式、
    字型、框線、merge、行列尺寸及原檔存在的其他特徵。以 = 起始答案仍須為文字。
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
本次 Plan 沒有改圖，不將既有生成證據當成新應用測試。

## Evidence Record

每筆記錄包含日期、環境／版本、步驟或命令、fixture、預期、實際、PASS／FAIL／NOT RUN、
輸出或截圖及人工檢查者。機敏資料先遮蔽。全部紀錄規劃保存於 tests/records/，未來實作建立。
OI-001／002 的課程核准需專案成員提供助教回覆，不能由本機測試推論。
