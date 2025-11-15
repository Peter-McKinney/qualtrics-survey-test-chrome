type ReloadAndRunQSIMessage = {
  type: "RELOAD_AND_RUN_QSI";
};

chrome.runtime.onMessage.addListener(
  (message: ReloadAndRunQSIMessage, sender, sendResponse): boolean | void => {
    if (message.type !== "RELOAD_AND_RUN_QSI") return;

    reloadActiveTabAndRunQSI().then((value) => {
      sendResponse({ success: value });
    });

    return true;
  },
);

async function reloadActiveTabAndRunQSI() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  const tabId = tab.id;

  const onUpdated = (
    updatedTabId: number,
    updatedInfo: chrome.tabs.OnUpdatedInfo,
  ) => {
    if (updatedTabId === tabId && updatedInfo.status === "complete") {
      chrome.tabs.onUpdated.removeListener(onUpdated);

      chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: () => {
          let attempts = 0;
          const maxAttempts = 50;
          const intervalId = setInterval(() => {
            console.log("Checking for window.QSI.API.run()...");
            if (typeof window?.QSI?.API?.run === "function") {
              window.QSI.API.run();
              clearInterval(intervalId);
            }

            if (attempts >= maxAttempts) {
              clearInterval(intervalId);
              console.warn("window.QSI.API.run() was not found after reload.");
            }
            attempts++;
          }, 200);
        },
      });
    }
  };

  chrome.tabs.onUpdated.addListener(onUpdated);

  chrome.tabs.reload(tabId);
}
