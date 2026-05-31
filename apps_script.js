function doPost(e) {
  // Це скрипт для Google Apps Script.
  // Записує всіх учнів єдиним списком на активний аркуш.
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Якщо таблиця повністю порожня, додаємо заголовки стовпців
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
  
  // Додаємо новий рядок з результатами учня
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
