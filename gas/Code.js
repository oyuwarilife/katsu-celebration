var SHEET_ID = '1wvrhUEC33QeGrNcjly6jhtfiWgGIicYD4CiYqbik9zk';

function getSheet(name) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, 5).setValues([['nickname', 'uniqueId', 'stampCount', 'monthStampCount', 'updatedAt']]);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  var month = (e && e.parameter && e.parameter.month) || '';
  if (!month) {
    var now = new Date();
    month = now.getFullYear() + '-' + ('0' + (now.getMonth()+1)).slice(-2);
  }
  var sheet;
  try {
    sheet = getSheet(month);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ranking: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var data = sheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][3] > 0) {
      rows.push({ nickname: String(data[i][0]), monthStampCount: Number(data[i][3]) });
    }
  }
  rows.sort(function(a, b) { return b.monthStampCount - a.monthStampCount; });
  rows = rows.slice(0, 50);
  return ContentService.createTextOutput(JSON.stringify({ month: month, ranking: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var raw = e.postData.contents;
  var decoded = Utilities.newBlob(Utilities.base64Decode(Utilities.base64Encode(raw))).getDataAsString('UTF-8');
  var params = JSON.parse(decoded);
  var nickname = params.nickname;
  var stampCount = params.stampCount;
  var monthStampCount = params.monthStampCount;
  var month = params.month;
  var uniqueId = params.uniqueId;

  if (!uniqueId || typeof stampCount !== 'number' || !month) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'invalid params' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = getSheet(month);
  var data = sheet.getDataRange().getValues();
  var found = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === uniqueId) { found = i + 1; break; }
  }

  var now = new Date().toISOString();
  var row = [nickname || uniqueId.slice(0,8), uniqueId, stampCount, monthStampCount, now];
  if (found > 0) {
    sheet.getRange(found, 1, 1, 5).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
