package com.alchemy.aa.client.api;

import java.util.Optional;
import lombok.Builder;

/**
 * Types of Alchemy auth-jwt api
 */
public class AuthJWT {

  /**
   * Request type of auth-jwt
   * @param jwt jwt token
   * @param authProvider auth provider name
   * @param targetPublicKey Turnkey public key for which cred bundle is issued.
   */
  @Builder
  public record Request(
    String jwt,
    String authProvider,
    String targetPublicKey
  ) {}

  /**
   * Response type of auth-jwt
   * @param isSignUp indicating whether it was a sign-up/pre-generated
   * @param orgId org id for user
   * @param credentialBundle a credential bundle returned by KMS, used by the client to sign messages after
   * @param userId userId of the user
   * @param address evm wallet address
   * @param solanaAddress solana wallet address
   */
  public record Response(
    boolean isSignUp,
    String orgId,
    String credentialBundle,
    Optional<String> userId,
    Optional<String> address,
    Optional<String> solanaAddress
  ) {}
}
