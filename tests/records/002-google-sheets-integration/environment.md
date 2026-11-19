# Environment — T002 / T003

**最新確認（使用者實際測試日期2026-11-18）**：使用者已確認API啟用、專用SA、無網域委派、JSON在repo外及ACL，T003 USER_CONFIRMED／已勾選；A/B真API正向驗收亦提供pass1／fail0／exit0。沒有讀取key或記實際路徑。下文BLOCKED／待確認為歷史，最新明細見live.md文末。


日期2026-11-18；Node v24.17.0，npm11.13.0。

T002 PASS：npm registry metadata的google-auth-library11.3.4 engines為>=22；專案Node >=24 <25符合。執行 npm --prefix backend install --save-exact google-auth-library@11.3.4，退出碼0，新增19個傳遞套件；package.json與lockfile同步。npm ls確認11.3.4，GoogleAuth ESM匯入成功；安裝器audit當次0 vulnerabilities（非完整安全保證），傳遞node-domexception1.0.0有deprecation提示。

T003 BLOCKED / 人工待辦：未提供真實Cloud／憑證設定確認，不建立、不搜尋使用者金鑰。請依quickstart啟用Sheets API、建立專用服務身分、外置key與ACL；不需Cloud Owner／Editor或網域委派。未做真實Token交換，live NOT RUN。

## 2026-11-18補充

使用者已回報ClassroomQuiz-Test-A真實讀取6題／第4題WAITING／1工作表／UNKNOWN，詳user-real-read.md。這是局部讀取依據，非完整Cloud／ACL設定確認、兩來源驗收或可寫權保證；原NOT RUN／BLOCKED係原時點紀錄，目前完整人工項仍未完成，不據此勾選T003／T004。AI本輪未讀私人憑證或呼叫真Google。

## Final準備補充（2026-11-18確認）

使用者另回報真實Sheets匯入／搶答／閉題／成功答案寫回預期格，詳user-real-write.md，記USER_REPORTED_REAL_READ_WRITE_SUCCESS；不推定同一來源或實際測試日期。此為局部使用者成功證據，未提供Cloud／key外置與ACL各項完整確認，T003仍未勾選。代理Final只測停用live gate，不讀私人key；真人前置與模式步驟見live.md。
