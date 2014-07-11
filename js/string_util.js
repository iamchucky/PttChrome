// An alternative to the function with  e v a l ();
// Only support caret notations (^C, ^H, ^U, ^[, ^?, ...)
// and hexadecimal notation (\x1b, \x7f, ...)
// If you want to show \ and ^, use \\ and \^ respectively
String.prototype.unescapeStr = function() {
  var result = '';
  for(var i=0; i<this.length; ++i) {
    switch(this.charAt(i)) {
    case '\\':
      if(i == this.length-1) { // independent \ at the end of the string
        result += '\\';
        break;
      }
      switch(this.charAt(i+1)) {
      case '\\':
        result += '\\\\';
        ++i;
        break;
      case '^':
        result += '^';
        ++i;
        break;
      case 'x':
        if(i > this.length - 4) {
            result += '\\';
            break;
        }
        var code = parseInt(this.substr(i+2, 2), 16);
        result += String.fromCharCode(code);
        i += 3;
        break;
      default:
        result += '\\';
      }
      break;
    case '^':
      if (i == this.length-1) { // independent ^ at the end of the string
        result += '^';
        break;
      }
      if('@' <= this.charAt(i+1) && this.charAt(i+1) <= '_') {
        var code = this.charCodeAt(i+1) - 64;
        result += String.fromCharCode(code);
        i++;
      } else if(this.charAt(i+1) == '?') {
        result += '\x7f';
        i++;
      } else {
        result += '^';
      }
      break;
    default:
      result += this.charAt(i);
    }
  }
  return result;
};


// Wrap text within maxLen without hyphenating English words,
// where the maxLen is generally the screen width.
String.prototype.wrapText = function(maxLen, enterChar) {
  // Divide string into non-hyphenated groups
  // classified as \r, \n, single full-width character, an English word,
  // and space characters in the beginning of original line. (indent)
  // Spaces next to a word group are merged into that group
  // to ensure the start of each wrapped line is a word.
  // FIXME: full-width punctuation marks aren't recognized
  var pattern = /\r|\n|([^\x00-\x7f][,.?!:;]?[\t ]*)|([\x00-\x08\x0b\x0c\x0e-\x1f\x21-\x7f]+[\t ]*)|[\t ]+/g;
  var splited = this.match(pattern);

  var result = '';
  var len = 0;
  for(var i=0; i<splited.length; ++i) {
    // Convert special characters to spaces with the same width
    // and then we can get the width by the length of the converted string
    var grouplen = splited[i].replace(/[^\x00-\x7f]/g,"  ")
                              .replace(/\t/,"    ")
                              .replace(/\r|\n/,"")
                              .length;

    if(splited[i] == '\r' || splited[i] == '\n')
      len = 0;
    if(len + grouplen > maxLen) {
      result += enterChar;
      len = 0;
    }
    result += splited[i];
    len += grouplen;
  }
  return result;
};

String.prototype.u2b = function() {
  var data = '';
  for (var i = 0; i < this.length; ++i) {
    if (this.charAt(i) < '\x80') {
      data += this.charAt(i);
      continue;
    }
    var charCodeStr = this.charCodeAt(i).toString(16).toUpperCase();
    charCodeStr = 'x' + ('000' + charCodeStr).substr(-4);
    if (lib.u2bTable[charCodeStr])
      data += lib.u2bTable[charCodeStr];
    else // Not a big5 char
      data += '\xFF\xFD';
  }
  return data;
};

String.prototype.b2u = function() {
    var str = '';
    for (var i = 0; i < this.length; ++i) {
      if (this.charAt(i) < '\x80' || i == this.length-1) {
        str += this.charAt(i);
        continue;
      }

      var b5index = 'x' + this.charCodeAt(i).toString(16).toUpperCase() + 
                          this.charCodeAt(i+1).toString(16).toUpperCase();
      if (lib.b2uTable[b5index]) {
        str += lib.b2uTable[b5index];
        ++i;
      } else { // Not a big5 char
        str += this.charAt(i);
      }
    }
    return str;
};

String.prototype.parseReplyText = function() {
  var str = this;
  return (str.indexOf('▲ 回應至 (F)看板 (M)作者信箱 (B)二者皆是 (Q)取消？[F] ') == 0);
};

String.prototype.parsePushInitText = function() {
  var str = this;
  return (str.indexOf('您覺得這篇文章 1.值得推薦 2.給它噓聲 3.只加→註解 [1]?') == 0);
};

String.prototype.parseStatusRow = function() {
  var str = this;
  var regex = new RegExp(/  瀏覽 第 (\d{1,3})(?:\/(\d{1,3}))? 頁 *\( *(\d{1,3})%\)  目前顯示: 第 0*(\d+)~0*(\d+) 行 *\(y\)回應\(X\/?%\)推文(?:\(h\)說明)? *\(←\)離開 /g);
  var result = regex.exec(str);
  if (!result)
    return null;

  if (result.length == 6) {
    return {
      pageIndex:     parseInt(result[1]),
      pageTotal:     parseInt(result[2]),
      pagePercent:   parseInt(result[3]),
      rowIndexStart: parseInt(result[4]),
      rowIndexEnd:   parseInt(result[5])
    }
  }

  return null;
};

String.prototype.parseWaterball = function() {
  var str = this;
  var regex = new RegExp(/\x1b\[1;33;46m\u2605(\w+)\x1b\[0;1;37;45m (.+) \x1b\[m\x1b\[K/g);
  var result = regex.exec(str);
  if (result && result.length == 3) {
    return { userId: result[1], message: result[2] };
  } else {
    regex = new RegExp(/\x1b\[24;\d{2}H\x1b\[1;37;45m([^\x1b]+)(?:\x1b\[24;18H)?\x1b\[m/g);
    result = regex.exec(str);
    if (result && result.length == 2) {
      return { message: result[1] };
    }
  }

  return null;
}

String.prototype.parseThreadForUserId = function() {
  var str = this;
  var regex = new RegExp(/(?:(?:\d+)|(?:  \u2605 )) [\u002bmMsSD*!=~ ](?:(?:[X\d ]{2})|(?:\u7206))[\d ]\d\/\d{2} (\w+) +[\u25a1\u8f49R]:?/g);
  var result = regex.exec(str);
  if (result && result.length == 2) {
    return result[1].toLowerCase();
  }

  return null;
}

String.prototype.parsePushthreadForUserId = function() {
  var str = this;
  var regex = new RegExp(/[\u2192\u63a8\u5653] (\w+):.+ \d{2}\/\d{2} \d{2}:\d{2}/g);
  var result = regex.exec(str);
  if (result && result.length == 2) {
    return result[1].toLowerCase();
  }

  return null;
}

String.prototype.ansiHalfColorConv = function() {
  var str = '';
  var regex = new RegExp('\x15\\[(([0-9]+)?;)+50m', 'g');
  var result = null;
  var indices = [];
  while ((result = regex.exec(this))) {
    indices.push(result.index + result[0].length - 4);
  }

  if (indices.length == 0) {
    return this;
  }

  var curInd = 0;
  for (var i = 0; i < indices.length; ++i) {
    var ind = indices[i];
    var preEscInd = this.substring(curInd, ind).lastIndexOf('\x15') + curInd;
    str += this.substring(curInd, preEscInd) + '\x00' + this.substring(ind+4, ind+5) + this.substring(preEscInd, ind) + 'm';
    curInd = ind+5;
  }
  str += this.substring(curInd);
  return str;
};

String.prototype.trimLeft = function() {
  var i;
  for (i = 0; i < this.length; ++i) {
    if(this.charAt(i) != " " && this.charAt(i) != " ") 
      break;
  }
  return this.substring(i, this.length);
};

String.prototype.trimRight = function() {
  var i;
  for (i = this.length-1; i >= 0; i--) {
    if (this.charAt(i) != " " && this.charAt(i) != " ")
      break;
  }
  return this.substring(0, i+1);
};

String.prototype.trimBoth = function() {
  return this.trimLeft(this.trimRight());
};
