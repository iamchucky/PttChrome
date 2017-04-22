function $(selector: string) {
  return document.querySelector(selector);
}

function $all(selector: string) {
  return document.querySelectorAll(selector);
}

export class Page {
  fontSize = 14;
  containerMargin = 10;
  verticalAlignCenter = true;
  horizontalAlignCenter = true;
  fontFitWindowWidth = false;

  static $ = $;
  static $all = $all;

  get app() { return $('#app-container') as HTMLDivElement; }
  get term() { return $('#terminal') as HTMLDivElement; }
  get termContainer() { return $('#terminal-container') as HTMLDivElement; }
  get cursor() { return $('#cursor') as HTMLDivElement; }
  get input() { return $('#ime-input') as HTMLInputElement; }
  get forceWidthEls() {
    return $all('.wpadding') as NodeListOf<HTMLSpanElement>;
  }
  get windowInnerBounds() {
    const offset = this.containerMargin * 2;
    const width = document.documentElement.clientWidth - offset;
    const height = document.documentElement.clientHeight - offset;
    return { width, height };
  }

  getGridOffsets(row = 0) {
    const firstGrid = $(`.term-row[srow="${row}"]`) as HTMLSpanElement;
    return {
      top: firstGrid.offsetTop,
      left: firstGrid.offsetLeft
    };
  }

  focusInput() {
    this.input.focus();
  }

  blinkCursor() {
    this.cursor.classList.toggle('blinking', true);
  }

  restartBlinkCursor() {
    this.cursor.classList.toggle('blinking', false);
    void this.cursor.offsetWidth;
    this.cursor.classList.toggle('blinking', true);
  }
}