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

  // Cursor
  this.cursorX = 0;
  this.cursorY = 0;

  this.deffg = 7;
  this.defbg = 0;
  this.curFg = 7;
  this.curBg = 0;
  this.curBlink = false;
  this.openSpan = false;

  this.doHighlightOnCurRow = false;

  this.curRow = 0;
  this.curCol = 0;

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
  mainDiv.innerHTML = this.htmlRowStrArray.join('');
  this.BBSWin.appendChild(mainDiv);
  this.mainDisplay = mainDiv;
  this.mainDisplay.style.border = '0px';
  this.setFontFace('MingLiu,monospace');

  this.picPreviewShouldShown = false;

  var self = this;
  this.input.addEventListener('compositionstart', function(e) {
    self.onCompositionStart(e);
    self.bbscore.setInputAreaFocus();
  }, false);

  this.input.addEventListener('compositionend', function(e) {
    self.onCompositionEnd(e);
    self.bbscore.setInputAreaFocus();
  }, false);

  this.input.addEventListener('compositionupdate', function(e) {
    // change width according to input
    var wordCounts = e.data.u2b().length;
    // chh / 2 - 2 because border of 1
    var oneWordWidth = (self.chh/2-2);
    var width = oneWordWidth*wordCounts;
    self.input.style.width  = width + 'px';
    var bounds = self.innerBounds;
    if (parseInt(self.input.style.left) + width + oneWordWidth*2 >= bounds.width) {
      self.input.style.left = bounds.width - width - oneWordWidth*2 + 'px';
    }
  }, false);

  addEventListener('keydown', function(e) {
    if(e.keyCode > 15 && e.keyCode < 19)
      return; // Shift Ctrl Alt (19)
    if (self.bbscore.modalShown)
      return;
    if (document.getElementById('connectionAlert').style.display != 'none' && e.keyCode == 13) {
      return;
    }
    self.onkeyDown(e);
  }, false);

  addEventListener('keyup', function(e) {
    if(e.keyCode > 15 && e.keyCode < 19)
      return; // Shift Ctrl Alt (19)
    if (self.bbscore.modalShown)
      return;
    if (document.getElementById('connectionAlert').style.display != 'none' && e.keyCode == 13) {
      document.getElementById('connectionAlertReconnect').click();
      return;
    }
    // set input area focus whenever key down even if there is selection
    self.bbscore.setInputAreaFocus();
  }, false);

  this.input.addEventListener('input', function(e) {
    if (self.isComposition)
      return;
    if (e.target.value) {
      self.onTextInput(e.target.value);
    }
    e.target.value='';
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
    this.mainDisplay.style.fontFamily = this.fontFace;
    document.getElementById('cursor').style.fontFamily = this.fontFace;
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
    if (forceWidth != 0) {
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
    if ((this.openSpan && (fg == this.curFg && bg == this.curBg && ch.blink == this.curBlink)) && forceWidth == 0) {
      return char1;
    }

    s1 += this.closeSpanIfIsOpen();
    if (fg == this.deffg && bg == this.defbg && !ch.blink && forceWidth == 0) { // default colors
      this.setCurColorStyle(fg, bg, false);
      s1 += char1;
    } else if (forceWidth == 0) { // different colors, so create span
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
      s0 += '<a srow="'+row+'" scol="'+col+'" class="y q'+this.deffg+' b'+this.defbg+'" href="' +ch.getFullURL() + '"' + this.prePicRel( ch.getFullURL()) + ' rel="noreferrer" target="_blank">';
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
      if (lineChanged == false && !force)
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

        // check blacklist for user and fade row
        if (this.bbscore.pref.enableBlacklist) {
          var rowText = this.buf.getRowText(row, 0, this.buf.cols);
          var userid = '';
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
          tmp.push('<span type="highlight" srow="'+row+'" class="b'+this.defbg+'">');

        for (var j = 0; j < cols; ++j)
          tmp.push(outhtml[j].getHtml());

        if (this.doHighlightOnCurRow)
          tmp.push('</span>');

        changedLineHtmlStr = tmp.join('');
        if (changedLineHtmlStrs.length < fullUpdateRowThreshold) { // only store up to the threshold
          changedLineHtmlStrs.push(changedLineHtmlStr);
          changedRows.push(row);
        }
        this.htmlRowStrArray[row] = '<span type="bbsrow" srow="'+row+'"'+ (shouldFade ? ' style="opacity:0.2"' : '') +'>' + changedLineHtmlStr + '</span>';
        anylineUpdate = true;
        lineChangeds[row] = false;
        lineChangedCount += 1;
      }
    }

    if (anylineUpdate) {
      if (lineChangedCount > fullUpdateRowThreshold) {
        this.mainDisplay.innerHTML = this.htmlRowStrArray.join('');
      } else {
        for (var i = 0; i < changedRows.length; ++i) {
          this.mainDisplay.childNodes[changedRows[i]].innerHTML = changedLineHtmlStrs[i];
        }
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


  onTextInput: function(text, isPasting) {
    this.resetCursorBlink();
    var telnet = this.bbscore.telnetCore;
    if (isPasting) {
      text = text.replace(/\r\n/g, '\r');
      text = text.replace(/\n/g, '\r');
      text = text.replace(/\r/g, this.EnterChar);

      if(text.indexOf('\x1b') < 0 && telnet.lineWrap > 0) {
        text = text.wrapText(telnet.lineWrap, this.EnterChar);
      }

      //FIXME: stop user from pasting DBCS words with 2-color
      text = text.replace(/\x1b/g, telnet.EscChar);
    }
    this.conn.convSend(text);
  },

  onkeyDown: function(e) {
    // dump('onKeyPress:'+e.charCode + ', '+e.keyCode+'\n');
    var conn = this.conn;
    this.resetCursorBlink();

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
        conn.send('\x1b[4~');
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
        return;
      } else if (e.keyCode == 97 || e.keyCode == 65) {
        this.bbscore.doSelectAll();
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (e.keyCode >= 65 && e.keyCode <= 90) { // A-Z key
        var charCode = e.keyCode - 64;
      } else if (e.keyCode >= 219 && e.keyCode <= 221) // [ \ ]
        var charCode = e.keyCode - 192;
    } else if (!e.ctrlKey && e.altKey && !e.shiftKey) {
      if (e.keyCode == 87) {// alt+w
        conn.send('^W'.unescapeStr());
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    } else if (e.ctrlKey && !e.altKey && e.shiftKey) {
      switch(e.keyCode) {
      case 50: // @
        var charCode = 0;
        break;
      case 54: // ^
        var charCode = 30;
        break;
      case 109: // _
        var charCode = 31;
        break;
      case 191: // ?
        var charCode = 127;
        break;
      case 86: //ctrl+shift+v
        this.bbscore.doPaste();
        e.preventDefault();
        e.stopPropagation();
        var charCode = 0;
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
      } else if(charCode == 5) { //e
        sendCode = false;
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
    this.mainDisplay.style.fontSize = this.chh + 'px';
    this.mainDisplay.style.lineHeight = this.chh + 'px';
    this.bbsCursor.style.fontSize = this.chh + 'px';
    this.bbsCursor.style.lineHeight = this.chh + 'px';
    this.mainDisplay.style.overflow = 'hidden';
    this.mainDisplay.style.textAlign = 'left';
    this.mainDisplay.style.width = this.chw*this.buf.cols + 'px';
    if (this.verticalAlignCenter && this.chh*this.buf.rows < innerBounds.height)
      this.mainDisplay.style.marginTop = ((innerBounds.height-this.chh*this.buf.rows)/2) + this.bbsViewMargin + 'px';
    else
      this.mainDisplay.style.marginTop =  this.bbsViewMargin + 'px';
    if (this.fontFitWindowWidth)
      this.scaleX = Math.floor(innerBounds.width / (this.chw*this.buf.cols) * 100)/100;
    else
      this.scaleX = 1;

    if (this.scaleX == 1) {
      this.mainDisplay.style.webkitTransform = 'none';
    } else {
      //this.mainDisplay.style.transform = 'scaleX('+this.scaleX+')'; // chrome not stable support yet!
      this.mainDisplay.style.webkitTransform = 'scaleX('+this.scaleX+')';
      if(this.horizontalAlignCenter)
        this.mainDisplay.style.webkitTransformOriginX = 'center';
      else
        this.mainDisplay.style.webkitTransformOriginX = 'left';
    }

    this.firstGridOffset = this.bbscore.getFirstGridOffsets();

    this.updateCursorPos();
  },

  convertMN2XYEx: function(cx, cy) {
    var origin;
    var w = this.innerBounds.width;
    if(this.horizontalAlignCenter && this.scaleX!=1)
      origin = [((w - (this.chw*this.buf.cols)*this.scaleX)/2) + this.bbsViewMargin, this.firstGridOffset.top];
    else
      origin = [this.firstGridOffset.left, this.firstGridOffset.top];
    var realX = origin[0] + (cx) * this.chw * this.scaleX;
    var realY = origin[1] + (cy) * this.chh +1;
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

    if (this.scaleX == 1) {
      this.bbsCursor.style.webkitTransform = 'none';
    } else {
      this.bbsCursor.style.webkitTransform = 'scaleX('+this.scaleX+')';
      this.bbsCursor.style.webkitTransformOriginX = 'left';
    }

    this.bbsCursor.style.left = pos[0] + 'px';
    this.bbsCursor.style.top = (pos[1] - 1) + 'px';
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
        if (this.inputBufferSizeType == 0) {
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

    if (this.screenType == 0 || this.screenType == 1) {
      var width = this.bbsWidth ? this.bbsWidth : innerBounds.width;
      var height = this.bbsHeight ? this.bbsHeight : innerBounds.height;
      if (width == 0 || height == 0) return; // errors for openning in a new window

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
    if (r.startOffset != 0) {
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
      return '&nbsp;';
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
    var aNodes = document.querySelectorAll("a[href^='http://ppt\.cc/'], a[type='p'], a[href^='http://imgur\.com/']");
    var onover = function(elem) {
      return function(e) {
        var href = elem.getAttribute('href');
        var type = elem.getAttribute('type');
        var src = (type == 'p') ? href : (href.indexOf('imgur\.com') > 0) ? href.replace('http://imgur\.com', 'http://i\.imgur\.com') + '.jpg' : href + '@.jpg';
        var currSrc = self.picPreview.getAttribute('src');
        if (src !== currSrc) {
          self.picLoading.style.display = 'block';
          self.picPreview.setAttribute('src', src);
        } else {
          self.picPreview.style.display = 'block';
        }
        self.picPreviewShouldShown = true;
      };
    };
    for (var i = 0; i < aNodes.length; ++i) {
      var aNode = aNodes[i];
      aNode.addEventListener('mouseover', onover(aNode));
      aNode.addEventListener('mouseout', function(e) {
        self.picPreviewShouldShown = false;
        self.picPreview.style.display = 'none';
        self.picLoading.style.display = 'none';
      });
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
      if (document.title == app.connectedUrl) {
        document.title = title + ' ' + app.waterball.message;
      } else {
        document.title = app.connectedUrl;
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
  }
}
