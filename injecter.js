var s = document.createElement("script");
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL("injected.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
