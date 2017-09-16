import { Page } from './page';
import { App } from './app';
import { TermLine } from './term-line';
import { TermChar, termColorsInv } from './term-char';
import { StringUtil } from './string-util';
import { symbolTable } from './symbol-table';

const FG = 7;
const BG = 0;
const DEFAULT_COLOR = `q${FG} b${BG}`;

export class TermView {
  charset = 'big5';

  chh: number;
  chw: number;
  private openSpan = false;
  private curr = {
    col: 0,
    row: 0,
    fg: 7,
    bg: 0,
    blink: false
  };

  private innerBounds = { width: 0, height: 0 };
  private firstRowOffset = { top: 0, left: 0 };
  private scale = { x: 1, y: 1 };

  constructor(private app: App) {}

  init() {
    let html = '';
    for (let i = 0; i < this.rows; ++i) {
      html += `<div class="term-row" srow="${i}"></div>`;
    }
    Page.app.innerHTML = `
      <div id="terminal-container">
        <div id="terminal">${html}</div>
        <div id="cursor"></div>
        <input id="ime-input"
               type="text"
               autocomplete="off"
               autofocus/>
      </div>
    `;

    this.innerBounds = Page.windowInnerBounds;
    this.firstRowOffset = Page.getRowOffset();
    window.addEventListener('resize', e => {
      this.resize();
    });
    this.resize();
  }

  render(force = false) {
    const cols = this.cols;
    const rows = this.rows;
    let lineChangedCount = 0;
    const changedRows = [];
    const fullUpdateRowThreshold = 3;

    const lines = this.model.lines;
    let anyLineUpdated = false;

    for (let row = 0; row < rows; ++row) {
      const chh = this.chh;
      this.curr.row = row;
      // resets color
      this.setCurrAttr(FG, BG, false);
      // this.defbg = 0;
      const line = lines[row];
      if (!line.changed && !force) continue;
      // this.doHighlightOnCurRow =
      //   (this.buf.highlightCursor && this.buf.nowHighlight != -1 &&
      //    this.buf.nowHighlight === row);

      this.determineAndSetHtml(line);

      // TODO: check blacklist for user and fade row
      // const fade = this.handleBlacklistRow(row);

      // const tmp = [];
      // if (this.doHighlightOnCurRow) {
      //   tmp.push(
      //     `<span type="highlight" class="b${this.defbg}" srow="${row}">`
      //   );
      // }
      // for (let c = 0; c < cols; ++c) {
      //   tmp.push(line.chars[c].html);
      // }
      // if (this.doHighlightOnCurRow) {
      //   tmp.push('</span>');
      // }
      // const changedLineHtml = tmp.join('');
      if (changedRows.length < fullUpdateRowThreshold) {
        // only store up to the threshold
        changedRows.push(row);
      }
      const rowHtml = line.chars.map(c => c.html).join('');
      line.html = `<div class="term-row" srow="${row}">${rowHtml}</div>`;
      anyLineUpdated = true;
      line.changed = false;
      lineChangedCount += 1;
    }

    if (anyLineUpdated) {
      if (lineChangedCount > fullUpdateRowThreshold) {
        Page.term.innerHTML = this.model.lines.map(l => l.html).join('');
      } else {
        changedRows.forEach(r => {
          Page.term.children[r].innerHTML = this.model.lines[r].html;
        });
      }
      // this.buf.prevPageState = this.buf.pageState;

      // if (this.enablePicPreview) {
      //   // hide preview if any update
      //   this.picPreviewShouldShown = false;
      //   this.picPreview.style.display = 'none';
      //   this.picLoading.style.display = 'none';
      //   this.setupPicPreviewOnHover();
      // }
    }
  }

  updateCursorPos() {
    const cursorPos = this.cursor;
    let color = 'white';
    if (this.model) {
      color =
        termColorsInv[this.model.lines[cursorPos.y].chars[cursorPos.x].bg];
    }
    const offset = this.getCursorOffset();
    Object.assign(Page.cursor.style, {
      transform: `translate(${offset.left}px, ${offset.top}px)`,
      color
    });
  }

  getCursorOffset() {
    const cursorPos = this.cursor;
    const xOffset = this.chw * cursorPos.x;
    return {
      top: this.chh * cursorPos.y,
      left: this.firstRowOffset.left + xOffset
    };
  }

  resize() {
    this.innerBounds = Page.windowInnerBounds;

    const cols = this.cols;
    const rows = this.rows;
    const innerBounds = this.innerBounds;
    let width = innerBounds.width;
    let height = innerBounds.height;

    // errors for openning in a new window
    if (width === 0 || height === 0) return;
    width -= 10; // for scroll bar

    let o_h, o_w, i = 4;
    let nowchh = this.chh;
    let nowchw = this.chw;
    do {
      ++i;
      nowchh = i * 2;
      nowchw = i;
      o_h = (nowchh) * 24;
      o_w = nowchw * 80;
    } while (o_h <= height && o_w <= width);
    --i;
    nowchh = i * 2;
    nowchw = i;
    this.setTermFontSize(nowchw, nowchh);

    const forceWidthEls = Page.forceWidthEls;
    const len = forceWidthEls.length;
    for (let i = 0; i < len; ++i) {
      forceWidthEls[i].style.width = nowchh + 'px';
    }

    const inputHandler = this.app.inputHandler;
    if (inputHandler && inputHandler.isComposing) {
      inputHandler.updateInputPos();
    }
  }

  private determineAndSetHtml(line: TermLine) {
    const cols = this.cols;
    let col = 0;
    for (; col < cols; ++col) {
      // always check all because it's hard to know about openSpan when jump
      // update
      this.curr.col = col;
      const ch = line.chars[col];
      // if (this.doHighlightOnCurRow) {
      //   this.defbg = this.highlightBG;
      //   ch.bg = this.highlightBG;
      // }

      if (ch.isLeadByte) { // first byte of DBCS char
        if (col + 1 < this.cols) {
          this.handleDBCS(ch, col, line);
        }
        col = col + 1;
        line.chars[col].html = '';
      } else { // NOT LeadByte
        ch.html = this.createNormalChar(ch, ch.ch, ch.fg, ch.bg);
      }
      ch.needUpdate = false;
    }

    // after all cols, close the span if open
    line.chars[col - 1].html += this.closeSpanIfIsOpen();
  }

  private handleDBCS(ch: TermChar, col: number, line: TermLine) {
    const ch2 = line.chars[col + 1];
    // if (this.doHighlightOnCurRow) {
    //   ch2.bg = this.highlightBG;
    // }

    if (ch2.ch === '\x20') { // a LeadByte + ' ', we set this '?' + ' '
      ch.html = this.createNormalChar(ch, '?', ch.fg, ch.bg);
      ch2.html = this.createNormalChar(ch, ' ', ch2.fg, ch2.bg);
    } else { // maybe normal ...
      const b5 = ch.ch + ch2.ch; // convert char to UTF-8 before drawing
      let u = b5;
      if (this.charset !== 'UTF-8' && b5.length !== 1) {
        u = StringUtil.b2u(b5);
      }
      if (u) { // can be converted to valid UTF-8
        if (u.length === 1) { // normal chinese word
          const code = symbolTable['x' + u.charCodeAt(0).toString(16)];
          if (code === 3) { // [4 code char]
            ch.html = this.createNormalChar(ch, '?', ch2.fg, ch2.bg);
            ch2.html = this.createNormalChar(ch2, '?', ch2.fg, ch2.bg);
          } else {
            let forceWidth = 0;
            if (code === 1 || code === 2) {
              forceWidth = this.chh;
            }
            if (ch.bg !== ch2.bg || ch.fg !== ch2.fg ||
                ch.attr.blink !== ch2.attr.blink ) {
              ch.html = this.createTwoColorWord(
                ch, ch2, u, ch.fg, ch2.fg, ch.bg, ch2.bg, forceWidth);
            } else {
              ch.html = this.createNormalWord(
                ch, ch2, u, ch.fg, ch.bg, forceWidth);
            }
          }
        } else { // a <?> + one normal char, we set this '?' + ch2
          ch.html = this.createNormalChar(ch, '?', ch.fg, ch.bg);
          ch2.html = this.createNormalChar(ch, ch2.ch, ch2.fg, ch2.bg);
        }
      }
    }
    ch2.needUpdate = false;
  }

  private closeSpanIfIsOpen() {
    if (!this.openSpan) return '';
    this.openSpan = false;
    return '</span>';
  }

  private createNormalChar(
    ch: TermChar, char1: string, fg: number, bg: number
  ): string {
    const col = this.curr.col;
    const row = this.curr.row;
    // var useHyperLink = this.useHyperLink;
    let s0 = '';
    let s1 = '';
    let s2 = '';
    // if (ch.isStartOfURL() && useHyperLink) {
    //   s0 += this.closeSpanIfIsOpen();
    //   s0 += `
    //    <a scol="${col}" srow="${row}"
    //       class="y ${DEFAULT_COLOR}" href="${ch.getFullURL()}"
    //       ${this.prePicRel( ch.getFullURL())
    //       rel="noreferrer" target="_blank">`;
    //   this.setCurColorStyle(FG, BG, false);
    // }
    // if (ch.isEndOfURL() && useHyperLink) {
    //   s2 = '</a>';
    // }

    if (this.openSpan &&
        (bg === this.curr.bg &&
        (fg === this.curr.fg || char1 <= ' ') &&
        ch.attr.blink === this.curr.blink)
    ) {
      s1 += StringUtil.htmlSafe(char1);
    } else if (bg === BG && (fg === FG || char1 <= ' ') && !ch.attr.blink) {
      s1 += this.closeSpanIfIsOpen();
      this.setCurrAttr(fg, bg, false);
      s1 += StringUtil.htmlSafe(char1);
    } else {
      s1 += this.closeSpanIfIsOpen();
      this.setCurrAttr(fg, bg, ch.attr.blink);
      const color = `q${fg} b${bg}`;
      // const link = ch.partOfUrl ? 'link="true"' : '';
      const link = '';
      const blink = ch.attr.blink ? `<x s="${color}" h="qq${bg}"></x>` : '';
      s1 += `<span ${link} class="${color}">${blink}`;
      this.openSpan = true;
      s1 += StringUtil.htmlSafe(char1);
    }
    if (s2) {
      this.setCurrAttr(FG, BG, false);
      s1 += this.closeSpanIfIsOpen();
    }
    return s0 + s1 + s2;
  }

  private createNormalWord(
    ch: TermChar, ch2: TermChar, char1: string,
    fg: number, bg: number, forceWidth: number
  ): string {
    if ((this.openSpan &&
        (fg === this.curr.fg &&
         bg === this.curr.bg &&
         ch.attr.blink === this.curr.blink)) &&
        forceWidth === 0) {
      return char1;
    }
    const row = this.curr.row;
    const col = this.curr.col;
    let s1 = '';

    s1 += this.closeSpanIfIsOpen();
    const color = `q${fg} b${bg}`;
    const blink = ch.attr.blink ? `<x s="${color}" h="qq${bg}"></x>` : '';
    if (fg === FG && bg === BG && !ch.attr.blink && forceWidth === 0) {
      // default colors
      this.setCurrAttr(fg, bg, false);
      s1 += char1;
    } else if (forceWidth === 0) {
      // different colors, so create span
      this.setCurrAttr(fg, bg, ch.attr.blink);
      s1 += `<span class="${color}">${blink}${char1}`;
      this.openSpan = true;
    } else {
      // different colors, create span and set current color to default because
      // forceWidth
      this.setCurrAttr(FG, BG, false);
      const style = `display:inline-block;width:${forceWidth}px;`;
      // tslint:disable:max-line-length
      s1 += `<span class="wpadding ${color}" style="${style}">${blink}${char1}</span>`;
      // tslint:enable
    }
    return s1;
  }

  private createTwoColorWord(
    ch: TermChar, ch2: TermChar, char1: string, fg: number, fg2: number,
    bg: number, bg2: number, forceWidth: number
  ): string {
    const row = this.curr.row;
    const col = this.curr.col;
    // set to default color so that it'll create span for next char that has
    // different color from default
    this.setCurrAttr(FG, BG, false);

    let s1 = '';
    let fwStyle = '';
    let spanClass = '';
    let bcValue = '';
    const hasXNode = (ch.attr.blink && fg !== bg) ||
                     (ch2.attr.blink && fg2 !== bg2);
    let xNodeStr = '';
    if (forceWidth !== 0) {
      fwStyle = `style="display:inline-block;width:${forceWidth}px;"`;
    }

    s1 += this.closeSpanIfIsOpen();

    if (fg !== fg2) {
      spanClass = `w${fg} q${fg2} o`;
    } else {
      spanClass = `q${fg}`;
    }
    if (bg !== bg2) {
      bcValue = `b${bg}b${bg2}`;
    } else {
      bcValue = `b${bg}`;
    }
    spanClass += ` ${bcValue}`;

    if (hasXNode) {
      let xNodeAttrS = '';
      if (fg !== fg2) {
        xNodeAttrS = `w${fg} q${fg2} o`;
      } else {
        xNodeAttrS = `q${fg}`;
      }

      let xNodeAttrH = '';
      if (ch.attr.blink && ch2.attr.blink) {
        if (fg !== fg2) {
          xNodeAttrH = 'qq';
        } else if (bg !== bg2) {
          xNodeAttrH = `qq${bg}`;
        } else {
          // not possible
        }
      } else if (ch.attr.blink && !ch2.attr.blink) {
        if (fg2 === bg) {
          xNodeAttrH = `q${bg}`;
        } else {
          xNodeAttrH = `w${bg} q${fg2} o`;
        }
      } else {// if(!ch.blink && ch2.blink)
        if (fg === bg2) {
          xNodeAttrH = `q${fg}`;
        } else {
          xNodeAttrH = `w${fg} q${bg2} o`;
        }
      }
      xNodeAttrH += ' ' + bcValue;
      xNodeAttrS += ' ' + bcValue;
      xNodeStr = `<x s="${xNodeAttrS}" h="${xNodeAttrH}"></x>`;
    }

    s1 += `<span class="${spanClass}" t="${char1}" ${fwStyle}>`;
    if (hasXNode) {
      s1 += xNodeStr;
    }
    s1 += `${char1}</span>`;
    return s1;
  }

  private setTermFontSize(cw: number, ch: number) {
    const innerBounds = this.innerBounds;
    this.chw = cw;
    this.chh = ch;
    Page.fontSize = ch;
    const fontSize = this.chh + 'px';
    const mainWidth = this.chw * this.cols + 10 + 'px';

    // this.bbsCursor.style.fontSize = fontSize;
    // this.bbsCursor.style.lineHeight = fontSize;
    let marginTop = Page.containerMargin;
    if (Page.verticalAlignCenter &&
        this.chh * this.rows < innerBounds.height) {
      marginTop += (innerBounds.height - this.chh * this.rows) / 2;
    }
    if (Page.fontFitWindowWidth) {
      this.scale.x =
        Math.floor(innerBounds.width / (this.chw * this.cols + 10) * 100) / 100;
      this.scale.y =
        Math.floor(innerBounds.height / (this.chh * this.rows) * 100) / 100;
    } else {
      this.scale.x = 1;
      this.scale.y = 1;
    }

    let scaleCss = 'none';
    // if (this.scale.x !== 1 || this.scale.y !== 1) {
    //   // chrome not stable support yet!
    //   // this.mainDisplay.style.transform = 'scaleX('+this.scaleX+')';
    //   scaleCss = `scale(${this.scale.x},${this.scale.y})`;
    //   let transOrigin = 'left';
    //   if (Page.horizontalAlignCenter) {
    //     transOrigin = 'center';
    //   }
    //   term.style.webkitTransformOriginX = transOrigin;
    //   // this.lastRowDiv.style.webkitTransformOriginX = transOrigin;
    //   // this.replyRowDiv.style.webkitTransformOriginX = transOrigin;
    //   // // somehow these are the right value
    //   // this.lastRowDiv.style.webkitTransformOriginY = '-1100%';
    //   // this.replyRowDiv.style.webkitTransformOriginY = '-1010%';
    // } else {
    //   // this.lastRowDiv.style.webkitTransformOriginY = '';
    //   // this.replyRowDiv.style.webkitTransformOriginY = '';
    // }
    // this.lastRowDiv.style.webkitTransform = scaleCss;
    // this.replyRowDiv.style.webkitTransform = scaleCss;

    // this.firstGridOffset = this.bbscore.getFirstGridOffsets();
    const newTermStyle = {
      overflowX: 'hidden',
      overflowY: 'auto',
      textAlign: 'left',
      width: mainWidth,
      webkitTransform: scaleCss,
      marginTop: `${marginTop}px`
    };
    Object.assign(Page.termContainer.style, {
      fontSize, lineHeight: fontSize
    });
    Object.assign(Page.term.style, newTermStyle);
    this.firstRowOffset = Page.getRowOffset();
    this.updateCursorPos();
    // this.updateFbSharingPos();
  }

  private setCurrAttr(fg: number, bg: number, blink: boolean) {
    this.curr.fg = fg;
    this.curr.bg = bg;
    this.curr.blink = blink;
  }

  private get cols() {
    return this.app.config.cols;
  }

  private get rows() {
    return this.app.config.rows;
  }

  private get model() {
    return this.app.model;
  }

  private get cursor() {
    return (this.app.model && this.app.model.cursor) || { x: 0, y: 0 };
  }
}