import Script from "next/script";

const ALCHEMY_ANALYTICS_JS_URL =
  "https://static.alchemyapi.io/scripts/analytics/alchemy-analytics.js";

export const HeapAnalytics = () => (
  <Script
    id="heap-analytics"
    strategy="afterInteractive"
    src={ALCHEMY_ANALYTICS_JS_URL}
  />
);
