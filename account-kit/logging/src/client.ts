import { v4 as uuid } from "uuid";
import { WRITE_IN_DEV } from "./_writeKey.js";
import { noopLogger } from "./noop.js";
import type { EventsSchema, InnerLogger, LoggerContext } from "./types";
import { isClientDevMode } from "./utils.js";
import { fetchRemoteProjectId } from "./fetchRemoteProjectId.js";

const ANON_ID_STORAGE_KEY = "account-kit:anonId";

type AnonId = { id: string; expiresMs: number };

function getOrCreateAnonId(): AnonId {
  let anon: AnonId | null = JSON.parse(
    localStorage.getItem(ANON_ID_STORAGE_KEY) ?? "null",
  );

  if (!anon || anon.expiresMs < Date.now()) {
    anon = {
      id: uuid(),
      // expires a month from now (30days * 24hrs/day * 60min/hr * 60sec/min * 1000ms/sec)
      expiresMs: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(ANON_ID_STORAGE_KEY, JSON.stringify(anon));
  }

  return anon;
}

function loadHeap(projectId: string): Promise<void> {
  if (!window.heap) {
    // Use `"https://static.alchemyapi.io/scripts/anayltics/heap-analytics-script.js"`, but it's an old
    const scriptSrc = `
    // Load Heap Analytics
    window.heapReadyCb=window.heapReadyCb||[],window.heap=window.heap||[],heap.load=function(e,t){window.heap.envId=e,window.heap.clientConfig=t=t||{},window.heap.clientConfig.shouldFetchServerConfig=!1;var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src="https://cdn.us.heap-api.com/config/"+e+"/heap_config.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(a,r);var n=["init","startTracking","stopTracking","track","resetIdentity","identify","getSessionId","getUserId","getIdentity","addUserProperties","addEventProperties","removeEventProperty","clearEventProperties","addAccountProperties","addAdapter","addTransformer","addTransformerFn","onReady","addPageviewProperties","removePageviewProperty","clearPageviewProperties","trackPageview"],i=function(e){return function(){var t=Array.prototype.slice.call(arguments,0);window.heapReadyCb.push({name:e,fn:function(){heap[e]&&heap[e].apply(heap,t)}})}};for(var p=0;p<n.length;p++)heap[n[p]]=i(n[p])};
    heap.load('${projectId}', { trackingServer: "https://heapdata.alchemy.com", disableTextCapture: true, disableInteractionTextCapture: true, eventPropertiesStorage: 'localstorage', metadataStorage: 'localstorage', disableInteractionEvents: ['click', 'submit', 'change'], disablePageviewAutocapture: true });
  `;
    const script = document.createElement("script");
    script.innerHTML = scriptSrc;
    document.head.appendChild(script);
  }

  return new Promise((resolve, reject) => {
    if (window.heap && window.heap.loaded) {
      resolve();
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.heap && window.heap.loaded) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > 1000 * 10) {
        clearInterval(checkInterval);
        reject(new Error("Heap analytics failed to load within timeout"));
      }
    }, 50);
  });
}

export function createClientLogger<Schema extends EventsSchema = []>(
  context: LoggerContext,
): InnerLogger<Schema> {
  const isDev = isClientDevMode();
  if (isDev && !WRITE_IN_DEV) {
    // If we don't have a write key, we don't want to log anything
    // This is useful for dev so we don't log dev metrics
    //
    // We also don't allow logging on localhost unless WRITE_IN_DEV is set to true
    // WRITE_IN_DEV is only ever true if you're building from source with env vars set to true
    return noopLogger;
  }

  const projectId = fetchRemoteProjectId();

  const { id: anonId } = getOrCreateAnonId();

  const ready: Promise<boolean> = projectId.then(async (projectId) => {
    if (projectId == null) {
      return false;
    }

    try {
      await loadHeap(projectId);

      const transformerFn = (messages: unknown[]) => {
        console.log({ messages }); // TODO(jh): remove
        return messages.map((message: any) => {
          if (message.type !== "core_track" || message.info?.isAutotrack) {
            // Heap gets stuck if the transformer doesn't return the
            // message that it's expecting to get back, so you can't
            // just completely filter things out. We could potentially
            // just strip out certain fields here, but we can't drop events.
            return message;
          }
          return message;
        });
      };
      window.heap.addTransformerFn(
        "aaSdkHeapMetadataTransformer",
        transformerFn,
        "metadata",
      );
      window.heap.addTransformerFn(
        "aaSdkHeapGeneralTransformer",
        transformerFn,
        "general",
      );

      window.heap.identify(anonId);
      return true;
    } catch (error) {
      console.warn("Heap analytics failed to load:", error);
      return false;
    }
  });

  return {
    _internal: {
      ready,
      anonId,
    },
    trackEvent: async ({ name, data }) => {
      const properties = { ...data, ...context };

      if (isDev) {
        console.info(`[Metrics] ${name} ${JSON.stringify(properties)}`);
      }

      if (!(await ready)) {
        return noopLogger.trackEvent({
          name,
          // @ts-expect-error
          data,
        });
      }

      window.heap.track(name, properties);
    },
  };
}
