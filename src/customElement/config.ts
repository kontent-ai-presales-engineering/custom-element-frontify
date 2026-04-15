export type Config = Readonly<{
  /**
   * Your Frontify domain, e.g. "mycompany.frontify.com".
   * Set this in the custom element configuration in Kontent.ai.
   */
  frontifyDomain: string;

  /**
   * OAuth 2.0 client ID registered in your Frontify developer portal.
   */
  clientId: string;

  /**
   * When true, users can select multiple assets in a single session.
   * Defaults to false.
   */
  multiSelect: boolean;
}>;

export const isConfig = (value: Readonly<Record<string, unknown>> | null): value is Config =>
  value !== null &&
  typeof value.frontifyDomain === 'string' &&
  value.frontifyDomain.length > 0 &&
  typeof value.clientId === 'string' &&
  value.clientId.length > 0;
