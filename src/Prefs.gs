var fixes = {};
var fixOrder = [];

// build fixes and fixOrder.
var orderedFixes = [
  {
    name: 'emdash',
    desc: '"--" becomes — (em dash)',
    re: /--/g,
    repl: '—',
  },
  {
    name: 'emdash-nospaces',
    desc: 'remove spaces around — (em dash)',
    re: / *— */g,
    repl: '—',
  },
  {
    name: 'emdash-spaces',
    desc: 'require spaces around — (em dash)',
    re: / *— */g,
    repl: ' — ',
    dflt: false,
  },
  {
    name: 'endash',
    desc: '"-" between numbers becomes — (en dash)',
    re: /([0-9] *)-( *[0-9])/g,
    repl: '$1–$2',
  },
  {
    name: 'endash-nospaces',
    desc: 'remove spaces around — (en dash)',
    re: / *– */g,
    repl: '–',
  },
  {
    name: 'minus',
    desc: '"-" before a number becomes − (math minus)',
    re: /- *([0-9])/g,
    repl: '−$1',
  },
  {
    name: 'minus-nospaces',
    desc: 'remove spaces after − (math minus)',
    re: /− */g,
    repl: '−',
  },
  {
    name: 'hyphen-nospaces',
    desc: 'remove spaces around - (hyphen)',
    re: / *- */g,
    repl: '-',
  },
  {
    name: 'extra-nospaces',
    desc: 'remove extra spaces (two or more)',
    re: '/  +/',
    repl: ' ',
  },
  {
    name: 'ignore-fonts',
    desc: 'Ignore text in fonts:',
  },
];

//  PropertiesService.getUserProperties().deleteAllProperties();
//  PropertiesService.getDocumentProperties().deleteAllProperties();
for (var i in orderedFixes) {
  var f = orderedFixes[i];
  f.pos = i;
  if (!f.hasOwnProperty('dflt')) {
    f.dflt = true;
  }
  fixes[f.name] = f;
  fixOrder.push(f.name);
}

function showemdash(prefix) {
  Logger.log(prefix + ": " + JSON.stringify(fixes['emdash'], null, 2));
}

var ignoredFonts = {
  name: "ignored-fonts",
  dflt: ["Consolas", "Courier", "Lucida Sans Typewriter"].sort(),
};

var exports = ["fixes", "ignoredFonts"];

function showPreferences() {
  var dialog = HtmlService.createTemplateFromFile("PrefsDialog");

  showemdash("showPreferences start");

  readProperties("dflt", PropertiesService.getUserProperties());
  readProperties("cur", PropertiesService.getDocumentProperties());

  showemdash("showPreferences end");
  DocumentApp.getUi().showModalDialog(dialog.evaluate(), "Preferences");
}

function unpackPrefs(prefs) {
  ignoredFonts = prefs["ignoredFonts"];
  fixes = prefs["fixes"];
}

function readProperties(field, props) {
  for (var name in fixes) {
    f = fixes[name];
    var v = props.getProperty(f.name);
    f[field] = v != undefined ? v == "true" : f.dflt;
  }
  fonts = props.getProperty(ignoredFonts.name);
  ignoredFonts[field] = fonts ? fonts.split(/, /) : ignoredFonts.dflt;
  Logger.log("readProperties('" + field + "', ...)\n" + JSON.stringify(fixes, null, 2));
}

function writeProperties(props) {
  for (var name in fixes) {
    props.setProperty(name, fixes[name].cur);
  }
  props.setProperty(ignoredFonts.name, ignoredFonts.cur.join(", "));
}

function savePreferences(prefs) {
  unpackPrefs(prefs);
  Logger.log("savePreferences: prefs = " + JSON.stringify(prefs, null, 2));
  writeProperties(PropertiesService.getDocumentProperties());
  showemdash("savePreferences");
}

function saveDefaults(prfs) {
  unpackPrefs(prefs);
  writeProperties(PropertiesService.geUserProperties());
}
