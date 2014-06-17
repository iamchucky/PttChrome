// Terminal Screen Buffer, displayed by TermView

const termColors=[
    // dark
    '#000000', // black
    '#800000', // red
    '#008000', // green
    '#808000',   // yellow
    '#000080', // blue
    '#800080', // magenta
    '#008080', // cyan
    '#c0c0c0', // light gray
    // bright
    '#808080',   // gray
    '#ff0000', // red
    '#00ff00', // green
    '#ffff00',   // yellow
    '#0000ff', // blue
    '#ff00ff', // magenta
    '#00ffff', // cyan
    '#ffffff' // white
];

const termInvColors=[
    // dark
    '#FFFFFF', // black
    '#7FFFFF', // red
    '#FF7FFF', // green
    '#7F7FFF',   // yellow
    '#FFFF7F', // blue
    '#7FFF7F', // magenta
    '#FF7F7F', // cyan
    '#3F3F3F', // light gray
    // bright
    '#7F7F7F',   // gray
    '#00FFFF', // red
    '#FF00FF', // green
    '#0000FF',   // yellow
    '#FFFF00', // blue
    '#00FF00', // magenta
    '#FF0000', // cyan
    '#000000' // white
];

function TermChar(ch) {
    this.ch=ch;
    this.resetAttr();
    this.needUpdate=false;
    this.isLeadByte=false;
    this.startOfURL=false;
    this.endOfURL=false;
    this.partOfURL=false;
    this.partOfKeyWord=false;
    this.keyWordColor='#ff0000';
    this.fullurl='';
}

// static variable for all TermChar objects
TermChar.defaultFg = 7;
TermChar.defaultBg = 0;

TermChar.prototype={
    copyFrom: function(attr) {
        this.ch=attr.ch;
        this.isLeadByte=attr.isLeadByte;
        this.copyAttr(attr);
    },
    copyAttr: function(attr) {
        this.fg=attr.fg;
        this.bg=attr.bg;
        this.bright=attr.bright;
        this.invert=attr.invert;
        this.blink=attr.blink;
        this.underLine=attr.underLine;
    },
    resetAttr: function() {
        this.fg=7;
        this.bg=0;
        this.bright=false;
        this.invert=false;
        this.blink=false;
        this.underLine=false;
    },
    getFg: function() {
        if(this.invert)
            return this.bright ? (this.bg + 8) : this.bg;
        return this.bright ? (this.fg + 8) : this.fg;
    },
    getBg: function() {
        return this.invert ? this.fg : this.bg;
    },

    isBlink: function() {
        return this.blink;
    },

    isUnderLine: function() {
        return this.underLine;
    },

    isStartOfURL : function() {
       return this.startOfURL;
    },

    isEndOfURL : function() {
       return this.endOfURL;
    },

    isPartOfURL : function() {
       return this.partOfURL;
    },

    isPartOfKeyWord : function() {
       return this.partOfKeyWord;
    },

    getKeyWordColor : function() {
       return this.keyWordColor;
    },

    getFullURL: function() {
        return this.fullurl;
    }
}

function TermHtml() {
    this.html='';
}

TermHtml.prototype={

    setHtml: function(str) {
        this.html=str;
    },

    addHtml: function(str) {
        this.html+=str;
    },

    getHtml: function() {
        return this.html;
    }
}

function TermBuf(cols, rows) {
    this.cols=cols;
    this.rows=rows;
    this.view=null;
    this.cur_x=0;
    this.cur_y=0;
    this.cur_x_sav=-1;
    this.cur_y_sav=-1;
    this.scrollStart=0;
    this.scrollEnd=rows-1;
    this.nowHighlight=-1;
    this.tempMouseCol = 0;
    this.tempMouseRow = 0;
    this.mouseCursor = 0;
    this.highlightCursor = true;
    this.handPointerCursor = true;
    this.useMouseBrowsing = true;
    this.useMouseBrowsingPtt = ((document.location.hostname == 'ptt.cc')||(document.location.hostname == 'bbs.ptt.cc')||(document.location.hostname == 'ptt.twbbs.org'));
    //this.scrollingTop=0;
    //this.scrollingBottom=23;
    this.attr=new TermChar(' ');
    this.newChar=new TermChar(' ');
    this.disableLinefeed=false;
    this.altScreen='';
    this.changed=false;
    this.posChanged=false;
    this.downPostChanged=false;
    this.PageState = 0;
    this.forceFullWidth=false;

    //this.useKeyWordTrack = false;
    this.lines=new Array(rows);
    //this.keyWordLine=new Array(rows);
    this.linesX=new Array(0);
    this.linesY=new Array(0);

    this.outputhtmls = new Array(rows);
    this.lineChangeds = new Array(rows);

    this.viewBufferTimer = 30;

    //this.severNotifyStr = 'server notify';
    //this.severNotifySound = false;
    //this.severNotifyMessage = false;
    //this.notifyBackgroundTab = false;

    //new pref - start
    this.severNotifyStr = '';
    this.notifyWhenBackbround=true;
    this.notifyBySound=true;
    this.notifyByMessage=true;
    //new pref - end

    while(--rows >= 0) {
        var line=new Array(cols);
        var outputhtml=new Array(cols);
        var c=cols;
        while(--c >= 0) {
            line[c]=new TermChar(' ');
            outputhtml[c]= new TermHtml();
        }
        this.lines[rows]=line;
        this.outputhtmls[rows]=outputhtml;
        //this.keyWordLine[rows]=false;
    }
    this.BBSWin = document.getElementById('BBSWindow');
}

TermBuf.prototype={
    /*
    conv: {
        convertStringToUTF8: function(str, charset, skipCheck) {
            if(charset != 'big5')
                return ''; // Not implemented
            return str.b2u();
        }
    },

    conv: Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService),
    */
    timerUpdate: null,

    uriRegEx: /((ftp|http|https|telnet):\/\/([A-Za-z0-9_]+:{0,1}[A-Za-z0-9_]*@)?([A-Za-z0-9_#!:.?+=&%@!\-\/\$\^,;|*~'()]+)(:[0-9]+)?(\/|\/([A-Za-z0-9_#!:.?+=&%@!\-\/]))?)|(pid:\/\/(\d{1,10}))/ig,
    setView: function(view) {
        this.view = view;
    },

    puts: function(str) {
        if(!str)
            return;
        if(this.view && this.view.conn && this.view.charset == 'UTF-8')
            str = this.view.conn.utf8Data(str);
        var cols=this.cols;
        var rows=this.rows;
        var lines=this.lines;
        var n=str.length;
        var line = lines[this.cur_y];
        for(var i=0;i<n;++i) {
            var ch=str[i];
            switch(ch) {
            case '\x07':
                // FIXME: beep (1)Sound (2)AlertNotification (3)change icon
                /*
                var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
                var recentWindow = wm.getMostRecentWindow("navigator:browser");
                if(!recentWindow)
                  continue;
                if(recentWindow.content.document==document && this.notifyWhenBackbround)
                  continue;
                if(this.notifyBySound)
                {
                  var sound = Components.classes["@mozilla.org/sound;1"]
                        .createInstance(Components.interfaces.nsISound);
                  sound.beep();
                }
                if(this.notifyByMessage)
                {
                  this.view.showAlertMessage(document.title, this.severNotifyStr);
                }
                */
                continue;
            case '\b':
                this.back();
                continue;
            case '\r':
                this.carriageReturn();
                continue;
            case '\n':
            case '\f':
            case '\v':
                this.lineFeed();
                line = lines[this.cur_y];
                continue;
            case '\0':
                continue;
            }
            //if( ch < ' ')
            //    //dump('Unhandled invisible char' + ch.charCodeAt(0)+ '\n');

            if(this.cur_x >= cols) {
                // next line
                if(!this.disableLinefeed) this.lineFeed();
                this.cur_x=0;
                line = lines[this.cur_y];
                this.posChanged=true;
            }
            switch(ch) {
            case '\t':
                this.tab();
                break;
            default:
                var ch2 = line[this.cur_x];
                ch2.ch=ch;
                ch2.copyAttr(this.attr);
                ch2.needUpdate=true;
                ++this.cur_x;
                if(ch2.isLeadByte) // previous state before this function
                    line[this.cur_x].needUpdate=true;
                if(this.view.charset == 'UTF-8' && this.isFullWidth(ch) && this.cur_x < cols) {
                    ch2 = line[this.cur_x];
                    ch2.ch='';
                    ch2.copyAttr(this.attr);
                    ch2.needUpdate=true;
                    ++this.cur_x;
                    // assume server will handle mouse moving on full-width char
                }
                this.changed=true;
                this.posChanged=true;
            }
        }
        this.queueUpdate();
    },

    updateCharAttr: function() {
        var cols=this.cols;
        var rows=this.rows;
        var lines=this.lines;
        for(var row=0; row<rows; ++row) {
            var line=lines[row];
            var needUpdate=false;
            for(var col=0; col < cols; ++col) {
                var ch = line[col];
                if(ch.needUpdate)
                    needUpdate=true;
                // all chars > ASCII code are regarded as lead byte of DBCS.
                // FIXME: this is not correct, but works most of the times.
                if( this.isFullWidth(ch.ch) && (col + 1) < cols ) {
                    ch.isLeadByte=true;
                    ++col;
                    var ch0=ch;
                    ch=line[col];
                    if(ch.needUpdate)
                        needUpdate=true;
                    // ensure simutaneous redraw of both bytes
                    if( ch0.needUpdate != ch.needUpdate ) {
                        ch0.needUpdate = ch.needUpdate = true;
                    }
                }
                else if(ch.isLeadByte && (col+1) < cols)
                {
                  var ch2 = line[col+1];
                  ch2.needUpdate=true;
                }
                ch.isLeadByte=false;
            }

            if(needUpdate) { // this line has been changed
                this.lineChangeds[row] = true;
                // perform URI detection again
                // remove all previously cached uri positions
                if(line.uris) {
                    var uris=line.uris;
                    var nuris=uris.length;

                    // FIXME: this is inefficient
                    for(var iuri=0; iuri<nuris;++iuri) {
                        var uri=uris[iuri];
                        line[uri[0]].startOfURL=false;
                        line[uri[0]].endOfURL=false;
                        line[uri[0]].fullurl='';
                        line[uri[1]-1].startOfURL=false;
                        line[uri[1]-1].endOfURL=false;
                        line[uri[1]-1].fullurl='';
                        for(col=uri[0]; col < uri[1]; ++col)
                        {
                            line[col].partOfURL=false;
                            line[col].needUpdate=true;
                        }
                    }
                    line.uris=null;
                }
                var s='';
                for(var col=0; col < cols; ++col)
                    s+=line[col].ch;
                if(this.view.charset != 'UTF-8')
                    s=s.replace(/[^\x00-\x7f]./g,'\xab\xcd');
                else {
                    var str='';
                    for(var i=0; i<s.length; ++i) {
                        str+=s.charAt(i);
                        if(this.isFullWidth(s.charAt(i)))
                            str+=s.charAt(i);
                    }
                    s=str;
                }
                var res;
                var uris=null;
                // pairs of URI start and end positions are stored in line.uri.
                while( (res=this.uriRegEx.exec(s)) != null ) {
                    if(!uris)   uris=new Array();
                    var uri=[res.index, res.index+res[0].length];
                    uris.push(uri);
                    // dump('found URI: ' + res[0] + '\n');
                }

                if(this.view.conn.autoLoginStage > 0)
                  this.view.conn.checkAutoLogin(row);

                if(uris) {
                    line.uris=uris;
                    // dump(line.uris.length + "uris found\n");
                }
                //
                if(line.uris) {
                    var uris=line.uris;
                    var nuris=uris.length;
                    for(var iuri=0; iuri<nuris;++iuri) {
                        var uri=uris[iuri];
                        var urlTemp = '';

                        for(col=uri[0]; col < uri[1]; ++col)
                        {
                          urlTemp+=line[col].ch;
                          line[col].partOfURL=true;
                          line[col].needUpdate=true; //fix link bug
                        }
                        var u;
                        if(this.view.charset != 'UTF-8')
                          u = urlTemp;//this.conv.convertStringToUTF8(urlTemp, this.view.charset,  true);
                        else {
                          var str='';
                          for(var i=0; i<urlTemp.length; ++i) {
                            str+=urlTemp.charAt(i);
                            if(this.isFullWidth(urlTemp.charAt(i)))
                              str+=urlTemp.charAt(i);
                          }
                          u=str;
                        }
                        var urlTemp2 = urlTemp.toLowerCase();
                        line[uri[0]].startOfURL=true;
                        if(urlTemp2.substr(0,6)=='pid://')
                        {
                          line[uri[0]].fullurl='http://www.pixiv.net/member_illust.php?mode=big&illust_id='+urlTemp2.substr(6,15);
                        }
                        else
                        {
                          //var g = encodeURI(u);
                          //line[uri[0]].fullurl=g;
                          line[uri[0]].fullurl=u;
                        }
                        line[uri[1]-1].endOfURL=true;
                        //line[uri[1]-1].needUpdate=true; //fix link bug, some wee need update 2 byte(this byte and prevous byte)
                        //for(col=uri[0]; col < uri[1]; ++col)
                        //  line[col].fullurl=g;
                    }
                }
                //
            }
        }
    },

    clear: function(param) {
        var rows=this.rows;
        var cols=this.cols;
        var lines=this.lines;

        switch(param) {
        case 0:
            var line = lines[this.cur_y];
            var col, row;
            for(col=this.cur_x; col< cols; ++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            for(row=this.cur_y; row < rows; ++row) {
                line = lines[row];
                for(col=0; col< cols; ++col) {
                    line[col].copyFrom(this.newChar);
                    line[col].needUpdate=true;
                }
            }
            break;
        case 1:
            var line;
            var col, row;
            for(row=0; row < this.cur_y; ++row) {
                line = lines[row];
                for(col=0; col< cols; ++col) {
                    line[col].copyFrom(this.newChar);
                    line[col].needUpdate=true;
                }
            }
            line = lines[this.cur_y];
            for(col=0; col< this.cur_x; ++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            break;
        case 2:
            while(--rows >= 0) {
                var col=cols;
                var line=lines[rows];
                while(--col >= 0) {
                    line[col].copyFrom(this.newChar);
                    line[col].needUpdate=true;
                }
            }
            break;
        }
        this.changed=true;
        this.gotoPos(0, 0);
        this.queueUpdate();
    },

    back: function() {
        if(this.cur_x>0) {
            --this.cur_x;
            this.posChanged=true;
            this.queueUpdate();
        }
    },

    tab: function(param) {
        var mod = this.cur_x % 4;
        this.cur_x += 4 - mod;
        if(param > 1) this.cur_x += 4 * (param-1);
        if(this.cur_x >= this.cols)
            this.cur_x = this.cols-1;
        this.posChanged=true;
        this.queueUpdate();
    },

    backTab: function(param) {
        var mod = this.cur_x % 4;
        this.cur_x -= (mod>0 ? mod : 4);
        if(param > 1) this.cur_x -= 4 * (param-1);
        if(this.cur_x < 0)
            this.cur_x = 0;
        this.posChanged=true;
        this.queueUpdate();
    },

    insert: function(param) {
        var line = this.lines[this.cur_y];
        var cols = this.cols;
        var cur_x = this.cur_x;
        if(cur_x>0 && line[cur_x-1].isLeadByte) ++cur_x;
        if(cur_x == cols) return;
        if(cur_x+param >= cols) {
            for(var col=cur_x; col<cols; ++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
        } else {
            while(--param >= 0) {
                var ch=line.pop();
                line.splice(cur_x,0,ch);
                ch.copyFrom(this.newChar);
            }
            for(var col=cur_x; col<cols; ++col)
                line[col].needUpdate=true;
        }
        this.changed=true;
        this.queueUpdate();
    },

    del: function(param) {
        var line = this.lines[this.cur_y];
        var cols = this.cols;
        var cur_x = this.cur_x;
        if(cur_x>0 && line[cur_x-1].isLeadByte) ++cur_x;
        if(cur_x == cols) return;
        if(cur_x+param >= cols) {
            for(var col=cur_x; col<cols; ++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
        } else {
            var n = cols-cur_x-param;
            while(--n >= 0)
                line.splice(cur_x,0,line.pop());
            for(var col=cols-param; col<cols; ++col)
                line[col].copyFrom(this.newChar);
            for(var col=cur_x; col<cols; ++col)
                line[col].needUpdate=true;
        }
        this.changed=true;
        this.queueUpdate();
    },

    eraseChar: function(param) {
        var line = this.lines[this.cur_y];
        var cols = this.cols;
        var cur_x = this.cur_x;
        if(cur_x>0 && line[cur_x-1].isLeadByte) ++cur_x;
        if(cur_x == cols) return;
        var n = (cur_x+param > cols) ? cols : cur_x+param;
        for(var col=cur_x; col<n; ++col) {
            line[col].copyFrom(this.newChar);
            line[col].needUpdate=true;
        }
        this.changed=true;
        this.queueUpdate();
    },

    eraseLine: function(param) {
        var line = this.lines[this.cur_y];
        var cols = this.cols;
        switch(param) {
        case 0: // erase to rigth
            for(var col=this.cur_x;col < cols;++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            break;
        case 1: //erase to left
            var cur_x = this.cur_x;
            for(var col=0;col < cur_x;++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            break;
        case 2: //erase all
            for(var col=0;col < cols;++col) {
                line[col].copyFrom(this.newChar);
                line[col].needUpdate=true;
            }
            break;
        default:
            return;
        }
        this.changed=true;
        this.queueUpdate();
    },

    deleteLine: function(param) {
        var scrollStart=this.scrollStart;
        this.scrollStart=this.cur_y;
        this.scroll(false, param);
        this.scrollStart=scrollStart;
        this.changed=true;
        this.queueUpdate();
    },

    insertLine: function(param) {
        var scrollStart=this.scrollStart;
        if(this.cur_y < this.scrollEnd) {
            this.scrollStart=this.cur_y;
            this.scroll(true, param);
        }
        this.scrollStart=scrollStart;
        this.changed=true;
        this.queueUpdate();
    },

    scroll: function(up, n) {
        var scrollStart=this.scrollStart;
        var scrollEnd=this.scrollEnd;
        if(scrollEnd<=scrollStart) {
            scrollStart=0;
            if(scrollEnd<1) scrollEnd=this.rows-1;
        }
        if(n>=this.rows) // scroll more than 1 page = clear
            this.clear(2)
        else if(n >= scrollEnd-scrollStart+1) {
            for(row=scrollStart; row <= scrollEnd; ++row) {
                for(col=0; col< cols; ++col) {
                    lines[row][col].copyFrom(this.newChar);
                    lines[row][col].needUpdate=true;
                }
            }
        } else {
            var lines=this.lines;
            var rows=this.rows;
            var cols=this.cols;

            if(up) { // move lines down
                for(i=0; i<rows-1-scrollEnd; ++i)
                    lines.unshift(lines.pop());
                while(--n >= 0) {
                    var line=lines.pop();
                    lines.splice(rows-1-scrollEnd+scrollStart,0,line);
                    for(var col=0; col < cols;++col)
                        line[col].copyFrom(this.newChar);
                }
                for(i=0; i<rows-1-scrollEnd; ++i)
                    lines.push(lines.shift());
            }
            else { // move lines up
                for(i=0; i<scrollStart; ++i)
                    lines.push(lines.shift());
                while(--n >= 0) {
                    var line=lines.shift();
                    lines.splice(scrollEnd-scrollStart,0,line);
                    for(var col=0; col < cols;++col) // clear the line
                        line[col].copyFrom(this.newChar);
                }
                for(i=0; i<scrollStart; ++i)
                    lines.unshift(lines.pop());
            }

            // update the whole screen within scroll region
            for(var row=scrollStart;row<=scrollEnd;++row) {
                var line=lines[row];
                for(var col=0;col<cols;++col) {
                    line[col].needUpdate=true;
                }
            }
        }
        this.changed=true;
        this.queueUpdate();
    },

    gotoPos: function(x,y) {
        // dump('gotoPos: ' + x + ', ' + y + '\n');
        if(x >= this.cols) x = this.cols-1;
        if(y >= this.rows) y = this.rows-1;
        if(x < 0) x = 0;
        if(y < 0) y = 0;
        this.cur_x = x;
        this.cur_y = y;
        this.posChanged=true;
        this.queueUpdate();
    },

    carriageReturn: function() {
        this.cur_x = 0;
        this.posChanged=true;
        this.queueUpdate();
    },

    lineFeed: function() {
        if(this.cur_y < this.scrollEnd) {
            ++this.cur_y;
            this.posChanged=true;
            this.queueUpdate();
        }
        else { // at bottom of screen
            this.scroll(false, 1);
        }
    },

    queueUpdate: function(directupdate) {
        if(!this.timerUpdate) {
            var _this=this;
            var func=function() {
                _this.notify();
            }
            if(directupdate)
              this.timerUpdate = setTimeout(func, 1);
            else
              this.timerUpdate = setTimeout(func, 30);
        }
    },

    notify: function(timer) {
      clearTimeout(this.timerUpdate);
      this.timerUpdate=null;

      //if(timer ==this.timerUpdate)
      //{
      //document.getElementById('testTimer').innerHTML+="#";

      if(this.changed){ // content changed
        if(this.useMouseBrowsing){
          this.SetPageState();
          this.resetMousePos();
        }
        this.updateCharAttr();
        if(this.view) {
          this.view.update();
        }
        this.changed=false;
        this.downPostChanged=true;
        //if(this.view.conn.autoLoginStage > 0)
        //  this.view.conn.checkAutoLogin();
      }
      if(this.posChanged) { // cursor pos changed
        if(this.view) {
          this.view.updateCursorPos();
        }
        this.posChanged=false;
      }

      if(this.view.blinkOn){
        this.view.blinkOn=false;
        this.view.blinkShow=!this.view.blinkShow;
        //
        var allBlinkSpan = document.getElementsByTagName('x');
        for (var i = 0; i < allBlinkSpan.length; i++)
        {
          var c = (this.view.blinkShow && this.view.doBlink)? allBlinkSpan[i].getAttribute("h") : allBlinkSpan[i].getAttribute("s");
          allBlinkSpan[i].parentNode.setAttribute("class", c);
        }
      }
      //}
    },

    getText: function(row, colStart, colEnd, color, isutf8, reset) {
      var text = this.lines[row];
      // always start from leadByte, and end at second-byte of DBCS.
      // Note: this might change colStart and colEnd. But currently we don't return these changes.
      if(colStart == this.cols) return '';
      if( colStart > 0 ){
        if( !text[colStart].isLeadByte && text[colStart-1].isLeadByte ) colStart--;
      }
      else colStart = 0;
      if( colEnd > 0 ){
        if( text[colEnd-1].isLeadByte ) colEnd++;
      }
      else colEnd = this.cols;
      if(colStart >= colEnd) return '';

      if(!this.view) return;
      var charset = this.view.charset;
      var conv = this.view.conv;

      // generate texts with ansi color
      if(color) {
        var output = this.ansiCmp(this.newChar, text[colStart], reset);
        for(var col=colStart; col<colEnd-1; ++col) {
          if(isutf8 && text[col].isLeadByte && this.ansiCmp(text[col], text[col+1]))
            output += this.ansiCmp(text[col], text[col+1]).replace(/m$/g, ';50m') + text[col].ch;
          else
            output += text[col].ch + this.ansiCmp(text[col], text[col+1]);
        }
        output += text[colEnd-1].ch + this.ansiCmp(text[colEnd-1], this.newChar);
        return (isutf8 && charset != 'UTF-8' ? conv.convertStringToUTF8(output, charset, true) : output);
      }

      text = text.slice(colStart, colEnd);
      return text.map( function(c, col, line){
        if(!c.isLeadByte) {
          if(col >=1 && line[col-1].isLeadByte) { // second byte of DBCS char
            var prevC = line[col-1];
            var b5 = prevC.ch + c.ch;
            if((this.view && this.view.charset == 'UTF-8') || b5.length == 1)
              return b5;
            else
              return conv.convertStringToUTF8(b5, charset, true);
          }
          else
            return c.ch;
        }
      }).join('');
    },

    findText: function(text, searchrow) {
      var result = {col: -1, row: -1}
      var searchStart = 0;
      var searchEnd = this.cols - 1;
      if(searchrow>=0) searchStart = searchEnd = searchrow;
      for(var row=searchStart; row<=searchEnd; ++row) {
        var line = this.getText(row, 0, this.cols, false, true);
        result.col = line.indexOf(text);
        if(result.col >= 0) {
          result.row = row;
          break;
        }
      }
      return result;
    },

    getRowText: function(row, colStart, colEnd) {

      var text = this.lines[row];
      // always start from leadByte, and end at second-byte of DBCS.
      // Note: this might change colStart and colEnd. But currently we don't return these changes.
      if( colStart > 0 ){
        if( !text[colStart].isLeadByte && text[colStart-1].isLeadByte ) colStart--;
      }
      else colStart = 0;
      if( colEnd < this.cols ){
        if( text[colEnd].isLeadByte ) colEnd++;
      }
      else colEnd = this.cols;

      text = text.slice(colStart, colEnd);
      var conv = this.view.conv;
      var charset = this.view.charset;
      return text.map( function(c, col, line){
        if(!c.isLeadByte) {
          if(col >=1 && line[col-1].isLeadByte) { // second byte of DBCS char
            var prevC = line[col-1];
            var b5 = prevC.ch + c.ch;
            if((this.view && this.view.charset == 'UTF-8') || b5.length == 1)
              return b5;
            else
              return conv.convertStringToUTF8(b5, charset,  true);
          }
          else
            return c.ch;
        }
      }).join('');

    },

    parseText: function(text) {
      var strs = text.split('^');
      var returnStr = strs[0];
      for(var i=1; i<strs.length; ++i) {
        if(strs[i].length > 0) {
          returnStr += String.fromCharCode(strs[i].charCodeAt(0) - 64);
          returnStr += strs[i].substr(1);
        } else if(i<strs.length-1) {
          returnStr += '^' + strs[++i];
        } else returnStr += '^';
      }
      return returnStr;
    },

    ansiCmp: function(preChar, thisChar, forceReset) {
      var text = '';
      var reset = forceReset;
      if((preChar.bright && !thisChar.bright) ||
         (preChar.underLine && !thisChar.underLine) ||
         (preChar.blink && !thisChar.blink) ||
         (preChar.invert && !thisChar.invert)) reset = true;
      if(reset) text = ';';
      if((reset || !preChar.bright) && thisChar.bright) text += '1;';
      if((reset || !preChar.underLine) && thisChar.underLine) text += '4;';
      if((reset || !preChar.blink) && thisChar.blink) text += '5;';
      if((reset || !preChar.invert) && thisChar.invert) text += '7;';
      var DeFg = TermChar.defaultFg;
      var DeBg = TermChar.defaultBg;
      var thisFg = (thisChar.fg == -1) ? DeFg : thisChar.fg;
      var preFg = (preChar.fg == -1) ? DeFg : preChar.fg;
      var thisBg = (thisChar.bg == -1) ? DeBg : thisChar.bg;
      var preBg = (preChar.bg == -1) ? DeBg : preChar.bg;
      if(reset ? (thisFg != DeFg) : (preFg != thisFg))
        text += '3' + thisFg + ';';
      if(reset ? (thisBg != DeBg) : (preBg != thisBg))
        text += '4' + thisBg + ';';
      if(!text) return '';
      else return ('\x1b[' + text.substr(0,text.length-1) + 'm');
    },

    isFullWidth: function(str) {
      var code = str.charCodeAt(0);
      if(this.view.charset != 'UTF-8' || this.forceFullWidth) { // PTT support
        if(code > 0x7f) return true;
        else return false;
      }
      if((code >= 0x1100 && code <= 0x115f)
      || (code >= 0x2329 && code <= 0x232a)
      || (code >= 0x2e80 && code <= 0x303e)
      || (code >= 0x3040 && code <= 0xa4cf)
      || (code >= 0xac00 && code <= 0xd7a3)
      || (code >= 0xf900 && code <= 0xfaff)
      || (code >= 0xfe30 && code <= 0xfe6f)
      || (code >= 0xff00 && code <= 0xff60)
      || (code >= 0xffe0 && code <= 0xffe6)) {
        return true;
      } else {
        return false;
      }
    },

    loadFile: function(toClipboard) {
      /*
      var nsIFilePicker = Components.interfaces.nsIFilePicker;
      var fp = Components.classes["@mozilla.org/filepicker;1"]
               .createInstance(nsIFilePicker);
      fp.init(window, null, nsIFilePicker.modeOpen);
      fp.appendFilters(nsIFilePicker.filterAll);
      if (fp.show() == nsIFilePicker.returnCancel) return;
      if(!fp.file.exists()) return;

      var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                    .createInstance(Components.interfaces.nsIFileInputStream);

      // Read data without bicolor DBCS to Clipboard
      if(toClipboard) {
        var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterInputStream);
        fstream.init(fp.file, -1, 0, 0);
        cstream.init(fstream, this.view.charset, 0, 0);

        var data = '', str = {};
        // read as much as we can and put it in str.value
        while(cstream.readString(0xffffffff, str))
          data += str.value;
        cstream.close(); // this closes fstream
        this.view.conn.listener.doCopy(data);
      } else {
        // Read data with bicolor DBCS and send directly
        fstream.init(fp.file, -1, -1, false);

        var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
                      .createInstance(Components.interfaces.nsIBinaryInputStream);
        bstream.setInputStream(fstream);
        var bytes = bstream.readBytes(bstream.available());

        //FIXME: convert bytes to UTF-8 compatible format and copy to clipboard

        var escChar = this.view.conn.EscChar;
        this.view.conn.send(bytes.replace(/\x1b/g, escChar?escChar:'\x1b'));
      }
      */
    },

    saveFile: function(data, noConv) {
      /*
      if(!data) {
        //if(this.view.selection) this.view.conn.listener.ansiCopy(false,true);
        data = this.view.conn.listener.doPaste(true);
      }
      var nsIFilePicker = Components.interfaces.nsIFilePicker;
      var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
      fp.init(window, null, nsIFilePicker.modeSave);
      if(data.substr(0,5)=='<?xml')
      {
        fp.defaultExtension = 'html';
        fp.defaultString = 'newhtml';
        fp.appendFilters(nsIFilePicker.filterHTML);
      }
      else
      {
        fp.defaultExtension = 'ans';
        fp.defaultString = 'newansi';
        fp.appendFilters(nsIFilePicker.filterAll);
      }
      if (fp.show() == nsIFilePicker.returnCancel) return;

      var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                     .createInstance(Components.interfaces.nsIFileOutputStream);
      foStream.init(fp.file, 0x02 | 0x08 | 0x20, 0666, 0);

      if(noConv) {
        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                       .createInstance(Components.interfaces.nsIConverterOutputStream);
        converter.init(foStream, this.view.charset, 0, 0);
        converter.writeString(data);
        converter.close(); // this closes foStream
      } else {
        data = this.view.conn.convSend(data, this.view.charset, true);
        foStream.write(data, data.length);
        if (foStream instanceof Components.interfaces.nsISafeOutputStream)
          foStream.finish();
        else
          foStream.close();
      }
      */
    },

    SetPageState: function() {
      this.PageState = 0; //NORMAL
      var m_ColsPerPage = 80;
      //var lineindex = 0;

      if( this.IsUnicolor(0, 0, 29) && this.IsUnicolor(0, 60, 70) ) {
        //lineindex = 2;
        if(this.IsUnicolor(2, 0, 70) && !this.isLineEmpty(1) && (this.cur_x<19 || this.cur_y==23)){
          //document.getElementById('testdata1').innerHTML = "PageState = 2(LIST)";
          this.PageState = 2; // LIST
        }
        else{
          if(this.useMouseBrowsingPtt)
          {
            if(this.isLineEmpty(22) && this.isPttZArea() && (this.cur_x<19 || this.cur_y==23))
            {
              this.PageState = 4; // PTT-Z
            }
            else
              this.PageState = 1; // MENU
          }
          else
            this.PageState = 1; // MENU
        }
      }
      else{
        //lineindex = 23;
        if( this.IsUnicolor(23, 28, 53) && this.cur_y==23){
          //document.getElementById('testdata1').innerHTML = "PageState = 3(READING)";
          this.PageState = 3; // READING
        }
      }
      if(this.PageState == 0){
        //document.getElementById('testdata1').innerHTML = "PageState = 0(NORMAL)";
      }
    },

    isPttZArea: function() {
        var rows = 24;
        var lines = this.lines;
        if(this.view.charset != 'UTF-8')
        {
          var line = lines[0];
          var PTTstr1 = '\xa1\x69\xba\xeb\xb5\xd8\xa4\xe5\xb3\xb9\xa1\x6a';
          for(var i = 0; i <= 11; ++i) {
            if(line[i].ch != PTTstr1.charAt(i))
              return false;
          }
          line = lines[rows-1];
          var PTTstr2 = '\xa1\x69\xa5\x5c\xaf\xe0\xc1\xe4\xa1\x6a';
          for(var i = 1; i <= 10; ++i) {
            if(line[i].ch != PTTstr2.charAt(i-1))
              return false;
          }
        }
        else
        {
          var line = lines[0];
          var PTTstr = '';
          for(var i = 0; i <= 11; i+=2) {
            PTTstr+=line[i].ch;
          }
          if(PTTstr!=this.PTTZSTR1)
            return false;
          line = lines[rows-1];
          PTTstr = '';
          for(var i = 1; i <= 10; i+=2) {
            PTTstr+=line[i].ch;
          }
          if(PTTstr!=this.PTTZSTR2)
            return false;
        }
        return true;
    },

    IsUnicolor: function(lineindex, start, end){
      var lines = this.lines;
      var line = lines[lineindex];
      var clr = line[start].getBg();

      // a dirty hacking, because of the difference between maple and firebird bbs.
      for ( var i = start; i < end; i++)
      {
        var clr1 = line[i].getBg();
        if (clr1 != clr || clr1 == 0)
          return false;
      }
      return true;
    },

    isLineEmpty: function(iLine){
      var rows=this.rows;
      var lines=this.lines;
      var line=lines[iLine];

      for( var col = 0; col < this.cols; col++ )
        if(line[col].ch != ' ' || line[col].getBg() )
          return false;
      return true;
    },

    onMouse_move: function(tcol, trow, doRefresh){
      this.tempMouseCol = tcol;
      this.tempMouseRow = trow;

      if(this.nowHighlight !=  trow || doRefresh)
      {
        if(this.nowHighlight!=-1)
        {
          this.clearHighlight();
        }
      }

      if ( this.useMouseBrowsing && !this.view.bbscore.modalShown )
      {
        switch( this.PageState )
        {
        case 0: //NORMAL
          //SetCursor(m_ArrowCursor);
          //m_CursorState = 0;
          this.mouseCursor = 0;
          break;
        case 4: //LIST
          if (trow>1 && trow < 22)
          {              //m_pTermData->m_RowsPerPage-1
            if ( tcol <= 6 )
            {
              this.mouseCursor = 1;
              if(this.nowHighlight!=-1)
                this.clearHighlight();
              //SetCursor(m_ExitCursor);m_CursorState=1;
            }
            else if ( tcol >= 64 )
            {            //m_pTermData->m_ColsPerPage-16
              if ( trow > 12 )
                this.mouseCursor = 3;
              else
                this.mouseCursor = 2;
              if(this.nowHighlight!=-1)
                this.clearHighlight();
            }
            else
            {
              if(this.nowHighlight!=trow)
              {
                if( !this.isLineEmpty(trow))
                {
                  this.mouseCursor = 6;
                  this.nowHighlight=trow;
                  if(this.highlightCursor)
                  {
                    var rows=this.rows;
                    var lines=this.lines;
                    var line=lines[this.nowHighlight];
                    for(var i=0; i<this.cols; ++i)
                      line[i].needUpdate = true;
                    this.updateCharAttr();
                    this.view.redraw(false);
                  }
                  //document.getElementById('testdata4').innerHTML = "hightlight = "+trow;
                }
                else
                  this.mouseCursor = 11;
              }
            }
          }
          else if ( trow==1 || trow==2 )
          {
            this.mouseCursor = 2;
          }
          else if ( trow==0 )
          {
            this.mouseCursor = 4;
          }
          else// if ( trow == 23)
          {
            this.mouseCursor = 5;
          }
          break;
        case 2: //LIST

          if ( trow>2 && trow < 23)
          {              //m_pTermData->m_RowsPerPage-1
            if ( tcol <= 6 )
            {
              this.mouseCursor = 1;
              if(this.nowHighlight!=-1)
                this.clearHighlight();
              //SetCursor(m_ExitCursor);m_CursorState=1;
            }
            else if ( tcol >= 64 )
            {            //m_pTermData->m_ColsPerPage-16
              if ( trow > 12 )
                this.mouseCursor = 3;
              else
                this.mouseCursor = 2;
              if(this.nowHighlight!=-1)
                this.clearHighlight();
            }
            else
            {
              if(this.nowHighlight!=trow)
              {
                if( !this.isLineEmpty(trow))
                {
                  this.mouseCursor = 6;
                  this.nowHighlight=trow;
                  if(this.highlightCursor)
                  {
                    var rows=this.rows;
                    var lines=this.lines;
                    var line=lines[this.nowHighlight];
                    for(var i=0; i<this.cols; ++i)
                      line[i].needUpdate = true;
                    this.updateCharAttr();
                    this.view.redraw(false);
                  }
                  //document.getElementById('testdata4').innerHTML = "hightlight = "+trow;
                }
                else
                  this.mouseCursor = 11;
              }
            }
          }
          else if ( trow==1 || trow==2 )
          {
            if ( tcol <2 )//[
              this.mouseCursor = 8;
            else if ( tcol >75 )//]
              this.mouseCursor = 9;
            else
              this.mouseCursor = 2;
          }
          else if ( trow==0 )
          {
            if ( tcol <2 )//=
              this.mouseCursor = 10;
            else if ( tcol >75 )//]
              this.mouseCursor = 9;
            else
              this.mouseCursor = 4;
          }
          else// if ( trow == 23)
          {
            if ( tcol <2 )
              this.mouseCursor = 12;
            else if ( tcol >75 )
              this.mouseCursor = 13;
            else
              this.mouseCursor = 5;
          }
          break;
        case 3: //READING
          if ( trow == 23)
          {
            if ( tcol <2 )//]
              this.mouseCursor = 12;
            else if ( tcol >75 )
              this.mouseCursor = 14;
            else
              this.mouseCursor = 5;
          }
          else if ( trow == 0)
          {
            if(tcol<2)//=
              this.mouseCursor = 10;
            else if ( tcol >75 )//]
              this.mouseCursor = 9;
            else if ( tcol<7 )
              this.mouseCursor = 1;
            else
              this.mouseCursor = 2;
          }
          else if ( trow == 1 || trow == 2)
          {
            if(tcol<2)//[
              this.mouseCursor = 8;
            else if ( tcol >75 )//]
              this.mouseCursor = 9;
            else if ( tcol<7 )
              this.mouseCursor = 1;
            else
              this.mouseCursor = 2;
          }
          else if ( tcol<7 )
            this.mouseCursor = 1;
          else if ( trow < 12)
            this.mouseCursor = 2;
          else
            this.mouseCursor = 3;
          break;
        case 1: //MENU
          if ( trow>0 && trow < 23 )
          {
            if (tcol>7)
              this.mouseCursor = 7;
            else
              this.mouseCursor = 1;
          }
          else
          {
            this.mouseCursor = 0;
            //SetCursor(m_ArrowCursor);m_CursorState=0;
          }
          break;
        default:
          this.mouseCursor = 0;
          break;
        }
      }
      if(this.mouseCursor==0)
        this.BBSWin.style.cursor = 'auto';
      else if(this.mouseCursor==1)
        this.BBSWin.style.cursor = 'url(cursor/back.png) 0 6,auto';
      else if(this.mouseCursor==2)
        this.BBSWin.style.cursor = 'url(cursor/pageup.png) 6 0,auto';
      else if(this.mouseCursor==3)
        this.BBSWin.style.cursor = 'url(cursor/pagedown.png) 6 21,auto';
      else if(this.mouseCursor==4)
        this.BBSWin.style.cursor = 'url(cursor/home.png) 0 0,auto';
      else if(this.mouseCursor==5)
        this.BBSWin.style.cursor = 'url(cursor/end.png) 0 0,auto';
      else if(this.mouseCursor==6)
        this.BBSWin.style.cursor = (this.handPointerCursor ? 'pointer' : 'default');
      else if(this.mouseCursor==7)
        this.BBSWin.style.cursor = 'default';
      else if(this.mouseCursor==11)
        this.BBSWin.style.cursor = 'auto';
      else if(this.mouseCursor==8)
        this.BBSWin.style.cursor = 'url(cursor/prevous.png) 6 0,auto';
      else if(this.mouseCursor==9)
        this.BBSWin.style.cursor = 'url(cursor/next.png) 6 0,auto';
      else if(this.mouseCursor==10)
        this.BBSWin.style.cursor = 'url(cursor/first.png) 0 0,auto';
      else if(this.mouseCursor==12)
        this.BBSWin.style.cursor = 'url(cursor/refresh.png) 0 0,auto';
      else if(this.mouseCursor==13)
        this.BBSWin.style.cursor = 'url(cursor/last.png) 0 0,auto';
      else if(this.mouseCursor==14)
        this.BBSWin.style.cursor = 'url(cursor/last.png) 0 0,auto';
    },

    resetMousePos: function(){
      if(this.useMouseBrowsing)
        this.onMouse_move(this.tempMouseCol, this.tempMouseRow, true);
    },

    clearHighlight: function(){
          if(this.highlightCursor)
          {
            var rows=this.rows;
            var lines=this.lines;
            if(this.nowHighlight!=-1)
            {
              var line=lines[this.nowHighlight];
              for(var i=0; i<this.cols; ++i)
                line[i].needUpdate = true;
            }
          }
          this.nowHighlight = -1;
          if(this.highlightCursor)
          {
            this.updateCharAttr();
            this.view.redraw(false);
          }
          //document.getElementById('testdata4').innerHTML = "hightlight = -1";
          this.mouseCursor = 0;
    }
}
