import Script from "next/script";
import type { FC } from "react";

const GA_ID = "G-06P8E9XPPY";

const GoogleAnalytics: FC = () => (
  <Script
    id="google-analytics"
    dangerouslySetInnerHTML={{
      __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_ID}');`,
    }}
  />
);

export default GoogleAnalytics;
