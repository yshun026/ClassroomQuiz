# T062 三圖與實作一致性核對

核對日期2026-11-18。結果：**PASS（程式／邏輯圖一致性）**，不等於真表或人工Final接受。puml及PNG未修改；三份PNG本輪均已實際開啟檢視，無錯誤頁或裁切。原圖CLI產生與確認紀錄見review-record.md；沒有修圖，故本輪不重產PNG。001圖／原驗收保持hash相同。

本文件為離線核對完成證據；tasks.md T062因T059→T061相依尚未結案而保留未勾選，待真人結果及文件更新後複核，不自稱整個Final關卡已通過。

圖上DRAFT／specification blueprint等文字保留Specify時點，不改稱完整Final已通過；圖為邏輯責任而非SDK／實際函式簽名。Class中captureClosedWinners等責任由model函式／coordinator內部步驟協作實現。

| 圖與責任 | 實作檔案／入口 | 驗證 |
| --- | --- | --- |
| Component：Teacher→Auth→Notes／Writeback | preparation-routes.js／guided-notes-routes.js→AuthorizationService；學生拒絕 | preparation-http、writeback-http／recovery-http |
| Component：Notes→Access→原Sheets，credential僅後端 | GuidedNotesService.loadSource／parseSource、SheetsAccess固定host、config外置canonical key與scope | parser／google-config／sheets-access契約；前端bundle邊界掃描 |
| Component：valid groups＋全來源後一次store commit | ActivityService.setGroups／loadSource；busy mutex；無validated-source draft | preparation-http互斥／失敗無半場 |
| Component：Quiz／Sync不等Google、學生無雲端進度 | 原Question／Submission／Sync／Socket未改；coordinator外部I/O | sheets-quiz-independence三個真worker gate、Socket isolation與E2E |
| Class：Source／Location穩定ID／基準／動態座標 | guided-notes-source.js、PlaceholderLocation.fromGrid、稀疏baseline | sheets-source-parser、source-consistency、fake A/B保真 |
| Class：immutable ClosedWinnerSnapshot | writeback-operation.js captureClosedWinners；只閉題最小rank | writeback-snapshot雙序／深不可變 |
| Class：Operation／Item／Attempt／Evidence，Activity仍四phase | models/writeback-operation／writeback-evidence、RuntimeStore Map | recovery transitions、每場running／pending互斥，quiz revision不變 |
| Sequence：手動writeback vs原reconcile | Coordinator.start／reconcile、teacher POST、原operation ID／snapshot | recovery HTTP、後閉題不加入舊快照、多老師BUSY／PENDING |
| Sequence：全部前驗，Evidence先辨識替換，衝突全停 | SourceConsistency＋coordinator；無forced overwrite／重綁 | 題號／原值／merge／維度／formula／runs、無依據相同答案仍衝突 |
| Sequence：單批值、讀回再成功 | SheetsAccess.writeValues、verify；userEnteredValue mask且只有stringValue | transport契約、寫回HTTP、兩份fake逐格比對；真表T057待執行 |
| Sequence：UNKNOWN原marker只讀；settle不是取消 | #safeToSend／#pending、IN_FLIGHT running與whenTransportSettled | recovery unit／HTTP全部分支，未知殘留marker沒有第二寫 |
| Sequence：老師狀態／人工核對，無學生通知 | TeacherPage＋GuidedNotesClient；每秒本機GET，顯式reconcile | A1跨ID晚到success／error／Notes、Session守衛、Google401不登出 |

核對未發現需變更需求或圖的實作差異；A-04仍是受控外部編輯前提，沒有Google CAS／獨占鎖。Runtime重啟不取消遠端，手動範本重用保持原規格。

圖檔雜湊保存在final-protected.json（含002六份圖與001歷史／核心），本輪受保護61/61未變。正式流程沒有呼叫Excel匯入或匯出；Excel helper及依賴依Plan保留歷史測試，不擴大清理。

## T062最終複核（2026-11-19）

本輪先逐圖比較最終程式、spec／plan／data-model／contracts及README／quickstart、T057–T061實際證據；只調整圖，不修改產品來配合圖。原2026-11-18核對為歷史，現階段T059／T061依賴已完成。

| 圖 | 實際程式依據 | 初判／處理／最終結果 |
| --- | --- | --- |
| diagrams/002-component.puml | main.jsx、TeacherPage／StudentPage；Vite proxy；server.js Express＋Socket；app.js DI；auth／Sync／RuntimeStore；SheetsAccess＋config | 一致，不修改PUML／PNG；React/Vite承載browser、Express/Socket承載本機backend；Google與repo外credential僅後端 |
| diagrams/002-class.puml | Activity／Question／Submission／Group／Session、GuidedNotesSource／PlaceholderLocation、ClosedWinnerSnapshot／Operation／Evidence、RuntimeStore及coordinator | 一致，不修改PUML／PNG；邏輯責任名稱不是強制同名方法，model函式captureClosedWinners與私有步驟共同實現；操作狀態不等於活動phase |
| diagrams/002-sequence.puml | ActivityService.assertPreparation／loadSource；QuestionService及SubmissionService同步dispatcher；SourceConsistency；Coordinator.start／reconcile／#safeToSend／#run；teacher GET/POST與client ownership | 原圖空snapshot只在note中、共用讀回段可能使人誤讀FAILED／屏障後仍verify，重複全略過也未獨立明示；修成NO_CHANGES零Google I/O、FAILED不讀回、未知marker屏障保留、全部已verified直接成功及APPLIED／UNKNOWN才進讀回；補原操作恢復與本機GET說明；最終一致 |

### 已核對的關鍵邊界

- 有效組數＋完整來源才一次commit，無來源草稿；Q1..QN全支援GRID含hidden、動態位置／merge主格／整格literal，六題三組是展示值，不寫死。
- WAITING→ANSWERING→非末題RESULTS→Next WAITING，末題COMPLETED；接收rank只由同步dispatcher裁定，每組每題一筆；學生公布前只見自己，後端Session／綁定驗權，刷新／Socket恢復不重新提交。
- 手動POST擷取不可變閉題最小rank快照；雲端I/O不進submit／close裁定。原活動來源＋原mapping全前驗，Evidence／pending解釋已替換marker；外部值／公式／merge／結構／runs衝突停止未送更新。
- 精確單批stringValue及userEnteredValue mask，普通格式／非答案rich text不寫；2xx不是成功，全部精確讀回＋local settled才成功。NOT_SENT／KNOWN_REJECTED失敗終止，不繼續verify。
- 原快照無fills NO_CHANGES不呼叫Google；有快照但全已核對則前驗後SUCCEEDED／略過、無POST。
- FAILED且無屏障可以修權後明確新操作；CONFLICT有unresolvedAttempt或PENDING只恢復原operation；舊UNKNOWN有原marker不重送，IN_FLIGHT保持running。GET／刷新只讀本機，reconcile才讀Google且符合守衛才可能續寫。無強制覆蓋／restore／持久化。
- A-04非Google CAS／鎖；restart可清記憶體／Session／Evidence但不取消遠端。憑證僅backend repo外絕對canonical路徑、固定scope／host。

### T058與真實證據限制

所有圖描述產品設計分支，不是測試PASS圖。Component／Class原DRAFT與Specify批准日期為歷史藍圖標籤，保留；無新增驗收宣稱。Sequence legend明示DA-T058-01、原protected live FAIL（MISSING／UNKNOWN）、一般存取錯誤不證明保護專屬拒絕、遠端恰一次／真逾時／pending reconcile未有真實通過證據。明確false已知DENIED拒絕是已實作且離線有驗證的分支，不把缺欄當false；T057／T059真實成功與T058有限接受各自保留。

### CLI與視覺驗證

使用既有TEMP/classroomquiz-plantuml/plantuml.jar，PlantUML1.2026.9、Java Runtime、Graphviz2.44.1。沒有下載或安裝工具。PowerShell：

```powershell
$jarPath = Join-Path $env:TEMP 'classroomquiz-plantuml/plantuml.jar'
java -jar $jarPath -charset UTF-8 -checkonly -failfast2 './diagrams/002-component.puml' './diagrams/002-class.puml' './diagrams/002-sequence.puml'
java -jar $jarPath -charset UTF-8 -failfast2 -tpng './diagrams/002-sequence.puml'
```

三份checkonly exit0；修訂後sequence另checkonly／render均exit0。初次文件替換腳本斷言未匹配即中止（未寫PUML），修正定位後成功；第一次CLI仍對舊圖運行不當作修訂成功證據，以上最終結果是修訂後重跑。

本輪實際開啟三張PNG，sequence最後一次修訂後再開啟檢視；沒有錯誤頁／內容裁切，文字在原尺寸可讀，長sequence需捲動／縮放，沒有把整張縮圖當可讀輸出。Component／Class無需重產且SHA256與本輪前相同；sequence PNG已重新產生。圖無外部超連結；參照的模組／圖／文件存在。圖前後hash與PNG尺寸見t062-before-hashes.json、t062-after-hashes.json；不是改寫final-protected.json舊歷史hash。

### SpecKit Analyze

正式prerequisite一次確認002 Feature與AVAILABLE_DOCS；extensions.yml不存在，無前／後hook。分析唯讀，對21FR／7SC／26場景／64任務及圖責任逐項對應，覆蓋100%（不是全部真實測試PASS），未映射任務0、歧義0、重複需求0、憲章衝突0；CRITICAL0／HIGH0／MEDIUM0／LOW0。圖修訂僅對齊已核准安全規則／實際提前return，不變更需求／使用者流程，不新造跨組審查。

分析後在skill之外依本輪授權正式勾T062，62/64；T063條件已具備但本輪未開始，T064仍待。未修改產品／測試／001／憑證、未重跑應用或真API、未commit／push。T060既有安全證據未動。


## 最終提交前空白修正與三圖CLI複核（2026-11-19）

使用者另行授權指定非功能空白修正及有條件commit／push。只移除三份002 PUML、requirements.md、spec.md的檔尾空白行，以及us4-red.txt八行斷言輸出的空白分隔行；其為歷史runner輸出，不是測試fixture或預期答案。原fail8／pass2及全部錯誤文字不變，原編碼／換行保留，未整檔格式化。逐檔前後SHA256見t062-after-hashes.json的finalWhitespaceReview.whitespaceChanges；原sha256欄位保留歷史，新欄位為本次三圖最新值。

既有PlantUML CLI對三圖checkonly及tpng皆exit0。三張新PNG解壓後IDAT像素與尺寸逐一等於修正前；嵌入source metadata可能改變，故同步PNG及新hash，不虛構圖的語義變更。原001、產品／測試程式與DA-T058-01不變。僅涉及空白與紀錄，不重跑backend／frontend／E2E／build，既有138／15／21及build結果為先前實測；無真API／憑證讀取。所有修訂均在原195候選路徑內。
