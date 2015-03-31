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
  var ret = '[' + text + ']: ';
  for (var fix in fixes) {
    var f = fixes[fix];
    if (fixes.hasOwnProperty(fix)) {
      text = text.replace(f.re, f.repl);
    }
  }
  return ret + text;
}

var spaces = /\s/;

function bePunctilious() {
  var rev = new Reviser();
  rev.ignoreElement = function(elem) {
    // Ignore text that starts with a space or has a hard return.
    if (elem.getType() == DocumentApp.ElementType.TEXT) {
      var txt = elem.getText();
      return (txt.substring(0, 1).match(spaces) || txt.indexOf('\n') >= 0);
    }
    return false;
  }
  rev.reviseText(runFixes);
}

function t() {
  Logger.log("t: " + runFixes("a -- b"));
}
