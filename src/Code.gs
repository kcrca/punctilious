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
  for (var name in fixes) {
    f = fixes[name];
    if (f.re) {
      text = text.replace(f.re, f.repl);
    }
  }
  return text;
}

function bePunctilious() {
  new Reviser().reviseText(runFixes);
}