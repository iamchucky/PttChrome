function $(selector: string) {
  return document.querySelector(selector);
}

function $all(selector: string) {
  return document.querySelectorAll(selector);
}

export class Page {
  static fontSize = 14;
  static containerMargin = 10;
  static verticalAlignCenter = true;
  static horizontalAlignCenter = true;
  static fontFitWindowWidth = false;

  static $ = $;
  static $all = $all;

  static get app() { return $('#app-container') as HTMLDivElement; }
  static get term() { return $('#terminal') as HTMLDivElement; }
  static get termContainer() {
    return $('#terminal-container') as HTMLDivElement;
  }
  static get cursor() { return $('#cursor') as HTMLDivElement; }
  static get input() { return $('#ime-input') as HTMLInputElement; }
  static get forceWidthEls() {
    return $all('.wpadding') as NodeListOf<HTMLSpanElement>;
  }
  static get windowInnerBounds() {
    const offset = this.containerMargin * 2;
    const bodySize = this.bodySize;
    const width = bodySize.width - offset;
    const height = bodySize.height - offset;
    return { width, height };
  }
  static get bodySize() {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };
  }

  static getRowOffset(row = 0) {
    const rowEl = $(`.term-row[srow="${row}"]`) as HTMLSpanElement;
    return {
      top: rowEl.offsetTop,
      left: rowEl.offsetLeft
    };
  }

  static focusInput() {
    this.input.focus();
  }

  static blinkCursor() {
    this.cursor.classList.toggle('blinking', true);
  }

  static restartBlinkCursor() {
    this.cursor.classList.toggle('blinking', false);
    void this.cursor.offsetWidth;
    this.cursor.classList.toggle('blinking', true);
  }

  static registerListeners() {
    window.addEventListener('mouseup', e => {
      if (window.getSelection().isCollapsed) {
        this.focusInput();
      }
    });
  }
}