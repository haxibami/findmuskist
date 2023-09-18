import type { PlasmoCSConfig } from "plasmo";
import injected from "url:~injected.ts";

export const config: PlasmoCSConfig = {
  all_frames: true,
  run_at: "document_start",
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "tabUrlUpdated") {
    let budgeEl = document.getElementById("muskist-budge");
    if (budgeEl) {
      budgeEl.remove();
    }
  }
});

let injectedElem = document.createElement("script");
injectedElem.src = injected;
injectedElem.type = "module";
(document.head || document.documentElement).appendChild(injectedElem);
