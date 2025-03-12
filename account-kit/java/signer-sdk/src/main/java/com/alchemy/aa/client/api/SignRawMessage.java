package com.alchemy.aa.client.api;

import lombok.Builder;

public class SignRawMessage

{

    @Builder
    public record SignParamter(String encoding, String hashfunction, String payload, String signWith) {
    }

    @Builder
    public record SigningBody(String organizationId, String type, String timestampMs, SignParamter parameters) {
    }

    @Builder
    public record SignedResponse(String signature) {
    }
}
