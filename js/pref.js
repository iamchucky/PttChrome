function PttChromePref(app, onInitializedCallback) {
  this.values = null;
  this.logins = null;
  this.app = app;
  this.modalShown = false;
  this.shouldResetToDefault = false;

  //this.loadDefault(onInitializedCallback);
  this.onInitializedCallback = onInitializedCallback;
  this.initCallbackCalled = false;
}

PttChromePref.prototype = {

  updateSettingsToUi: function() {
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
    // autologin
    $('#login_username').html(
      '<label style="font-weight:normal;">'+i18n('autologin_username')+'</label>'+
      '<input type="text" class="form-control" value="'+this.logins[0]+'">');
    $('#login_password').html(
      '<label style="font-weight:normal;">'+i18n('autologin_password')+'</label>'+
      '<input type="password" class="form-control" value="'+this.logins[1]+'">');
    $('#opt_autologin').html(i18n('options_autologin')+'  <small style="color:red;">'+i18n('autologin_warning')+'</small>');
  },

  populateSettingsToUi: function() {
    var self = this;
    $('#opt_reset').off();
    $('#opt_reset').text(i18n('options_reset'));
    $('#opt_reset').click(function() {
      $('#prefModal').modal('hide');
      self.shouldResetToDefault = true;
    });

    this.updateSettingsToUi();

    $('#prefModal').off();
    $('#prefModal').on('shown.bs.modal', function(e) {
      self.modalShown = true;
    });
    $('#prefModal').on('hidden.bs.modal', function(e) {
      if (self.shouldResetToDefault) {
        self.clearStorage();
        self.values = JSON.parse(JSON.stringify(DEFAULT_PREFS));
        self.logins = ['',''];
        self.updateSettingsToUi();
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
        var user = $('#login_username input').val();
        var pswd = $('#login_password input').val();
        if (user === '') {
          pswd = '';
        }
        self.logins = [user, pswd];
      }
      var data = {
        values: self.values,
        logins: {'ptt.cc': {'u':self.logins[0], 'p':self.logins[1]}}
      };
      self.setStorage(data);
      self.updateToApp();
      self.modalShown = false;
      self.app.setInputAreaFocus();
    });
  },

  loadDefault: function(callback) {
    this.values = JSON.parse(JSON.stringify(DEFAULT_PREFS));
    this.logins = {'u':'', 'p':''};
    this.updateToApp();
    this.populateSettingsToUi();
    callback();
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

  resetSettings: function() {
    this.clearStorage();
    this.getStorage();
  },

  get: function(prefName) {
    console.log(prefName + " = " + this.values[prefName]);
    return this.values[prefName];
  },

  set: function(prefName, value) {
    this.values[prefName] = value;
  },

  onStorageDone: function(msg) {
    if (msg.data && msg.data.values) {
      this.values = JSON.parse(JSON.stringify(msg.data.values));
    }
    if (msg.data && msg.data.logins) {
      var data = msg.data.logins;
      this.logins = [data['ptt.cc']['u'], data['ptt.cc']['p']];
    }
    this.updateToApp();
    this.populateSettingsToUi();
    if (!this.initCallbackCalled) {
      if (this.values != null && this.logins != null) {
        this.initCallbackCalled = true;
        this.onInitializedCallback(this.app);
      }
    }
  },

  getStorage: function(key) {
    if (this.app.appConn.isConnected) {
      this.app.appConn.appPort.postMessage({ action: 'storage', type: 'get' });
    }
  },

  setStorage: function(items) {
    if (this.app.appConn.isConnected) {
      this.app.appConn.appPort.postMessage({ action: 'storage', type: 'set', data: items });
    }
  },

  clearStorage: function() {
    if (this.app.appConn.isConnected) {
      this.app.appConn.appPort.postMessage({ action: 'storage', type: 'clear' });
    }
  }

}
