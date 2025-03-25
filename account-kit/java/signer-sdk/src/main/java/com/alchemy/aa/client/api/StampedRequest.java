package com.alchemy.aa.client.api;

import com.alchemy.aa.core.Stamper;
import lombok.Builder;

/**
 * A stamped request
 * @param body raw request body
 * @param stamp stamped body
 * @param url stamper's url
 */
@Builder
public record StampedRequest(String body, Stamper.Stamp stamp, String url) {}
