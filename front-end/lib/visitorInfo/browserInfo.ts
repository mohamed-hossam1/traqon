export type Device = "desktop" | "laptop" | "mobile" | "tablet" | "unknown";

export type Browser =
  | "Chrome"
  | "Firefox"
  | "Safari"
  | "Edge"
  | "Opera"
  | "Brave"
  | "Unknown";

export type OperatingSystem =
  | "Windows"
  | "macOS"
  | "Linux"
  | "iOS"
  | "Android"
  | "ChromeOS"
  | "Unknown";

export type BrowserInfo = {
  device: Device;
  browser: Browser;
  os: OperatingSystem;
};

const UNKNOWN_INFO: BrowserInfo = {
  device: "unknown",
  browser: "Unknown",
  os: "Unknown",
};

export function getBrowserInfo(
  userAgent: string | null | undefined,
): BrowserInfo {
  if (!userAgent) {
    return UNKNOWN_INFO;
  }

  const ua = userAgent.toLowerCase();

  let browser: Browser = "Unknown";
  if (ua.includes("brave/") || ua.includes(" brave")) {
    browser = "Brave";
  } else if (ua.includes("edg/") || ua.includes("edge/")) {
    browser = "Edge";
  } else if (ua.includes("opr/") || ua.includes("opera")) {
    browser = "Opera";
  } else if (ua.includes("firefox/")) {
    browser = "Firefox";
  } else if (ua.includes("chrome/") || ua.includes("crios/")) {
    browser = "Chrome";
  } else if (ua.includes("safari/")) {
    browser = "Safari";
  }

  let os: OperatingSystem = "Unknown";
  if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("cros")) {
    os = "ChromeOS";
  } else if (ua.includes("mac os x") || ua.includes("macintosh")) {
    os = "macOS";
  } else if (
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ipod")
  ) {
    os = "iOS";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  let device: Device = "desktop";
  if (
    ua.includes("ipad") ||
    (ua.includes("tablet") && !ua.includes("mobile"))
  ) {
    device = "tablet";
  } else if (
    ua.includes("iphone") ||
    ua.includes("ipod") ||
    ua.includes("mobile") ||
    (ua.includes("android") && ua.includes("mobile"))
  ) {
    device = "mobile";
  } else if (os === "macOS") {
    device = "laptop";
  }

  return { device, browser, os };
}

export function getBrowserInformation(info: BrowserInfo): string {
  const { browser, os } = info;

  if (browser === "Unknown" && os === "Unknown") {
    return "Unknown device";
  }
  if (browser === "Unknown") {
    return os;
  }
  if (os === "Unknown") {
    return browser;
  }
  return `${browser} on ${os}`;
}
