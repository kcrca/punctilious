function onOpen() {
  DocumentApp.getUi()
    .createAddonMenu()
      .addItem('Punctiliousize', 'bePunctilious')
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

// These are document defaults that aren't specified in the attributes
// of the document body. Why? I don't know.
var defaultAttrs = {};
defaultAttrs[DocumentApp.Attribute.FONT_FAMILY] = "Arial";
defaultAttrs[DocumentApp.Attribute.FONT_SIZE] = 11;
defaultAttrs[DocumentApp.Attribute.FOREGROUND_COLOR] = "#0";

function fontFor(attrs, node, reviser) {
  var attrSets = [attrs, node.getAttributes(), DocumentApp.getActiveDocument().getBody().getAttributes(), defaultAttrs];
  for (var i in attrSets) {
    var a = attrSets[i];
    var font = a[DocumentApp.Attribute.FONT_FAMILY];
    if (font) {
      return font;
    }
  }
  alert("Iternal error: Could not find font family (should never happen");
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
