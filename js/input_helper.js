function InputHelper(app) {
  this.app = app;
  this.node = document.getElementById('inputHelper');
  this.nodeOffsetTop = 20;
  this.nodeOffsetLeft = 20;
  this.mouseDrag = false;

  this.closeButton = document.getElementById('inputHelperClose');

  this.colorHelperList = document.getElementById('colorHelperList');
  this.colorHelperBlink = document.getElementById('colorHelperBlink');
  this.colorHelperSend = document.getElementById('colorHelperSend');
  this.colorHelperSendMenu = document.getElementById('colorHelperSendMenu');
  this.colorHelperPreview = document.getElementById('colorHelperPreview');
  this.colorHelperPreviewFgShown = true;
  this.colorHelperFg = 7;
  this.colorHelperBg = 0;
  this.colorHelperIsBlink = false;
  this.blinkTimer = null;

  this.setupUi();
  this.symbols = new lib.Symbols(app);
  this.emoticons = new lib.Emoticons(app);
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

  $('#colorHelperSendMenuFore').text(i18n('colorHelperSendMenuFore'));
  $('#colorHelperSendMenuBack').text(i18n('colorHelperSendMenuBack'));
  $('#colorHelperSendMenuReset').text(i18n('colorHelperSendMenuReset'));
  this.colorHelperSend.addEventListener('click', function(e) {
    self.sendColorCommand();
  });
  this.colorHelperSendMenu.addEventListener('click', function(e) {
    if (!e.target.hasAttribute('type'))
      return;
    self.sendColorCommand(e.target.getAttribute('type'));
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

    var bg = parseInt(e.target.getAttribute('value'));
    if (bg > 7) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // right click, background
    self.colorHelperBg = bg;
    self.colorHelperPreview.setAttribute('class', 'q'+self.colorHelperFg+' b'+self.colorHelperBg);
    e.preventDefault();
    e.stopPropagation();
  });

  this.node.addEventListener('mousedown', function(e) {
    self.mouseDrag = true;
    self.app.view.mainDisplay.style.webkitUserSelect = 'none';
  });
  this.node.addEventListener('mouseup', function(e) {
    self.mouseDrag = false;
    self.app.view.mainDisplay.style.webkitUserSelect = '';
  });

  this.node.addEventListener('click', function(e) {
  });
};

InputHelper.prototype.onMouseDrag = function(e) {
  this.nodeOffsetTop += e.webkitMovementY;
  this.nodeOffsetLeft += e.webkitMovementX;
  this.node.style.cssText += 'top:'+this.nodeOffsetTop+'px;left:'+this.nodeOffsetLeft+'px;';
};

InputHelper.prototype.sendColorCommand = function(type) {
  if (type == 'reset') {
    this.app.telnetCore.send('\x15[m');
    return;
  }

  var fg = this.colorHelperFg;
  var lightColor = '0;';
  if (fg > 7) {
    fg %= 8;
    lightColor = '1;';
  }
  fg += 30;
  var bg = this.colorHelperBg;
  bg += 40;
  var isBlink = this.colorHelperIsBlink;
  var blink = '';
  if (isBlink) {
    blink = '5;';
  }
  var cmd = '\x15[';
  if (type == 'foreground') {
    cmd += lightColor+blink+fg+'m';
  } else if (type == 'background') {
    cmd += bg+'m';
  } else {
    cmd += lightColor+blink+fg+';'+bg+'m';
  }

  if (!window.getSelection().isCollapsed && this.app.buf.pageState == 6) {
    // something selected
    var sel = this.app.view.getSelectionColRow();
    var y = this.app.buf.cur_y;
    var selCmd = '';
    // move cursor to end and send reset code
    selCmd += '\x1b[H';
    if (y > sel.end.row) {
      selCmd += '\x1b[A'.repeat(y - sel.end.row);
    } else if (y < sel.end.row) {
      selCmd += '\x1b[B'.repeat(sel.end.row - y);
    }
    var repeats = this.app.buf.getRowText(sel.end.row, 0, sel.end.col+1).length;
    selCmd += '\x1b[C'.repeat(repeats) + '\x15[m';

    // move cursor to start and send color code
    y = sel.end.row;
    selCmd += '\x1b[H';
    if (y > sel.start.row) {
      selCmd += '\x1b[A'.repeat(y - sel.start.row);
    } else if (y < sel.start.row) {
      selCmd += '\x1b[B'.repeat(sel.start.row - y);
    }
    repeats = this.app.buf.getRowText(sel.start.row, 0, sel.start.col).length;
    selCmd += '\x1b[C'.repeat(repeats);
    cmd = selCmd + cmd;
  }
  this.app.telnetCore.send(cmd);
};

InputHelper.prototype.showHelper = function() {
  this.node.style.display = 'block';
};

InputHelper.prototype.hideHelper = function() {
  this.node.style.display = 'none';
};
