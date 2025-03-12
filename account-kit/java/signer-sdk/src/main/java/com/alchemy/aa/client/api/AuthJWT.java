package com.alchemy.aa.client.api;

import java.util.Optional;
import lombok.Builder;

public class AuthJWT {

    @Builder
    public record AuthJWTRequest(String jwt, String authProviderName, String targetPublicKey) {
    }

    public record AuthJWTResponse(boolean isSignUp, String orgId, String credentialBundle, Optional<String> userId,
            Optional<String> address, Optional<String> solanaAddress) {
    }
}
