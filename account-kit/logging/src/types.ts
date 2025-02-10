export type EventsSchema = readonly {
  EventName: string;
  EventData?: Record<string, any>;
}[];

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type TrackEventParameters<Schema extends EventsSchema> = {
  [K in keyof Schema]: Prettify<
    { name: Schema[K]["EventName"] } & ([undefined] extends [
      Schema[K]["EventData"]
    ]
      ? { data?: undefined }
      : { data: Schema[K]["EventData"] })
  >;
}[number];

export interface EventLogger<Schema extends EventsSchema = []> {
  trackEvent(
    params: TrackEventParameters<[...Schema, PerformanceEvent]>
  ): Promise<void>;
  profiled<TArgs extends any[], TRet>(
    name: string,
    func: (...args: TArgs) => TRet
  ): (...args: TArgs) => TRet;
  _internal: {
    ready: Promise<unknown>;
    anonId: string;
  };
}

export type InnerLogger<Schema extends EventsSchema> = Omit<
  EventLogger<Schema>,
  "profiled"
>;

export type LoggerContext = {
  package: string;
  version: string;
  [key: string]: string;
};

export type PerformanceEvent = {
  EventName: "performance";
  EventData: {
    executionTimeMs: number;
    functionName: string;
  };
};
