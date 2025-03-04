// Define EventInit type if not available
interface EventInit {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

interface CustomEventInit<T = any> extends EventInit {
  detail?: T;
}

class Event {
  type: string;
  bubbles: boolean;
  cancelable: boolean;

  constructor(type: string, eventInitDict?: EventInit) {
    this.type = type;
    this.bubbles = eventInitDict?.bubbles ?? false;
    this.cancelable = eventInitDict?.cancelable ?? false;
  }
}

export class CustomEvent<T> extends Event {
  detail: T;
  constructor(type: string, eventInitDict?: CustomEventInit<T>) {
    super(type, eventInitDict);
    this.detail = eventInitDict?.detail as T;
  }

  initCustomEvent(_: string, __?: boolean, ___?: boolean, detail?: T): void {
    this.detail = detail as T;
  }
}

global.Event = Event as any;
global.CustomEvent = CustomEvent as any;
