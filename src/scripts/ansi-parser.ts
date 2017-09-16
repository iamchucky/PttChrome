import { App } from './app';

enum STATE { TEXT, ESC, CSI, C1 }

export class AnsiParser {
  private state: STATE = STATE.TEXT;
  private s: string;
  private esc: string;

  attrTermEventTypeMap: {
    [key: string]: Function
  } = {
    0: () => this.termModel.char.resetAttr(),
    1: () => this.termModel.char.attr.bright = true,
    4: () => this.termModel.char.attr.underline = true,
    5: () => this.termModel.char.attr.blink = true,
    6: () => this.termModel.char.attr.blink = true,
    7: () => this.termModel.char.attr.invert = true
  };

  // http://www.inwap.com/pdp10/ansicode.txt
  csiTermEventTypeMap: {
    [key: string]: Function
  } = {
    '@': (p: number[]) => this.termModel.insertChars(p),
    'A': (p: number[]) => this.termModel.cursorUp(p),
    'B': (p: number[]) => this.termModel.cursorDown(p),
    'e': (p: number[]) => this.termModel.vPosRelative(p),
    'C': (p: number[]) => this.termModel.cursorForward(p),
    'D': (p: number[]) => this.termModel.cursorBackward(p),
    'E': (p: number[]) => this.termModel.cursorNextLine(p),
    'F': (p: number[]) => this.termModel.cursorPrevLine(p),
    'G': (p: number[]) => this.termModel.cursorCharAbsolute(p),
    '`': (p: number[]) => this.termModel.charPosAbsolute(p),
    'H': (p: number[]) => this.termModel.cursorPos(p),
    'f': (p: number[]) => this.termModel.hvPosition(p),
    'I': (p: number[]) => this.termModel.cursorForwardTab(p),
    'd': (p: number[]) => this.termModel.linePosAbsolute(p),
    'J': (p: number[]) => this.termModel.eraseInDisplay(p),
    'K': (p: number[]) => this.termModel.eraseInLine(p),
    'L': (p: number[]) => this.termModel.insertLines(p),
    'M': (p: number[]) => this.termModel.deleteLines(p),
    'P': (p: number[]) => this.termModel.deleteChars(p),
    'S': (p: number[]) => this.termModel.scrollUp(p),
    'T': (p: number[]) => this.termModel.scrollDown(p),
    'X': (p: number[]) => this.termModel.eraseChars(p),
    'Z': (p: number[]) => this.termModel.cursorBackwardTab(p),
    'r': (p: number[]) => this.termModel.setScrollRegion(p),
    's': (p: number[]) => this.termModel.saveCursor(p),
    'u': (p: number[]) => this.termModel.restoreCursor(p)
  };

  constructor(private app: App) {}

  feed(str: string) {
    this.s = '';
    const data = str.split('');

    while (data.length) {
      this.process(data.shift());
    }
    this.flush();
  }

  private process(ch: string) {
    switch (this.state) {
      case STATE.TEXT:
        this.processText(ch);
        break;
      case STATE.CSI:
        this.processCsi(ch);
        break;
      case STATE.C1:
        this.processC1(ch);
        break;
      case STATE.ESC:
        this.processEsc(ch);
        break;
    }
  }

  private processText(ch: string) {
    if (ch === '\x1b') {
      this.flush();
      this.state = STATE.ESC;
    } else {
      this.s += ch;
    }
  }

  private processCsi(ch: string) {
    if ((ch >= '`' && ch <= 'z') || (ch >= '@' && ch <= 'Z')) {
      let paramsStr = this.esc.split(';');
      let firstChar = '';
      if (paramsStr[0] &&
         (paramsStr[0].charAt(0) < '0' || paramsStr[0].charAt(0) > '9')) {
        firstChar = paramsStr[0].charAt(0);
        paramsStr[0] = paramsStr[0].slice(1);
      }
      if (firstChar && ch !== 'h' && ch !== 'l') {  // unknown CSI
        this.state = STATE.TEXT;
        this.esc = '';
        return;
      }

      let params = paramsStr.map(p => isNaN(parseInt(p)) ? null : parseInt(p));
      this.processCsiParam(ch, params);
    } else {
      this.esc += ch;
    }
  }

  private processCsiParam(ch: string, params: number[]) {
    if (ch === 'm') {
      this.setAttr(params);
    } else if (this.csiTermEventTypeMap[ch] !== undefined) {
      this.csiTermEventTypeMap[ch](params);
    }
    this.state = STATE.TEXT;
    this.esc = '';
  }

  private setAttr(params: number[]) {
    while (params.length) {
      const v = params.shift() || 0;

      if (this.attrTermEventTypeMap[v] !== undefined) {
        this.attrTermEventTypeMap[v]();
      } else if (v >= 30 && v <= 37) {
        this.termModel.char.fg = v - 30;
      } else if (v >= 40 && v <= 47) {
        this.termModel.char.bg = v - 40;
      }
    }
  }

  private processC1(ch: string) {
    let c1End = true;
    let c1Char = new Set([' ', '#', '%', '(', ')', '*', '+', '-', '.', '/']);
    if (this.esc) {
      c1End = !c1Char.has(this.esc);

      this.esc = '';
      this.state = STATE.TEXT;
      if (c1End) {
        this.processText(ch);
      }
      return;
    }

    switch (ch) {
      case '7':
        this.termModel.saveCursor(null);
        break;
      case '8':
        this.termModel.restoreCursor(null);
        break;
      case 'D':
        this.termModel.scrollUp([1]);
        break;
      case 'E':
        this.termModel.carriageReturnLineFeed();
        break;
      case 'M':
        this.termModel.scrollDown([1]);
        break;
      default:
        this.esc += ch;
        return;
    }

    this.esc = '';
    this.state = STATE.TEXT;
  }

  private processEsc(ch: string) {
    if (ch === '[') {
      this.state = STATE.CSI;
    } else {
      this.state = STATE.C1;
      this.processC1(ch);
    }
  }

  private flush() {
    if (this.s) {
      this.termModel.puts(this.s);
      this.s = '';
    }
  }

  private get termModel() {
    return this.app.model;
  }
}