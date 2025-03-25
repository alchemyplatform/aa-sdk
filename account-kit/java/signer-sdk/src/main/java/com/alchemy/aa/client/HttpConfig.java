package com.alchemy.aa.client;

/**
 * Http configuration for signer client
 *
 * @param apiKey apiKey to call alchemy api
 * @param url    alchemy api url
 */
public record HttpConfig(String apiKey, String url) {
  /**
   * default HttpConfig with only alchemy url
   * @param apiKey apiKey to call alchemy api
   */
  public HttpConfig(String apiKey) {
    this(apiKey, "https://api.g.alchemy.com/signer/v1/");
  }


}
