package com.alchemy.aa.client.api;

import lombok.Builder;

///

/**
 * Types of Alchemy signmessage api
 * https://docs.alchemy.com/reference/signmessage
 */
public class SignMessage {

  /**
   * Sign parameter
   * @param encoding payload encoding method
   * @param hashFunction signature hash function
   * @param payload payload to sign
   * @param signWith wallet address to sign payload
   */
  @Builder
  public record SignParameters(
    String encoding,
    String hashFunction,
    String payload,
    String signWith
  ) {}

  /**
   * Sign body
   * @param organizationId org id to identify the signer
   * @param type sign type. Always "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2"
   * @param timestampMs timestamp to sign
   * @param parameters sign parameter above
   */
  @Builder
  public record SignBody(
    String organizationId,
    String type,
    String timestampMs,
    SignParameters parameters
  ) {}

  /**
   * Request type of signmessage
   * @param stampedRequest stapmed signmessage request
   */
  @Builder
  public record Request(StampedRequest stampedRequest) {}

  /**
   * Response type of signmessage
   * @param signature signature
   */
  public record Response(String signature) {}
}
