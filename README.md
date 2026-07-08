# 6分鐘魔法日記本

每天 6 分鐘，透過三個方向記錄正向能量，並儲存至**使用者個人 Google 雲端硬碟**的 `6minsdiaries` 資料夾。

採用 **Google Apps Script** 部署，**不需要 Google Cloud Console、不需要綁定信用卡**。

## 功能特色

- **三個日記方向**：感恩、讓今天更棒、正向肯定
- **個人 Google 帳號**：開啟網頁即以自己的帳號授權
- **雲端儲存位置**：你的 Google 雲端硬碟 → `6minsdiaries` 資料夾
- **每日一篇**：同日期再次儲存會更新當日檔案（`YYYY-MM-DD.json`）
- **跨瀏覽器支援**：Chrome、Firefox、Safari、Edge 等現代瀏覽器

## 資料儲存位置

```
你的 Google 雲端硬碟
└── 6minsdiaries/          ← 自動建立
    ├── 2026-07-08.json
    ├── 2026-07-07.json
    └── ...
```

## 部署步驟（開發者，只需一般 Gmail）

### 方法一：手動部署（最簡單）

1. 前往 [script.google.com](https://script.google.com/) 並登入你的 Google 帳號
2. 點 **新增專案**
3. 將本 repo `gas/` 資料夾內的三個檔案內容分別貼入：
   - `Code.gs` → 程式碼編輯器（刪除預設的 `myFunction`）
   - 點 **+** → **HTML** → 命名 `index` → 貼上 `index.html` 內容
   - 再新增 HTML 檔案 `styles` → 貼上 `styles.html` 內容
4. 點 **部署** → **新增部署作業**
5. 類型選 **網頁應用程式**，設定如下：

| 項目 | 設定值 |
|------|--------|
| 執行身分 | **存取網頁應用程式的使用者** |
| 誰可以存取 | **所有人**（或「所有已登入 Google 帳戶的使用者」） |

6. 點 **部署**，完成授權（允許存取 Google 雲端硬碟）
7. 複製 **網頁應用程式 URL**，分享給使用者

> **重要**：「執行身分」必須選「存取網頁應用程式的使用者」，日記才會存入**各使用者自己**的雲端硬碟。

### 方法二：使用 clasp 指令部署

```bash
npm install -g @google/clasp
clasp login
clasp create --type webapp --title "6分鐘魔法日記本"
# 將產生的 scriptId 填入 .clasp.json
cp .clasp.json.example .clasp.json
clasp push
clasp deploy --description "v1"
```

## 使用者如何使用

1. 開啟開發者提供的 **網頁應用程式 URL**
2. 第一次使用時，Google 會要求授權（允許此應用管理你在 `6minsdiaries` 建立的檔案）
3. 選擇日期，填寫三個方向的日記
4. 點 **儲存至我的 Google 雲端**
5. 可點 **開啟 6minsdiaries 資料夾** 在 Google Drive 中查看

## 專案結構

```
├── gas/
│   ├── appsscript.json   # Apps Script 專案設定
│   ├── Code.gs           # 後端：Drive 讀寫邏輯
│   ├── index.html        # 前端 UI
│   └── styles.html       # 樣式
├── index.html            # GitHub 說明頁
└── README.md
```

## 與其他方案的差異

| 項目 | Apps Script（本方案） | Google Cloud OAuth |
|------|----------------------|-------------------|
| 需要信用卡 | ❌ 不需要 | ⚠️ 可能需要 |
| 需要 GCP Console | ❌ 不需要 | ✅ 需要 |
| 儲存位置 | 個人 Google 雲端硬碟 | 個人 Google 雲端硬碟 |
| 部署網址 | script.google.com | 自訂網域 / GitHub Pages |

## 隱私說明

- 程式以**使用者自己的 Google 帳號**執行，日記只存在該使用者的雲端硬碟
- 開發者無法讀取使用者的日記內容
- 授權範圍僅限 Apps Script 建立的 `6minsdiaries` 資料夾內檔案

## 授權

MIT
