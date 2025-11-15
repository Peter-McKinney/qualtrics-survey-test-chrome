type ReloadAndRunQSIMessage = {
  type: "RELOAD_AND_RUN_QSI";
};

chrome.runtime.onMessage.addListener(
  (message: ReloadAndRunQSIMessage, _sender, sendResponse): boolean | void => {
    if (message.type !== "RELOAD_AND_RUN_QSI") return;

    reloadActiveTabAndRunQSI().then((value) => {
      sendResponse({ success: value });
    });
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
          if (typeof window?.QSI?.API?.run === "function") {
            window.QSI.API.run();
          } else {
            console.warn("window.QSI.API.run() is not defined");
          }
        },
      });
    }
  };

  chrome.tabs.onUpdated.addListener(onUpdated);

  chrome.tabs.reload(tabId);
}
