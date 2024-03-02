import type { PlasmoCSConfig } from "plasmo";
import { i18n } from "./i18n";
import injected from "url:~injected.ts";

export const config: PlasmoCSConfig = {
  matches: ["https://*.twitter.com/*", "https://*.x.com/*"],
  exclude_matches: ["https://*.twitter.com/i/tweetdeck/*"],
  all_frames: true,
  run_at: "document_start",
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "movedToProf") {
    const hovercardCss = document.getElementById("muskist-hovercard-css");
    if (hovercardCss) {
      hovercardCss.remove();
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

const interceptElem = document.createElement("script");
interceptElem.src = injected;
interceptElem.type = "module";
(document.head || document.documentElement).appendChild(interceptElem);
