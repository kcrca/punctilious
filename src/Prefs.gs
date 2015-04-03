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

for (var i in orderedFixes) {
  var f = orderedFixes[i];
  f.pos = i;
  if (!f.hasOwnProperty('dflt')) {
    f.dflt = true;
  }
  fixes[f.name] = f;
  fixOrder.push(f.name);
}

var ignoredFonts = {
  name: "ignored-fonts",
  dflt: ["Consolas", "Courier", "Lucida Sans Typewriter"].sort(),
};

var exports = ["fixes", "ignoredFonts"];

function showPreferences() {
  var dialog = HtmlService.createTemplateFromFile("PrefsDialog");

  var userPrefs = PropertiesService.getUserProperties();

  for (var name in fixes) {
    f = fixes[name];
    f.dflt = userPrefs.getProperty(f.name) || f.dflt;
  }
  ignoredFonts.dflt = userPrefs.getProperty(ignoredFonts.name) || ignoredFonts.dflt;

  var docPrefs = PropertiesService.getDocumentProperties();

  for (var name in fixes) {
    f = fixes[name];
    f.cur = docPrefs.getProperty(f.name) || f.dflt;
  }
  ignoredFonts.cur = userPrefs.getProperty(ignoredFonts.name) || ignoredFonts.dflt;

  DocumentApp.getUi().showModalDialog(dialog.evaluate(), "Preferences");
}

function unpackPrefs(prefs) {
  ignoredFonts = prefs["ignoredFonts"];
  fixes = prefs["fixes"];
}

function savePreferences(prefs) {
  unpackPrefs(prefs);
  Logger.log("savePreferences: prefs = " + JSON.stringify(prefs, null, 2));
  PropertiesService.getDocumentProperties().setProperties(prefs);
}

function saveDefaults(prfs) {
  unpackPrefs(prefs);
  PropertiesService.getUserProperties().setProperties(prefs);
}
