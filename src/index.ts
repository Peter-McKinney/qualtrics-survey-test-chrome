const SURVEY_INPUT_ID = "survey-id-input";
const LAUNCH_SURVEY_BUTTON_ID = "launch-survey-button";

function getInterceptedSurveyId(): string {
  const interceptSurveyId = (
    document.getElementById(SURVEY_INPUT_ID) as HTMLInputElement
  )?.value;

  return interceptSurveyId;
}

document
  .getElementById(LAUNCH_SURVEY_BUTTON_ID)
  ?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab.id) return;

    const url = tab.url;
    if (!url) return;

    const interceptSurveyId = getInterceptedSurveyId();
    const cookieName = `QSI_${interceptSurveyId}_intercept`;

    chrome.cookies.remove(
      {
        url: url,
        name: cookieName,
      },
      (_details) => {
        chrome.runtime.sendMessage(
          {
            type: "RELOAD_AND_RUN_QSI",
          },
          (_response) => {
            if (chrome.runtime.lastError) {
              console.error("Runtime error:", chrome.runtime.lastError);
              return;
            }
          },
        );
      },
    );
  });
