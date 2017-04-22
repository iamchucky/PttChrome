import { App } from './app';
import { StringUtil } from './string-util';

export class InputHandler {
  private isComposing = false;

  constructor(private app: App) {}

  registerInputEvents() {
    const input = this.app.page.input;
    input.addEventListener('input', e => {
      // beginning chrome 55, we no longer can update input buffer width on
      // compositionupdate, so we update it on input event
      if (this.isComposing) return this.updateInputWidth();
      if (input.value) {
        this.app.conn.convSend(input.value);
      }
      input.value = '';
      this.app.page.restartBlinkCursor();
    });

    input.addEventListener('compositionstart', e => {
      this.isComposing = true;
      this.app.page.focusInput();
    });

    input.addEventListener('compositionend', e => {
      this.isComposing = false;
      if (input.value) {
        this.app.conn.convSend(input.value);
      }
      input.value = '';
      this.app.page.focusInput();
    });

    input.addEventListener('keydown', e => {
      if (e.keyCode > 15 && e.keyCode < 19) return; // Shift Ctrl Alt (19)
      this.app.page.restartBlinkCursor();

      const conn = this.app.conn;
      let charCode = null;
      if (e.charCode) {
        // Control characters
        if (e.ctrlKey && !e.altKey && !e.shiftKey) {
          // Ctrl + @, NUL, is not handled here
          if ( e.charCode >= 65 && e.charCode <= 90 ) { // A-Z
            conn.send( String.fromCharCode(e.charCode - 64) );
            e.preventDefault();
            e.stopPropagation();
            return;
          } else if ( e.charCode >= 97 && e.charCode <= 122 ) { // a-z
            conn.send( String.fromCharCode(e.charCode - 96) );
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
      } else if (!e.ctrlKey && !e.altKey && !e.shiftKey) {

        switch (e.keyCode) {
        case 8:
          this.send('\b', true);
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
        case 27: // ESC
          conn.send('\x1b');
          break;
        case 33: // Page Up
          conn.send('\x1b[5~');
          break;
        case 34: // Page Down
          conn.send('\x1b[6~');
          break;
        case 35: // End
          conn.send('\x1b[4~');
          break;
        case 36: // Home
          conn.send('\x1b[1~');
          break;
        case 37: // Arrow Left
          this.send('\x1b[D', true);
          break;
        case 38: // Arrow Up
          conn.send('\x1b[A');
          break;
        case 39: // Arrow Right
          this.send('\x1b[C');
          break;
        case 40: // Arrow Down
          conn.send('\x1b[B');
          break;
        case 45: // Insert
          conn.send('\x1b[2~');
          break;
        case 46: // DEL
          this.send('\x1b[3~');
          break;
        }
        return;
      } else if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        if ((e.keyCode === 99 || e.keyCode === 67) &&
            !window.getSelection().isCollapsed) { // ^C , do copy
          const selectedText =
            window.getSelection().toString().replace(/\u00a0/g, ' ');
          this.doCopy(selectedText);
          e.preventDefault();
          e.stopPropagation();
          return;
        } else if (e.keyCode === 97 || e.keyCode === 65) {
          this.doSelectAll();
          e.preventDefault();
          e.stopPropagation();
          return;
        } else if (e.keyCode >= 65 && e.keyCode <= 90) { // A-Z key
          charCode = e.keyCode - 64;
        } else if (e.keyCode >= 219 && e.keyCode <= 221) // [ \ ]
          charCode = e.keyCode - 192;
      } else if (!e.ctrlKey && e.altKey && !e.shiftKey) {
        if (e.keyCode === 87) { // alt+w
          conn.send(StringUtil.unescapeStr('^W'));
          e.preventDefault();
          e.stopPropagation();
          return;
        } else if (e.keyCode === 84) { // alt+t
          conn.send(StringUtil.unescapeStr('^T'));
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      } else if (e.ctrlKey && !e.altKey && e.shiftKey) {
        switch (e.keyCode) {
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
        case 86: // ctrl+shift+v
          this.doPaste();
          e.preventDefault();
          e.stopPropagation();
          charCode = 0;
          break;
        }
      }

      if (charCode) {
        conn.send( String.fromCharCode(charCode) );
        e.preventDefault();
        e.stopPropagation();
      }
    });

    input.addEventListener('keyup', e => {
      if (e.keyCode > 15 && e.keyCode < 19) return; // Shift Ctrl Alt (19)
      this.app.page.focusInput();
    });
  }

  updateInputWidth() {

  }

  updateInputPos() {

  }

  send(str: string, left = false) {
    let out = str;
    if ((left && this.app.model.checkLeftDBCS()) ||
        (!left && this.app.model.checkDBCS())) {
      out += str;
    }
    this.app.conn.send(out);
  }

  doCopy(str: string) {

  }

  doSelectAll() {

  }

  doPaste() {

  }
}