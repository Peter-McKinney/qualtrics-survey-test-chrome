declare global {
  interface Window {
    QSI: {
      API: {
        run: () => void;
      };
    };
  }
}

export {};
