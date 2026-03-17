// Google Apps Script - ポモ活スタンプシート ランキングAPI
// このコードをApps Scriptエディタに貼り付けてデプロイしてください

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ranking');
  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1] > 0) {
      rows.push({ nickname: data[i][0], stampCount: data[i][1] });
    }
  }
  rows.sort(function(a, b) { return b.stampCount - a.stampCount; });
  rows = rows.slice(0, 30);
  return ContentService.createTextOutput(JSON.stringify({ ranking: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var nickname = params.nickname;
  var stampCount = params.stampCount;
  var uniqueId = params.uniqueId;

  if (!nickname || !uniqueId || typeof stampCount !== 'number') {
    return ContentService.createTextOutput(JSON.stringify({ error: 'invalid params' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ranking');
  var data = sheet.getDataRange().getValues();
  var found = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][3] === uniqueId) { found = i + 1; break; }
  }

  var now = new Date().toISOString();
  if (found > 0) {
    sheet.getRange(found, 1, 1, 4).setValues([[nickname, stampCount, now, uniqueId]]);
  } else {
    sheet.appendRow([nickname, stampCount, now, uniqueId]);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
