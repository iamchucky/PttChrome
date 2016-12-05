// Terminal View

function TermView(rowCount) {
  //new pref - start
  this.screenType = 0;
  this.bbsWidth = 0;
  this.bbsHeight = 0;
  this.bbsFontSize = 14;
  this.useHyperLink = true;
  this.dbcsDetect = true;
  this.inputBufferSizeType = 0;
  this.defineInputBufferSize = 12;
  this.hideInputBuffer = false;
  this.hotkeyForSelectAll = false;
  this.highlightBG = 2;
  this.charset = 'big5';
  this.EnterChar = '\r';
  this.dropToPaste = false;
  this.ctrlPicturePreview = false;
  this.picturePreviewInfo = false;
  this.middleButtonFunction = 0;
  this.leftButtonFunction = false;
  this.mouseWheelFunction1 = 1;
  this.mouseWheelFunction2 = 2;
  this.mouseWheelFunction3 = 3;
  //this.highlightFG = 7;
  this.DisplayBackground = false;
  this.BackgroundMD5 = '';
  this.fontFitWindowWidth = false;
  this.verticalAlignCenter = true;
  this.horizontalAlignCenter = true;
  this.easyReadingWithImg = false;
  //new pref - end

  this.bbsViewMargin = 0;
  this.cursorShow = true;

  this.buf = null;
  this.bbscore = null;
  this.page = null;

  // Cursor
  this.cursorX = 0;
  this.cursorY = 0;

  this.deffg = 7;
  this.defbg = 0;
  this.curFg = 7;
  this.curBg = 0;
  this.curBlink = false;
  this.openSpan = false;

  this.useEasyReadingMode = false;
  this.easyReadingTurnPageLines = 22;
  this.easyReadingKeyDownKeyCode = 0;

  this.doHighlightOnCurRow = false;

  this.curRow = 0;
  this.curCol = 0;

  this.actualRowIndex = 0;

  //this.DBDetection = false;
  this.blinkShow = false;
  this.blinkOn = false;
  this.doBlink = true;
  this.cursorBlinkTimer = null;

  this.selection = null;
  this.input = document.getElementById('t');
  this.symtable = lib.symbolTable;
  this.bbsCursor = document.getElementById('cursor');
  this.trackKeyWordList = document.getElementById('TrackKeyWordList');
  this.BBSWin = document.getElementById('BBSWindow');
  this.picPreview = document.getElementById('picPreview');
  this.picLoading = document.getElementById('picLoading');
  this.enablePicPreview = true;
  this.scaleX = 1;
  this.scaleY = 1;

  // for cpu efficiency
  this.innerBounds = { width: 0, height: 0 };
  this.firstGridOffset = { top: 0, left: 0 };

  // for notifications
  this.enableNotifications = true;
  this.titleTimer = null;
  this.notif = null;

  this.htmlRowStrArray = [];

  var mainDiv = document.createElement('div');
  mainDiv.setAttribute('class', 'main');
  for (var i = 0; i < rowCount; ++i) {
    this.htmlRowStrArray.push('<span type="bbsrow" srow="'+i+'"></span>');
  }
  mainDiv.innerHTML = '<div id="mainContainer">'+this.htmlRowStrArray.join('')+'</div>';
  this.BBSWin.appendChild(mainDiv);
  this.mainDisplay = mainDiv;

  var fbSharingDiv = document.createElement('div');
  fbSharingDiv.setAttribute('id', 'fbSharing');
  fbSharingDiv.setAttribute('align', 'left');
  fbSharingDiv.innerHTML = '<div class="fb-like" data-href="" data-layout="button_count" data-action="like" data-show-faces="true" data-share="true"></div>';
  this.fbSharingDiv = fbSharingDiv;
  this.BBSWin.appendChild(fbSharingDiv);
  this.hideFbSharing = false;

  var lastRowDiv = document.createElement('div');
  lastRowDiv.setAttribute('id', 'easyReadingLastRow');
  this.lastRowDivContent = '<span align="left"><span class="q0 b7">                                                       </span><span class="q1 b7">(y)</span><span class="q0 b7">回應</span><span class="q1 b7">(X%)</span><span class="q0 b7">推文</span><span class="q1 b7">(←)</span><span class="q0 b7">離開 </span> </span>';
  lastRowDiv.innerHTML = this.lastRowDivContent;
  this.lastRowDiv = lastRowDiv;
  this.BBSWin.appendChild(lastRowDiv);

  var replyRowDiv = document.createElement('div');
  replyRowDiv.setAttribute('id', 'easyReadingReplyRow');
  this.replyRowDivContent = '<span align="left"></span>';
  replyRowDiv.innerHTML = this.replyRowDivContent;
  this.replyRowDiv = replyRowDiv;
  this.BBSWin.appendChild(replyRowDiv);

  this.mainContainer = document.getElementById('mainContainer');
  this.mainDisplay.style.border = '0px';
  this.setFontFace('MingLiu,monospace');

  this.picPreviewShouldShown = false;
  this.picPreviewAjaxLoading = false;

  var self = this;
  this.input.addEventListener('compositionstart', function(e) {
    self.onCompositionStart(e);
    self.bbscore.setInputAreaFocus();
  }, false);

  this.input.addEventListener('compositionend', function(e) {
    self.onCompositionEnd(e);
    self.bbscore.setInputAreaFocus();
    if (self.bbscore.chromeVersion >= 53) {
      // need to call onInput for Chrome 53+ because it doesn't fire input after this
      self.onInput(e);
    }
  }, false);

  this.input.addEventListener('compositionupdate', function(e) {
  }, false);

  addEventListener('keydown', function(e) {
    // disable auto update pushthread if any command is issued;
    if (!e.altKey) self.bbscore.disableLiveHelper();

    if(e.keyCode > 15 && e.keyCode < 19)
      return; // Shift Ctrl Alt (19)
    if (self.bbscore.modalShown || self.bbscore.contextMenuShown)
      return;
    if (document.getElementById('connectionAlert').style.display != 'none') {
      if (e.keyCode == 13)
        document.getElementById('connectionAlertReconnect').click();
      if (e.keyCode == 27)
        document.getElementById('connectionAlertExitAll').click();
      return;
    }
    self.onkeyDown(e);
  }, false);

  addEventListener('keyup', function(e) {
    if(e.keyCode > 15 && e.keyCode < 19)
      return; // Shift Ctrl Alt (19)
    if (self.bbscore.modalShown || self.bbscore.contextMenuShown)
      return;
    if (document.getElementById('connectionAlert').style.display != 'none' && 
      (e.keyCode == 13 || e.keyCode == 27)) {
      return;
    }
    if (self.useEasyReadingMode && self.buf.startedEasyReading && 
        !self.buf.easyReadingShowReplyText && !self.buf.easyReadingShowPushInitText &&
        self.easyReadingKeyDownKeyCode == 229) { // only use on chinese IME
      self.easyReadingOnKeyUp(e);
      return;
    }
    // set input area focus whenever key down even if there is selection
    self.bbscore.setInputAreaFocus();
  }, false);

  this.input.addEventListener('input', function(e) {
    self.onInput(e);
  }, false);


}


TermView.prototype = {

  onBlink: function() {
    this.blinkOn=true;
    //   if(this.buf && this.buf.changed)
    this.buf.queueUpdate(true);
    //   else this.update();
  },

  onCursorBlink: function() {
    this.cursorShow=!this.cursorShow;
    if (this.cursorShow)
      this.bbsCursor.style.display = 'block';
    else
      this.bbsCursor.style.display = 'none';
  },

  resetCursorBlink: function() {
    if (!this.conn.isConnected)
      return;
    var self = this;
    this.cursorShow = true;
    this.bbsCursor.style.display = 'block';
    if (this.cursorBlinkTimer) {
      this.cursorBlinkTimer.cancel();
    }
    this.cursorBlinkTimer = setTimer(true, function() {
      self.onCursorBlink();
    }, 1000);
  },

  setBuf: function(buf) {
    this.buf=buf;
  },

  setConn: function(conn) {
    this.conn=conn;
  },

  setCore: function(core) {
    this.bbscore=core;
  },

  setFontFace: function(fontFace) {
    this.fontFace = fontFace;
    this.input.style.setProperty('font-family', this.fontFace, 'important');
    this.mainDisplay.style.setProperty('font-family', this.fontFace, 'important');
    this.lastRowDiv.style.setProperty('font-family', this.fontFace, 'important');
    this.replyRowDiv.style.setProperty('font-family', this.fontFace, 'important');
    document.getElementById('cursor').style.setProperty('font-family', this.fontFace, 'important');
  },

  update: function() {
    this.redraw(false);
  },

  prePicRel: function(str) {
    if(str.search(/\.(bmp|gif|jpe?g|png)$/i) == -1)
      return ' type="w"';
    else
      return ' type="p"';
  },

  createTwoColorWord: function(ch, ch2, char1, fg, fg2, bg, bg2, forceWidth) {
    var row = this.curRow;
    var col = this.curCol;
    // set to default color so that it'll create span for next char that has different color from default
    this.setCurColorStyle(this.deffg, this.defbg, false);

    var s1 = '';
    var fwStyle = '';
    var spanClass = '';
    var bcValue = '';
    var hasXNode = ((ch.blink && fg != bg) || (ch2.blink && fg2 != bg2));
    var xNodeStr = '';
    if (forceWidth !== 0) {
      fwStyle = ' style="display:inline-block;width:'+forceWidth+'px;"';
    }

    s1 += this.closeSpanIfIsOpen();

    if (fg != fg2) {
      spanClass = 'w'+fg+' q'+fg2+' o';
    } else {
      spanClass = 'q'+fg;
    }
    if (bg != bg2) {
      bcValue = 'b'+bg+'b'+bg2;
    } else {
      bcValue = 'b'+bg;
    }
    spanClass += ' ' + bcValue;

    if (hasXNode) {
      var xNodeAttrS = '';
      if (fg != fg2) {
        xNodeAttrS = 'w'+fg+' q'+fg2+' o';
      } else {
        xNodeAttrS = 'q'+fg;
      }

      var xNodeAttrH = '';
      if (ch.blink && ch2.blink) {
        if (fg != fg2) {
          xNodeAttrH = 'qq';
        } else if (bg != bg2) {
          xNodeAttrH = 'qq'+bg;
        } else {
          // not possible
          console.log('this is not possible');
        }
      } else if (ch.blink && !ch2.blink) {
        if (fg2 == bg) {
          xNodeAttrH = 'q'+bg;
        } else {
          xNodeAttrH = 'w'+bg+' q'+fg2+' o';
        }
      } else {// if(!ch.blink && ch2.blink)
        if (fg == bg2) {
          xNodeAttrH = 'q'+fg;
        } else {
          xNodeAttrH = 'w'+fg+' q'+bg2+' o';
        }
      }
      xNodeAttrH += ' ' + bcValue;
      xNodeAttrS += ' ' + bcValue;
      xNodeStr = '<x s="'+xNodeAttrS+'" h="'+xNodeAttrH+'"></x>';
    }

    s1 += '<span class="'+spanClass+'" t="'+char1+'"'+fwStyle+'>';
    if (hasXNode) {
      s1 += xNodeStr;
    }
    s1 += char1+'</span>';
    return s1;
  },

  createNormalWord: function(ch, ch2, char1, fg, bg, forceWidth) {
    var row = this.curRow;
    var col = this.curCol;
    var s1 = '';
    if ((this.openSpan && (fg == this.curFg && bg == this.curBg && ch.blink == this.curBlink)) && forceWidth === 0) {
      return char1;
    }

    s1 += this.closeSpanIfIsOpen();
    if (fg == this.deffg && bg == this.defbg && !ch.blink && forceWidth === 0) { // default colors
      this.setCurColorStyle(fg, bg, false);
      s1 += char1;
    } else if (forceWidth === 0) { // different colors, so create span
      this.setCurColorStyle(fg, bg, ch.blink);
      s1 += '<span class="q' +fg+ ' b' +bg+'">';
      s1 += (ch.blink?'<x s="q'+fg+' b'+bg+'" h="qq'+bg+'"></x>':'') + char1;
      this.openSpan = true;
    } else { // different colors, create span and set current color to default because forceWidth
      this.setCurColorStyle(this.deffg, this.defbg, false);
      s1 += '<span class="wpadding q' +fg+ ' b' +bg+'" ';
      s1 += 'style="display:inline-block;width:'+forceWidth+'px;"' +'>' + (ch.blink?'<x s="q'+fg+' b'+bg+'" h="qq'+bg+'"></x>':'') + char1 + '</span>';
    }
    return s1;
  },

  createNormalChar: function(ch, char1, fg, bg) {
    var row = this.curRow;
    var col = this.curCol;
    var useHyperLink = this.useHyperLink;
    var s0 = '';
    var s1 = '';
    var s2 = '';
    if (ch.isStartOfURL() && useHyperLink) {
      s0 += this.closeSpanIfIsOpen();
      s0 += '<a scol="'+col+'" class="y q'+this.deffg+' b'+this.defbg+'" href="' +ch.getFullURL() + '"' + this.prePicRel( ch.getFullURL()) + ' rel="noreferrer" target="_blank" srow="'+row+'">';
      this.setCurColorStyle(this.deffg, this.defbg, false);
    }
    if (ch.isEndOfURL() && useHyperLink) {
      s2 = '</a>';
    }

    if (this.openSpan && (bg == this.curBg && (fg == this.curFg || char1 <= ' ') && ch.blink == this.curBlink)) {
      s1 += this.getHtmlEntitySafe(char1);
    } else if (bg == this.defbg && (fg == this.deffg || char1 <= ' ') && !ch.blink) {
      s1 += this.closeSpanIfIsOpen();
      this.setCurColorStyle(fg, bg, false);
      s1 += this.getHtmlEntitySafe(char1);
    } else {
      s1 += this.closeSpanIfIsOpen();
      this.setCurColorStyle(fg, bg, ch.blink);
      s1 +='<span '+ (ch.isPartOfURL()?'link="true" ':'') +'class="q' +fg+ ' b' +bg+ '">'+ (ch.blink?'<x s="q'+fg+' b'+bg+'" h="qq'+bg+'"></x>':'');
      this.openSpan = true;
      s1 += this.getHtmlEntitySafe(char1);
    }
    if (s2) {
      this.setCurColorStyle(this.deffg, this.defbg, false);
      s1 += this.closeSpanIfIsOpen();
    }
    return s0+s1+s2;
  },

  determineAndSetHtmlForCol: function(line, outhtml) {
    var ch = line[this.curCol];
    var curColOutHtml = outhtml[this.curCol];

    var fg = ch.getFg();
    var bg = ch.getBg();

    if (this.doHighlightOnCurRow) {
      this.defbg = this.highlightBG;
      bg = this.highlightBG;
    }

    if (ch.isLeadByte) { // first byte of DBCS char
      var col2 = this.curCol + 1;
      if (col2 < this.buf.cols) {
        var ch2 = line[col2];
        var curColOutHtml2 = outhtml[col2];
        var fg2 = ch2.getFg();
        var bg2 = ch2.getBg();
        var spanstr1 = '';
        var spanstr2 = '';
        if (this.doHighlightOnCurRow) {
          bg2 = this.highlightBG;
        }

        if (ch2.ch=='\x20') { //a LeadByte + ' ' //we set this in '?' + ' '
          spanstr1 = this.createNormalChar(ch, '?', fg, bg);
          spanstr2 = this.createNormalChar(ch, ' ', fg2, bg2);
        } else { //maybe normal ...
          var b5 = ch.ch + ch2.ch; // convert char to UTF-8 before drawing
          var u = (this.charset == 'UTF-8' || b5.length == 1) ? b5 : b5.b2u();
          if (u) { // can be converted to valid UTF-8
            if (u.length == 1) { //normal chinese word
              var code = this.symtable['x'+u.charCodeAt(0).toString(16)];
              if (code == 3) { //[4 code char]
                spanstr1 = this.createNormalChar(ch, '?', fg2, bg2);
                spanstr2 = this.createNormalChar(ch2, '?', fg2, bg2);
              } else { 
                var forceWidth = 0;
                if (code == 1 || code == 2) {
                  forceWidth = this.chh;
                }
                if (bg != bg2 || fg != fg2 || ch.blink != ch2.blink ) {
                  spanstr1 = this.createTwoColorWord(ch, ch2, u, fg, fg2, bg, bg2, forceWidth);
                } else {
                  spanstr1 = this.createNormalWord(ch, ch2, u, fg, bg, forceWidth);
                }
              }
            } else { //a <?> + one normal char // we set this in '?' + ch2
              spanstr1 = this.createNormalChar(ch, '?', fg, bg);
              spanstr2 = this.createNormalChar(ch, ch2.ch, fg2, bg2);
            }
          }
        }
        curColOutHtml.setHtml(spanstr1);
        curColOutHtml2.setHtml(spanstr2);
        ch2.needUpdate = false;
      }
      this.curCol = col2;
    } else { // NOT LeadByte
      var spanstr = this.createNormalChar(ch, ch.ch, fg, bg);
      curColOutHtml.setHtml(spanstr);
    }
    ch.needUpdate = false;

  },

  redraw: function(force) {

    //var start = new Date().getTime();
    var cols = this.buf.cols;
    var rows = this.buf.rows;
    var lineChangeds = this.buf.lineChangeds;
    var lineChangedCount = 0;
    var changedLineHtmlStr = '';
    var changedLineHtmlStrs = [];
    var changedRows = [];
    var fullUpdateRowThreshold = 3;

    var lines = this.buf.lines;
    var outhtmls = this.buf.outputhtmls;
    var anylineUpdate = false;
    for (var row = 0; row < rows; ++row) {
      var chh = this.chh;
      this.curRow = row;
      // resets color
      this.setCurColorStyle(this.deffg, this.defbg, false);
      this.defbg = 0;
      var line = lines[row];
      var outhtml = outhtmls[row];
      var lineChanged = lineChangeds[row];
      if (lineChanged === false && !force)
        continue;
      var lineUpdated = false;
      var chw = this.chw;
      this.doHighlightOnCurRow = (this.buf.highlightCursor && this.buf.nowHighlight != -1 && this.buf.nowHighlight == row);

      for (this.curCol = 0; this.curCol < cols; ++this.curCol) {
        // always check all because it's hard to know about openSpan when jump update
        this.determineAndSetHtmlForCol(line, outhtml);
        lineUpdated = true;
      }
      // after all cols, close the span if open
      outhtml[this.curCol-1].addHtml(this.closeSpanIfIsOpen());

      if (lineUpdated) {
        lineUpdated = false;
        var tmp = [];
        var shouldFade = false;
        var userid = '';

        // check blacklist for user and fade row
        if (this.bbscore.pref.enableBlacklist) {
          var rowText = this.buf.getRowText(row, 0, this.buf.cols);
          if (this.buf.pageState == 3) {
            userid = rowText.parsePushthreadForUserId();
          } else if (this.buf.pageState == 2) {
            userid = rowText.parseThreadForUserId();
          }
          if (userid in this.bbscore.pref.blacklistedUserIds) {
            shouldFade = true;
          }
        }

        if (this.doHighlightOnCurRow) 
          tmp.push('<span type="highlight" class="b'+this.defbg+'" srow="'+row+'">');

        for (var j = 0; j < cols; ++j)
          tmp.push(outhtml[j].getHtml());

        if (this.doHighlightOnCurRow)
          tmp.push('</span>');

        changedLineHtmlStr = tmp.join('');
        if (changedLineHtmlStrs.length < fullUpdateRowThreshold) { // only store up to the threshold
          changedLineHtmlStrs.push(changedLineHtmlStr);
          changedRows.push(row);
        }
        this.htmlRowStrArray[row] = '<span type="bbsrow" class="'+(userid?'blu_'+userid:'')+'"'+ (shouldFade ? ' style="opacity:0.2"' : '') +' srow="'+row+'">' + changedLineHtmlStr + '</span>';
        anylineUpdate = true;
        lineChangeds[row] = false;
        lineChangedCount += 1;
      }
    }

    if (anylineUpdate) {
      if (lineChangedCount > fullUpdateRowThreshold) {
        if (!this.useEasyReadingMode) {
          this.mainContainer.innerHTML = this.htmlRowStrArray.join('');
          this.buf.prevPageState = this.buf.pageState;
        } else {
          this.populateEasyReadingPage();
        }
      } else {
        if (this.useEasyReadingMode && this.buf.startedEasyReading && this.buf.easyReadingShowReplyText) {
          this.updateEasyReadingReplyTextWithHtmlStr(changedLineHtmlStrs[changedLineHtmlStrs.length-1]);
        } else if (this.useEasyReadingMode && this.buf.startedEasyReading && this.buf.easyReadingShowPushInitText) {
          this.updateEasyReadingPushInitTextWithHtmlStr(changedLineHtmlStrs[changedLineHtmlStrs.length-1]);
        } else {
          for (var i = 0; i < changedRows.length; ++i) {
            this.mainContainer.childNodes[changedRows[i]].innerHTML = changedLineHtmlStrs[i];
          }
        }
        this.buf.prevPageState = this.buf.pageState;
      }

      if (this.enablePicPreview) {
        // hide preview if any update
        this.picPreviewShouldShown = false;
        this.picPreview.style.display = 'none';
        this.picLoading.style.display = 'none';
        this.setupPicPreviewOnHover();
      }
    }
    //var time = new Date().getTime() - start;
    //console.log(time);

  },

  onInput: function(e) {
    if (this.bbscore.modalShown || this.bbscore.contextMenuShown)
      return;
    if (this.isComposition) {
      // beginning chrome 55, we no longer can update input buffer width on compositionupdate
      // so we update it on input event
      this.updateInputBufferWidth();
      return;
    }

    if (this.useEasyReadingMode && this.buf.startedEasyReading && 
        !this.buf.easyReadingShowReplyText && !this.buf.easyReadingShowPushInitText &&
        this.easyReadingKeyDownKeyCode == 229 && e.target.value != 'X') { // only use on chinese IME
      e.target.value = '';
      return;
    }
    if (e.target.value) {
      this.onTextInput(e.target.value);
    }
    e.target.value='';
  },

  onTextInput: function(text, isPasting) {
    this.resetCursorBlink();
    var conn = this.conn;
    if (isPasting) {
      text = text.replace(/\r\n/g, '\r');
      text = text.replace(/\n/g, '\r');
      text = text.replace(/\r/g, this.EnterChar);

      if(text.indexOf('\x1b') < 0 && conn.lineWrap > 0) {
        text = text.wrapText(conn.lineWrap, this.EnterChar);
      }

      //FIXME: stop user from pasting DBCS words with 2-color
      text = text.replace(/\x1b/g, conn.EscChar);
    }
    conn.convSend(text);
  },

  onkeyDown: function(e) {
    // dump('onKeyPress:'+e.charCode + ', '+e.keyCode+'\n');
    var conn = this.conn;
    var charCode;
    this.resetCursorBlink();

    if (this.useEasyReadingMode && this.buf.startedEasyReading && 
        !this.buf.easyReadingShowReplyText && !this.buf.easyReadingShowPushInitText) {
      this.easyReadingOnKeyDown(e);
      return;
    }

    if (e.charCode) {
      // Control characters
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        // Ctrl + @, NUL, is not handled here
        if ( e.charCode >= 65 && e.charCode <=90 ) { // A-Z
          conn.send( String.fromCharCode(e.charCode - 64) );
          e.preventDefault();
          e.stopPropagation();
          return;
        } else if ( e.charCode >= 97 && e.charCode <=122 ) { // a-z
          conn.send( String.fromCharCode(e.charCode - 96) );
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    } else if (!e.ctrlKey && !e.altKey && !e.shiftKey) {

      switch (e.keyCode) {
      case 8:
        if (this.checkLeftDB())
          conn.send('\b\b');
        else
          conn.send('\b');
        break;
      case 9:
        conn.send('\t');
        // don't move input focus to next control
        e.preventDefault();
        e.stopPropagation();
        break;
      case 13:
        conn.send('\r');
        break;
      case 27: //ESC
        conn.send('\x1b');
        break;
      case 33: //Page Up
        conn.send('\x1b[5~');
        break;
      case 34: //Page Down
        conn.send('\x1b[6~');
        break;
      case 35: //End
        if ((this.bbscore.buf.pageState == 2 || this.bbscore.buf.pageState == 3) &&
            this.bbscore.endTurnsOnLiveUpdate) {
          this.bbscore.onLiveHelperEnableClicked(false);
        } else {
          conn.send('\x1b[4~');
        }
        break;
      case 36: //Home
        conn.send('\x1b[1~');
        break;
      case 37: //Arrow Left
        if(this.checkLeftDB())
          conn.send('\x1b[D\x1b[D');
        else
          conn.send('\x1b[D');
        break;
      case 38: //Arrow Up
        conn.send('\x1b[A');
        break;
      case 39: //Arrow Right
        if(this.checkCurDB())
          conn.send('\x1b[C\x1b[C');
        else
          conn.send('\x1b[C');
        break;
      case 40: //Arrow Down
        conn.send('\x1b[B');
        break;
      case 45: //Insert
        conn.send('\x1b[2~');
        break;
      case 46: //DEL
        if (this.checkCurDB())
          conn.send('\x1b[3~\x1b[3~');
        else
          conn.send('\x1b[3~');
        break;
        /*
      case 112: //F1
        conn.send('\x1bOP');
        break;
      case 113: //F2
        conn.send('\x1bOQ');
        break;
      case 114: //F3
        conn.send('\x1bOR');
        break;
      case 115: //F4
        conn.send('\x1bOS');
        break;
      case 116: //F5
        this.bbscore.pref.reloadPreference();
        e.preventDefault();
        e.stopPropagation();
        break;
      case 117: //F6
        conn.send('\x1b[17~');
        break;
      case 118: //F7
        conn.send('\x1b[18~');
        break;
      case 119: //F8
        conn.send('\x1b[19~');
        break;
      case 120: //F9
        conn.send('\x1b[20~');
        break;
      case 121: //F10
        conn.send('\x1b[21~');
        break;
      case 122: //F11
        //conn.send('\x1b[23~');//Firefox [Full Screen] hotkey
        break;
      case 123: //F12
        conn.send('\x1b[24~');
        break;
        */
      }
      return;
    } else if (e.ctrlKey && !e.altKey && !e.shiftKey) {
      if ((e.keyCode == 99 || e.keyCode == 67) && !window.getSelection().isCollapsed) { //^C , do copy
        var selectedText = window.getSelection().toString().replace(/\u00a0/g, " ");
        this.bbscore.doCopy(selectedText);
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (e.keyCode == 97 || e.keyCode == 65) {
        this.bbscore.doSelectAll();
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (e.keyCode >= 65 && e.keyCode <= 90) { // A-Z key
        charCode = e.keyCode - 64;
      } else if (e.keyCode >= 219 && e.keyCode <= 221) // [ \ ]
        charCode = e.keyCode - 192;
    } else if (!e.ctrlKey && e.altKey && !e.shiftKey) {
      if (e.keyCode == 87) {// alt+w
        conn.send('^W'.unescapeStr());
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (e.keyCode == 82) { // alt+r
        this.bbscore.onLiveHelperEnableClicked(false);
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (e.keyCode == 84) { // alt+t
        conn.send('^T'.unescapeStr());
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    } else if (e.ctrlKey && !e.altKey && e.shiftKey) {
      switch(e.keyCode) {
      case 50: // @
        charCode = 0;
        break;
      case 54: // ^
        charCode = 30;
        break;
      case 109: // _
        charCode = 31;
        break;
      case 191: // ?
        charCode = 127;
        break;
      case 86: //ctrl+shift+v
        this.bbscore.doPaste();
        e.preventDefault();
        e.stopPropagation();
        charCode = 0;
        break;
      }
    }
    if (charCode) {
      var sendCode = true;
      var preventDefault = true;
      if (charCode == 1 && this.hotkeyForSelectAll) { //select all
        this.bbscore.doSelectAll();
        sendCode = false;
        //return;
      } else if (charCode == 3) { //copy
        if (!window.getSelection().isCollapsed) //no anything be select
          return;
      }

      if (sendCode)
        conn.send( String.fromCharCode(charCode) );
      if (preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  },

  setTermFontSize: function(cw, ch) {
    var innerBounds = this.innerBounds;
    this.chw = cw;
    this.chh = ch;
    var fontSize = this.chh + 'px';
    var mainWidth = this.chw*this.buf.cols+10 + 'px';
    this.mainDisplay.style.fontSize = fontSize;
    this.mainDisplay.style.lineHeight = fontSize;
    this.bbsCursor.style.fontSize = fontSize;
    this.bbsCursor.style.lineHeight = fontSize;
    this.mainDisplay.style.overflowX = 'hidden';
    this.mainDisplay.style.overflowY = 'auto';
    this.mainDisplay.style.textAlign = 'left';
    this.mainDisplay.style.width = mainWidth;

    this.lastRowDiv.style.fontSize = fontSize;
    this.lastRowDiv.style.width = mainWidth;

    this.replyRowDiv.style.fontSize = fontSize;
    this.replyRowDiv.style.width = mainWidth;
    if (this.verticalAlignCenter && this.chh*this.buf.rows < innerBounds.height)
      this.mainDisplay.style.marginTop = ((innerBounds.height-this.chh*this.buf.rows)/2) + this.bbsViewMargin + 'px';
    else
      this.mainDisplay.style.marginTop =  this.bbsViewMargin + 'px';
    if (this.fontFitWindowWidth) {
      this.scaleX = Math.floor(innerBounds.width / (this.chw*this.buf.cols+10) * 100)/100;
      this.scaleY = Math.floor(innerBounds.height / (this.chh*this.buf.rows) * 100)/100;
    } else {
      this.scaleX = 1;
      this.scaleY = 1;
    }

    var scaleCss = 'none';
    if (this.scaleX != 1 || this.scaleY != 1) {
      //this.mainDisplay.style.transform = 'scaleX('+this.scaleX+')'; // chrome not stable support yet!
      scaleCss = 'scale('+this.scaleX+','+this.scaleY+')';
      var transOrigin = 'left';
      if(this.horizontalAlignCenter) {
        transOrigin = 'center';
      }
      this.mainDisplay.style.webkitTransformOriginX = transOrigin;
      this.lastRowDiv.style.webkitTransformOriginX = transOrigin;
      this.replyRowDiv.style.webkitTransformOriginX = transOrigin;
      this.lastRowDiv.style.webkitTransformOriginY = '-1100%'; // somehow these are the right value
      this.replyRowDiv.style.webkitTransformOriginY = '-1010%';
    } else {
      this.lastRowDiv.style.webkitTransformOriginY = '';
      this.replyRowDiv.style.webkitTransformOriginY = '';
    }
    this.mainDisplay.style.webkitTransform = scaleCss;
    this.lastRowDiv.style.webkitTransform = scaleCss;
    this.replyRowDiv.style.webkitTransform = scaleCss;

    this.firstGridOffset = this.bbscore.getFirstGridOffsets();

    this.updateCursorPos();
    this.updateFbSharingPos();
  },

  convertMN2XYEx: function(cx, cy) {
    var origin;
    var w = this.innerBounds.width;
    var h = this.innerBounds.height;
    if(this.horizontalAlignCenter && (this.scaleX!=1 || this.scaleY!=1))
      origin = [((w - (this.chw*this.buf.cols+10)*this.scaleX)/2) + this.bbsViewMargin, ((h - (this.chh*this.buf.rows)*this.scaleY)/2) + this.bbsViewMargin];
    else
      origin = [this.firstGridOffset.left, this.firstGridOffset.top];
    var realX = origin[0] + (cx) * this.chw * this.scaleX;
    var realY = origin[1] + (cy) * this.chh * this.scaleY;
    return [realX, realY];
  },

  checkLeftDB: function() {
    if (this.dbcsDetect && this.buf.cur_x>1) {
      var lines = this.buf.lines;
      var line = lines[this.buf.cur_y];
      var ch = line[this.buf.cur_x-2];
      if (ch.isLeadByte)
        return true;
    }
    return false;
  },

  checkCurDB: function() {
    if (this.dbcsDetect) {// && this.buf.cur_x<this.buf.cols-2){
      var lines = this.buf.lines;
      var line = lines[this.buf.cur_y];
      var ch = line[this.buf.cur_x];
      if (ch.isLeadByte)
        return true;
    }
    return false;
  },

  // Cursor
  updateCursorPos: function() {

    var pos = this.convertMN2XYEx(this.buf.cur_x, this.buf.cur_y);
    // if you want to set cursor color by now background, use this.
    if (this.buf.cur_y >= this.buf.rows || this.buf.cur_x >= this.buf.cols)
      return; //sometimes, the value of this.buf.cur_x is 80 :(

    var lines = this.buf.lines;
    var line = lines[this.buf.cur_y];
    var ch = line[this.buf.cur_x];
    var bg = ch.getBg();

    if (this.scaleX == 1 && this.scaleY == 1) {
      this.bbsCursor.style.webkitTransform = 'none';
      this.lastRowDiv.style.webkitTransformOriginY = '';
      this.replyRowDiv.style.webkitTransformOriginY = '';
    } else {
      var scaleCss = 'scale('+this.scaleX+','+this.scaleY+')';
      this.mainDisplay.style.webkitTransform = scaleCss;
      this.lastRowDiv.style.webkitTransform = scaleCss;
      this.replyRowDiv.style.webkitTransform = scaleCss;
      this.bbsCursor.style.webkitTransform = scaleCss;
      this.bbsCursor.style.webkitTransformOriginX = 'left';
      this.lastRowDiv.style.webkitTransformOriginY = '-1100%';
      this.replyRowDiv.style.webkitTransformOriginY = '-1010%';
    }

    this.bbsCursor.style.left = pos[0] + 'px';
    this.bbsCursor.style.top = (pos[1] - this.scaleY) + 'px';
    // if you want to set cursor color by now background, use this.
    this.bbsCursor.style.color = termInvColors[bg];
    this.updateInputBufferPos();

  },

  updateInputBufferPos: function() {
    if (this.input.getAttribute('bshow') == '1') {
      var pos = this.convertMN2XYEx(this.buf.cur_x, this.buf.cur_y);
      if (!this.hideInputBuffer) {
        this.input.style.opacity = '1';
        this.input.style.border = 'double';
        if (this.inputBufferSizeType === 0) {
          //this.input.style.width  = (this.chh-4)*10 + 'px';
          this.input.style.fontSize = this.chh-4 + 'px';
          //this.input.style.lineHeight = this.chh+4 + 'px';
          this.input.style.height = this.chh + 'px';
        } else {
          //this.input.style.width  = ((this.defineInputBufferSize*2)-4)*10 + 'px';
          this.input.style.fontSize = ((this.defineInputBufferSize*2)-4) + 'px';
          //this.input.style.lineHeight = this.bbscore.inputBufferSize*2+4 + 'px';
          this.input.style.height = this.defineInputBufferSize*2 + 'px';
        }
      } else {
        this.input.style.border = 'none';
        this.input.style.width  = '0px';
        this.input.style.height = '0px';
        this.input.style.fontSize = this.chh + 'px';
        this.input.style.opacity = '0';
        //this.input.style.left = '-100000px';
      }
      var innerBounds = this.innerBounds;
      var bbswinheight = innerBounds.height;
      var bbswinwidth = innerBounds.width;
      if(bbswinheight < pos[1] + parseFloat(this.input.style.height) + this.chh)
        this.input.style.top = (pos[1] - parseFloat(this.input.style.height) - this.chh)+ 4 +'px';
      else
        this.input.style.top = (pos[1] + this.chh) +'px';

      if(bbswinwidth < pos[0] + parseFloat(this.input.style.width))
        this.input.style.left = bbswinwidth - parseFloat(this.input.style.width)- 10 +'px';
      else
        this.input.style.left = pos[0] +'px';

      //this.input.style.left = pos[0] +'px';
    }
  },

  updateInputBufferWidth: function() {
    // change width according to input
    var wordCounts = this.input.value.u2b().length;
    // chh / 2 - 2 because border of 1
    var oneWordWidth = (this.chh/2-2);
    var width = oneWordWidth*wordCounts;
    this.input.style.width  = width + 'px';
    var bounds = this.innerBounds;
    if (parseInt(this.input.style.left) + width + oneWordWidth*2 >= bounds.width) {
      this.input.style.left = bounds.width - width - oneWordWidth*2 + 'px';
    }
  },

  onCompositionStart: function(e) {
    //this.input.disabled="";
    this.input.setAttribute('bshow', '1');
    this.updateInputBufferPos();
    this.isComposition = true;
  },

  onCompositionEnd: function(e) {
    //this.input.disabled="";
    this.input.setAttribute('bshow', '0');
    this.input.style.border = 'none';
    this.input.style.width =  '1px';
    this.input.style.height = '1px';
    this.input.style.left =  '-100000px';
    this.input.style.top = '-100000px';
    this.input.style.opacity = '0';
    //this.input.style.top = '0px';
    //this.input.style.left = '-100000px';
    this.isComposition = false;
  },

  fontResize: function() {
    var cols = this.buf ? this.buf.cols : 80;
    var rows = this.buf ? this.buf.rows : 24;

    var innerBounds = this.innerBounds;
    var fontWidth = this.bbsFontSize * 2;

    if (this.screenType === 0 || this.screenType == 1) {
      var width = this.bbsWidth ? this.bbsWidth : innerBounds.width;
      var height = this.bbsHeight ? this.bbsHeight : innerBounds.height;
      if (width === 0 || height === 0) return; // errors for openning in a new window
      width -= 10; // for scroll bar

      var o_h, o_w, i = 4;
      var nowchh = this.chh;
      var nowchw = this.chw;
      do {
        ++i;
        nowchh = i*2;
        nowchw = i;
        o_h = (nowchh) * 24;
        o_w = nowchw * 80;
      } while (o_h <= height && o_w <= width);
      --i;
      nowchh = i*2;
      nowchw = i;
      this.setTermFontSize(nowchw, nowchh);
      fontWidth = nowchh;
    } else {
      this.setTermFontSize(this.bbsFontSize, this.bbsFontSize*2);
    }
    var forceWidthElems = document.querySelectorAll('.wpadding');
    for (var i = 0; i < forceWidthElems.length; ++i) {
      var forceWidthElem = forceWidthElems[i];
      forceWidthElem.style.width = fontWidth + 'px';
    }
  },

  countColFromSiblings: function(elem) {
    var rowCol = { row: 0, col: 0 };
    var parent = elem.parentNode;
    var parentType = parent.getAttribute('type');
    // TODO this was to fix context menu not showing up, but breaks copy ansi
    /*if (parentType === null) {
      // if i am outside of bbswin, pick the first elem
      elem = $('#mainContainer')[0].childNodes[0].childNodes[0];
      parent = elem.parentNode;
      parentType = parent.getAttribute('type');
    }*/

    while (!(parentType == 'bbsrow' || parentType == 'highlight' || parent.tagName == 'A')) {
      parent = parent.parentNode; 
      parentType = parent.getAttribute('type');
    }

    if (parent.tagName == 'A') {
      rowCol.col += parseInt(parent.getAttribute('scol'));
    }

    rowCol.row = parseInt(parent.getAttribute('srow'));
    var children = parent.childNodes;
    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      if (child == elem.parentNode || child == elem) {
        break;
      }
      var textContent = child.textContent;
      textContent = textContent.replace(/\u00a0/g, " ");
      rowCol.col += textContent.u2b().length;
    }
    return rowCol;
  },

  getSelectionColRow: function() {
    var r = window.getSelection().getRangeAt(0);
    var b = r.startContainer;
    var e = r.endContainer;

    var selection = { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } };

    selection.start = this.countColFromSiblings(b);
    if (r.startOffset !== 0) {
      var substr = b.substringData(0, r.startOffset);
      substr = substr.replace(/\u00a0/g, " ");
      selection.start.col += substr.u2b().length;
    }
    selection.end = this.countColFromSiblings(e);
    if (r.endOffset != 1) {
      var substr = e.substringData(0, r.endOffset);
      substr = substr.replace(/\u00a0/g, " ");
      selection.end.col += substr.u2b().length - 1;
    }

    return selection;
  },

  closeSpanIfIsOpen: function() {
    var output = '';
    if (this.openSpan) {
      output += '</span>';
      this.openSpan = false;
    }
    return output;
  },

  setCurColorStyle: function(fg, bg, blink) {
    this.curFg = fg;
    this.curBg = bg;
    this.curBlink = blink;
  },

  getHtmlEntitySafe: function(inputChar) {
    if (inputChar <= ' ' || inputChar == '\x80') // only display visible chars to speed up
      return ' ';
    else if (inputChar == '\x3c')
      return '&lt;';
    else if (inputChar == '\x3e')
      return '&gt;';
    else if (inputChar == '\x26')
      return '&amp;';
    else
      return inputChar;
  },

  setupPicPreviewOnHover: function() {
    var self = this;
    var aNodes = $(".main a[href^='http://ppt.cc/'], .main a[type='p'], .main a[href^='http://imgur.com/'], .main a[href^='https://imgur.com/'], .main a[href^='https://flic.kr/p/'], .main a[href^='https://www.flickr.com/photos/']")
                  .not("a[href^='http://imgur.com/a/'], a[href^='https://imgur.com/a/'], a[href^='http://imgur.com/gallery/'], a[href^='https://imgur.com/gallery/']");
    var onover = function(elem) {
      var setPicPreviewSrc = function(src) {
        var currSrc = self.picPreview.getAttribute('src');
        if (src !== currSrc) {
          self.picLoading.style.display = 'block';
          self.picPreview.setAttribute('src', src);
        } else {
          self.picPreview.style.display = 'block';
        }
        self.picPreviewShouldShown = true;
      };
      var found_flickr = elem.getAttribute('href').match('flic\.kr\/p\/\(\\w\+\)|flickr\.com\/photos\/[\\w@]\+\/\(\\d\+\)');
      if (found_flickr) {
        var flickrBase58Id = found_flickr[1];
        var flickrPhotoId = flickrBase58Id ? base58_decode(flickrBase58Id) : found_flickr[2];
        elem.setAttribute('data-flickr-photo-id', flickrPhotoId);

        return function(e) {
          var currPhotoId = self.picPreview.getAttribute('data-flickr-photo-id');
          if (flickrPhotoId == currPhotoId) {
            self.picPreview.style.display = 'block';
            self.picPreviewShouldShown = true;
          } else {
            self.picPreviewAjaxLoading = true;
            self.picLoading.style.display = 'block';
            var flickrApi = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=c8c95356e465b8d7398ff2847152740e&photo_id="+flickrPhotoId+"&format=json&jsoncallback=?";
            $.getJSON(flickrApi, function(data){
              if (data.photo) {
                var p = data.photo;
                var src = "https://farm"+p.farm+".staticflickr.com/"+p.server+"/"+p.id+"_"+p.secret+".jpg";
                if (self.picPreviewAjaxLoading) {
                  setPicPreviewSrc(src);
                  self.picPreview.setAttribute('data-flickr-photo-id', p.id);
                }
                self.picPreviewAjaxLoading = false;
              }
            });
          }
        };
      } else if (elem.getAttribute('href').indexOf('flickr.com/photos/') < 0) {  
        // handle with non-photo flickr urls, such as albums or sets, and straight image links, imgur urls. 
        return function(e) {
          var href = elem.getAttribute('href');
          var type = elem.getAttribute('type');
          var src = (type == 'p') ? href : (href.indexOf('imgur.com') > 0) ? href.replace(/(http(s)?):\/\/imgur.com/, "$1://i.imgur.com") + '.jpg' : href + '@.jpg';
          setPicPreviewSrc(src);
        };
      }
    };
    var onout = function(e) {
      self.picPreviewShouldShown = false;
      self.picPreviewAjaxLoading = false;
      self.picPreview.style.display = 'none';
      self.picLoading.style.display = 'none';
    };
    for (var i = 0; i < aNodes.length; ++i) {
      var aNode = aNodes[i];
      aNode.addEventListener('mouseover', onover(aNode));
      aNode.addEventListener('mouseout', onout);
    }
  },

  showWaterballNotification: function() {
    if (!this.enableNotifications) {
      return;
    }
    var app = this.bbscore;
    //console.log('message from ' + this.waterball.userId + ': ' + this.waterball.message); 
    var title = app.waterball.userId + ' ' + i18n('notification_said');
    if (this.titleTimer) {
      this.titleTimer.cancel();
      this.titleTimer = null;
    }
    this.titleTimer = setTimer(true, function() {
      if (document.title == app.connectedUrl.site) {
        document.title = title + ' ' + app.waterball.message;
      } else {
        document.title = app.connectedUrl.site;
      }
    }, 1500);
    var options = {
      icon: 'icon_128.png',
      body: app.waterball.message,
      tag: app.waterball.userId
    };
    this.notif = new Notification(title, options);
    this.notif.onclick = function() {
      window.focus();
    };
  },

  populateEasyReadingPage: function() {
    if (this.buf.pageState == 3 && this.buf.prevPageState == 3) {
      this.mainContainer.style.paddingBottom = '1em';
      var lastRowText = this.buf.getRowText(23, 0, this.buf.cols);
      var result = lastRowText.parseStatusRow();
      if (result) {
        // row index start with 4 or below will cause duplicated first row of next page
        // 2015-07-04: better way is to view the row 3 and row 4 as one wrapped line
        /*
        if (result.rowIndexStart < 5) {
          result.rowIndexStart -= 1;
        }
        */
        var rowOffset = this.buf.pageLines.length-1;
        var beginIndex = 1;
        var atLastPage = false;
        if ((result.pageIndex == result.pageTotal && result.pagePercent == 100) || 
            result.rowIndexStart != this.actualRowIndex) { // at last page
          atLastPage = result.rowIndexStart != this.actualRowIndex;
          // find num of rows between actualRowIndex and rowIndexStart
          var numRows = 0;
          for (var i = result.rowIndexStart; i < this.actualRowIndex + 1; ++i) {
            numRows += this.buf.pageWrappedLines[i];
          }
          beginIndex = numRows;
          rowOffset -= beginIndex-1;
        }

        for (var i = beginIndex; i < this.htmlRowStrArray.length-1; ++i) {
          if (i > 0 && this.buf.isTextWrappedRow(i-1)) {
            this.buf.pageWrappedLines[this.actualRowIndex] += 1;
            // if the second row is the wrapped line from first row 
            if (!atLastPage && i == beginIndex) {
              beginIndex++;
            }
          } else {
            this.buf.pageWrappedLines[++this.actualRowIndex] = 1;
          }
          this.htmlRowStrArray[i] = this.htmlRowStrArray[i].replace(/(?: arow="\d+")* srow="\d+">/g, ' arow="'+this.actualRowIndex+'" srow="'+(rowOffset+i)+'">');
        }
        this.mainContainer.innerHTML += this.htmlRowStrArray.slice(beginIndex, -1).join('');
        this.findPttWebUrlAndInitFbSharing();
        this.embedPicAndVideo();
        // deep clone lines for selection (getRowText and get ansi color)
        this.buf.pageLines = this.buf.pageLines.concat(JSON.parse(JSON.stringify(this.buf.lines.slice(beginIndex, -1))));
      }
      this.buf.prevPageState = 3;
    } else {
      this.mainContainer.style.paddingBottom = '';
      this.actualRowIndex = 0;
      this.buf.pageWrappedLines = [];
      if (this.buf.pageState == 3) {
        var lastRowText = this.buf.getRowText(23, 0, this.buf.cols);
        for (var i = 0; i < this.htmlRowStrArray.length-1; ++i) {
          if (i == 4 || i > 0 && this.buf.isTextWrappedRow(i-1)) { // row with i == 4 and the i == 3 is the wrapped line
            this.buf.pageWrappedLines[this.actualRowIndex] += 1;
          } else {
            this.buf.pageWrappedLines[++this.actualRowIndex] = 1;
          }
          this.htmlRowStrArray[i] = this.htmlRowStrArray[i].replace(/ srow=/g, ' arow="'+this.actualRowIndex+'" srow=');
        }
        this.mainContainer.innerHTML = this.htmlRowStrArray.slice(0, -1).join('');
        this.lastRowDiv.innerHTML = this.lastRowDivContent;
        this.lastRowDiv.style.display = 'block';
        this.hideFbSharing = false;
        this.findPttWebUrlAndInitFbSharing();
        this.embedPicAndVideo();
        // deep clone lines for selection (getRowText and get ansi color)
        this.buf.pageLines = this.buf.pageLines.concat(JSON.parse(JSON.stringify(this.buf.lines.slice(0, -1))));
      } else {
        this.lastRowDiv.style.display = '';
        this.replyRowDiv.style.display = '';
        this.fbSharingDiv.style.display = '';
        this.hideFbSharing = true;
        // clear the deep cloned copy of lines
        this.buf.pageLines = [];
        this.mainContainer.innerHTML = this.htmlRowStrArray.join('');
      }
      this.buf.prevPageState = this.buf.pageState;
    }
  },

  updateFbSharing: function(pttUrl) {
    if (this.hideFbSharing) 
      return;
    var self = this;
    this.fbSharingDiv.childNodes[0].setAttribute('data-href', pttUrl);
    FB.XFBML.parse(document.getElementById('fbSharing'), function() {
      if (self.hideFbSharing) {
        return;
      }
      self.updateFbSharingPos();
      self.fbSharingDiv.style.display = 'block';
    });
  },

  updateFbSharingPos: function() {
    var firstGridOffset = this.firstGridOffset;
    var bottomOffset = firstGridOffset.top + (this.chh - 20) /2 -1 + 'px';
    var marginLeft = this.firstGridOffset.left + 10 + 'px';
    if (this.scaleX != 1 || this.scaleY != 1) {
      marginLeft = this.bbsViewMargin + 10 + 'px';
      bottomOffset  = this.bbsViewMargin + (this.chh * this.scaleY - 20)/2 + 'px';
    }
    this.fbSharingDiv.style.bottom = bottomOffset;
    this.fbSharingDiv.style.marginLeft = marginLeft;
  },

  findPttWebUrlAndInitFbSharing: function() {
    if (this.hideFbSharing)
      return;

    var aNodes = document.querySelectorAll(".main a[href^='http://www.ptt.cc/bbs/']");
    for (var i = 0; i < aNodes.length; ++i) {
      var aNode = aNodes[i];
      if (aNode.previousSibling && aNode.previousSibling.textContent.replace(/\u00a0/g, ' ') == '※ 文章網址: ') {
        var href = aNode.getAttribute('href');
        this.updateFbSharing(href);
      }
    }
  },

  embedPicAndVideo: function() {
    var aNodes = $(".main a[type='p'], .main a[href^='http://imgur.com/'], .main a[href^='https://imgur.com/'], .main a[href^='https://flic.kr/'], .main a[href^='https://www.flickr.com/photos/']");
    var getPhotoInfoCallback = function(data){
      if (data.photo) {
        var p = data.photo;
        var src = "https://farm"+p.farm+".staticflickr.com/"+p.server+"/"+p.id+"_"+p.secret+".jpg";
        var theANodes = $('a[data-flickr-photo-id="'+p.id+'"]');
        var imgNode = document.createElement('img');
        imgNode.setAttribute('class', 'easyReadingImg');
        imgNode.setAttribute('src', src);
        imgNode.setAttribute('data-flickr-photo-id', p.id);
        imgNode.style.webkitTransform = 'scale('+Math.floor(1/this.scaleX*100)/100+','+Math.floor(1/this.scaleY*100)/100+')';
        // 因為無法指定 append 的行數，但畫面可能出現重複的 url，加過一次後，把 id 存起來，避免重複 append
        var hasFlickrPhotoIdSelector = ':has(img[data-flickr-photo-id="'+p.id+'"])';
        theANodes.parent().not(hasFlickrPhotoIdSelector).append(imgNode);
        theANodes.attr('view_shown', 'true');
      }
    };
    var getImgurAlbumInfoCallback = function(data){
      var images = data.data.images;
      var albumId = data.data.id;
      images.forEach(function(i){
        var theANodes = $('a[data-imgur-aubum-id="'+albumId+'"]');
        var src = i.link;
        var imgNode = document.createElement('img');
        imgNode.setAttribute('class', 'easyReadingImg');
        imgNode.setAttribute('src', src);
        imgNode.setAttribute('data-imgur-photo-id', i.id);
        imgNode.style.webkitTransform = 'scale('+Math.floor(1/this.scaleX*100)/100+','+Math.floor(1/this.scaleY*100)/100+')';
        // 因為無法指定 append 的行數，但畫面可能出現重複的 url，加過一次後，把 id 存起來，避免重複 append
        var hasImgurImageIdSelector = ':has(img[data-imgur-photo-id="'+i.id+'"])';
        theANodes.parent().not(hasImgurImageIdSelector).append(imgNode);
        theANodes.attr('view_shown', 'true');
      });
    };
    var setAuthorizationHeaderForImgurApi = function(xhr) { xhr.setRequestHeader('Authorization', 'Client-ID 66f9b381f0785a5'); };

    for (var i = 0; i < aNodes.length; ++i) {
      var aNode = aNodes[i];
      if (aNode.getAttribute('view_shown')) {
        continue;
      }
      var href = aNode.getAttribute('href');
      var found_flickr = href.match('flic\.kr\/p\/\(\\w\+\)|flickr\.com\/photos\/[\\w@]\+\/\(\\d\+\)');
      if (found_flickr) {
        var flickrBase58Id = found_flickr[1];
        var flickrPhotoId = flickrBase58Id ? base58_decode(flickrBase58Id) : found_flickr[2];
        var flickrApi = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=c8c95356e465b8d7398ff2847152740e&photo_id="+flickrPhotoId+"&format=json&jsoncallback=?";
        $.getJSON(flickrApi, getPhotoInfoCallback);
      } else if (href.indexOf('flickr.com/photos/') < 0) {
        // handle with non-photo flickr urls, such as albums or sets, and straight image links, imgur urls.
        var isImgurAlbum = href.match('imgur\.com\/\(a|gallery\)\/\(\\w\+\)');
        if (isImgurAlbum) {
          var imgurAlbumId = isImgurAlbum[2];
          var imgurAlbumApi = 'https://api.imgur.com/3/album/'+imgurAlbumId;
          aNode.setAttribute('data-imgur-aubum-id', imgurAlbumId);
          $.ajax({
            url: imgurAlbumApi,
            type: 'GET',
            dataType: 'json',
            success: getImgurAlbumInfoCallback,
            beforeSend: setAuthorizationHeaderForImgurApi // need to send auth header to access public resources
          });
        } else {
          var type = aNode.getAttribute('type');
          var src = (type == 'p') ? href : (href.indexOf('imgur.com') > 0) ? href.replace(/(http(s)?):\/\/imgur.com/, "$1://i.imgur.com") + '.jpg' : '';
          if (src) {
            var imgNode = document.createElement('img');
            imgNode.setAttribute('class', 'easyReadingImg');
            imgNode.setAttribute('src', src);
            imgNode.style.webkitTransform = 'scale('+Math.floor(1/this.scaleX*100)/100+','+Math.floor(1/this.scaleY*100)/100+')';
            aNode.parentNode.appendChild(imgNode);
          }

          aNode.setAttribute('view_shown', 'true');
        }
      }
    }

    var vNodes = document.querySelectorAll(".main a");
    for (var i = 0; i < vNodes.length; ++i) {
      var vNode = vNodes[i];
      if (vNode.getAttribute('view_shown')) {
        continue;
      }
      var href = vNode.getAttribute('href');
      if (!href)
        continue;
      var youtubeShortCode = href.parseYoutubeUrl();
      if (youtubeShortCode) {
        var divNode = document.createElement('div');
        divNode.setAttribute('class', 'easyReadingVideo');
        divNode.style.webkitTransform = 'scale('+Math.floor(1/this.scaleX*100)/100+','+Math.floor(1/this.scaleY*100)/100+')';
        divNode.innerHTML = '<iframe width="640" height="385" src="//www.youtube.com/embed/'+youtubeShortCode+'?rel=0" frameborder="0" allowfullscreen></iframe>';
        vNode.parentNode.appendChild(divNode);
      }

      vNode.setAttribute('view_shown', 'true');
    }
  },

  easyReadingOnKeyUp: function(e) {
    var conn = this.conn;
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
      switch (e.keyCode) {
        case 32: // spacebar
          if (this.mainDisplay.scrollTop >= this.mainContainer.clientHeight - this.chh * this.buf.rows) {
            this.buf.cancelPageDownAndResetPrevPageState();
            conn.send(' ');
          } else {
            this.mainDisplay.scrollTop += this.chh * this.easyReadingTurnPageLines;
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case 187: // =
          this.buf.cancelPageDownAndResetPrevPageState();
          conn.send('=');
          break;
        case 189: // -
          this.buf.cancelPageDownAndResetPrevPageState();
          conn.send('-');
          break;
        case 219: // [
          this.buf.cancelPageDownAndResetPrevPageState();
          conn.send('[');
          break;
        case 221: // ]
          this.buf.cancelPageDownAndResetPrevPageState();
          conn.send(']');
          break;
        default: 
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    } else if (!e.ctrlKey && !e.altKey && e.shiftKey) {
      if (e.keyCode == 187) { // +
        this.buf.cancelPageDownAndResetPrevPageState();
        conn.send('+');
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  },

  easyReadingOnKeyDown: function(e) {
    var conn = this.conn;
    this.easyReadingKeyDownKeyCode = e.keyCode;

    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
      if ((e.keyCode > 48 && e.keyCode < 58) || e.location == 3) { // 1 ~ 9 or num pad keys
        if (e.keyCode == 109 || e.keyCode == 107) { // for the + or - at numpad
          this.buf.cancelPageDownAndResetPrevPageState();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.keyCode == 229) { // in chinese IME mode
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      switch (e.keyCode) {
        case 8: // backspace
          if (this.mainDisplay.scrollTop === 0) {
            this.buf.cancelPageDownAndResetPrevPageState();
            conn.send('\x1b[D\x1b[A\x1b[C');
          } else {
            this.mainDisplay.scrollTop -= this.chh * this.easyReadingTurnPageLines;
          }
          break;
        case 27: //ESC
          conn.send('\x1b');
          break;
        case 32: //Spacebar
          if (this.mainDisplay.scrollTop >= this.mainContainer.clientHeight - this.chh * this.buf.rows) {
            this.buf.cancelPageDownAndResetPrevPageState();
          } else {
            this.mainDisplay.scrollTop += this.chh * this.easyReadingTurnPageLines;
            e.preventDefault();
            e.stopPropagation();
          }
          break;
        case 33: //Page Up
          this.mainDisplay.scrollTop -= this.chh * this.easyReadingTurnPageLines;
          break;
        case 34: //Page Down
          this.mainDisplay.scrollTop += this.chh * this.easyReadingTurnPageLines;
          break;
        case 35: //End
          if (this.bbscore.endTurnsOnLiveUpdate) {
            this.bbscore.onLiveHelperEnableClicked(false);
          } else {
            this.mainDisplay.scrollTop = this.mainContainer.clientHeight;
          }
          break;
        case 36: //Home
          this.mainDisplay.scrollTop = 0;
          break;
        case 37: //Arrow Left
          this.buf.sendCommandAfterUpdate = 'skipOne';
          if(this.checkLeftDB())
            conn.send('\x1b[D\x1b[D');
          else
            conn.send('\x1b[D');
          break;
        case 38: //Arrow Up
          if (this.mainDisplay.scrollTop === 0) {
            this.buf.cancelPageDownAndResetPrevPageState();
            conn.send('\x1b[D\x1b[A\x1b[C');
          } else {
            this.mainDisplay.scrollTop -= this.chh;
          }
          break;
        case 39: //Arrow Right
          if (this.mainDisplay.scrollTop >= this.mainContainer.clientHeight - this.chh * this.buf.rows) {
            this.buf.cancelPageDownAndResetPrevPageState();
            if(this.checkCurDB())
              conn.send('\x1b[C\x1b[C');
            else
              conn.send('\x1b[C');
          } else {
            this.mainDisplay.scrollTop += this.chh * this.easyReadingTurnPageLines;
          }
          break;
        case 13: //Enter
        case 40: //Arrow Down
          if (this.mainDisplay.scrollTop >= this.mainContainer.clientHeight - this.chh * this.buf.rows) {
            this.buf.cancelPageDownAndResetPrevPageState();
            conn.send('\x1b[D\x1b[B\x1b[C');
          } else {
            this.mainDisplay.scrollTop += this.chh;
          }
          break;
        case 45: //Insert
          conn.send('\x1b[2~');
          break;
        case 46: //DEL
          if (this.checkCurDB())
            conn.send('\x1b[3~\x1b[3~');
          else
            conn.send('\x1b[3~');
          break;
        case 84: // t
          if (this.mainDisplay.scrollTop >= this.mainContainer.clientHeight - this.chh * this.buf.rows) {
            this.buf.cancelPageDownAndResetPrevPageState();
          } else {
            this.mainDisplay.scrollTop += this.chh * this.easyReadingTurnPageLines;
            e.preventDefault();
            e.stopPropagation();
          }
          break;

        case 65: // a
        case 66: // b
        case 70: // f
        case 187: // =
        case 189: // -
        case 219: // [
        case 221: // ]
          this.buf.cancelPageDownAndResetPrevPageState();
          break;
        case 48: // 0
        case 71: // g
          this.mainDisplay.scrollTop = 0;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 74: // j
          this.mainDisplay.scrollTop += this.chh;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 75: // k
          this.mainDisplay.scrollTop -= this.chh;
          e.stopPropagation();
          e.preventDefault();
          break;

        // block
        case 72:  // h
          // block help view
          // optionally show my own help
        case 9:   // tab
        case 79:  // o (options setting)
        case 80:  // p (playing animation)
        case 83:  // s
        case 186: // ; (go to page)
        case 188: // , (shift left)
        case 190: // . (shift right)
        case 191: // / (search)
        case 220: // \ (setup color display mode)
          e.preventDefault();
          e.stopPropagation();
          break;

      }
    } else if (!e.ctrlKey && e.altKey && !e.shiftKey) {
      if (e.keyCode == 87) {// alt+w
        conn.send('^W'.unescapeStr());
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (e.keyCode == 82) { // alt+r
        this.bbscore.onLiveHelperEnableClicked(false);
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (e.keyCode == 84) { // alt+t
        conn.send('^T'.unescapeStr());
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    } else if (e.ctrlKey && !e.altKey && !e.shiftKey) {
      // Control characters
      // Ctrl + @, NUL, is not handled here
      if ((e.keyCode == 99 || e.keyCode == 67) && !window.getSelection().isCollapsed) { //^C , do copy
        var selectedText = window.getSelection().toString().replace(/\u00a0/g, " ");
        this.bbscore.doCopy(selectedText);
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (e.keyCode == 97 || e.keyCode == 65) {    // ^A
        this.bbscore.doSelectAll();
      } else if ( e.keyCode == 70 || e.keyCode == 102 ) { // ^F 
        this.mainDisplay.scrollTop += this.chh * this.easyReadingTurnPageLines;
      } else if ( e.keyCode == 66 || e.keyCode == 98 ) {  // ^B 
        this.mainDisplay.scrollTop -= this.chh * this.easyReadingTurnPageLines;
      } else if ( e.keyCode == 72 || e.keyCode == 104 ) { // ^H
        if (this.mainDisplay.scrollTop === 0) {
          this.buf.cancelPageDownAndResetPrevPageState();
          conn.send('\x1b[D\x1b[A\x1b[C');
        } else {
          this.mainDisplay.scrollTop -= this.chh * this.easyReadingTurnPageLines;
        }
      }
      e.preventDefault();
      e.stopPropagation();
      return;
    } else if (!e.ctrlKey && !e.altKey && e.shiftKey) {
      switch(e.keyCode) {
        case 65: // A
        case 66: // B
        case 70: // F
          this.buf.cancelPageDownAndResetPrevPageState();
          break;
        case 52: // $
        case 71: // G
          this.mainDisplay.scrollTop = this.mainContainer.clientHeight;
          e.preventDefault();
          e.stopPropagation();
          break;
        case 187: // +
          this.buf.cancelPageDownAndResetPrevPageState();
          break;
        // block
        case 72: // H
          // block help view
          // optionally show my own help
        case 9:   // tab
        case 51:  // #
        case 79:  // O (options setting)
        case 80:  // P (playing animation)
        case 186: // : (go to line)
        case 188: // < (shift left)
        case 190: // > (shift right)
          e.preventDefault();
          e.stopPropagation();
          break;
      }
    } else if (e.ctrlKey && !e.altKey && e.shiftKey) {
      switch(e.keyCode) {
      case 50: // @
      case 54: // ^
      case 109: // _
      case 191: // ?
        e.preventDefault();
        e.stopPropagation();
        break;
      case 86: //ctrl+shift+v
        this.bbscore.doPaste();
        e.preventDefault();
        e.stopPropagation();
        break;
      }
    }
  },

  updateEasyReadingReplyTextWithHtmlStr: function(htmlStr) {
    var replyNode = this.replyRowDiv.childNodes[0];
    replyNode.innerHTML = '<span style="background-color:black;">'+htmlStr+'</span>';
    this.replyRowDiv.style.display = 'block';
  },

  updateEasyReadingPushInitTextWithHtmlStr: function(htmlStr) {
    this.hideFbSharing = true;
    this.fbSharingDiv.style.display = '';
    var pushNode = this.lastRowDiv.childNodes[0];
    pushNode.innerHTML = '<span style="background-color:black;">'+htmlStr+'</span>';
  }

};

// To decode base58 of flickr photo id
// ref: https://www.flickr.com/groups/51035612836@N01/discuss/72157616713786392/72157620931323757
function base58_decode(snipcode)
{
    var alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    var num = snipcode.length;
    var decoded = 0;
    var multi = 1;
    for (var i = (num-1); i >= 0; i--) {
        decoded = decoded + multi * alphabet.indexOf(snipcode[i]);
        multi = multi * alphabet.length;
    }
    return decoded;
}
