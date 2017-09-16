import { App } from './app';
import { TermChar, TermCharAttr } from './term-char';
import { TermLine } from './term-line';

interface Cursor {
  x: number;
  y: number;
}

export class TermModel {

  lines: TermLine[];
  disableLinefeed = false;

  char: TermChar = new TermChar(' ');
  cursor: Cursor = { x: 0, y: 0 };

  private changed = false;
  private positionChanged = false;
  private savedCursor: Cursor = { x: -1, y: -1 };
  private scrollStart = 0;
  private scrollEnd = this.rows - 1;

  private updateHandle: number;

  constructor(private app: App) {
    this.lines =
      Array.from(Array(app.config.rows), () => new TermLine(app.config.cols));
  }

  puts(str: string) {
    if (!str) return;

    const cols = this.app.config.cols;
    const rows = this.app.config.rows;
    const lines = this.lines;
    const n = str.length;
    let chars = lines[this.cursor.y].chars;

    for (let i = 0; i < n; ++i) {
      const ch = str[i];
      switch (ch) {
      case '\x07':
        // FIXME: beep (1)Sound (2)AlertNotification (3)change icon
        // should only play sound
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
        chars = lines[this.cursor.y].chars;
        continue;
      case '\0':
        continue;
      }

      if (this.cursor.x >= cols) {
        // next line
        if (!this.disableLinefeed) this.lineFeed();
        this.cursor.x = 0;
        chars = lines[this.cursor.y].chars;
        this.positionChanged = true;
      }

      switch (ch) {
      case '\t':
        this.tab();
        break;
      default:
        let ch2 = chars[this.cursor.x];
        ch2.ch = ch;
        ch2.copyAttr(this.char.attr);
        ch2.needUpdate = true;
        ++this.cursor.x;
        if (ch2.isLeadByte) // previous state before this function
          chars[this.cursor.x].needUpdate = true;
        this.changed = true;
        this.positionChanged = true;
      }
    }
    this.queueUpdate();
  }

  carriageReturnLineFeed() {
    this.lineFeed();
    this.carriageReturn();
  }
  eraseInDisplay(params: number[]) { this.clear(params); }

  insertChars(params: number[]) { this.insert(params); }
  deleteChars(params: number[]) { this.del(params); }
  eraseChars(params: number[]) { this.eraseChar(params); }

  insertLines(params: number[]) { this.insertLine(params); }
  deleteLines(params: number[]) { this.deleteLine(params); }
  eraseInLine(params: number[]) { this.eraseLine(params); }

  scrollUp(params: number[]) {
    this.scroll(false, this.paramsAtLeastOne(params));
  }
  scrollDown(params: number[]) {
    this.scroll(true, this.paramsAtLeastOne(params));
  }
  setScrollRegion(params: number[]) {  // FIXME: scroll range
    if (params.length < 2) {
      this.scrollStart = 0;
      this.scrollEnd = this.rows - 1;
      return;
    }
    if (params[0] > 0) --params[0];
    if (params[1] > 0) --params[1];
    this.scrollStart = params[0];
    this.scrollEnd = params[1];
  }

  cursorUp(params: number[]) {
    const n = this.paramsAtLeastOne(params);
    this.gotoPos(this.cursor.x, this.cursor.y - n);
  }
  cursorDown(params: number[]) {
    const n = this.paramsAtLeastOne(params);
    this.gotoPos(this.cursor.x, this.cursor.y + n);
  }
  cursorForward(params: number[]) {
    const n = this.paramsAtLeastOne(params);
    this.gotoPos(this.cursor.x + n, this.cursor.y);
  }
  cursorBackward(params: number[]) {
    const n = this.paramsAtLeastOne(params);
    this.gotoPos(this.cursor.x - n, this.cursor.y);
  }
  cursorNextLine(params: number[]) {
    const n = this.paramsAtLeastOne(params);
    this.gotoPos(0, this.cursor.y + n);
  }
  cursorPrevLine(params: number[]) {
    const n = this.paramsAtLeastOne(params);
    this.gotoPos(0, this.cursor.y - n);
  }
  cursorCharAbsolute(params: number[]) { this.charPosAbsolute(params); }
  cursorForwardTab(params: number[]) { this.tab(params); }
  cursorBackwardTab(params: number[]) { this.backTab(params); }
  cursorPos(params: number[]) {
    if (params.length < 2) {
      return this.gotoPos(0, 0);
    }

    if (params[0] > 0) --params[0];
    if (params[1] > 0) --params[1];
    this.gotoPos(params[1], params[0]);
  }

  charPosAbsolute(params: number[]) {
    const n = params[0] > 0 ? params[0] - 1 : 0;
    this.gotoPos(n, this.cursor.y);
  }
  hvPosition(params: number[]) { this.cursorPos(params); }
  // hPosRelative(params: number[]) {}
  vPosRelative(params: number[]) { this.cursorDown(params); }
  linePosAbsolute(params: number[]) {
    const n = params[0] > 0 ? params[0] - 1 : 0;
    this.gotoPos(this.cursor.x, n);
  }

  saveCursor(params: number[]) {
    this.savedCursor.x = this.cursor.x;
    this.savedCursor.y = this.cursor.y;
  }
  restoreCursor(params: number[]) {
    if (this.savedCursor.x < 0 || this.savedCursor.y < 0) return;
    this.cursor.x = this.savedCursor.x;
    this.cursor.y = this.savedCursor.y;
  }

  checkLeftDBCS() {
    return this.cursor.x > 1 && this.checkDBCS(-2);
  }

  checkDBCS(offset = 0) {
    const c = this.cursor;
    return this.lines[c.y].chars[c.x + offset].isLeadByte;
  }

  private updateCharAttr() {
    const cols = this.cols;
    const rows = this.rows;
    const lines = this.lines;
    for (let row = 0; row < rows; ++row) {
      const chars = lines[row].chars;
      let needUpdate = false;
      for (let col = 0; col < cols; ++col) {
        let ch = chars[col];
        if (ch.needUpdate) needUpdate = true;
        // all chars > ASCII code are regarded as lead byte of DBCS.
        // FIXME: this is not correct, but works most of the times.
        if ( this.isDBCS(ch.ch) && (col + 1) < cols ) {
          ch.isLeadByte = true;
          ++col;
          const ch0 = ch;
          ch = chars[col];
          if (ch.needUpdate) needUpdate = true;
          // ensure simutaneous redraw of both bytes
          if ( ch.needUpdate !== ch0.needUpdate ) {
            ch.needUpdate = ch0.needUpdate = true;
          }
        } else if (ch.isLeadByte && (col + 1) < cols) {
          chars[col + 1].needUpdate = true;
        }
        ch.isLeadByte = false;
      }

      if (needUpdate) { // this line has been changed
        this.lines[row].changed = true;
        let textContent = this.lines[row].textContent;
        if (this.app.view.charset !== 'UTF-8') {
          textContent = textContent.replace(/[^\x00-\x7f]./g, '\xab\xcd');
        } else {
          let str = '';
          const textLen = textContent.length;
          for (let i = 0; i < textLen; ++i) {
            str += textContent.charAt(i);
            if (this.isDBCS(textContent.charAt(i))) {
              str += textContent.charAt(i);
            }
          }
          textContent = str;
        }
        // TODO: url detection was here
        // textContent is used for url detection??
      }
    }
  }

  private clear(params?: number[]) {
    const n = this.paramsUseFirstOrZero(params);

    const rows = this.rows;
    const cols = this.cols;
    const lines = this.lines;
    let row: number;

    switch (n) {
    case 0:
      lines[this.cursor.y].clear(this.cursor.x, cols);
      for (row = this.cursor.y; row < rows; ++row) {
        lines[row].clear(0, cols);
      }
      break;
    case 1:
      for (row = 0; row < this.cursor.y; ++row) {
        lines[row].clear(0, cols);
      }
      lines[this.cursor.y].clear(0, this.cursor.x);
      break;
    case 2:
      for (row = 0; row < rows; ++row) {
        lines[row].clear(0, cols);
      }
      break;
    }
    this.changed = true;
    this.gotoPos(0, 0);
    this.queueUpdate();
  }

  private back() {
    if (this.cursor.x <= 0) return;
    --this.cursor.x;
    this.positionChanged = true;
    this.queueUpdate();
  }

  private tab(params?: number[]) {
    const n = this.paramsAtLeastOne(params);

    this.cursor.x += 4 - this.cursor.x % 4;
    if (n > 1) this.cursor.x += 4 * (n - 1);
    if (this.cursor.x >= this.cols) {
      this.cursor.x = this.cols - 1;
    }
    this.positionChanged = true;
    this.queueUpdate();
  }

  private backTab(params?: number[]) {
    const n = this.paramsAtLeastOne(params);
    const mod = this.cursor.x % 4;
    this.cursor.x -= (mod > 0 ? mod : 4);
    if (n > 1) this.cursor.x -= 4 * (n - 1);
    if (this.cursor.x < 0) {
      this.cursor.x = 0;
    }
    this.positionChanged = true;
    this.queueUpdate();
  }

  private insert(params?: number[]) {
    let n = this.paramsAtLeastOne(params);
    const chars = this.lines[this.cursor.y].chars;
    const cols = this.cols;
    let x = this.cursor.x;
    if (x > 0 && chars[x - 1].isLeadByte) ++x;
    if (x === cols) return;
    if (x + n >= cols) {
      this.lines[this.cursor.y].clear(x, cols);
    } else {
      while (--n >= 0) {
        const ch = chars.pop();
        chars.splice(x, 0, ch);
        ch.clear();
      }
      for (let col = x; col < cols; ++col) {
        chars[col].needUpdate = true;
      }
    }
    this.changed = true;
    this.queueUpdate();
  }

  private del(params?: number[]) {
    const n = this.paramsAtLeastOne(params);
    const chars = this.lines[this.cursor.y].chars;
    const cols = this.cols;
    let x = this.cursor.x;
    let col: number;
    if (x > 0 && chars[x - 1].isLeadByte) ++x;
    if (x === cols) return;
    if (x + n >= cols) {
      this.lines[this.cursor.y].clear(x, cols);
    } else {
      let c = cols - x - n;
      while (--c >= 0)
        chars.splice(x, 0, chars.pop());
      for (col = cols - n; col < cols; ++col)
        chars[col].clear();
      for (col = x; col < cols; ++col)
        chars[col].needUpdate = true;
    }
    this.changed = true;
    this.queueUpdate();
  }

  private eraseChar(params?: number[]) {
    const n = this.paramsAtLeastOne(params);
    const chars = this.lines[this.cursor.y].chars;
    const cols = this.cols;
    let x = this.cursor.x;
    if (x > 0 && chars[x - 1].isLeadByte) ++x;
    if (x === cols) return;
    const c = (x + n > cols) ? cols : x + n;
    this.lines[this.cursor.y].clear(x, c);
    this.changed = true;
    this.queueUpdate();
  }

  private eraseLine(params?: number[]) {
    const n = this.paramsUseFirstOrZero(params);

    let start = 0, end = this.cols; // erase all
    if (n === 0 || !n) { // erase to right
      start = this.cursor.x;
    } else if (n === 1) { // erase to left
      end = this.cursor.x;
    } else if (n !== 2) {
      return;
    }

    this.lines[this.cursor.y].clear(start, end);
    this.changed = true;
    this.queueUpdate();
  }

  private deleteLine(params?: number[]) {
    const n = this.paramsAtLeastOne(params);
    const scrollStart = this.scrollStart;
    this.scrollStart = this.cursor.y;
    this.scroll(false, n);
    this.scrollStart = scrollStart;
    this.changed = true;
    this.queueUpdate();
  }

  private insertLine(params?: number[]) {
    const n = this.paramsAtLeastOne(params);
    const scrollStart = this.scrollStart;
    if (this.cursor.y < this.scrollEnd) {
      this.scrollStart = this.cursor.y;
      this.scroll(true, n);
    }
    this.scrollStart = scrollStart;
    this.changed = true;
    this.queueUpdate();
  }

  private scroll(up: boolean, n: number) {
    let scrollStart = this.scrollStart;
    let scrollEnd = this.scrollEnd;
    if (scrollEnd <= scrollStart) {
      scrollStart = 0;
      if (scrollEnd < 1) scrollEnd = this.rows - 1;
    }
    if (n >= this.rows) { // scroll more than 1 page = clear
      this.clear([2]);
    } else if (n >= scrollEnd - scrollStart + 1) {
      for (let row = scrollStart; row <= scrollEnd; ++row) {
        this.lines[row].clear(0, this.cols);
      }
    } else {
      const lines = this.lines;
      const rows = this.rows;
      const cols = this.cols;

      if (up) { // move lines down
        for (let i = 0; i < rows - 1 - scrollEnd; ++i)
          lines.unshift(lines.pop());
        while (--n >= 0) {
          const line = lines.pop();
          lines.splice(rows - 1 - scrollEnd + scrollStart, 0, line);
          line.clear(0, cols);
        }
        for (let i = 0; i < rows - 1 - scrollEnd; ++i)
          lines.push(lines.shift());
      } else { // move lines up
        for (let i = 0; i < scrollStart; ++i)
          lines.push(lines.shift());
        while (--n >= 0) {
          const line = lines.shift();
          lines.splice(scrollEnd - scrollStart, 0, line);
          line.clear(0, cols);
        }
        for (let i = 0; i < scrollStart; ++i)
          lines.unshift(lines.pop());
      }

      // update the whole screen within scroll region
      for (let row = scrollStart; row <= scrollEnd; ++row) {
        const chars = lines[row].chars;
        for (let col = 0; col < cols; ++col) {
          chars[col].needUpdate = true;
        }
      }
    }
    this.changed = true;
    this.queueUpdate();
  }

  private gotoPos(x: number, y: number) {
    if (x >= this.cols) x = this.cols - 1;
    if (y >= this.rows) y = this.rows - 1;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    this.cursor.x = x;
    this.cursor.y = y;
    this.positionChanged = true;
    this.queueUpdate();
  }

  private carriageReturn() {
    this.cursor.x = 0;
    this.positionChanged = true;
    this.queueUpdate();
  }

  private lineFeed() {
    if (this.cursor.y < this.scrollEnd) {
      ++this.cursor.y;
      this.positionChanged = true;
      this.queueUpdate();
    } else { // at bottom of screen
      this.scroll(false, 1);
    }
  }

  private queueUpdate(force?: boolean) {
    if (this.updateHandle) return;

    this.updateHandle = setTimeout(() => {
      this.doUpdate();
    }, force ? 1 : 16); // 16 ms for 60 fps
  }

  private doUpdate() {
    clearTimeout(this.updateHandle);
    this.updateHandle = null;

    if (this.changed) {
      this.updateCharAttr();

      this.app.view.render();
      this.changed = false;
    }

    if (this.positionChanged) {
      this.app.view.updateCursorPos();
      this.positionChanged = false;
    }
  }

  private get cols() {
    return this.app.config.cols;
  }

  private get rows() {
    return this.app.config.rows;
  }

  private paramsAtLeastOne(params?: number[]) {
    if (params && params[0] > 1) return params[0];
    return 1;
  }

  private paramsUseFirstOrZero(params?: number[]) {
    return params ? params[0] : 0;
  }

  private isDBCS(str: string) {
    const code = str.charCodeAt(0);
    // PTT support
    if (this.app.view.charset !== 'UTF-8') return code > 0x7f;
    return (code >= 0x1100 && code <= 0x115f) ||
           (code >= 0x2329 && code <= 0x232a) ||
           (code >= 0x2e80 && code <= 0x303e) ||
           (code >= 0x3040 && code <= 0xa4cf) ||
           (code >= 0xac00 && code <= 0xd7a3) ||
           (code >= 0xf900 && code <= 0xfaff) ||
           (code >= 0xfe30 && code <= 0xfe6f) ||
           (code >= 0xff00 && code <= 0xff60) ||
           (code >= 0xffe0 && code <= 0xffe6);
  }
}