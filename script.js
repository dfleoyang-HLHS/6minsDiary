document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('datetime');
    const diaryForm = document.getElementById('diaryForm');
    const statusMsg = document.getElementById('statusMessage');

    // 1. 自動填入現在的時間 (格式化為 YYYY-MM-DDThh:mm)
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateInput.value = now.toISOString().slice(0, 16);

    // 2. 表單提交處理
    diaryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const diaryEntry = {
            timestamp: dateInput.value,
            content: document.getElementById('content').value,
            createdAt: new Date().toISOString()
        };

        try {
            // 這裡假設你使用 json-server 或 Firebase 等後端 API
            // 如果是本機測試，URL 通常為 http://localhost:3000/diaries
            const response = await fetch('YOUR_API_URL_HERE', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(diaryEntry)
            });

            if (response.ok) {
                statusMsg.innerText = "✅ 日記已成功同步至雲端！";
                diaryForm.reset();
            }
        } catch (error) {
            // 模擬成功（因為目前沒有真實後端）
            console.log("提交的資料：", diaryEntry);
            statusMsg.innerText = "資料已暫存（請對接 API 以實現真實上傳）";
        }
    });
});
