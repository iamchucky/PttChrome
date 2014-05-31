function PttChromePref(app, siteaddr) {
    this.sitename = 'ptt.cc';

    this.values = [];
    this.siteaddr = siteaddr;
    this.app = app;
		
    this.usedefault = true;
	
    this.loadPrefFromStorage();
    this.updatePrefToApp();
}

PttChromePref.prototype = {

  reloadSetting: function() {
    this.loadPrefFromStorage();
    this.updatePrefToApp();
  },

  updatePrefToApp: function() {
	for(var i in BOOL_TYPES)
      this.app.onPrefChange(this, BOOL_TYPES[i]);
    for(var i in INT_TYPES)
      this.app.onPrefChange(this, INT_TYPES[i]);
    for(var i in COMP_TYPES)
      this.app.onPrefChange(this, COMP_TYPES[i]);
  },

  getPreference: function(key) {
	  this.values[key] = this.getStorage(key);
  },
  getPreferenceBool: function(key) {
	  this.values[key] = (this.getStorage(key) == '1');
  },

  setPreference: function(key) {
    this.setStorage(key, this.values[key]);
  },

  getPrefValue: function(prefName) {
    console.log(prefName + " = " + this.values[prefName]);
    return this.values[prefName];
  },

  loadPrefFromStorage: function() {
    //var defaultPref = this.browserutils.getSubBranch('host_default.');
    for(var i in BOOL_TYPES){
      try{
        this.getPreferenceBool(BOOL_TYPES[i]);
      }
      catch(e){
        //read this pref from default and save this value right now !
        //this.values[BOOL_TYPES[i]] = defaultPref.getBoolPref(BOOL_TYPES[i]);
        //this.setPrefBool(BOOL_TYPES[i]);
      }
    }
    for(var i in INT_TYPES){
      try{
        this.getPreference(INT_TYPES[i]);
      }
      catch(e){
        //read this pref from default...
        //this.values[INT_TYPES[i]] = defaultPref.getIntPref(INT_TYPES[i]);
        //this.setPrefInte(INT_TYPES[i]);
      }
    }
    for(var i in COMP_TYPES){
      try{
        this.getPreference(COMP_TYPES[i]);
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

  setPrefToStorage: function() {
  },

  getStorage: function(key) {
    return BBS_DEFAULT_SETTINGS[key];

    //return chrome.storage.sync.get(key);
  },

  setStorage: function(key, value) {
    chrome.storage.sync.set({'key': key, 'value': value}, function() {
      console.log('preference saved');
    });
  }

}
