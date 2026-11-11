import React from 'react';
export default function Results({results=[]}){
 return results.map(result=><section className="results" key={result.questionNumber} aria-label={`第 ${result.questionNumber} 題結果`}><h3>第 {result.questionNumber} 題結果</h3>{result.noAnswers?<p>無人作答</p>:<><p>搶答成功組別：第 {result.winnerGroupNumber} 組</p><table><thead><tr><th>順位</th><th>組別</th><th>答案</th></tr></thead><tbody>{result.submissions.map(s=><tr key={s.groupNumber}><td>{s.receiveRank}</td><td>第 {s.groupNumber} 組</td><td className="answer">{s.answerText}</td></tr>)}</tbody></table></>}</section>);
}
