export interface Plugin<D> {
  meta: { name: string; version: string };
  decorators: D;
}
