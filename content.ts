import type { PlasmoCSConfig } from "plasmo";
import { i18n } from "./i18n";
import injected from "url:~injected.ts";

import type { Lang } from "./i18n";

export const config: PlasmoCSConfig = {
  all_frames: true,
  run_at: "document_start",
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "movedToProf") {
    let budgeEl = document.getElementById("muskist-budge");
    if (budgeEl) {
      budgeEl.remove();
    }
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "langSet") {
    const lang = message.lang in i18n ? message.lang : "en";
    document.documentElement.style.setProperty(
      "--verified-hover-title",
      `" ${i18n[lang].verifiedHoverTitle} " `,
    );
    document.documentElement.style.setProperty(
      "--verified-hover-text",
      `" ${i18n[lang].verifiedHoverText} "`,
    );
  }
});

let interceptElem = document.createElement("script");
interceptElem.src = injected;
interceptElem.type = "module";
(document.head || document.documentElement).appendChild(interceptElem);
