/**
 * Firebase 設定範本
 * 複製此檔案為 firebase-config.js 並填入你的 Firebase 專案資訊
 * 可從 Firebase Console > 專案設定 > 一般 > 你的應用程式 取得
 */
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app"
};

/** 上傳模式：'firebase' 直接寫入 RTDB，'api' 透過後端 API */
export const uploadMode = "firebase";

/** 後端 API 位址（uploadMode 為 'api' 時使用） */
export const apiBaseUrl = "http://localhost:3000";
