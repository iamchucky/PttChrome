import { TermChar } from './term-char';

export class TermLine {
  changed: boolean = false;
  chars: TermChar[];
  html: string;

  constructor(cols: number) {
    this.chars = Array.from(Array(cols), () => new TermChar(' '));
  }

  clear(start: number, end: number) {
    for (let col = start; col < end; ++col) {
      this.chars[col].clear();
    }
  }

  get textContent() {
    let s = '';
    const len = this.chars.length;
    for (let c = 0; c < len; ++c) {
      s += this.chars[c].ch;
    }
    return s;
  }
}