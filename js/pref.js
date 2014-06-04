function PttChromePref(app) {
    this.values = null;
    this.app = app;
	
	  this.reloadPreference();
}

PttChromePref.prototype = {

  reloadPreference: function() {
    var self = this;
    this.getStorage(null, function(items) {
      var itemsEmpty = (Object.keys(items).length === 0);
      if (itemsEmpty) {
        items = DEFAULT_PREFS;
        console.log('pref: first time, load default to sync storage');
        self.setStorage(items);
      }
      self.values = items;
      self.updatePrefToApp();
    });
  },

  updatePrefToApp: function() {
    for (var i in this.values) {
      this.app.onPrefChange(this, i);
    }
  },

  resetPreference: function() {
    this.clearStorage();
    this.reloadPreference();
  },

  get: function(prefName) {
    console.log(prefName + " = " + this.values[prefName]);
    return this.values[prefName];
  },

  set: function(prefName, value) {
    this.values[prefName] = value;
  },

  getStorage: function(key, callback) {
    chrome.storage.sync.get(key, callback);
  },

  setStorage: function(items) {
    chrome.storage.sync.set(items, function() {
      console.log('preference saved');
    });
  },

  clearStorage: function() {
    chrome.storage.sync.clear(function() {
      var err = chrome.runtime.lastError;
      if (err)
        console.log(err);
    });
  }

}
