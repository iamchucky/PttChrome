var allSite = [];

// function startup() {
  // setTimer(false, function(){_startup();}, 100);
// }
document.addEventListener('DOMContentLoaded', function () {
  var siteList = document.getElementById('siteList');
  var siteAddrList = getSiteAddrList();
  if(siteAddrList.length==0)
  {
    // alert('請新增站台');
    // openURI('options.htm', true);
    // close();
    // var siteList = document.getElementById('siteList');
    // siteList.parentNode.removeChild(siteList);
  }
  else
  {
    for(var i=0; i<siteAddrList.length; ++i)
    {
      var sitename = GetSiteLocalStorage(siteAddrList[i], SITE_NAME);
      addSite(sitename, siteAddrList[i]);
    }
  }
  var btnSetting = document.getElementById('btnSetting');
  btnSetting.addEventListener('click', function() {
    // open the options page in a tab
    chrome.tabs.create({
        url: "options.html",
        selected: true
    }, function(tab) {
    });
    close();
  });

  // load locales
  btnSetting.textContent = chrome.i18n.getMessage('options_preferences');
  document.getElementById('options_siteName').textContent = chrome.i18n.getMessage('options_siteName');
  document.getElementById('options_siteAddress').textContent = chrome.i18n.getMessage('options_siteAddress');
});

function getSiteAddrList() {
  var siteAddrList = GetLocalStorage("option.SiteAddrList");
  if(siteAddrList)
    return siteAddrList.split("/");
  return [];
}

function addSite(siteName, siteAddr) {
  var siteList = document.getElementById('siteListEx');
  var listcellrow = document.createElement('div');
  listcellrow.className = 'listcellrow';
  listcellrow.setAttribute('tabtype','listcellrow');
  listcellrow.setAttribute('site',siteAddr);
  var rowcells = document.createElement('div');
  rowcells.setAttribute('tabtype','rowcells');
  var rowcell1 = document.createElement('div');
  rowcell1.setAttribute('tabtype','rowcell');
  rowcell1.setAttribute('site',siteAddr);
  rowcell1.style.left=0;
  rowcell1.innerHTML = siteName;
  var rowcell2 = document.createElement('div');
  rowcell2.setAttribute('tabtype','rowcell');
  rowcell2.setAttribute('site',siteAddr);
  rowcell2.style.left='126px';
  rowcell2.innerHTML = siteAddr;
  listcellrow.appendChild(rowcells);
  rowcells.appendChild(rowcell1);
  rowcells.appendChild(rowcell2);
  siteList.appendChild(listcellrow);
  rowcell1.addEventListener('click', selectSite);
  rowcell2.addEventListener('click', selectSite);
  allSite.push(listcellrow);
}

function selectSite(e) {
  var item = e.target;
  var site = item.getAttribute('site');

  //var sitename = localStorage['host_' + site +'.sitename'];
  allSite = null;
  var siteList = document.getElementById('siteList');
  siteList.parentNode.removeChild(siteList);
  var url = "telnet_window.html?site=" + site; 

  // open the telnet page in a tab
  chrome.tabs.create({
      url: url,
      selected: true
  }, function(tab) {
  });
  close();
}
