declare global {
  interface Window {
    resetInterceptSurvey: (interceptSurveyId: string) => void;
  }
}

export {};
