lib.symbols = {

  general: [
    '，','、','。','．','？','！','～','＄','％','＠','＆','＃','＊','‧','；','︰','…',
    '‥','﹐','﹒','˙','·','﹔','﹕','‘','’','“','”','〝','〞','‵','′','〃'
  ],

  lineBorders: [
    '├','─','┼','┴','┬','┤','┌','┐','│','▕','└','┘','╭','╮','╰','╯','╔','╦','╗','╠','═',
    '╬','╣','╓','╥','╖','╒','╤','╕','║','╚','╩','╝','╟','╫','╢','╙','╨','╜','╞','╪','╡',
    '╘','╧','╛'
  ],

  blocks: [
    '＿','ˍ','▁','▂','▃','▄','▅','▆','▇','█','▏','▎','▍','▌','▋','▊','▉','◢','◣','◥','◤'
  ],

  lines: [
    '﹣','﹦','≡','｜','∣','∥','–','︱','—','︳','╴','¯','￣','﹉','﹊','﹍','﹎','﹋',
    '﹌','﹏','︴','∕','﹨','╱','╲','／','＼'
  ],

  special: [
    '↑','↓','←','→','↖','↗','↙','↘','㊣','◎','○','●','⊕','⊙','△','▲','☆','★','◇','Æ','□',
    '■','▽','▼','§','￥','〒','￠','￡','※','♀','♂'
  ],

  brackets: [
    '〔','〕','【','】','《','》','（','）','｛','｝','﹙','﹚','『','』','﹛','﹜','﹝',
    '﹞','＜','＞','﹤','﹥','「','」','︵','︶','︷','︸','︹','︺','︻','︼','︽','︾',
    '〈','〉','︿','﹀','﹁','﹂','﹃','﹄'
  ],

  greek: [
    'Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ',
    'Χ','Ψ','Ω','α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ',
    'τ','υ','φ','χ','ψ','ω'
  ],

  phonetic: [
    'ㄅ','ㄆ','ㄇ','ㄈ','ㄉ','ㄊ','ㄋ','ㄌ','ㄍ','ㄎ','ㄏ','ㄐ','ㄑ','ㄒ','ㄓ','ㄔ','ㄕ',
    'ㄖ','ㄗ','ㄘ','ㄙ','ㄚ','ㄛ','ㄜ','ㄝ','ㄞ','ㄟ','ㄠ','ㄡ','ㄢ','ㄣ','ㄤ','ㄥ','ㄦ',
    'ㄧ','ㄨ','ㄩ','˙','ˊ','ˇ','ˋ'
  ],

  math: [
    '╳','＋','﹢','－','×','÷','＝','≠','≒','∞','ˇ','±','√','⊥','∠','∟','⊿','㏒','㏑',
    '∫','∮','∵','∴','≦','≧','∩','∪'
  ],

  hiragana: [
    'あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち',
    'つ','て','と','な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ','ま','み','む','め',
    'も','ら','り','る','れ','ろ','が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ','だ',
    'ぢ','づ','で','ど','ば','び','ぶ','べ','ぼ','ぱ','ぴ','ぷ','ぺ','ぽ','や','ゆ','よ',
    'わ','ん','を'
  ],

  katakana: [
    'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ','サ','シ','ス','セ','ソ','タ','チ',
    'ツ','テ','ト','ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ','マ','ミ','ム','メ',
    'モ','ラ','リ','ル','レ','ロ','ガ','ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ','ダ',
    'ジ','ズ','デ','ド','バ','ビ','ブ','ベ','ボ','パ','ピ','プ','ペ','ポ','ヤ','ユ','ヨ',
    'ワ','ン','ヲ'
  ]

};

lib.Symbols = function(app) {
  this.app = app;

  this.node = document.getElementById('symbolsContainer');
  this.tab = document.getElementById('symbolsTab');
  this.setupUi();
};

lib.Symbols.prototype.setupUi = function() {
  var self = this;
  var htmlStr = '';
  var dropdownHtmlStr = '';
  for (var i in lib.symbols) {
    var title = i18n('symTitle_'+i);
    dropdownHtmlStr += '<li><a href="#sym_'+i+'_list" name="'+i+'" data-toggle="tab">'+title+'</a></li>';
    var sym = lib.symbols[i];
    var height = Math.ceil(sym.length / 8) * 32; // find height by having 8 element each row
    htmlStr += '<ul id="sym_'+i+'_list" class="tab-pane" style="height:'+height+'px;"><li>' + lib.symbols[i].join('</li><li>') + '</li></ul>';
  }

  // setup tab content
  this.tab.innerHTML = htmlStr;
  
  // setup dropdown menu
  document.querySelector('#symbolsTabTitle .dropdown-menu').innerHTML = dropdownHtmlStr;
  var dropdownToggle = $('#symbolsContainer .dropdown-toggle');

  $('#symbolsTabTitle .dropdown-menu a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
    dropdownToggle.dropdown('toggle');
  })
  $('#symbolsTabTitle .dropdown-menu a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var title = e.target.textContent;
    dropdownToggle.html(title+' <span class="caret"></span>');
  });
  $('#symbolsTabTitle .dropdown-menu a:first').tab('show');

  $('#symbolsTab > .tab-pane > li').click(function(e) {
    self.app.telnetCore.convSend(e.target.textContent);
  });
}
