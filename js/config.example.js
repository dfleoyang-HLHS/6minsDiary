/**
 * Google OAuth 設定範本
 * 1. 前往 https://console.cloud.google.com/
 * 2. 建立專案並啟用 Google Drive API
 * 3. 建立 OAuth 2.0 用戶端 ID（網頁應用程式）
 * 4. 將授權 JavaScript 來源設為你的網域（如 https://yourname.github.io）
 * 5. 複製此檔案為 config.js 並填入 CLIENT_ID
 */
export const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";

/** 日記儲存的 Google Drive 子資料夾名稱 */
export const DIARY_FOLDER_NAME = "6minsdiaries";
