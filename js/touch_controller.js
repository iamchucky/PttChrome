pttchrome.TouchController = function(app) {
  this.app = app;
  this.highlightCopy = false;
  this.touchStarted = false;
  this.touchedCenter = { x: 0, y: 0 };

  // make sure the text selection still works
  delete Hammer.defaults.cssProps.userSelect;

  this.ham = null;
  this.setupHandlers();
};

pttchrome.TouchController.prototype.setupHandlers = function() {
  var self = this;
  var app = this.app;

  document.body.ontouchmove = function(e) { 
    if (e.touches.length != 1) return false;
    return true;
  };

  document.body.ontouchstart = function(e) {
    self.touchStarted = true;
    app.inputArea.blur();
    console.log('touchstart');
  };

  document.body.ontouchend = function(e) {
    if (app.buf.pageState == 2 && app.buf.highlightCursor &&
        app.buf.nowHighlight != -1) {
      app.onMouse_click(self.touchedCenter.x, self.touchedCenter.y);
      app.buf.nowHighlight = -1;
      app.buf.highlightCursor = self.highlightCopy;
      app.BBSWin.style.cursor = 'auto';
      self.touchStarted = false;
      app.inputArea.focus();
    }
    console.log('touchend');
  };

  this.ham = new Hammer(app.BBSWin);
  this.ham.on('pan', function(ev) {
    if (ev.pointerType == 'touch') {
      //console.log(ev);
      if (app.buf.pageState == 2) {
        ev.preventDefault();
        ev.srcEvent.preventDefault();

        self.highlightCopy = app.buf.highlightCursor;
        app.buf.highlightCursor = true;
        app.onMouse_move(ev.center.x, ev.center.y);
        self.touchedCenter.x = ev.center.x;
        self.touchedCenter.y = ev.center.y;
      }
    }
  });

  this.ham.on('tap', function(ev) {
    //console.log(ev);
    ev.preventDefault();
    ev.srcEvent.stopPropagation();
    ev.srcEvent.preventDefault();
    if (ev.pointerType != 'touch')  return; 
    self.highlightCopy = app.buf.highlightCursor;
    app.buf.highlightCursor = false;
    app.onMouse_move(ev.center.x, ev.center.y);
    app.onMouse_click(ev.center.x, ev.center.y);
    app.buf.nowHighlight = -1;
    app.buf.highlightCursor = self.highlightCopy;
    app.BBSWin.style.cursor = 'auto';
    self.touchStarted = false;
    app.inputArea.focus();
    console.log('touchtap');
  });
};
