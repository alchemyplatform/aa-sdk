package com.alchemy.aa.client.types.oauth.types;

import com.alchemy.aa.client.types.oauth.AppleOauthHelper;
import io.micronaut.context.annotation.Property;
import jakarta.inject.Singleton;
import java.util.Map;
import java.util.Optional;

@Singleton
public class KnownAuthProviders {

  @Property(name = "known-oauth-providers.apple.client-id")
  String appleClientId;

  @Property(name = "known-oauth-providers.apple.team-id")
  String appleTeamId;

  @Property(name = "known-oauth-providers.apple.oauth-key-id")
  String appleOauthKeyId;

  @Property(name = "known-oauth-providers.apple.oauth-private-key")
  String appleOauthPrivateKey;

  private final Map<String, AuthProviderConfig> knownAuthProvidersById;

  public KnownAuthProviders(
    @Property(
      name = "known-oauth-providers.google.client-id"
    ) String googleClientId,
    @Property(
      name = "known-oauth-providers.google.client-secret"
    ) String googleClientSecret,
    @Property(
      name = "known-oauth-providers.facebook.client-id"
    ) String facebookClientId,
    @Property(
      name = "known-oauth-providers.facebook.client-secret"
    ) String facebookClientSecret,
    @Property(
      name = "known-oauth-providers.twitch.client-id"
    ) String twitchClientId,
    @Property(
      name = "known-oauth-providers.twitch.client-secret"
    ) String twitchClientSecret
  ) {
    knownAuthProvidersById =
      Map.of(
        "google",
        AuthProviderConfig
          .builder()
          .id("google")
          .issuer("https://accounts.google.com")
          .authEndpoint("https://accounts.google.com/o/oauth2/v2/auth")
          .tokenEndpoint("https://oauth2.googleapis.com/token")
          .jwksUri("https://www.googleapis.com/oauth2/v3/certs")
          .clientId(googleClientId)
          .clientSecret(googleClientSecret)
          .build(),
        "facebook",
        AuthProviderConfig
          .builder()
          .id("facebook")
          .issuer("https://www.facebook.com")
          .authEndpoint("https://facebook.com/dialog/oauth/")
          .tokenEndpoint("https://graph.facebook.com/v11.0/oauth/access_token")
          .jwksUri("https://www.facebook.com/.well-known/oauth/openid/jwks/")
          .clientId(facebookClientId)
          .clientSecret(facebookClientSecret)
          .build(),
        "twitch",
        AuthProviderConfig
          .builder()
          .id("twitch")
          .issuer("https://id.twitch.tv/oauth2")
          .authEndpoint("https://id.twitch.tv/oauth2/authorize")
          .tokenEndpoint("https://id.twitch.tv/oauth2/token")
          .jwksUri("https://id.twitch.tv/oauth2/keys")
          .clientId(twitchClientId)
          .clientSecret(twitchClientSecret)
          .build()
      );
  }

  public Optional<AuthProviderConfig> getKnownAuthProvider(String id) {
    if (id.equals("apple")) {
      return Optional.of(
        AppleOauthHelper.getAuthProviderConfig(
          new AppleConfig(
            appleClientId,
            appleTeamId,
            appleOauthKeyId,
            appleOauthPrivateKey
          )
        )
      );
    }
    return Optional.of(knownAuthProvidersById.get(id));
  }

  public boolean isKnownId(String id) {
    // Auth0 is a special case: it's a known auth provider, but has a different
    // domain for each configuration and so does not appear in the map of known
    // auth providers above.
    return id.equals("auth0") || knownAuthProvidersById.containsKey(id);
  }
}
