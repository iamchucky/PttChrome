var copyFrom = null;
var doCopy = function(str) {
  if (!copyFrom)
    return;

  copyFrom.focus();
  copyFrom.value = str;
  copyFrom.select();
  document.execCommand('copy');
};
document.addEventListener('DOMContentLoaded', function () {
  copyFrom = document.getElementById('copyFrom');
});

var openWindow = function(url) {
  window.open(url);
};
