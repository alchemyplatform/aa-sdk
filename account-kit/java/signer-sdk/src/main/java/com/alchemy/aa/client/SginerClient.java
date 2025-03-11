package com.alchemy.aa.client;

import com.alchemy.aa.records.ProjectConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Optional;
import lombok.Builder;
import lombok.Getter;

public class SginerClient {


  public static String ALCHEMY_URL = "https://api.alchemy.com/v1/";

  @Getter
  public enum ServiceHandlerName {
    LOOKUP("lookup"),
    AUTH("auth"),
    AUTH_GET_MULTI_FACTOR("auth-get-multi-factor"),
    AUTH_LIST_MULTI_FACTORS("auth-list-multi-factors"),
    AUTH_DELETE_MULTI_FACTORS("auth-delete-multi-factors"),
    AUTH_REQUEST_MULTI_FACTOR("auth-request-multi-factor"),
    AUTH_VERIFY_MULTI_FACTOR("auth-verify-multi-factor"),
    SIGNUP("signup"),
    WHOAMI("whoami"),
    SIGN_PAYLOAD("sign-payload"),
    PREPARE_OAUTH("prepare-oauth"),
    OTP("otp");

    private final String name;

    ServiceHandlerName(String name) {
      this.name = name;
    }
  }


  private String apiKey;

  class AlchemyHttpClient{
    public AlchemyHttpClient(String apiKey, String url) {
      this.apiKey = apiKey;
      this.url = url;
    }

    public<Request, Response> Response execute(Request request, String verb, Class<Response> clazz) throws Exception{
      ObjectMapper mapper = new ObjectMapper();

      HttpRequest http_request = HttpRequest.newBuilder()
          .uri(URI.create(this.url))
          .header("accept", "application/json")
          .header("content-type", "application/json")
          .header("Authorization", "Bearer " + this.apiKey)
          .method(verb, HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(request))).build();
      JacksonBodyHandlers jsonBodyHandler = new JacksonBodyHandlers(mapper);

      HttpResponse<Response> response = HttpClient.newHttpClient().send(http_request,jsonBodyHandler.handlerFor( clazz));
      return response.body();
    }

    private String apiKey;
    private String url;

  }
}
