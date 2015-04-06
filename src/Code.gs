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

function ignoreText(attrs, node, reviser) {
  var f = fixes['ignore-fonts'];
  if (!f.cur || ignoredFonts.cur.length == 0) {
    return false;
  }
  if (!f.fontRE) {
    var regexps = [];
    for (var i in ignoredFonts.cur) {
      name = ignoredFonts.cur[i];
      regexps.push(name.replace(/ /g, "[ .-_]?"));
    }
    f.fontRE = new RegExp("^(" + regexps.join("|") + ")$");
  }
  var font = fontFor(attrs, node, reviser);
  return font.match(f.fontRE);
}

function fontFor(attrs, node, reviser) {
  var attrSets = [attrs, node.getAttributes(), DocumentApp.getActiveDocument().getBody().getAttributes()];
  for (var i in attrSets) {
    var a = attrSets[i];
    var font = attrs[DocumentApp.Attribute.FONT_FAMILY]
    if (font) {
      return font;
    }
  }
  // The default doc font is Arial 11. Body should tell me this instead of me just "knowing" it,
  // but it doesn't.
  return "Arial";
}

function runFixes(text, attrs, node, start, end, reviser) {
  if (ignoreText(attrs, node, reviser)) {
    return text;
  }

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
