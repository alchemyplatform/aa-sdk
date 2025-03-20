package com.alchemy.aa.client;

public record HttpConfig(String apiKey, String url) {
  public HttpConfig(String apiKey) {
    this(apiKey, "https://api.g.alchemy.com/signer/v1/");
  }
}
