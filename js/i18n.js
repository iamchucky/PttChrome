var locale = {};
var i18n_val = {};
function i18n(str) {
  return i18n_val[str].message;
}

function setupI18n(callback) {
  var lang = navigator.language || navigator.userLanguage;
  if (lang === '' || !(lang == 'en-US' || lang == 'zh-TW')) {
    lang = 'en-US';
  }
  lang = lang.replace('-', '_');
  i18n_val = locale[lang];
}
