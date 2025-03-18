package com.alchemy.aa.client.api;

// https://docs.alchemy.com/reference/getuser
public class GetUser {

  public record Request(String email) {}

  public record Response(String orgId) {}
}
