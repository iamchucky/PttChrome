function InputHelper(app) {
  this.app = app;
  this.node = document.getElementById('inputHelper');
  this.nodeOffsetTop = 20;
  this.nodeOffsetLeft = 20;
  this.mouseDown = false;
  this.clickedOn = false;

  this.colorHelperBlinkCheckbox = null;
  this.colorHelperPreview = null;
  this.colorHelperPreviewFgShown = true;
  this.colorHelperFg = 7;
  this.colorHelperBg = 0;
  this.colorHelperIsBlink = false;
  this.blinkTimer = null;

  this.symbols = null;
  this.emoticons = null;
  this.setupUi();
  this.registerHandlers();
}

InputHelper.prototype.setupUi = function() {
  var self = this;
  var modalTitle = document.querySelector('#inputHelper .modal-title');
  modalTitle.textContent = i18n('inputHelperTitle');
  document.getElementById('colorHelperSend').textContent = i18n('colorHelperSend');
  document.getElementById('colorHelperBlink').innerHTML = '<label><input id="colorHelperBlinkCheckbox" type="checkbox">'+i18n('colorHelperBlink')+'</label>';
  document.getElementById('colorHelperPreview').textContent = i18n('colorHelperPreview');

  document.getElementById('inputHelperClose').addEventListener('click', function(e) {
    self.hideHelper();
  });

  document.querySelector('#colorsTabTitle a').textContent = i18n('colorTitle');
  $('#colorHelperSendMenuFore').text(i18n('colorHelperSendMenuFore'));
  $('#colorHelperSendMenuBack').text(i18n('colorHelperSendMenuBack'));
  $('#colorHelperSendMenuReset').text(i18n('colorHelperSendMenuReset'));

  this.symbols = new lib.Symbols(this.app);
  this.emoticons = new lib.Emoticons(this.app);
};

InputHelper.prototype.onMouseDrag = function(e) {
  window.getSelection().removeAllRanges();
  this.nodeOffsetTop += e.movementY;
  this.nodeOffsetLeft += e.movementX;
  this.node.style.cssText += 'top:'+this.nodeOffsetTop+'px;left:'+this.nodeOffsetLeft+'px;';
};

InputHelper.prototype.registerHandlers = function() {
  var self = this;
  var colorHelperList = document.getElementById('colorHelperList');
  var tooltipHtml = '<div>'+i18n('colorHelperTooltip1')+'</div><div>'+i18n('colorHelperTooltip2')+'</div>';
  $(colorHelperList).tooltip({html:true, title:tooltipHtml});

  this.colorHelperBlinkCheckbox = document.getElementById('colorHelperBlinkCheckbox');
  this.colorHelperPreview = document.getElementById('colorHelperPreview');
  document.getElementById('colorHelperBlink').addEventListener('click', function(e) {
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
  document.getElementById('colorHelperSend').addEventListener('click', function(e) {
    self.sendColorCommand();
  });
  document.getElementById('colorHelperSendMenu').addEventListener('click', function(e) {
    if (!e.target.hasAttribute('type'))
      return;
    self.sendColorCommand(e.target.getAttribute('type'));
  });

  colorHelperList.addEventListener('click', function(e) {
    if (!e.target.hasAttribute('value'))
      return;

    if (e.which == 1) { // left click, foreground
      self.colorHelperFg = parseInt(e.target.getAttribute('value'));
      self.colorHelperPreview.setAttribute('class', 'q'+self.colorHelperFg+' b'+self.colorHelperBg);
    }
    e.preventDefault();
    e.stopPropagation();
  });
  colorHelperList.addEventListener('contextmenu', function(e) {
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
    if (e.which == 1)
      self.mouseDown = true;
  });
  this.node.addEventListener('mouseup', function(e) {
    if (e.which == 1)
      self.mouseDown = false;
  });

  this.node.addEventListener('click', function(e) {
    self.clickedOn = true;
  });

  this.symbols.registerHandlers();
  this.emoticons.registerHandlers();
};

InputHelper.prototype.sendColorCommand = function(type) {
  if (type == 'reset') {
    this.app.conn.send('\x15[m');
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
  this.app.conn.send(cmd);
};

InputHelper.prototype.showHelper = function() {
  this.node.style.display = 'block';
};

InputHelper.prototype.hideHelper = function() {
  this.node.style.display = 'none';
};
