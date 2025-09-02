"use client";

import Script from "next/script";
import type { FC } from "react";

const HEAP_APP_ID = process.env.NEXT_PUBLIC_HEAP_APP_ID;

export const ALCHEMY_ANALYTICS_JS_URL =
  "https://static.alchemyapi.io/scripts/anayltics/alchemy-analytics.js";

export const HeapAnalytics: FC = () => {
  if (!HEAP_APP_ID) {
    console.log("Heap App ID is not set.");
    return null;
  }
  return (
    <Script
      id="heap-analytics"
      dangerouslySetInnerHTML={{
        __html: `window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])}; heap.load("${HEAP_APP_ID}");`,
      }}
    />
  );
};
