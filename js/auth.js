import { GOOGLE_CLIENT_ID } from "./config.js";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

let accessToken = null;
let tokenClient = null;
let onAuthChange = null;

export function isSignedIn() {
    return Boolean(accessToken);
}

export function getAccessToken() {
    return accessToken;
}

export function setAuthChangeCallback(callback) {
    onAuthChange = callback;
}

function waitForGoogle(maxWait = 10000) {
    return new Promise((resolve) => {
        if (window.google?.accounts?.oauth2) {
            resolve(true);
            return;
        }
        const start = Date.now();
        const timer = setInterval(() => {
            if (window.google?.accounts?.oauth2) {
                clearInterval(timer);
                resolve(true);
            } else if (Date.now() - start > maxWait) {
                clearInterval(timer);
                resolve(false);
            }
        }, 100);
    });
}

function notifyAuthChange() {
    if (typeof onAuthChange === "function") {
        onAuthChange(isSignedIn());
    }
}

export async function initAuth() {
    const loaded = await waitForGoogle();
    if (!loaded) return false;

    tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: DRIVE_SCOPE,
            callback: (response) => {
                if (response.error) {
                    console.error("OAuth error:", response);
                    accessToken = null;
                } else {
                    accessToken = response.access_token;
                }
                notifyAuthChange();
            }
        });

    return true;
}

export function signIn() {
    if (!tokenClient) {
        return Promise.reject(new Error("Google 登入尚未初始化，請重新整理頁面"));
    }
    if (GOOGLE_CLIENT_ID.startsWith("YOUR_CLIENT_ID")) {
        return Promise.reject(new Error("請先在 js/config.js 設定 Google OAuth Client ID"));
    }

    return new Promise((resolve, reject) => {
        const originalCallback = tokenClient.callback;
        tokenClient.callback = (response) => {
            tokenClient.callback = originalCallback;
            originalCallback(response);
            if (response.error) {
                reject(new Error(response.error));
            } else {
                resolve(response.access_token);
            }
        };
        tokenClient.requestAccessToken({ prompt: "consent" });
    });
}

export function signOut() {
    if (accessToken && window.google?.accounts?.oauth2) {
        google.accounts.oauth2.revoke(accessToken, () => {});
    }
    accessToken = null;
    sessionStorage.removeItem("diaryFolderId");
    notifyAuthChange();
}
