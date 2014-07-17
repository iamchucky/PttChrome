function InputHelper(app) {
  this.app = app;
  this.node = document.getElementById('inputHelper');
  this.nodeOffsetTop = 20;
  this.nodeOffsetLeft = 20;

  this.closeButton = document.getElementById('inputHelperClose');

  this.colorHelperList = document.getElementById('colorHelperList');
  this.colorHelperBlink = document.getElementById('colorHelperBlink');
  this.colorHelperSend = document.getElementById('colorHelperSend');
  this.colorHelperPreview = document.getElementById('colorHelperPreview');
  this.colorHelperPreviewFgShown = true;
  this.colorHelperFg = 7;
  this.colorHelperBg = 0;
  this.colorHelperIsBlink = false;
  this.blinkTimer = null;

  this.symbols = new lib.Symbols(app);
  this.setupUi();
}

InputHelper.prototype.setupUi = function() {
  var self = this;
  var modalTitle = document.querySelector('#inputHelper .modal-title');
  modalTitle.textContent = i18n('inputHelperTitle');
  this.colorHelperSend.textContent = i18n('colorHelperSend');
  this.colorHelperBlink.innerHTML = '<label><input id="colorHelperBlinkCheckbox" type="checkbox">'+i18n('colorHelperBlink')+'</label>';
  this.colorHelperBlinkCheckbox = document.getElementById('colorHelperBlinkCheckbox');
  this.colorHelperBlink.addEventListener('click', function(e) {
    var checked = self.colorHelperBlinkCheckbox.checked;
    if (checked != self.colorHelperIsBlink) {
      self.colorHelperIsBlink = checked;
      if (checked) {
        self.blinkTimer = setTimer(true, function() {
          if (self.colorHelperPreviewFgShown) {
            self.colorHelperPreview.style.color = 'transparent';
          } else {
            self.colorHelperPreview.style.color = '';
          }
          self.colorHelperPreviewFgShown = !self.colorHelperPreviewFgShown;
        }, 1000);
      } else {
        self.blinkTimer.cancel();
        self.blinkTimer = null;
        self.colorHelperPreview.style.color = '';
        self.colorHelperPreviewFgShown = true;
      }
    }
    e.stopPropagation();
  });
  this.colorHelperPreview.textContent = i18n('colorHelperPreview');
  var tooltipHtml = '<div>'+i18n('colorHelperTooltip1')+'</div><div>'+i18n('colorHelperTooltip2')+'</div>'
  $(this.colorHelperList).tooltip({html:true, title:tooltipHtml});

  this.closeButton.addEventListener('click', function(e) {
    self.hideHelper();
  });
  this.colorHelperSend.addEventListener('click', function(e) {
  });
  this.colorHelperList.addEventListener('click', function(e) {
    if (!e.target.hasAttribute('value'))
      return;

    if (e.which == 1) { // left click, foreground
      self.colorHelperFg = parseInt(e.target.getAttribute('value'));
      self.colorHelperPreview.setAttribute('class', 'q'+self.colorHelperFg+' b'+self.colorHelperBg);
    }
    e.preventDefault();
    e.stopPropagation();
  });
  this.colorHelperList.addEventListener('contextmenu', function(e) {
    if (!e.target.hasAttribute('value'))
      return;

    // right click, background
    self.colorHelperBg = parseInt(e.target.getAttribute('value'));
    self.colorHelperPreview.setAttribute('class', 'q'+self.colorHelperFg+' b'+self.colorHelperBg);
    e.preventDefault();
    e.stopPropagation();
  });

  this.node.addEventListener('mousemove', function(e) {
    if (e.which == 1) {
      self.nodeOffsetTop += e.webkitMovementY;
      self.nodeOffsetLeft += e.webkitMovementX;
      self.node.style.cssText += 'top:'+self.nodeOffsetTop+'px;left:'+self.nodeOffsetLeft+'px;';
    }
  });
  this.node.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
  });
};

InputHelper.prototype.showHelper = function() {
  this.node.style.display = 'block';
};

InputHelper.prototype.hideHelper = function() {
  this.node.style.display = 'none';
};
