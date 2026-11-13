# Research: ClassroomQuiz

Date: 2026-11-11. 本文件為 Plan Phase 0 決策，未安裝套件或執行應用測試。
技術待決已選定方案；兩項課程外部問題仍留在 spec.md，不由研究冒充解決。

## R1 — Runtime and UI

- Decision: Node.js 24 LTS、JavaScript、React 19 系列及相容穩定版 Vite，Express 5。
- Rationale: 符合使用者技術方向；Node 24 可滿足 Vite 的 Node 20.19+／22.12+ 及 Express 5 >=18 要求。
  精確版號於實作核對 engines 並保存 lockfile，不宣稱已測試相容。
- Alternatives considered: 不引入 TypeScript、SSR、額外 UI 框架或雲端服務，避免超出簡潔本機範圍。
- Sources: [Vite](https://vite.dev/guide/)、[Express](https://expressjs.com/en/starter/installing/)、
  [Node releases](https://nodejs.org/en/about/previous-releases)、
  [React guidance](https://react.dev/learn/build-a-react-app-from-scratch)。

## R2 — Order and recovery

- Decision: HTTP 業務命令共用同步服務入口；Socket.IO 4 僅推送有權限的全量快照。
- Rationale: Socket.IO 保證單連線訊息順序，但預設至多一次送達，不保證不同學生間的全域接收序。
  由應用後端同步裁定提交及結束，重連時讀取權威快照，不能把傳輸保證當成組題唯一性。
- Alternatives considered: 不採前端時間、分散式鎖、資料庫排序或事件重播系統。
- Sources: [Socket.IO delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/)。

## R3 — Authentication

- Decision: 環境管理密碼、後端安全亂數 opaque Token、伺服器 Map 驗證角色綁定。
  HTTP Bearer token；socket handshake.auth.token；每次請求重新驗權。
- Rationale: socket middleware 僅於連線執行一次，不能代替每次老師操作的權限驗證。
  瀏覽器持久保存 Token 以恢復身分；後端重啟失效，不增加帳號與接管流程。
- Alternatives considered: 不需要 OAuth、JWT、帳號資料庫；socket.id 不能代表持久身分。
- Sources: [Socket.IO middlewares](https://socket.io/docs/v4/middlewares/)。

## R4 — Workbook and preservation

- Decision: ExcelJS 4 document Workbook，原始 Buffer 保留，匯出重新 load 原檔並按動態映射修改字串值。
- Rationale: 官方提供 buffer load/write、樣式與字串／公式區別；document 模式較適合保留工作簿特徵。
- Alternatives considered: 不用 streaming writer、CSV、硬編碼格址或 Google API。
- Sources: [ExcelJS official README](https://github.com/exceljs/exceljs/blob/master/README.md)。
- Limitation / inference: 官方列出自訂表格主題、部分條件格式、頁首頁尾圖片及 streaming 圖片限制；
  不能推論任意 .xlsx 都能無損往返。FR-027 的嚴格保留義務不變，屬實作驗收關卡。
- Validation gate: 在提交活動前，以原檔作不改值的 round-trip 相容性檢查；比較工作表、值、公式、
  style、merge、行列尺寸、可見性、圖片／關係等來源存在特徵。不能只比較 ExcelJS 已解析模型，
  因未解析的 OOXML 部分可能遺失；須比對 ZIP 部件清單、關係與語意內容並人工檢視。
  允許 ZIP 順序、XML 命名空間序列化等非使用者內容差異，不能忽略格式或未知內容消失。
  若無法證明實際測試範本保真，停止該檔匯入並回報 WORKBOOK_UNSUPPORTED，保留原檔；
  由人工處理相容性而非靜默輸出損壞檔案。這是檔案相容性錯誤，非宣稱全部課程工作簿受支援。
  若助教檔必須支援而檢查不過，為實作 blocker，須修正設計並重新審查，不得縮減規格。

## R5 — Tests and gates

- Decision: Node test + Supertest + Socket.IO client、Playwright 隔離持久 profile、XLSX 語意及人工比對。
- Rationale: 需同時驗證服務不變條件、回應／訊息完整資料與實際 UI／重開恢復。
- Alternatives considered: 單看畫面會漏掉提前傳輸的答案；只看檔案可開啟不能證明格式保留。
- Status: 技術研究完成；人工審查及跨組核對無紀錄，OI-001／002 未解，不聲稱治理關卡全數通過。

## 2026-11-13 課程依據更新

以上保留原設計階段的歷史狀態。最新證據：期末專題說明.pdf 第 2 頁明確允許修改範本及加入佔位符，OI-002 為 CONFIRMED_BY_COURSE_DOCUMENT；OI-001（.xlsx 中介接受性）仍 PENDING。跨組依 implemented-features.md 先提供本組已實作功能供另一組後續開發核對，使用者回報對方尚未動工，不要求現在有成品可互測；功能／流程變更討論規則不變。
