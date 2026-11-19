import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';

test('teacher imports Google Sheets URL with safe retry and source recovery (fake API)',async({page})=>{
 await page.goto('/?role=teacher');await page.getByLabel('管理密碼').fill('wrong');await page.getByRole('button',{name:'登入'}).click();await expect(page.getByRole('alert')).toHaveText('管理密碼錯誤');
 await page.getByLabel('管理密碼').fill(process.env.ADMIN_PASSWORD);await page.getByRole('button',{name:'登入'}).click();await expect(page.getByText('活動尚未準備完成')).toBeVisible();
 await expect(page.getByLabel('Google Sheets 網址')).toBeDisabled();await expect(page.locator('input[type=file]')).toHaveCount(0);
 await expect(page.getByText('若來源已寫入答案，確認舊寫入已結束後，先手動還原完整標記或複製乾淨範本再讀取；重啟不會取消遠端寫入。')).toBeVisible();
 await page.getByRole('button',{name:'設定組數'}).click();await expect(page.getByText('已設定組數：3')).toBeVisible();
 await page.getByLabel('Google Sheets 網址').fill('https://docs.google.com/spreadsheets/d/synthetic-invalid/edit');await page.getByRole('button',{name:'讀取 Guided Notes'}).click();await expect(page.getByRole('alert')).toContainText('局部文字格式');await expect(page.getByRole('alert')).toContainText('C4');await expect(page.getByText('活動尚未準備完成')).toBeVisible();
 await page.getByLabel('Google Sheets 網址').fill('https://docs.google.com/spreadsheets/d/synthetic-B/edit#gid=7');await page.getByRole('button',{name:'讀取 Guided Notes'}).click();await expect(page.getByText('第 1 題 · WAITING · 共 3 題')).toBeVisible();
 await expect(page.getByRole('note')).toContainText('寫入權限尚未確認');await expect(page.getByLabel('Guided Notes 來源')).toContainText('Synthetic B');await expect(page.getByText('未納入工作表：Excluded synthetic object（OBJECT）')).toBeVisible();
 await page.reload();await expect(page.getByText('第 1 題 · WAITING · 共 3 題')).toBeVisible();await expect(page.getByLabel('Guided Notes 來源')).toContainText('Synthetic B');await expect(page.getByLabel('Google Sheets 網址')).toHaveCount(0);
 await expect(page.getByTestId('connection')).toContainText('即時同步已連線');await page.getByRole('button',{name:'開始搶答'}).click();await expect(page.getByText('第 1 題 · ANSWERING · 共 3 題')).toBeVisible();
});
