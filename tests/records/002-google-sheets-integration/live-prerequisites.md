# Live prerequisites — T004

**最新確認（使用者實際測試日期2026-11-18）**：使用者確認A/B不同ID、兩份Editor、完整標記、B含hidden與merge、基準已保存；runner回報兩份各6題／2批且pass1／fail0／exit0，T004 USER_CONFIRMED／已勾選。下文BLOCKED等為歷史；T058權限負面操作仍PENDING，見live.md文末。不記ID或來源網址。


2026-11-18：BLOCKED，人工尚未提供已設定完成的確認。
使用者需提供兩個不同spreadsheetId的專用A／B，分別分享服務帳號Editor；不同位置、跨表／hidden GRID、merge master、非答案公式／rich text、整格樣式，另備錯誤與保護案例。ID僅放未提交的環境設定，不寫紀錄。
本輪無真表讀寫、無權限切換，真實API與人工驗收NOT RUN。此狀態不阻擋離線Foundation。

## 2026-11-18補充

使用者已回報ClassroomQuiz-Test-A真實讀取6題／第4題WAITING／1工作表／UNKNOWN，詳user-real-read.md。這是局部讀取依據，非完整Cloud／ACL設定確認、兩來源驗收或可寫權保證；原NOT RUN／BLOCKED係原時點紀錄，目前完整人工項仍未完成，不據此勾選T003／T004。AI本輪未讀私人憑證或呼叫真Google。

## Final準備補充（2026-11-18確認）

使用者已另回報US3真實讀寫成功（user-real-write.md）；未提供兩個不同ID與B hidden／merge、兩表分享／保真配置的完整確認，T004仍未勾選，不因fake通過或單次成功推定完成。test:live已建立但預設NOT RUN，實際兩表前置／驗收見live.md。本輪沒有真Google操作或權限切換。
