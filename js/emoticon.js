lib.emoticons = {
  
  angry: [
    "(ノ ゜Д゜)ノ ︵ ═╩════╩═",
    "╯-____-)╯~═╩════╩═~",
    "(╭∩╮\\_/╭∩╮)",
    "( ︶︿︶)_╭∩╮",
    "( ‵□′)───C＜─___-)|||",
    "(￣ε(#￣) #○=(一-一o)",
    "(o一-一)=○# (￣#)3￣)",
    "╰(‵皿′＊)╯",
    "○(#‵︿′ㄨ)○",
    "◢▆▅▄▃-崩╰(〒皿〒)╯潰-▃▄▅▆◣",
  ],

  meh: [
    "(σ′▽‵)′▽‵)σ 哈哈哈哈～你看看你",
    "( ￣ c￣)y▂ξ",
    "( ′-`)y-～",
    "′_>‵",
    "╮(′～‵〞)╭",
    "╮(﹀_﹀\")╭",
    "︿(￣︶￣)︿",
    "..╮(﹋﹏﹌)╭..",
    "╮(╯_╰)╭",
    "╮(╯▽╰)/",
  ],

  sweat: [
    "(－^－)ｄ",
    "(￣￣；)",
    "(￣□￣|||)a",
    "(●；－_－)●",
    "￣▽￣||",
    "╭ ﹀◇﹀〣",
    "ˋ(′_‵||)ˊ",
    "●( ¯▽¯；●",
    "o(＞＜；)o o",
  ],

  happy: [
    "~(￣▽￣)~(＿△＿)~(￣▽￣)~(＿△＿)~(￣▽￣)~",
    "(~^O^~)",
    "(∩_∩)",
    "<(￣︶￣)>",
    "v(￣︶￣)y",
    "﹨(╯▽╰)∕",
    "\\(@^0^@)/",
    "\\(^▽^)/",
    "\\⊙▽⊙/",
  ],

  other: [
    "(．＿．?)",
    "(？o？)",
    "(‧Q‧)",
    "〒△〒",
    "m川@.川m",
    "(¯(∞)¯)",
    "(⊙o⊙)",
    "(≧<>≦)",
    "(☆_☆)",
    "o(‧\"‧)o",
  ]

};

lib.Emoticons = function(app) {
  this.app = app;

  this.node = document.getElementById('emoticonsContainer');
  this.tab = document.getElementById('emoticonsTab');
  this.setupUi();
};

lib.Emoticons.prototype.setupUi = function() {
  var self = this;
  var htmlStr = '';
  var dropdownHtmlStr = '';
  for (var i in lib.emoticons) {
    var title = i18n('emoTitle_'+i);
    dropdownHtmlStr += '<li><a href="#emo_'+i+'_list" name="'+i+'" data-toggle="tab">'+title+'</a></li>';
    var emo = lib.emoticons[i];
    var height = emo.length * 28; 
    htmlStr += '<ul id="emo_'+i+'_list" class="tab-pane" style="height:'+height+'px;"><li>' + lib.emoticons[i].join('</li><li>') + '</li></ul>';
  }

  // setup tab content
  this.tab.innerHTML = htmlStr;
  
  // setup dropdown menu
  document.querySelector('#emoticonsTabTitle .dropdown-menu').innerHTML = dropdownHtmlStr;
  var dropdownToggle = $('#emoticonsContainer .dropdown-toggle');

  $('#emoticonsTabTitle .dropdown-menu a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
  $('#emoticonsTabTitle .dropdown-menu a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var title = e.target.textContent;
    dropdownToggle.html(title+' <span class="caret"></span>');
  });
  $('#emoticonsTabTitle .dropdown-menu a:first').tab('show');

  $('#emoticonsTab > .tab-pane > li').click(function(e) {
    self.app.telnetCore.convSend(e.target.textContent);
  });
};
