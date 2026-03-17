var SHEET_ID = '1wvrhUEC33QeGrNcjly6jhtfiWgGIicYD4CiYqbik9zk';

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('ranking');
  if (!sheet) {
    sheet = ss.insertSheet('ranking');
    sheet.getRange(1, 1, 1, 4).setValues([['nickname', 'stampCount', 'updatedAt', 'uniqueId']]);
  }
  return sheet;
}

function setupSheet() {
  var sheet = getSheet();
  sheet.getRange(1, 1, 1, 4).setValues([['nickname', 'stampCount', 'updatedAt', 'uniqueId']]);
  sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 280);
  sheet.setFrozenRows(1);
}

function doGet(e) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1] > 0) {
      rows.push({ nickname: String(data[i][0]), stampCount: Number(data[i][1]) });
    }
  }
  rows.sort(function(a, b) { return b.stampCount - a.stampCount; });
  rows = rows.slice(0, 30);
  var json = JSON.stringify({ ranking: rows });
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var raw = e.postData.contents;
  var decoded = Utilities.newBlob(Utilities.base64Decode(Utilities.base64Encode(raw))).getDataAsString('UTF-8');
  var params = JSON.parse(decoded);
  var nickname = params.nickname;
  var stampCount = params.stampCount;
  var uniqueId = params.uniqueId;

  if (!nickname || !uniqueId || typeof stampCount !== 'number') {
    return ContentService.createTextOutput(JSON.stringify({ error: 'invalid params' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = getSheet();
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
