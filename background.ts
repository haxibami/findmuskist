export {};

// When tab URL is updated, send message to content script
let lastVisitedProf: string | null = null;

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
  const userTopPaths = ["with_replies", "media", "highlights", "likes"];
  const regex = new RegExp(
    `^https:\/\/twitter.com\/(?!(${reservedPaths.join(
      "|",
    )})$)([a-zA-Z0-9_]+)(\/(${userTopPaths.join("|")}))?$`,
  );

  if (
    changeInfo.status === "complete" &&
    regex.test(tab.url) &&
    lastVisitedProf !== tab.url
  ) {
    if (lastVisitedProf) {
      const lastVisitedProfName = lastVisitedProf.split("/")[3];
      const currentProfName = tab.url.split("/")[3];
      if (lastVisitedProfName !== currentProfName) {
        chrome.tabs.sendMessage(tabId, {
          type: "movedToProfile",
          url: tab.url,
        });
      }
    }
    lastVisitedProf = tab.url;
  }
});
