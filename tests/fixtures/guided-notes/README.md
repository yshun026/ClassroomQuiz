# Guided Notes fixtures

Run node tests/fixtures/guided-notes/generate-fixtures.js. Synthetic data only.
valid-a/valid-b: same Q1–Q3 at different sheet/cell locations. fidelity: styles, formula, merges, image, dimensions. merged: merged answer master scanned once.
Invalid: gap, duplicate, zero, leading, lowercase, broken, space, mixed, formula, empty, corrupt. See unit test for expected error code.

single-question: 只有 Q1（B3）；直接建立單題 Workbook，避免刪除 Q2/Q3 後留下過期 dimension。Phase 9 新增實際匯入回歸。
