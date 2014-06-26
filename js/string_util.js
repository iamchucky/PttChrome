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
