function BBSFoxPref(bbsfox, siteaddr) {
    this.sitename = GetSiteLocalStorage(siteaddr, SITE_NAME);

    this.values = [];
    this.siteaddr = siteaddr;
    this.bbsfox = bbsfox;
		
    //this.usedefault = (GetSiteLocalStorage(siteaddr, USE_DEFAULT) == '1');
    this.usedefault = true;
	
    this.getFromPref();
    this.updateBBSFox();
}

BBSFoxPref.prototype = {
  reloadSetting: function() {
    this.getFromPref();
    this.updateBBSFox();
  },
  updateBBSFox: function() {
	for(var i in BOOL_TYPES)
      this.bbsfox.onPrefChange(this, BOOL_TYPES[i]);
    for(var i in INT_TYPES)
      this.bbsfox.onPrefChange(this, INT_TYPES[i]);
    for(var i in COMP_TYPES)
      this.bbsfox.onPrefChange(this, COMP_TYPES[i]);
  },
  getPrefBool: function(elementId, prefName) {
    if(!prefName) prefName = elementId;
	  this.values[elementId] = (GetSiteLocalStorage(this.usedefault ? DEFAULT_NAME : this.siteaddr, elementId) == '1');
  },

  //setPrefBool: function(elementId, prefName) {
  //  if(!prefName) prefName = elementId;
  //  localStorage['host_'+this.siteaddr+'.'+elementId] = this.values[elementId];
  //},

  getPrefInte: function(elementId, prefName) {
    if(!prefName) prefName = elementId;
	  this.values[elementId] = GetSiteLocalStorage(this.usedefault ? DEFAULT_NAME : this.siteaddr, elementId);
  },

  //setPrefInte: function(elementId, prefName) {
  //  if(!prefName) prefName = elementId;
    //this.prefs.setIntPref(prefName, this.values[elementId]);
  //  localStorage['host_'+this.siteaddr+'.'+elementId] = this.values[elementId];
  //},

  getPrefComp: function(elementId, prefName) {
    if(!prefName) prefName = elementId;
	  this.values[elementId] = GetSiteLocalStorage(this.usedefault ? DEFAULT_NAME : this.siteaddr, elementId);
  },

  //setPrefComp: function(elementId, prefName) {
  //  if(!prefName) prefName = elementId;
  //  var nsIString = Components.classes["@mozilla.org/supports-string;1"]
  //                            .createInstance(Components.interfaces.nsISupportsString);
  //  nsIString.data = this.values[elementId];
  //  this.prefs.setComplexValue(prefName, Components.interfaces.nsISupportsString, nsIString);
  //},

  getPrefValue: function(prefName) {
	console.log(prefName + " = " + this.values[prefName]);
    return this.values[prefName];
  },

  getFromPref: function() {
      //var defaultPref = this.browserutils.getSubBranch('host_default.');
      for(var i in BOOL_TYPES){
        try{
          this.getPrefBool(BOOL_TYPES[i]);
        }
        catch(e){
          //read this pref from default and save this value right now !
          //this.values[BOOL_TYPES[i]] = defaultPref.getBoolPref(BOOL_TYPES[i]);
          //this.setPrefBool(BOOL_TYPES[i]);
        }
      }
      for(var i in INT_TYPES){
        try{
          this.getPrefInte(INT_TYPES[i]);
        }
        catch(e){
          //read this pref from default...
          //this.values[INT_TYPES[i]] = defaultPref.getIntPref(INT_TYPES[i]);
          //this.setPrefInte(INT_TYPES[i]);
        }
      }
      for(var i in COMP_TYPES){
        try{
          this.getPrefComp(COMP_TYPES[i]);
        }
        catch(e){
          //read this pref from default...
          //this.values[COMP_TYPES[i]] = defaultPref.getComplexValue(COMP_TYPES[i], Components.interfaces.nsISupportsString).data;
          //this.setPrefComp(COMP_TYPES[i]);
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
        //this.browserutils.saveSite(this.sitename, this.siteaddr);
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
  }

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
