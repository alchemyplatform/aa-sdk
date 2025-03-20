package com.alchemy.aa.client.api;

///  https://docs.alchemy.com/reference/authuser
public class AuthUser {

  public record WhoAmIRequest(String organizationId) {}

  public record TurnKeyWhoAmIRequest(StampedRequest stampedRequest) {}

  public record Response(
    String email,
    String userId,
    String orgId,
    String address,
    String solanaAddress
  ) {}
}
