function SymbolInput() {
  //var _bundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://bbsfox/locale/symbolinput.properties")
  this.CmdHandler = document.getElementById('cmdHandler');
  this.core = null;
  this.pageSelect = null;
  this.mainDiv = null;
  this.init = false;
  
  this.btns = [];
  this.symbles = [];

  this.symbolPageCount = 1;//12;
  //for(var i=0;i<this.symbolPageCount;++i)
  //  this.symbles[i] = _bundle.GetStringFromName('PAGE'+i).split(",");
  
  this.mouse_click ={
        view: this,
        handleEvent: function(e) {
            e.stopPropagation();
        }
  };
  
  this.mouse_down ={
        view: this,
        handleEvent: function(e) {
            e.preventDefault();
            e.stopPropagation();
        }
  };
  
  this.mouse_up ={
        view: this,
        handleEvent: function(e) {
            e.stopPropagation();
        }
  };
  
  this.mouse_move ={
        view: this,
        handleEvent: function(e) {
            //this.view.core.clearHighlight();
            //this.view.core.resetMouseCursor();  
            e.stopPropagation();
        }
  };

  this.btnSym_click ={
        view: this,
        handleEvent: function(e) {
            this.view.core.symbtnclick(e);
        }
  };
  
  this.btnClose_click ={
        view: this,
        handleEvent: function(e) {
            this.view.closeWindow();
        }
  };
  
    this.offX = 0;
    this.offY = 0;
    this.tempCurX = 0;
    this.tempCurY = 0;
    this.dragingWindow = null;
    this.symInputBoxAlpha = 85;
}
SymbolInput.prototype={   

  selectitem: function(event) {
    var pageindex = this.pageSelect.selectedIndex;
    for(var i=0;i<this.btns.length;++i)
    {
      if(i < this.symbles[pageindex].length)
      {
          this.btns[i].label = this.symbles[pageindex][i];
          this.btns[i].hidden = false;
      }
      else
        this.btns[i].hidden = true;
    }
  },

  mousedown: function(event) {
      if(  event.target.className.indexOf("closeSI") >= 0
        || event.target.className.indexOf("WinBtn") >= 0
        || event.target.className.indexOf("sBtn") >= 0
        || event.target.tagName.indexOf("menuitem") >= 0)
       return;
    this.offX = event.pageX;
    this.offY = event.pageY;
    if(event.button==0) //left button
    {  
        
      if(event.target.className.indexOf("buttonDiv") >= 0 
      || event.target.className.indexOf("drag") >= 0 
      || event.target.className.indexOf("nonspan") >= 0 )
      {
        this.tempCurX = parseFloat(this.mainDiv.style.left);
        this.tempCurY = parseFloat(this.mainDiv.style.top);
        this.CmdHandler.setAttribute("DragingWindow", '3');
        this.dragingWindow = this;
      }
      event.preventDefault();
      return;
    }
  },
    
  mouseup: function(event) {
    this.CmdHandler.setAttribute("DragingWindow",'0');
    this.dragingWindow = null;
  },
  
  setCore: function(core)
  {
    this.core=core;
  },
    
  createPageDiv: function(divParent, divClass, divVisible)
  {
    var newDiv = document.createElementNS(XUL_NS, 'div');
    divParent.appendChild(newDiv);
    newDiv.setAttribute('class',divClass);
    //newDiv.addEventListener('mouseup', this.mouse_up, false);
    //newDiv.addEventListener('mousemove', this.mouse_move, false);
    //newDiv.addEventListener('mousedown', this.mouse_down, false);
    //if(!divVisible)
    //{
      //newDiv.style.display='block';
      //newDiv.style.display='none';
    //  newDiv.hidden = true;
    //}
    //else
      newDiv.hidden = false;
      //newDiv.style.display='block';
    return newDiv
  },

  createVbox: function(boxParent)
  {
    /*  
    var newVbox = document.createElementNS(XUL_NS, 'vbox');
    boxParent.appendChild(newVbox);
    return newVbox;
	*/
	return null;
  },

  createHbox: function(boxParent)
  {
    /*
    var newHbox = document.createElementNS(XUL_NS, 'hbox');
    boxParent.appendChild(newHbox);
    return newHbox;
	*/
	return null;
  },
    
  createBtn: function(btnParent, str)
  {
    /*
    var newBtn = document.createElementNS(XUL_NS, 'button');
    btnParent.appendChild(newBtn);
    newBtn.addEventListener('click', this.btnSym_click, false);
    //newBtn.addEventListener('mouseup', this.mouse_up, false);
    //newBtn.addEventListener('mousemove', this.mouse_move, false);
    newBtn.setAttribute('class','sBtn');
    newBtn.label = str;
    newBtn.width = '10px';
    //newBtn.style.display = 'inline';
    //newBtn.setAttribute('value',str);
    //newBtn.onclick = function(){
    //  bbsfox.playerMgr.copyEmbededPlayerUrl(this);
    //};
    //newBtn.innerHTML = str;
    return newBtn;
	*/
	return null;
  },

  setWindowAlpha: function(alpha)
  {
    this.symInputBoxAlpha = alpha;
    if(this.mainDiv)
    {
      if(this.symInputBoxAlpha == 0)// no alpha
        this.mainDiv.style.opacity = '1';
      else
        this.mainDiv.style.opacity = '0.' + (100-this.symInputBoxAlpha);
    }
  },
  
  displayWindow: function()
  {
    if(!this.init)
    {
      this.initWindow();
      this.init = true;
    }
    this.mainDiv.style.display = 'block';
	alert('test');
    //this.CmdHandler.setAttribute("ScreenKeyboardOpened", '1');
  },

  closeWindow: function()
  {
    this.mainDiv.style.display = 'none';
    //this.CmdHandler.setAttribute("ScreenKeyboardOpened", '0');
  },

  switchWindow: function()
  {
    if(this.mainDiv==null || this.mainDiv.style.display == 'none')
      this.displayWindow();
    else
      this.closeWindow();
  },
    
  initWindow: function()
  {
      var BBSWin = document.getElementById('BBSWindow');
      var mainDiv = document.createElement('div');
	  if(BBSWin==null)
	    alert('BBSWin==null');
	  if(mainDiv==null)
	    alert('mainDiv==null');
		
      BBSWin.appendChild(mainDiv);
      //playerDiv.setAttribute('align','left');
      //mainDiv.setAttribute('class','drag');
      mainDiv.style.zindex='3';
      mainDiv.style.left = '10px';
      mainDiv.style.top = '10px';
      mainDiv.style.width = '200px';
      mainDiv.style.height = '100px';	  
      mainDiv.style.backgroundColor = '#bbbbff';
      mainDiv.style.padding = '3px';
      //mainDiv.style.opacity = '0.85';
      //if(this.symInputBoxAlpha == 0)// no alpha
      //  mainDiv.style.opacity = '1';
      //else
      //  mainDiv.style.opacity = '0.' + (100-this.symInputBoxAlpha);
      mainDiv.style.border = '0px double #cccccc';
      mainDiv.style.borderRadius = '8px'; //there have some bug in firefox, set this style, div become low z-index then flash embedded	  
      mainDiv.style.cursor = 'default';
      mainDiv.style.display = 'block';
      this.mainDiv = mainDiv;
      var mouse_down ={
          view: this,
          handleEvent: function(e) {
              this.view.mousedown(e);
          }
      };
      mainDiv.addEventListener('mousedown', mouse_down, false);
      var mouse_up ={
          view: this,
          handleEvent: function(e) {
              this.view.mouseup(e);
          }
      };
      mainDiv.addEventListener('mouseup', mouse_up, false);
	  alert('2');

      /*
      var box1 = document.createElementNS(XUL_NS, 'vbox');
      mainDiv.appendChild(box1);

      var box2 = document.createElementNS(XUL_NS, 'hbox');
      box1.appendChild(box2);
      box2.setAttribute('class','nonspan');
    
      var spacer1 = document.createElementNS(XUL_NS, 'spacer');
      box2.appendChild(spacer1);
      spacer1.setAttribute('flex','1');
      spacer1.setAttribute('class','nonspan');
    
      var closeBtn = document.createElementNS(XUL_NS, 'image');
      box2.appendChild(closeBtn);
      closeBtn.setAttribute('src','chrome://bbsfox/skin/window_icon/close.png');
      closeBtn.setAttribute('width','14px');
      closeBtn.setAttribute('height','14px');
      closeBtn.setAttribute('class','closeSI');
      closeBtn.onmouseover = function(e){this.src="chrome://bbsfox/skin/window_icon/close-h.png";e.preventDefault();};
      closeBtn.onmouseout = function(e){this.src="chrome://bbsfox/skin/window_icon/close.png";e.preventDefault();};
      closeBtn.onmousedown = function(e){this.src="chrome://bbsfox/skin/window_icon/close-a.png";e.preventDefault();};
      closeBtn.addEventListener('click', this.btnClose_click, false);

      var box3 = document.createElementNS(XUL_NS, 'hbox');
      box1.appendChild(box3);
      box3.setAttribute('class','nonspan');
    
      var pageSelect = document.createElementNS(XUL_NS, 'menulist');
      box3.appendChild(pageSelect);
      pageSelect.style.fontSize='12px';
      pageSelect.setAttribute('editable','false');
      pageSelect.setAttribute('class','WinBtn');
      pageSelect.setAttribute('id','sympageselect');
      pageSelect.setAttribute('sizetopopup','always');

      for(var i=0;i<this.symbolPageCount;++i)
      {
        var str = this.core.getLM('symbolList'+i);
        pageSelect.appendItem(str, i);
      }
      pageSelect.selectedIndex = 0;
      this.pageSelect = pageSelect;
      var selectitem ={view: this, handleEvent: function(e) {this.view.selectitem(e);}};
      pageSelect.addEventListener('command', selectitem, false);

      var clientDiv = document.createElementNS(XUL_NS, 'div');
      box1.appendChild(clientDiv);
      
      this.buttonDiv = this.createPageDiv(clientDiv, 'buttonDiv', true);
      var vbox = this.createVbox(this.buttonDiv);
      var hbox;
      for(var i=0;i<71;++i)
      {
        if(i%10==0)
        {
          hbox = this.createHbox(vbox);
          hbox.setAttribute('class','nonspan');
        }
        var newbtn = this.createBtn(hbox);
        this.btns.push(newbtn);
        if(i<this.symbles[0].length)
          newbtn.label = this.symbles[0][i];
        else
        {
          newbtn.label = '';
          newbtn.hidden = true;
        }
      }
	  */
  }
}

document.addEventListener('DOMContentLoaded', function () { 
alert('1');  
  var symbolinput = new SymbolInput();
  //symbolinput.setCore(this);
  symbolinput.displayWindow();
});
