
export interface BrowserInfo {
  name: string;
  version: string;
  isChrome: boolean;
}

export const detectBrowser = (): BrowserInfo => {
  const ua = navigator.userAgent;
  let name = "Unknown";
  let version = "0";

  // Check for Chrome specifically, excluding Edge and Opera which are Chromium-based
  const isChrome = /Chrome/.test(ua) && !/Edg/.test(ua) && !/OPR/.test(ua);
  
  if (isChrome) {
    name = "Google Chrome";
    const match = ua.match(/Chrome\/(\d+)/);
    version = match ? match[1] : "Unknown";
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    name = "Safari";
  } else if (/Firefox/.test(ua)) {
    name = "Firefox";
  } else if (/Edg/.test(ua)) {
    name = "Microsoft Edge";
  } else if (/OPR/.test(ua)) {
    name = "Opera";
  }

  return { name, version, isChrome };
};
