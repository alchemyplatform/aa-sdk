package com.alchemy.aa.client.api;

import java.util.Optional;
import lombok.Builder;

public class AuthJWT {

    @Builder
    public record Request(String jwt, String authProvider, String targetPublicKey) {
    }

    public record Response(boolean isSignUp, String orgId, String credentialBundle, Optional<String> userId,
            Optional<String> address, Optional<String> solanaAddress) {
    }
}
