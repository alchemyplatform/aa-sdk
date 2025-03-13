package com.alchemy.aa.client.api;

import lombok.Builder;

/// https://docs.alchemy.com/reference/signmessage
public class SignRawMessage {

    @Builder
    public record SignParameters(String encoding, String hashFunction, String payload, String signWith) {
    }

    @Builder
    public record SigningBody(String organizationId, String type, String timestampMs, SignParameters parameters) {
    }

    public record SignRawMessageRequest(StampedRequest stampedRequest) {
    }

    @Builder
    public record SignedResponse(String signature) {
    }
}
