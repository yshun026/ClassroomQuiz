# Data Model: ClassroomQuiz

Plan Phase 1，依 diagrams/class.puml；以下為設計欄位，不是應用程式碼。

## Entities

| Entity | Fields and types | Relationships / validation |
| --- | --- | --- |
| Activity | id: opaque string; groupCount: positive integer; phase: enum; currentQuestionNumber: integer; stateRevision: integer; questions/groups: Map | 一場活動；題號 1..N；1..* Question、1..* Group、1 GuidedNotesDocument |
| Question | number: positive integer; started/closed: boolean; nextSubmissionSequence: integer initially 0; submissionsByGroup: Map | 屬一 Activity；一 PlaceholderLocation；0..* Submission；closed 不可逆 |
| Group | number: integer 1..groupCount; studentSessionId: nullable string | 屬一 Activity；0..1 學生 Session；每題最多一筆 Submission |
| Submission | activityId; questionNumber; groupNumber; answerText: string; submissionSequence: integer; receiveRank: integer | 僅已接受提交；唯一 (activity,question,group)；receiveRank = submissionSequence，題內 1..K |
| Session | id; tokenHash; role: teacher/student; activityId/groupNumber: nullable; studentViewRevision: integer initially 0 (student only); lastStudentProjection: nullable immutable object | 老師不綁學生組；學生綁一活動一組；Socket 斷開不刪除 Session；學生版本只隨自己的可見資料變更 |
| GuidedNotesDocument | originalBuffer: immutable Buffer; parsedWorkbook; placeholderLocations: Map | 活動一對一；原檔 bytes 永不被匯出修改；每次匯出另載新 Workbook |
| PlaceholderLocation | questionNumber; worksheetId; worksheetName; cellAddress | 每題正好一格；由實際解析取得，非寫死；merged cell 僅 master 可作位置 |
| RuntimeStore | activity: nullable; preparationDraft; sessionsByTokenHash: Map; commandSequence: integer | 程序生命週期保存，重啟可清空；非資料庫；draft 非新增活動階段 |

Session Token 不等於 socket.id。身分資訊不能由前端 groupNumber 或 role 改寫。
學生瀏覽器 Token 持久保存在隔離設定檔；同設定檔多頁籤使用同一綁定。

## State Transitions

準備草稿只保存有效組數及待驗證檔案，尚不對外宣稱存在 Activity。
文件全部驗證及相容性檢查成功、組數有效時一次建立 Q1 WAITING。

| Command | Preconditions | Mutation |
| --- | --- | --- |
| start | teacher; matching activity/current question; WAITING | started=true; ANSWERING |
| submit | bound student; matching activity/question; ANSWERING; nonblank; group not in submissionsByGroup | nextSubmissionSequence +=1; append immutable Submission; remain ANSWERING |
| close | teacher; matching current question; ANSWERING | closed=true; non-final RESULTS / final COMPLETED |
| next | teacher; matching current question; RESULTS; has next | increment currentQuestionNumber; WAITING |
| claim | valid activity; free group; browser not already another group | create student Session and bind group; any phase allowed |
| export | teacher; Activity exists | no mutation; closed-winner snapshot only |

開始／提交／結束／下一題重複或非法狀態均拒絕，不更改已確認結果。
有效寫操作後內部 stateRevision +=1，僅教師可取得；失敗、讀取及匯出不增加 revision。
學生 Session 的 studentViewRevision 只在可見業務投影改變時加一，初次建立投影為 0。
投影比較排除版本與傳輸 metadata；所有 HTTP／Socket 共用同一投影更新，不能因查詢或重連加一。
他組提交不改本組投影／版本，也不向本組推送；提交組的同 Session 多頁籤共用相同版本。

## Invariants and Snapshots

1. 同時最多一題 ANSWERING；題號只能依序前進，closed 題無重新開啟。
2. 原子檢查與寫入同步完成，不能 await；接收入口 commandSequence 與提交序列分開，非法提交不占 rank。
3. close 與 submit 共用處理順序；沒有比對裝置時間或老師審核再排序。
4. 教師投影可看所有當題提交；學生投影在當題 closed 前只含自己的答案及狀態，不含任何順位或他組資料。
5. PublishedQuestionResult 為閉題的衍生視圖：questionNumber、已接受的 group/answer/rank 列表、
   winnerGroupNumber（可空）、noAnswers boolean，不另存可修改排名。
6. ExportSnapshot 為同步入口複製的原 Buffer 參照、位置映射副本及 closed 題 winner 文字副本；
   async ExcelJS 操作不能讀取仍在變動的 Submission Map。
7. 題號純文字 /^\{\{Q([1-9][0-9]*)\}\}$/，唯一連續且不能是公式／混合文字；
   新 Workbook 的答案 cell.value 為 string，不建立 formula 型別。
