// Main Program

var pttchrome = {};

pttchrome.App = function(onInitializedCallback) {

  this.CmdHandler = document.getElementById('cmdHandler');
  this.CmdHandler.setAttribute('useMouseBrowsing', '1');
  this.CmdHandler.setAttribute('doDOMMouseScroll','0');
  //this.CmdHandler.setAttribute('useMouseUpDown', '0');
  //this.CmdHandler.setAttribute('useMouseSwitchPage', '0');
  //this.CmdHandler.setAttribute("useMouseReadThread", '0');
  this.CmdHandler.setAttribute('useTextDragAndDrop', '0');
  this.CmdHandler.setAttribute('webContextMenu', '1');
  this.CmdHandler.setAttribute('SavePageMenu', '1');
  this.CmdHandler.setAttribute('EmbeddedPlayerMenu', '1');
  this.CmdHandler.setAttribute('PreviewPictureMenu', '0');
  this.CmdHandler.setAttribute('PushThreadMenu', '0');
  this.CmdHandler.setAttribute('OpenAllLinkMenu', '0');
  this.CmdHandler.setAttribute("MouseBrowseMenu", '0');
  this.CmdHandler.setAttribute('FileIoMenu', '0');
  this.CmdHandler.setAttribute('ScreenKeyboardMenu', '1');
  this.CmdHandler.setAttribute('ScreenKeyboardOpened', '0');
  this.CmdHandler.setAttribute('DragingWindow', '0');
  this.CmdHandler.setAttribute('MaxZIndex', 11);
  this.CmdHandler.setAttribute('allowDrag','0');
  this.CmdHandler.setAttribute('haveLink','0');
  //this.CmdHandler.setAttribute('onLink','0');
  //this.CmdHandler.setAttribute('onPicLink','0');
  this.CmdHandler.setAttribute('draging','0');
  this.CmdHandler.setAttribute('textSelected','0');
  this.CmdHandler.setAttribute('dragType','');
  this.CmdHandler.setAttribute('LastPicAddr', '0');
  this.CmdHandler.setAttribute('isMouseRightBtnDrag','0');

  this.CmdHandler.setAttribute('hideBookMarkLink','1');
  this.CmdHandler.setAttribute('hideSendLink','1');
  this.CmdHandler.setAttribute('hideBookMarkPage','1');
  this.CmdHandler.setAttribute('hideSendPage','1');
  this.CmdHandler.setAttribute('hideViewInfo','1');
  this.CmdHandler.setAttribute('SkipMouseClick','0');
  this.pref = null;

  this.telnetCore = new TelnetCore(this);
  this.view = new TermView(24);
  this.buf = new TermBuf(80, 24);
  this.buf.setView(this.view);
  //this.buf.severNotifyStr=this.getLM('messageNotify');
  //this.buf.PTTZSTR1=this.getLM('PTTZArea1');
  //this.buf.PTTZSTR2=this.getLM('PTTZArea2');
  this.view.setBuf(this.buf);
  this.view.setConn(this.telnetCore);
  this.view.setCore(this);
  this.parser = new lib.AnsiParser(this.buf);

  //new pref - start
  this.antiIdleStr = '^[[A^[[B';
  this.antiIdleTime = 0;
  this.idleTime = 0;
  //new pref - end
  this.connectState = 0;

  this.inputArea = document.getElementById('t');
  this.BBSWin = document.getElementById('BBSWindow');

  // horizontally center bbs window
  this.BBSWin.setAttribute("align", "center");
  this.view.mainDisplay.style.transformOrigin = 'center';

  this.mouseLeftButtonDown = false;
  this.mouseRightButtonDown = false;

  this.inputAreaFocusTimer = null;
  this.alertBeforeUnload = false;
  this.modalShown = false;

  var self = this;
  this.CmdHandler.addEventListener("OverlayCommand", function(e) {
    self.overlayCommandListener(e);
  }, false);

  window.addEventListener('click', function(e) {
    self.mouse_click(e);
  }, false);

  window.addEventListener('mousedown', function(e) {
    self.mouse_down(e);
  }, false);

  window.addEventListener('mouseup', function(e) {
    self.mouse_up(e);
  }, false);

  document.addEventListener('mousemove', function(e) {
    self.mouse_move(e);
  }, false);

  document.addEventListener('mouseover', function(e) {
    self.mouse_over(e);
  }, false);

  document.addEventListener('mousewheel', function(e) {
    self.mouse_scroll(e);
  }, true);

  window.addEventListener('contextmenu', function(e) {
    self.context_menu(e);
  }, false);

  this.menuHandler = {};
  chrome.contextMenus.onClicked.addListener(function(onClickData, tab) {
    pttchrome.app.menuHandler[onClickData.menuItemId]();
  });

  this.view.fontResize();
  this.view.updateCursorPos();
  this.dblclickTimer=null;
  this.mbTimer=null;
  this.timerEverySec=null;

  this.setupConnectionAlert();
  this.setupOtherSiteInput();
  this.pref = new PttChromePref(this, function() {
    self.resetMenuItems();
    onInitializedCallback();
  })

};

pttchrome.App.prototype.connect = function(url) {
  dumpLog(DUMP_TYPE_LOG, "connect to " + url);
  document.title = url;
  var splits = url.split(/:/g);
  var port = 23;
  if (splits.length == 2) {
    url = splits[0];
    port = parseInt(splits[1]);
  }
  this.telnetCore.connect(url, port);
};

pttchrome.App.prototype.onConnect = function() {
  dumpLog(DUMP_TYPE_LOG, "pttchrome onConnect");
  this.connectState = 1;
  this.updateTabIcon('connect');
  this.idleTime = 0;
  var self = this;
  this.timerEverySec = setTimer(true, function() {
    self.antiIdle();
    self.view.onBlink();
  }, 1000);
};

pttchrome.App.prototype.onData = function(data) {
//dumpLog(DUMP_TYPE_LOG, "pttchrome onData");
  this.parser.feed(data);
};

pttchrome.App.prototype.onClose = function() {
  dumpLog(DUMP_TYPE_LOG, "pttchrome onClose");
  this.timerEverySec.cancel();

  this.cancelMbTimer();
  this.unregExitAlert();

  this.connectState = 2;
  this.idleTime = 0;

  $('#connectionAlert').show();
  this.updateTabIcon('disconnect');
};

pttchrome.App.prototype.sendData = function(str) {
  if (this.connectState == 1)
    this.telnetCore.convSend(str, this.view.charset);
};

pttchrome.App.prototype.sendCmdData = function(str) {
  if (this.connectState == 1)
    this.telnetCore.send(str);
};

pttchrome.App.prototype.cancelMbTimer = function() {
  if (this.mbTimer) {
    this.mbTimer.cancel();
    this.mbTimer = null;
  }
};

pttchrome.App.prototype.setMbTimer = function() {
  this.cancelMbTimer();
  var _this = this;
  this.mbTimer = setTimer(false, function() {
    _this.mbTimer.cancel();
    _this.mbTimer = null;
    _this.CmdHandler.setAttribute('SkipMouseClick', '0');
  }, 100);
};

pttchrome.App.prototype.cancelDblclickTimer = function() {
  if (this.dblclickTimer) {
    this.dblclickTimer.cancel();
    this.dblclickTimer = null;
  }
};

pttchrome.App.prototype.setDblclickTimer = function() {
  this.cancelDblclickTimer();
  var _this = this;
  this.dblclickTimer = setTimer(false, function() {
    _this.dblclickTimer.cancel();
    _this.dblclickTimer = null;
  }, 350);
};

pttchrome.App.prototype.setInputAreaFocus = function() {
  //this.DocInputArea.disabled="";
  this.inputArea.focus();
};

pttchrome.App.prototype.setupConnectionAlert = function() {
  $('#connectionAlertReconnect').empty();
  $('#connectionAlertExitAll').empty();
  $('#connectionAlertHeader').text(i18n('alert_connectionHeader'));
  $('#connectionAlertText').text(i18n('alert_connectionText'));
  $('#connectionAlertReconnect').text(i18n('alert_connectionReconnect'));
  $('#connectionAlertExitAll').text(i18n('alert_connectionExitAll'));

  var self = this;
  $('#connectionAlertReconnect').click(function(e) {
    self.connect(document.title);
    $('#connectionAlert').hide();
  });
  $('#connectionAlertExitAll').click(function(e) {
    chrome.app.window.current().close();
  });
};

pttchrome.App.prototype.setupOtherSiteInput = function() {
  var self = this;
  $('#siteModal input').attr('placeholder', i18n('input_sitePlaceholder'));
  $('#siteModal input').keyup(function(e) {
    if (e.keyCode == 13) {
      var url = $(this).val();
      if (self.telnetCore.socket && self.telnetCore.socket.isConnected) {
        self.telnetCore.socket.disconnect();
        self.telnetCore.onDisconnect();
      }
      self.connect(url);
      $('#siteModal').modal('hide');
    }
  });
  $('#siteModal').on('shown.bs.modal', function(e) {
    $('#connectionAlert').hide();
    self.modalShown = true;
    $('#siteModal input').val('');
    $('#siteModal input').focus();
  });
  $('#siteModal').on('hidden.bs.modal', function(e) {
    $('#connectionAlert').hide();
    self.modalShown = false;
  });

};

pttchrome.App.prototype.doSearchGoogle = function() {
  var searchTerm = window.getSelection().toString();
  window.open('http://google.com/search?q='+searchTerm);
};

pttchrome.App.prototype.doPaste = function() {
  if (this.modalShown)
    return;
  this.pasting = true;
  this.setInputAreaFocus();
  document.execCommand("paste", false, null);
  this.pasting = false;
};

pttchrome.App.prototype.doSelectAll = function() {
  //var allspans = document.getElementById("main");
  window.getSelection().selectAllChildren(this.view.mainDisplay);
};

pttchrome.App.prototype.doGoToOtherSite = function() {
  $('#siteModal').modal('show');
};

pttchrome.App.prototype.doPreferences = function() {
  $('#prefModal').modal('show');
};

pttchrome.App.prototype.doRestartInTab = function() {
  window.open('http://iamchucky.github.io/PttChrome/');
  chrome.app.window.current().close();
};

pttchrome.App.prototype.switchMouseBrowsing = function() {
  if (this.CmdHandler.getAttribute('useMouseBrowsing')=='1') {
    this.CmdHandler.setAttribute('useMouseBrowsing', '0');
    this.buf.useMouseBrowsing=false;
  } else {
    this.CmdHandler.setAttribute('useMouseBrowsing', '1');
    this.buf.useMouseBrowsing=true;
  }

  if (!this.buf.useMouseBrowsing) {
    this.buf.BBSWin.style.cursor = 'auto';
    this.buf.clearHighlight();
    this.buf.mouseCursor=0;
    this.buf.nowHighlight=-1;
    this.buf.tempMouseCol=0;
    this.buf.tempMouseRow=0;
  } else {
    this.buf.SetPageState();
    this.buf.resetMousePos();
    this.view.redraw(true);
    this.view.updateCursorPos();
  }
  //this.view.showAlertMessage(document.title, this.buf.useMouseBrowsing?this.getLM('mouseBrowseOn'):this.getLM('mouseBrowseOff'));
};

pttchrome.App.prototype.antiIdle = function() {
  if (this.antiIdleTime && this.idleTime > this.antiIdleTime) {
    if (this.antiIdleStr!='' && this.connectState==1)
      this.telnetCore.send(this.antiIdleStr);
  } else {
    if (this.connectState==1)
      this.idleTime+=1000;
  }
};

pttchrome.App.prototype.updateTabIcon = function(aStatus) {
  var icon = 'icon/logo.png';
  switch (aStatus) {
    case 'connect':
      icon =  'icon/connect.png';
      this.setInputAreaFocus();
      break;
    case 'disconnect':
  dumpLog(DUMP_TYPE_LOG, "icon/disconnect.png");
      icon =  'icon/disconnect.png';
      break;
    case 'newmessage':  // Not used yet
      icon =  'icon/connect.png';
      break;
    case 'connecting':  // Not used yet
      icon =  'icon/connecting.gif';
    default:
  }

  var link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.setAttribute("href", icon);
    document.head.appendChild(link);
  } else {
    link.setAttribute("href", icon);
  }
};

// use this method to get better window size in case of page zoom != 100%
pttchrome.App.prototype.getWindowInnerBounds = function() {
  var win = chrome.app.window.current();
  var bounds = null;
  if (win.isFullscreen())
    bounds = chrome.app.window.current().outerBounds;
  else {
    bounds = chrome.app.window.current().innerBounds;
    if (win.isMaximized()) {
      bounds = {
        width: bounds.width,
        height: bounds.height - 14
      };
    }
  }
  return bounds;
};

pttchrome.App.prototype.clientToPos = function(cX, cY) {
  var x;
  var w = this.getWindowInnerBounds().width;
  if (this.view.horizontalAlignCenter && this.view.scaleX != 1)
    x = cX - ((w - (this.view.chw * this.buf.cols) * this.view.scaleX) / 2);
  else
    x = cX - parseFloat(this.view.firstGrid.offsetLeft);
  var y = cY - parseFloat(this.view.firstGrid.offsetTop);
  var col = Math.floor(x / (this.view.chw * this.view.scaleX));
  var row = Math.floor(y / this.view.chh);

  if (row < 0)
    row = 0;
  else if (row >= this.buf.rows-1)
    row = this.buf.rows-1;

  if (col < 0)
    col = 0;
  else if (col >= this.buf.cols-1)
    col = this.buf.cols-1;

  return {col: col, row: row};
};

pttchrome.App.prototype.onMouse_click = function (cX, cY) {
  switch (this.buf.mouseCursor) {
    case 1:
      this.telnetCore.send('\x1b[D');  //Arrow Left
      break;
    case 2:
      this.telnetCore.send('\x1b[5~'); //Page Up
      break;
    case 3:
      this.telnetCore.send('\x1b[6~'); //Page Down
      break;
    case 4:
      this.telnetCore.send('\x1b[1~'); //Home
      break;
    case 5:
      this.telnetCore.send('\x1b[4~'); //End
      break;
    case 6:
      if (this.buf.nowHighlight != -1) {
        var sendstr = '';
        if (this.buf.cur_y > this.buf.nowHighlight) {
          var count = this.buf.cur_y - this.buf.nowHighlight;
          for (var i = 0; i < count; ++i)
            sendstr += '\x1b[A'; //Arrow Up
        } else if (this.buf.cur_y < this.buf.nowHighlight) {
          var count = this.buf.nowHighlight - this.buf.cur_y;
          for (var i = 0; i < count; ++i)
            sendstr += '\x1b[B'; //Arrow Down
        }
        sendstr += '\r';
        this.telnetCore.send(sendstr);
      }
      break;
    case 7:
      var pos = this.clientToPos(cX, cY);
      var sendstr = '';
      if (this.buf.cur_y > pos.row) {
        var count = this.buf.cur_y - pos.row;
        for (var i = 0; i < count; ++i)
          sendstr += '\x1b[A'; //Arrow Up
      } else if (this.buf.cur_y < pos.row) {
        var count = pos.row - this.buf.cur_y;
        for (var i = 0; i < count; ++i)
          sendstr += '\x1b[B'; //Arrow Down
      }
      sendstr += '\r';
      this.telnetCore.send(sendstr);
      break;
    case 0:
      this.telnetCore.send('\x1b[D'); //Arrow Left
      break;
    case 8:
      this.telnetCore.send('['); //Previous post with the same title
      break;
    case 9:
      this.telnetCore.send(']'); //Next post with the same title
      break;
    case 10:
      this.telnetCore.send('='); //First post with the same title
      break;
    case 12:
      this.telnetCore.send('\x1b[D\r\x1b[4~'); //Refresh post / pushed texts
      break;
    case 13:
      this.telnetCore.send('\x1b[D\r\x1b[4~[]'); //Last post with the same title (LIST)
      break;
    case 14:
      this.telnetCore.send('\x1b[D\x1b[4~[]\r'); //Last post with the same title (READING)
      break;
    default:
      //do nothing
      break;
  }
};

pttchrome.App.prototype.overlayCommandListener = function (e) {
  var elm = e.target;
  var cmd = elm.getAttribute("pttChromeCommand");
  dumpLog(DUMP_TYPE_LOG, cmd);
  if (elm) {
    if (elm.id == 'cmdHandler') {
      switch (cmd) {
        case "doArrowUp":
          this.telnetCore.send('\x1b[A');
          break;
        case "doArrowDown":
          this.telnetCore.send('\x1b[B');
          break;
        case "doPageUp":
          this.telnetCore.send('\x1b[5~');
          break;
        case "doPageDown":
          this.telnetCore.send('\x1b[6~');
          break;
        case "prevousThread":
          this.buf.SetPageState();
          if (this.buf.PageState==2 || this.buf.PageState==3 || this.buf.PageState==4) {
            this.telnetCore.send('[');
          }
          break;
        case "nextThread":
          this.buf.SetPageState();
          if (this.buf.PageState==2 || this.buf.PageState==3 || this.buf.PageState==4) {
            this.telnetCore.send(']');
          }
          break;
        case "reloadTabIconDelay":
          this.doReloadTabIcon(100);
          break;
        case "reloadTabIcon":
          //alert('reloadTabIcon');
          this.reloadTabIcon();
          break;
        case "doAddTrack":
          this.doAddTrack();
          break;
        case "doDelTrack":
          this.doDelTrack();
          break;
        case "doClearTrack":
          this.doClearTrack();
          break;
        case "openSymbolInput":
          if (this.symbolinput) {
            this.symbolinput.setCore(this);
            this.symbolinput.displayWindow();
          }
          break;
        case "doSavePage":
          this.doSavePage();
          break;
        case "doCopyHtml":
          this.doCopyHtml();
          break;
        case "doSelectAll":
          this.doSelectAll();
          break;
        case "doCopy":
          this.doCopySelect();
          break;
        case "doPaste":
          this.doPaste();
          break;
        case "doOpenAllLink":
          this.doOpenAllLink();
          break;
        //case "doLoadUserSetting":
        //  this.doLoadUserSetting();
        //  break;
        case "switchMouseBrowsing":
          this.switchMouseBrowsing();
          break;
        case "openYoutubeWindow":
          var param = elm.getAttribute("YoutubeURL");
          elm.removeAttribute("YoutubeURL");
          if (this.playerMgr)
            this.playerMgr.openYoutubeWindow(param);
          break;
        case "openUstreamWindow":
          var param = elm.getAttribute("UstreamURL");
          elm.removeAttribute("UstreamURL");
          if (this.playerMgr)
            this.playerMgr.openUstreamWindow(param);
          break;
        case "openUrecordWindow":
          var param = elm.getAttribute("UrecordURL");
          elm.removeAttribute("UrecordURL");
          if (this.playerMgr)
            this.playerMgr.openUrecordWindow(param);
          break;
        case "previewPicture":
          var param = elm.getAttribute("PictureURL");
          elm.removeAttribute("PictureURL");
          if (this.picViewerMgr)
            this.picViewerMgr.openPicture(param);
          break;
        case "doLoadFile":
          this.buf.loadFile();
          break;
        case "doSaveFile":
          this.buf.saveFile();
          break;
        case "checkPrefExist":
          this.doSiteSettingCheck(250);
          break;
        case "pushThread":
          this.doPushThread();
          break;
        case "setAlert":
          var param = elm.getAttribute("AlertMessage");
          elm.removeAttribute("AlertMessage");
          //this.view.showAlertMessage(document.title, param);
          //alert(param);
          break;
        default:
          //e v a l("bbsfox."+cmd+"();"); //unsafe javascript? how to fix it?
          break;
      }
    }
    elm.removeAttribute("pttChromeCommand");
  }
};

pttchrome.App.prototype.onMouse_move = function(cX, cY) {
  var pos = this.clientToPos(cX, cY);
  this.buf.onMouse_move(pos.col, pos.row, false);
};

pttchrome.App.prototype.resetMouseCursor = function(cX, cY) {
  this.buf.BBSWin.style.cursor = 'auto';
  this.buf.mouseCursor = 11;
};

pttchrome.App.prototype.clearHighlight = function() {
  this.buf.clearHighlight();
};

pttchrome.App.prototype.onPrefChange = function(pref, name) {
  try {
    //var CiStr = Components.interfaces.nsISupportsString;
    //dumpLog(DUMP_TYPE_LOG, "onPrefChange " + name + ":" + pref.get(name));
    switch (name) {
    case 'useMouseBrowsing':
      var useMouseBrowsing = pref.get(name);
      this.CmdHandler.setAttribute('useMouseBrowsing', useMouseBrowsing?'1':'0');
      this.buf.useMouseBrowsing = useMouseBrowsing;

      if (!this.buf.useMouseBrowsing) {
        this.buf.BBSWin.style.cursor = 'auto';
        this.buf.clearHighlight();
        this.buf.mouseCursor = 0;
        this.buf.nowHighlight = -1;
        this.buf.tempMouseCol = 0;
        this.buf.tempMouseRow = 0;
      }
      this.buf.SetPageState();
      this.buf.resetMousePos();
      this.view.redraw(true);
      this.view.updateCursorPos();
      break;
    case 'mouseBrowsingHighlight':
      this.buf.highlightCursor = pref.get(name);
      this.view.redraw(true);
      this.view.updateCursorPos();
      break;
    case 'mouseBrowsingHighlightColor':
      this.view.highlightBG = pref.get(name);
      this.view.redraw(true);
      this.view.updateCursorPos();
      break;
    case 'closeQuery':
      if (pref.get(name))
        this.regExitAlert();
      else
        this.unregExitAlert();
      break;
    case 'antiIdleTime':
      this.antiIdleTime = pref.get(name) * 1000;
      break;
    case 'dbcsDetect':
      this.view.dbcsDetect = pref.get(name);
      break;
    case 'fontFace':
      var fontFace = pref.get(name);
      if (!fontFace) 
        fontFace='monospace';
      this.view.setFontFace(fontFace);
      break;
    default:
      break;
    }
  } catch(e) {
    // eats all errors
    return;
  }
};

pttchrome.App.prototype.checkClass = function(cn) {
  return (  cn.indexOf("closeSI") >=0  || cn.indexOf("EPbtn") >= 0
          || cn.indexOf("closePP") >= 0 || cn.indexOf("picturePreview") >= 0
          || cn.indexOf("drag") >= 0    || cn.indexOf("floatWindowClientArea") >= 0
          || cn.indexOf("WinBtn") >= 0  || cn.indexOf("sBtn") >= 0
          || cn.indexOf("nonspan") >= 0 );
};

pttchrome.App.prototype.mouse_click = function(e) {
  if (this.modalShown)
    return;
  var skipMouseClick = (this.CmdHandler.getAttribute('SkipMouseClick') == '1');
  this.CmdHandler.setAttribute('SkipMouseClick','0');

  if (e.button == 2) { //right button
  } else if (e.button == 0) { //left button
    if (e.target && e.target.getAttribute("link") == 'true') {
      return;
    }
    if (window.getSelection().isCollapsed) { //no anything be select
      if (this.buf.useMouseBrowsing) {
        var doMouseCommand = true;
        if (e.target.className)
          if (this.checkClass(e.target.className))
            doMouseCommand = false;
        if (e.target.tagName)
          if(e.target.tagName.indexOf("menuitem") >= 0 )
            doMouseCommand = false;
        if (skipMouseClick) {
          doMouseCommand = false;
          var pos = this.clientToPos(e.clientX, e.clientY);
          this.buf.onMouse_move(pos.col, pos.row, true);
        }
        if (doMouseCommand) {
          this.onMouse_click(e.clientX, e.clientY);
          this.setDblclickTimer();
          e.preventDefault();
          this.setInputAreaFocus();
        }
      }
    }
  } else if (e.button == 1) { //middle button
    if (e.target && e.target.parentNode) {
      if (e.target.getAttribute("link") == 'true')
        return;
    }
    if (this.view.middleButtonFunction == 1)
      this.telnetCore.send('\r');
    else if (this.view.middleButtonFunction == 2) {
      this.buf.SetPageState();
      if (this.buf.PageState == 2 || this.buf.PageState == 3 || this.buf.PageState == 4)
        this.telnetCore.send('\x1b[D');
    }
  } else {
  }
};

pttchrome.App.prototype.mouse_down = function(e) {
  if (this.modalShown)
    return;
  //0=left button, 1=middle button, 2=right button
  if (e.button == 0) {
    if (this.buf.useMouseBrowsing) {
      if (this.dblclickTimer) { //skip
        e.preventDefault();
        e.stopPropagation();
        e.cancelBubble = true;
      }
      this.setDblclickTimer();
    }
    this.mouseLeftButtonDown = true;
    //this.setInputAreaFocus();
    if (!(window.getSelection().isCollapsed))
      this.CmdHandler.setAttribute('SkipMouseClick','1');

    var onbbsarea = true;
    if (e.target.className)
      if (this.checkClass(e.target.className))
        onbbsarea = false;
    if (e.target.tagName)
      if (e.target.tagName.indexOf("menuitem") >= 0 )
        onbbsarea = false;
  } else if(e.button == 2) {
    this.mouseRightButtonDown = true;
    //create context menu

    // update context menu's fullscreen checkbox
    if (chrome.app.window.current().isFullscreen()) {
      chrome.contextMenus.update('fullscreen', { checked: true });
    } else {
      chrome.contextMenus.update('fullscreen', { checked: false });
    }
    //this.resetMenuItems();
  }
};

pttchrome.App.prototype.mouse_up = function(e) {
  if (this.modalShown)
    return;
  //0=left button, 1=middle button, 2=right button
  if (e.button == 0) {
    this.setMbTimer();
    //this.CmdHandler.setAttribute('MouseLeftButtonDown', '0');
    this.mouseLeftButtonDown = false;
  } else if (e.button == 2) {
    this.mouseRightButtonDown = false;
    //this.CmdHandler.setAttribute('MouseRightButtonDown', '0');
  }

  if (e.button == 0 || e.button == 2) { //left or right button
    if (window.getSelection().isCollapsed) { //no anything be select
      if (this.buf.useMouseBrowsing)
        this.onMouse_move(e.clientX, e.clientY);

      this.setInputAreaFocus();
      if (e.button == 0) {
        var preventDefault = true;
        if (e.target.className)
          if (this.checkClass(e.target.className))
            preventDefault = false;
        if (e.target.tagName)
          if (e.target.tagName.indexOf("menuitem") >= 0 )
            preventDefault = false;
        if (preventDefault)
          e.preventDefault();
      }
    } else { //something has be select
      //document.getElementById('t').disabled="disabled"; //prevent input area get focus, if it get focus, select area will disappear
      //pttchrome.app.clearHighlight(); don't do this
      //document.getElementById('t').focus(); // if re-set focuse to input area, select area will disappear
    }
  } else {
    this.setInputAreaFocus();
    e.preventDefault();
  }
  var _this = this;
  this.inputAreaFocusTimer = setTimer(false, function() {
    clearTimeout(_this.inputAreaFocusTimer);
    _this.inputAreaFocusTimer = null;
    if (this.modalShown)
      return;
    if (window.getSelection().isCollapsed)
      _this.setInputAreaFocus();
  }, 10);
};

pttchrome.App.prototype.mouse_move = function(e) {
  this.view.tempPicX = e.clientX;
  this.view.tempPicY = e.clientY;
  //if we draging window, pass all detect.
  if (this.playerMgr && this.playerMgr.dragingWindow) {
    var dW = this.playerMgr.dragingWindow;
    if (this.CmdHandler.getAttribute("DragingWindow") == '1') {
      dW.playerDiv.style.left = dW.tempCurX + (e.pageX - dW.offX) + 'px';
      dW.playerDiv.style.top = dW.tempCurY + (e.pageY - dW.offY) + 'px';
      e.preventDefault();
      return;
    } else if (this.CmdHandler.getAttribute("DragingWindow") == '2') {
      dW.playerDiv2.style.left = dW.tempCurX + (e.pageX - dW.offX) + 'px';
      dW.playerDiv2.style.top = dW.tempCurY + (e.pageY - dW.offY) + 'px';
      e.preventDefault();
      return;
    }
  } else if (this.picViewerMgr && this.picViewerMgr.dragingWindow) {
    var dW = this.picViewerMgr.dragingWindow;
    dW.viewerDiv.style.left = dW.tempCurX + (e.pageX - dW.offX) + 'px';
    dW.viewerDiv.style.top = dW.tempCurY + (e.pageY - dW.offY) + 'px';
    e.preventDefault();
    return;
  } else if (this.symbolinput && this.symbolinput.dragingWindow) {
    var dW = this.symbolinput.dragingWindow;
    if (this.CmdHandler.getAttribute("DragingWindow") == '3') {
      dW.mainDiv.style.left = dW.tempCurX + (e.pageX - dW.offX) + 'px';
      dW.mainDiv.style.top = dW.tempCurY + (e.pageY - dW.offY) + 'px';
      e.preventDefault();
      return;
    }
  }
  //
  if (e.target.className) {
    if(e.target.className.indexOf("q") >= 0) {
      if (this.view.enablePicturePreview 
          && (this.view.ctrlPicturePreview==false || (this.view.ctrlPicturePreview && e.ctrlKey) ) ) {
        //if (e.target.rel.toLowerCase() == "p")
        var url = null;// = e.target.parentNode.getAttribute("href");
        var hrel = null;// = e.target.parentNode.getAttribute("rel");
        var node = e.target;
        if (node.getAttribute("link") == 'true') {
          while (node.parentNode && !url) {
            node = node.parentNode;
            url = node.getAttribute("href");
            hrel = node.getAttribute("rel");
          }
        }
        if (hrel && hrel.toLowerCase() == 'p'
            && url.toLowerCase().indexOf("http://photo.xuite.net/") < 0
            && url.toLowerCase().indexOf("http://simplest-image-hosting.net/") < 0
            && url.toLowerCase().indexOf("http://screensnapr.com/") < 0) {

          this.setPicLocation(e.clientX, e.clientY);
          this.view.pictureWindow.style.display = "block";
          if (this.CmdHandler.getAttribute('LastPicAddr') == url) {
            //if(this.view.picturePreviewInfo)
            //  this.view.pictureInfoLabel.style.display='inline';
            //else
            //  this.view.pictureInfoLabel.style.display='none';
          } else {
            this.view.picturePreview.innerHTML = "";
            this.view.picturePreview.style.display = "none";
            this.view.pictureInfoLabel.style.display = "none";
            this.view.picLoadingImage.src="chrome://pttchrome/skin/state_icon/connecting.gif";
            this.view.picturePreviewLoading.style.display = "block";
            this.CmdHandler.setAttribute('LastPicAddr', url);
            var image = document.createElement('img');
            this.view.picturePreview.appendChild(image);
            image.onload = function(){
                pttchrome.app.prePicResize(this);
            };
            image.onerror = function(){
                pttchrome.app.picLoaderror(this);
            };
            image.setAttribute('src',url);
          }
        }
      }
    } else {// if(e.target.tagName.toLowerCase() == "img")
      //fix bug while no mouseout event to hide img
      //this.view.pictureWindow.style.display = "none";
    }
  }//end of if(e.target.className)

  if (this.buf.useMouseBrowsing) {
    if (window.getSelection().isCollapsed) {
      if(!this.mouseLeftButtonDown)
        this.onMouse_move(e.clientX, e.clientY);
    } else
      this.resetMouseCursor();
  }
};

pttchrome.App.prototype.mouse_over = function(e) {
  if (this.modalShown)
    return;
  if(window.getSelection().isCollapsed && !this.mouseLeftButtonDown)
    this.setInputAreaFocus();
};

pttchrome.App.prototype.mouse_scroll = function(e) {
  var cmdhandler = this.CmdHandler;

  // scroll = up/down
  // hold right mouse key + scroll = page up/down
  // hold left mouse key + scroll = thread prev/next

  if (e.wheelDelta > 0) { // scrolling up
    if (this.mouseRightButtonDown) {
      this.setBBSCmd('doPageUp', cmdhandler);
    } else if (this.mouseLeftButtonDown) {
      this.setBBSCmd('prevousThread', cmdhandler);
      this.setBBSCmd('cancelHoldMouse', cmdhandler);
    } else {
      this.setBBSCmd('doArrowUp', cmdhandler);
    }
  } else { // scrolling down
    if (this.mouseRightButtonDown) {
      this.setBBSCmd('doPageDown', cmdhandler);
    } else if (this.mouseLeftButtonDown) {
      this.setBBSCmd('nextThread', cmdhandler);
      this.setBBSCmd('cancelHoldMouse', cmdhandler);
    } else {
      this.setBBSCmd('doArrowDown', cmdhandler);
    }
  }
  e.stopPropagation();
  e.preventDefault();

  if (this.mouseRightButtonDown) //prevent context menu popup
    cmdhandler.setAttribute('doDOMMouseScroll','1');
  if (this.mouseLeftButtonDown) {
    if (this.buf.useMouseBrowsing) {
      cmdhandler.setAttribute('SkipMouseClick','1');
    }
  }
};

pttchrome.App.prototype.context_menu = function(e) {
  var cmdhandler = this.CmdHandler;
  var doDOMMouseScroll = (cmdhandler.getAttribute('doDOMMouseScroll')=='1');
  if (doDOMMouseScroll) {
    e.stopPropagation();
    e.preventDefault();
    cmdhandler.setAttribute('doDOMMouseScroll','0');
  }
};


pttchrome.App.prototype.window_beforeunload = function(e) {
  //e.returnValue = confirm('Are you sure you want to leave '+document.title+'?');
  e.returnValue = true;
  return document.title;
};

pttchrome.App.prototype.regExitAlert = function() {
  this.unregExitAlert();
  this.alertBeforeUnload = true;
  window.addEventListener('beforeunload', this.window_beforeunload, false);
};

pttchrome.App.prototype.unregExitAlert = function() {
  // clear alert for closing tab
  if (this.alertBeforeUnload) {
    this.alertBeforeUnload = false;
    window.removeEventListener('beforeunload', this.window_beforeunload, false);
  }
};

pttchrome.App.prototype.setBBSCmd = function(cmd, cmdhandler) {
  //var doc = gBrowser.contentDocument;
  var doc = document;
  if (!cmdhandler)
    cmdhandler = this.getCmdHandler();

  if (cmdhandler && "createEvent" in doc) {
    cmdhandler.setAttribute('pttChromeCommand', cmd);
    var evt = doc.createEvent("Events");
    evt.initEvent("OverlayCommand", false, false);
    cmdhandler.dispatchEvent(evt);
  }
};

pttchrome.App.prototype.createMenu = function(title, func, parentId, id) {
  var createProperties = { 
    "title": title, 
    "id": (id?id:title),
    "contexts": ["page", "selection"]
  };
  if (func)
    this.menuHandler[createProperties.id] = func;
  if (parentId)
    createProperties.parentId = parentId;

  return chrome.contextMenus.create(createProperties, function() {});
};

pttchrome.App.prototype.resetMenuItems = function() {
  var self = this;
  chrome.contextMenus.removeAll();
  this.menuHandler = {};
  // create the contextMenu item
  var popup_paste = this.createMenu(i18n("menu_paste"), function() {
      pttchrome.app.doPaste();
  }, null, 'paste');
  var popup_selectAll = this.createMenu(i18n("menu_selAll"), function() {
      pttchrome.app.doSelectAll();
  }, null, 'selectall');

  chrome.contextMenus.create({
    type: 'separator',
    title: '',
    id: 'sep0',
    contexts: ['page', 'selection']
  });

  this.menuHandler['searchGoogle'] = function() {
    pttchrome.app.doSearchGoogle();
  };
  chrome.contextMenus.create({
    title: i18n('menu_searchGoogle'),
    id: 'searchGoogle',
    contexts: ['selection']
  });

  this.menuHandler['fullscreen'] = function() {
    var isFullscreened = chrome.app.window.current().isFullscreen();
    if (isFullscreened) {
      chrome.app.window.current().restore();
    } else {
      chrome.app.window.current().fullscreen();
    }
  };
  chrome.contextMenus.create({
    type: 'checkbox',
    checked: chrome.app.window.current().isFullscreen(),
    title: i18n('menu_fullscreen'),
    id: 'fullscreen',
    contexts: ['page', 'selection']
  });

  this.menuHandler['toggleMouseBrowsing'] = function() {
    pttchrome.app.switchMouseBrowsing();
  };
  chrome.contextMenus.create({
    type: 'checkbox',
    checked: self.pref.get('useMouseBrowsing'),
    title: i18n('menu_toggleMouseBrowsing'),
    id: 'toggleMouseBrowsing',
    contexts: ['page', 'selection']
  });

  chrome.contextMenus.create({
    type: 'separator',
    title: '',
    id: 'sep1',
    contexts: ['page', 'selection']
  });

  var popup_goToOtherSite = this.createMenu(i18n("menu_goToOtherSite"), function() {
      pttchrome.app.doGoToOtherSite();
  }, null, 'goToOtherSite');

  var popup_pref = this.createMenu(i18n("menu_pref"), function() {
      pttchrome.app.doPreferences();
  }, null, 'pref');

  var popup_restartInTab = this.createMenu(i18n("menu_restartInTab"), function() {
      pttchrome.app.doRestartInTab();
  }, null, 'restartInTab');
};
