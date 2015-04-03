function onOpen() {
  DocumentApp.getUi()
    .createAddonMenu()
      .addItem('Punctiliousicize', 'bePunctilious')
      .addItem('Preferences...', 'showPreferences')
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function runFixes(text) {
  for (var fix in fixes) {
    var f = fixes[fix];
    if (fixes.hasOwnProperty(fix)) {
      text = text.replace(f.re, f.repl);
    }
  }
  return text;
}

function bePunctilious() {
  new Reviser().reviseText(runFixes);
}