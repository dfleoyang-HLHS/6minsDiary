import { getAccessToken } from "./auth.js";
import { DIARY_FOLDER_NAME } from "./config.js";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

async function driveFetch(url, options = {}) {
    const token = getAccessToken();
    if (!token) throw new Error("請先登入 Google 帳號");

    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    if (response.status === 401) {
        throw new Error("登入已過期，請重新登入");
    }
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Drive API 錯誤 (${response.status})`);
    }

    if (response.status === 204) return null;
    return response.json();
}

export async function getOrCreateDiaryFolder() {
    const cached = sessionStorage.getItem("diaryFolderId");
    if (cached) return cached;

    const query = encodeURIComponent(
        `name='${DIARY_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    );
    const list = await driveFetch(`${DRIVE_API}/files?q=${query}&spaces=drive&fields=files(id,name)`);

    if (list.files?.length > 0) {
        sessionStorage.setItem("diaryFolderId", list.files[0].id);
        return list.files[0].id;
    }

    const folder = await driveFetch(`${DRIVE_API}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: DIARY_FOLDER_NAME,
            mimeType: "application/vnd.google-apps.folder"
        })
    });

    sessionStorage.setItem("diaryFolderId", folder.id);
    return folder.id;
}

async function findDiaryFile(folderId, fileName) {
    const query = encodeURIComponent(
        `name='${fileName}' and '${folderId}' in parents and trashed=false`
    );
    const list = await driveFetch(
        `${DRIVE_API}/files?q=${query}&spaces=drive&fields=files(id,name,modifiedTime)`
    );
    return list.files?.[0] || null;
}

export async function saveDiary(diaryData) {
    const folderId = await getOrCreateDiaryFolder();
    const dateKey = diaryData.date;
    const fileName = `${dateKey}.json`;
    const content = JSON.stringify(diaryData, null, 2);
    const existing = await findDiaryFile(folderId, fileName);

    if (existing) {
        await driveFetch(`${UPLOAD_API}/files/${existing.id}?uploadType=media`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: content
        });
        return { fileId: existing.id, fileName, updated: true };
    }

    const metadata = { name: fileName, parents: [folderId], mimeType: "application/json" };
    const boundary = "-------6minsDiaryBoundary";
    const body =
        `--${boundary}\r\n` +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        content +
        `\r\n--${boundary}--`;

    const result = await driveFetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name`, {
        method: "POST",
        headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
        body
    });

    return { fileId: result.id, fileName, updated: false };
}

export async function listDiaries(limit = 14) {
    const folderId = await getOrCreateDiaryFolder();
    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const list = await driveFetch(
        `${DRIVE_API}/files?q=${query}&spaces=drive&orderBy=modifiedTime desc&pageSize=${limit}&fields=files(id,name,modifiedTime)`
    );

    const files = list.files || [];
    const diaries = [];

    for (const file of files) {
        if (!file.name.endsWith(".json")) continue;
        try {
            const token = getAccessToken();
            const res = await fetch(`${DRIVE_API}/files/${file.id}?alt=media`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                diaries.push({ ...data, _fileId: file.id, _modified: file.modifiedTime });
            }
        } catch (e) {
            console.warn("無法讀取檔案:", file.name, e);
        }
    }

    return diaries.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export function getDriveFolderUrl() {
    const folderId = sessionStorage.getItem("diaryFolderId");
    if (!folderId) return "https://drive.google.com/drive/my-drive";
    return `https://drive.google.com/drive/folders/${folderId}`;
}
