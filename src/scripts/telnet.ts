import { App } from './app';
import { ReceivedEvent } from './app-connection';
import { Connection } from './connection';
import { StringUtil } from './string-util';

// Telnet commands
const SE = '\xf0';
const NOP = '\xf1';
const DATA_MARK = '\xf2';
const BREAK = '\xf3';
const INTERRUPT_PROCESS = '\xf4';
const ABORT_OUTPUT = '\xf5';
const ARE_YOU_THERE = '\xf6';
const ERASE_CHARACTER = '\xf7';
const ERASE_LINE = '\xf8';
const GO_AHEAD  = '\xf9';
const SB = '\xfa';

// Option commands
const WILL  = '\xfb';
const WONT  = '\xfc';
const DO = '\xfd';
const DONT = '\xfe';
const IAC = '\xff';

// Telnet options
const ECHO  = '\x01';
const SUPRESS_GO_AHEAD = '\x03';
const TERM_TYPE = '\x18';
const IS = '\x00';
const SEND = '\x01';
const NAWS = '\x1f';

enum STATE {
  DATA = 0, IAC, WILL, WONT, DO, DONT, SB
}

export class TelnetConnection implements Connection {
  private host: string;
  private port: number;
  private keepAlive: any = null;

  private state = STATE.DATA;
  private iacSb = '';

  private escapeChar = '\x15'; // Ctrl-U
  private termType = 'VT100';
  private lineWrap = 78;

  private autoLoginStage = 0;
  private loginPrompt = ['', '', ''];
  private loginStr = ['', '', '', ''];

  connected = false;

  constructor(private app: App) {}

  connect(host: string, port: number) {
    this.host = host;
    this.port = port;

    this.connected = false;
    this.app.appConn.events.subscribe(e => {
      if (e instanceof ReceivedEvent) {
        this.handleData(e.msg.data);
      }
    });
    this.app.appConn.connectTcp(this.host, this.port, this.keepAlive);
  }

  send(str: string) {
    if (!str || !this.app || !this.app.appConn) return;
    this.app.idleTime = 0;
    this.app.appConn.sendTcp(str);
  }

  convSend(unicodeStr: string) {
    let s = StringUtil.u2b(unicodeStr);
    if (s) {
      s = StringUtil.ansiHalfColorConv(s);
      this.send(s);
    }
  }

  sendNaws() {
    const cols = this.app.config.cols;
    const rows = this.app.config.rows;
    const nawsStr = String.fromCharCode(
      Math.floor(cols / 256),
      cols % 256,
      Math.floor(rows / 256),
      rows % 256
    ).replace(/(\xff)/g, '\xff\xff');
    this.send( IAC + SB + NAWS + nawsStr + IAC + SE );
  }

  private parseData(str: string) {
    this.app.parser.feed(str);
  }

  private handleData(str: string) {
    let data = '';
    let count = str.length;
    while (count > 0) {
      count -= str.length;
      const n = str.length;
      for (let i = 0; i < n; ++i) {
        const ch = str[i];
        switch (this.state) {
        case STATE.DATA:
          if ( ch === IAC ) {
            if (data) {
              this.parseData(data);
              data = '';
            }
            this.state = STATE.IAC;
          } else {
            data += ch;
          }
          break;
        case STATE.IAC:
          switch (ch) {
          case WILL:
            this.state = STATE.WILL;
            break;
          case WONT:
            this.state = STATE.WONT;
            break;
          case DO:
            this.state = STATE.DO;
            break;
          case DONT:
            this.state = STATE.DONT;
            break;
          case SB:
            this.state = STATE.SB;
            break;
          default:
            this.state = STATE.DATA;
          }
          break;
        case STATE.WILL:
          switch (ch) {
          case ECHO:
          case SUPRESS_GO_AHEAD:
            this.send( IAC + DO + ch );
            break;
          default:
            this.send( IAC + DONT + ch );
          }
          this.state = STATE.DATA;
          break;
        case STATE.DO:
          switch (ch) {
          case TERM_TYPE:
            this.send( IAC + WILL + ch );
            break;
          case NAWS:
            this.send( IAC + WILL + ch );
            this.sendNaws();
            break;
          default:
            this.send( IAC + WONT + ch );
          }
          this.state = STATE.DATA;
          break;
        case STATE.DONT:
        case STATE.WONT:
          this.state = STATE.DATA;
          break;
        case STATE.SB: // sub negotiation
          this.iacSb += ch;
          if ( this.iacSb.slice(-2) === IAC + SE ) {
            // end of sub negotiation
            switch (this.iacSb[0]) {
            case TERM_TYPE:
              // FIXME: support other terminal types
              // var termType = this.app.prefs.TermType;
              this.send( IAC + SB + TERM_TYPE + IS + this.termType + IAC + SE );
              break;
            }
            this.state = STATE.DATA;
            this.iacSb = '';
            break;
          }
        }
      }
      if (data) {
        this.parseData(data);
        data = '';
      }
    }
  }
}