# 6分鐘魔法日記本

每天 6 分鐘，透過三個方向記錄正向能量，並儲存至**你個人 Google 帳號**的雲端硬碟。

## 功能特色

- **三個日記方向**：感恩、讓今天更棒、正向肯定
- **個人 Google 帳號登入**：OAuth 2.0 安全授權
- **雲端儲存位置**：你的 Google 雲端硬碟 → `6minsdiaries` 資料夾
- **每日一篇**：同日期再次儲存會更新當日檔案（`YYYY-MM-DD.json`）
- **跨瀏覽器支援**：Chrome、Firefox、Safari、Edge 等現代瀏覽器

## 資料儲存位置

登入並寫日記後，資料會存在：

```
你的 Google 雲端硬碟
└── 6minsdiaries/          ← 自動建立
    ├── 2026-07-08.json
    ├── 2026-07-07.json
    └── ...
```

每個 JSON 檔案包含：

```json
{
  "date": "2026-07-08",
  "gratitude": "感恩內容...",
  "great_day": "讓今天更棒的行動...",
  "affirmation": "正向肯定...",
  "updated_at": "2026-07-08T01:00:00.000Z"
}
```

可在網頁點擊「開啟 6minsdiaries 資料夾」直接前往 Google Drive 查看。

## 設定步驟

### 1. 建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案（或選擇現有專案）
3. 啟用 **Google Drive API**：
   - APIs & Services → Library → 搜尋「Google Drive API」→ Enable

### 2. 建立 OAuth 用戶端 ID

1. APIs & Services → **Credentials** → Create Credentials → **OAuth client ID**
2. 應用程式類型選 **Web application**
3. **Authorized JavaScript origins** 加入你的網域，例如：
   - `http://localhost:8080`（本機測試）
   - `https://yourname.github.io`（GitHub Pages）
4. 複製產生的 **Client ID**

### 3. 設定 OAuth 同意畫面

1. APIs & Services → **OAuth consent screen**
2. 使用者類型選 **External**（或 Internal 若為組織內部使用）
3. 填寫應用程式名稱、支援電子郵件
4. 在 Scopes 加入：`https://www.googleapis.com/auth/drive.file`
5. 測試階段需將你的 Gmail 加入 **Test users**

### 4. 設定專案

```bash
cp js/config.example.js js/config.js
```

編輯 `js/config.js`，填入你的 Client ID：

```js
export const GOOGLE_CLIENT_ID = "123456789-xxxx.apps.googleusercontent.com";
export const DIARY_FOLDER_NAME = "6minsdiaries";
```

### 5. 本機測試

```bash
npm run serve
# 開啟 http://localhost:8080
```

### 6. 部署至 GitHub Pages

1. 推送程式碼至 GitHub
2. Settings → Pages → Source 選 main 分支
3. 確認 OAuth 的 JavaScript origins 已包含 `https://yourname.github.io`

## 專案結構

```
├── index.html           # 主頁面
├── style.css            # 樣式（跨瀏覽器）
├── js/
│   ├── config.js        # OAuth Client ID 設定
│   ├── config.example.js
│   ├── auth.js          # Google 帳號登入/登出
│   ├── drive.js         # Google Drive 讀寫
│   └── app.js           # 主程式邏輯
└── package.json
```

## 隱私與權限

- 本應用使用 `drive.file` 權限，**只能存取此應用建立的檔案**（6minsdiaries 資料夾內的日記）
- 無法讀取你 Google 雲端硬碟的其他檔案
- 日記資料儲存在你自己的 Google 帳號下，開發者無法存取

## 瀏覽器支援

| 瀏覽器 | 最低版本 |
|--------|----------|
| Chrome | 80+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 80+ |

需啟用 JavaScript 與 Cookie（用於 Google 登入）。

## 授權

MIT
