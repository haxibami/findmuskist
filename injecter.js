var s = document.createElement("script");
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL("injected.js");
s.type = "module";
(document.head || document.documentElement).appendChild(s);
