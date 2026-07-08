import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, get, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { firebaseConfig, uploadMode, apiBaseUrl } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const diaryForm = document.getElementById("diaryForm");
const dateInput = document.getElementById("datetime");
const statusMsg = document.getElementById("statusMessage");
const diaryList = document.getElementById("diaryList");
const submitBtn = document.getElementById("submitBtn");

function updateNow() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateInput.value = now.toISOString().slice(0, 16);
}

function buildDiaryEntry() {
    return {
        date_time: dateInput.value,
        content: document.getElementById("content").value,
        created_at: new Date().toISOString()
    };
}

async function uploadViaFirebase(diaryData) {
    const diaryRef = ref(db, "diaries");
    const newEntryRef = push(diaryRef);
    await set(newEntryRef, diaryData);
    return { id: newEntryRef.key, ...diaryData };
}

async function uploadViaApi(diaryData) {
    const response = await fetch(`${apiBaseUrl}/api/diaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diaryData)
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
    }
    return response.json();
}

async function fetchDiaries() {
    if (uploadMode === "api") {
        const response = await fetch(`${apiBaseUrl}/api/diaries`);
        if (!response.ok) throw new Error("無法載入日記");
        return response.json();
    }

    const diariesRef = ref(db, "diaries");
    const snapshot = await get(query(diariesRef, orderByChild("created_at"), limitToLast(20)));
    if (!snapshot.exists()) return [];

    const entries = [];
    snapshot.forEach((child) => {
        entries.push({ id: child.key, ...child.val() });
    });
    return entries.reverse();
}

function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleString("zh-TW", { dateStyle: "medium", timeStyle: "short" });
}

function renderDiaryList(diaries) {
    if (!diaries.length) {
        diaryList.innerHTML = '<p class="empty-hint">尚無日記紀錄</p>';
        return;
    }

    diaryList.innerHTML = diaries
        .map(
            (entry) => `
        <article class="diary-card">
            <time>${formatDateTime(entry.date_time || entry.timestamp)}</time>
            <p>${escapeHtml(entry.content)}</p>
        </article>`
        )
        .join("");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, "<br>");
}

function showStatus(message, isError = false) {
    statusMsg.style.color = isError ? "#d9534f" : "#4a7c59";
    statusMsg.innerHTML = message;
}

async function loadDiaries() {
    try {
        const diaries = await fetchDiaries();
        renderDiaryList(diaries);
    } catch (error) {
        console.error("載入日記失敗:", error);
        diaryList.innerHTML = '<p class="empty-hint">無法載入日記紀錄</p>';
    }
}

diaryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = uploadMode === "api" ? "正在透過 API 儲存..." : "正在儲存到 Google 雲端...";

    const diaryData = buildDiaryEntry();

    try {
        if (uploadMode === "api") {
            await uploadViaApi(diaryData);
        } else {
            await uploadViaFirebase(diaryData);
        }

        showStatus("✅ 魔法已紀錄！資料已上傳至 Google 雲端資料庫。");
        diaryForm.reset();
        updateNow();
        await loadDiaries();
    } catch (error) {
        console.error(error);
        showStatus("❌ 儲存失敗：" + error.message, true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "傳送至雲端儲存";
    }
});

updateNow();
loadDiaries();
