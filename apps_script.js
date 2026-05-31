function doPost(e) {
  // Це скрипт для Google Apps Script.
  // 1. Створи нову Google Таблицю.
  // 2. Натисни "Розширення" -> "Apps Script".
  // 3. Видали там весь код і встав цей код замість нього.
  // 4. Збережи проект (Ctrl+S).
  // 5. Натисни "Розгорнути" (Deploy) -> "Нове розгортання".
  // 6. Вибери тип "Веб-додаток". Встанови доступ: "Для всіх" (Anyone).
  // 7. Натисни "Розгорнути" і надай доступи.
  // 8. Скопіюй Web App URL і встав його в файл app.js у змінну SCRIPT_URL.

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Create headers if row 1 is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Дата", "Ім'я (Instagram)", "Бал", "Всього питань", "Час", "Деталі відповідей"]);
    sheet.getRange("A1:F1").setFontWeight("bold");
  }
  
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return ContentService.createTextOutput("Error parsing JSON");
  }
  
  var timestamp = new Date();
  
  sheet.appendRow([
    timestamp,
    data.name || "Анонім",
    data.score || 0,
    data.total || 0,
    data.time || "00:00",
    data.answers || "{}"
  ]);
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}
