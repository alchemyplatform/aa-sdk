// window-polyfill.ts

type EventCallback = (event?: any) => void;

const eventListeners: Record<string, EventCallback[]> = {};

const windowPolyfill: Partial<Window> = {
  document: {
    createElement: () => ({ style: {} }),
  } as unknown as Document,

  location: {
    href: "",
  } as Location,

  requestAnimationFrame: (callback: FrameRequestCallback) =>
    setTimeout(callback, 16),
  cancelAnimationFrame: (id: number) => clearTimeout(id),

  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
  setInterval: global.setInterval,
  clearInterval: global.clearInterval,

  localStorage: {
    getItem: async (_: string) => null,
    setItem: async (_: string, __: string) => {},
    removeItem: async (_: string) => {},
    clear: async () => {},
  } as unknown as Storage,

  addEventListener: (type: string, callback: EventCallback) => {
    if (!eventListeners[type]) {
      eventListeners[type] = [];
    }
    eventListeners[type].push(callback);
  },

  removeEventListener: (type: string, callback: EventCallback) => {
    if (eventListeners[type]) {
      eventListeners[type] = eventListeners[type].filter(
        (cb) => cb !== callback
      );
    }
  },

  dispatchEvent: (event: { type: string; [key: string]: any }) => {
    if (eventListeners[event.type]) {
      eventListeners[event.type]?.forEach((callback) => callback(event));
    }

    return true;
  },
};

// Merge the polyfill into the global object
global.window = windowPolyfill as unknown as Window & typeof globalThis;
