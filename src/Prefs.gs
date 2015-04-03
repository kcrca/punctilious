var fixes = [
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
]

var fixesByName = {};

for (var key in fixes) {
  var f = fixes[key];
  if (!f.hasOwnProperty('dflt')) {
    f.dflt = true;
  }
  f.enabled = f.dflt;
  fixesByName[f.name] = f;
}

var ignoredFonts = ["Consolas", "Courier", "Lucida Sans Typewriter"];
var ignoredFontsName = "ignorable-fonts";

var exports = ["fixesByName", "ignoredFonts", "ignoredFontsName"];

function showPreferences() {
  var dialog = HtmlService.createTemplateFromFile("PrefsDialog");

  var userPrefs = PropertiesService.getUserProperties();
  var defaults = {};

  for (var i = 0; i < fixes.length; i++) {
    f = fixes[i];
    defaults[f.name] = userPrefs.getProperty(f.name) || f.dflt;
  }
  var ignFontsKey = "ignore-fonts-which";
  defaults[ignFontsKey] = userPrefs.getProperty(ignFontsKey) || "Consolas, Courier, Lucida Sans Typewriter";

  var docPrefs = PropertiesService.getDocumentProperties();
  var prefs = [];

  for (var i = 0; i < fixes.length; i++) {
    f = fixes[i];
    prefs[f.name] = docPrefs.getProperty(f.name) || defaults[f.name];
  }
  prefs[ignFontsKey] = docPrefs.getProperty(ignFontsKey) || defaults[ignFontsKey];

  dialog.defaults = defaults;
  dialog.prefs = prefs;

  DocumentApp.getUi().showModalDialog(dialog.evaluate(), "Preferences");
}

function savePreferences(form) {
  PropertiesService.getDocumentProperties().setProperties(form);
}

function saveDefaults(form) {
  PropertiesService.getUserProperties().setProperties(form);
}
