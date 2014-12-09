var locale = {};
var i18n_val = {};
function i18n(str) {
  if (i18n_val[str]) {
    return i18n_val[str].message;
  } else {
    console.log('missing i18n '+str);
  }
}

function setupI18n(callback) {
  var lang = getLang();
  i18n_val = locale[lang];
}

function getLang() {
  var lang = navigator.language || navigator.userLanguage;
  if (lang.length == 5) {
    // chrome 40+ uses lower case country code
    lang = lang.substr(0,3) + lang.substr(3,5).toUpperCase();
  }
  if (lang === '' || !(lang == 'en-US' || lang == 'zh-TW')) {
    lang = 'en-US';
  }
  lang = lang.replace('-', '_');
  return lang;
}
