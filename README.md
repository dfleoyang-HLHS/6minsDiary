# 6分鐘魔法日記本

紀錄當下正向能量的日記應用，支援將資料寫入 **Google Cloud Firebase Realtime Database**。

## 功能

- 填寫日期時間與日記內容
- 一鍵上傳至 Google 雲端資料庫
- 顯示近期日記紀錄
- 兩種上傳模式：
  - **firebase**（預設）：前端直接寫入 Firebase RTDB
  - **api**：透過 Node.js 後端 API 寫入（適合需要伺服器端驗證的場景）

## 專案結構

```
├── index.html              # 主頁面
├── style.css               # 樣式
├── js/
│   ├── app.js              # 前端邏輯（上傳、讀取日記）
│   ├── firebase-config.js  # Firebase 設定
│   └── firebase-config.example.js
├── server/
│   ├── index.js            # Express API 後端
│   └── package.json
├── db.json                 # 本機測試用範例資料
└── package.json
```

## 快速開始（前端直連 Firebase）

1. 確認 `js/firebase-config.js` 已填入你的 Firebase 專案設定
2. 在 Firebase Console 啟用 **Realtime Database**（區域建議：asia-southeast1）
3. 設定資料庫規則（開發測試用）：

```json
{
  "rules": {
    "diaries": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. 啟動靜態伺服器：

```bash
npm run serve
```

5. 開啟 http://localhost:8080

## 後端 API 模式

適合需要服務帳戶認證、或未來擴充驗證邏輯時使用。

### 設定步驟

1. 在 [Firebase Console](https://console.firebase.google.com/) > 專案設定 > 服務帳戶，產生新的私密金鑰
2. 將 JSON 檔存為 `serviceAccountKey.json`（已加入 .gitignore）
3. 複製環境變數範本：

```bash
cp .env.example .env
```

4. 安裝並啟動後端：

```bash
npm run server:install
npm run server:start
```

5. 修改 `js/firebase-config.js`：

```js
export const uploadMode = "api";
export const apiBaseUrl = "http://localhost:3000";
```

6. 啟動前端：`npm run serve`

### API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/health` | 健康檢查 |
| GET | `/api/diaries` | 取得近期日記 |
| POST | `/api/diaries` | 新增日記 |

POST 請求範例：

```json
{
  "date_time": "2024-05-20T08:30",
  "content": "我很感謝今天的陽光..."
}
```

## Firebase 設定說明

從 Firebase Console 取得網頁應用程式設定後，填入 `js/firebase-config.js`：

| 欄位 | 說明 |
|------|------|
| apiKey | 網頁 API 金鑰 |
| authDomain | 驗證網域 |
| projectId | 專案 ID |
| databaseURL | Realtime Database URL（需含區域，如 asia-southeast1） |

首次使用請複製範本：

```bash
cp js/firebase-config.example.js js/firebase-config.js
```

## 部署建議

- **前端**：Firebase Hosting、GitHub Pages、或任何靜態託管
- **後端**：Google Cloud Run、Cloud Functions、或自有伺服器
- 正式環境請收緊 Realtime Database 規則，並啟用 Firebase Authentication

## 授權

MIT
