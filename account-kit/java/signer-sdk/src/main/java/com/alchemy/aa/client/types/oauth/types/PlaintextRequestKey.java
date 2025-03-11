package com.alchemy.aa.client.types.oauth.types;

import java.nio.charset.StandardCharsets;
import lombok.Builder;

@Builder
public record PlaintextRequestKey(
  long appId,
  long teamId,
  String codeVerifier,
  String nonce
) {
  public byte[] pack() {
    return String
      .format("%s:%s:%s:%s", appId, teamId, codeVerifier, nonce)
      .getBytes(StandardCharsets.UTF_8);
  }

  public static PlaintextRequestKey unpack(byte[] bytes) {
    String s = new String(bytes, StandardCharsets.UTF_8);
    String[] parts = s.split(":");
    return new PlaintextRequestKey(
      Long.parseLong(parts[0]),
      Long.parseLong(parts[1]),
      parts[2],
      parts[3]
    );
  }
}
