/**
 * Firebase 設定（此專案 sixmins-diary）
 * 正式部署時建議改用環境變數或 Firebase Hosting 設定
 */
export const firebaseConfig = {
    apiKey: "AIzaSyCIuY_INw6usMpftq_y62WGcpsPpnwKGgk",
    authDomain: "sixmins-diary.firebaseapp.com",
    projectId: "sixmins-diary",
    storageBucket: "sixmins-diary.firebasestorage.app",
    messagingSenderId: "854976818992",
    appId: "1:854976818992:web:a7564dedc522d36256e2f5",
    measurementId: "G-76WC8LJT3Y",
    databaseURL: "https://sixmins-diary-default-rtdb.asia-southeast1.firebasedatabase.app"
};

export const uploadMode = "firebase";
export const apiBaseUrl = "http://localhost:3000";
