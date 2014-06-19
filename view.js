document.addEventListener('DOMContentLoaded', function () {
  var webv = document.getElementById('app');
  document.onkeyup = function(e) {
    if (e.keyCode == 116) // F5
      webv.reload();
  };
});
