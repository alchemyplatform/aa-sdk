export type EventsSchema = readonly {
  EventName: string;
  EventData?: Record<string, any>;
}[];

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type TrackEventParameters<Schema extends EventsSchema> = {
  [K in keyof Schema]: Prettify<
    { name: Schema[K]["EventName"] } & (Schema[K]["EventData"] extends undefined
      ? { data?: undefined }
      : { data: Schema[K]["EventData"] })
  >;
}[number];

export interface EventLogger<Schema extends EventsSchema> {
  trackEvent(params: TrackEventParameters<Schema>): void;
}
