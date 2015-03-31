var fixes = {
  'emdash': {
    desc: '"--" becomes — (em dash)',
    re: /--/g,
    repl: '—',
  },
  'emdash-nospaces': {
    desc: 'remove spaces around — (em dash)',
    re: / *— */g,
    repl: '—',
  },
  'emdash-spaces': {
    desc: 'require spaces around — (em dash)',
    re: / *— */g,
    repl: ' — ',
  },
  'endash': {
    desc: '"-" between numbers becomes — (en dash)',
    re: /([0-9] *)-( *[0-9])/g,
    repl: '$1–$2',
  },
  'endash-nospaces': {
    desc: 'remove spaces around — (en dash)',
    re: / *– */g,
    repl: '–',
  },
  'minus': {
    desc: '"-" before a number becomes − (math minus)',
    re: /- *([0-9])/g,
    repl: '−$1',
  },
  'minus-nospaces': {
    desc: 'remove spaces after − (math minus)',
    re: /− */g,
    repl: '−',
  },
  'hyphen-nospaces': {
    desc: 'remove spaces around - (hyphen)',
    re: / *- */g,
    repl: '-',
  },
  'extra-nospaces': {
    desc: 'remove extra spaces (two or more)',
    re: '/  +/',
    repl: ' ',
  },
}

for (var key in fixes) {
  var f = fixes[key];
  if (!f.hasOwnProperty('dflt')) {
    f.dflt = true;
  }
}

function showPreferences() {
  var dialog = HtmlService.createTemplateFromFile("PrefsDialog");

  var userPrefs = PropertiesService.getUserProperties();
  var defaults = {};

  for (var key in fixes) {
    defaults[key] = userPrefs.getProperty(key) || fixes[key].dflt;
  }

  var docPrefs = PropertiesService.getDocumentProperties();
  var prefs = {};

  for (var key in fixes) {
    prefs[key] = docPrefs.getProperty(key) || defaults[key];
  }

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
