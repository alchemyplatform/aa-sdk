package com.alchemy.aa.client.api;

import com.alchemy.aa.Stamper;
import lombok.Builder;

@Builder
public record StampedRequest(String body, Stamper.Stamp stamp, String url) {}
