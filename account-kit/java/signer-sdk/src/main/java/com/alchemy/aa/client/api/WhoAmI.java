package com.alchemy.aa.client.api;

/**
 * Types of Alchemy whoami api
 * https://docs.alchemy.com/reference/whoami
 */

public class WhoAmI {

  /**
   * WhoAmI request
   * @param organizationId org id
   */
  public record RawWhoAmIRequest(String organizationId) {}

  /**
   * Stamped WhoAmI request
   * @param stampedRequest stapmed whoami request
   */
  public record Request(StampedRequest stampedRequest) {}

  /**
   * Response type of whoami api
   * @param email The authenticated user's email address
   * @param userId A unique identifier for the authenticated user
   * @param orgId The organization ID associated with the authenticated user's account
   * @param address The Ethereum address of the user's signer. Essential for executing transactions and managing the wallet
   * @param solanaAddress The Solana address of the user's signer. Required for Solana transactions and wallet management
   */
  public record Response(
    String email,
    String userId,
    String orgId,
    String address,
    String solanaAddress
  ) {}
}
