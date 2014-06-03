function PttChromePref(app, siteaddr) {
    this.sitename = 'ptt.cc';

    this.values = null;
    this.siteaddr = siteaddr;
    this.app = app;
		
    this.usedefault = true;
	
	  this.reloadPreference();
}

PttChromePref.prototype = {

  reloadPreference: function() {
    this.loadPrefFromStorage();
    this.updatePrefToApp();
  },

  updatePrefToApp: function() {
    for (var i in this.values) {
      this.app.onPrefChange(this, i);
    }
  },

  get: function(prefName) {
    console.log(prefName + " = " + this.values[prefName]);
    return this.values[prefName];
  },

  loadPrefFromStorage: function() {
    this.values = this.getStorage();
  },

  getStorage: function(key) {
    if (key == null) {
      return DEFAULT_PREFS;
    } else {
      return DEFAULT_PREFS[key];
    }

    //return chrome.storage.sync.get(key);
  },

  flushPrefToStorage: function() {
  },

  setPreference: function(key) {
    this.setStorage(key, this.values[key]);
  },

  setStorage: function(key, value) {
    chrome.storage.sync.set({'key': key, 'value': value}, function() {
      console.log('preference saved');
    });
  }

}
