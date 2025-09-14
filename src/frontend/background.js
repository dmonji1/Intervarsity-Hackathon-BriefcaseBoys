chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("Listener fired!");

  if (changeInfo.status === "complete" && tab.url) {

    // Inject extension frontend only on shopping sites
    if (
      tab.url.includes("amazon.com") ||
      tab.url.includes("ebay.com") ||
      tab.url.includes("cottonon.com")
    ) {
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
