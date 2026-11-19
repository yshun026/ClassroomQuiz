# Google Sheets Adapter Contract

**狀態參照（2026-11-18 Final準備）**：邊界已實作且固定host／scope／單次寫入及重試預算通過離線契約測試；合約要求不變。真實兩表／權限與完整人工尚待使用者執行，見[Final矩陣](../../../tests/records/002-google-sheets-integration/final-acceptance.md)，不得以fake代替live。

日期：2026-11-18。此為後端邊界／測試替身合約，不是瀏覽器公開端點。實作放 `backend/src/services/sheets-access.js`；認證只由後端提供。只有固定官方 host，可 dependency injection 傳入測試 transport，生產不得由 HTTP request 改 endpoint。

## Auth and requests

- GoogleAuth 以 repo 外 service_account key file、scope `https://www.googleapis.com/auth/spreadsheets` 取得 Token，僅記憶體。拒絕不符 service_account 型別與不可信 token_uri；不執行使用者傳入的 credential JSON。
- getSource(spreadsheetId) → 完整來源資料／標準化錯誤；GET v4/spreadsheets/{encodedId}，fields 指定研究 R4 欄位。不 fetch 老師網址；不跟 redirect。
- writeValues(sourceId, fills, attemptId) → APPLIED／KNOWN_REJECTED／UNKNOWN。POST v4/spreadsheets/{id}:batchUpdate，每 attempt 一次傳輸，無自動重試／auth replay；Token 取得可重試但不能隱式重送業務 body。
- verify(sourceId, originalOperation) → 讀回同來源結構與值，不做寫入；即使 API write 2xx 也必須驗證。

## Read normalization

回傳模型含 spreadsheetId／title、全部 sheet properties、GRID sparse userEnteredValue、textFormatRuns／chipRuns、userEnteredFormat、merges、protectedRanges、namedRanges 與必要參照資料。保留 startRow/startColumn 偏移，省略空格補為 empty，不把 formattedValue／effectiveValue 當原文。

如果 fields 選擇漏掉必要欄位導致無法證明格式／位置，這是 adapter／協定錯誤，不假裝為空或「權限已確認」。protectedRange 欄位本身不可見則權限 UNKNOWN；不因此破壞讀取成功的 Q3 行為。未支援 sheetType 只列名稱／類型，不掃成 GRID。

## Batch body constraints

單格範例（座標均來自動態映射，不是固定值）：

```json
{
  "requests": [{
    "updateCells": {
      "start": {"sheetId": 0, "rowIndex": 2, "columnIndex": 1},
      "rows": [{"values": [{"userEnteredValue": {"stringValue": "=1+2"}}]}],
      "fields": "userEnteredValue"
    }
  }],
  "includeSpreadsheetInResponse": false
}
```

sheetId=0 合法；每 fill 一個單格 request，所有 preflight 先完成。不得帶 formulaValue、fields:*、userEnteredFormat、merge／clear／append／delete；無 fills 不發 batch。body 超過設計 2 MiB 時送出前整次拒絕，不改為多批偷跑。只允許在已驗證的原 sourceId 寫，無建立副本或新分頁。

## Error and attempt semantics

錯誤需區分尚未送出（含本地序列化／認證失敗）、遠端明確拒絕、可能已送達。Google 400／401／403／404／429 的明確完整拒絕回應可 KNOWN_REJECTED；5xx／stream 中斷／timeout 一律 UNKNOWN（不可從 client abort 推斷遠端取消）。不要將 Google error config／headers／原始 body 交給通用 API error handler。

讀可有限重試；寫無背景重試。每次寫前記 immutable attempt 及目標集合；即使 teacher HTTP 中斷仍留在原 operation。200 秒本機傳輸上限／Google 180 秒處理上限皆不能證明遠端從 sentAt 已終止。若無法安全排除舊寫且有原標記，reconcile 只能維持待核對，不送新寫入。詳 research R8 與 data-model。

## Contract verification

fake transport 必須驗方法、host、fields mask、單格 body、無公式、送出次數、timeout 與 auth 失敗前零寫入。integration 驗 scope／來源固定、保護範圍三態與 runs；live suite 用兩份真表驗證讀回、字串型別、非答案內容與格式、撤權及真實保護格。fake 不是 live 憑證或 Google 成功證據。

官方依據：[get](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get)、[UpdateCells](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request#UpdateCellsRequest)、[CellData](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells)、[batchUpdate](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/batchUpdate)。
