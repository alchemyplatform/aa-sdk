package com.alchemy.aa.client.api;

import com.alchemy.aa.Stamper;
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
    public record SignedRequest(String body, Stamper.Stamp stamp, String url) {
    }

    @Builder
    public record SignedResponse(String signature) {
    }
}
