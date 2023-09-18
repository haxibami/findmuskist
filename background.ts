export {};

// When tab URL is updated, send message to content script
let prevUrl: string | null = null;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  const reservedPaths = [
    "home",
    "explore",
    "notifications",
    "messages",
    "i",
    "settings",
    "compose",
    "search",
  ];
  const regex = new RegExp(
    `^https:\/\/twitter.com\/(?!(${reservedPaths.join("|")})$)[a-zA-Z0-9_]+$`,
  );
  if (
    changeInfo.status === "complete" &&
    regex.test(tab.url) &&
    prevUrl !== tab.url
  ) {
    if (prevUrl) {
      chrome.tabs.sendMessage(tabId, {
        type: "tabUrlUpdated",
        url: tab.url,
      });
    }
    prevUrl = tab.url;
  }
});
