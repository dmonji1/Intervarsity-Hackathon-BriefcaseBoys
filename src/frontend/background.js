chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("Listener fired!")
    if (changeInfo.status === "complete" &&
        tab.url &&
        tab.url.includes("/buy")
    ) {
        console.log("URL:", tab.url);
    }
});