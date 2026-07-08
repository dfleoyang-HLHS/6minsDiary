/**
 * 6分鐘魔法日記本 — Google Apps Script 後端
 * 版本 2.3 — 每位使用者獨立日記（需正確部署設定）
 */

var SCRIPT_VERSION = "2.3";
var DIARY_FOLDER_NAME = "6minsdiaries";
var FOLDER_ID_KEY = "diaryFolderId";

/**
 * 提供網頁 UI
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("6分鐘魔法日記本")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

/**
 * 回傳版本號（用於確認是否已部署新版）
 */
function getScriptVersion() {
  return SCRIPT_VERSION;
}

/**
 * 部署前測試：在編輯器選此函式 → 執行
 */
function testDeployment() {
  HtmlService.createHtmlOutputFromFile("index");
  var folderId = getOrCreateDiaryFolder();
  Logger.log("版本：" + SCRIPT_VERSION);
  Logger.log("✅ index 檔案存在");
  Logger.log("✅ Drive 權限正常，資料夾 ID：" + folderId);
}

/**
 * 取得或建立 6minsdiaries 資料夾
 */
function getOrCreateDiaryFolder() {
  var userProps = PropertiesService.getUserProperties();
  var savedId = userProps.getProperty(FOLDER_ID_KEY);

  if (savedId) {
    try {
      DriveApp.getFolderById(savedId).getName();
      return savedId;
    } catch (e) {
      userProps.deleteProperty(FOLDER_ID_KEY);
    }
  }

  var folder = DriveApp.createFolder(DIARY_FOLDER_NAME);
  userProps.setProperty(FOLDER_ID_KEY, folder.getId());
  return folder.getId();
}

/**
 * 儲存日記
 */
function saveDiary(diaryData) {
  if (!diaryData || !diaryData.date) {
    throw new Error("缺少日期");
  }
  if (!diaryData.gratitude || !diaryData.great_day || !diaryData.affirmation) {
    throw new Error("請填寫三個日記欄位");
  }

  var folderId = getOrCreateDiaryFolder();
  var folder = DriveApp.getFolderById(folderId);
  var fileName = diaryData.date + ".json";

  var entry = {
    date: diaryData.date,
    gratitude: String(diaryData.gratitude).trim(),
    great_day: String(diaryData.great_day).trim(),
    affirmation: String(diaryData.affirmation).trim(),
    updated_at: new Date().toISOString()
  };

  var content = JSON.stringify(entry, null, 2);
  var existing = folder.getFilesByName(fileName);
  var updated = false;
  var file;

  if (existing.hasNext()) {
    file = existing.next();
    file.setContent(content);
    updated = true;
  } else {
    file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
  }

  return {
    fileId: file.getId(),
    fileName: fileName,
    folderId: folderId,
    updated: updated
  };
}

/**
 * 讀取近期日記
 */
function listDiaries(limit) {
  limit = limit || 14;
  var folderId = getOrCreateDiaryFolder();
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  var diaries = [];

  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();
    if (name.indexOf(".json") !== name.length - 5) continue;

    try {
      var data = JSON.parse(file.getBlob().getDataAsString("UTF-8"));
      data._fileId = file.getId();
      data._modified = file.getLastUpdated().toISOString();
      diaries.push(data);
    } catch (e) {
      // 略過無法解析的檔案
    }
  }

  diaries.sort(function (a, b) {
    return (b.date || "").localeCompare(a.date || "");
  });

  return diaries.slice(0, limit);
}

/**
 * 取得雲端硬碟資料夾連結
 */
function getDriveFolderUrl() {
  var folderId = getOrCreateDiaryFolder();
  return "https://drive.google.com/drive/folders/" + folderId;
}

/**
 * 取得目前登入的使用者資訊
 */
function getUserInfo() {
  var email = "";
  try {
    email = Session.getEffectiveUser().getEmail();
  } catch (e) {
  }
  if (!email) {
    try {
      email = Session.getActiveUser().getEmail();
    } catch (e2) {
    }
  }

  return {
    version: SCRIPT_VERSION,
    email: email,
    folderName: DIARY_FOLDER_NAME,
    driveUrl: getDriveFolderUrl()
  };
}
