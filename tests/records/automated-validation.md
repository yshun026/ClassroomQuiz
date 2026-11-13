# T058 自動總驗證

最新追加：Phase 9 T063–T065 自動驗證通過，後端 73/73、前端 7/7、瀏覽器 14/14、build PASS。先失敗再修正、重跑及人工覆核狀態見 [convergence.md](convergence.md)。下方 54/3/9 是 Phase 8 歷史結果，不覆蓋原執行證據。

日期：2026-11-11；Windows 本機，Node.js 24.17.0、npm 11.13.0；套件精確版本見 environment.md 與兩份 lockfile。

## 本輪命令與結果

| 命令 | 實際結果 |
| --- | --- |
| npm --prefix backend test | 54/54 PASS，含獨立子程序實際重啟測試 |
| npm --prefix frontend test | 3/3 PASS |
| npm --prefix frontend run build | PASS，51 modules，production bundle 產生成功 |
| npm --prefix frontend run test:e2e | 9/9 PASS（36.0 秒），全部瀏覽器案例完成 |

E2E 設定 E2E_FRONTEND_PORT=5273、E2E_BACKEND_PORT=3100，啟動獨立服務及記憶體，未停止使用者 3000/5173 活動。測試用密碼在執行期產生，不寫入紀錄；測試下載檔只有合成題目及答案。既有 Phase 3–7 的留存檔案在回歸前備份、之後還原，以保留原人工驗收依據。

## Plan T01–T14 彙整

| 類別 | 實際證據 | 狀態 |
| --- | --- | --- |
| T01 老師登入／逐操作權限 | foundation、preparation-http、quiz-http、export-http；full-activity 直接以學生請求每項教師操作均拒絕 | 自動 PASS |
| T02 組別競爭 | group-session-http；同組併發及既有 Session 不換組 | 自動 PASS |
| T03 身分恢復／重啟／晚加入 | student-identity、activity-lifecycle、realtime-lifecycle；restart-process 真正啟停子程序後活動 404、舊 Token 401 | 自動 PASS |
| T04 匯入／準備原子性 | preparation-http、guided-notes-import；full-activity 從 UI 錯檔重試至成功匯入 | 自動 PASS |
| T05 佔位符 | import unit fixtures 缺號、重複、大小寫、零、破括號、空白、公式、混字與合併格 | 自動 PASS |
| T06 三組順位／失敗不占序 | submission-order、quiz-http 至少三組並發 | 自動 PASS |
| T07 重送／空白 | submission-order、quiz-http；同組競爭唯一，瀏覽器回覆遺失不重送 | 自動 PASS |
| T08 提交／閉題順序 | 受控先提交／先閉題；三階段拒收、舊活動／題號及重開拒絕，full-activity 晚加入後先閉題再提交遭拒 | 自動 PASS |
| T09 每次 <=2 秒／刷新重連 | realtime-lifecycle 老師加三組；各階段與有效提交量測，四階段刷新／重連，版本不倒退 | 自動 PASS |
| T10 完整資料及側通道 | quiz-socket-isolation、activity-lifecycle：HTTP／ack／錯誤／重連及 observer onAny 零額外業務事件、版本不變 | 自動 PASS |
| T11 無人及最後題 | quiz-http、realtime-lifecycle、full-activity；RESULTS／COMPLETED，空題匯出留標記 | 自動 PASS |
| T12 XLSX 保真／匯出快照 | guided-notes-export、export-http、guided-notes-export.spec；不同位置、多表、公式、樣式、圖片、合併、尺寸與字串 `=` | 自動 PASS；對應 T055 人工由使用者確認 |
| T13 三圖一致 | diagram-consistency.md 逐項責任、關聯、不變條件與時序核對 | PASS；沒有修改原圖，不宣稱重產 PNG |
| T14 人工完整流程 | 已有 T023、T030、T042、T048、T055 分階段人工回報；本輪整體 T059 已由使用者回報「T059通過測試」 | 整體人工 PASS（使用者明確回報），來源另記 manual-validation.md |

## 端到端及覆蓋邊界

full-activity.spec 從真實 UI 登入、設組、錯檔重試／匯入到三組作答、歷題及重複下載串起五個故事；另加第四個空組測試晚加入與先閉題後提交。各拒絕分支由現有單元／合約／Socket／瀏覽器測試共同覆蓋，不冒稱每種錯誤均靠手動操作或均在單一瀏覽器案例重複執行。

瀏覽器最後以隔離測試 store 清空模擬重啟後 UI 行為；restart-process.test.js 另行真正終止／新啟後端子程序驗證資料生命週期。兩者不混稱同一測試。

full-activity 初次匯入測試失敗，原因是測試代理 route.fetch 取得的 multipart 缺少二進位內容；改用 route.continue 轉送原始上傳，專項 1/1 PASS（13.6 秒）。沒有修改應用程式的匯入驗證來規避此問題。其他測試繼續使用原代理及網路中斷 fixture。

完整回歸第一輪 8 PASS／1 FAIL（50.0 秒）：匯出測試在閉題指令尚未完成時先保存 ANSWERING 的「匯出前」狀態，之後與 RESULTS 比較而失敗。修正測試在期望階段出現且下載按鈕可操作後才保存基準，完整重跑 9/9 PASS（36.0 秒）。本次無應用程式行為修改。

31 項 FR、7 項 SC 均維持原規格，未新增或刪減需求。T059 人工驗收另有使用者實際回報；自動結果不代表 T062 文件人工審查或外部課程核准。2026-11-13 依課程文件更新：OI-001 保持 PENDING，OI-002 因 PDF 第 2 頁明確允許佔位符而確認；不改變原自動測試紀錄。

2026-11-14：使用者另回報 Phase 9 修正後人工覆核與完成版文件審閱通過，T062 完成；詳 convergence.md／final-acceptance.md。此為新增人工證據，不是重新執行自動測試或再次 Converge。
