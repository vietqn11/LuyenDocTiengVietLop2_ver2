import { SavedResult } from '../types';

// HƯỚNG DẪN:
// 1. Dán URL Web App của Google Apps Script của bạn vào biến GOOGLE_SCRIPT_URL bên dưới.
// 2. Xóa hết mã cũ và dán toàn bộ đoạn mã trong phần "--- GOOGLE APPS SCRIPT ---" ở cuối file này vào trình soạn thảo script của bạn (Code.gs).
// 3. Triển khai lại Apps Script của bạn (Deploy > New deployment), trong mục "Who has access", chọn "Anyone" (Bất kỳ ai).
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNbmERQ-Nv8SWDR0-QVC8lNedJMeXQiIkNphKavxcRYkc0PeKHdZCZDBVkdyrtrIGD/exec';

export const saveResultToGoogleSheet = async (result: SavedResult): Promise<void> => {
    // Chỉ thực thi nếu URL đã được cấu hình đúng.
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
        console.warn('URL của Google Apps Script chưa được cấu hình. Bỏ qua việc lưu vào Google Sheet.');
        return;
    }

    try {
        // Định dạng danh sách lỗi thành chuỗi, dùng dấu chấm phẩy cho an toàn với URL.
        const errorsString = result.resultData.errors
            .map(err => `"${err.studentWord || '(bỏ qua)'}" -> "${err.originalWord || '(thêm từ)'}"`)
            .join('; ');

        // Chuẩn bị dữ liệu để gửi đi. Chuyển đổi tất cả giá trị sang chuỗi.
        const params = {
            timestamp: new Date(result.timestamp).toLocaleString('vi-VN'),
            userName: result.user.name,
            className: result.user.className,
            lessonId: result.lessonId,
            lessonTitle: result.lessonTitle,
            overallFeedback: result.resultData.overallFeedback,
            scoreFluency: result.resultData.scores.fluency.toString(),
            scorePronunciation: result.resultData.scores.pronunciation.toString(),
            scoreAccuracy: result.resultData.scores.accuracy.toString(),
            scoreOverall: result.resultData.scores.overall.toString(),
            errorsList: errorsString,
        };
        
        // Xây dựng chuỗi truy vấn (query string) từ dữ liệu
        const queryString = new URLSearchParams(params).toString();
        const requestUrl = `${GOOGLE_SCRIPT_URL}?${queryString}`;

        // Gửi yêu cầu GET. Phương thức này ổn định hơn cho Google Apps Script từ trình duyệt.
        await fetch(requestUrl, {
            method: 'GET',
            mode: 'no-cors', // Dùng no-cors cho yêu cầu "fire-and-forget"
        });

        console.log('Đã gửi yêu cầu lưu kết quả (GET) vào Google Sheet.');

    } catch (error) {
        // Lỗi ở đây thường là lỗi mạng.
        console.error('Lỗi mạng khi gửi dữ liệu (GET) đến Google Sheet:', error);
    }
};

/*
--- GOOGLE APPS SCRIPT (dán vào file Code.gs của bạn) ---
// PHIÊN BẢN MỚI NHẤT - Sử dụng doGet để đảm bảo hoạt động ổn định

function doGet(e) {
  // Sử dụng LockService để tránh lỗi ghi đè khi có nhiều yêu cầu cùng lúc
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    // Thay "LichSuDoc" bằng tên trang tính (sheet) của bạn.
    const sheetName = "LichSuDoc";
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetName);

    // Nếu trang tính không tồn tại, tạo mới và thêm hàng tiêu đề
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      const headers = [
        "Thời gian", "Họ và tên", "Lớp", "ID Bài đọc", "Tên bài đọc",
        "Nhận xét chung", "Điểm lưu loát", "Điểm phát âm", "Điểm chính xác", "Điểm tổng",
        "Danh sách lỗi"
      ];
      sheet.appendRow(headers);
      // Định dạng cho hàng tiêu đề
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold").setBackground("#f2f2f2");
      sheet.setFrozenRows(1); // Cố định hàng tiêu đề
    }

    // Lấy dữ liệu từ các tham số của URL
    const params = e.parameter;
    
    // Kiểm tra dữ liệu cơ bản
    if (!params.timestamp || !params.userName) {
        throw new Error("Dữ liệu không đầy đủ. QueryString nhận được: " + e.queryString);
    }

    // Chuẩn bị hàng mới để thêm vào
    const newRow = [
      params.timestamp,
      params.userName,
      params.className,
      params.lessonId,
      params.lessonTitle,
      params.overallFeedback,
      params.scoreFluency,
      params.scorePronunciation,
      params.scoreAccuracy,
      params.scoreOverall,
      params.errorsList || "Không có lỗi" // Ghi rõ nếu không có lỗi
    ];

    sheet.appendRow(newRow);

    // Phản hồi thành công (trình duyệt sẽ không thấy nhưng tốt cho việc gỡ lỗi)
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "data": newRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Ghi lại lỗi vào một sheet khác để dễ dàng gỡ lỗi
    try {
      const errorSheet = spreadsheet.getSheetByName("ErrorLog") || spreadsheet.insertSheet("ErrorLog");
      if(errorSheet.getLastRow() === 0) {
        errorSheet.appendRow(["Thời gian", "Lỗi", "Query String"]);
      }
      errorSheet.appendRow([new Date(), error.toString(), e.queryString || "Không có query string"]);
    } catch (e) {}
    
    // Phản hồi lỗi
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    // Luôn giải phóng khóa sau khi hoàn tất
    lock.releaseLock();
  }
}
*/