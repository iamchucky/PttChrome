function PttChromePref(app, onInitializedCallback) {
  this.values = {};
  this.logins = ['',''];
  this.app = app;
  this.modalShown = false;
  this.shouldResetToDefault = false;

  this.reloadPreference(onInitializedCallback);
}

PttChromePref.prototype = {

  updatePreferencesToUi: function() {
    var self = this;
    for (var i in PREFS_CATEGORIES) {
      var cat = PREFS_CATEGORIES[i];
      $('#opt_'+cat).text(i18n('options_'+cat));
    }
    for (var i in this.values) {
      $('#opt_'+i).empty();
      var val = this.values[i];
      
      // for the color selection box
      if (i === 'mouseBrowsingHighlightColor') {
        var qName = '#opt_'+i;
        var htmlStr = '<select class="form-control">';
        for (var n = 1; n < 16; ++n) {
          htmlStr += '<option value="'+n+'" class="q'+n+'b'+n+'"></option>';
        }
        htmlStr += '</select>';
        $(qName).html(htmlStr);
        $(qName+' select').val(val);
        var bg = $(qName+' .q'+val+'b'+val).css('background-color');
        $(qName+' select').css('background-color', bg);
        $(qName+' select').on('change', function(e) {
          var val = $(qName+' select').val();
          var bg = $(qName+' .q'+val+'b'+val).css('background-color');
          $(qName+' select').css('background-color', bg);
        });
        continue;
      }

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
    // autologin
    $('#login_username').html(
      '<label style="font-weight:normal;">'+i18n('autologin_username')+'</label>'+
      '<input type="text" class="form-control" value="'+this.logins[0]+'">');
    $('#login_password').html(
      '<label style="font-weight:normal;">'+i18n('autologin_password')+'</label>'+
      '<input type="password" class="form-control" value="'+this.logins[1]+'">');
    $('#opt_autologin').html(i18n('options_autologin')+'  <small style="color:red;">'+i18n('autologin_warning')+'</small>');
  },

  populatePreferencesToUi: function() {
    var self = this;
    $('#opt_reset').off();
    $('#opt_reset').text(i18n('options_reset'));
    $('#opt_reset').click(function() {
      $('#prefModal').modal('hide');
      self.shouldResetToDefault = true;
    });

    this.updatePreferencesToUi();

    $('#prefModal').off();
    $('#prefModal').on('shown.bs.modal', function(e) {
      self.modalShown = true;
    });
    $('#prefModal').on('hidden.bs.modal', function(e) {
      if (self.shouldResetToDefault) {
        self.clearStorage();
        self.values = JSON.parse(JSON.stringify(DEFAULT_PREFS));
        self.logins = ['',''];
        self.updatePreferencesToUi();
        self.shouldResetToDefault = false;
      } else {
        for (var i in self.values) {
          if (i === 'mouseBrowsingHighlightColor') {
            var selectedVal = $('#opt_'+i+' select').val();
            self.values[i] = parseInt(selectedVal);
            continue;
          }

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
        var user = $('#login_username input').val();
        var pswd = $('#login_password input').val();
        if (user === '') {
          pswd = '';
        }
        self.logins = [user, pswd];
      }
      self.setStorage(self.values);
      self.setLoginStorage({'u':self.logins[0], 'p':self.logins[1]});
      self.updateToApp();
      self.modalShown = false;
      self.app.setInputAreaFocus();
    });
  },

  reloadPreference: function(callback) {
    var self = this;
    this.getStorage(null, function(items) {
      var itemsEmpty = (Object.keys(items).length === 0);
      if (itemsEmpty) {
        items = JSON.parse(JSON.stringify(DEFAULT_PREFS));
        console.log('pref: first time, load default to sync storage');
        self.setStorage(items);
      }
      // iterate through default prefs to make sure all up to date
      for (var i in DEFAULT_PREFS) {
        if (!(i in items)) {
          self.values[i] = DEFAULT_PREFS[i];
        } else {
          self.values[i] = items[i];
        }
      }
      self.getLoginStorage(null, function(items) {
        var itemsEmpty = (Object.keys(items).length === 0);
        if (itemsEmpty) {
          items = {'u':'','p':''};
          self.setLoginStorage(items);
        }
        self.logins = [items['u'], items['p']];
        self.updateToApp();
        self.populatePreferencesToUi();
        callback();
      });
    });
  },

  updateToApp: function() {
    for (var i in this.values) {
      this.app.onPrefChange(this, i);
    }
    if (this.logins[0]) {
      this.app.telnetCore.loginStr[1] = this.logins[0];
    }
    if (this.logins[1]) {
      this.app.telnetCore.loginStr[2] = this.logins[1];
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

  getLoginStorage: function(key, callback) {
    chrome.storage.local.get(key,callback);
  },

  getStorage: function(key, callback) {
    chrome.storage.sync.get(key, callback);
  },

  setLoginStorage: function(items) {
    chrome.storage.local.set(items, function() {
    });
  },

  setStorage: function(items) {
    chrome.storage.sync.set(items, function() {
      console.log('preference saved');
    });
  },

  clearStorage: function() {
    chrome.storage.local.clear(function() {
      var err = chrome.runtime.lastError;
      if (err)
        console.log(err);
    });
    chrome.storage.sync.clear(function() {
      var err = chrome.runtime.lastError;
      if (err)
        console.log(err);
    });
  }

}
