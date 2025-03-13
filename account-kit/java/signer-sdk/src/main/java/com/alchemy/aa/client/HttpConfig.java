package com.alchemy.aa.client;

import lombok.Getter;
import lombok.Setter;

public class HttpConfig {

    public HttpConfig(String apiKey) {
        this.apiKey = apiKey;
    };

    @Getter
    private String apiKey;

    @Getter
    @Setter
    private String url = "https://api.g.alchemy.com/signer/v1/";
}
