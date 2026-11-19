# Feature 002 evidence

舊tests/records下001證據唯讀；此目錄只記002本輪實際結果。

每筆需：日期、版本／Git HEAD、task ID、命令／步驟、預期、實際、PASS／FAIL／NOT RUN／BLOCKED、遮蔽證據。無執行不得PASS，mock不能代人工通過。

| 層級 | 記錄與界線 |
| --- | --- |
| unit / adapter fake | foundation.md，合成資料／注入transport，不證明Google |
| HTTP-Socket integration fake | 本輪既有後端回歸，後續US依task擴充 |
| E2E fake | 本輪NOT RUN，US1以後 |
| live Google | environment.md / live-prerequisites.md，NOT RUN |
| manual | 使用者實際回報前NOT RUN |
| diagram | Foundation只實作Access責任，未實作完整US時序，圖不改 |

不保存真實私鑰、Token、密碼、credential路徑、原始Google錯誤／headers或真學生答案。synthetic字串不具有效憑證功能。
