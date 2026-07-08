import { initAuth, signIn, signOut, isSignedIn, setAuthChangeCallback } from "./auth.js";
import { saveDiary, listDiaries, getDriveFolderUrl } from "./drive.js";

const PROMPTS = [
    {
        id: "gratitude",
        number: "①",
        title: "感恩",
        hint: "寫下 3 件你今天感謝的事",
        placeholder: "例：感謝家人的陪伴、感謝好天氣、感謝完成了一項工作..."
    },
    {
        id: "great_day",
        number: "②",
        title: "讓今天更棒",
        hint: "今天可以怎麼做，讓這一天變得更好？",
        placeholder: "例：提早 10 分鐘出門、專心完成最重要的一件事..."
    },
    {
        id: "affirmation",
        number: "③",
        title: "正向肯定",
        hint: "寫下對自己的正向肯定或今天的好事",
        placeholder: "例：我很有耐心、今天順利完成了會議、學到了新東西..."
    }
];

const els = {
    loginScreen: document.getElementById("loginScreen"),
    mainApp: document.getElementById("mainApp"),
    signInBtn: document.getElementById("signInBtn"),
    signOutBtn: document.getElementById("signOutBtn"),
    userInfo: document.getElementById("userInfo"),
    driveLink: document.getElementById("driveLink"),
    diaryForm: document.getElementById("diaryForm"),
    diaryDate: document.getElementById("diaryDate"),
    submitBtn: document.getElementById("submitBtn"),
    loginStatus: document.getElementById("loginStatus"),
    statusMessage: document.getElementById("statusMessage"),
    diaryList: document.getElementById("diaryList"),
    promptFields: document.getElementById("promptFields")
};

function todayString() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function renderPromptFields() {
    els.promptFields.innerHTML = PROMPTS.map(
        (p) => `
        <div class="prompt-card">
            <label for="${p.id}">
                <span class="prompt-number">${p.number}</span>
                <span class="prompt-title">${p.title}</span>
                <span class="prompt-hint">${p.hint}</span>
            </label>
            <textarea id="${p.id}" name="${p.id}" rows="3" required
                placeholder="${p.placeholder}"></textarea>
        </div>`
    ).join("");
}

function showStatus(msg, type = "success", target = "main") {
    const el = target === "login" ? els.loginStatus : els.statusMessage;
    if (!el) return;
    el.className = `status-message status-${type}`;
    el.textContent = msg;
}

function clearStatus(target = "main") {
    const el = target === "login" ? els.loginStatus : els.statusMessage;
    if (!el) return;
    el.className = "status-message";
    el.textContent = "";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML.replace(/\n/g, "<br>");
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${y} 年 ${parseInt(m, 10)} 月 ${parseInt(d, 10)} 日`;
}

function renderDiaryList(diaries) {
    if (!diaries.length) {
        els.diaryList.innerHTML = '<p class="empty-hint">尚無日記，寫下今天的第一篇吧！</p>';
        return;
    }

    els.diaryList.innerHTML = diaries
        .map(
            (entry) => `
        <article class="diary-card">
            <header class="diary-card-header">
                <time>${formatDate(entry.date)}</time>
            </header>
            <div class="diary-section">
                <strong>① 感恩</strong>
                <p>${escapeHtml(entry.gratitude)}</p>
            </div>
            <div class="diary-section">
                <strong>② 讓今天更棒</strong>
                <p>${escapeHtml(entry.great_day)}</p>
            </div>
            <div class="diary-section">
                <strong>③ 正向肯定</strong>
                <p>${escapeHtml(entry.affirmation)}</p>
            </div>
        </article>`
        )
        .join("");
}

async function loadDiaries() {
    els.diaryList.innerHTML = '<p class="empty-hint">載入中...</p>';
    try {
        const diaries = await listDiaries();
        renderDiaryList(diaries);
        els.driveLink.href = getDriveFolderUrl();
        els.driveLink.style.display = "inline";
    } catch (err) {
        console.error(err);
        els.diaryList.innerHTML = `<p class="empty-hint">無法載入日記：${err.message}</p>`;
    }
}

function buildDiaryData() {
    return {
        date: els.diaryDate.value,
        gratitude: document.getElementById("gratitude").value.trim(),
        great_day: document.getElementById("great_day").value.trim(),
        affirmation: document.getElementById("affirmation").value.trim(),
        updated_at: new Date().toISOString()
    };
}

function showMainApp(show) {
    els.loginScreen.hidden = show;
    els.mainApp.hidden = !show;
}

function updateUI(signedIn) {
    showMainApp(signedIn);
    if (signedIn) {
        els.userInfo.textContent = "已連結個人 Google 雲端";
        loadDiaries();
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    clearStatus();
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = "上傳至 Google 雲端...";

    try {
        const data = buildDiaryData();
        const result = await saveDiary(data);
        const action = result.updated ? "更新" : "新增";
        showStatus(`✅ 日記已${action}！檔案：6minsdiaries/${result.fileName}`);
        els.driveLink.href = getDriveFolderUrl();
        await loadDiaries();
    } catch (err) {
        console.error(err);
        showStatus(`❌ 上傳失敗：${err.message}`, "error");
    } finally {
        els.submitBtn.disabled = false;
        els.submitBtn.textContent = "儲存至我的 Google 雲端";
    }
}

async function bootstrap() {
    renderPromptFields();
    els.diaryDate.value = todayString();
    els.diaryDate.max = todayString();

    setAuthChangeCallback(updateUI);

    els.signInBtn.addEventListener("click", async () => {
        els.signInBtn.disabled = true;
        try {
            await signIn();
        } catch (err) {
            showStatus(`❌ 登入失敗：${err.message}`, "error", "login");
            showMainApp(false);
        } finally {
            els.signInBtn.disabled = false;
        }
    });

    els.signOutBtn.addEventListener("click", () => {
        signOut();
        clearStatus();
        showMainApp(false);
    });

    els.diaryForm.addEventListener("submit", handleSubmit);

    const ready = await initAuth();
    if (!ready) {
        showStatus("❌ 無法載入 Google 登入服務，請檢查網路連線", "error", "login");
    }
}

bootstrap();
