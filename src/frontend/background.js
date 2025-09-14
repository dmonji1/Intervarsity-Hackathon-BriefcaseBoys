chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.status === "complete" && tab.url) {

    // Example: log when visiting any "buy" page
    if (tab.url.includes("/buy")) {
      console.log("Injecting Impulse extension into:", tab.url);

      // Inject JavaScript logic (survey, mini-games, cooldown)
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["src/frontend/content.js"]
      });

      // Inject CSS for overlays
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["src/frontend/styles.css"]
      });
    }
  }
});

