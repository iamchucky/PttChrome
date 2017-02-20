
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

  get app() { return $('#app-container') as HTMLDivElement; }
  get term() { return $('#terminal') as HTMLDivElement; }
  get forceWidthEls() {
    return $all('.wpadding') as NodeListOf<HTMLSpanElement>;
  }
  get windowInnerBounds() {
    const offset = this.containerMargin * 2;
    const width = document.documentElement.clientWidth - offset;
    const height = document.documentElement.clientHeight - offset;
    return { width, height };
  }
  get firstGridOffsets() {
    const firstGrid = $('.term-row[srow="0"]') as HTMLSpanElement;
    return {
      top: firstGrid.offsetTop,
      left: firstGrid.offsetLeft
    };
  }
}