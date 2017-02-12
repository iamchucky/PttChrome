export const termColors = [
  // dark
  '#000000', // black
  '#800000', // red
  '#008000', // green
  '#808000', // yellow
  '#000080', // blue
  '#800080', // magenta
  '#008080', // cyan
  '#c0c0c0', // light gray
  // bright
  '#808080', // gray
  '#ff0000', // red
  '#00ff00', // green
  '#ffff00', // yellow
  '#0000ff', // blue
  '#ff00ff', // magenta
  '#00ffff', // cyan
  '#ffffff'  // white
];

export const termColorsInv = [
  // dark
  '#ffffff', // black
  '#7fffff', // red
  '#ff7fff', // green
  '#7f7fff', // yellow
  '#ffff7f', // blue
  '#7fff7f', // magenta
  '#ff7f7f', // cyan
  '#3f3f3f', // light gray
  // bright
  '#7f7f7f', // gray
  '#00ffff', // red
  '#ff00ff', // green
  '#0000ff', // yellow
  '#ffff00', // blue
  '#00ff00', // magenta
  '#ff0000', // cyan
  '#000000'  // white
];

enum DefaultTermColor {
  FOREGROUND = 7,
  BACKGROUND = 0
}

export interface TermCharAttr {
  fg: number;
  bg: number;
  bright: boolean;
  invert: boolean;
  blink: boolean;
  underline: boolean;
}

export class TermChar {
  needUpdate: boolean;
  isLeadByte: boolean;
  // startOfUrl: boolean;
  // endOfUrl: boolean;
  // partOfUrl: boolean;
  // partOfKeyWord: boolean;
  // keywordColor: string;
  // fullUrl: string;

  attr: TermCharAttr;
  html: string;

  constructor(public ch: string) {
    this.attr = {
      fg: DefaultTermColor.FOREGROUND,
      bg: DefaultTermColor.BACKGROUND,
      bright: false,
      invert: false,
      blink: false,
      underline: false
    };
    this.needUpdate = false;
    this.isLeadByte = false;
    // this.startOfUrl = false;
    // this.endOfUrl = false;
    // this.partOfUrl = false;
    // this.partOfKeyWord = false;
    // this.keywordColor = '#ff0000';
    // this.fullUrl = '';
    this.html = '';
  }

  copyFrom(char: TermChar) {
    this.ch = char.ch;
    this.isLeadByte = char.isLeadByte;
    this.copyAttr(char.attr);
  }

  copyAttr(attr: TermCharAttr) {
    this.attr = JSON.parse(JSON.stringify(attr));
  }

  clear(needUpdate = true) {
    this.ch = ' ';
    this.isLeadByte = false;
    this.resetAttr();
    this.needUpdate = needUpdate;
  }

  resetAttr() {
    this.attr = {
      fg: DefaultTermColor.FOREGROUND,
      bg: DefaultTermColor.BACKGROUND,
      bright: false,
      invert: false,
      blink: false,
      underline: false
    };
  }

  get fg() {
    const color = this.attr.invert ? this.attr.bg : this.attr.fg;
    return this.attr.bright ? (color + 8) : color;
  }

  set fg(fg: number) {
    this.attr.fg = fg;
  }

  get bg() {
    return this.attr.invert ? this.attr.fg : this.attr.bg;
  }

  set bg(bg: number) {
    this.attr.bg = bg;
  }
}