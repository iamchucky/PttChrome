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
  this.useKeyWordTrack = false;
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
  //this.shadowHighLight = false;
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

  //this.DBDetection = false;
  this.blinkShow = false;
  this.blinkOn = false;
  this.doBlink = true;
  this.cursorBlinkTimer = null;

  this.selection = null;
  /*
  this.alertService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
  */
  this.input = document.getElementById('t');
  //this.input.setAttribute('BBSFoxInput', '0');
  //this.input.setAttribute('BBSInputText', '');
  this.symtable = lib.symbolTable;
  this.bbsCursor = document.getElementById('cursor');
  this.trackKeyWordList = document.getElementById('TrackKeyWordList');
  this.BBSWin = document.getElementById('BBSWindow');
  this.pictureWindow = document.getElementById('PictureWindow');
  this.picturePreview = document.getElementById('PicturePreview');
  this.picturePreviewLoading = document.getElementById('PicturePreviewLoading');
  this.pictureInfoLabel = document.getElementById('PicturePreviewInfo');
  this.picLoadingImage = document.getElementById('PicLoadingImage');
  this.scaleX = 1;

  this.BBSROW = new Array(rowCount);

  var mainDiv = document.createElement('div');
  mainDiv.setAttribute('class', 'main');
  for (var i = 0; i < rowCount; ++i) {
    var element = document.createElement('span');
    element.setAttribute('type', 'bbsrow');
    element.setAttribute('srow', i);
    var br = document.createElement('br');
    this.BBSROW[i] = element;
    mainDiv.appendChild(element);
    mainDiv.appendChild(br);
  }
  this.firstGrid = this.BBSROW[0];
  this.BBSWin.appendChild(mainDiv);
  this.mainDisplay = mainDiv;
  this.mainDisplay.style.border = '0px';
  this.setFontFace('MingLiu,monospace');

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
    var bounds = self.bbscore.getWindowInnerBounds();
    if (parseInt(self.input.style.left) + width + oneWordWidth*2 >= bounds.width) {
      self.input.style.left = bounds.width - width - oneWordWidth*2 + 'px';
    }
  }, false);

  addEventListener('keydown', function(e) {
    if(e.keyCode > 15 && e.keyCode < 19)
      return; // Shift Ctrl Alt (19)
    if (self.bbscore.modalShown)
      return;
    self.onkeyDown(e);
  }, false);

  addEventListener('keyup', function(e) {
    if(e.keyCode > 15 && e.keyCode < 19)
      return; // Shift Ctrl Alt (19)
    if (self.bbscore.modalShown)
      return;
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

  //init view - start
  var tmp = [];
  for(var col=0; col<80; ++col)
    tmp[col] = '<span style="color:#FFFFFF;background-color:#000000;">&nbsp;</span>';
  for (var row=0 ;row<24 ;++row)
    this.BBSROW[row].innerHTML = tmp.join('');
  //init view - end

}


TermView.prototype = {

  conv: {
    convertStringToUTF8: function(str, charset, skipCheck) {
      if (charset != 'big5')
        return ''; // Not implemented
      return str.b2u(str);
    }
  },

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
      return ' rel="w"';
    else
      return ' rel="p"';
  },

  createTwoColorWord: function(row, col, ch, ch2, char1, char2, fg, fg2, bg, bg2, panding) {
    var col1 = col + 1;
    if (fg != fg2 && bg != bg2) {
      if (!ch.isBlink() && !ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'q'+fg2+ '" t="'+char1+'"><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'b'+bg2+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else if (ch.isBlink() && ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'q'+fg2+ '" t="'+char1+'"><x s="q'+fg+'q'+fg2+'" h="qq"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'b'+bg2+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else if (ch.isBlink() && !ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'q'+fg2+ '" t="'+char1+'"><x s="q'+fg+'q'+fg2+'" h="q'+bg+'q'+fg2+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'b'+bg2+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else {// if(!ch.isBlink() && ch2.isBlink())
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'q'+fg2+ '" t="'+char1+'"><x s="q'+fg+'q'+fg2+'" h="q'+fg+'q'+bg2+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'b'+bg2+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      }
    } else if (fg != fg2 && bg == bg2) {
      if (!ch.isBlink() && !ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'q'+fg2+ '" t="'+char1+'"><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else if (ch.isBlink() && ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'q'+fg2+ '" t="'+char1+'"><x s="q'+fg+'q'+fg2+'" h="qq"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else if (ch.isBlink() && !ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'q'+fg2+ '" t="'+char1+'"><x s="q'+fg+'q'+fg2+'" h="q'+bg+'q'+fg2+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else {// if(!ch.isBlink() && ch2.isBlink())
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'q'+fg2+ '" t="'+char1+'"><x s="q'+fg+'q'+fg2+'" h="q'+fg+'q'+bg+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      }
    } else if (fg == fg2 && bg != bg2) {
      if (!ch.isBlink() && !ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'" t="'+char1+'"><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'b'+bg2+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else if (ch.isBlink() && ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'" t="'+char1+'"><x s="q'+fg+'" h="qq'+bg+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'b'+bg2+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else if (ch.isBlink() && !ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'" t="'+char1+'"><x s="q'+fg+'" h="q'+bg+'q'+fg+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'b'+bg2+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else {// if(!ch.isBlink() && ch2.isBlink())
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q' +fg+'" t="'+char1+'"><x s="q'+fg+'" h="q'+fg+'q'+bg2+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'b'+bg2+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      }
    } else if (fg == fg2 && bg == bg2) {
      if (ch.isBlink() && !ch2.isBlink()) {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q'+fg+'" t="'+char1+'"><x s="q'+fg+'" h="q'+bg+'q'+fg+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      } else {// if(!ch.isBlink() && ch2.isBlink())
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="q'+fg+'" t="'+char1+'"><x s="q'+fg+'" h="q'+fg+'q'+bg+'"></x><span srow="'+row+'" scol="'+col1+'" class="b'+bg+'"'+(panding==0?'':' style="display:inline-block;width:'+panding+'px;"')+'>'+char1+'</span></span>';
        var s2 = '';
        return {s1: s1, s2: s2};
      }
    }
  },

  createNormalWord: function(row, col, ch, ch2, char1, char2, fg, bg, panding, deffg, defbg) {
    //var s1 = '<span class="q' +fg+ 'b' +bg+ (ch.isBlink()?"k":"") +'" ';
    if (fg == deffg && bg == defbg && !ch.isBlink() && panding==0) {
      if (panding == 0)
        return {s1: char1, s2: char2};
      else {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="wpadding" style="display:inline-block;width:'+panding+'px;">' + char1 + '</span>';
        return {s1: s1, s2: ''};
      }
    } else {
        var s1 = '<span srow="'+row+'" scol="'+col+'" class="wpadding q' +fg+ 'b' +bg+'" ';
        s1 += ((panding==0?'':'style="display:inline-block;width:'+panding+'px;"') +'>' + (ch.isBlink()?'<x s="q'+fg+'b'+bg+'" h="qq'+bg+'"></x>':'') + char1 + '</span>');
        return {s1: s1, s2: ''};
    }
  },

  createNormalChar: function(row, col, ch, char1, fg, bg, deffg, defbg) {
    var useHyperLink = this.useHyperLink;
    var s0 = '';
    var s1 = '';
    var s2 = '';
    if (ch.isStartOfURL() && useHyperLink)
      s0 = '<a class="y q'+deffg+'b'+defbg+'" href="' +ch.getFullURL() + '"' + this.prePicRel( ch.getFullURL()) + ' target="_blank">';
    if (ch.isEndOfURL() && useHyperLink)
      s2 = '</a>';
    if (bg==defbg && (fg == deffg || char1 <= ' ') && !ch.isBlink() ) {
      if(char1 <= ' ') // only display visible chars to speed up
        return s0+'&nbsp;'+s2;//return ' ';
      else if(char1 == '\x80') // 128, display ' ' or '?'
        return s0+'&nbsp;'+s2;
      else if(char1 == '\x3c')
        return s0+'&lt;'+s2;
      else if(char1 == '\x3e')
        return s0+'&gt;'+s2;
      else if(char1 == '\x26')
        return s0+'&amp;'+s2;
      else
        return s0+char1+s2;
    } else {
      s1 +='<span srow="'+row+'" scol="'+col+'" '+ (ch.isPartOfURL()?'link="true" ':'') +'class="q' +fg+ 'b' +bg+ '">'+ (ch.isBlink()?'<x s="q'+fg+'b'+bg+'" h="qq'+bg+'"></x>':'');
      if(char1 <= ' ') // only display visible chars to speed up
        s1 += '&nbsp;';
      else if(char1 == '\x80') // 128, display ' ' or '?'
        s1 += '&nbsp;';
      else
        s1 += char1;
      s1 += '</span>';
    }
    return s0+s1+s2;
  },

  redraw: function(force) {

    var cols = this.buf.cols;
    var rows = this.buf.rows;
    //var useKeyWordTrack = this.bbscore.useKeyWordTrack;
    //var ctx = this.ctx;
    var lineChangeds = this.buf.lineChangeds;

    var lines = this.buf.lines;
    var outhtmls = this.buf.outputhtmls;
    var anylineUpdate = false;
    for (var row = 0; row < rows; ++row) {
      var chh = this.chh;
      var deffg = 7;
      var defbg = 0;
      var line = lines[row];
      var outhtml = outhtmls[row];
      var lineChanged = lineChangeds[row];
      if (lineChanged == false && !force)
        continue;
      var lineUpdated = false;
      var chw = this.chw;
      var doHighLight = (this.buf.highlightCursor && this.buf.nowHighlight != -1 && this.buf.nowHighlight == row);

      for (var col = 0; col < cols; ++col) {
        var ch = line[col];
        var outtemp = outhtml[col];

        if (force || ch.needUpdate) {
          lineUpdated = true;
          var fg = ch.getFg();
          var bg = ch.getBg();
          if (doHighLight && !this.shadowHighLight) {
            deffg = 7;
            defbg = this.highlightBG;
            bg = this.highlightBG;
            //fg = 0;
          }
          outtemp.setHtml('');
          if (ch.isLeadByte) { // first byte of DBCS char
            ++col;
            if (col < cols) {
              var ch2 = line[col]; // second byte of DBCS char
              var outtemp2 = outhtml[col];

              var bg2 = ch2.getBg();
              var fg2 = ch2.getFg();
              if (doHighLight && !this.shadowHighLight) {
                bg2 = this.highlightBG;
                //fg2 = 0;
              }
              if (bg!=bg2 || fg!=fg2 || ch.isBlink()!=ch2.isBlink() ) {
                if(ch2.ch=='\x20') { //a LeadByte + ' ' //we set this in '?' + ' '
                  var spanstr = this.createNormalChar(row, col-1, ch, '?', fg, bg, deffg, defbg);
                  outtemp.setHtml(spanstr);
                  spanstr = this.createNormalChar(row, col-1, ch, ' ', fg2, bg2, deffg, defbg);
                  outtemp2.setHtml(spanstr);
                } else { //maybe normal ...
                  var b5=ch.ch + ch2.ch; // convert char to UTF-8 before drawing
                  var u='';
                  if(this.charset == 'UTF-8' || b5.length == 1)
                    u=b5;
                  else
                    //u=this.conn.socket.convToUTF8(b5.charCodeAt(0), b5.charCodeAt(1), 'big5');
                    u=this.conv.convertStringToUTF8(b5, this.charset,  true);
                  if (u) { // can be converted to valid UTF-8
                    if (u.length == 1) { //normal chinese word
                      var code = this.symtable['x'+u.charCodeAt(0).toString(16)];
                      if (code == 1 || code == 2) {
                        var spanstr = this.createTwoColorWord(row, col-1, ch, ch2, u, u, fg, fg2, bg, bg2, this.chh);
                        outtemp.setHtml(spanstr.s1);
                        outtemp2.setHtml(spanstr.s2);
                      } else if (code == 3) { //[4 code char]
                        var spanstr = this.createNormalChar(row, col-1, ch, '?', fg2, bg2, deffg, defbg);
                        outtemp.setHtml(spanstr);
                        spanstr = this.createNormalChar(row, col-1, ch2, '?', fg2, bg2, deffg, defbg);
                        outtemp2.setHtml(spanstr);
                      } else { //if(this.wordtest.offsetWidth==this.chh)
                        var spanstr = this.createTwoColorWord(row, col-1, ch, ch2, u, u, fg, fg2, bg, bg2, 0);
                        outtemp.setHtml(spanstr.s1);
                        outtemp2.setHtml(spanstr.s2);
                      }
                    } else { //a <?> + one normal char // we set this in '?' + ch2
                      var spanstr = this.createNormalChar(row, col-1, ch, '?', fg, bg, deffg, defbg);
                      outtemp.setHtml(spanstr);
                      spanstr = this.createNormalChar(row, col-1, ch, ch2.ch, fg2, bg2, deffg, defbg);
                      outtemp2.setHtml(spanstr);
                    }
                  }
                }
              } else {
                if(ch2.ch == '\x20') { //a LeadByte + ' ' //we set this in '?' + ' '
                  var spanstr = this.createNormalChar(row, col-1, ch, '?', fg, bg, deffg, defbg);
                  outtemp.setHtml(spanstr);
                  spanstr = this.createNormalChar(row, col-1, ch, ' ', fg, bg, deffg, defbg);
                  outtemp2.setHtml(spanstr);
                } else { //maybe normal ...
                  var b5=ch.ch + ch2.ch; // convert char to UTF-8 before drawing
                  var u='';
                  if (this.charset == 'UTF-8' || b5.length == 1)
                    u=b5;
                  else
                    u=this.conv.convertStringToUTF8(b5, this.charset,  true);
                  if (u) { // can be converted to valid UTF-8
                    if (u.length == 1) { //normal chinese word
                      var code = this.symtable['x'+u.charCodeAt(0).toString(16)];
                      if (code == 1 || code == 2) {
                        var spanstr = this.createNormalWord(row, col-1, ch, ch2, u, '', fg, bg, this.chh, deffg, defbg);
                        outtemp.setHtml(spanstr.s1);
                        outtemp2.setHtml(spanstr.s2);
                      } else if(code == 3) { //[4 code char]
                        var spanstr = this.createNormalChar(row, col-1, ch, '?', fg, bg, deffg, defbg);
                        outtemp.setHtml(spanstr);
                        spanstr = this.createNormalChar(row, col-1, ch2, '?', fg, bg, deffg, defbg);
                        outtemp2.setHtml(spanstr);
                      } else { //normal case //if(this.wordtest.offsetWidth==this.chh)
                        //for font test - start

                        //this.wordtest.innerHTML = u; // it's too slow Orz
                        //if(this.wordtest.offsetWidth==this.chw)
                        //  alert('1 : '+ u.charCodeAt(0).toString(16)); //for debug.
                        //else if(this.wordtest.offsetWidth!=this.chh)
                        //  alert('!!!!! : '+ u.charCodeAt(0).toString(16)); //for debug.

                        //for font test - end
                        var spanstr = this.createNormalWord(row, col-1, ch, ch2, u, '', fg, bg, 0, deffg, defbg);
                        outtemp.setHtml(spanstr.s1);
                        outtemp2.setHtml(spanstr.s2);
                      }
                    } else { //a <?> + one normal char // we set this in '?' + ch2
                      var spanstr = this.createNormalChar(row, col-1, ch, '?', fg, bg, deffg, defbg);
                      outtemp.setHtml(spanstr);
                      spanstr = this.createNormalChar(row, col-1, ch, ch2.ch, fg, bg, deffg, defbg);
                      outtemp2.setHtml(spanstr);
                    }
                  }
                }
              }
              line[col].needUpdate=false;
            }
          } else {//NOT LeadByte
            var spanstr = this.createNormalChar(row, col, ch, ch.ch, fg, bg, deffg, defbg);
            outtemp.setHtml(spanstr);
          }
          ch.needUpdate=false;
        }
      }

      if (lineUpdated) {
        lineUpdated = false;
        var tmp = [];

        //
        if (doHighLight) {
          if (this.shadowHighLight)
            tmp.push('<span style="text-shadow: -1px 0 green, 0 1px green, 1px 0 green, 0 -1px green;">'); ////tmp.push('<span style="text-shadow: 0px -11px 10px #C60, 0px -3px 9px #FF0;">');
          else
            tmp.push('<span class="q'+deffg+'b'+defbg+'">');
        }
        for (var j=0 ;j<cols ;++j)
          tmp.push(outhtml[j].getHtml());

        if (doHighLight)
          tmp.push('</span>');

        this.BBSROW[row].innerHTML = tmp.join('');
        anylineUpdate = true;
        lineChangeds[row] = false;
      }
    }

    $("a[href^='http://ppt\.cc/']").hover(function(e) {
      var src = $(this).attr('href') + '@.jpg';
      var currSrc = $('#hoverPPT img').attr('src');
      if (src !== currSrc) {
        $('#hoverPPT img').attr('src', src);
      } else {
        $('#hoverPPT').show();
      }
    }, function(e) {
      $('#hoverPPT').hide();
    });
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
      if ((e.keyCode == 99 || e.keyCode == 67) && !window.getSelection().isCollapsed) //^C , do copy
        return;
      else if (e.keyCode >= 65 && e.keyCode <= 90) // A-Z key
        var charCode = e.keyCode - 64;
      else if (e.keyCode >= 219 && e.keyCode <= 221) // [ \ ]
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
    var innerBounds = this.bbscore.getWindowInnerBounds();
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

    this.updateCursorPos();
  },

  convertMN2XYEx: function(cx, cy) {
    var origin;
    var w = this.bbscore.getWindowInnerBounds().width;
    if(this.horizontalAlignCenter && this.scaleX!=1)
      origin = [((w - (this.chw*this.buf.cols)*this.scaleX)/2) + this.bbsViewMargin, this.firstGrid.offsetTop];
    else
      origin = [this.firstGrid.offsetLeft, this.firstGrid.offsetTop];
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
      var innerBounds = this.bbscore.getWindowInnerBounds();
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

    var innerBounds = this.bbscore.getWindowInnerBounds();

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
      $('.wpadding').css('width', nowchh);
    } else {
      this.setTermFontSize(this.bbsFontSize, this.bbsFontSize*2);
      $('.wpadding').css('width', this.bbsFontSize*2);
    }
  },

  getSelectionColRow: function() {
    var sel = window.getSelection();
    var r = sel.getRangeAt(0);
    var b = r.startContainer;
    var e = r.endContainer;

    var selection = { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } };

    if (b.parentNode.getAttribute('type') === 'bbsrow') {
      selection.start.row = parseInt(b.parentNode.getAttribute('srow'));
      if (b.previousSibling) {
        var textContent = b.previousSibling.textContent;
        textContent = textContent.replace(/\u00a0/g, " ");
        selection.start.col = parseInt(b.previousSibling.getAttribute('scol')) + textContent.u2b().length;
      }
    } else {
      selection.start.row = parseInt(b.parentNode.getAttribute('srow'));
      selection.start.col = parseInt(b.parentNode.getAttribute('scol'));
    }
    if (r.startOffset != 0) {
      var substr = b.substringData(0, r.startOffset);
      substr = substr.replace(/\u00a0/g, " ");
      selection.start.col += substr.u2b().length;
    }
    if (e.parentNode.getAttribute('type') === 'bbsrow') {
      selection.end.row = parseInt(e.parentNode.getAttribute('srow'));
      if (e.previousSibling) {
        var textContent = e.previousSibling.textContent;
        textContent = textContent.replace(/\u00a0/g, " ");
        selection.end.col = parseInt(e.previousSibling.getAttribute('scol')) + textContent.u2b().length;
      }
    } else {
      selection.end.row = parseInt(e.parentNode.getAttribute('srow'));
      selection.end.col = parseInt(e.parentNode.getAttribute('scol'));
    }
    if (r.endOffset != 1) {
      var substr = e.substringData(0, r.endOffset);
      substr = substr.replace(/\u00a0/g, " ");
      selection.end.col += substr.u2b().length - 1;
    }

    return selection;
  }
}
