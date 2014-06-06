function PttChromePref(app) {
  this.values = null;
  this.app = app;
  this.modalShown = false;
  this.shouldResetToDefault = false;

  this.reloadPreference();
}

PttChromePref.prototype = {

  updatePreferencesToUi: function() {
    for (var i in PREFS_CATEGORIES) {
      var cat = PREFS_CATEGORIES[i];
      $('#opt_'+cat).text(i18n('options_'+cat));
    }
    for (var i in this.values) {
      $('#opt_'+i).empty();
      var val = this.values[i];
      switch(typeof(val)) {
        case 'number':
        case 'string':
          $('#opt_'+i).html(
            '<label style="font-weight:normal;">'+i18n('options_'+i)+'</label>'+
            '<input type="text" class="form-control" value="'+val+'">');
          break;
        case 'boolean':
          $('#opt_'+i).html(
            '<label><input type="checkbox" '+(val?'checked':'')+'>'+i18n('options_'+i)+'</label>');
          break;
        default:
          break;
      }
    }
  },

  populatePreferencesToUi: function() {
    var self = this;
    $('#opt_reset').text(i18n('options_reset'));
    $('#opt_reset').click(function() {
      $('#prefModal').modal('hide');
      self.shouldResetToDefault = true;
    });

    this.updatePreferencesToUi();

    $('#prefModal').on('shown.bs.modal', function(e) {
      self.modalShown = true;
    });
    $('#prefModal').on('hidden.bs.modal', function(e) {
      if (self.shouldResetToDefault) {
        self.clearStorage();
        self.values = JSON.parse(JSON.stringify(DEFAULT_PREFS));
        self.updatePreferencesToUi();
        self.shouldResetToDefault = false;
      } else {
        for (var i in self.values) {
          var elem = $('#opt_'+i+' input');
          var type = typeof(self.values[i]);
          switch(type) {
            case 'number':
              self.values[i] = parseInt(elem.val());
              break;
            case 'string':
              self.values[i] = elem.val();
              break;
            case 'boolean':
              self.values[i] = elem.prop('checked');
              break;
            default:
              break;
          }
        }
      }
      self.setStorage(self.values);
      self.updatePrefToApp();
      self.modalShown = false;
      self.app.setInputAreaFocus();
    });
  },

  reloadPreference: function() {
    var self = this;
    this.getStorage(null, function(items) {
      var itemsEmpty = (Object.keys(items).length === 0);
      if (itemsEmpty) {
        items = JSON.parse(JSON.stringify(DEFAULT_PREFS));
        console.log('pref: first time, load default to sync storage');
        self.setStorage(items);
      }
      self.values = items;
      self.updatePrefToApp();
      self.populatePreferencesToUi();
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
