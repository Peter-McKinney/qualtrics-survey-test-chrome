const SURVEY_INPUT_ID = "survey-id-input";
const LAUNCH_SURVEY_BUTTON_ID = "launch-survey-button";
const CLEAR_ALL_BUTTON_ID = "clear-all-and-launch";

function getInterceptedSurveyId(): string {
  const interceptSurveyId = (
    document.getElementById(SURVEY_INPUT_ID) as HTMLInputElement
  )?.value;

  return interceptSurveyId;
}

function getFullCookieName(name: string): string {
  return `QSI_${name}_intercept`;
}

async function getInterceptCookies(): Promise<string[]> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab.id) return [];

  const url = tab.url;
  if (!url) return [];

  const cookies = await chrome.cookies.getAll({ url });
  console.log(cookies, "all cookies");

  return cookies
    .filter((cookie) => {
      return cookie.name.startsWith("QSI") && cookie.name.endsWith("intercept");
    })
    .map((cookie) => cookie.name.replace(/^QSI_(.+)_intercept$/, "$1"));
}

async function attachExistingCookiesToDom(): Promise<void> {
  const cookies = await getInterceptCookies();
  console.log(cookies, "cookies");
  const domList = document.getElementById("cookie-list") as HTMLDivElement;

  domList.innerHTML = "";

  for (const cookie of cookies) {
    const domCookie = document.createElement("div");
    domCookie.textContent = cookie;

    domList?.appendChild(domCookie);
    console.log("appended!!");
  }

  console.log(domList, "domList");
}

document.addEventListener("DOMContentLoaded", () => {
  void attachExistingCookiesToDom();
});

document
  .getElementById(LAUNCH_SURVEY_BUTTON_ID)
  ?.addEventListener("click", async () => {
    const tab = await getTabInfo();

    const interceptSurveyId = getInterceptedSurveyId();
    const cookieName = getFullCookieName(interceptSurveyId);

    if (tab?.url) {
      await removeCookie(cookieName, tab?.url);
      await attachExistingCookiesToDom();
      reloadAndRunQSI();
    }
  });

document
  .getElementById(CLEAR_ALL_BUTTON_ID)
  ?.addEventListener("click", async () => {
    const tab = await getTabInfo();

    if (tab?.url) {
      const cookies = await getInterceptCookies();
      await clearCookieList(cookies, tab.url);
      attachExistingCookiesToDom();
      reloadAndRunQSI();
    }
  });

async function getTabInfo(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab;
}

async function clearCookieList(cookies: string[], url: string): Promise<void> {
  for (const cookie of cookies) {
    const cookieName = getFullCookieName(cookie);
    await removeCookie(cookieName, url);
  }
}

async function removeCookie(cookie: string, url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    chrome.cookies.remove(
      {
        url: url,
        name: cookie,
      },
      (details) => {
        if (!details) {
          reject();
        } else {
          resolve();
        }
      },
    );
  });
}

function reloadAndRunQSI(): void {
  chrome.runtime.sendMessage(
    {
      type: "RELOAD_AND_RUN_QSI",
    },
    (_response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError);
      }
    },
  );
}
