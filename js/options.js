function BBSFoxSiteSetting(opt, siteaddr, sitename, newsite, usedefault, listcellrow) {
    this.opt = opt;
    this.usedefault = usedefault;
    //this.browserutils = new BBSFoxBrowserUtils();
    //this.prefs = this.browserutils.getSubBranch('host_'+siteaddr+'.');
    this.values = [];
    this.sitename = sitename;
    this.siteaddr = siteaddr;
    if(listcellrow)
      this.listcellrow = listcellrow;
    else
      this.listcellrow = document.getElementById('defaultsiterow');

    //if(sitename=='')
    //  this.charsetTest();

    if(!newsite)
      this.getFromPref();
    else
      this.getFromUi();
}

BBSFoxSiteSetting.prototype = {
  getPrefBool: function(elementId, prefName) {
    if (!prefName) prefName = elementId;
	  this.values[elementId] = GetSiteLocalStorage(this.usedefault ? DEFAULT_NAME : this.siteaddr, elementId);
	  if(this.values[elementId] == undefined)
	    this.values[elementId] = BBS_DEFAULT_SETTINGS[elementId];	  
  },

  setPrefBool: function(elementId, prefName) {
    if(!prefName) prefName = elementId;
    if (this.usedefault) return;
    else SetSiteLocalStorage(this.siteaddr, elementId, this.values[elementId]);    	
  },

  getPrefInte: function(elementId, prefName) {
    if(!prefName) prefName = elementId;
	
	  this.values[elementId] = GetSiteLocalStorage(this.usedefault ? DEFAULT_NAME : this.siteaddr, elementId);
	  if(this.values[elementId] == undefined)
	    this.values[elementId] = BBS_DEFAULT_SETTINGS[elementId];
  },

  setPrefInte: function(elementId, prefName) {
    if(!prefName) prefName = elementId;
    if(this.usedefault) return;
    else SetSiteLocalStorage(this.siteaddr, elementId, this.values[elementId]);
  },

  getPrefComp: function(elementId, prefName) {
    if(!prefName) prefName = elementId;
	  this.values[elementId] = GetSiteLocalStorage(this.usedefault ? DEFAULT_NAME : this.siteaddr, elementId);
	  if(this.values[elementId] == undefined)
	    this.values[elementId] = BBS_DEFAULT_SETTINGS[elementId];	  
  },

  setPrefComp: function(elementId, prefName) {
    if(!prefName) prefName = elementId;
	  if(this.usedefault) return;
    else SetSiteLocalStorage(this.siteaddr, elementId, this.values[elementId]);
  },

  getUiBool: function(elementId) {
    if(document.getElementById("option."+elementId).checked != false)
      this.values[elementId] = "1";
    else
      this.values[elementId] = "0";
  },

  setUiBool: function(elementId) {
    if(this.values[elementId]=='1')
      document.getElementById("option."+elementId).checked = true;
    else
      document.getElementById("option."+elementId).checked = false;
  },

  getUiInte: function(elementId) {
    var item = document.getElementById("option."+elementId);
    if(item.tagName.toLowerCase()=='select')
    {
      this.values[elementId] = item.options[item.selectedIndex].value;
      //alert(this.siteaddr+" "+this.values[elementId]);
    }
    else if(item.tagName.toLowerCase()=='input' && item.type.toLowerCase()=='radio')
    {
      var items = [];
      items.push(item);
      var j =1;
      for(;;)
      {
        item = document.getElementById("option."+elementId+j);
        if(item)
          items.push(item);
        else
          break;
        ++j;
      }
      for(var i=0;i<items.length;++i)
      {
        if(items[i].checked!=false)
          this.values[elementId] = items[i].value;
      }
    }
    else
    {
      this.values[elementId] = document.getElementById("option."+elementId).value;
    }
  },

  setUiInte: function(elementId) {
    var item = document.getElementById("option."+elementId);
    if(item.tagName.toLowerCase()=='select')
    {
      var count = item.options.length;
      for(var i=0;i<count;++i)
      {
        if(item.options[i].value == this.values[elementId])
        {
           item.selectedIndex=i;
           if(item.className=='colorpicker')
             colorPickerOnChange(item);
           break;
        }
      }
    }
    else if(item.tagName.toLowerCase()=='input' && item.type.toLowerCase()=='radio')
    {
      var items = [];
      items.push(item);
      var j =1;
      for(;;)
      {
        item = document.getElementById("option."+elementId+j);
        if(item)
          items.push(item);
        else
          break;
        ++j;
      }
      for(var i=0;i<items.length;++i)
      {
        if(this.values[elementId] == items[i].value)
          items[i].checked=true;
      }
    }
    else
    {
      document.getElementById("option."+elementId).value = this.values[elementId];
    }
  },

  getUiComp: function(elementId) {
    this.values[elementId] = document.getElementById("option."+elementId).value;
  },

  setUiComp: function(elementId) {
    document.getElementById("option."+elementId).value = this.values[elementId];
  },

  //getUiAccount: function(elementId) {
  //  this.values[elementId] = document.getElementById(elementId).value;
  //},

  //setUiAccount: function(elementId) {
  //  document.getElementById(elementId).value = this.values[elementId];
  //},

  getFromUi: function() {
      for(var i in BOOL_TYPES){
        this.getUiBool(BOOL_TYPES[i]);
      }
      for(var i in INT_TYPES){
        this.getUiInte(INT_TYPES[i]);
      }
      for(var i in COMP_TYPES){
        this.getUiComp(COMP_TYPES[i]);
      }
      //for(var i in opt.valueAccount){
      //  this.getUiAccount(opt.valueAccount[i]);
      //}
  },

  setToUi: function() {
      for(var i in BOOL_TYPES){
        this.setUiBool(BOOL_TYPES[i]);
      }
      for(var i in INT_TYPES){
        this.setUiInte(INT_TYPES[i]);
      }
      for(var i in COMP_TYPES){
        this.setUiComp(COMP_TYPES[i]);
      }
      //for(var i in opt.valueAccount){
      //  this.setUiAccount(opt.valueAccount[i]);
      //}
      this.opt.charsetChange();
  },

  getFromPref: function() {
      //var defaultPref = this.browserutils.getSubBranch('host_default.');
      for(var i in BOOL_TYPES){
        try{        	        	
          this.getPrefBool(BOOL_TYPES[i]);
        }
        catch(e){
          /*
          //read this pref from default and save this value right now !
          this.values[BOOL_TYPES[i]] = defaultPref.getBoolPref(BOOL_TYPES[i]);
          this.setPrefBool(BOOL_TYPES[i]);
          */
        }
      }
      for(var i in INT_TYPES){
        try{
          this.getPrefInte(INT_TYPES[i]);
        }
        catch(e){
          /*
          //read this pref from default...
          this.values[INT_TYPES[i]] = defaultPref.getIntPref(INT_TYPES[i]);
          this.setPrefInte(INT_TYPES[i]);
          */
        }
      }
      for(var i in COMP_TYPES){
        try{
          this.getPrefComp(COMP_TYPES[i]);
        }
        catch(e){
          /*
          //read this pref from default...
          this.values[COMP_TYPES[i]] = defaultPref.getComplexValue(COMP_TYPES[i], Components.interfaces.nsISupportsString).data;
          this.setPrefComp(COMP_TYPES[i]);
          */
        }
      }
      //load login data - start
      /*
      var url = (this.siteaddr == 'default') ? 'chrome://bbsfox2' : 'telnet://' + this.siteaddr;
      try {
        var logins = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager).findLogins({}, url, 'chrome://bbsfox2', null);
        if(logins.length)
        {
          this.values['Login'] = logins[0]['username'];
          this.values['Passwd'] = logins[0]['password'];
        }
        else
        {
          this.values['Login'] = '';
          this.values['Passwd'] = '';
        }
      } catch(e) {
        this.values['Login'] = '';
        this.values['Passwd'] = '';
      }
      */
      //load login data - end
  },

  setToPref: function() {
      for(var i in BOOL_TYPES){
        this.setPrefBool(BOOL_TYPES[i]);
      }
      for(var i in INT_TYPES){
        this.setPrefInte(INT_TYPES[i]);
      }
      for(var i in COMP_TYPES){
        this.setPrefComp(COMP_TYPES[i]);
      }
      if(this.sitename=='')
      {
      }
      else
      {
		    SetSiteLocalStorage(this.siteaddr, SITE_NAME, this.sitename);
		    SetSiteLocalStorage(this.siteaddr, USE_DEFAULT, this.usedefault ? '1' : '0');
      }
      //save login data - start
      /*
      this.delLoginData();
      var url = (this.siteaddr == 'default') ? 'chrome://bbsfox2' : 'telnet://' + this.siteaddr;
      try {
        var myLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",Components.interfaces.nsILoginInfo,"init");
        var login = new myLoginInfo(url, 'chrome://bbsfox2', null, this.values[opt.valueAccount[0]], this.values[opt.valueAccount[1]], '', '');
        Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager).addLogin(login);
      } catch(e) {}
      */
      //save login data - end
  },

  /*
  delLoginData: function() {
    //delete login data - start
    var url = (this.siteaddr == 'default') ? 'chrome://bbsfox2' : 'telnet://' + this.siteaddr;
    try {
      var loginManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
      var logins = loginManager.findLogins({}, url, 'chrome://bbsfox2', null);
      for (var i = 0; i < logins.length; i++)
        loginManager.removeLogin(logins[i]);
    } catch(e) {}
    //delete login data - end
  }
  */

  /*
  charsetTest: function() {
    // detect system locale and save to pref
    if(this.prefs.getComplexValue('Charset', Components.interfaces.nsISupportsString).data == 'locale') {
      var PLStr = Components.interfaces.nsIPrefLocalizedString;

      var nsIString = Components.classes["@mozilla.org/supports-string;1"]
                              .createInstance(Components.interfaces.nsISupportsString);
      nsIString.data = this.browserutils._prefBranch.getComplexValue('locale', PLStr).data;
      this.prefs.setComplexValue('Charset', Components.interfaces.nsISupportsString, nsIString);
    }
  }
  */
}

function BBSFoxOptions() {
  //this.valueAccount = ['Login','Passwd'];

  //this.browserutils = new BBSFoxBrowserUtils();
  //this.prefs = this.browserutils.getSubBranch('host_default.');

  this.allSiteSetting = [];
  this.selectedSetting = null;
  this.defaultSiteSetting = null;
  this.siteListNode = document.getElementById('siteListEx');
}

BBSFoxOptions.prototype = {

  addSite: function(siteName, siteAddr, newsite, usedefault) {
    var siteList = this.siteListNode;
    var listcellrow = document.createElement('div');
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
    
    var newsite = new BBSFoxSiteSetting(this, siteAddr, siteName, newsite, usedefault, listcellrow);
    this.allSiteSetting.push(newsite);
    var self = this;
    listcellrow.addEventListener('click', function() {
      self.siteChanged(newsite);
      self.selectedSetting = newsite;
	    document.getElementById('option.btndelsite').disabled = "";
    });
  },

  delSite: function() {
    var selectedNode = this.selectedSetting.listcellrow;
    var siteAddr = selectedNode.getAttribute('site');
    var siteList = this.siteListNode.removeChild(selectedNode);
    if(!siteAddr)
      return;

    var delSiteIndex = this.allSiteSetting.indexOf(this.selectedSetting);
    this.allSiteSetting.splice(delSiteIndex, 1);

    // Change to select the default setting.
    this.siteChanged(this.defaultSiteSetting);
    this.selectedSetting = this.defaultSiteSetting;
    document.getElementById('option.btndelsite').disabled = "true";
  },

  getSelectedSite: function() {
    return this.selectedSetting.listcellrow.getAttribute('site');
  },

  siteChanged: function(siteSetting) {
    //dumpLog(DUMP_TYPE_LOG, "siteChangedStart");
    this.defaultSiteSetting.listcellrow.className = '';
    for (var i in this.allSiteSetting) {
      this.allSiteSetting[i].listcellrow.className = '';
    }
    siteSetting.listcellrow.className = 'selected';
    
    //save prevous page value
    this.selectedSetting.getFromUi();

    //load new page value
    //if site use default setting, hide every thing.
    if(siteSetting.usedefault) {
      document.getElementById('options_siteprefpanel').style.display = 'none';
      document.getElementById('options_siteprefnote').style.display = 'block';
    } else {
      document.getElementById('options_siteprefnote').style.display = 'none';
      document.getElementById('options_siteprefpanel').style.display = 'block';
      siteSetting.setToUi();
    }
    return true;
  },

  onFontChange:function() {
      if(document.getElementById("FontFace.string").value=='')
      {
        document.getElementById("FontTestResult").style.display = 'none';
        return;
      }
      var strBundle = document.getElementById("bbsfoxoptions-string-bundle");
      var s0 = document.getElementById("FontFaceTest.span0");
      var s1 = document.getElementById("FontFaceTest.span1");
      var s2 = document.getElementById("FontFaceTest.span2");
      var s3 = document.getElementById("FontFaceTest.span3");
      var s4 = document.getElementById("FontFaceTest.span4");
      var s5 = document.getElementById("FontFaceTest.span5");
      var s9 = document.getElementById("FontTestResult");

      var fontface = document.getElementById("FontFace.string").value;
      var idx = fontface.indexOf('(');
      if(idx!=-1)
        fontface = fontface.substring(0,idx);

      if(fontface =='Fixedsys')
      {
        s9.style.display = 'inline';
        s9.style.color ="#FF0000";
        s9.value = strBundle.getString('fontTestResult3');
        return;
      }

      s0.style.fontFamily = fontface;
      s1.style.fontFamily = fontface;
      s2.style.fontFamily = fontface;
      s3.style.fontFamily = fontface;
      s4.style.fontFamily = fontface;
      s5.style.fontFamily = fontface;

      s0.style.fontSize = "48px";
      s1.style.fontSize = "48px";
      s2.style.fontSize = "48px";
      s3.style.fontSize = "48px";
      s4.style.fontSize = "48px";
      s5.style.fontSize = "48px";

      var w0 = s0.offsetWidth;
      var w1 = s1.offsetWidth;
      var w2 = s2.offsetWidth;
      var w3 = s3.offsetWidth;
      var w4 = s4.offsetWidth;
      var w5 = s5.offsetWidth;

      if(w0==w1 && w1==w2 && w2==w3 && w3==w4 && w4==w5)
      {
        s9.style.display = 'inline';
        s9.style.color ="#0000FF";
        s9.value = strBundle.getString('fontTestResult1');
      }
      else if(w1==w2 && w2==w3 && w3==w4 && w4==w5)
      {
        s9.style.display = 'inline';
        s9.style.color ="#FF0000";
        s9.value = strBundle.getString('fontTestResult4');
      }
      else if(w2==w3 && w3==w4 && w4==w5)
      {
        s9.style.display = 'inline';
        s9.style.color ="#FF0000";
        s9.value = strBundle.getString('fontTestResult2');
      }
      else
      {
        s9.style.display = 'inline';
        s9.style.color ="#FF0000";
        s9.value = strBundle.getString('fontTestResult3');
      }
  },

  charsetChange:function() {
    // build font lists
    /*
    if(document.getElementById('Charset').value == 'gb2312')
      var lang = 'zh-CN';
    else
      var lang = 'zh-TW';
    var fontFace = document.getElementById('FontFace.string');
    var fontFaceEn = document.getElementById('FontFaceEn.string');
    FontBuilder.buildFontList(lang, 'monospace', fontFace);
    FontBuilder.buildFontList(lang, 'monospace', fontFaceEn);
    //
    var siteList = document.getElementById('siteListEx');
    var siteIndex = 0;
    if(siteList.selectedItems[0])
      siteIndex = siteList.getIndexOfItem(siteList.selectedItems[0]);

    document.getElementById('FontFace.string').value = this.allSiteSetting[siteIndex].values['FontFace.string'];
    document.getElementById('FontFaceEn.string').value = this.allSiteSetting[siteIndex].values['FontFaceEn.string'];
    */
  },

  getSiteAddrList: function() {
    var siteAddrList = GetLocalStorage("option.SiteAddrList");
    if(siteAddrList)
      return siteAddrList.split("/");
    return [];
  },

  delSiteFromeAddrList: function(siteAddr) {
    /*
    var siteAddrList = GetLocalStorage("option.SiteAddrList");
    var siteAddrList2 = [];
    var siteAddrList3 = [];
    var siteAddrList4 = "";
    if(siteAddrList)
    {
      siteAddrList2 = siteAddrList.split("/");
      for(var i=0;i<siteAddrList2.length();++i);
      {
        if(siteAddrList2[i]==siteAddr)
        {
        }
        else
        {
          siteAddrList3.push(siteAddrList2[i]);
        }
      }
      for(var i=0;i<siteAddrList3.length();++i);
      {
        if(siteAddrList4!="")
          siteAddrList4+=("/"+siteAddrList3[i]);
        else
          siteAddrList4+=siteAddrList3[i];
      }
    }
	SetLocalStorage("option.SiteAddrList", siteAddrList4);
    */
  },

  load: function() {
    //load default setting.
    var siteAddrList = this.getSiteAddrList();
    var subBranch = 'default';
    var defaultSiteSetting = new BBSFoxSiteSetting(this, subBranch, '', false, false);
    this.allSiteSetting.push(defaultSiteSetting);
    var self = this;
    defaultSiteSetting.listcellrow.addEventListener('click', function() {
      self.siteChanged(defaultSiteSetting);
      self.selectedSetting = defaultSiteSetting;
	    document.getElementById('option.btndelsite').disabled = "true";
    });
    this.selectedSetting = defaultSiteSetting;
    defaultSiteSetting.listcellrow.className = 'selected';
    this.defaultSiteSetting = defaultSiteSetting;

    var siteList = document.getElementById('siteListEx');
    //var CiStr = Components.interfaces.nsISupportsString;
    for(var i=0; i<siteAddrList.length; ++i)
    {
      var sitename = GetSiteLocalStorage(siteAddrList[i], SITE_NAME);
      var usedefault = GetSiteLocalStorage(siteAddrList[i], USE_DEFAULT) == '1';
      this.addSite(sitename, siteAddrList[i], false, usedefault);
      /*
      var row = document.createElement('listitem');
      var cell = document.createElement('listcell');
      //var sitename = this.browserutils.getSubBranch('host_' + siteAddrList[i]+'.').getComplexValue(SITE_NAME, CiStr).data;
      var sitename = GetSiteLocalStorage(siteAddrList[i], SITE_NAME);
      cell.setAttribute('label', sitename);
      row.appendChild(cell);

      cell = document.createElement('listcell');
      cell.setAttribute('label', siteAddrList[i]);
      row.appendChild(cell);

      siteList.appendChild(row);
      var othersite = new BBSFoxSiteSetting(this, siteAddrList[i], sitename, false);
      this.allSiteSetting.push(othersite);
      alert("2 "+this.allSiteSetting.length);
      */
    }
    defaultSiteSetting.setToUi();
  },

  save: function() {
    this.selectedSetting.getFromUi();

    var siteAddrListStr = "";
    for (var i in this.allSiteSetting) {
      this.allSiteSetting[i].setToPref();
      if (this.allSiteSetting[i].siteaddr != 'default') {
        if (siteAddrListStr != "")
          siteAddrListStr += ("/" + this.allSiteSetting[i].siteaddr);
        else
          siteAddrListStr += this.allSiteSetting[i].siteaddr;
      }
    }
  	SetLocalStorage("option.SiteAddrList", siteAddrListStr);
  },

  cancel: function() {
  },

  getSiteList: function() {
    var sl =[];
    for(var i in this.allSiteSetting) {
      var siteAddrTemp = this.allSiteSetting[i].listcellrow.getAttribute('site');
      var splits = siteAddrTemp.split(/:/g);
      if (splits.length == 1) {
        sl.push(splits[0]);
        sl.push(splits[0]+':23');
      } else if (splits.length == 2) {
        if (splits[1]=='23') {
          sl.push(splits[0]);
          sl.push(splits[0]+':23');
        } else {
          sl.push(siteAddrTemp);
        }
      }
    }
    return sl;	
  },
  
  setDefault: function() {
    /*
    //set all ui item to default value.
    //var item = document.getElementById('ScreenType');
    //alert(item.getAttribute('bbsDefaultValue'));
    var item = null;
    for(var i in BOOL_TYPES){
      item = document.getElementById(BOOL_TYPES[i]);
      if(item)
        item.checked = (item.getAttribute('bbsfoxDefaultValue')=='true');
    }
    for(var i in INT_TYPES){
      item = document.getElementById(INT_TYPES[i]);
      if(item)
        item.value = item.getAttribute('bbsfoxDefaultValue');
    }
    for(var i in COMP_TYPES){
      item = document.getElementById(COMP_TYPES[i]);
      if(item)
        item.value = item.getAttribute('bbsfoxDefaultValue');
    }
    this.charsetChange();
    */
  },

  checkPref: function() {
    //if we can't find site from list, we must delete site pref...
    //var siteList = document.getElementById('siteListEx');
    var nowSiteAddrList = this.getSiteAddrList();
    for(var j=0;j<nowSiteAddrList.length;++j)
    {
      var findflag = false;
      for(var i in this.allSiteSetting)
      {
      //if(this.allSiteSetting[i].listcellrow.getAttribute('tabtype') == 'listcellrow-select')
      //for(var i=1;i<siteList.itemCount;++i)
      //  var listitem = siteList.getItemAtIndex(i);
        var siteAddr = this.allSiteSetting[i].siteaddr;
        if(siteAddr==nowSiteAddrList[j]) //found !
        {
          findflag = true;
          break;
        }
      }
      if(!findflag)
      {
        //delete saved login data - start
        /*
        var url = 'telnet://' + nowSiteAddrList[j];
        try {
          var loginManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
          var logins = loginManager.findLogins({}, url, 'chrome://bbsfox2', null);
          for (var i = 0; i < logins.length; i++)
            loginManager.removeLogin(logins[i]);
        } catch(e) {}
        */
        //delete saved login data - end
        this.delSiteFromeAddrList(nowSiteAddrList[j]);
      }
    }
  },
  notifyPage: function() {
    /*
      //notify page to check pref...
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);

      var browserEnumerator = wm.getEnumerator("navigator:browser");
      while (browserEnumerator.hasMoreElements())
      {
        var browserInstance = browserEnumerator.getNext().getBrowser();

        var numTabs = browserInstance.tabContainer.childNodes.length;
        for(var index=0; index<numTabs; index++) {
          var currentBrowser = browserInstance.getBrowserAtIndex(index);
          var urlstr = currentBrowser.currentURI.spec;
          var urllen = urlstr.length;
          if(urllen>9)
          {
            var urlheader = urlstr.substr(0,9);
            if(urlheader.toLowerCase()=="telnet://")
            {
              var doc = currentBrowser.contentDocument;
              if (doc) {
                var cmdhandler = doc.getElementById('cmdHandler');
                if (cmdhandler && "createEvent" in doc) {
                  cmdhandler.setAttribute('bbsfoxCommand', 'checkPrefExist');
                  var evt = doc.createEvent("Events");
                  evt.initEvent("OverlayCommand", false, false);
                  cmdhandler.dispatchEvent(evt);
                }
              }
            }
            else
            {
            }
          }
          else
          {
          }
        }
      }
    */
  }
}

function colorPickerOnChangeEvent(event) {
  dumpLog(DUMP_TYPE_LOG, event);
  colorPickerOnChange(event.target);
}
// move from options.htm
function colorPickerOnChange(colorpicker) {
  switch(colorpicker.value)
  {
	case '0': colorpicker.style.background = '#000000'; colorpicker.style.color = '#000000';break;
	case '1': colorpicker.style.background = '#800000'; colorpicker.style.color = '#800000';break;
	case '2': colorpicker.style.background = '#008000'; colorpicker.style.color = '#008000';break;
	case '3': colorpicker.style.background = '#808000'; colorpicker.style.color = '#808000';break;
	case '4': colorpicker.style.background = '#000080'; colorpicker.style.color = '#000080';break;
	case '5': colorpicker.style.background = '#800080'; colorpicker.style.color = '#800080';break;
	case '6': colorpicker.style.background = '#008080'; colorpicker.style.color = '#008080';break;
	case '7': colorpicker.style.background = '#c0c0c0'; colorpicker.style.color = '#c0c0c0';break;
	case '8': colorpicker.style.background = '#808080'; colorpicker.style.color = '#808080'; break;
	case '9': colorpicker.style.background = '#ff0000'; colorpicker.style.color = '#ff0000'; break;
	case '10': colorpicker.style.background = '#00ff00'; colorpicker.style.color = '#00ff00'; break;
	case '11': colorpicker.style.background = '#ffff00'; colorpicker.style.color = '#ffff00'; break;
	case '12': colorpicker.style.background = '#0000ff'; colorpicker.style.color = '#0000ff'; break;
	case '13': colorpicker.style.background = '#ff00ff'; colorpicker.style.color = '#ff00ff'; break;
	case '14': colorpicker.style.background = '#00ffff'; colorpicker.style.color = '#00ffff'; break;
	case '15': colorpicker.style.background = '#ffffff'; colorpicker.style.color = '#ffffff'; break;
  }
}

function iniTabs() {
  var tabheaders = document.getElementsByTagName('header');
  for(var i=0; i<tabheaders.length; ++i) {
	if(!tabheaders[i].parentNode.className)
	  tabheaders[i].parentNode.className = 'inactive';

	tabheaders[i].onclick = function(event) {
	  var tab = event.target.parentNode;
	  for(var j=0; j<tab.parentNode.childNodes.length; ++j)
	  {
		if(tab.parentNode.childNodes[j].tabtype!='listview')
		  tab.parentNode.childNodes[j].className = 'inactive';
	  }
	  tab.className = 'active';
	};
  }
}
window.onresize = resize;
var existSite = [];
var options = null;
var numberadd = null;

// Saves options to localStorage.
function save_options() {
  var select = document.getElementById("color");
  var color = select.children[select.selectedIndex].value;
  SetLocalStorage("favorite_color", color);
  SetLocalStorage("option.defaultsite", document.getElementById("option.defaultsite").value);
}

// Restores select box state to saved value from localStorage.
/*
function restore_options() {
  var defaultsite = GetLocalStorage("option.defaultsite");
  if (defaultsite)
	document.getElementById("option.defaultsite").value = defaultsite;
  else
  {
	document.getElementById("option.defaultsite").value = 'ptt.cc';
	SetLocalStorage("option.defaultsite", 'ptt.cc');
  }

  var favorite = GetLocalStorage("favorite_color");
  if (!favorite) {
	return;
  }

  var select = document.getElementById("color");
  for (var i = 0; i < select.children.length; i++) {
	var child = select.children[i];
	if (child.value == favorite) {
	  child.selected = "true";
	  break;
	}
  }
}
*/
function showMask() {
  var mask = document.getElementById('option.mask');
  mask.style.display='block';
  var body = document.body;
  var html = document.documentElement;

  var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
  var width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
  
  mask.style.width= width + 'px';
  mask.style.height= height + 'px';
}

function hideMask() {
  var mask = document.getElementById('option.mask');
  mask.style.display='none';
}

function addSite() {
  existSite = options.getSiteList();
  showMask();
  var addsitewindow = document.getElementById('addsite.window');
  addsitewindow.style.left=(document.documentElement.clientWidth - 250)/2 + 'px';
  addsitewindow.style.top=(document.documentElement.clientHeight - 100)/2 + 'px';
  addsitewindow.style.display='block';
  var btnok = document.getElementById('addsite.btnok');
  btnok.disabled = 'true';

  var sname = document.getElementById('addsite.name');
  sname.value = '';
  var saddr = document.getElementById('addsite.addr');
  saddr.value = '';
  sname.focus();
}

function delSite() {
  showMask();
  var delsitewindow = document.getElementById('delsite.window');
  delsitewindow.style.left=(document.documentElement.clientWidth - 250)/2 + 'px';
  delsitewindow.style.top=(document.documentElement.clientHeight - 100)/2 + 'px';
  delsitewindow.style.display='block';

  var ask = document.getElementById('delsite.ask');
  ask.innerHTML = localization('options_ask_delSite')+options.getSelectedSite()+ localization('options_ask_delSite2');
}

function cancelDelSite() {
  hideMask();
  var delsitewindow = document.getElementById('delsite.window');
  delsitewindow.style.display='none';
}

function acceptDelSite() {
  //delete site from list...
  options.delSite();
  hideMask();
  var delsitewindow = document.getElementById('delsite.window');
  delsitewindow.style.display='none';
}

function cancelAddSite() {
  hideMask();
  var addsitewindow = document.getElementById('addsite.window');
  addsitewindow.style.display='none';
}

function acceptAddSite() {
  //add site to list...
  options.addSite(document.getElementById('addsite.name').value, document.getElementById('addsite.addr').value, true, document.getElementById('addsite.usedefault').checked!=false);
  hideMask();
  var addsitewindow = document.getElementById('addsite.window');
  addsitewindow.style.display='none';
}

function resize() {
  var mask = document.getElementById('option.mask');
  var body = document.body;
  var html = document.documentElement;

  var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
  var width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );

  mask.style.width= width + 'px';
  mask.style.height= height + 'px';  
}

function checkSiteValue() {
  //if site already exists, disable ok button
  var sn = document.getElementById("addsite.name").value;
  var sa = document.getElementById("addsite.addr").value;

  if(sn=='' || sa=='')
  {
	setAcceptBtn(false);
	return;
  }

  var url = sa.toLowerCase();
  var url2;
  var addEnabled = (url.length > 0 && url.charCodeAt(url.length-1)!=46 );
  
  if(addEnabled){
    var splits = url.split(/:/g);
    if(splits.length == 1)
    {
      url2 = url.replace(/\./g,'');
      if(url2.match(/\W/))
        addEnabled = false;
    }
    else if(splits.length == 2)
    {
      if(splits[0]=='' || splits[1]=='')
        addEnabled = false;
      else
      {
        url2 = splits[0].replace(/\./g,'');
        if(url2.match(/\W/))
          addEnabled = false;
        if(splits[1].match(/\D/))
          addEnabled = false;
      }
    }
    else
    {
      addEnabled = false;
    }
  }

  if(addEnabled){ //check exists
	//var existSite = window.arguments[1];
	for(var i=0;i<existSite.length;++i){
	  if(existSite[i]==url){
		addEnabled = false;
		break;
	  }
	}
  }
  setAcceptBtn(addEnabled);
}

function setAcceptBtn(enable) {
  document.getElementById('addsite.btnok').disabled = (enable ? "" : "true");
}

function writeAllDefault() { 
  dumpLog(DUMP_TYPE_LOG, "writeAllDefault");
  for (var key in BBS_DEFAULT_SETTINGS) {
		//dumpLog(DUMP_TYPE_LOG, "BBS_DEFAULT_SETTINGS" + key + " = " + BBS_DEFAULT_SETTINGS[key]);
		SetSiteLocalStorage(DEFAULT_NAME, key, BBS_DEFAULT_SETTINGS[key]);
  }
  for (var key in BBS_VERSION_INFO) {
		//dumpLog(DUMP_TYPE_LOG, "BBS_VERSION_INFO" + key + " = " + BBS_VERSION_INFO[key]);
		SetLocalStorage(key, BBS_VERSION_INFO[key]);
  }
}

function localization(str) {
  return chrome.i18n.getMessage(str);
}

function stringEndWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function idToKey(id) {
	if(stringEndWith(id, '_'))
    return id.substr(0, id.length - 2);
  else
  	return id;
}

function setLocalization() {
    var labels = document.getElementsByTagName("label");
    for(var i=0; i<labels.length; ++i) {
        if(labels[i].id && labels[i].id.charAt(0) != "_")
            labels[i].textContent = localization(idToKey(labels[i].id));
    }
    // label cannot be inserted in <option></option>
    var options = document.getElementsByTagName("option");
    for(var j=0; j<options.length; ++j) {
        if(options[j].id && options[j].id.charAt(0) != "_")
            options[j].textContent = localization(idToKey(options[j].id));
    }
    // label within <header></header> make the change of tabs buggy
    var headers = document.getElementsByTagName("header");
    for(var k=0; k<headers.length; ++k) {
        if(headers[k].id && headers[k].id.charAt(0) != "_")
            headers[k].textContent = localization(idToKey(headers[k].id));
    }
    //document.title = localization("options_bbsfoxoptions");
    //document.getElementById('appName').textContent = getDetails().name;
    //document.getElementById('version').textContent = getDetails().version;
}

function load() {
  dumpLog(DUMP_TYPE_LOG, "load");
  //init all default value
  var addonVersion = GetLocalStorage('Version');
  dumpLog(DUMP_TYPE_LOG, addonVersion);
  if(addonVersion == null) //first install? write all default value
  {
	writeAllDefault();
	
  }
  else 
  {
	//check now version and last version...
  }
  //
  options = new BBSFoxOptions();
  options.load();
}

function save() {
  options.checkPref();
  options.save();
  //options.notifyPage();
}


var fileConn = null;
function selectBgFileOnClick(event) {
  fileConn = chrome.runtime.connect("cnmgcaggjdeglolimdhmidbcnohjgeia");
      fileConn.onMessage.addListener(function(msg) {
        switch(msg.action) {
            case "onFileDataReady":
            {
            	  //save File to local storage
            	  //alert(msg.data);
            	  if(msg.data!="")
            	    document.getElementById('option.backgrounddata').value = msg.data;
            	  fileConn.disconnect;
            	  //fileConn = null;
            	  //how to disconnect ?
                break;
            }
            case "disconnected":
                break;
            default:
        }
      });
      
      fileConn.onDisconnect.addListener(function(msg) {
          fileConn = null;
      });
      
      fileConn.postMessage({
            action: "readFile"
      });
}
// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  setLocalization();
	load();
	iniTabs();
	
	dumpLog(DUMP_TYPE_LOG, 'Add Event Listeners ');

	document.getElementById('option.btnaddsite').addEventListener('click', addSite);
	document.getElementById('option.btndelsite').addEventListener('click', delSite);
	document.getElementById('option.btnsave').addEventListener('click', save);
	document.getElementById('addsite.btnok').addEventListener('click', acceptAddSite);
	document.getElementById('addsite.btncancel').addEventListener('click', cancelAddSite);
	document.getElementById('addsite.name').addEventListener('input', checkSiteValue);
	document.getElementById('addsite.addr').addEventListener('input', checkSiteValue);
	document.getElementById('delsite.btnok').addEventListener('click', acceptDelSite);
	document.getElementById('delsite.btncancel').addEventListener('click', cancelDelSite);
	
	document.getElementById('option.bordercolor').addEventListener('change', colorPickerOnChangeEvent);
	document.getElementById('option.highlightbg').addEventListener('change', colorPickerOnChangeEvent);
	document.getElementById('option.btnselectbgfile').addEventListener('click', selectBgFileOnClick);

});

