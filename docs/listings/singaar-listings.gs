/**
 * SINGAAR artist listings (pilot) - Google Sheet + Google Drive backend.
 *
 *   POST  (from singaar.vercel.app/join)  checks the details, saves one row in "Listings" and the photos in Drive
 *   GET   (from the SINGAAR app)          returns every row whose status is "live", as JSON
 *
 * Setup: docs/listings/SETUP.md (paste this file in Extensions -> Apps Script, run "setup", deploy as a Web app).
 * Hide a listing: change its "status" cell from live to hidden. It leaves the app within a minute.
 */

var SHEET = 'Listings';
var FOLDER = 'SINGAAR listing photos';
var COLS = ['id', 'created', 'status', 'business', 'founder', 'type', 'area', 'city', 'travel', 'story', 'services',
            'whatsapp', 'show_whatsapp', 'instagram', 'website', 'facebook', 'photos', 'consent'];
// Must match app/data.js
var SERVICES = ['bridal', 'engagement', 'reception', 'saree', 'bridesmaid', 'party', 'guest', 'hair', 'blowdry', 'hairspa',
                'facial', 'prebridal', 'nails', 'mehendi', 'accessory'];
var TYPES = ['artist', 'salon', 'studio'];
var TRAVEL = ['home', 'salon', 'both'];
var AREAS = ['Hulimavu', 'Arekere', 'Bannerghatta Road', 'Gottigere', 'Begur', 'Akshayanagar', 'Bilekahalli', 'Kalena Agrahara',
             'Hongasandra', 'Bommanahalli', 'JP Nagar', 'BTM Layout', 'Electronic City', 'Banashankari', 'HSR Layout', 'Jayanagar',
             'Koramangala', 'Basavanagudi', 'Indiranagar', 'Malleshwaram', 'Frazer Town', 'Whitefield'];

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLS.length).setFontWeight('bold').setBackground('#5E0709').setFontColor('#F8E3AE');
    sh.getRange('C2:C1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['live', 'hidden'], true).build());
  }
  folder_();
  return 'Ready';
}

function folder_() {
  var it = DriveApp.getFoldersByName(FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
}
function out_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function clip_(s, n) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n); }
function rows_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  return sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues().map(function (r) {
    var o = {}; head.forEach(function (h, i) { o[h] = r[i]; }); return o;
  });
}

function publicRow_(r) {
  var pk = {};
  try { pk = JSON.parse(r.services || '{}'); } catch (e) {}
  return {
    id: String(r.id), created: r.created ? new Date(r.created).toISOString() : '',
    business: String(r.business), founder: String(r.founder), type: String(r.type || 'artist'),
    area: String(r.area), city: 'Bangalore', travel: String(r.travel || 'home'), story: String(r.story || ''), pk: pk,
    whatsapp: String(r.show_whatsapp).toLowerCase() === 'yes' ? String(r.whatsapp || '') : '',
    instagram: String(r.instagram || ''), website: String(r.website || ''), facebook: String(r.facebook || ''),
    photos: String(r.photos || '').split(',').filter(String)
  };
}

function doGet() {
  var cache = CacheService.getScriptCache(), hit = cache.get('list');
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  var list = rows_().filter(function (r) { return String(r.status).toLowerCase() === 'live'; }).map(publicRow_).reverse();
  var text = JSON.stringify({ ok: true, artists: list });
  try { cache.put('list', text, 60); } catch (err) {}
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}

function tidy_(s) {
  s = clip_(s, 60);
  return s && s === s.toLowerCase() ? s.replace(/(^|\s)(\S)/g, function (m, a, b) { return a + b.toUpperCase(); }) : s;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    var b = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (b.company_site) return out_({ ok: true, id: 'thanks' });                 // hidden field: only bots fill it

    var business = tidy_(b.business), founder = tidy_(b.founder);
    if (business.length < 2 || founder.length < 2) return out_({ ok: false, message: 'Please add your business name and your name.' });
    if (TYPES.indexOf(b.type) < 0) return out_({ ok: false, message: 'Please choose: independent artist, salon or studio.' });
    if (AREAS.indexOf(b.area) < 0) return out_({ ok: false, message: 'Please choose your area from the list.' });
    if (TRAVEL.indexOf(b.travel) < 0) return out_({ ok: false, message: 'Please choose where you work.' });
    if (b.consent !== true) return out_({ ok: false, message: 'Please tick the box to agree to be listed.' });

    var pk = {}, n = 0;
    Object.keys(b.pk || {}).forEach(function (k) {
      var v = Math.round(Number(b.pk[k]));
      if (SERVICES.indexOf(k) > -1 && v >= 100 && v <= 500000) { pk[k] = v; n++; }
    });
    if (!n) return out_({ ok: false, message: 'Please add at least one service with a starting price of 100 or more.' });

    var wa = String(b.whatsapp || '').replace(/\D/g, '');
    if (wa.length === 10) wa = '91' + wa;
    if (wa && !/^91[6-9]\d{9}$/.test(wa)) return out_({ ok: false, message: 'Please check your WhatsApp number (10 digits).' });
    var ig = clip_(b.instagram, 40).replace(/^@/, '');
    if (ig && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) return out_({ ok: false, message: 'Please check your Instagram username.' });
    if (!wa && !ig) return out_({ ok: false, message: 'Please add your WhatsApp number or Instagram.' });
    var web = clip_(b.website, 200), fb = clip_(b.facebook, 200);
    if (web && !/^https?:\/\/[^\s.]+\.[^\s<>"]+$/i.test(web)) web = '';
    if (fb && !/^https?:\/\/(www\.|m\.)?(facebook|fb)\.com\/[^\s<>"]+$/i.test(fb)) fb = '';

    var shots = (b.photos || []).filter(function (p) { return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(String(p || '')) && String(p).length < 2700000; }).slice(0, 6);
    if (shots.length < 2) return out_({ ok: false, message: 'Please add at least 2 clear photos of your own work.' });

    var existing = rows_().filter(function (r) {
      return (ig && String(r.instagram).toLowerCase() === ig.toLowerCase()) || (wa && String(r.whatsapp) === wa);
    })[0];
    if (existing) return out_({ ok: true, id: String(existing.id), existed: true });

    var id = (business.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'artist') + '-' + Math.random().toString(36).slice(2, 6);
    var folder = folder_(), photos = [];
    shots.forEach(function (p, i) {
      var m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(p);
      var f = folder.createFile(Utilities.newBlob(Utilities.base64Decode(m[2]), 'image/' + m[1], id + '-' + (i + 1) + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1])));
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photos.push(f.getId());
    });

    var row = {
      id: id, created: new Date(), status: 'live', business: business, founder: founder, type: b.type, area: b.area, city: 'Bangalore',
      travel: b.travel, story: clip_(b.story, 320), services: JSON.stringify(pk), whatsapp: wa,
      show_whatsapp: b.show_whatsapp === true && wa ? 'yes' : 'no', instagram: ig, website: web, facebook: fb,
      photos: photos.join(','), consent: 'yes'
    };
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET).appendRow(COLS.map(function (c) { return row[c]; }));
    CacheService.getScriptCache().remove('list');
    try {
      MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'New SINGAAR artist: ' + business,
        business + ' (' + founder + ') - ' + b.area + '\nServices: ' + Object.keys(pk).join(', ') +
        '\nWhatsApp: ' + (wa || '-') + '   Instagram: ' + (ig || '-') +
        '\n\nIn the app: https://singaar.vercel.app/app/#/artist/l-' + id + '\nTo hide it, set status to hidden in the sheet.');
    } catch (err) {}
    return out_({ ok: true, id: id });
  } catch (err) {
    return out_({ ok: false, message: 'Something went wrong. Please try again.' });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}
