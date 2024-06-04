export interface ArcanaAuthAuthenticationParams {
  init: () => Promise<void>;
  connect: () => Promise<void>;
}
