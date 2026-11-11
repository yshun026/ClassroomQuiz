import {test,expect} from '../../frontend/node_modules/@playwright/test/index.mjs';
import {fileURLToPath} from 'node:url';
const fixture=name=>fileURLToPath(new URL('../fixtures/guided-notes/'+name,import.meta.url));
test('teacher prepares activity and recovers after refresh',async({page})=>{
 await page.goto('/?role=teacher');await page.getByLabel('管理密碼').fill('wrong');await page.getByRole('button',{name:'登入'}).click();await expect(page.getByRole('alert')).toHaveText('管理密碼錯誤');
 await page.getByLabel('管理密碼').fill(process.env.ADMIN_PASSWORD);await page.getByRole('button',{name:'登入'}).click();await expect(page.getByText('活動尚未準備完成')).toBeVisible();
 await page.getByRole('button',{name:'設定組數'}).click();await expect(page.getByText('已設定組數：3')).toBeVisible();
 await page.getByLabel('匯入 Guided Notes（.xlsx）').setInputFiles(fixture('corrupt.xlsx'));await expect(page.getByRole('alert')).toHaveText('檔案無法讀取');
 await page.getByLabel('匯入 Guided Notes（.xlsx）').setInputFiles(fixture('valid-a.xlsx'));await expect(page.getByText('第 1 題 · WAITING · 共 3 題')).toBeVisible();await page.reload();await expect(page.getByText('第 1 題 · WAITING · 共 3 題')).toBeVisible();
});
