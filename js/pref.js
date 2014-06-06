function PttChromePref(app) {
  this.values = null;
  this.app = app;
  this.modalShown = false;

  this.reloadPreference();
}

PttChromePref.prototype = {

  populatePreferencesToUi: function() {
    var outerDiv = $('<div></div>');
    for (var i in this.values) {
      var val = this.values[i];
      switch(typeof(val)) {
        case 'number':
          outerDiv.append(
              $('<div class="form-group"><label>'+i18n('options_'+i)+'</label>'+
                  '<input id="opt_'+i+'" type="text" class="form-control" data-type="num" value="'+val+'">'+
                '</div>'));
          break;
        case 'string':
          outerDiv.append(
              $('<div class="form-group"><label>'+i18n('options_'+i)+'</label>'+
                  '<input id="opt_'+i+'" type="text" class="form-control" data-type="str" value="'+val+'">'+
                '</div>'));
          break;
        case 'boolean':
          outerDiv.append(
              $('<div class="checkbox"><label>'+
                  '<input id="opt_'+i+'" type="checkbox" data-type="bool" '+(val?'checked':'')+'>'+i18n('options_'+i)+
                '</label></div>'));
          break;
        default:
          break;
      }
    }
    $('#prefModal .modal-body').append(outerDiv);

    var self = this;
    $('#prefModal').on('shown.bs.modal', function(e) {
      self.modalShown = true;
    });
    $('#prefModal').on('hidden.bs.modal', function(e) {
      for (var i in self.values) {
        var elem = $('#opt_'+i);
        var type = elem.attr('data-type');
        switch(type) {
          case 'num':
            self.values[i] = parseInt(elem.val());
            break;
          case 'str':
            self.values[i] = elem.val();
            break;
          case 'bool':
            self.values[i] = elem.prop('checked');
            break;
          default:
            break;
        }
      }
      self.setStorage(self.values);
      self.updatePrefToApp();
      self.modalShown = false;
    });
  },

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
