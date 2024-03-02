import { isTopPath, isMovingToProf } from "./constant";

let prevProfUrl: string | null = null;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isMovingToProf.test(tab.url)) {
    if (prevProfUrl !== tab.url) {
      if (prevProfUrl) {
        const lastVisitedUserName = prevProfUrl.split("/")[3];
        const currentUserName = tab.url.split("/")[3];
        if (
          lastVisitedUserName !== currentUserName ||
          isTopPath.test(tab.url)
        ) {
          chrome.tabs.sendMessage(tabId, {
            type: "movedToProf",
            url: tab.url,
          });
        }
      } else {
        if (isTopPath.test(tab.url)) {
          chrome.tabs.sendMessage(tabId, {
            type: "movedToProfile",
            url: tab.url,
          });
        }
      }
      prevProfUrl = tab.url;
    }
  }
});

chrome.cookies.onChanged.addListener(async (changeInfo) => {
  if (
    changeInfo.cookie.domain === "twitter.com" &&
    changeInfo.cookie.name === "lang"
  ) {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    await chrome.tabs.sendMessage(tabs[0].id, {
      type: "langSet",
      lang: changeInfo.cookie.value,
    });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isMovingToProf.test(tab.url)) {
    const cookie = await chrome.cookies.get({
      url: "https://twitter.com",
      name: "lang",
    });

    if (cookie) {
      await chrome.tabs.sendMessage(tabId, {
        type: "langSet",
        lang: cookie.value,
      });
    }
  }
});
