import { u2bTable } from './u2b-table';
import { b2uTable } from './b2u-table';

export class StringUtil {
  static u2b(str: string) {
    let data = '';
    const strLen = str.length;
    for (let i = 0; i < strLen; ++i) {
      if (str.charAt(i) < '\x80') {
        data += str.charAt(i);
        continue;
      }
      let charCodeStr = str.charCodeAt(i).toString(16).toUpperCase();
      charCodeStr = 'x' + ('000' + charCodeStr).substr(-4);
      if (u2bTable[charCodeStr])
        data += u2bTable[charCodeStr];
      else // Not a big5 char
        data += '\xFF\xFD';
    }
    return data;
  }

  static b2u(str: string) {
    let data = '';
    const strLen = str.length;
    for (let i = 0; i < strLen; ++i) {
      if (str.charAt(i) < '\x80' || i === strLen - 1) {
        data += str.charAt(i);
        continue;
      }
      const b5index = 'x' + str.charCodeAt(i).toString(16).toUpperCase() +
                            str.charCodeAt(i + 1).toString(16).toUpperCase();
      if (b2uTable[b5index]) {
        data += b2uTable[b5index];
        ++i;
      } else { // Not a big5 char
        data += str.charAt(i);
      }
    }
    return data;
  }

  static ansiHalfColorConv(str: string) {
    let result = null;
    const regex = new RegExp('\x15\\[(([0-9]+)?;)+50m', 'g');
    const indices = [];
    while (result = regex.exec(str)) {
      indices.push(result.index + result[0].length - 4);
    }

    const indicesLength = indices.length;
    if (!indicesLength) return str;

    let curInd = 0;
    let data = '';
    for (let i = 0; i < indicesLength; ++i) {
      const ind = indices[i];
      const preEscInd = str.substring(curInd, ind).lastIndexOf('\x15') + curInd;
      data += str.substring(curInd, preEscInd) + '\x00'
            + str.substring(ind + 4, ind + 5)
            + str.substring(preEscInd, ind) + 'm';
      curInd = ind + 5;
    }
    data += str.substring(curInd);
    return data;
  }

  static htmlSafe(char: string) {
    // only display visible chars to speed up
    if (char <= ' ' || char === '\x80')
      return ' ';
    else if (char === '\x3c')
      return '&lt;';
    else if (char === '\x3e')
      return '&gt;';
    else if (char === '\x26')
      return '&amp;';
    else
      return char;
  }
}