import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const PORT = process.env.PORT || 3000;
const DATABASE_URL =
    process.env.FIREBASE_DATABASE_URL ||
    "https://sixmins-diary-default-rtdb.asia-southeast1.firebasedatabase.app";

function initFirebase() {
    if (getApps().length > 0) return;

    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
        initializeApp({
            credential: cert(JSON.parse(serviceAccountJson)),
            databaseURL: DATABASE_URL
        });
        return;
    }

    if (serviceAccountPath) {
        initializeApp({
            credential: cert(serviceAccountPath),
            databaseURL: DATABASE_URL
        });
        return;
    }

    console.warn(
        "⚠️  未設定 Firebase 服務帳戶。請設定 GOOGLE_APPLICATION_CREDENTIALS 或 FIREBASE_SERVICE_ACCOUNT_JSON"
    );
    initializeApp({ databaseURL: DATABASE_URL });
}

initFirebase();
const db = getDatabase();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", database: DATABASE_URL });
});

app.get("/api/diaries", async (_req, res) => {
    try {
        const snapshot = await db.ref("diaries").orderByChild("created_at").limitToLast(50).get();
        if (!snapshot.exists()) {
            return res.json([]);
        }

        const diaries = [];
        snapshot.forEach((child) => {
            diaries.push({ id: child.key, ...child.val() });
        });
        diaries.reverse();
        res.json(diaries);
    } catch (error) {
        console.error("GET /api/diaries error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/diaries", async (req, res) => {
    try {
        const { date_time, content } = req.body;
        if (!date_time || !content) {
            return res.status(400).json({ error: "date_time 與 content 為必填欄位" });
        }

        const diaryData = {
            date_time,
            content,
            created_at: new Date().toISOString()
        };

        const ref = db.ref("diaries").push();
        await ref.set(diaryData);

        res.status(201).json({ id: ref.key, ...diaryData });
    } catch (error) {
        console.error("POST /api/diaries error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 6分鐘日記 API 運行於 http://localhost:${PORT}`);
    console.log(`📦 資料庫: ${DATABASE_URL}`);
});
