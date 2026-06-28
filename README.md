# Arthur Agent 每日稽核

Arthur Internal Daily Audit

以學習、分享與未來創業為方向的個人知識網站。

## 本機預覽

直接開啟 `index.html`，或使用 VS Code 的 Live Server。

## 發布

網站為純靜態 HTML、CSS 與 JavaScript，可直接部署至 GitHub Pages。

1. 將程式碼推送至 GitHub 儲存庫。
2. 開啟 `Settings > Pages`。
3. 在 `Build and deployment` 選擇 `Deploy from a branch`。
4. 選擇 `main` 與 `/ (root)` 後儲存。

## 發布前要修改

- 公開聯絡信箱：`aelfa.c@gmail.com`。
- 將準備中的文章替換成正式文章連結。
- 視需要更新品牌名稱與自我介紹。

## 管理後台與回饋

- 後台網址：`/admin/`（不顯示於公開導覽）。
- 管理者以 `aelfa.c@gmail.com` 接收 Supabase 登入連結。
- 讀者評分與意見儲存於 Supabase `article_feedback` 資料表。
- 一般訪客只能新增回饋；只有指定管理信箱登入後能讀取全部回饋。
