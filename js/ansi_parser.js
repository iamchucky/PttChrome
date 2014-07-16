// Parser for ANSI escape sequence

lib.AnsiParser = function(termbuf) {
  this.termbuf = termbuf;
  this.state = lib.AnsiParser.STATE_TEXT;
  this.esc = '';
};

lib.AnsiParser.STATE_TEXT = 0;
lib.AnsiParser.STATE_ESC = 1;
lib.AnsiParser.STATE_CSI = 2;
lib.AnsiParser.STATE_C1 = 3;

lib.AnsiParser.prototype.feed = function(data) {
  var term = this.termbuf;
  if (!term)
    return;
  var s = '';
  var n = data.length;
  for (var i = 0; i < n; ++i) {
    var ch = data[i];
    switch (this.state) {
    case lib.AnsiParser.STATE_TEXT:
      switch (ch) {
      case '\x1b':
        if (s) {
          term.puts(s);
          s = '';
        }
        this.state = lib.AnsiParser.STATE_ESC;
        break;
      default:
        s += ch;
      }
      break;
    case lib.AnsiParser.STATE_CSI:
      if ( (ch >= '`' && ch <= 'z') || (ch >= '@' && ch <='Z') ) {
        // if(ch != 'm')
        //    dump('CSI: ' + this.esc + ch + '\n');
        var params=this.esc.split(';');
        var firstChar = '';
        if (params[0]) {
          if (params[0].charAt(0)<'0' || params[0].charAt(0)>'9') {
            firstChar = params[0].charAt(0);
            params[0] = params[0].slice(1);
          }
        }
        if (firstChar && ch != 'h' && ch != 'l') { // unknown CSI
          //dump('unknown CSI: ' + this.esc + ch + '\n');
          this.state = lib.AnsiParser.STATE_TEXT;
          this.esc = '';
          break;
        }
        for (var j=0; j<params.length; ++j) {
          if ( params[j] )
            params[j] = parseInt(params[j], 10);
          else
            params[j] = 0;
        }
        switch (ch) {
        case 'm':
          var attr = term.attr;
          for (var n_params = params.length; n_params; --n_params){
            var v = params.shift();
            switch (v) {
            case 0: // reset
              attr.resetAttr();
              break;
            case 1: // bright
              attr.bright=true;
              break;
            case 4:
              attr.underLine=true;
              break;
            case 5: // blink
            case 6:
              attr.blink=true;
              break;
            case 7: // invert
              attr.invert=true;
              break;
            case 8:
              // invisible is not supported
              break;
            /*
            case 22: // normal, or not bright
              attr.bright=false;
              break;
            case 24: // not underlined
              attr.underLine=false;
              break;
            case 25: // steady, or not blink
              attr.blink=false;
              break;
            case 27: // positive, or not invert
              attr.invert=false;
              break;
            */
            default:
              if (v <= 37) {
                if (v >= 30) { // fg
                  attr.fg = v - 30;
                }
              } else if (v >= 40) {
                if (v<=47) { //bg
                  attr.bg = v - 40;
                }
              }
              break;
            }
          }
          break;
        case '@':
          term.insert(params[0]>0 ? params[0] : 1);
          break;
        case 'A':
          term.gotoPos(term.cur_x, term.cur_y-(params[0]?params[0]:1));
          break;
        case 'B':
        case 'e':
          term.gotoPos(term.cur_x, term.cur_y+(params[0]?params[0]:1));
          break;
        case 'C':
        case 'e':
          term.gotoPos(term.cur_x+(params[0]?params[0]:1), term.cur_y);
          break;
        case 'D':
          term.gotoPos(term.cur_x-(params[0]?params[0]:1), term.cur_y);
          break;
        case 'E':
          term.gotoPos(0, term.cur_y+(params[0]?params[0]:1));
          break;
        case 'F':
          term.gotoPos(0, term.cur_y-(params[0]?params[0]:1));
          break;
        case 'G':
        case '`':
          term.gotoPos(params[0]>0?params[0]-1:0, term.cur_y);
          break;
        case 'I':
          term.tab(params[0]>0 ? params[0] : 1);
          break;
        case 'd':
          term.gotoPos(term.cur_x, params[0]>0?params[0]-1:0);
          break;
        /*
        case 'h':
          if (firstChar == '?') {
            var mainobj = term.view.conn.listener;
            switch(params[0]) {
            case 1:
              term.view.cursorAppMode = true;
              break;
            case 1048:
            case 1049:
              term.cur_x_sav = term.cur_x;
              term.cur_y_sav = term.cur_y;
              if (params[0] != 1049) break; // 1049 fall through
            case 47:
            case 1047:
              mainobj.selAll(true); // skipRedraw
              term.altScreen=mainobj.ansiCopy(true); // external buffer
              term.altScreen+=term.ansiCmp(term.newChar, term.attr);
              term.clear(2);
              term.attr.resetAttr();
              break;
            default:
            }
          }
          break;
        case 'l':
          if (firstChar == '?') {
            switch (params[0]) {
            case 1:
              term.view.cursorAppMode = false;
              break;
            case 47:
            case 1047:
            case 1049:
              term.clear(2);
              term.attr.resetAttr();
              if (term.altScreen) {
                this.state = lib.AnsiParser.STATE_TEXT;
                this.esc = '';
                this.feed(term.altScreen.replace(/(\r\n)+$/g, '\r\n'));
              }
              term.altScreen='';
              if (params[0] != 1049) break; // 1049 fall through
            case 1048:
              if (term.cur_x_sav<0 || term.cur_y_sav<0) break;
              term.cur_x = term.cur_x_sav;
              term.cur_y = term.cur_y_sav;
              break;
            default:
            }
          }
          break;
        */
        case 'J':
          term.clear(params ? params[0] : 0);
          break;
        case 'H':
        case 'f':
          if (params.length < 2) {
            term.gotoPos(0, 0);
          } else {
            if (params[0] > 0)
              --params[0];
            if (params[1] > 0)
              --params[1];
            term.gotoPos(params[1], params[0]);
          }
          break;
        case 'K':
          term.eraseLine(params? params[0] : 0);
          break;
        case 'L':
          term.insertLine(params[0]>0 ? params[0] : 1);
          break;
        case 'M':
          term.deleteLine(params[0]>0 ? params[0] : 1);
          break;
        case 'P':
          term.del(params[0]>0 ? params[0] : 1);
          break;
        case 'r': // FIXME: scroll range
          if (params.length < 2) {
            term.scrollStart=0;
            term.scrollEnd=term.rows-1;
          } else {
            if (params[0] > 0)
              --params[0];
            if (params[1] > 0)
              --params[1];
            term.scrollStart=params[0];
            term.scrollEnd=params[1];
          }
          break;
        case 's':
          term.cur_x_sav=term.cur_x;
          term.cur_y_sav=term.cur_y;
          break;
        case 'u':
          if (term.cur_x_sav<0 || term.cur_y_sav<0) break;
          term.cur_x = term.cur_x_sav;
          term.cur_y = term.cur_y_sav;
          break;
        case 'S':
          term.scroll(false, (params[0]>0 ? params[0] : 1));
          break;
        case 'T':
          term.scroll(true, (params[0]>0 ? params[0] : 1));
          break;
        case 'X':
          term.eraseChar(params[0]>0 ? params[0] : 1);
          break;
        case 'Z':
          term.backTab(params[0]>0 ? params[0] : 1);
          break;
        default:
          //dump('unknown CSI: ' + this.esc + ch + '\n');
        }
        this.state = lib.AnsiParser.STATE_TEXT;
        this.esc = '';
      } else {
        this.esc += ch;
      }
      break;
    case lib.AnsiParser.STATE_C1:
      var C1_End = true;
      var C1_Char = [' ', '#', '%', '(', ')', '*', '+', '-', '.', '/'];
      if (this.esc) { // multi-char is not supported now
        for (var j = 0; j < C1_Char.length; ++j)
          if (this.esc == C1_Char[j]) C1_End = false;
        if (C1_End) --i;
        else this.esc += ch;
        //dump('UNKNOWN C1 CONTROL CHAR IS FOUND: ' + this.esc + '\n');
        this.esc = '';
        this.state = lib.AnsiParser.STATE_TEXT;
        break;
      }
      switch (ch) {
      case '7':
        term.cur_x_sav = term.cur_x;
        term.cur_y_sav = term.cur_y;
        break;
      case '8':
        if (term.cur_x_sav<0 || term.cur_y_sav<0) break;
        term.cur_x = term.cur_x_sav;
        term.cur_y = term.cur_y_sav;
        break;
      case 'D':
        term.scroll(false,1);
        break;
      case 'E':
        term.lineFeed();
        term.carriageReturn();
        break;
      case 'M':
        term.scroll(true,1);
        break;
      /*
      case '=':
          term.view.keypadAppMode = true;
          break;
      case '>':
          term.view.keypadAppMode = false;
          break;
      */
      default:
        this.esc += ch;
        C1_End=false;
      }
      if (!C1_End) break;
      this.esc = '';
      this.state = lib.AnsiParser.STATE_TEXT;
      break;
    case lib.AnsiParser.STATE_ESC:
      if (ch == '[')
        this.state=lib.AnsiParser.STATE_CSI;
      else {
        this.state=lib.AnsiParser.STATE_C1;
        --i;
      }
      break;
    }
  }
  if (s) {
      term.puts(s);
      s = '';
  }
};
