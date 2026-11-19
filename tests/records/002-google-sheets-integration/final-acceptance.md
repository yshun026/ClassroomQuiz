# Feature 002 最終需求／驗收追溯（T063目前版本）

正式接受確認日期2026-11-19；不是未提供的實際測試日期。使用者已明確核准 **USER_APPROVED_FINAL_ACCEPTANCE**，T001–T064完成，64/64；**FINAL_ACCEPTED=true（專案內部）**。接受Sheets交付、T057–T059證據界線、Excel退役回歸、文件／三圖／矩陣與已揭露限制；不代表助教／第三方已接受，不授權Git提交或公開部署。原FAIL、DA-T058-01與NOT VERIFIED／NOT RUN全部保留。

以下是目前權威矩陣；其後原表與逐次證據完整保留為歷史。保留實作／測試索引P/A/W/Q/F及U-P等（見歷史「對照索引」），路徑相對repository。每列「類型」為可並存的部分證據，不是整列全分支PASS。

## 證據位置與實際結果

- OFF：維護後excel-retirement-final-backend.txt（138/138、fail0 skip0）、excel-retirement-final-frontend.txt（15/15、fail0 skip0）；清理前negative-diagnostic-backend.txt174/174及frontend15/15保留歷史，及原automated.md／US1–US4記錄；類型OFFLINE_TEST_PASS。本輪維護已實際重跑離線測試；詳excel-retirement.md，真API／人工未重跑。測試索引指出每列具體檔案／案例；舊157數字保留歷史。
- E2E：維護後excel-retirement-final-e2e.txt（21/21，1.1m）；清理前negative-diagnostic-e2e.txt亦保留歷史；類型E2E_TEST_PASS，fake Sheets／本機瀏覽器，非真Google。測試檔索引見歷史對照索引。
- LIVE：live.md的T057使用者2026-11-18回報A/B各6題／2批、pass1/fail0/exit0，及T058-4 read-denied pass1/fail0/skip0/exit0；USER_REPORTED_LIVE_PASS。每列只引用相應部分，不能由read-denied推知保護格拒絕。
- MAN：manual.md的T058-1/2/3及T059各階段、兩表首次／重複寫回、來源保真、人工衝突與A→B安全換場確認；USER_REPORTED_MANUAL_PASS。T059確認日期2026-11-19，實際操作日期未提供；衝突來源A/B／格址未提供，不推定兩表各測。
- DA：t058-negative-write.md頂部DA-T058-01與review-record.md正式核准；DEVIATION_ACCEPTED，僅專案內部有限證據決策，原protected FAIL仍保留。
- DOC：T061 t061-documentation.md與T062 diagram-consistency.md／t062-after-hashes.json；本輪文件與圖複核，不冒充應用測試PASS。T060 security.md僅既有候選範圍與結果，本輪不重掃或改寫。

契約：specs/002-google-sheets-integration/contracts/http.md、google-sheets.md；資料約束data-model.md。三圖是邏輯設計，不是測試PASS圖：002-component.puml（角色／後端credential／memory）、002-class.puml（動態Source／Snapshot／Evidence）、002-sequence.puml（準備／quiz／前驗／單批／verify／屏障／恢復）。各列共用三圖，對應細節見diagram-consistency.md。

## 21 FR／7 SC／26場景完整矩陣

### 21 FR

| ID／要求 | 任務 | 實作／契約／圖責任 | 自動測試索引 | 證據位置／類型／實際結果 | 限制／風險 |
| --- | --- | --- | --- | --- | --- |
| FR-001：P／W／F，正式URL→Sheets→原表、export410 | T020／023–026／040／042／061 | P／W／F，正式URL→Sheets→原表、export410；契約／三圖依共用索引 | H-P／H-W、guided-notes-export E2E；無Excel正式UI | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| FR-002：A，backend Service Account；既有本機身分 | T002–010／013–014 | A，backend Service Account；既有本機身分；契約／三圖依共用索引 | U-A、H-P與E-P無Google登入 | OFF,MAN,LIVE；OFFLINE_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| FR-003：P／A，URL allowlist取ID、非任意fetch | T010／015–023 | P／A，URL allowlist取ID、非任意fetch；契約／三圖依共用索引 | U-P URL案例、U-A invalid IDs／host、H-P任意欄位 | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| FR-004：P，全GRID含hidden、gid不限制、excluded | T018–022 | P，全GRID含hidden、gid不限制、excluded；契約／三圖依共用索引 | U-P dynamic A/B、E-P excluded | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 非GRID excluded與gid不限制主要為離線／E2E；B hidden真實已回報。 |
| FR-005：P，whole-cell Q1..QN／merge master／runs拒絕 | T015／018–021 | P，whole-cell Q1..QN／merge master／runs拒絕；契約／三圖依共用索引 | U-P非法及permission、H-P整份拒絕與位置 | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | 非法／formula／rich runs真實負例NOT VERIFIED；有效marker／merge已有真表。 |
| FR-006：P，先組數／全驗後commit、DENIED／UNKNOWN | T016–023 | P，先組數／全驗後commit、DENIED／UNKNOWN；契約／三圖依共用索引 | H-P全5案例、U-P保護／named/table、E-P | OFF,E2E,MAN,LIVE,DA；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, DEVIATION_ACCEPTED, NOT VERIFIED, FAIL | 已知DENIED準備拒絕真實NOT VERIFIED；protected FAIL MISSING／UNKNOWN；DA-T058-01，不能MISSING→false。 |
| FR-007：Q／P／W，每次teacher／活動／目標驗權 | T016／023／033／040／045／050 | Q／P／W，每次teacher／活動／目標驗權；契約／三圖依共用索引 | H-P、H-W、R-H auth／任意目標 | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS | 後端拒學生／失效／任意目標有離線；人工只確認學生無老師控制，不冒充HTTP攻擊驗收。 |
| FR-008：Q／W，原公平／隔離／同步、I/O外置 | T027–031／053–056 | Q／W，原公平／隔離／同步、I/O外置；契約／三圖依共用索引 | Q-T／E-Q與3個真worker等待案例 | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, NOT VERIFIED | 2秒／晚加入／同身分多頁籤人工細項NOT VERIFIED；四階段／順位／隔離真實PASS。 |
| FR-009：W／F，四階段只手動、無fills不寫 | T032／039–043 | W／F，四階段只手動、無fills不寫；契約／三圖依共用索引 | H-W NO_CHANGES、E-W、export四階段E2E | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| FR-010：immutable snapshot、最小rank／無人排除 | T032／035／039／053 | immutable snapshot、最小rank／無人排除；契約／三圖依共用索引 | U-S雙序、H-W immutable／E-W後閉題排除 | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| FR-011：W，來源基準＋Evidence／pending動態位置 | T034／038／044／047 | W，來源基準＋Evidence／pending動態位置；契約／三圖依共用索引 | U-S／R-U無誤缺題／他題marker文字 | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| FR-012：W，全批先驗，偵測衝突全停／無重綁 | T034／038–039／044／047 | W，全批先驗，偵測衝突全停／無重綁；契約／三圖依共用索引 | H-W later-cell zero write、R-U結構／formula | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS | 人工衝突歸屬A/B、格址未提供；不推定兩表各測；A-04無CAS。 |
| FR-013：A／W，精確單格stringValue、保留其他格式 | T011／018–021／034／038–039 | A／W，精確單格stringValue、保留其他格式；契約／三圖依共用索引 | U-A body mask／surrogate／2MiB、H-W兩fake全raw深比 | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | T057只比較API回傳欄位；人工rich text／行列像素尺寸細項NOT VERIFIED。 |
| FR-014：W，讀回才成功／逐題不混同 | T033／036–039／043–054 | W，讀回才成功／逐題不混同；契約／三圖依共用索引 | H-W 2xx readfail、R-U部分／lost reply、E-W | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT RUN | 真實丟回覆／逾時／部分結果NOT RUN；正常成功與重複不是錯誤時序證據。 |
| FR-015：W，活動Evidence略過、外部變更衝突 | T037–038／044／047–049 | W，活動Evidence略過、外部變更衝突；契約／三圖依共用索引 | R-U Evidence／還原marker、E-R實際UI略過／改值 | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | 略過與來源不變不證明遠端零請求／零重送，該真實性質NOT VERIFIED。 |
| FR-016：W，原snapshot／attempts＋UNKNOWN屏障 | T044–054 | W，原snapshot／attempts＋UNKNOWN屏障；契約／三圖依共用索引 | R-U／R-H未知原marker只讀、manual reconcile | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED, NOT RUN | 真逾時／PENDING reconcile NOT RUN；遠端恰一次NOT VERIFIED；原快照守衛有離線證據。 |
| FR-017：W，全活動互斥／舊ownership／雲端獨立 | T045–054 | W，全活動互斥／舊ownership／雲端獨立；契約／三圖依共用索引 | R-H雙teacher、E-R晚到A／Notes、Q-T等待 | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED | 真實多老師併發／晚到HTTP細項NOT VERIFIED；互斥離線與E2E，不冒充真Google時序。 |
| FR-018：A／W／F，安全錯誤／修權／不清活動Session | T006–010／024–025／041–052 | A／W／F，安全錯誤／修權／不清活動Session；契約／三圖依共用索引 | U-A安全envelope、R-U撤權readfail、E-R Google401 | OFF,E2E,MAN,LIVE,DA；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, DEVIATION_ACCEPTED, NOT VERIFIED, FAIL | 一般403/404不證明保護專屬拒絕，該歸因NOT VERIFIED；protected真實FAIL保留。 |
| FR-019：A／F，backend外置key／不洩密 | T002–010／060 | A／F，backend外置key／不洩密；契約／三圖依共用索引 | U-A key canonical／scope、security.md候選與bundle掃描 | OFF；OFFLINE_TEST_PASS | T060是既有候選範圍檢查，非本輪新掃描／GitHub未來全部產物保證。 |
| FR-020：P／F／memory，restart清本機不取消雲端，手動範本重用 | T020／057／059／061 | P／F／memory，restart清本機不取消雲端，手動範本重用；契約／三圖依共用索引 | REUSE、restart-process、E-P新增可見還原提示 | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | 安全換場使用者確認；精確operation欄位／重啟方式／已填來源人工拒絕細節NOT VERIFIED。 |
| FR-021：分層證據／兩真表／人工／三圖 | T005／014／026／031／043／054–064 | 分層證據／兩真表／人工／三圖；契約／三圖依共用索引 | automated.md、diagram-consistency.md與全部紀錄存在 | DOC；USER_APPROVED_FINAL_ACCEPTANCE | 使用者已核准專案內部接受；不代表所有分支PASS，既有未驗限制保留。 |

### 7 SC

| ID／要求 | 任務 | 實作／契約／圖責任 | 自動測試索引 | 證據位置／類型／實際結果 | 限制／風險 |
| --- | --- | --- | --- | --- | --- |
| SC-001：老師以兩份不同網址／分頁／格址範本各完成準備，題數及位置 100% 正確，老師與學生均無 Google 登入及 Excel 中介步驟。 | T026／057／059，U-P A/B、E-P、LIVE | P/F；契約／三圖依共用索引 | T026／057／059，U-P A/B、E-P、LIVE | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| SC-002：全部符合題目在原表正確位置 100% 為最快有效完整文字；未閉題／無人題及非答案內容沒有非預期變更。 | T043／057／059，H-W／U-A／LIVE文字及保真 | W/A；契約／三圖依共用索引 | T043／057／059，H-W／U-A／LIVE文字及保真 | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| SC-003：全部已偵測的人工改值、公式、移格、刪表與標記／結構衝突均拒絕尚未送出的更新，零自動強制覆寫與未核對成功提示。 | T034／038／044／047／058–059，R-U／H-W／E-R | W；契約／三圖依共用索引 | T034／038／044／047／058–059，R-U／H-W／E-R | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS | 受控人工衝突PASS非所有真實結構負例／所有競爭；A-04無遠端CAS。 |
| SC-004：重複點擊、雙頁籤、逾時與回覆遺失案例全部有可判定結果；待核對重試不盲覆寫，部分結果不誤報整批成功。 | T045–054／058–059，R-H／E-R／F-T | W/F；契約／三圖依共用索引 | T045–054／058–059，R-H／E-R／F-T | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED, NOT RUN | 受控時序離線／E2E PASS；真逾時／pending reconcile NOT RUN，精確遠端恰一次NOT VERIFIED。 |
| SC-005：老師加至少三組完成多題活動，維持每組每題最多一筆、閉題後零接受、閉題前零他組作答資訊及正常連線 2 秒內更新；雲端不可用仍可完成已準備搶答。 | T031／053／056／059，Q-T／E-Q三組／<2秒 | Q/F；契約／三圖依共用索引 | T031／053／056／059，Q-T／E-Q三組／<2秒 | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, NOT VERIFIED | 兩表三組正常人工PASS；人工2秒、晚加入／多頁籤與真雲端故障下搶答NOT VERIFIED。 |
| SC-006：所有負面來源／授權／標記案例無半場活動，所有未授權老師操作拒絕，待提交產物中真實憑證與 Token 數為零。 | T016／060，H-P／H-W／R-H／security.md | Q/A；契約／三圖依共用索引 | T016／060，H-P／H-W／R-H／security.md | OFF,E2E,DA；OFFLINE_TEST_PASS, E2E_TEST_PASS, DEVIATION_ACCEPTED, NOT VERIFIED, FAIL | 明確DENIED live NOT VERIFIED、原protected FAIL由DA-T058-01接受證據限制；安全候選檢查有範圍。 |
| SC-007：實作完成前保存自動與人工兩類實際證據、兩份授權來源實測與三圖逐項核對；未執行項目 100% 標未執行或受阻。 | T055–064，各分類紀錄及三圖 | 紀錄／三圖／T064關卡；契約／三圖依共用索引 | T055–064，各分類紀錄及三圖 | DOC；USER_APPROVED_FINAL_ACCEPTANCE | 使用者已核准專案內部接受；原FAIL／NOT VERIFIED／NOT RUN未轉PASS。 |

### 26個驗收場景

| ID／要求 | 任務 | 實作／契約／圖責任 | 自動測試索引 | 證據位置／類型／實際結果 | 限制／風險 |
| --- | --- | --- | --- | --- | --- |
| US1.1：有效組數＋來源、UNKNOWN提示一次建Q1 | P／F；T016–026 | P／F；T016–026；契約／三圖依共用索引 | H-P first／DENIED-UNKNOWN、E-P PASS | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 真表為六題來源，三題原scenario由離線覆蓋；UNKNOWN不是可寫保證。 |
| US1.2：新活動不同URL與位置 | P；T018–026 | P；T018–026；契約／三圖依共用索引 | U-P dynamic A/B、E-P B、REUSE PASS | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| US1.3：gid不限制、hidden／excluded | P；T018–022 | P；T018–022；契約／三圖依共用索引 | U-P all GRID、E-P excluded PASS | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | 真B hidden已確認；gid／excluded細項人工NOT VERIFIED。 |
| US1.4：無權／憑證／URL／來源失敗不留半場 | A／P；T006–023 | A／P；T006–023；契約／三圖依共用索引 | U-A auth／URL、H-P failures／DENIED PASS | OFF,E2E,LIVE,DA；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_LIVE_PASS, DEVIATION_ACCEPTED, NOT VERIFIED, FAIL | read-denied live PASS只證安全存取錯誤；已知DENIED真實NOT VERIFIED且protected FAIL保留。 |
| US1.5：非法／公式／runs／缺號／重號拒絕與位置 | P；T015／018–021 | P；T015／018–021；契約／三圖依共用索引 | U-P九種markers＋formula/runs、H-P PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED | 真實格式負例NOT VERIFIED；不將fake來源拒絕冒充live。 |
| US1.6：先groups、準備mutex、失敗釋放、來源鎖定 | P；T016／022–023 | P；T016／022–023；契約／三圖依共用索引 | H-P groups／mutex／lock PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED | mutex競爭／失敗釋放人工NOT VERIFIED，既有離線與E2E證據。 |
| US1.7：未登入／student禁止準備 | Q／P；T016／023 | Q／P；T016／023；契約／三圖依共用索引 | H-P unauthorized零Access PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED | 真實未授權HTTP測試NOT VERIFIED；後端驗權離線。 |
| US2.1：唯一連續rank／每組一次／閉題後拒答 | Q；T027–031 | Q；T027–031；契約／三圖依共用索引 | Q-T submit-close雙序／duplicate／blank PASS | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, NOT VERIFIED | 空白提交人工細項NOT VERIFIED；順位／重複／閉後拒改人工PASS。 |
| US2.2：自己投影、觀察組零額外通知／計數 | Q；T028／053 | Q；T028／053；契約／三圖依共用索引 | quiz-socket-isolation／E-Q與worker等待PASS | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS | 未公布答案人工隔離PASS；零額外事件／revision側通道由離線證明。 |
| US2.3：Next WAITING、末題COMPLETED、閉題不重開 | Q；T027／031 | Q；T027／031；契約／三圖依共用索引 | quiz-http／activity-lifecycle／E-Q PASS | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| US2.4：雲端斷線／等待不擋已載入搶答 | Q／W；T030／053 | Q／W；T030／053；契約／三圖依共用索引 | sheets-quiz-independence 7項＋E-Q outage PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED | 真Google故障下搶答NOT VERIFIED；本機斷線重連不是Google中斷證據。 |
| US2.5：<2秒、晚加入、Session恢復／多頁籤／不重送 | Q／F；T028–031／053 | Q／F；T028–031／053；契約／三圖依共用索引 | group-session、Socket、E-Q realtime／identity PASS | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, NOT VERIFIED | 人工2秒／晚加入／多頁籤NOT VERIFIED；四階段刷新／斷線重連人工PASS。 |
| US3.1：閉題最小rank原表動態位置、無XLSX | W；T032–043 | W；T032–043；契約／三圖依共用索引 | U-S／H-W／E-W PASS | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS | 僅依已提供結果範圍，不補操作日期／精確數值；共通安全限制適用。 |
| US3.2：未閉／無人不動、無fills零寫 | W；T032／039 | W；T032／039；契約／三圖依共用索引 | H-W NO_CHANGES／snapshot、E-W PASS | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | 真無fills零Google傳輸NOT VERIFIED；未閉／無人保marker由T057真API支持。 |
| US3.3：等號／空白／換行／Unicode精確字串 | A／W；T011／032／043 | A／W；T011／032／043；契約／三圖依共用索引 | U-A string mask／H-W／convergence E2E PASS | OFF,LIVE；OFFLINE_TEST_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | 等號／Unicode／換行真實自動由T057支持，T059人工特殊文字細項NOT VERIFIED。 |
| US3.4：只改目標、非答案公式／格式／merge不改 | A／W；T034／038–043 | A／W；T034／038–043；契約／三圖依共用索引 | H-W A/B raw深比／U-A PASS | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | 人工未明確逐項rich text／行列尺寸NOT VERIFIED；公式定義及一般格式已回報。 |
| US3.5：快照與close雙序，不混後來答案 | W；T032／035 | W；T032／035；契約／三圖依共用索引 | U-S雙序／H-W held read／E-W later Q2 PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED | 真實close與snapshot競爭NOT VERIFIED；同步雙序離線／E2E。 |
| US3.6：學生／失效／舊活動／任意目標拒絕 | Q／W；T033／040 | Q／W；T033／040；契約／三圖依共用索引 | H-W auth／R-H／ownership PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED | 真未授權／舊ID／任意格址HTTP驗收NOT VERIFIED；後端契約離線。 |
| US4.1：Evidence解釋已取代marker、略過並可加新閉題 | W；T037–049 | W；T037–049；契約／三圖依共用索引 | R-U evidence＋E-R skip、H-W PASS | OFF,E2E,MAN,LIVE；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, NOT VERIFIED | T057新增後閉題＋重複、T059兩表略過支持；遠端零重送NOT VERIFIED。 |
| US4.2：值／formula／位置／merge／sheet衝突全停 | W；T034／044／047 | W；T034／044／047；契約／三圖依共用索引 | U-S結構／R-U priorEvidence／E-R external PASS | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, NOT VERIFIED | 單次人工衝突來源歸屬未提供；其他真結構負例NOT VERIFIED。 |
| US4.3：無證據同答案仍衝突 | W；T034／044 | W；T034／044；契約／三圖依共用索引 | U-S unexplained same-as-answer／R-U PASS | OFF；OFFLINE_TEST_PASS, NOT VERIFIED | 真實無依據同答案案例NOT VERIFIED。 |
| US4.4：可能送達逾時／lost reply留快照pending | W；T039／045／049 | W；T039／045／049；契約／三圖依共用索引 | U-A200s／H-W／R-H lost POST／R-U lost Google PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT RUN | 真逾時／lost reply NOT RUN；離線可控時序PASS。 |
| US4.5：原目標全部核對，UNKNOWN marker不能盲重送 | W；T044–050 | W；T044–050；契約／三圖依共用索引 | R-U partial／safe resend／撤權／conflict，R-H PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT RUN | 真PENDING reconcile NOT RUN；不得把FAILED修權恢復當pending成功。 |
| US4.6：重複點擊／雙頁籤互斥、晚到不覆新 | W／F；T045–053 | W／F；T045–053；契約／三圖依共用索引 | R-H雙teacher／F-T／E-R late A success-error PASS | OFF,E2E；OFFLINE_TEST_PASS, E2E_TEST_PASS, NOT VERIFIED | 真多老師競爭／晚到回覆NOT VERIFIED；離線／E2E有證據。 |
| US4.7：權限／配額／網路保留活動、已拒絕vs未知 | A／W／F；T006–010／048–052 | A／W／F；T006–010／048–052；契約／三圖依共用索引 | U-A statuses／R-U safe new op／E-R401 PASS | OFF,E2E,MAN,LIVE,DA；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, USER_REPORTED_LIVE_PASS, DEVIATION_ACCEPTED, NOT VERIFIED, NOT RUN, FAIL | T058-2/3/4真實安全行為PASS；保護專屬歸因NOT VERIFIED及原protected FAIL，真逾時NOT RUN。 |
| US4.8：新活動已填來源拒絕、提示還原／複製 | P／F；T020／059／061 | P／F；T020／059／061；契約／三圖依共用索引 | REUSE＋E-P提示PASS；無自動還原 | OFF,E2E,MAN；OFFLINE_TEST_PASS, E2E_TEST_PASS, USER_REPORTED_MANUAL_PASS, NOT VERIFIED | 安全新副本換場人工PASS；已填來源拒絕／人工還原個別人工步驟NOT VERIFIED。 |

## 統計與未驗證清單

54列全部有任務、實作／責任、測試或實際紀錄、證據結果與限制：FR21/21、SC7/7、場景26/26，追溯覆蓋100%。64項任務均保留原描述與需求映射於t063-traceability.json；不是新增任務。以下統計是「含該類證據的追溯列數」，可重疊，不能相加當作測試數或通過率。

| 證據類型 | 追溯列數 |
| --- | ---: |
| OFFLINE_TEST_PASS | 52 |
| E2E_TEST_PASS | 48 |
| USER_REPORTED_MANUAL_PASS | 35 |
| USER_REPORTED_LIVE_PASS | 26 |
| DEVIATION_ACCEPTED | 5 |
| NOT VERIFIED | 31 |
| NOT RUN | 8 |
| FAIL | 5 |

- FAIL：原protected live P_EDITABILITY_MISSING／UNKNOWN，不能改成PASS。首次T057通用失敗亦保留live.md歷史，後續成功不覆寫當次結果。
- NOT VERIFIED：已知DENIED live、保護專屬拒絕歸因、完整真實遠端恰一次／零重送、人工2秒／空白／晚加入／多頁籤／rich text／像素尺寸等未明確細項、衝突逐表歸屬、實際操作日期及未提供operation／工作表精確資料。每列範圍如上，不新增原需求以外的硬性測試。
- NOT RUN：真Google寫入逾時／回覆遺失／PENDING reconcile。T064現已取得使用者明確接受；離線及E2E已涵蓋受控異常，不充當真實通過。
- DA-T058-01只處理T058內部結案證據，不變更FR-006／018、UNKNOWN／pending屏障、原assertion或安全規則。MISSING不是false；一般403／404非保護專屬證據。A-04無CAS、外部協作前提與永久pending風險不變。

## T063完成邊界

T063是證據整理／完整性審查任務，未驗項目已按原要求明示，不把T064整體接受預先完成。T057／T059原任務已正式接受；T058有限證據由使用者明確核准。原protected FAIL是已接受證據限制，不假裝產品拒絕分支已實測PASS；沒有新增已知重大產品失敗可由文件結案掩蓋。正式勾選需本輪Analyze無CRITICAL／HIGH阻擋，於分析外處理。T060／061／062證據保持其歷史範圍，不重新執行或擴大宣稱。

## T063檢查結果與結案

2026-11-19：FR21/21、SC7/7、US場景26/26、任務64/64有追溯；54列無缺項、任務無孤立項。20個具體實作／測試路徑核對存在；55個001歷史／憲章／核心等保護檔與final-protected.json雜湊一致（另單獨001／歷史／憲章子集40項一致），002六份圖採T062最新hash，不把其預期修訂誤報歷史損壞。未發現無關新功能；本輪不做安全掃描或新應用測試，T060既有證據不變。

唯讀speckit-analyze正式prerequisite一次確認Feature為specs/002-google-sheets-integration；無extensions.yml前／後hook。CRITICAL0／HIGH0／MEDIUM0／LOW0；需求／場景與Plan、資料模型、契約、任務、最新三圖一致。未映射任務0、歧義0、重複需求0、憲章衝突0。原E1已依T059安全換場確認解除。已列出的真實證據限制是保留的限制，不被誤判為已通過；原protected FAIL按DA-T058-01內部接受，不降低產品安全要求。

分析完成後，於skill外依本輪授權正式勾T063，63/64；T064仍未勾、未開始。T063完成理由是所需矩陣／結果／限制／001與憲章核對全部完成，T057–T062前置已正式接受，未掩蓋尚未接受的重大產品故障。FINAL_ACCEPTED=false仍成立，不搶先宣布T064。可進入T064供使用者最終人工審查。未修改產品／測試／001／DA-T058-01、未執行真API／讀憑證／重跑人工，未commit／push。

## 獨立Excel退役維護追溯（2026-11-19）

T001–T063原已完成事實不變，63/64、T064待接受。當前實作不含validateAndImport／renderExport／舊exportClosedWinnerSnapshot、GuidedNotesDocument／workbook-*或download.js。原單元Excel標記規則由sheets-source-parser.test.js（含新增單題／前空白／破括號）承接；最快快照由writeback-snapshot.test.js；完整escape-looking文字／CRLF／Unicode及非目標深比由writeback-http.test.js新增案例、source-consistency與Access契約承接；非法surrogate／過大答案仍由recovery零寫測試承接。OOXML壓縮／編碼專用斷言隨已淘汰功能移除，不假稱仍測同一格式。

export-http.test.js仍驗401／403／410、四phase、不發雲端呼叫、不出binary／私人錯誤；fixtures改Sheets。frontend realtime.test.js將舊download晚到成功／失敗守衛遷移到現行api('/activity')，保留STALE_RESPONSE及新token不被清除。full-activity.spec.js保留完整登入／claim／late join／閉題／Session／reset斷言，改以Sheets深比和重複略過取代舊XLSX產生。guided-notes-export.spec.js與convergence-regressions.spec.js保留正式退役及Sheets文字保真。

新離線138/138、frontend15/15、E2E21/21、build與後端smoke，舊174/15/21及所有真API／人工／DA結果不覆寫。原歷史索引或64任務描述中的已刪檔引用是當時執行事實，不作當前可執行入口；現行對應以上述檔案為準。三圖責任及最新T062hash未變，未修圖／重渲染。無新增產品功能或放寬安全條件。

## 歷史證據（原文保留，狀態以上表為目前版本）

<details><summary>展開原始矩陣與逐次驗收／審查歷史</summary>


## 最新T058內部有限證據接受：DA-T058-01（2026-11-18）

使用者明確核准的專案內部驗收決策，不代表課程助教或跨組偏差接受。正式條件與需求逐項證據矩陣見 [t058-negative-write.md](t058-negative-write.md) 頂部DA-T058-01。T058-1／2／3為使用者人工PASS，T058-4為使用者真實live PASS；只按已回報範圍接受。已知DENIED準備拒絕真實證據及保護專屬拒絕歸因NOT VERIFIED；遠端恰一次完整真實證據NOT VERIFIED；真實斷線／逾時／PENDING reconcile NOT RUN。原protected MISSING／UNKNOWN FAIL保留，不改assertion或FR-006／FR-018／UNKNOWN屏障、不盲重送要求。

T058依修訂後有限證據標準完成，59/64；不表示所有live案例PASS或完整Feature接受。T059未開始，T061–T064仍待；原PENDING／58/64敘述保留歷史時點，以上述決策為目前狀態。

---
# Feature 002 Final驗收追溯 — PENDING（尚未整合驗收完成）

**最新證據更新**：使用者回報2026-11-18兩份真API正向驗收通過：A/B各6題／2批、pass1／fail0／exit0；原表Q1／Q3正確、Q2保marker、其他內容與格式無非預期變更（詳live.md文末）。T003／T004／T057已勾選，總58/64。以下55/64與live NOT RUN是先前Final準備快照；矩陣中T057相關正向API證據現已補齊，但T058／T059／T061–T064仍未完成，SC-007／完整Final接受仍PENDING。不是代理獨立重跑，不推定完整UI／三組／權限切換驗收。


2026-11-18；branch codex/google-sheets-integration；Feature specs/002-google-sheets-integration。**INTEGRATION_COMPLETE=false；FINAL_ACCEPTED=false**。US1–US4已由使用者接受，不等於T064接受。

本輪離線後端157/157、前端15/15、全E2E21/21、build成功；細節見automated.md。live僅停用gate執行（0 pass／1 NOT RUN skip），T057／T058／T059／T064仍PENDING。使用者先前真實讀取與寫回成功保持USER_REPORTED_REAL_READ／READ_WRITE_SUCCESS，見user-real-read.md、user-real-write.md；無兩表完整驗收／截圖／未提供日期的推定。

## 對照索引（路徑相對repo）

實作：P=backend/src/services/guided-notes-service.js＋activity-service.js與api/preparation-routes.js；A=backend/src/config.js＋services/sheets-access.js；W=backend/src/services/writeback-coordinator.js＋source-consistency.js＋models/writeback-operation.js／writeback-evidence.js＋api/guided-notes-routes.js；Q=既有question／submission／authorization／synchronization services及realtime/socket-server.js；F=frontend/src/pages/TeacherPage.jsx＋services/guided-notes.js／session.js／realtime.js。

測試索引（每個索引是實際檔案，不把計畫當PASS）：

- U-P：backend/tests/unit/sheets-source-parser.test.js（URL、all GRID／offset／hidden／merge、9種非法標記、formula／duplicate／runs／permission）。
- U-A：backend/tests/unit/sheets-access.test.js、google-config.test.js（scope／固定host／key路徑／讀重試預算／逐格mask／單次寫／錯誤遮蔽）。
- H-P：backend/tests/integration/preparation-http.test.js（先groups、完整commit／lock、失敗互斥／重試、拒絕、驗權）；E-P=tests/e2e/teacher-preparation.spec.js。
- U-S：backend/tests/unit/writeback-snapshot.test.js、source-consistency.test.js（immutable雙序、stable ID／結構／公式／Evidence優先）。
- H-W：backend/tests/integration/writeback-http.test.js（eligible零I/O、字串保真、全批先驗、auth／任意目標、讀回／pending／settle／舊ownership）。
- R-U：backend/tests/unit/writeback-recovery.test.js（Evidence略過／改值／marker衝突、部分／UNKNOWN、權限、safe resend、lost Google reply、無法表示／超大）。
- R-H：backend/tests/integration/writeback-recovery-http.test.js（reconcile auth／busy／eligible、雙老師、lost POST、IN_FLIGHT／UNKNOWN屏障）。
- E-W／E-R：tests/e2e/google-sheets-writeback.spec.js、google-sheets-recovery.spec.js（手動、快照、刷新／pending、雙頁籤、Google401、跨ID晚到A成功／錯誤／Notes）。
- F-T：frontend/tests/guided-notes.test.js、realtime.test.js、setup.test.js（Session／snapshot／晚到回覆及獨立測試身分；Session測試在realtime.test.js）。
- Q-T：backend/tests/unit/submission-order.test.js、integration/quiz-http.test.js、quiz-socket-isolation.test.js、group-session-http.test.js、restart-process.test.js、sheets-quiz-independence.test.js；E-Q=tests/e2e/single-question.spec.js、realtime-lifecycle.spec.js、student-identity.spec.js、full-activity.spec.js。
- REUSE：backend/tests/integration/source-reuse.test.js（新活動不沿用舊Evidence；已填來源拒絕，僅模擬人工還原後可匯入）。
- LIVE：backend/tests/live/google-sheets.test.js；guard及共享驗收演算法離線契約=unit/live-gate.test.js。真實執行及人工結果留live.md／manual.md，不冒充已執行。

下列「離線PASS」是本次完整suite內對應案例已通過；只表示本機／fake證據，需真表或人工的欄位仍PENDING。

## 21項FR：實作／任務／測試／實際證據

| ID | 實作／要求 | 任務 | 自動對應（離線PASS） | 仍待驗證 |
| --- | --- | --- | --- | --- |
| FR-001 | P／W／F，正式URL→Sheets→原表、export410 | T020／023–026／040／042／061 | H-P／H-W、guided-notes-export E2E；無Excel正式UI | 完整兩表live／manual；局部使用者已成功 |
| FR-002 | A，backend Service Account；既有本機身分 | T002–010／013–014 | U-A、H-P與E-P無Google登入 | Cloud／ACL完整確認 |
| FR-003 | P／A，URL allowlist取ID、非任意fetch | T010／015–023 | U-P URL案例、U-A invalid IDs／host、H-P任意欄位 | 兩份真URL正確映射 |
| FR-004 | P，全GRID含hidden、gid不限制、excluded | T018–022 | U-P dynamic A/B、E-P excluded | 真B hidden與merge |
| FR-005 | P，whole-cell Q1..QN／merge master／runs拒絕 | T015／018–021 | U-P非法及permission、H-P整份拒絕與位置 | 真實範本與局部格式異常 |
| FR-006 | P，先組數／全驗後commit、DENIED／UNKNOWN | T016–023 | H-P全5案例、U-P保護／named/table、E-P | T058實際分享／保護差異 |
| FR-007 | Q／P／W，每次teacher／活動／目標驗權 | T016／023／033／040／045／050 | H-P、H-W、R-H auth／任意目標 | 無離線缺口；manual角色確認 |
| FR-008 | Q／W，原公平／隔離／同步、I/O外置 | T027–031／053–056 | Q-T／E-Q與3個真worker等待案例 | 三組兩表人工完整觀察 |
| FR-009 | W／F，四階段只手動、無fills不寫 | T032／039–043 | H-W NO_CHANGES、E-W、export四階段E2E | 真表人工無自動寫 |
| FR-010 | immutable snapshot、最小rank／無人排除 | T032／035／039／053 | U-S雙序、H-W immutable／E-W後閉題排除 | LIVE文字與rank／manual |
| FR-011 | W，來源基準＋Evidence／pending動態位置 | T034／038／044／047 | U-S／R-U無誤缺題／他題marker文字 | 真表重複與結構核對 |
| FR-012 | W，全批先驗，偵測衝突全停／無重綁 | T034／038–039／044／047 | H-W later-cell zero write、R-U結構／formula | 真表衝突／人工比對 |
| FR-013 | A／W，精確單格stringValue、保留其他格式 | T011／018–021／034／038–039 | U-A body mask／surrogate／2MiB、H-W兩fake全raw深比 | LIVE返回欄位比對＋人工尺寸／字串 |
| FR-014 | W，讀回才成功／逐題不混同 | T033／036–039／043–054 | H-W 2xx readfail、R-U部分／lost reply、E-W | 真網路／兩表讀回、未發生不造結果 |
| FR-015 | W，活動Evidence略過、外部變更衝突 | T037–038／044／047–049 | R-U Evidence／還原marker、E-R實際UI略過／改值 | 真表重複／外部衝突 |
| FR-016 | W，原snapshot／attempts＋UNKNOWN屏障 | T044–054 | R-U／R-H未知原marker只讀、manual reconcile | 真實未知結果僅記發生情形 |
| FR-017 | W，全活動互斥／舊ownership／雲端獨立 | T045–054 | R-H雙teacher、E-R晚到A／Notes、Q-T等待 | 人工雙頁籤／恢復 |
| FR-018 | A／W／F，安全錯誤／修權／不清活動Session | T006–010／024–025／041–052 | U-A安全envelope、R-U撤權readfail、E-R Google401 | T058真實權限案例 |
| FR-019 | A／F，backend外置key／不洩密 | T002–010／060 | U-A key canonical／scope、security.md候選與bundle掃描 | 新增證據／實際提交前再掃描；不檢索私人key |
| FR-020 | P／F／memory，restart清本機不取消雲端，手動範本重用 | T020／057／059／061 | REUSE、restart-process、E-P新增可見還原提示 | 人工安全重用／兩表 |
| FR-021 | 分層證據／兩真表／人工／三圖 | T005／014／026／031／043／054–064 | automated.md、diagram-consistency.md與全部紀錄存在 | **PARTIAL：live／manual／最終接受未完成** |

## 7項SC

| ID | 任務／對應證據 | 目前判定 |
| --- | --- | --- |
| SC-001 | T026／057／059，U-P A/B、E-P、LIVE | 離線PASS；兩不同真表100%準備／位置仍PENDING |
| SC-002 | T043／057／059，H-W／U-A／LIVE文字及保真 | 離線PASS＋使用者局部真實寫回回報；完整兩表／非目標實測PENDING |
| SC-003 | T034／038／044／047／058–059，R-U／H-W／E-R | 偵測衝突離線PASS，真表人工PENDING；A-04無CAS不變 |
| SC-004 | T045–054／058–059，R-H／E-R／F-T | 全受控時序離線PASS；不假稱真網路逾時發生 |
| SC-005 | T031／053／056／059，Q-T／E-Q三組／<2秒 | 本機自動PASS，完整兩表人工PENDING |
| SC-006 | T016／060，H-P／H-W／R-H／security.md | 本次候選安全與負面離線PASS；新檔或實際提交前複查 |
| SC-007 | T055–064，各分類紀錄及三圖 | **PENDING**：兩表live／完整人工／T064缺少，未執行均明示 |

## 26個驗收場景（與spec原US編號逐一對應）

| 場景 | 範圍 | 實作／任務 | 自動測試與實際證據 | live／manual |
| --- | --- | --- | --- | --- |
| US1.1 | 有效組數＋來源、UNKNOWN提示一次建Q1 | P／F；T016–026 | H-P first／DENIED-UNKNOWN、E-P PASS | 局部使用者讀取；完整待驗 |
| US1.2 | 新活動不同URL與位置 | P；T018–026 | U-P dynamic A/B、E-P B、REUSE PASS | 兩份真表PENDING |
| US1.3 | gid不限制、hidden／excluded | P；T018–022 | U-P all GRID、E-P excluded PASS | B實測PENDING |
| US1.4 | 無權／憑證／URL／來源失敗不留半場 | A／P；T006–023 | U-A auth／URL、H-P failures／DENIED PASS | T058 PENDING |
| US1.5 | 非法／公式／runs／缺號／重號拒絕與位置 | P；T015／018–021 | U-P九種markers＋formula/runs、H-P PASS | 真負例PENDING |
| US1.6 | 先groups、準備mutex、失敗釋放、來源鎖定 | P；T016／022–023 | H-P groups／mutex／lock PASS | manual PENDING |
| US1.7 | 未登入／student禁止準備 | Q／P；T016／023 | H-P unauthorized零Access PASS | manual PENDING |
| US2.1 | 唯一連續rank／每組一次／閉題後拒答 | Q；T027–031 | Q-T submit-close雙序／duplicate／blank PASS | manual PENDING |
| US2.2 | 自己投影、觀察組零額外通知／計數 | Q；T028／053 | quiz-socket-isolation／E-Q與worker等待PASS | manual PENDING |
| US2.3 | Next WAITING、末題COMPLETED、閉題不重開 | Q；T027／031 | quiz-http／activity-lifecycle／E-Q PASS | manual PENDING |
| US2.4 | 雲端斷線／等待不擋已載入搶答 | Q／W；T030／053 | sheets-quiz-independence 7項＋E-Q outage PASS | 真Google斷線若未發生記NOT RUN |
| US2.5 | <2秒、晚加入、Session恢復／多頁籤／不重送 | Q／F；T028–031／053 | group-session、Socket、E-Q realtime／identity PASS | manual PENDING |
| US3.1 | 閉題最小rank原表動態位置、無XLSX | W；T032–043 | U-S／H-W／E-W PASS | 使用者局部真實成功；兩表待驗 |
| US3.2 | 未閉／無人不動、無fills零寫 | W；T032／039 | H-W NO_CHANGES／snapshot、E-W PASS | LIVE／manual PENDING |
| US3.3 | 等號／空白／換行／Unicode精確字串 | A／W；T011／032／043 | U-A string mask／H-W／convergence E2E PASS | LIVE／manual PENDING |
| US3.4 | 只改目標、非答案公式／格式／merge不改 | A／W；T034／038–043 | H-W A/B raw深比／U-A PASS | 兩真表API＋肉眼PENDING |
| US3.5 | 快照與close雙序，不混後來答案 | W；T032／035 | U-S雙序／H-W held read／E-W later Q2 PASS | manual PENDING |
| US3.6 | 學生／失效／舊活動／任意目標拒絕 | Q／W；T033／040 | H-W auth／R-H／ownership PASS | manual PENDING |
| US4.1 | Evidence解釋已取代marker、略過並可加新閉題 | W；T037–049 | R-U evidence＋E-R skip、H-W PASS | 真表重複PENDING |
| US4.2 | 值／formula／位置／merge／sheet衝突全停 | W；T034／044／047 | U-S結構／R-U priorEvidence／E-R external PASS | 真表衝突PENDING |
| US4.3 | 無證據同答案仍衝突 | W；T034／044 | U-S unexplained same-as-answer／R-U PASS | manual PENDING |
| US4.4 | 可能送達逾時／lost reply留快照pending | W；T039／045／049 | U-A200s／H-W／R-H lost POST／R-U lost Google PASS | 真網路未測，NOT RUN |
| US4.5 | 原目標全部核對，UNKNOWN marker不能盲重送 | W；T044–050 | R-U partial／safe resend／撤權／conflict，R-H PASS | 真恢復PENDING |
| US4.6 | 重複點擊／雙頁籤互斥、晚到不覆新 | W／F；T045–053 | R-H雙teacher／F-T／E-R late A success-error PASS | manual PENDING |
| US4.7 | 權限／配額／網路保留活動、已拒絕vs未知 | A／W／F；T006–010／048–052 | U-A statuses／R-U safe new op／E-R401 PASS | T058 PENDING |
| US4.8 | 新活動已填來源拒絕、提示還原／複製 | P／F；T020／059／061 | REUSE＋E-P提示PASS；無自動還原 | 人工重用PENDING |

本表覆蓋數：21 FR、7 SC、26場景，均有實作及自動測試對應；沒有把「已有測試程式」等同「真表已執行」。live／manual缺口是驗收證據缺口，非擅自刪除需求。

## Constitution／範圍及停止點

- 原則I／II：需求、跨組與人工授權見review-record.md；未新增OAuth／Drive／資料庫／強制還原等功能。Final只補live harness、驗收文件／安全掃描及US4.8提示／測試。
- 原則III：三圖映射／PNG檢視及hash見diagram-consistency.md；未改圖，無需重產。
- 原則IV／V：搶答核心、Session／Socket／StudentPage及001歷史61個保護檔hash未變；userEnteredValue精確批次、未知不重送；A-04無遠端CAS保證不變。
- 原則VI：fake PASS、live NOT RUN、user-reported局部真實成功、manual／T064 PENDING清楚分開；候選安全見security.md。

可交付給使用者進行最終人工驗收；**不能標Feature整合完成／最終可提交版已接受**。T055／T056／T060完成，總55/64勾選；尚未勾選T003、T004、T057、T058、T059、T061、T062、T063、T064。其中T061操作文件、T062離線圖表核對及T063矩陣均已備妥，但尊重T059→T061→T062→T063相依順序，待真實／人工結果後最後複核結案，不因準備產物存在就跳過關卡。待使用者完成設定／兩表／權限／人工並明確接受後，更新證據與候選掃描再評估GitHub提交；本輪不commit／push。

## T058最新證據追溯補充（2026-11-18，非最終接受）

| 需求／場景 | 真實驗收證據對應 | 最新狀態 |
| --- | --- | --- |
| FR-006／US1已知不可編輯拒絕準備 | K：既有protected assertion，parseSource必須拋出SHEETS_NOT_EDITABLE | 使用者回報MISSING／UNKNOWN，pass0 fail1 exit1；本分支真實證據未取得，不能記PASS |
| FR-006／未知權限警告放行 | U：完整有效來源建立、老師警告、準備零試寫 | 待新副本人工逐項記錄 |
| FR-018／US4.7拒寫保留結果 | N：老師手動正式回填、可信明確拒絕、活動答案rank及Session保留、無重送、原表未變 | NOT RUN；一般403/404或產品錯誤碼不證明保護拒絕 |
| FR-018／US4.7修權恢復 | R：無舊未知風險後修權，依原操作狀態安全恢復 | NOT RUN |
| SC-006／21FR、7SC、26場景整體 | 原矩陣維持；補充方案不增加或刪除需求／場景 | T058／T059與Final仍PENDING，總58/64 |

步驟與分類限制見 [t058-negative-write.md](t058-negative-write.md)。N補充證據不能替代K；若需接受替代或豁免，須另行人工批准並留下限制，不由代理自行結案。既有離線分支測試與真實證據分欄，原歷史紀錄保留。

## 2026-11-18 使用者回報：T058-U UNKNOWN警告與正常建立活動 PASS

實際驗收日期與本次確認日期均為2026-11-18。證據來源為本對話使用者文字回報，代理未自行操作／呼叫API，沒有新增或取得截圖。

- 參與組數3；活動WAITING；題目6；納入工作表1。
- 老師端顯示「寫入權限尚未確認」；使用者確認Google Sheets原始標記完整。
- 判定：僅T058-U「UNKNOWN警告與正常建立活動」記USER_REPORTED_MANUAL_PASS，對應FR-006未知權限分支。
- 不證明來源可寫、Google遠端零寫入請求、提交／閉題後行為、保護拒絕歸因或完整Final通過；未提供的細節不補填。
- 保留現有活動，尚待正式手動負向寫入與恢復。K已知DENIED真實證據仍缺；N拒寫安全行為／讀取撤權／R修權恢復仍待驗。T058整體未完成，總58/64，無任務勾選變更。

## 2026-11-18 T058-2 使用者回報：失敗後資料保留 PASS

使用者回報實際日期2026-11-18：老師手動寫回一次後顯示「寫回未完成」；後續確認訊息「Google Sheets 暫時無法使用，請稍後再試」，Q1顯示未寫入。兩組有效答案與順位1／2均保留，老師Session有效，活動仍第1題RESULTS，原始{{Q1}}未變。使用者另按一次「重新取得寫回狀態」，畫面未變。

僅將「失敗後活動、答案、順位與Session保留」記USER_REPORTED_MANUAL_PASS。一般錯誤不證明Google已收到或拒絕寫入，也不歸因保護範圍；原標記未變不證明舊請求安全結束。尚未提供本機GET的status／running／canReconcile欄位，未自行記錄其實際值。原protected已知DENIED真實證據仍缺，恢復／讀取撤權仍待驗。T058未完成，58/64不變。代理僅更新紀錄及唯讀分析，未執行API／寫回／reconcile／重啟／測試、未讀私鑰、未commit／push，無截圖或其他細節補造。

## 2026-11-18 T058-3 修復權限後安全恢復：USER_REPORTED_MANUAL_PASS

使用者提供實際驗收日期2026-11-18：原operation確認FAILED、running=false、canReconcile=false；保留同一活動，使用者移除專用測試表Q1答案格保護，再由老師明確點一次寫回。老師端顯示成功，原表Q1為順位1完整答案、順位2未覆蓋，其他未完成題目保留標記；兩組答案、順位與老師Session均保留。僅保存必要題號，不記私人來源／座標／帳號。未提供截圖，不補造。

本子情境記USER_REPORTED_MANUAL_PASS，對應FR-018／US4.7恢復證據；補充先前尚未提供的原operation狀態。T058-1／2／3子情境已依使用者回報通過，不推定完整T058或Final通過。先前存取錯誤仍未歸因保護專屬拒絕；原protected MISSING／UNKNOWN失敗歷史與已知DENIED真實證據缺口保留。T058整體PENDING，58/64不變。下一個全新副本read-denied案例NOT RUN；代理未執行真API、讀key、改表、重啟、commit或push。

## 2026-11-18 T058-4 撤銷讀取存取：USER_REPORTED_LIVE_PASS

實際日期2026-11-18。使用者確認已對全新專用測試副本撤銷Service Account讀取存取，執行GOOGLE_LIVE_MODE=read-denied，回報：

```text
✔ Google Sheets real API acceptance
A read-denied safe error observed; this does not prove known write denial
tests 1
pass 1
fail 0
skipped 0
Read-denied test exit code: 0
```

證據分類USER_REPORTED_LIVE_PASS，對應T058讀失敗安全錯誤／FR-018；並非代理獨立執行。現有runner只GET A，B僅配置檢查，該分支不寫A/B；這是程式路徑核對，不捏造遠端請求監控。使用者撤權操作加真實安全錯誤支持此子情境，不由錯誤碼單獨推定撤權／不存在，不證明保護範圍專屬拒絕。原protected P_EDITABILITY_MISSING／UNKNOWN失敗保留。

### 最新T058證據總表（覆蓋先前NOT RUN快照的狀態，不改寫歷史）

| 子情境 | 最新證據／狀態 | 限制 |
| --- | --- | --- |
| T058-1 UNKNOWN警告與活動建立 | USER_REPORTED_MANUAL_PASS | 不證明可寫或遠端零寫入請求 |
| T058-2 失敗後活動／兩組答案順位／Session保留 | USER_REPORTED_MANUAL_PASS | 前置讀失敗與遠端寫拒絕無法由一般錯誤區分；不宣稱保護專屬拒絕 |
| T058-3 FAILED安全結束後同活動修權手動恢復 | USER_REPORTED_MANUAL_PASS | 原FAILED/running=false/canReconcile=false有使用者確認；不將舊錯誤追認為保護拒絕 |
| T058-4 撤讀權安全回報 | USER_REPORTED_LIVE_PASS | live pass1 fail0 skip0 exit0；不證明已知寫拒絕 |
| K：真實已知DENIED拒絕準備 | NOT VERIFIED，原protected實測FAIL | requestingUserCanEdit缺失維持UNKNOWN；不以離線測試冒充真實證據 |
| N：Google明確拒寫且保護專屬歸因／精確遠端無重送 | NOT VERIFIED | 現有老師畫面／合併錯誤碼不足；T058-2只是安全行為PASS |
| 真實結果未知／逾時及原operation核對 | NOT RUN | 任務要求只記實際發生，不要求為湊證據刻意製造；離線回歸證據另列 |

T058整體PENDING，仍58/64。沒有尚未執行卻補記PASS的項目。可選的後續安全補強是：保留原表與程序，對同一撤權新副本由使用者恢復分享，再以另一次明確只讀觀察驗可讀；或在隔離場次驗準備讀失敗無半場活動。這些不是現有read-denied已驗內容，也不能填補K／N專屬證據缺口；不需重跑已通過案例或動T057證據表。

### 正式結案提案，等待人工批准，未執行

可提出有明確限制的驗收偏差／證據接受紀錄：產品FR-006明確false才DENIED、UNKNOWN警告、FR-018結果保留及UNKNOWN不重送均不變；原protected assertion及失敗保留。人工決定是否接受K在本環境無可觀測真實證據、N歸因未證，而以分開標示的離線分支測試與上述真實行為證據滿足T058驗收範圍。若批准，才同步T058驗收文字、final-acceptance矩陣FR-006／FR-018／US4.7（及其餘受影響行）、live/manual及review-record，先依SpecKit Analyze檢查跨文件一致性，再由人工明確接受。這是證據範圍例外，不是把K或N改成PASS，也不豁免產品安全規則。若不接受此例外，T058保持PENDING／BLOCKED於真實證據取得，不能自行勾選。圖表架構不變；若另改產品需求／操作流程，須重新依constitution處理跨組討論與設計審查。T059與Final其他任務仍須獨立完成。

本輪只讀文件／任務並更新必要紀錄，未修改tasks狀態、產品／測試判準／001文件，未執行測試／真API、讀憑證、改表、commit或push。

## T059-A WAITING子階段：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19。實際測試日期未另提供，不將確認日期推定為操作日期。證據為本對話使用者文字回報，未提供或補造截圖。

- T058舊活動已安全結束；T059-A／B為不同ID的乾淨專用副本。
- T059-A匯入成功並設定三組；三組使用獨立瀏覽器身分加入。
- 老師及三組學生四個視窗皆Q1 WAITING；各自F5後身分與活動狀態保留。
- 四個視窗分別完成Offline → Online真實斷線及重連。
- 使用者確認T059-A原始標記完整。

僅將上述A表WAITING子階段記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的WAITING身分與狀態恢復部分，以及來源準備的局部人工證據。不推定未回報的題數／工作表數／同步毫秒數、晚加入、禁止提交、其他三階段、寫回保真或B表完整驗收。B表人工結果仍NOT RUN，T059後續子階段未完成。原表格較廣條件仍須逐項補證，本段為已完成範圍的最新依據，不將整列其他子條件自動PASS。

T059整體PENDING，59/64不變。原先T059未開始為歷史狀態，現在已開始但未完成。本輪僅更新必要紀錄，未修改產品／測試／001／任務勾選，未執行測試或真API、未讀憑證、未commit／push。

## T059-A ANSWERING子階段：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報，未提供或補造截圖。

使用者確認以下七項均通過：

1. 老師與三組學生共四個視窗全部進入ANSWERING。
2. 第2組提交順位1、第1組順位2、第3組順位3。
3. 重複提交無法覆蓋既有答案。
4. 學生端看不到其他組未公布資訊。
5. 四個視窗F5後，身分、提交狀態及活動狀態正確。
6. 四個視窗確實斷線並重新連線成功。
7. 老師端保持ANSWERING，沒有提前閉題。

僅將T059-A ANSWERING上述範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的順位、提交保護、公布前資訊隔離及ANSWERING身分／狀態恢復部分。保留既有T059-A WAITING證據；不補造答案文字、同步延遲數值、操作方式或其他未回報細節。未回報的空白提交拒絕、RESULTS／COMPLETED、寫回及保真等仍待各自驗收；不將A表結果套用至B表，B表人工驗收仍NOT RUN。

T059整體PENDING，59/64不變。本輪只更新必要驗收紀錄，未修改產品／測試／001／任務勾選，未執行Google API或測試、未讀憑證、未commit／push。

## T059-A RESULTS子階段：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報，未提供或補造截圖。

使用者回報：

- 老師關閉Q1後，老師與三組學生共四個視窗均進入RESULTS。
- 第2組仍為順位1；三組原始答案與順位保持不變。
- 學生無法在閉題後新增或修改Q1答案。
- 學生看不到老師專用Google Sheets寫回控制。
- 四個視窗F5後，RESULTS、身分及答案保持正確。
- 四個視窗均實際斷線並成功重新連線。
- 使用者觀察Google Sheets Q1仍為{{Q1}}，沒有提前寫回。

上述T059-A RESULTS範圍記USER_REPORTED_MANUAL_PASS，對應FR-008／SC-005閉題與RESULTS恢復、FR-007老師專用控制的UI隔離，以及FR-009手動寫回的人工觀察部分。標記未變不單獨證明遠端寫入請求數為零；看不到控制不替代後端驗權測試。保留WAITING及ANSWERING既有證據，不補造答案內容、同步延遲、額外測試或截圖。

T059整體PENDING，59/64不變。COMPLETED、後續手動寫回／重複／衝突／保真與其他未回報項目仍待獨立驗收；A結果不延伸至B，B人工驗收仍NOT RUN。本輪僅更新必要驗收紀錄，未修改產品／測試／001／任務狀態，未呼叫真實Google API、未讀憑證、未commit／push。

## T059-A 後續題目與COMPLETED：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據來源為本對話使用者文字回報；未提供或補造截圖。

使用者回報：

- Q1 RESULTS正常進入Q2 WAITING。
- Q2搶答順位及閉題結果正確。
- Q3至Q6均正常進行及閉題，活動正式進入COMPLETED。
- 老師與三組學生共四個獨立瀏覽器視窗，F5後完成狀態及身分均保留。
- 四個視窗實際斷線並成功重連。
- 使用者觀察Google Sheets原始標記沒有被提前寫回。

上述T059-A範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的下一題WAITING、後續題目／末題完成及COMPLETED身分／狀態恢復，與FR-009無提前回填的人工觀察。標記未變不單獨證明遠端寫入請求數為零。不補造各題答案、順位細節、無人題／特殊文字案例、同步延遲或其他未回報結果。保留WAITING、ANSWERING、RESULTS既有人工證據。

T059整體仍PENDING，59/64不變。A表手動寫回／重複／衝突／保真與其餘未回報項目仍待獨立驗收；不將A表結果套用至B表，B表人工驗收仍NOT RUN。本輪僅更新必要驗收紀錄，未修改產品／測試／001／任務勾選，未呼叫真實Google API、未讀憑證、未commit／push。

## T059-A 第一次寫回與來源保真：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際操作日期未另提供，不推定為確認日期。證據為本對話使用者文字回報，未提供或補造截圖。

使用者回報：

- 老師端顯示SUCCESS（保留使用者用語，不推定為原始API狀態欄位值）。
- 所有有有效提交的題目均正確寫入順位1的完整答案。
- 無有效提交的題目保留原始標記。
- 非答案儲存格與公式定義不變。
- 底色、框線、字型、合併範圍及結構不變。
- 老師端答案、順位與Session仍完整保留。

僅將T059-A第一次寫回與上述來源保真範圍記USER_REPORTED_MANUAL_PASS，支持FR-009／010／013／014、SC-002的相應人工觀察。未補造各題答案文字、實際提交題號、未提供的API回應／讀回log、特殊文字案例、逐格截圖或遠端請求監控。此回報不證明零遠端重送／精確請求次數，亦不代表後續重複寫回／外部衝突已驗收。

保留WAITING、ANSWERING、RESULTS、COMPLETED既有證據，不將A結果套用至B表。T059整體PENDING，59/64不變；其餘人工項目仍待各自證據。本輪僅更新必要紀錄，未修改產品／測試／001／任務勾選，未執行真實API、未讀私人憑證、未commit／push。

## T059-A 重複寫回：USER_REPORTED_MANUAL_PASS

本次確認／紀錄日期2026-11-19；實際測試日期未另提供，不推定為確認日期。依本對話使用者回報：第二次操作成功／顯示無需更新，已寫答案辨識為略過，沒有新的待更新題目；Google Sheets答案與非答案內容、公式、格式及合併結構均未改變；老師端答案、順位及Session保留。僅上述範圍記USER_REPORTED_MANUAL_PASS，支持FR-011／015及US4.1的同活動重複辨識，不擴大宣稱遠端零重送或實際請求數。未提供最新operation的status/running/canReconcile，尚未據此確認可重啟換場。

保留A四階段、第一次寫回與保真證據，不套用至B。T059整體PENDING，59/64不變；外部衝突及其他未回報項目仍待驗。B-1僅準備，未執行。代理僅更新紀錄及唯讀核對單活動／操作狀態，未重啟、改表、執行API、讀私鑰、修改產品／001／任務勾選、commit或push。

## T059-B WAITING：USER_REPORTED_MANUAL_PASS（摘要回報，明細未齊）

本次使用者確認／紀錄日期：2026-11-19；實際測試日期：待補。使用者明確要求將B-1通過的摘要記USER_REPORTED_MANUAL_PASS；此分類只代表使用者摘要結論，不代表下列未確認事項均已PASS。未提供截圖，不補造。

| 欄位 | 使用者提供的實際狀態 |
| --- | --- |
| A最後操作status／running／canReconcile | 三項皆待補；不得推定安全終態 |
| 確認安全後後端重啟 | 待補；不得推定已重啟或確認無pending |
| B不同spreadsheetId | 待確認 |
| B Q1～Q6乾淨原始標記 | 待確認 |
| B與A不同儲存格映射 | 待確認 |
| B hidden工作表 | 待確認 |
| B merge合併儲存格 | 待確認 |
| Service Account Editor權限 | 待確認 |
| B題數／納入工作表數／權限提示 | 三項皆待補 |
| 三組分別1／2／3 | 使用者摘要回報B-1通過；個別結果待確認 |
| 四視窗WAITING、無法作答 | 使用者摘要回報B-1通過；個別結果待確認 |
| 四視窗F5 | 使用者摘要回報B-1通過；個別結果待確認 |
| 四視窗實際斷線重連 | 使用者摘要回報B-1通過；個別結果待確認 |
| B原標記完整 | 使用者摘要回報B-1通過；獨立確認結果待補 |

保留A表既有證據，不以A結果填入B欄位。B-1摘要PASS不解除安全換場資訊缺口，亦不表示B題數固定為6或其他前提已確認；完整矩陣仍待補證。T059整體PENDING，59/64不變，其他B階段未驗收。本輪僅更新必要紀錄，未修改產品／測試／001／任務勾選，未操作真實API／試算表／服務、未讀憑證、未commit／push。

## T059-B ANSWERING：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報；未提供或補造截圖。

使用者確認以下七項均通過：

1. 老師及三組學生共四個視窗都進入Q1 ANSWERING。
2. 第3組提交順位1、第1組順位2、第2組順位3。
3. 重複提交不能覆蓋既有答案。
4. 學生端資訊隔離正確。
5. 四個視窗F5後身分及活動狀態保留。
6. 四個視窗確實斷線並成功重連。
7. 老師端保持ANSWERING，沒有提前閉題。

僅上述T059-B ANSWERING範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的順位、重複提交保護、學生資訊隔離及ANSWERING身分／狀態恢復部分。不補造答案文字、刷新後提交狀態細節、同步延遲、空白提交測試或其他未回報結果。保留T059-A全部既有證據。B-1摘要PASS及其實際日期、安全換場／來源條件等待補欄位仍待補，本階段回報不追認或填補這些缺口。

T059整體PENDING，59/64不變；B其餘未回報階段與完整Final仍未驗收。本輪僅更新必要人工紀錄，未修改產品／測試／001／任務勾選，未自行執行Google API、未讀憑證、未commit／push。

## T059-B RESULTS：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報；未提供或補造截圖。

使用者確認以下七項通過：

1. 老師關閉Q1後，老師及三組學生四個視窗都進入RESULTS。
2. 第3組保持順位1、第1組順位2、第2組順位3，三組答案不變。
3. 閉題後學生不能新增或修改答案。
4. 學生看不到老師專用寫回控制。
5. 四個視窗F5後，RESULTS、身分、答案及順位保留。
6. 四個視窗確實斷線並成功重連。
7. 使用者觀察B表原始標記以及hidden／merge結構沒有變動。

僅上述T059-B RESULTS範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005閉題與RESULTS恢復、FR-007老師控制的UI隔離及原標記／結構未變的人工觀察。看不到控制不替代後端驗權測試，標記未變不單獨證明遠端零寫入。本次hidden／merge未變觀察不追認B-1尚未確認的來源映射、標記所在hidden／merge條件或其他待補欄位。未補造實際答案、同步延遲或其他測試細節。

保留A表全部已完成證據，以及B表WAITING摘要及ANSWERING紀錄；B-1詳細欄位維持待補。T059整體PENDING，59/64不變，其餘未回報階段及完整Final仍未驗收。本輪僅更新必要紀錄，未修改產品／測試／001／任務勾選，未執行真實Google API、未讀私人憑證、未commit／push。

## T059-B 後續題目與COMPLETED：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據來源為本對話使用者文字回報，未提供或補造截圖。

使用者回報：

- Q1 RESULTS正常進入Q2 WAITING，Q1答案及順位保留。
- Q2第1組為順位1，閉題結果正確。
- Q3至Q6都正常完成並保留搶答結果。
- 老師與三組學生共四個視窗正式進入COMPLETED。
- 四個視窗F5後，身分、答案及COMPLETED狀態保留。
- 四個視窗確實斷線並成功重連。
- 使用者觀察T059-B原始標記、hidden／merge、公式及格式均未提前變更。

僅上述T059-B範圍記USER_REPORTED_MANUAL_PASS，支持FR-008／SC-005的下一題WAITING、後續搶答／閉題及COMPLETED恢復，並保存原標記／結構／公式／格式未提前變更的人工觀察。未變觀察不證明遠端請求數為零，亦不追認B-1不同ID、不同映射、hidden／merge標記所在位置、Editor等尚待補欄位。未補造Q3至Q6各題答案／順位、同步延遲、特殊文字或未執行案例。

保留T059-A全部既有證據及B表WAITING摘要、ANSWERING、RESULTS紀錄。B-1詳細欄位繼續待補。T059整體PENDING，59/64不變；B手動寫回／重複／保真、外部衝突及其他未回報項目仍待各自驗收。本輪僅更新必要人工紀錄，未修改產品／測試／001／任務勾選，未自行操作真實Google API、未讀憑證、未commit／push。

## T059-B 首次真實寫回與來源保真：USER_REPORTED_MANUAL_PASS

本次使用者確認／紀錄日期：2026-11-19；實際測試日期未另提供，不推定為確認日期。證據為本對話使用者文字回報；未提供或補造截圖。

使用者確認以下八項全部通過：

1. 老師端顯示SUCCESS，操作已結束（保留使用者用語，不推定未提供的原始operation欄位值）。
2. Q1正確寫入第3組順位1的完整答案。
3. Q2正確寫入第1組順位1的完整答案。
4. Q3至Q6正確寫入各題順位1的完整答案；無有效提交者保留原始標記。
5. 不同工作表及儲存格映射正確，沒有寫入錯位。
6. 隱藏工作表仍隱藏，合併儲存格主格及合併結構正確。
7. 公式、非答案內容、字型、底色、框線全部不變。
8. 老師端活動、答案、順位及Session完整保留。

僅上述T059-B首次真實寫回與來源保真範圍記USER_REPORTED_MANUAL_PASS，支持FR-004／005／009至014及SC-002的相應人工觀察。未補造答案文字、Q3至Q6各題勝出組別或實際無人題號、API回應／讀回log、遠端請求數或截圖。寫入位置及hidden／merge的本次觀察不追認或補填B-1安全換場、不同ID、來源前置等待補詳細欄位。未宣稱遠端零重送或B重複寫回／衝突已通過。

保留T059-A全部既有證據及B表WAITING摘要、ANSWERING、RESULTS、COMPLETED紀錄；B-1未齊欄位仍待補。T059整體PENDING，59/64不變，其餘人工項目仍待各自證據。本輪僅更新必要人工紀錄，未修改產品／測試／001／任務勾選，未自行執行Google API、未讀私人憑證、未commit／push。

## T059-B 重複寫回：USER_REPORTED_MANUAL_PASS；T059證據審查

本次確認／紀錄日期2026-11-19；實際測試日期未另提供，不自行推定。使用者回報七項通過：首次操作已SUCCESS且無running／pending；第二次成功或無需更新；已寫答案全部略過；無新增待寫目標；B答案與非答案內容不變；公式、hidden／merge、字型、底色、框線不變；老師活動、答案、順位及Session保留。上述記USER_REPORTED_MANUAL_PASS，不補造原始operation欄位、截圖、遠端傳輸次數或零寫入證據。保留A全部與B四階段、首次寫回／保真證據。

### 原始T059要求／證據／狀態

依tasks.md T059、quickstart第6–8節、原manual表格審查，不新增產品要求或把26場景都擴成必須重跑真實人工測試。

| 要求 | 已有證據 | 狀態／缺口 |
| --- | --- | --- |
| 老師＋三組、兩份真表完整活動 | A/B各ANSWERING、RESULTS、COMPLETED回報，A WAITING詳細、B WAITING摘要 | 行為已人工PASS；B來源／換場詳細仍待補 |
| 四階段刷新／實際斷線重連 | A四階段與B ANSWERING／RESULTS／COMPLETED詳細PASS，B WAITING摘要PASS | 不重測已確認部分，B WAITING個別明細待確認 |
| 順位／重複提交／閉題／資訊隔離 | A Q1組2/1/3、B Q1組3/1/2；閉後拒答、下一題及末題完成回報 | 已報範圍人工PASS；空白提交／2秒等原manual細項尚無明確人工回報 |
| 手動回填閉題最快完整答案 | A/B首次寫回及多階段無提前改marker | 已報範圍人工PASS；未把UI訊息等同額外原始API監控 |
| 同活動重複寫回、已寫值不誤報缺題 | A重複PASS、本次B重複PASS | USER_REPORTED_MANUAL_PASS，不證明遠端零寫入 |
| 人工衝突提示並保留外部值 | 只有離線US4／E2E衝突測試，沒有本次人工衝突回報 | NOT RUN，原T059明列，不能用fake或T058授權失敗替代 |
| 肉眼來源保真 | A/B公式、非答案、字型／底色／框線／merge／結構及hidden回報 | 已報範圍人工PASS；非答案rich text、行列尺寸與等號／Unicode／換行的人工觀察未明確回報 |
| 無人題／特殊文字及未閉題不動 | T057真API驗無人Q2、未閉Q3、等號／Unicode／換行；T059回報無有效提交者保marker | 可引用T057真API證據；本次是否實際有無人題／特殊文字及UI人工觀察仍待確認，不能虛構題號 |
| 舊寫安全結束後換場至新乾淨來源 | B-1 A最後status/running/canReconcile、重啟及ID／乾淨來源等皆待補 | 必要紀錄缺口；B後續成功不追認A換場時已安全 |
| 日期／實際步驟與結果留存 | 各次對話文字、確認日2026-11-19 | 實際操作日期待補，可按階段或期間提供，不需截圖／秘密 |
| 異常恢復／pending | T058真實失敗保留與FAILED安全修權恢復已PASS；真逾時pending未觸發 | T059不新增必須製造真逾時；維持NOT RUN，原DA-T058-01限制保留 |
| 其餘manual細項 | 多頁籤／晚加入、2秒／雲端不可用等有離線證據 | 不冒充本次人工PASS；請先補既已做過的觀察，未做記NOT RUN，不自行新增別的權限失敗套件 |

### 最少補齊方向（本輪僅建議，不執行）

先補記實際日期、B新副本不同ID／不同映射／hidden標記／merge主格／Editor、題數／納入分頁／權限提示與四視窗WAITING明細，及A最後狀態與實際安全重啟換場。只記實際已知資料；若A操作已因重啟丟失且無當時記錄，明列NOT VERIFIED，不能用現在B狀態回填。

人工衝突是明列必要案例：保留目前B活動，僅在本機查明最新operation為SUCCEEDED、running=false、canReconcile=false且無其他操作後，使用者在專用B已寫Q1手動改成明顯合成外部文字，再明確按一次寫回；預期顯示CONFLICT及位置／原因，外部值不被覆蓋、其他格及活動答案／rank／Session保留。不自動還原／強制覆寫。以上僅準備，需人工安全確認後自行執行。原manual含A/B逐表對照，A衝突亦未回報；不能以B衝突推定A已測。A原活動若已清除，後續需另備乾淨A補充場次最少一題寫回後驗衝突，或另行明確審查接受證據範圍，不能自行免除。

原manual其他未明確回報項目先請使用者確認是否已做；未做項目維持NOT RUN並依原範圍安排最小補驗或人工審查，不能因本次兩表主要流程通過自動抹除。T058不要求在T059再跑一套權限／真逾時；不新增未規劃的自動還原、持久化或壓力測試。

結論：目前不建議正式結案，至少必要安全換場／B-1資料與人工衝突證據仍缺；其他原manual細項需確認適用證據範圍。T059未勾選，59/64不變。本輪只更新驗收紀錄及唯讀審查，未修改產品／測試／001、未操作真API／讀憑證、未commit／push。

## T059最終人工確認與結案評估（確認日期2026-11-19）

證據來源為本對話使用者親自操作後的最終文字確認，記USER_REPORTED_MANUAL_PASS；實際操作日期未明確提供，維持待補，不以文件日期代替。不新增截圖、ID／座標／答案私人內容或API監控。

使用者明確確認：A/B為不同spreadsheetId專用表；老師與三組獨立身分完成兩份六題活動；四階段正確，各階段四視窗刷新後身分／題目／答案／順位保留且真實斷線重連成功；三組提交順位、重複保護、資訊隔離、閉後拒改與下一題均正確；兩表首次寫回均為各題順位1完整有效答案，無有效提交者保marker；兩表重複寫回略過、內容不變；兩表非答案內容／公式／字型／底色／框線／合併／分頁結構正確；B不同格址映射、hidden與merge主格正確。B-1現有使用者確認PASS，不再僅依早先摘要判斷其整階段未確認；但原始題數欄位、分頁數、權限提示、Editor及換場細節未回報者不回填。最新「兩份六題」另存為本次證據，不冒稱早先B-1題數當時已記錄。

使用者另確認已親自補做外部修改衝突：系統正確提示衝突，外部值未覆蓋，老師活動／答案／順位／Session保留。此情境USER_REPORTED_MANUAL_PASS；未提供來源A或B、修改格、畫面細節或是否兩表各測，不推測。原T059任務要求有人工衝突驗收，沒有明訂所有衝突種類或兩表各自重複驗一次；本次足以支持這項任務層要求。原逐表人工表的A/B衝突歸屬仍NOT VERIFIED，不得逐表填PASS；不另增加雙表衝突重跑作為新硬性條件。

### T059完成條件最終對照

| 原始要求 | 最終證據 | 判定 |
| --- | --- | --- |
| 兩份不同真表＋老師三組完整活動 | 本次明確兩表不同ID、六題、獨立身分；既有逐階段回報 | USER_REPORTED_MANUAL_PASS |
| 四階段刷新及真斷線重連 | 本次逐階段四視窗狀態／答案／順位恢復確認 | USER_REPORTED_MANUAL_PASS |
| 提交順位／隔離／閉題／下一題 | 本次與既有A/B階段回報 | USER_REPORTED_MANUAL_PASS |
| 手動回填最快完整答案、無人保marker | 本次與A/B首次寫回回報 | USER_REPORTED_MANUAL_PASS，不補題號或零請求結論 |
| 同活動重複辨識略過 | 本次與A/B第二次寫回回報 | USER_REPORTED_MANUAL_PASS，不證明遠端零重送 |
| 衝突提示、不覆外部值、資料保留 | 本次親自操作確認 | 任務層USER_REPORTED_MANUAL_PASS；A/B逐表歸屬NOT VERIFIED |
| 肉眼來源保真／B動態mapping hidden merge | 本次與既有首次寫回回報 | 已確認範圍USER_REPORTED_MANUAL_PASS |
| 先確認舊請求無晚到風險才換新來源／重測 | 早先A結束後第二次成功，但B-1明列最後operation／安全重啟情形待補；本次未確認此安全前提 | NOT VERIFIED，仍為原T059完成條件缺口 |
| 真實日期與紀錄 | 確認日已記，各階段操作日期未明確提供 | 日期待補，不自行推定 |

### 原人工表其他細項的證據邊界

| 原人工表細項 | 可引用的既有證據 | 本次人工狀態 |
| --- | --- | --- |
| WAITING無法作答、晚加入 | B-1PASS總結／離線phase與late-join測試；A早先未單獨回報禁止提交 | 未明確逐項確認部分NOT VERIFIED，不由總結補PASS |
| 空白提交拒絕／正常連線2秒內同步 | 原離線單元／整合／E2E有證據 | 本次兩表人工NOT VERIFIED，不改產品判準 |
| 同身分多頁籤／失效Session重新確認／不重送 | 原離線身份／late-reply測試 | 未明確人工確認者NOT VERIFIED |
| 實際無人題／等號／Unicode／換行逐字型別 | T057真API有專用斷言；本次無有效提交者保標記為一般確認 | 本次人工具體案例NOT VERIFIED，不借T057冒充T059人工 |
| 非答案rich text、行列尺寸 | T057 API保真及既有離線；像素尺寸不由API證明 | 本次未明確人工觀察者NOT VERIFIED |
| 雲端不可用仍可搶答 | 原sheets-quiz-independence／E2E離線，T058失敗保資料 | 本次真雲端故障下搶答NOT VERIFIED |
| 真逾時／結果不明／pending reconcile | DA-T058-01有限證據與既有離線異常測試 | NOT RUN；不新增刻意觸發要求 |
| 新場次安全重用／舊Session失效 | T059換場行為摘要但當時安全確認未提供，離線restart/reuse另列 | 真實安全前提仍NOT VERIFIED；不能以離線取代 |

上述細項保留原狀態供T063整體追溯審查，不能將T059主要流程PASS等同所有FR／SC與manual所有列PASS；不新增原任務沒有的測試套件。DA-T058-01與原protected FAIL完整保留，不擴大其偏差接受範圍至T059換場。

### 本輪結論與最少補充

T059暫不勾選，59/64不變。主要操作與人工衝突已有足夠使用者證據；安全換場仍缺明確確認。請只補實際事實：切換A到B之前，是否已確認A最後操作結束、無running／pending且沒有未解的晚到請求風險，再換來源？不要求重建舊UUID或捏造精確欄位；若無法回憶／無當時證據，明列NOT VERIFIED並另行審查，不用現在結果反推。另可補操作日期／期間及已實際做過的manual細項；未做維持NOT VERIFIED。T060既有狀態與安全證據不重做／不改；T061仍受T059依賴阻擋，T062待T061、T063待T056–T062、T064待T063與最終人工接受。未開始T061。

接續唯讀speckit-analyze；本段只記錄結案評估，不聲稱分析尚未執行就通過。本輪未修改產品／測試／001、未操作真API或讀私鑰、未commit／push。

## T059安全換場確認：E1證據已補齊（2026-11-19確認）

使用者明確確認當時實際操作：切換T059-A至B之前，已確認A最後一次Google Sheets寫回完全結束、沒有進行中running、沒有PENDING_VERIFICATION、沒有尚未排除的結果不明或晚到寫入風險，確認安全後才換場。此為對當時事實的USER_REPORTED_MANUAL_PASS，不是依B後續成功反推。

原HIGH E1所指安全換場證據缺口已補齊。僅記確認日期2026-11-19；實際操作日期待補，不補造operationId、精確status／running／canReconcile欄位值、時間戳、重啟方式或截圖。原先缺證與HIGH評估保留為歷史，最新狀態以上述確認為準。

結合既有兩份不同ID專用真表、老師三組六題、四階段刷新與實際重連、順位／重複提交／隔離／閉題／下一題、兩表首次及重複寫回／保真、B mapping／hidden／merge主格、人工外部衝突保留外部值與活動資料，原T059任務層必要行為均已有使用者實際確認。衝突的A/B歸屬／修改格未提供，不能填成兩表獨立衝突PASS；遠端零重送未驗證。

未提供的分頁數／權限提示／Editor明細、精確operation欄位、操作日期及其他原人工表細項仍按既有NOT VERIFIED保存；此確認不追認空白提交、精確2秒、晚加入／多頁籤、特殊文字／rich text／行列尺寸或真雲端故障下搶答等未回報人工案例。T057與離線證據只按各自分類引用。DA-T058-01、原protected FAIL、NOT VERIFIED與真逾時／pending NOT RUN不變。任務層完成不等於所有manual細項或全部FR／SC真實人工測試PASS，整體追溯仍由T063複核。

本輪先同步證據，再執行唯讀speckit-analyze；只有確認無CRITICAL／HIGH且任務條件足夠後，才於分析外更新T059勾選。T060維持既有完成與證據，不重做；T061未開始。未修改產品／測試／001，未操作真API／讀私鑰、未commit／push。

## T059正式完成與Analyze結果（2026-11-19確認）

在證據同步後依專案speckit-analyze正式流程完成唯讀分析：前置腳本一次回傳specs/002-google-sheets-integration，分支codex/google-sheets-integration；extensions.yml不存在，無前／後hook。21FR、7SC、26場景與64任務有對應，需求任務覆蓋100%（不是全部測試PASS），未映射任務0，歧義／需求重複0，憲章衝突0。CRITICAL0／HIGH0／MEDIUM0／LOW0。原E1已由使用者對當時安全換場的明確確認解除，非產品程式修正或從B成功推論。圖表責任與UNKNOWN／pending屏障不變，未修圖或重產PNG。

分析完成後，在skill之外依本輪明確授權更新tasks.md的T059為完成，60/64。依據為原任務的兩份不同真表＋老師三組完整流程、四階段刷新／真重連、手動回填／重複／衝突與肉眼保真，以及安全換場的USER_REPORTED_MANUAL_PASS。人工衝突來源歸屬未提供，不聲稱A/B各測。只按原任務範圍完成，不替其他未明確人工細項補PASS。所有歷史成功／失敗／待補保留，DA-T058-01及protected FAIL不改。T060既有勾選與安全證據保持原樣。

T061現已具備T059＋T060依賴條件，但本輪未開始或修改README／quickstart；T062待T061、T063待T056–T062、T064待T063與最終人工審查。未宣稱Feature全部完成、助教接受或可直接commit。實際測試日期／精確分頁數／權限提示／operation欄位仍不推測，原未確認人工細項NOT VERIFIED、真逾時與pending reconcile NOT RUN、精確遠端零重送NOT VERIFIED。

本輪只改必要驗收／審查紀錄及T059任務勾選／狀態參照，未改產品／測試／001，未重跑人工或真API、未讀私鑰、未commit／push。

</details>


## T064正式人工接受（2026-11-19確認）

使用者已閱讀退役後審查並明確核准USER_APPROVED_FINAL_ACCEPTANCE，非代理推定。原T064要求提交審查結果並依真實回覆記接受，現已有充分依據；64/64。接受功能、T057／058／059、方案B退役與回歸、README／Quickstart／三圖／矩陣及已揭露限制。未重跑測試／真API／人工流程，原138／15／21與build僅引用既有維護紀錄，不改寫日期。

保留原protected FAIL（MISSING／UNKNOWN）、已知DENIED及保護專屬歸因／遠端恰一次NOT VERIFIED、真實逾時／PENDING reconcile NOT RUN；DA-T058-01仍僅內部偏差接受。原交付前FINAL_ACCEPTED=false／63/64段落為歷史，非當前狀態。詳細本輪Analyze與Git狀態見[t064-final-acceptance.md](t064-final-acceptance.md)。未授權git add／commit／push／公開repository，未讀憑證／修改產品或測試／001。
