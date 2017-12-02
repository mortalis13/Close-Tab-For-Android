const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import('resource://gre/modules/Services.jsm');

var button,closeButton,closeAllButton,closeOtherButton;
var closeIcon = "chrome://close-tab/content/closeIcon.png";
var closeAllIcon = "chrome://close-tab/content/closeAllIcon.png";
var closeOtherIcon = "chrome://close-tab/content/closeOtherIcon.png";

var keepLastPref='extensions.close_tab.keep_last'

function loadIntoWindow(window) {
	closeAllButton = window.NativeWindow.pageactions.add({
		title: "Close All Tabs",
		icon: window.resolveGeckoURI(closeAllIcon),
		clickCallback: function() {
			closeAllTabs(window)
		}
	})
	closeOtherButton = window.NativeWindow.pageactions.add({
		title: "Close Other Tabs",
		icon: window.resolveGeckoURI(closeOtherIcon),
		clickCallback: function() {
			closeOtherTabs(window)
		}
	})
	closeButton = window.NativeWindow.pageactions.add({
		title: "Close Tab",
		icon: window.resolveGeckoURI(closeIcon),
		clickCallback: function() {
			closeTab(window)
		},
		longClickCallback: function() {
			closeAllTabs(window)
		}
	})	
}

function quitBrowser(window){
	window.BrowserApp.quit();
}

function closeAllTabs(window){
	window.BrowserApp.tabs.forEach(function(tab) {
		window.BrowserApp.closeTab(tab);
	})
}

function closeOtherTabs(window){
	window.BrowserApp.tabs.forEach(function(tab) {
		if(tab!==window.BrowserApp.selectedTab)
			window.BrowserApp.closeTab(tab)
	})
}

function closeTab(window){
	var tabs=window.BrowserApp.tabs
  var keepLast=Services.prefs.getBoolPref(keepLastPref)
  
	if(!keepLast && tabs.length==1)
		quitBrowser(window)
	else
		window.BrowserApp.closeTab(window.BrowserApp.selectedTab)
}

function unloadFromWindow(window) {
  if (!window) return;
  window.NativeWindow.pageactions.remove(closeButton);
  window.NativeWindow.pageactions.remove(closeAllButton);
  window.NativeWindow.pageactions.remove(closeOtherButton);
}

var windowListener = {
  onOpenWindow: function(aWindow) {
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("UIReady", function onLoad() {
      domWindow.removeEventListener("UIReady", onLoad, false);
      loadIntoWindow(domWindow);
    }, false);
  },
 
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(aData, aReason) {
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  if (aReason == APP_SHUTDOWN) return;
  Services.wm.removeListener(windowListener);
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}
