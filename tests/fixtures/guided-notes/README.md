# Historical Guided Notes XLSX fixtures

Static synthetic inputs retained for Feature 001 history and existing acceptance references. The active ClassroomQuiz application and current tests use Google Sheets; these files are not supported import inputs.

The former ExcelJS generator and executable XLSX tests were retired by the separately authorized maintenance work before T064 acceptance. Original results are preserved in specs/001-classroom-quiz and tests/records; no historical PASS was rewritten.

valid-a/valid-b: historical three-question dynamic mapping; fidelity: historical styles/formula/merge/image/dimensions; merged: merged master. Invalid historical inputs: gap, duplicate, zero, leading, lowercase, broken, space, mixed, formula, empty, corrupt. single-question retains the original one-question sample.

Do not run these historical samples through the current application or restore Excel dependencies to regenerate them. Current synthetic source fixtures: ../google-sheets/sources.js.
